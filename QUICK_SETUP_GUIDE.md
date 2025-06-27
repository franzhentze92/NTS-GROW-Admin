# 🚀 Quick Setup Guide - YouTube Integration

Since you already have a Google Cloud project, here's what you need to do:

## 1. Enable APIs in Your Existing Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project
3. Go to **"APIs & Services" → "Library"**
4. Search and enable:
   - **YouTube Data API v3**
   - **Google Drive API**

## 2. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth 2.0 Client IDs"**
3. Application type: **Web application**
4. Name: `G.R.O.W YouTube Integration`
5. **Authorized redirect URIs:**
   - `http://localhost:8082/auth/callback`
   - `http://localhost:8082/`
6. Click **"Create"**
7. **Save the Client ID and Client Secret**

## 3. Create Environment File

Create a `.env` file in your project root:

```env
# Google OAuth2 Credentials
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here

# YouTube API Key (optional)
VITE_YOUTUBE_API_KEY=your_api_key_here

# YouTube Channel ID (optional - will be auto-detected)
VITE_YOUTUBE_CHANNEL_ID=your_channel_id_here

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Test the Integration

1. Start your development server: `npm run dev`
2. Go to: `http://localhost:8082/education/video-upload-manager`
3. Click **"Connect to YouTube"**
4. Complete the OAuth flow
5. Test fetching your channel videos

## 5. Features Available

✅ **YouTube Authentication** - OAuth2 flow with popup window  
✅ **Channel Video Fetching** - Get all videos from your channel  
✅ **Metadata Extraction** - Auto-detect season, episode, language  
✅ **Database Import** - Save video metadata to Supabase  
✅ **Embedded Playback** - Watch videos without leaving the platform  
✅ **Search & Filter** - Find videos by season, language, tags  

## 6. Next Steps

After testing the basic integration, you can:
- Upload videos from Google Drive to YouTube
- Bulk manage video privacy settings
- Create playlists and organize content
- Track video analytics

## Troubleshooting

**"Invalid redirect URI" error:**
- Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:8082/auth/callback`

**"API not enabled" error:**
- Go to Google Cloud Console → APIs & Services → Library
- Search for "YouTube Data API v3" and enable it

**"Client ID not found" error:**
- Check that your `.env` file has the correct `VITE_GOOGLE_CLIENT_ID`
- Restart your development server after adding environment variables 