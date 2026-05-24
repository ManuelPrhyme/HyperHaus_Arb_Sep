import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const RESOLUTIONS = [
  { label: "1m",  value: "1"   },
  { label: "5m",  value: "5"   },
  { label: "15m", value: "15"  },
  { label: "1h",  value: "60"  },
  { label: "4h",  value: "240" },
  { label: "1D",  value: "1D"  },
];

const RES_MS = {
  "1":   60_000,   "5":   300_000,  "15":  900_000,
  "60":  3_600_000, "240": 14_400_000, "1D": 86_400_000,
};

const f = (n, dp = 2) =>
  n != null
    ? parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : "—";

const Chart = ({ pairId = "0", pairFrom = "BTC", askPx, bidPx, onBuy, onSell }) => {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const candleRef    = useRef(null);
  const sseRef       = useRef(null);
  const barMsRef     = useRef(RES_MS["15"]);

  const [resolution, setResolution] = useState("15");
  const [lastCandle, setLastCandle] = useState(null);
  const [liveTick,   setLiveTick]   = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("Initialising…");

  // ── Init chart once ────────────────────────────────────────────────────────
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

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#4ade80", downColor: "#f87171",
      wickUpColor: "#4ade80", wickDownColor: "#f87171",
      borderVisible: false,
    });

    chartRef.current  = chart;
    candleRef.current = series;

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

  // ── Load candles + open SSE stream on pairId / resolution change ───────────
  useEffect(() => {
    let cancelled = false;
    const barMs = RES_MS[resolution] || RES_MS["15"];
    barMsRef.current = barMs;

    // Close previous SSE stream
    sseRef.current?.close();
    sseRef.current = null;

    setLoadingMsg("Loading chart…");
    setLastCandle(null);
    setLiveTick(null);

    (async () => {
      // Wait for chart series to be ready
      let attempts = 0;
      while (!candleRef.current && attempts < 20) {
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
      if (cancelled || !candleRef.current) return;

      try {
        // Fetch candles from server
        const from = Date.now() - barMs * 500;
        const res  = await fetch(
          `${API}/api/ostium/candles?pairId=${pairId}&resolution=${resolution}&from=${from}`
        );
        const json = await res.json();
        if (cancelled) return;

        if (!json.success || !json.candles?.length) {
          setLoadingMsg("No candle data for this pair.");
          return;
        }

        const data = json.candles.map((c) => ({
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

        // ── SSE price stream from server ───────────────────────────────────
        const es = new EventSource(`${API}/api/ostium/stream?pairIds=${pairId}`);
        sseRef.current = es;

        const handleTick = (e) => {
          if (cancelled) return;
          const tick = JSON.parse(e.data);
          if (String(tick.pairId) !== String(pairId)) return;

          setLiveTick(tick);

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
        };

        es.addEventListener("tick",     handleTick);
        es.addEventListener("snapshot", (e) => {
          const ticks = JSON.parse(e.data);
          const mine  = ticks.find((t) => String(t.pairId) === String(pairId));
          if (mine) handleTick({ data: JSON.stringify(mine) });
        });

        es.onerror = () => es.close();
      } catch (e) {
        if (!cancelled) setLoadingMsg(`Error: ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
      sseRef.current?.close();
      sseRef.current = null;
    };
  }, [pairId, resolution]);

  const execAsk = liveTick?.ask  ?? (askPx ? parseFloat(askPx) : null);
  const execBid = liveTick?.bid  ?? (bidPx ? parseFloat(bidPx) : null);
  const execMid = liveTick?.mid  ?? (execAsk && execBid ? (execAsk + execBid) / 2 : null);

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: "#080d1a" }}>

      {/* Left toolbar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 flex-wrap">
        <div className="flex rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {RESOLUTIONS.map((r) => (
            <button key={r.value} onClick={() => setResolution(r.value)}
              className="px-2 py-1 text-xs cursor-pointer transition-colors"
              style={{
                backgroundColor: resolution === r.value ? "var(--accent)" : "var(--bg-card)",
                color:           resolution === r.value ? "#fff" : "var(--muted)",
              }}>
              {r.label}
            </button>
          ))}
        </div>

        {execMid && (
          <div className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "#4ade80" }}>
            {pairFrom}/USD ${f(execMid, 2)}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        )}

        {lastCandle && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded text-xs"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--muted)" }}>O <span style={{ color: "var(--text)" }}>{f(lastCandle.open, 2)}</span></span>
            <span style={{ color: "#4ade80" }}>H {f(lastCandle.high, 2)}</span>
            <span style={{ color: "#f87171" }}>L {f(lastCandle.low, 2)}</span>
            <span style={{ color: lastCandle.close >= lastCandle.open ? "#4ade80" : "#f87171" }}>
              C {f(lastCandle.close, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Right toolbar: Buy / Sell */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={() => onBuy?.({ price: execAsk ?? execMid, ask: execAsk, bid: execBid, mid: execMid })}
          disabled={!onBuy || !execAsk}
          className="flex flex-col items-center px-4 py-1 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#16a34a", color: "#fff" }}>
          <span>Long / Buy</span>
          {execAsk && <span className="font-normal opacity-80">${f(execAsk, 2)}</span>}
        </button>
        <button
          onClick={() => onSell?.({ price: execBid ?? execMid, ask: execAsk, bid: execBid, mid: execMid })}
          disabled={!onSell || !execBid}
          className="flex flex-col items-center px-4 py-1 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#dc2626", color: "#fff" }}>
          <span>Short / Sell</span>
          {execBid && <span className="font-normal opacity-80">${f(execBid, 2)}</span>}
        </button>
      </div>

      {loadingMsg && (
        <div className="absolute inset-0 flex items-center justify-center z-20"
          style={{ backgroundColor: "rgba(8,13,26,0.85)" }}>
          <span className="text-sm" style={{ color: "var(--muted)" }}>{loadingMsg}</span>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default Chart;
