import { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { arbitrumSepolia } from "viem/chains";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json;
}

export function useOstium() {
  const { authenticated } = usePrivy();
  const { wallets }       = useWallets();

  const [pairs,      setPairs]      = useState([]);
  const [prices,     setPrices]     = useState({});
  const [positions,  setPositions]  = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [fills,      setFills]      = useState([]);
  const [orderbook,  setOrderbook]  = useState(null);
  const [balances,   setBalances]   = useState(null); // { usdc, eth, allowance }
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const sseRef = useRef(null);

  // Prefer injected extension wallet (MetaMask / Rabby) over Privy embedded
  const extensionWallet = wallets.find(
    (w) =>
      w.walletClientType === "metamask"       ||
      w.walletClientType === "injected"       ||
      w.walletClientType === "rabby"          ||
      w.walletClientType === "coinbase_wallet"
  ) || wallets[0];

  const address = extensionWallet?.address;

  // ── Fetch pairs on mount ───────────────────────────────────────────────────
  useEffect(() => {
    apiFetch("/api/ostium/pairs")
      .then(({ pairs: p }) => { setPairs(p); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  // ── Fetch initial prices once pairs are loaded ─────────────────────────────
  useEffect(() => {
    if (!pairs.length) return;
    apiFetch("/api/ostium/prices")
      .then(({ prices: px }) => setPrices(px))
      .catch(console.error);
  }, [pairs.length]);

  // ── SSE price stream ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!pairs.length) return;

    const pairIds = pairs.map((p) => p.pairId).join(",");
    const es = new EventSource(`${API}/api/ostium/stream?pairIds=${pairIds}`);
    sseRef.current = es;

    es.addEventListener("snapshot", (e) => {
      const ticks = JSON.parse(e.data);
      setPrices((prev) => {
        const next = { ...prev };
        ticks.forEach((t) => {
          if (t.pairId) next[t.pairId] = { mid: String(t.mid), bid: String(t.bid), ask: String(t.ask) };
        });
        return next;
      });
    });

    es.addEventListener("tick", (e) => {
      const tick = JSON.parse(e.data);
      if (tick.pairId) {
        setPrices((prev) => ({
          ...prev,
          [tick.pairId]: { mid: String(tick.mid), bid: String(tick.bid), ask: String(tick.ask) },
        }));
      }
    });

    es.onerror = () => es.close();

    return () => { es.close(); sseRef.current = null; };
  }, [pairs.length]);

  // ── Fetch user data ────────────────────────────────────────────────────────
  const refreshUserData = useCallback(async () => {
    if (!address) return;
    try {
      const [posRes, ordRes, fillRes, balRes] = await Promise.all([
        apiFetch(`/api/ostium/positions?user=${address}`),
        apiFetch(`/api/ostium/orders?user=${address}`),
        apiFetch(`/api/ostium/fills?user=${address}&limit=50`),
        apiFetch(`/api/ostium/balances?user=${address}`),
      ]);
      setPositions(posRes.positions);
      console.log("[positions] raw:", JSON.stringify(posRes.positions?.[0]));
      setOpenOrders(ordRes.orders);
      setFills(fillRes.fills);
      setBalances(balRes.balances);
    } catch (e) {
      console.error("Failed to fetch user data:", e);
    }
  }, [address]);

  useEffect(() => {
    if (authenticated && address) refreshUserData();
  }, [authenticated, address, refreshUserData]);

  // ── Fetch orderbook ────────────────────────────────────────────────────────
  const fetchOrderbook = useCallback(async (pairId) => {
    setOrderbook(null);
    try {
      const { orderbook: ob } = await apiFetch(`/api/ostium/orderbook?pairId=${pairId}&levels=8`);
      setOrderbook(ob);
    } catch (e) {
      console.error("Orderbook fetch failed:", e);
    }
  }, []);

  // ── Submit tx via extension wallet ─────────────────────────────────────────
  const sendTx = useCallback(async ({ to, data, value }) => {
    if (!extensionWallet) throw new Error("No wallet connected");

    const provider =
      extensionWallet.walletClientType === "metamask"  ||
      extensionWallet.walletClientType === "injected"  ||
      extensionWallet.walletClientType === "rabby"     ||
      extensionWallet.walletClientType === "coinbase_wallet"
        ? window.ethereum
        : await extensionWallet.getEthereumProvider();

    if (!provider) throw new Error("No Ethereum provider found");

    // Switch to Arbitrum Sepolia
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x66eee" }] });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId:         "0x66eee",
            chainName:       "Arbitrum Sepolia",
            nativeCurrency:  { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls:         ["https://sepolia-rollup.arbitrum.io/rpc"],
            blockExplorerUrls: ["https://sepolia.arbiscan.io"],
          }],
        });
      }
    }

    // Fetch latest block to get current base fee
    const block = await provider.request({ method: "eth_getBlockByNumber", params: ["latest", false] });
    const baseFee = BigInt(block.baseFeePerGas ?? "0x1312D00"); // ~20 gwei fallback
    const maxPriorityFeePerGas = 1_000_000n; // 0.001 gwei
    const maxFeePerGas = baseFee * 2n + maxPriorityFeePerGas;

    // Estimate gas — add 20% buffer
    let gas = "0x7A120"; // 500k fallback
    try {
      const est = await provider.request({ method: "eth_estimateGas", params: [{ from: address, to, data }] });
      gas = "0x" + (BigInt(est) * 12n / 10n).toString(16);
    } catch { /* use fallback */ }

    return provider.request({
      method: "eth_sendTransaction",
      params: [{ from: address, to, data, gas, maxFeePerGas: "0x" + maxFeePerGas.toString(16), maxPriorityFeePerGas: "0x" + maxPriorityFeePerGas.toString(16) }],
    });
  }, [address, extensionWallet]);

  // ── Approve USDC — server builds tx, client signs ────────────────────────────
  const approveUsdc = useCallback(async (amount = "max") => {
    if (!address) throw new Error("No wallet connected");
    const { tx } = await apiFetch("/api/ostium/build/approve", {
      method: "POST",
      body:   JSON.stringify({ traderAddress: address, amount }),
    });
    const hash = await sendTx(tx);
    // Refresh balances after approval
    const balRes = await apiFetch(`/api/ostium/balances?user=${address}`);
    setBalances(balRes.balances);
    return hash;
  }, [address, sendTx]);

  // ── Open trade — server builds tx, client signs ────────────────────────────
  const submitTrade = useCallback(async (params) => {
    if (!address) throw new Error("No wallet connected");
    // Ensure type is a plain string ("market" or "limit") not an SDK enum
    const payload = {
      ...params,
      type: String(params.type ?? "market"),
      buy:  Boolean(params.buy),
    };
    const { tx, execPrice } = await apiFetch("/api/ostium/build/open", {
      method: "POST",
      body:   JSON.stringify({ traderAddress: address, ...payload }),
    });
    const hash = await sendTx(tx);
    await refreshUserData();
    return { hash, execPrice };
  }, [address, sendTx, refreshUserData]);

  // ── Close trade — server builds tx, client signs ───────────────────────────
  const closeTrade = useCallback(async ({ pairId, idx, closePercent = 100 }) => {
    if (!address) throw new Error("No wallet connected");
    const { tx } = await apiFetch("/api/ostium/build/close", {
      method: "POST",
      body:   JSON.stringify({ traderAddress: address, pairId, idx, closePercent }),
    });
    const hash = await sendTx(tx);
    await refreshUserData();
    return hash;
  }, [address, sendTx, refreshUserData]);

  return {
    pairs, prices, positions, openOrders, fills,
    orderbook, balances, loading, error,
    fetchOrderbook, approveUsdc, submitTrade, closeTrade, refreshUserData,
  };
}
