import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { OstiumSubgraphClient } from "@ostium/builder-sdk";

const RESOLUTIONS = [
  { label: "1m",  value: "1"   },
  { label: "5m",  value: "5"   },
  { label: "15m", value: "15"  },
  { label: "1h",  value: "60"  },
  { label: "4h",  value: "240" },
  { label: "1D",  value: "1D"  },
];

const RES_MS = {
  "1":   60_000,
  "5":   300_000,
  "15":  900_000,
  "60":  3_600_000,
  "240": 14_400_000,
  "1D":  86_400_000,
};

const bgCard  = "var(--bg-card)";
const border  = "var(--border)";
const accent  = "var(--accent)";
const muted   = "var(--muted)";
const textCol = "var(--text)";

const f = (n, dp = 2) =>
  n != null ? parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }) : "—";

// Chart receives live ask/bid from Trade via props so buttons use correct SDK prices
const Chart = ({ pairId = "0", pairFrom = "BTC", askPx, bidPx, onBuy, onSell }) => {
  const containerRef = useRef();
  const chartRef     = useRef();
  const candleRef    = useRef();
  const streamRef    = useRef();
  const clientRef    = useRef();
  const barMsRef     = useRef(RES_MS["15"]);

  const [resolution,  setResolution]  = useState("15");
  const [lastCandle,  setLastCandle]  = useState(null);
  const [livePrice,   setLivePrice]   = useState(null);
  const [liveTick,    setLiveTick]    = useState(null); // full tick with ask/bid/mid
  const [loadingMsg,  setLoadingMsg]  = useState("Loading chart…");

  // ── Init lightweight-charts once ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width:  el.clientWidth,
      height: el.clientHeight,
      layout: { background: { color: "#080d1a" }, textColor: "#6b7fa3" },
      grid:   { vertLines: { color: "#0d1526" }, horzLines: { color: "#0d1526" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#1a2a4a" },
      timeScale: { borderColor: "#1a2a4a", timeVisible: true, secondsVisible: false },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor:       "#4ade80",
      downColor:     "#f87171",
      wickUpColor:   "#4ade80",
      wickDownColor: "#f87171",
      borderVisible: false,
    });

    chartRef.current  = chart;
    candleRef.current = candles;

    const onResize = () =>
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
    };
  }, []);

  // ── Load candles + open price stream on pairId / resolution change ─────────
  useEffect(() => {
    if (!candleRef.current) return;

    streamRef.current?.close();
    setLoadingMsg("Loading chart…");
    setLastCandle(null);
    setLivePrice(null);
    setLiveTick(null);

    const barMs = RES_MS[resolution] || RES_MS["15"];
    barMsRef.current = barMs;
    let cancelled = false;

    (async () => {
      try {
        if (!clientRef.current) {
          clientRef.current = await OstiumSubgraphClient.create();
        }
        const client = clientRef.current;

        // Fetch last 500 bars
        const candles = await client.getCandles({
          pairId,
          from: Date.now() - barMs * 500,
          resolution,
        });
        if (cancelled) return;

        if (!candles.length) {
          setLoadingMsg("No candle data for this pair.");
          return;
        }

        const data = candles.map((c) => ({
          time:  Math.floor(c.time / 1000),
          open:  c.open,
          high:  c.high,
          low:   c.low,
          close: c.close,
        }));

        candleRef.current.setData(data);
        chartRef.current.timeScale().fitContent();
        setLastCandle(data[data.length - 1]);
        setLoadingMsg(null);

        // ── Live price stream ────────────────────────────────────────────
        const stream = client.streamPrices([pairId]);
        streamRef.current = stream;

        stream.onTick((tick) => {
          if (cancelled || String(tick.pairId) !== String(pairId)) return;

          setLivePrice(tick.mid);
          setLiveTick(tick); // expose ask/bid/mid for buttons

          setLastCandle((prev) => {
            if (!prev) return prev;
            const nowSec = Math.floor(Date.now() / 1000);
            const barSec = Math.floor(nowSec / (barMsRef.current / 1000)) * (barMsRef.current / 1000);

            const updated = barSec === prev.time
              ? { ...prev, high: Math.max(prev.high, tick.mid), low: Math.min(prev.low, tick.mid), close: tick.mid }
              : { time: barSec, open: tick.mid, high: tick.mid, low: tick.mid, close: tick.mid };

            try { candleRef.current?.update(updated); } catch (_) {}
            return updated;
          });
        });
      } catch (e) {
        if (!cancelled) setLoadingMsg(`Error: ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.close();
    };
  }, [pairId, resolution]);

  // Use live tick ask/bid if available, fall back to props from Trade
  const execAsk = liveTick?.ask ?? (askPx ? parseFloat(askPx) : null);
  const execBid = liveTick?.bid ?? (bidPx ? parseFloat(bidPx) : null);
  const execMid = livePrice ?? (askPx && bidPx ? (parseFloat(askPx) + parseFloat(bidPx)) / 2 : null);

  const handleBuy = () => {
    if (!onBuy) return;
    // Long executes at ask price
    onBuy({ price: execAsk ?? execMid, ask: execAsk, bid: execBid, mid: execMid });
  };

  const handleSell = () => {
    if (!onSell) return;
    // Short executes at bid price
    onSell({ price: execBid ?? execMid, ask: execAsk, bid: execBid, mid: execMid });
  };

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: "#080d1a" }}>

      {/* Left toolbar: resolution + OHLC */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 flex-wrap">
        <div className="flex rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setResolution(r.value)}
              className="px-2 py-1 text-xs cursor-pointer transition-colors"
              style={{
                backgroundColor: resolution === r.value ? accent : bgCard,
                color:           resolution === r.value ? "#fff" : muted,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Live price badge */}
        {execMid && (
          <div className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: bgCard, border: `1px solid ${border}`, color: "#4ade80" }}>
            {pairFrom}/USD ${f(execMid, 2)}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        )}

        {/* OHLC readout */}
        {lastCandle && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded text-xs"
            style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
            <span style={{ color: muted }}>O <span style={{ color: textCol }}>{f(lastCandle.open, 2)}</span></span>
            <span style={{ color: "#4ade80" }}>H {f(lastCandle.high, 2)}</span>
            <span style={{ color: "#f87171" }}>L {f(lastCandle.low, 2)}</span>
            <span style={{ color: lastCandle.close >= lastCandle.open ? "#4ade80" : "#f87171" }}>
              C {f(lastCandle.close, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Right toolbar: Buy / Sell with execution prices */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={handleBuy}
          disabled={!onBuy || !execAsk}
          className="flex flex-col items-center px-4 py-1 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#16a34a", color: "#fff" }}
        >
          <span>Long / Buy</span>
          {execAsk && (
            <span className="text-xs font-normal opacity-80">${f(execAsk, 2)}</span>
          )}
        </button>
        <button
          onClick={handleSell}
          disabled={!onSell || !execBid}
          className="flex flex-col items-center px-4 py-1 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#dc2626", color: "#fff" }}
        >
          <span>Short / Sell</span>
          {execBid && (
            <span className="text-xs font-normal opacity-80">${f(execBid, 2)}</span>
          )}
        </button>
      </div>

      {/* Loading overlay */}
      {loadingMsg && (
        <div className="absolute inset-0 flex items-center justify-center z-20"
          style={{ backgroundColor: "rgba(8,13,26,0.85)" }}>
          <span className="text-sm" style={{ color: muted }}>{loadingMsg}</span>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default Chart;
