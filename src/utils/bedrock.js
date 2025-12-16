import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock client
const getBedrockClient = () => {
  return new BedrockRuntimeClient({
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });
};

export const analyzeTradeProposal = async ({
  description,
  amount,
  trader,
  status,
}) => {
  try {
    const client = getBedrockClient();

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

    return {
      success: true,
      analysis: responseBody.content[0].text,
    };
  } catch (error) {
    console.error("Error analyzing trade:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze trade proposal",
    };
  }
};
