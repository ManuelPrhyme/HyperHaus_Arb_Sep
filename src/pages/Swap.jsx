import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, createPublicClient, custom, http, parseEther, parseUnits, formatEther, formatUnits, encodeFunctionData } from "viem";
import { arbitrumSepolia } from "viem/chains";

// ── Arbitrum Sepolia addresses ────────────────────────────────────────────────
const WETH  = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73"; // WETH on Arb Sepolia
const USDC  = "0xe73B11Fb1e3eeEe8AF2a23079A4410Fe1B370548"; // Ostium USDC on Arb Sepolia
const ROUTER = "0x101F443B4d1b059569D643917553c771E1b9663E"; // Uniswap SwapRouter02 Arb Sepolia
const QUOTER = "0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0d"; // QuoterV2 Arb Sepolia
const FEE    = 3000; // 0.3% pool fee tier

// ── ABIs (minimal) ────────────────────────────────────────────────────────────
const QUOTER_ABI = [{
  name: "quoteExactInputSingle",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [{ name: "params", type: "tuple", components: [
    { name: "tokenIn",           type: "address" },
    { name: "tokenOut",          type: "address" },
    { name: "amountIn",          type: "uint256" },
    { name: "fee",               type: "uint24"  },
    { name: "sqrtPriceLimitX96", type: "uint160" },
  ]}],
  outputs: [
    { name: "amountOut",              type: "uint256" },
    { name: "sqrtPriceX96After",      type: "uint160" },
    { name: "initializedTicksCrossed",type: "uint32"  },
    { name: "gasEstimate",            type: "uint256" },
  ],
}];

