# AWS Bedrock Frontend Integration Setup

This guide shows how to set up direct AWS Bedrock integration in your React frontend.

## Prerequisites

1. AWS Account
2. AWS IAM user with Bedrock access

## Setup Steps

### 1. AWS Bedrock Configuration

1. **Log into AWS Console**
2. **Navigate to Amazon Bedrock** (search for "Bedrock" in services)
3. **Enable Model Access:**
   - Click "Model access" in the left sidebar
   - Click "Manage model access" button
   - Select "Claude 3 Haiku" (recommended for cost-effectiveness)
   - Click "Request model access"
   - Wait for approval (usually instant)

### 2. Create IAM User

1. **Go to IAM Console**
2. **Create new user:**
   - Click "Users" → "Create user"
   - Name: `bedrock-frontend-user`
   - Select "Access key - Programmatic access"
3. **Attach permissions:**
   - Click "Attach policies directly"
   - Create inline policy with this JSON:
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
4. **Save credentials:**
   - Copy Access Key ID
   - Copy Secret Access Key
   - **IMPORTANT:** Save these securely, you won't see them again!

### 3. Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**
   ```
   VITE_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   VITE_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   VITE_AWS_REGION=us-east-1
   ```

### 4. Start the Application

```bash
npm run dev
```

## Usage

1. Navigate to any Guild Details page
2. Look for trade proposals in the chat
3. Click the "Analyse" button on any proposal
4. The AI analysis will appear in the modal

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use IAM user with minimal permissions** - Only `bedrock:InvokeModel`
3. **For production:**
   - Use AWS Cognito for authentication
   - Call Bedrock from a backend API
   - Never expose AWS credentials in frontend code
   - Use environment-specific credentials

## Cost Estimate

**Claude 3 Haiku Pricing (as of Dec 2024):**
- Input: ~$0.25 per 1M tokens
- Output: ~$1.25 per 1M tokens
- Average analysis: ~$0.001 per request

Very affordable for development and testing!

## Troubleshooting

### Error: "Access Denied"
- Check IAM permissions are correct
- Verify credentials in `.env` file
- Ensure model access is approved in Bedrock console

### Error: "Model not found"
- Request access to Claude 3 Haiku in Bedrock console
- Wait for approval (usually instant)

### Error: "Region not supported"
- Use `us-east-1` or `us-west-2`
- Update `VITE_AWS_REGION` in `.env`

### Error: "Credentials not found"
- Verify `.env` file exists in root directory
- Check variable names start with `VITE_`
- Restart dev server after changing `.env`

## Alternative Models

You can use other models by changing the `modelId` in `src/utils/bedrock.js`:

- **Claude 3 Haiku:** `anthropic.claude-3-haiku-20240307-v1:0` (fastest, cheapest)
- **Claude 3 Sonnet:** `anthropic.claude-3-sonnet-20240229-v1:0` (balanced)
- **Claude 3 Opus:** `anthropic.claude-3-opus-20240229-v1:0` (most capable, expensive)
- **Amazon Titan:** `amazon.titan-text-express-v1` (AWS native)

## Support

For AWS Bedrock documentation:
https://docs.aws.amazon.com/bedrock/

For issues with this integration, check the browser console for detailed error messages.
