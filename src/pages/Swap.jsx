import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, custom, http, parseEther, parseUnits, formatEther, formatUnits } from "viem";
import { arbitrumSepolia } from "viem/chains";

// ── Confirmed addresses on Arbitrum Sepolia ───────────────────────────────────
const WETH   = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73"; // WETH Arb Sepolia
const USDC   = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Circle USDC Arb Sepolia
const ROUTER = "0x101F443B4d1b059569D643917553c771E1b9663E"; // SwapRouter02
const QUOTER = "0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B"; // QuoterV2
const FEE    = 500; // 0.05% — confirmed deepest USDC/WETH pool

const QUOTER_ABI = [{
  name: "quoteExactInputSingle", type: "function", stateMutability: "nonpayable",
  inputs: [{ name: "params", type: "tuple", components: [
    { name: "tokenIn",           type: "address" },
    { name: "tokenOut",          type: "address" },
    { name: "amountIn",          type: "uint256" },
    { name: "fee",               type: "uint24"  },
    { name: "sqrtPriceLimitX96", type: "uint160" },
  ]}],
  outputs: [
    { name: "amountOut",               type: "uint256" },
    { name: "sqrtPriceX96After",       type: "uint160" },
    { name: "initializedTicksCrossed", type: "uint32"  },
    { name: "gasEstimate",             type: "uint256" },
  ],
}];

const ROUTER_ABI = [{
  name: "exactInputSingle", type: "function", stateMutability: "payable",
  inputs: [{ name: "params", type: "tuple", components: [
    { name: "tokenIn",           type: "address" },
    { name: "tokenOut",          type: "address" },
    { name: "fee",               type: "uint24"  },
    { name: "recipient",         type: "address" },
    { name: "amountIn",          type: "uint256" },
    { name: "amountOutMinimum",  type: "uint256" },
    { name: "sqrtPriceLimitX96", type: "uint160" },
  ]}],
  outputs: [{ name: "amountOut", type: "uint256" }],
}];

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
];

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

const bg     = "var(--bg)";
const bgCard = "var(--bg-card)";
const bgElev = "var(--bg-elevated)";
const border = "var(--border)";
const accent = "var(--accent)";
const muted  = "var(--muted)";
const text   = "var(--text)";

