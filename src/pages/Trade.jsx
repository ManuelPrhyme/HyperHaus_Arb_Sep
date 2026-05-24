import { useState, useEffect } from "react";
import { Chart, Topbar } from "../components";
import { useOstium } from "../utils/useOstium";
const OrderType = { Market: "market", Limit: "limit" };
import { usePrivy } from "@privy-io/react-auth";

const bg = "var(--bg)";
const bgCard = "var(--bg-card)";
const bgElevated = "var(--bg-elevated)";
const border = "var(--border)";
const accent = "var(--accent)";
const muted = "var(--muted)";
const text = "var(--text)";

const fmt = (n, dp = 2) => n ? parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }) : "—";
const fmtPnl = (n) => { const v = parseFloat(n); return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`; };

const Trade = () => {
  const { authenticated, login } = usePrivy();
  const {
    pairs, prices, positions, openOrders, fills,
    orderbook, loading, error,
    fetchOrderbook, submitTrade, closeTrade,
  } = useOstium();

  const [selectedPair, setSelectedPair] = useState(null);
  const [orderType, setOrderType] = useState(OrderType.Market);
  const [side, setSide] = useState("buy");
  const [collateral, setCollateral] = useState("");
  const [leverage, setLeverage] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [bottomTab, setBottomTab] = useState("positions");
  const [submitting, setSubmitting] = useState(false);
  const [txMsg, setTxMsg] = useState("");
  const [search, setSearch] = useState("");

  // Set default pair once pairs load
  useEffect(() => {
    if (pairs.length > 0 && !selectedPair) {
      const btc = pairs.find((p) => p.pairFrom === "BTC") || pairs[0];
      setSelectedPair(btc);
    }
  }, [pairs]);

  // Fetch orderbook when pair changes — clear immediately to avoid stale display
  useEffect(() => {
    if (selectedPair) {
      fetchOrderbook(selectedPair.pairId);
    }
  }, [selectedPair?.pairId, fetchOrderbook]);

  const livePrice = selectedPair ? prices[selectedPair.pairId] : null;
  const midPx = livePrice?.mid ? parseFloat(livePrice.mid) : null;
  const askPx = livePrice?.ask ? parseFloat(livePrice.ask) : null;
  const bidPx = livePrice?.bid ? parseFloat(livePrice.bid) : null;

  // Auto-fill limit price when switching to Limit order type
  const handleOrderTypeChange = (t) => {
    setOrderType(t);
    if (t === OrderType.Limit && midPx && !limitPrice) {
      setLimitPrice(midPx.toFixed(2));
    }
  };

  // Long/Short toggle — also auto-fill limit price with ask/bid
  const handleSideChange = (s) => {
    setSide(s);
    if (orderType === OrderType.Limit && !limitPrice) {
      const px = s === "buy" ? askPx : bidPx;
      if (px) setLimitPrice(px.toFixed(2));
    }
  };

  const canSubmit = authenticated && selectedPair && collateral &&
    parseFloat(collateral) >= 5 &&
    (orderType === OrderType.Market || limitPrice) &&
    !submitting;

  const filteredPairs = pairs.filter((p) =>
    `${p.pairFrom}${p.pairTo}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!authenticated) { login(); return; }
    if (!selectedPair || !collateral) return;
    setSubmitting(true);
    setTxMsg("");
    try {
      const price = orderType === OrderType.Market
        ? (side === "buy" ? livePrice?.ask : livePrice?.bid) || String(midPx)
        : limitPrice;

      const hash = await submitTrade({
        pairId: selectedPair.pairId,
        buy: side === "buy",
        price,
        collateral,
        leverage,
        type: orderType,
        takeProfit: takeProfit || undefined,
        stopLoss: stopLoss || undefined,
      });
      setTxMsg(`✓ Submitted: ${hash.slice(0, 10)}...`);
      setCollateral("");
    } catch (e) {
      setTxMsg(`✗ ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (pos) => {
    setSubmitting(true);
    try {
      await closeTrade({ pairId: pos.pairId, idx: pos.idx, closePercent: 100 });
      setTxMsg("✓ Position closed");
    } catch (e) {
      setTxMsg(`✗ ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="trade-fullscreen flex flex-col h-screen w-screen text-xs overflow-hidden" style={{ backgroundColor: bg, color: text }}>

      {/* Topbar */}
      <div className="shrink-0"><Topbar /></div>

      {/* Asset ticker bar */}
      <div className="flex items-center gap-5 px-4 py-2 shrink-0 overflow-x-auto" style={{ backgroundColor: bgCard, borderBottom: `1px solid ${border}` }}>
        {selectedPair ? (
          <>
            <span className="font-bold text-sm whitespace-nowrap" style={{ color: text }}>{selectedPair.pairFrom}/{selectedPair.pairTo}</span>
            <span className="text-base font-semibold whitespace-nowrap" style={{ color: text }}>${midPx ? fmt(midPx, 2) : "—"}</span>
            <span className="whitespace-nowrap" style={{ color: muted }}>Ask: <span style={{ color: "#f87171" }}>${livePrice?.ask ? fmt(livePrice.ask, 2) : "—"}</span></span>
            <span className="whitespace-nowrap" style={{ color: muted }}>Bid: <span style={{ color: "#4ade80" }}>${livePrice?.bid ? fmt(livePrice.bid, 2) : "—"}</span></span>
            <span className="whitespace-nowrap" style={{ color: muted }}>Max Lev: <span style={{ color: text }}>{selectedPair.maxLeverage}×</span></span>
            <span className="whitespace-nowrap" style={{ color: muted }}>OI: <span style={{ color: text }}>${fmt(selectedPair.openInterest, 0)}</span></span>
            <span className="whitespace-nowrap" style={{ color: muted }}>Rollover L: <span style={{ color: "#f87171" }}>{selectedPair.rolloverRate?.long}%</span></span>
            <span className="whitespace-nowrap" style={{ color: muted }}>Rollover S: <span style={{ color: "#4ade80" }}>{selectedPair.rolloverRate?.short}%</span></span>
            <span className="ml-auto whitespace-nowrap px-2 py-0.5 rounded text-xs font-semibold"
              style={{ backgroundColor: selectedPair.isMarketOpen ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: selectedPair.isMarketOpen ? "#4ade80" : "#f87171" }}>
              {selectedPair.isMarketOpen ? "Market Open" : "Market Closed"}
            </span>
          </>
        ) : (
          <span style={{ color: muted }}>{loading ? "Loading pairs..." : error || "Select a pair"}</span>
        )}
      </div>

      {/* Main 3-column */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: pair list */}
        <div className="w-[170px] shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: bgCard, borderRight: `1px solid ${border}` }}>
          <div className="px-2 py-2" style={{ borderBottom: `1px solid ${border}` }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded px-2 py-1 text-xs outline-none"
              style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: text }}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredPairs.map((p) => {
              const px = prices[p.pairId];
              const isSelected = selectedPair?.pairId === p.pairId;
              return (
                <div
                  key={p.pairId}
                  onClick={() => setSelectedPair(p)}
                  className="px-3 py-2 cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? bgElevated : "transparent",
                    borderLeft: isSelected ? `2px solid ${accent}` : "2px solid transparent",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: text }}>{p.pairFrom}</span>
                    <span className="text-xs px-1 rounded" style={{ backgroundColor: "rgba(26,107,255,0.1)", color: accent }}>{p.category}</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span style={{ color: muted }}>${px?.mid ? fmt(px.mid, 2) : "—"}</span>
                    <span style={{ color: p.isMarketOpen ? "#4ade80" : "#f87171" }}>{p.isMarketOpen ? "●" : "○"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: chart + bottom panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Chart
              pairId={selectedPair?.pairId || "0"}
              pairFrom={selectedPair?.pairFrom || "BTC"}
              askPx={livePrice?.ask}
              bidPx={livePrice?.bid}
              onBuy={({ price, ask }) => {
                setSide("buy");
                setOrderType(OrderType.Limit);
                setLimitPrice(String((ask ?? price).toFixed(2)));
              }}
              onSell={({ price, bid }) => {
                setSide("sell");
                setOrderType(OrderType.Limit);
                setLimitPrice(String((bid ?? price).toFixed(2)));
              }}
            />
          </div>

          {/* Bottom panel */}
          <div className="h-[200px] shrink-0 overflow-y-auto" style={{ backgroundColor: bgCard, borderTop: `1px solid ${border}` }}>
            <div className="flex sticky top-0" style={{ backgroundColor: bgCard, borderBottom: `1px solid ${border}` }}>
              {["positions", "orders", "history"].map((t) => (
                <button key={t} onClick={() => setBottomTab(t)} className="px-4 py-2 capitalize cursor-pointer"
                  style={{ color: bottomTab === t ? text : muted, borderBottom: bottomTab === t ? `2px solid ${accent}` : "2px solid transparent" }}>
                  {t} {t === "positions" && positions.length > 0 && `(${positions.length})`}
                  {t === "orders" && openOrders.length > 0 && `(${openOrders.length})`}
                </button>
              ))}
            </div>

            {bottomTab === "positions" && (
              positions.length === 0
                ? <div className="flex items-center justify-center h-[140px]" style={{ color: muted }}>No open positions</div>
                : <table className="w-full">
                  <thead><tr style={{ borderBottom: `1px solid ${border}` }}>
                    {["Pair", "Side", "Size", "Entry", "Mid", "PnL", "Liq Px", "Collateral", ""].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-normal" style={{ color: muted }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {positions.map((p, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                        <td className="px-3 py-2 font-semibold" style={{ color: text }}>{p.pairFrom}/{p.pairTo}</td>
                        <td className="px-3 py-2" style={{ color: p.side === "B" ? "#4ade80" : "#f87171" }}>{p.side === "B" ? "Long" : "Short"}</td>
                        <td className="px-3 py-2" style={{ color: text }}>{fmt(p.szi, 4)}</td>
                        <td className="px-3 py-2" style={{ color: text }}>${fmt(p.entryPx, 2)}</td>
                        <td className="px-3 py-2" style={{ color: text }}>${fmt(prices[p.pairId]?.mid, 2)}</td>
                        <td className="px-3 py-2 font-semibold" style={{ color: parseFloat(p.unrealizedPnl) >= 0 ? "#4ade80" : "#f87171" }}>${fmtPnl(p.unrealizedPnl)}</td>
                        <td className="px-3 py-2" style={{ color: "#f87171" }}>${fmt(p.liquidationPx, 2)}</td>
                        <td className="px-3 py-2" style={{ color: text }}>${fmt(p.collateralUsed, 2)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleClose(p)} className="px-2 py-0.5 rounded cursor-pointer text-xs"
                            style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171", border: `1px solid rgba(220,38,38,0.3)` }}>
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}

            {bottomTab === "orders" && (
              openOrders.length === 0
                ? <div className="flex items-center justify-center h-[140px]" style={{ color: muted }}>No open orders</div>
                : <table className="w-full">
                  <thead><tr style={{ borderBottom: `1px solid ${border}` }}>
                    {["Pair", "Side", "Type", "Trigger Px", "Size", "TP", "SL"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-normal" style={{ color: muted }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {openOrders.map((o, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                        <td className="px-3 py-2 font-semibold" style={{ color: text }}>{o.pairFrom}/{o.pairTo}</td>
                        <td className="px-3 py-2" style={{ color: o.side === "B" ? "#4ade80" : "#f87171" }}>{o.side === "B" ? "Long" : "Short"}</td>
                        <td className="px-3 py-2" style={{ color: muted }}>{o.orderType}</td>
                        <td className="px-3 py-2" style={{ color: text }}>${fmt(o.limitPx, 2)}</td>
                        <td className="px-3 py-2" style={{ color: text }}>{fmt(o.szi, 4)}</td>
                        <td className="px-3 py-2" style={{ color: "#4ade80" }}>{o.tpPx ? `$${fmt(o.tpPx, 2)}` : "—"}</td>
                        <td className="px-3 py-2" style={{ color: "#f87171" }}>{o.slPx ? `$${fmt(o.slPx, 2)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}

            {bottomTab === "history" && (
              fills.length === 0
                ? <div className="flex items-center justify-center h-[140px]" style={{ color: muted }}>No trade history</div>
                : <table className="w-full">
                  <thead><tr style={{ borderBottom: `1px solid ${border}` }}>
                    {["Pair", "Action", "Side", "Price", "Size", "PnL", "Time"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-normal" style={{ color: muted }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {fills.map((f, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                        <td className="px-3 py-2 font-semibold" style={{ color: text }}>{f.pairFrom}/{f.pairTo}</td>
                        <td className="px-3 py-2" style={{ color: muted }}>{f.action}</td>
                        <td className="px-3 py-2" style={{ color: f.side === "B" ? "#4ade80" : "#f87171" }}>{f.side === "B" ? "Long" : "Short"}</td>
                        <td className="px-3 py-2" style={{ color: text }}>${fmt(f.px, 2)}</td>
                        <td className="px-3 py-2" style={{ color: text }}>{fmt(f.szi, 4)}</td>
                        <td className="px-3 py-2" style={{ color: parseFloat(f.closedPnl) >= 0 ? "#4ade80" : "#f87171" }}>{f.closedPnl !== "0" ? `$${fmtPnl(f.closedPnl)}` : "—"}</td>
                        <td className="px-3 py-2" style={{ color: muted }}>{new Date(f.time).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Right: orderbook + order form */}
        <div className="w-[230px] shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: bgCard, borderLeft: `1px solid ${border}` }}>

          {/* Orderbook */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 font-medium" style={{ color: muted, borderBottom: `1px solid ${border}` }}>Order Book</div>
            <div className="px-3 py-1 grid grid-cols-3 text-xs" style={{ color: muted, borderBottom: `1px solid ${border}` }}>
              <span>Price</span><span className="text-center">Size</span><span className="text-right">Notional</span>
            </div>
            {/* Asks */}
            {!orderbook ? (
              <div className="flex items-center justify-center py-8" style={{ color: muted }}>Loading…</div>
            ) : (
              <>
                {orderbook.levels[1]?.slice().reverse().map((lvl, i) => (
                  <div key={i} className="px-3 py-0.5 grid grid-cols-3">
                    <span style={{ color: "#f87171" }}>{fmt(lvl.px, 2)}</span>
                    <span className="text-center" style={{ color: text }}>{fmt(lvl.sz, 4)}</span>
                    <span className="text-right" style={{ color: muted }}>${fmt(parseFloat(lvl.px) * parseFloat(lvl.sz), 0)}</span>
                  </div>
                ))}
                {/* Mid price */}
                <div className="px-3 py-1.5 text-center font-bold" style={{ color: "#4ade80", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, backgroundColor: bgElevated }}>
                  ${midPx ? fmt(midPx, 2) : "—"}
                </div>
                {orderbook.levels[0]?.map((lvl, i) => (
                  <div key={i} className="px-3 py-0.5 grid grid-cols-3">
                    <span style={{ color: "#4ade80" }}>{fmt(lvl.px, 2)}</span>
                    <span className="text-center" style={{ color: text }}>{fmt(lvl.sz, 4)}</span>
                    <span className="text-right" style={{ color: muted }}>${fmt(parseFloat(lvl.px) * parseFloat(lvl.sz), 0)}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Order form */}
          <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${border}` }}>

            {/* Long / Short */}
            <div className="flex rounded overflow-hidden mb-2">
              <button
                onClick={() => handleSideChange("buy")}
                className="flex-1 py-1.5 font-semibold cursor-pointer transition-all"
                style={{ backgroundColor: side === "buy" ? "#16a34a" : bgElevated, color: side === "buy" ? "#fff" : muted }}
              >Long</button>
              <button
                onClick={() => handleSideChange("sell")}
                className="flex-1 py-1.5 font-semibold cursor-pointer transition-all"
                style={{ backgroundColor: side === "sell" ? "#dc2626" : bgElevated, color: side === "sell" ? "#fff" : muted }}
              >Short</button>
            </div>

            {/* Market / Limit */}
            <div className="flex gap-1 mb-2">
              {[OrderType.Market, OrderType.Limit].map((t) => (
                <button
                  key={t}
                  onClick={() => handleOrderTypeChange(t)}
                  className="flex-1 py-1 capitalize rounded cursor-pointer text-xs transition-all"
                  style={{
                    backgroundColor: orderType === t ? bgElevated : "transparent",
                    color: orderType === t ? text : muted,
                    border: `1px solid ${orderType === t ? border : "transparent"}`,
                  }}
                >{t}</button>
              ))}
            </div>

            {/* Limit price — shown for Limit orders */}
            {orderType === OrderType.Limit && (
              <input
                type="number"
                placeholder="Limit Price (USD)"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full rounded px-2 py-1.5 mb-2 outline-none text-xs"
                style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: text }}
              />
            )}

            {/* Market price preview for Market orders */}
            {orderType === OrderType.Market && midPx && (
              <div className="mb-2 px-2 py-1.5 rounded text-xs flex justify-between"
                style={{ backgroundColor: bgElevated }}>
                <span style={{ color: muted }}>Exec price</span>
                <span style={{ color: side === "buy" ? "#f87171" : "#4ade80" }}>
                  ${side === "buy" ? fmt(askPx, 2) : fmt(bidPx, 2)}
                </span>
              </div>
            )}

            {/* Collateral */}
            <input
              type="number"
              placeholder="Collateral (USD, min $5)"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className="w-full rounded px-2 py-1.5 mb-2 outline-none text-xs"
              style={{
                backgroundColor: bgElevated,
                border: `1px solid ${collateral && parseFloat(collateral) < 5 ? "#f87171" : border}`,
                color: text,
              }}
            />
            {collateral && parseFloat(collateral) < 5 && (
              <div className="mb-1 text-xs" style={{ color: "#f87171" }}>Minimum collateral is $5</div>
            )}

            {/* Leverage */}
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span style={{ color: muted }}>Leverage</span>
                <span style={{ color: text, fontWeight: 600 }}>{leverage}×</span>
              </div>
              <input
                type="range"
                min="1"
                max={selectedPair?.maxLeverage || 100}
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full cursor-pointer"
                style={{ accentColor: accent }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: muted }}>
                <span>1×</span>
                <span>{selectedPair?.maxLeverage || 100}×</span>
              </div>
            </div>

            {/* TP / SL */}
            <div className="flex gap-1 mb-2">
              <input
                type="number"
                placeholder="TP"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="flex-1 rounded px-2 py-1.5 outline-none text-xs"
                style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: "#4ade80" }}
              />
              <input
                type="number"
                placeholder="SL"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="flex-1 rounded px-2 py-1.5 outline-none text-xs"
                style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: "#f87171" }}
              />
            </div>

            {/* Notional + fee preview */}
            {collateral && parseFloat(collateral) >= 5 && (
              <div className="mb-2 px-2 py-1.5 rounded text-xs space-y-0.5"
                style={{ backgroundColor: bgElevated }}>
                <div className="flex justify-between">
                  <span style={{ color: muted }}>Notional</span>
                  <span style={{ color: text }}>${fmt(parseFloat(collateral) * parseFloat(leverage), 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: muted }}>Est. fee (~0.1%)</span>
                  <span style={{ color: muted }}>${fmt(parseFloat(collateral) * parseFloat(leverage) * 0.001, 2)}</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-2 rounded font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: side === "buy" ? "#16a34a" : "#dc2626", color: "#fff" }}
            >
              {!authenticated
                ? "Connect Wallet"
                : !selectedPair
                ? "Select a pair"
                : !collateral || parseFloat(collateral) < 5
                ? "Enter collateral"
                : orderType === OrderType.Limit && !limitPrice
                ? "Enter limit price"
                : submitting
                ? "Submitting…"
                : `${side === "buy" ? "Long" : "Short"} ${selectedPair.pairFrom}`
              }
            </button>

            {txMsg && (
              <div className="mt-2 text-xs text-center" style={{ color: txMsg.startsWith("✓") ? "#4ade80" : "#f87171" }}>
                {txMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
