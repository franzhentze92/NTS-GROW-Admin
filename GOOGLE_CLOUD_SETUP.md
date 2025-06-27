# Google Cloud & YouTube API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `G.R.O.W Education Platform`
4. Click "Create"

## Step 2: Enable Required APIs

1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **YouTube Data API v3**
   - **YouTube Upload API**
   - **Google Drive API**

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Name: `G.R.O.W YouTube Integration`
5. Authorized redirect URIs:
   - `http://localhost:8082/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
6. Click "Create"
7. **Save the Client ID and Client Secret**

## Step 4: Create API Key (Optional)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. **Save the API Key**

## Step 5: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Google OAuth2 Credentials
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here

# YouTube API Key (optional)
VITE_YOUTUBE_API_KEY=your_api_key_here

# YouTube Channel ID (optional - will be auto-detected)
VITE_YOUTUBE_CHANNEL_ID=your_channel_id_here
```

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Go to Video Upload Manager
3. Click "Authenticate with YouTube"
4. Complete OAuth flow
5. Test fetching videos from your channel

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Make sure the redirect URI in Google Cloud matches exactly
   - Include protocol (http/https) and port number

2. **"API not enabled"**
   - Ensure YouTube Data API v3 is enabled
   - Check API quotas in Google Cloud Console

3. **"Access denied"**
   - Verify OAuth consent screen is configured
   - Check if app is in testing mode

### API Quotas:

- YouTube Data API: 10,000 units/day (free tier)
- Each video fetch: ~1-5 units
- Each upload: ~1,600 units

## Security Notes:

- Never commit `.env` file to version control
- Use environment variables in production
- Restrict API key to specific domains/IPs
- Regularly rotate credentials

## Production Deployment:

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Configure proper CORS settings
4. Set up monitoring for API usage 