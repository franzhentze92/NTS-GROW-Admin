# 🔧 Supabase Setup Guide

## Get Your Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Go to Settings → API**
4. **Copy these values:**

### Project URL
- Look for **"Project URL"** 
- Copy the full URL (e.g., `https://your-project-id.supabase.co`)

### Anon/Public Key
- Look for **"anon public"** key
- Copy the long string starting with `eyJ...`

## Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Google OAuth2 Credentials
VITE_GOOGLE_CLIENT_ID=1071581877805-bdkoj2afepfe43q8omb12rpsga8n5vkt.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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

# YouTube API Key (optional)
VITE_YOUTUBE_API_KEY=your_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## After Updating .env

1. **Restart your development server:** `npm run dev`
2. **Try logging in again** - it should work now!

## If You Don't Have Supabase

If you don't have a Supabase project yet:

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up for free**
3. **Create a new project**
4. **Follow the steps above to get credentials**

## Temporary Solution

If you want to test the YouTube integration without Supabase for now, the mock client will allow you to:
- ✅ Test the login (with mock user)
- ✅ Test YouTube authentication
- ✅ Test video importing
- ❌ Database operations will fail (but won't break the app) 