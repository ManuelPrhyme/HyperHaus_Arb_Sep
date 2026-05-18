import { useState } from "react";
import { Chart, Topbar } from "../components";

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", price: "104,250", change: "+2.4%", positive: true },
  { symbol: "ETH", name: "Ethereum", price: "2,510", change: "-0.8%", positive: false },
  { symbol: "SOL", name: "Solana", price: "168", change: "+1.2%", positive: true },
  { symbol: "HYPE", name: "Hyperliquid", price: "38.4", change: "+5.1%", positive: true },
  { symbol: "ARB", name: "Arbitrum", price: "0.52", change: "-1.3%", positive: false },
  { symbol: "AVAX", name: "Avalanche", price: "24.1", change: "+0.6%", positive: true },
];

const ORDERBOOK = [
  { price: "104,320", size: "0.42", total: "43.8" },
  { price: "104,310", size: "1.10", total: "114.7" },
  { price: "104,290", size: "0.75", total: "78.2" },
  { price: "104,270", size: "2.30", total: "239.8" },
  { price: "104,250", size: "0.90", total: "93.8" },
];

const BIDS = [
  { price: "104,230", size: "1.20", total: "125.1" },
  { price: "104,210", size: "0.60", total: "62.5" },
  { price: "104,190", size: "3.10", total: "323.0" },
  { price: "104,170", size: "0.80", total: "83.3" },
  { price: "104,150", size: "1.50", total: "156.2" },
];

const POSITIONS = [
  { asset: "BTC", side: "Long", size: "0.1", entry: "103,800", pnl: "+$45.00", positive: true },
  { asset: "ETH", side: "Short", size: "1.5", entry: "2,540", pnl: "-$18.00", positive: false },
];

