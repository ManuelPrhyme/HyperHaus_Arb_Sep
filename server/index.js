import express from "express";
import cors from "cors";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Analyze trade proposal endpoint
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
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    res.json({
      success: true,
      analysis: responseBody.content[0].text,
    });
  } catch (error) {
    console.error("Error analyzing trade:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze trade proposal",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Bedrock API server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
