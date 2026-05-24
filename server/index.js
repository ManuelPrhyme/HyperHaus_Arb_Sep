import "dotenv/config";
import express from "express";
import cors from "cors";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { OstiumSubgraphClient, OstiumClient } from "@ostium/builder-sdk";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Ostium client (singleton) ────────────────────────────────────────────────
let ostium = null;
async function getOstium() {
  if (!ostium) ostium = await OstiumSubgraphClient.create({ testnet: true });
  return ostium;
}

// ── Bedrock client ───────────────────────────────────────────────────────────
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ── Helper ───────────────────────────────────────────────────────────────────
const ok  = (res, data) => res.json({ success: true,  ...data });
const err = (res, e, status=500) => {
  console.error(e);
  res.status(status).json({ success: false, error: e.message || String(e) });
};

// ════════════════════════════════════════════════════════════════════════════
//  OSTIUM — READ ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/ostium/pairs
// Returns all trading pairs with live prices, OI, rollover rates
app.get("/api/ostium/pairs", async (req, res) => {
  try {
    const client = await getOstium();
    const pairIds = req.query.pairIds
      ? req.query.pairIds.split(",")
      : undefined;
    const { pairs } = await client.getPairs(pairIds ? { pairIds } : undefined);
    ok(res, { pairs });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/prices
// Returns live mid/bid/ask for all pairs keyed by pairId
app.get("/api/ostium/prices", async (req, res) => {
  try {
    const client = await getOstium();
    const { prices } = await client.getAllPrices();
    ok(res, { prices });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/candles?pairId=0&resolution=15&from=<ms>
app.get("/api/ostium/candles", async (req, res) => {
  try {
    const { pairId = "0", resolution = "15", from } = req.query;
    if (!from) return res.status(400).json({ success: false, error: "from is required" });
    const client  = await getOstium();
    const candles = await client.getCandles({
      pairId,
      resolution,
      from: Number(from),
    });
    ok(res, { candles });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/orderbook?pairId=0&levels=8
app.get("/api/ostium/orderbook", async (req, res) => {
  try {
    const { pairId = "0", levels = "8" } = req.query;
    const client    = await getOstium();
    const orderbook = await client.getSimOrderbook({ pairId, levels: Number(levels) });
    ok(res, { orderbook });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/positions?user=0x...
app.get("/api/ostium/positions", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ success: false, error: "user is required" });
    const client = await getOstium();
    const result = await client.getOpenPositions({ user });
    ok(res, {
      positions:     result.pairPositions.map((pp) => pp.position),
      marginSummary: result.marginSummary,
    });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/orders?user=0x...
app.get("/api/ostium/orders", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ success: false, error: "user is required" });
    const client = await getOstium();
    const orders = await client.getOpenOrders({ user });
    ok(res, { orders });
  } catch (e) { err(res, e); }
});

// GET /api/ostium/fills?user=0x...&limit=50
app.get("/api/ostium/fills", async (req, res) => {
  try {
    const { user, limit = "50" } = req.query;
    if (!user) return res.status(400).json({ success: false, error: "user is required" });
    const client = await getOstium();
    const fills  = await client.getFills({ user, limit: Number(limit) });
    ok(res, { fills });
  } catch (e) { err(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  OSTIUM — PRICE STREAM (SSE)
//  GET /api/ostium/stream?pairIds=0,1,2
//  Streams live price ticks as Server-Sent Events
// ════════════════════════════════════════════════════════════════════════════
app.get("/api/ostium/stream", async (req, res) => {
  const pairIds = req.query.pairIds
    ? req.query.pairIds.split(",").map(Number)
    : [];

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  let stream;
  try {
    const client = await getOstium();
    stream = client.streamPrices(pairIds.length ? pairIds : undefined);

    stream.onSnapshot((ticks) => {
      res.write(`event: snapshot\ndata: ${JSON.stringify(ticks)}\n\n`);
    });

    stream.onTick((tick) => {
      res.write(`event: tick\ndata: ${JSON.stringify(tick)}\n\n`);
    });

    stream.onError((e) => {
      res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
    });
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
    return res.end();
  }

  req.on("close", () => {
    stream?.close();
    res.end();
  });
});

// GET /api/ostium/balances?user=0x...
// Returns USDC balance, ETH balance and current USDC allowance
app.get("/api/ostium/balances", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ success: false, error: "user is required" });
    // Use Circle USDC (0x75faf114...) — the token Ostium testnet accepts
    const client   = await OstiumClient.createSelfAndSelf({ traderAddress: user, testnet: true });
    const raw      = await client.getBalances(user);
    // Override usdc field with Circle USDC balance read directly
    const { createPublicClient, http, formatUnits } = await import("viem");
    const { arbitrumSepolia } = await import("viem/chains");
    const CIRCLE_USDC = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
    const TRADING_STORAGE = "0x0b9f5243b29938668c9cfbd7557a389ec7ef88b8";
    const ERC20_ABI = [
      { name: "balanceOf", type: "function", stateMutability: "view",
        inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
      { name: "allowance", type: "function", stateMutability: "view",
        inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
        outputs: [{ name: "", type: "uint256" }] },
    ];
    const pc = createPublicClient({ chain: arbitrumSepolia, transport: http("https://sepolia-rollup.arbitrum.io/rpc") });
    const [usdcRaw, allowanceRaw] = await Promise.all([
      pc.readContract({ address: CIRCLE_USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [user] }),
      pc.readContract({ address: CIRCLE_USDC, abi: ERC20_ABI, functionName: "allowance", args: [user, TRADING_STORAGE] }),
    ]);
    ok(res, { balances: {
      usdc:      formatUnits(usdcRaw, 6),
      eth:       raw.eth,
      allowance: formatUnits(allowanceRaw, 6),
    }});
  } catch (e) { err(res, e); }
});

// POST /api/ostium/build/approve
// Builds an unsigned USDC approval tx for the TradingStorage contract
app.post("/api/ostium/build/approve", async (req, res) => {
  try {
    const { traderAddress, amount = "max" } = req.body;
    if (!traderAddress) return res.status(400).json({ success: false, error: "traderAddress required" });
    // Build approve tx for Circle USDC directly
    const { encodeFunctionData, parseUnits, maxUint256 } = await import("viem");
    const CIRCLE_USDC    = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
    const TRADING_STORAGE = "0x0b9f5243b29938668c9cfbd7557a389ec7ef88b8";
    const approveAmount  = amount === "max" ? maxUint256 : parseUnits(String(amount), 6);
    const data = encodeFunctionData({
      abi: [{ name: "approve", type: "function", stateMutability: "nonpayable",
        inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
        outputs: [{ name: "", type: "bool" }] }],
      functionName: "approve",
      args: [TRADING_STORAGE, approveAmount],
    });
    ok(res, { tx: { to: CIRCLE_USDC, data, value: "0" } });
  } catch (e) { err(res, e); }
});


// POST /api/ostium/build/open
app.post("/api/ostium/build/open", async (req, res) => {
  try {
    const {
      traderAddress, pairId, buy, price,
      collateral, leverage, type,
      takeProfit, stopLoss,
    } = req.body;

    if (!traderAddress) return res.status(400).json({ success: false, error: "traderAddress required" });
    if (!pairId)        return res.status(400).json({ success: false, error: "pairId required" });
    if (!collateral || parseFloat(collateral) < 5)
      return res.status(400).json({ success: false, error: "collateral must be >= 5 USD" });

    // Fetch live price from Ostium if not provided
    let execPrice = price;
    if (!execPrice) {
      const subgraph = await getOstium();
      const { prices } = await subgraph.getAllPrices();
      const px = prices[String(pairId)];
      execPrice = buy ? px?.ask : px?.bid;
      if (!execPrice) return res.status(400).json({ success: false, error: "No price available" });
    }

    const client = await OstiumClient.createSelfAndSelf({ traderAddress, testnet: true });
    const tx = client.getOpenTradeTx({
      pairId,
      buy:        Boolean(buy),
      price:      String(execPrice),
      collateral: String(collateral),
      leverage:   String(leverage || "10"),
      type:       type || "market",
      takeProfit: takeProfit ? String(takeProfit) : undefined,
      stopLoss:   stopLoss   ? String(stopLoss)   : undefined,
    });

    ok(res, {
      tx: {
        to:    tx.to,
        data:  tx.data,
        value: tx.value?.toString() ?? "0",
      },
      execPrice: String(execPrice),
    });
  } catch (e) { err(res, e); }
});

// POST /api/ostium/build/close
app.post("/api/ostium/build/close", async (req, res) => {
  try {
    const { traderAddress, pairId, idx, closePercent = 100 } = req.body;
    if (!traderAddress) return res.status(400).json({ success: false, error: "traderAddress required" });

    const subgraph = await getOstium();
    const { prices } = await subgraph.getAllPrices();
    const midPx = prices[String(pairId)]?.mid;
    if (!midPx) return res.status(400).json({ success: false, error: "No price available for pair" });

    const client = await OstiumClient.createSelfAndSelf({ traderAddress, testnet: true });
    const tx = client.getCloseTradeTx({
      pairId,
      idx:            Number(idx),
      price:          String(midPx),
      closePercent:   Number(closePercent),
      checkAllowance: false,
    });

    ok(res, {
      tx: {
        to:    tx.to,
        data:  tx.data,
        value: tx.value?.toString() ?? "0",
      },
      execPrice: String(midPx),
    });
  } catch (e) { err(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  BEDROCK — AI TRADE ANALYSIS
// ════════════════════════════════════════════════════════════════════════════
app.post("/api/analyze-trade", async (req, res) => {
  try {
    const { description, amount, trader, status } = req.body;

    const prompt = `You are a crypto trading analyst. Analyze this trade proposal:

Description: ${description}
Amount: ${amount} ETH
Trader: ${trader}
Status: ${status}

Provide a concise analysis covering:
1. Risk Assessment (Low/Medium/High)
2. Key Considerations
3. Recommendation (Approve/Reject/Caution)

Keep the response under 200 words.`;

    const command = new InvokeModelCommand({
      modelId:     "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept:      "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const response     = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    ok(res, { analysis: responseBody.content[0].text });
  } catch (e) { err(res, e); }
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", services: ["bedrock", "ostium"] });
});

const server = app.listen(PORT, () => {
  console.log(`HyperHaus server running on http://localhost:${PORT}`);
  getOstium()
    .then(() => console.log("Ostium subgraph client ready"))
    .catch((e) => console.error("Ostium init failed:", e.message));
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`Port ${PORT} in use — kill the existing process or set a different PORT in .env`);
    process.exit(1);
  } else {
    throw e;
  }
});
