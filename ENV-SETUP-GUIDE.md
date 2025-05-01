# Environment Variables Setup Guide

Your application requires certain environment variables to function correctly, especially for features that use external APIs like OpenAI.

## Issue Detected

The application cannot find the `OPENAI_API_KEY` environment variable, which is needed for the Ben Graham investment strategy analysis.

## How to Fix

### Step 1: Create a .env.local file

Create a file named `.env.local` in the root directory of your project (in the `ai-hedge-fund` folder).

```
cd ai-hedge-fund
touch .env.local
```

### Step 2: Add your OpenAI API Key

Edit the `.env.local` file and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your_actual_api_key_here
```

Replace `sk-your_actual_api_key_here` with your actual OpenAI API key.

### Step 3: Get an OpenAI API Key (if you don't have one)

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it will only be shown once)

### Step 4: Add Other Required Environment Variables

For full functionality, you should also set these variables in your `.env.local` file:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Step 5: Restart Your Development Server

After creating or updating the `.env.local` file, restart your Next.js development server:

```
npm run dev
```

## Verifying Setup

Run the verification script to check if your OpenAI API key is correctly set:

```
node check-openai-key.js
```

You should see a message confirming that the key is valid.

## Troubleshooting

If you're still having issues:

1. **Make sure the file is named correctly**: `.env.local` (including the dot at the beginning)
2. **Check for typos**: The variable name must be exactly `OPENAI_API_KEY`
3. **No quotes needed**: Don't put quotes around your API key value
4. **Restart completely**: Sometimes you need to stop the server with Ctrl+C and start it again
5. **Check for whitespace**: Ensure there are no extra spaces before or after the API key

## Code Change Alternative

If you prefer not to use an API key, you can modify `ai-hedge-fund/agents/benGraham.ts` to use the basic algorithm instead of OpenAI. Find the condition checking for the API key (around line 84) and modify it to always use the basic algorithm. 