const ROUTER_ABI = [{
  name: "exactInputSingle",
  type: "function",
  stateMutability: "payable",
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
  { name: "balanceOf",  type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "allowance",  type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "approve",    type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
];

const bg        = "var(--bg)";
const bgCard    = "var(--bg-card)";
const bgElev    = "var(--bg-elevated)";
const border    = "var(--border)";
const accent    = "var(--accent)";
const muted     = "var(--muted)";
const textColor = "var(--text)";

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

export default function Swap() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [fromToken, setFromToken] = useState("ETH");  // ETH or USDC
  const [amount,    setAmount]    = useState("");
  const [quote,     setQuote]     = useState(null);   // amountOut string
  const [ethBal,    setEthBal]    = useState(null);
  const [usdcBal,   setUsdcBal]   = useState(null);
  const [status,    setStatus]    = useState("");      // loading / error / success msg
  const [swapping,  setSwapping]  = useState(false);
  const [approving, setApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const extensionWallet = wallets.find(
    (w) => ["metamask","injected","rabby","coinbase_wallet"].includes(w.walletClientType)
  ) || wallets[0];
  const address = extensionWallet?.address;

  const toToken = fromToken === "ETH" ? "USDC" : "ETH";

  // ── Switch to Arbitrum Sepolia ─────────────────────────────────────────────
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

  // ── Fetch balances ─────────────────────────────────────────────────────────
  const fetchBalances = useCallback(async () => {
    if (!address) return;
    try {
      const [eth, usdc] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({ address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
      ]);
      setEthBal(formatEther(eth));
      setUsdcBal(formatUnits(usdc, 6));
    } catch (e) { console.error("Balance fetch failed:", e); }
  }, [address]);

  useEffect(() => {
    if (authenticated && address) fetchBalances();
  }, [authenticated, address, fetchBalances]);

  // ── Get quote ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setQuote(null);
    setNeedsApproval(false);
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;

    const debounce = setTimeout(async () => {
      try {
        const isEthIn = fromToken === "ETH";
        const amountIn = isEthIn
          ? parseEther(amount)
          : parseUnits(amount, 6);

        const [amountOut] = await publicClient.simulateContract({
          address: QUOTER,
          abi: QUOTER_ABI,
          functionName: "quoteExactInputSingle",
          args: [{ tokenIn: isEthIn ? WETH : USDC, tokenOut: isEthIn ? USDC : WETH, amountIn, fee: FEE, sqrtPriceLimitX96: 0n }],
        }).then(r => r.result);

        setQuote(isEthIn
          ? formatUnits(amountOut, 6)
          : formatEther(amountOut)
        );

        // Check USDC approval if selling USDC
        if (!isEthIn && address) {
          const allowance = await publicClient.readContract({
            address: USDC, abi: ERC20_ABI, functionName: "allowance", args: [address, ROUTER],
          });
          setNeedsApproval(allowance < amountIn);
        }
      } catch (e) {
        setQuote(null);
        setStatus(`Quote failed: ${e.shortMessage || e.message}`);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [amount, fromToken, address]);

  // ── Approve USDC for router ────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!address || !extensionWallet) return;
    setApproving(true);
    setStatus("Approving USDC…");
    try {
      const provider = window.ethereum;
      await ensureChain(provider);
      const wc = createWalletClient({ chain: arbitrumSepolia, transport: custom(provider) });
      const hash = await wc.writeContract({
        account: address, address: USDC, abi: ERC20_ABI,
        functionName: "approve",
        args: [ROUTER, parseUnits(amount, 6) * 10n],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setNeedsApproval(false);
      setStatus("✓ USDC approved");
    } catch (e) {
      setStatus(`✗ Approval failed: ${e.shortMessage || e.message}`);
    } finally {
      setApproving(false);
    }
  };

  // ── Execute swap ───────────────────────────────────────────────────────────
  const handleSwap = async () => {
    if (!address || !extensionWallet || !amount || !quote) return;
    setSwapping(true);
    setStatus("Confirm in wallet…");
    try {
      const provider = window.ethereum;
      await ensureChain(provider);
      const wc = createWalletClient({ chain: arbitrumSepolia, transport: custom(provider) });

      const isEthIn  = fromToken === "ETH";
      const amountIn = isEthIn ? parseEther(amount) : parseUnits(amount, 6);
      const slippage = 50n; // 0.5%
      const amountOutMin = isEthIn
        ? parseUnits(quote, 6) * (1000n - slippage) / 1000n
        : parseEther(quote)   * (1000n - slippage) / 1000n;

      const params = {
        tokenIn:           isEthIn ? WETH : USDC,
        tokenOut:          isEthIn ? USDC : WETH,
        fee:               FEE,
        recipient:         address,
        amountIn,
        amountOutMinimum:  amountOutMin,
        sqrtPriceLimitX96: 0n,
      };

      const hash = await wc.writeContract({
        account:  address,
        address:  ROUTER,
        abi:      ROUTER_ABI,
        functionName: "exactInputSingle",
        args:     [params],
        value:    isEthIn ? amountIn : 0n,
      });

      setStatus("Waiting for confirmation…");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(`✓ Swap confirmed! Tx: ${hash.slice(0, 10)}…`);
      setAmount("");
      setQuote(null);
      await fetchBalances();
    } catch (e) {
      setStatus(`✗ Swap failed: ${e.shortMessage || e.message}`);
    } finally {
      setSwapping(false);
    }
  };

  const flip = () => { setFromToken(toToken); setAmount(""); setQuote(null); setStatus(""); };

  const inputStyle = {
    backgroundColor: bgElev, border: `1px solid ${border}`,
    color: textColor, borderRadius: "0.75rem",
    padding: "0.75rem 1rem", width: "100%", outline: "none", fontSize: "1.1rem",
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: textColor }}>Swap</h2>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: bgElev, color: muted }}>
            Arbitrum Sepolia · Uniswap V3
          </span>
        </div>

        {/* From */}
        <div className="rounded-xl p-4 mb-2" style={{ backgroundColor: bgElev }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: muted }}>You pay</span>
            {authenticated && (
              <button
                className="text-xs cursor-pointer"
                style={{ color: accent }}
                onClick={() => setAmount(fromToken === "ETH" ? (parseFloat(ethBal || 0) * 0.99).toFixed(6) : parseFloat(usdcBal || 0).toFixed(2))}
              >
                Max: {fromToken === "ETH"
                  ? `${parseFloat(ethBal || 0).toFixed(4)} ETH`
                  : `${parseFloat(usdcBal || 0).toFixed(2)} USDC`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...inputStyle, flex: 1, backgroundColor: "transparent", border: "none", padding: "0", fontSize: "1.5rem", fontWeight: 600 }}
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
              style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <span className="text-sm font-bold" style={{ color: textColor }}>{fromToken}</span>
            </div>
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center my-1">
          <button
            onClick={flip}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:rotate-180"
            style={{ backgroundColor: bgElev, border: `1px solid ${border}`, color: muted, transition: "transform 0.3s" }}
          >
            ↕
          </button>
        </div>

        {/* To */}
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: bgElev }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: muted }}>You receive</span>
            {authenticated && (
              <span className="text-xs" style={{ color: muted }}>
                Balance: {toToken === "ETH"
                  ? `${parseFloat(ethBal || 0).toFixed(4)} ETH`
                  : `${parseFloat(usdcBal || 0).toFixed(2)} USDC`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold" style={{ color: quote ? textColor : muted }}>
              {quote ? parseFloat(quote).toFixed(toToken === "USDC" ? 2 : 6) : "0.0"}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
              style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <span className="text-sm font-bold" style={{ color: textColor }}>{toToken}</span>
            </div>
          </div>
        </div>

        {/* Rate */}
        {quote && amount && (
          <div className="flex justify-between text-xs mb-4 px-1" style={{ color: muted }}>
            <span>Rate</span>
            <span style={{ color: textColor }}>
              1 {fromToken} ≈ {(parseFloat(quote) / parseFloat(amount)).toFixed(toToken === "USDC" ? 2 : 6)} {toToken}
            </span>
          </div>
        )}

        {/* Info row */}
        <div className="flex justify-between text-xs mb-4 px-1" style={{ color: muted }}>
          <span>Slippage</span><span style={{ color: textColor }}>0.5%</span>
        </div>
        <div className="flex justify-between text-xs mb-5 px-1" style={{ color: muted }}>
          <span>Pool fee</span><span style={{ color: textColor }}>0.3%</span>
        </div>

        {/* Approve button (USDC → ETH only) */}
        {needsApproval && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-40 mb-3 transition-all"
            style={{ backgroundColor: accent, color: "#fff" }}
          >
            {approving ? "Approving…" : "Approve USDC"}
          </button>
        )}

        {/* Swap / Connect button */}
        {!authenticated ? (
          <button
            onClick={login}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer transition-all"
            style={{ backgroundColor: accent, color: "#fff" }}
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={swapping || !amount || !quote || needsApproval || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-40 transition-all"
            style={{
              backgroundColor: swapping || !quote ? bgElev : accent,
              color: swapping || !quote ? muted : "#fff",
            }}
          >
            {swapping ? "Swapping…" : !amount ? "Enter amount" : !quote ? "Getting quote…" : `Swap ${fromToken} → ${toToken}`}
          </button>
        )}

        {/* Status message */}
        {status && (
          <div className="mt-3 text-xs text-center" style={{ color: status.startsWith("✓") ? "#4ade80" : status.startsWith("✗") ? "#f87171" : muted }}>
            {status}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-4 text-xs text-center" style={{ color: muted }}>
          Swap ETH → USDC to fund your Ostium trading account
        </p>
      </div>
    </div>
  );
}