export default function Swap() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [fromToken,     setFromToken]     = useState("ETH");
  const [amount,        setAmount]        = useState("");
  const [quote,         setQuote]         = useState(null);
  const [ethBal,        setEthBal]        = useState(null);
  const [usdcBal,       setUsdcBal]       = useState(null);
  const [status,        setStatus]        = useState("");
  const [swapping,      setSwapping]      = useState(false);
  const [approving,     setApproving]     = useState(false);
  const [quoting,       setQuoting]       = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const extensionWallet = wallets.find(
    (w) => ["metamask","injected","rabby","coinbase_wallet"].includes(w.walletClientType)
  ) || wallets[0];
  const address = extensionWallet?.address;
  const toToken = fromToken === "ETH" ? "USDC" : "ETH";

  const ensureChain = useCallback(async (provider) => {
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x66eee" }] });
    } catch (e) {
      if (e.code === 4902) {
        await provider.request({ method: "wallet_addEthereumChain", params: [{
          chainId: "0x66eee", chainName: "Arbitrum Sepolia",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
          blockExplorerUrls: ["https://sepolia.arbiscan.io"],
        }]});
      }
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    try {
      const [eth, usdc] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({ address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
      ]);
      setEthBal(parseFloat(formatEther(eth)).toFixed(4));
      setUsdcBal(parseFloat(formatUnits(usdc, 6)).toFixed(2));
    } catch (e) { console.error("Balance fetch failed:", e); }
  }, [address]);

  useEffect(() => {
    if (authenticated && address) fetchBalances();
  }, [authenticated, address, fetchBalances]);

  // ── Quote with debounce ────────────────────────────────────────────────────
  useEffect(() => {
    setQuote(null);
    setNeedsApproval(false);
    setStatus("");
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;

    const timer = setTimeout(async () => {
      setQuoting(true);
      try {
        const isEthIn  = fromToken === "ETH";
        const amountIn = isEthIn ? parseEther(amount) : parseUnits(amount, 6);

        const { result } = await publicClient.simulateContract({
          address: QUOTER,
          abi: QUOTER_ABI,
          functionName: "quoteExactInputSingle",
          args: [{
            tokenIn:           isEthIn ? WETH : USDC,
            tokenOut:          isEthIn ? USDC : WETH,
            amountIn,
            fee:               FEE,
            sqrtPriceLimitX96: 0n,
          }],
        });

        const amountOut = result[0];
        setQuote(isEthIn ? formatUnits(amountOut, 6) : formatEther(amountOut));

        // Check allowance when selling USDC
        if (!isEthIn && address) {
          const allowance = await publicClient.readContract({
            address: USDC, abi: ERC20_ABI,
            functionName: "allowance",
            args: [address, ROUTER],
          });
          setNeedsApproval(allowance < amountIn);
        }
      } catch (e) {
        setStatus(`Quote failed: ${e.shortMessage || e.message}`);
      } finally {
        setQuoting(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [amount, fromToken, address]);

  const handleApprove = async () => {
    if (!address) return;
    setApproving(true);
    setStatus("Confirm approval in wallet…");
    try {
      const provider = window.ethereum;
      await ensureChain(provider);
      const wc = createWalletClient({ chain: arbitrumSepolia, transport: custom(provider) });

      // Fetch current base fee and add 20% buffer
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const baseFee = block.baseFeePerGas ?? 100_000_000n;
      const maxFeePerGas = baseFee * 15n / 10n; // 1.5x buffer
      const maxPriorityFeePerGas = 1_000_000n;  // 0.001 gwei tip

      const hash = await wc.writeContract({
        account: address, address: USDC, abi: ERC20_ABI,
        functionName: "approve",
        args: [ROUTER, 2n ** 256n - 1n],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      setStatus("Waiting for confirmation…");
      await publicClient.waitForTransactionReceipt({ hash });
      setNeedsApproval(false);
      setStatus("✓ USDC approved");
    } catch (e) {
      setStatus(`✗ Approval failed: ${e.shortMessage || e.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!address || !amount || !quote) return;
    setSwapping(true);
    setStatus("Confirm swap in wallet…");
    try {
      const provider = window.ethereum;
      await ensureChain(provider);
      const wc = createWalletClient({ chain: arbitrumSepolia, transport: custom(provider) });

      // Fetch current base fee and add buffer
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const baseFee = block.baseFeePerGas ?? 100_000_000n;
      const maxFeePerGas = baseFee * 15n / 10n;
      const maxPriorityFeePerGas = 1_000_000n;

      const isEthIn      = fromToken === "ETH";
      const amountIn     = isEthIn ? parseEther(amount) : parseUnits(amount, 6);
      const slippage     = 50n; // 0.5%
      const amountOutMin = isEthIn
        ? parseUnits(quote, 6) * (1000n - slippage) / 1000n
        : parseEther(quote)    * (1000n - slippage) / 1000n;

      const hash = await wc.writeContract({
        account: address,
        address: ROUTER,
        abi: ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [{
          tokenIn:           isEthIn ? WETH : USDC,
          tokenOut:          isEthIn ? USDC : WETH,
          fee:               FEE,
          recipient:         address,
          amountIn,
          amountOutMinimum:  amountOutMin,
          sqrtPriceLimitX96: 0n,
        }],
        value: isEthIn ? amountIn : 0n,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      setStatus("Waiting for confirmation…");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(`✓ Swap confirmed! ${hash.slice(0, 10)}…`);
      setAmount("");
      setQuote(null);
      await fetchBalances();
    } catch (e) {
      setStatus(`✗ Swap failed: ${e.shortMessage || e.message}`);
    } finally {
      setSwapping(false);
    }
  };

  const flip = () => {
    setFromToken(toToken);
    setAmount("");
    setQuote(null);
    setStatus("");
    setNeedsApproval(false);
  };

  const maxAmount = fromToken === "ETH"
    ? String(Math.max(0, parseFloat(ethBal || 0) - 0.002).toFixed(6))
    : String(parseFloat(usdcBal || 0).toFixed(2));

  return (
    <div className="w-full flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: text }}>Swap</h2>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: bgElev, color: muted }}>
            Arbitrum Sepolia · Uniswap V3
          </span>
        </div>

        {/* From */}
        <div className="rounded-xl p-4 mb-1" style={{ backgroundColor: bgElev }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs" style={{ color: muted }}>You pay</span>
            {authenticated && (
              <button className="text-xs cursor-pointer" style={{ color: accent }}
                onClick={() => setAmount(maxAmount)}>
                Max: {fromToken === "ETH" ? `${ethBal ?? "—"} ETH` : `${usdcBal ?? "—"} USDC`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number" placeholder="0.0" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 outline-none bg-transparent text-2xl font-semibold"
              style={{ color: text }}
            />
            <div className="px-3 py-1.5 rounded-lg text-sm font-bold shrink-0"
              style={{ backgroundColor: bgCard, border: `1px solid ${border}`, color: text }}>
              {fromToken}
            </div>
          </div>
        </div>

        {/* Flip */}
        <div className="flex justify-center my-2">
          <button onClick={flip}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: bgElev, border: `1px solid ${border}`, color: muted }}>
            ↕
          </button>
        </div>

        {/* To */}
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: bgElev }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs" style={{ color: muted }}>You receive</span>
            {authenticated && (
              <span className="text-xs" style={{ color: muted }}>
                Balance: {toToken === "ETH" ? `${ethBal ?? "—"} ETH` : `${usdcBal ?? "—"} USDC`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold" style={{ color: quote ? text : muted }}>
              {quoting ? "…" : quote ? parseFloat(quote).toFixed(toToken === "USDC" ? 2 : 6) : "0.0"}
            </div>
            <div className="px-3 py-1.5 rounded-lg text-sm font-bold shrink-0"
              style={{ backgroundColor: bgCard, border: `1px solid ${border}`, color: text }}>
              {toToken}
            </div>
          </div>
        </div>

        {/* Rate info */}
        {quote && amount && parseFloat(amount) > 0 && (
          <div className="rounded-lg px-3 py-2 mb-4 space-y-1 text-xs" style={{ backgroundColor: bgElev }}>
            <div className="flex justify-between">
              <span style={{ color: muted }}>Rate</span>
              <span style={{ color: text }}>
                1 {fromToken} ≈ {(parseFloat(quote) / parseFloat(amount)).toFixed(toToken === "USDC" ? 2 : 6)} {toToken}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: muted }}>Pool fee</span>
              <span style={{ color: text }}>0.05%</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: muted }}>Max slippage</span>
              <span style={{ color: text }}>0.5%</span>
            </div>
          </div>
        )}

        {/* Approve */}
        {needsApproval && (
          <button onClick={handleApprove} disabled={approving}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-40 mb-3 transition-all"
            style={{ backgroundColor: accent, color: "#fff" }}>
            {approving ? "Approving…" : "Approve USDC"}
          </button>
        )}

        {/* Swap / Connect */}
        {!authenticated ? (
          <button onClick={login}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer"
            style={{ backgroundColor: accent, color: "#fff" }}>
            Connect Wallet
          </button>
        ) : (
          <button onClick={handleSwap}
            disabled={swapping || !amount || !quote || needsApproval || quoting}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-40 transition-all"
            style={{ backgroundColor: !quote || quoting ? bgElev : accent, color: !quote || quoting ? muted : "#fff" }}>
            {swapping  ? "Swapping…"
             : quoting ? "Getting quote…"
             : !amount ? "Enter amount"
             : !quote  ? "No quote available"
             : `Swap ${fromToken} → ${toToken}`}
          </button>
        )}

        {/* Status */}
        {status && (
          <div className="mt-3 text-xs text-center"
            style={{ color: status.startsWith("✓") ? "#4ade80" : status.startsWith("✗") ? "#f87171" : muted }}>
            {status}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-4 text-xs space-y-1" style={{ borderTop: `1px solid ${border}` }}>
          <div className="flex justify-between">
            <span style={{ color: muted }}>USDC</span>
            <a href={`https://sepolia.arbiscan.io/address/${USDC}`} target="_blank" rel="noopener noreferrer"
              style={{ color: accent }}>{USDC.slice(0,6)}…{USDC.slice(-4)}</a>
          </div>
          <div className="flex justify-between">
            <span style={{ color: muted }}>Network</span>
            <span style={{ color: text }}>Arbitrum Sepolia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
