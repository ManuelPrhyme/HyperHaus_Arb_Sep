import { useState, useEffect, useRef, useCallback } from "react";
import { OstiumSubgraphClient, OstiumClient } from "@ostium/builder-sdk";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

export function useOstium() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [subgraph, setSubgraph]     = useState(null);
  const [pairs, setPairs]           = useState([]);
  const [prices, setPrices]         = useState({});
  const [positions, setPositions]   = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [fills, setFills]           = useState([]);
  const [orderbook, setOrderbook]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const streamRef                   = useRef(null);

  const address = wallets[0]?.address;

  // Prefer the injected extension wallet (MetaMask, Rabby, etc.) over Privy embedded
  const extensionWallet = wallets.find(
    (w) => w.walletClientType === "metamask" ||
           w.walletClientType === "injected"  ||
           w.walletClientType === "rabby"     ||
           w.walletClientType === "coinbase_wallet"
  ) || wallets[0];

  // ── Init subgraph client once ──────────────────────────────────────────────
  useEffect(() => {
    OstiumSubgraphClient.create()
      .then(setSubgraph)
      .catch((e) => setError(e.message));
  }, []);

  // ── Fetch pairs + initial prices ───────────────────────────────────────────
  useEffect(() => {
    if (!subgraph) return;
    (async () => {
      try {
        const { pairs: p } = await subgraph.getPairs();
        setPairs(p);
        const { prices: px } = await subgraph.getAllPrices();
        setPrices(px);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [subgraph]);

  // ── Stream live prices for all pairs ──────────────────────────────────────
  useEffect(() => {
    if (!subgraph || pairs.length === 0) return;
    const stream = subgraph.streamPrices(pairs.map((p) => p.pairId));
    streamRef.current = stream;
    stream.onTick((tick) => {
      if (tick.pairId) {
        setPrices((prev) => ({
          ...prev,
          [tick.pairId]: {
            mid: String(tick.mid),
            bid: String(tick.bid),
            ask: String(tick.ask),
          },
        }));
      }
    });
    return () => stream.close();
  }, [subgraph, pairs.length]);

  // ── Fetch user data when wallet connects ───────────────────────────────────
  const refreshUserData = useCallback(async () => {
    if (!subgraph || !address) return;
    try {
      const [pos, orders, history] = await Promise.all([
        subgraph.getOpenPositions({ user: address }),
        subgraph.getOpenOrders({ user: address }),
        subgraph.getFills({ user: address, limit: 50 }),
      ]);
      setPositions(pos.pairPositions.map((pp) => pp.position));
      setOpenOrders(orders);
      setFills(history);
    } catch (e) {
      console.error("Failed to fetch user data:", e);
    }
  }, [subgraph, address]);

  useEffect(() => {
    if (authenticated && address) refreshUserData();
  }, [authenticated, address, refreshUserData]);

  // ── Fetch orderbook — clear immediately on pair change ────────────────────
  const fetchOrderbook = useCallback(
    async (pairId) => {
      if (!subgraph) return;
      setOrderbook(null);
      try {
        const ob = await subgraph.getSimOrderbook({ pairId, levels: 8 });
        setOrderbook((prev) => {
          if (prev !== null && String(ob.pairId) !== String(pairId)) return prev;
          return ob;
        });
      } catch (e) {
        console.error("Orderbook fetch failed:", e);
      }
    },
    [subgraph]
  );

  // ── Build a client that can construct unsigned txs for this trader ─────────
  const buildClient = useCallback(
    async () => {
      if (!address) throw new Error("No wallet connected");
      return OstiumClient.createSelfAndSelf({ traderAddress: address });
    },
    [address]
  );

  // ── Submit a built tx via the injected extension wallet ───────────────────
  const sendTx = useCallback(
    async (builtTx) => {
      if (!extensionWallet) throw new Error("No wallet connected");

      // Use window.ethereum directly for injected wallets — most reliable path
      // for MetaMask/Rabby since Privy's getEthereumProvider wraps the embedded wallet
      let provider;
      if (
        extensionWallet.walletClientType === "metamask" ||
        extensionWallet.walletClientType === "injected"  ||
        extensionWallet.walletClientType === "rabby"     ||
        extensionWallet.walletClientType === "coinbase_wallet"
      ) {
        provider = window.ethereum;
      } else {
        provider = await extensionWallet.getEthereumProvider();
      }

      if (!provider) throw new Error("No Ethereum provider found");

      const walletClient = createWalletClient({
        chain: arbitrum,
        transport: custom(provider),
      });

      // Switch to Arbitrum if needed
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa4b1" }], // Arbitrum One
        });
      } catch (switchErr) {
        // Chain not added — add it
        if (switchErr.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xa4b1",
              chainName: "Arbitrum One",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://arb1.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://arbiscan.io"],
            }],
          });
        }
      }

      return walletClient.sendTransaction({
        account:  address,
        to:       builtTx.to,
        data:     builtTx.data,
        value:    builtTx.value ?? 0n,
      });
    },
    [address, extensionWallet]
  );

  // ── Open a trade ──────────────────────────────────────────────────────────
  const submitTrade = useCallback(
    async ({ pairId, buy, price, collateral, leverage, type, takeProfit, stopLoss }) => {
      const client = await buildClient();
      const builtTx = client.getOpenTradeTx({
        pairId,
        buy,
        price:      String(price),
        collateral: String(collateral),
        leverage:   String(leverage),
        type,
        takeProfit: takeProfit ? String(takeProfit) : undefined,
        stopLoss:   stopLoss   ? String(stopLoss)   : undefined,
      });
      const hash = await sendTx(builtTx);
      await refreshUserData();
      return hash;
    },
    [buildClient, sendTx, refreshUserData]
  );

  // ── Close a position ──────────────────────────────────────────────────────
  const closeTrade = useCallback(
    async ({ pairId, idx, closePercent = 100 }) => {
      const px = prices[String(pairId)]?.mid;
      if (!px) throw new Error("No price available for this pair");
      const client = await buildClient();
      const builtTx = client.getCloseTradeTx({
        pairId,
        idx,
        price:        String(px),
        closePercent,
        checkAllowance: false,
      });
      const hash = await sendTx(builtTx);
      await refreshUserData();
      return hash;
    },
    [buildClient, sendTx, prices, refreshUserData]
  );

  return {
    pairs,
    prices,
    positions,
    openOrders,
    fills,
    orderbook,
    loading,
    error,
    fetchOrderbook,
    submitTrade,
    closeTrade,
    refreshUserData,
  };
}
