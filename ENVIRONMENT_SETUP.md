# Environment Variables Setup

## Create .env file in your project root:

```env
# Google OAuth2 Credentials
# Get these from Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here

# YouTube API Key (optional - for additional features)
# Get this from Google Cloud Console → APIs & Services → Credentials → API Keys
VITE_YOUTUBE_API_KEY=your_api_key_here

# YouTube Channel ID (optional - will be auto-detected)
# You can find this in your YouTube channel URL or it will be detected automatically
VITE_YOUTUBE_CHANNEL_ID=your_channel_id_here

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to get the credentials:

### 1. Google Client ID & Secret:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth 2.0 Client IDs"**
5. Application type: **Web application**
6. Name: `G.R.O.W YouTube Integration`
7. **Authorized redirect URIs:**
   - `http://localhost:8082/auth/callback`
   - `http://localhost:8082/`
8. Click **"Create"**
9. Copy the **Client ID** and **Client Secret**

### 2. YouTube API Key (Optional):
1. In Google Cloud Console → **APIs & Services → Credentials**
2. Click **"Create Credentials" → "API Key"**
3. Copy the API key

### 3. YouTube Channel ID (Optional):
1. Go to your YouTube channel
2. The URL will be like: `https://www.youtube.com/channel/UCxxxxxxxxxx`
3. Copy the part after `/channel/`

## After setting up .env:

1. Restart your development server: `npm run dev`
2. Go to Video Upload Manager
3. Test the YouTube integration 