# Bedrock AI Analysis Server

This backend server provides AI-powered trade proposal analysis using Amazon Bedrock.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure AWS Credentials

Create a `.env` file in the `server` directory:
```bash
cp .env.example .env
```

Edit `.env` and add your AWS credentials:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
PORT=3001
```

### 3. AWS Bedrock Setup

1. Log into AWS Console
2. Navigate to Amazon Bedrock
3. Go to "Model access" in the left sidebar
4. Request access to "Claude 3 Haiku" (or another model)
5. Wait for approval (usually instant for Haiku)

### 4. IAM Permissions

Your AWS user needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5. Start the Server
```bash
npm start
```

The server will run on http://localhost:3001

### 6. Start the Frontend
In the root directory:
```bash
npm run dev
```

## Testing

Test the API endpoint:
```bash
curl -X POST http://localhost:3001/api/analyze-trade \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Buy ETH at current price",
    "amount": "1.5",
    "trader": "0x1234...",
    "status": "Pending"
  }'
```

## Troubleshooting

- **Error: "Access denied"** - Check IAM permissions
- **Error: "Model not found"** - Request model access in Bedrock console
- **Error: "Region not supported"** - Use us-east-1 or us-west-2
- **CORS errors** - Ensure frontend URL matches CORS settings

## Cost Estimate

Claude 3 Haiku pricing (as of 2024):
- Input: ~$0.25 per 1M tokens
- Output: ~$1.25 per 1M tokens
- Average analysis: ~$0.001 per request

Very affordable for testing and production use.