const Trade = () => {
  const [selected, setSelected] = useState(ASSETS[0]);
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [bottomTab, setBottomTab] = useState("positions");

  const bg = "var(--bg)";
  const bgCard = "var(--bg-card)";
  const bgElevated = "var(--bg-elevated)";
  const border = "var(--border)";
  const accent = "var(--accent)";
  const muted = "var(--muted)";
  const text = "var(--text)";

  return (
    <div className="trade-fullscreen flex flex-col h-screen w-screen text-xs overflow-hidden" style={{ backgroundColor: bg, color: text }}>

      {/* Topbar */}
      <div className="shrink-0">
        <Topbar />
      </div>

      {/* Asset top bar */}
      <div className="flex items-center gap-6 px-4 py-2 shrink-0" style={{ backgroundColor: bgCard, borderBottom: `1px solid ${border}` }}>
        <span className="font-bold text-base" style={{ color: text }}>{selected.symbol}/USDT</span>
        <span className="text-lg font-semibold" style={{ color: text }}>${selected.price}</span>
        <span style={{ color: selected.positive ? "#4ade80" : "#f87171" }}>{selected.change} 24h</span>
        <span style={{ color: muted }} className="ml-4">24h Vol: <span style={{ color: text }}>$2.4B</span></span>
        <span style={{ color: muted }}>Open Interest: <span style={{ color: text }}>$980M</span></span>
        <span style={{ color: muted }}>Funding: <span style={{ color: "#4ade80" }}>+0.0100%</span></span>
      </div>

      {/* Main 3-column */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: asset list */}
        <div className="w-[160px] shrink-0 overflow-y-auto" style={{ backgroundColor: bgCard, borderRight: `1px solid ${border}` }}>
          <div className="px-3 py-2 text-xs" style={{ color: muted, borderBottom: `1px solid ${border}` }}>Markets</div>
          {ASSETS.map((a) => (
            <div
              key={a.symbol}
              onClick={() => setSelected(a)}
              className="px-3 py-2.5 cursor-pointer flex justify-between items-center"
              style={{
                backgroundColor: selected.symbol === a.symbol ? bgElevated : "transparent",
                borderLeft: selected.symbol === a.symbol ? `2px solid ${accent}` : "2px solid transparent",
              }}
            >
              <div>
                <div className="font-semibold" style={{ color: text }}>{a.symbol}</div>
                <div style={{ color: muted }}>${a.price}</div>
              </div>
              <span style={{ color: a.positive ? "#4ade80" : "#f87171" }}>{a.change}</span>
            </div>
          ))}
        </div>

        {/* Center: chart + positions */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Chart symbol={selected.symbol} />
          </div>

          {/* Bottom panel */}
          <div className="h-[180px] shrink-0 overflow-y-auto" style={{ backgroundColor: bgCard, borderTop: `1px solid ${border}` }}>
            <div className="flex" style={{ borderBottom: `1px solid ${border}` }}>
              {["positions", "orders", "history"].map((t) => (
                <button
                  key={t}
                  onClick={() => setBottomTab(t)}
                  className="px-4 py-2 capitalize cursor-pointer"
                  style={{
                    color: bottomTab === t ? text : muted,
                    borderBottom: bottomTab === t ? `2px solid ${accent}` : "2px solid transparent",
                  }}
                >{t}</button>
              ))}
            </div>
            {bottomTab === "positions" ? (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    {["Asset", "Side", "Size", "Entry Price", "PnL"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-normal" style={{ color: muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POSITIONS.map((p, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                      <td className="px-4 py-2 font-semibold" style={{ color: text }}>{p.asset}</td>
                      <td className="px-4 py-2" style={{ color: p.side === "Long" ? "#4ade80" : "#f87171" }}>{p.side}</td>
                      <td className="px-4 py-2" style={{ color: text }}>{p.size}</td>
                      <td className="px-4 py-2" style={{ color: text }}>${p.entry}</td>
                      <td className="px-4 py-2" style={{ color: p.positive ? "#4ade80" : "#f87171" }}>{p.pnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-[120px]" style={{ color: muted }}>No {bottomTab}</div>
            )}
          </div>
        </div>

        {/* Right: orderbook + form */}
        <div className="w-[220px] shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: bgCard, borderLeft: `1px solid ${border}` }}>

          {/* Order book */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2" style={{ color: muted, borderBottom: `1px solid ${border}` }}>Order Book</div>
            <div className="px-3 py-1 grid grid-cols-3" style={{ color: muted, borderBottom: `1px solid ${border}` }}>
              <span>Price</span><span className="text-center">Size</span><span className="text-right">Total</span>
            </div>
            {ORDERBOOK.map((o, i) => (
              <div key={i} className="px-3 py-1 grid grid-cols-3">
                <span style={{ color: "#f87171" }}>{o.price}</span>
                <span className="text-center" style={{ color: text }}>{o.size}</span>
                <span className="text-right" style={{ color: muted }}>{o.total}</span>
              </div>
            ))}
            <div className="px-3 py-1.5 text-center font-bold" style={{ color: "#4ade80", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, backgroundColor: bgElevated }}>
              ${selected.price}
            </div>
            {BIDS.map((b, i) => (
              <div key={i} className="px-3 py-1 grid grid-cols-3">
                <span style={{ color: "#4ade80" }}>{b.price}</span>
                <span className="text-center" style={{ color: text }}>{b.size}</span>
                <span className="text-right" style={{ color: muted }}>{b.total}</span>
              </div>
            ))}
          </div>

          {/* Order form */}
          <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex rounded overflow-hidden mb-3">
              <button onClick={() => setSide("buy")} className="flex-1 py-1.5 font-semibold cursor-pointer"
                style={{ backgroundColor: side === "buy" ? "#16a34a" : bgElevated, color: side === "buy" ? "#fff" : muted }}>Buy</button>
              <button onClick={() => setSide("sell")} className="flex-1 py-1.5 font-semibold cursor-pointer"
                style={{ backgroundColor: side === "sell" ? "#dc2626" : bgElevated, color: side === "sell" ? "#fff" : muted }}>Sell</button>
            </div>
            <div className="flex gap-1 mb-3">
              {["limit", "market"].map((t) => (
                <button key={t} onClick={() => setOrderType(t)} className="flex-1 py-1 capitalize rounded cursor-pointer"
                  style={{ backgroundColor: orderType === t ? bgElevated : "transparent", color: orderType === t ? text : muted, border: `1px solid ${orderType === t ? border : "transparent"}` }}>
                  {t}
                </button>
              ))}
            </div>
            {orderType === "limit" && (
              <input type="number" placeholder="Price (USDT)" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded px-2 py-1.5 mb-2 outline-none text-xs"
                style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: text }} />
            )}
            <input type="number" placeholder={`Size (${selected.symbol})`} value={size} onChange={(e) => setSize(e.target.value)}
              className="w-full rounded px-2 py-1.5 mb-3 outline-none text-xs"
              style={{ backgroundColor: bgElevated, border: `1px solid ${border}`, color: text }} />
            <button className="w-full py-2 rounded font-semibold cursor-pointer"
              style={{ backgroundColor: side === "buy" ? "#16a34a" : "#dc2626", color: "#fff" }}>
              {side === "buy" ? "Buy" : "Sell"} {selected.symbol}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
