// YouTube API Service for G.R.O.W Education Platform
// Handles video uploads, metadata management, and channel operations

import { supabase } from './supabaseClient';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  season: number;
  episode: number;
  language: string;
  tags: string[];
  categoryId: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  googleDriveFileId: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  privacyStatus: string;
}

class YouTubeApiService {
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private channelId: string | null = null;

  constructor() {
    // Initialize with environment variables
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || null;
    this.channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || null;
  }

  // Set OAuth2 access token
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Set channel ID
  setChannelId(channelId: string) {
    this.channelId = channelId;
  }

  // Get OAuth2 authorization URL
  getAuthUrl(): string {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
           `client_id=${clientId}&` +
           `redirect_uri=${encodeURIComponent(redirectUri)}&` +
           `scope=${encodeURIComponent(scope)}&` +
           `response_type=code&` +
           `access_type=offline&` +
           `prompt=consent`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const redirectUri = `${window.location.origin}/auth/callback`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    return data.access_token;
  }

  // Get user's YouTube channel ID
  async getChannelId(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message}`);
    }

    if (data.items && data.items.length > 0) {
      this.channelId = data.items[0].id;
      return this.channelId;
    }

    throw new Error('No YouTube channel found for this account.');
  }

  // Get existing videos from YouTube channel
  async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    if (!this.channelId) {
      await this.getChannelId();
    }

    const videos: YouTubeVideo[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('channelId', this.channelId!);
      url.searchParams.set('type', 'video');
      url.searchParams.set('order', 'date');
      url.searchParams.set('maxResults', maxResults.toString());
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`YouTube API error: ${data.error.message}`);
      }

      // Get detailed video information for each video
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&id=${videoIds}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            },
          }
        );

        const detailsData = await detailsResponse.json();
        
        if (detailsData.items) {
          for (const video of detailsData.items) {
            videos.push({
              id: video.id,
              title: video.snippet.title,
              description: video.snippet.description,
              publishedAt: video.snippet.publishedAt,
              thumbnails: video.snippet.thumbnails,
              duration: video.contentDetails?.duration,
              viewCount: video.statistics?.viewCount,
              likeCount: video.statistics?.likeCount,
              privacyStatus: video.status?.privacyStatus,
            });
          }
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken && videos.length < maxResults);

    return videos;
  }

  // Extract metadata from video title and description
  extractMetadata(video: YouTubeVideo): Partial<VideoMetadata> {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // Extract season and episode numbers
    const seasonMatch = title.match(/season\s*(\d+)/i) || description.match(/season\s*(\d+)/i);
    const episodeMatch = title.match(/episode\s*(\d+)/i) || description.match(/episode\s*(\d+)/i);
    
    // Extract language
    const languages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'dutch'];
    const detectedLanguage = languages.find(lang => 
      title.includes(lang) || description.includes(lang)
    ) || 'english';
    
    // Extract tags
    const tags: string[] = [];
    const tagKeywords = ['agriculture', 'farming', 'soil', 'crop', 'fertilizer', 'irrigation'];
    tagKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return {
      title: video.title,
      description: video.description,
      season: seasonMatch ? parseInt(seasonMatch[1]) : 1,
      episode: episodeMatch ? parseInt(episodeMatch[1]) : 1,
      language: detectedLanguage,
      tags,
      privacyStatus: video.privacyStatus as 'private' | 'unlisted' | 'public',
    };
  }

  // Download video from Google Drive
  async downloadFromDrive(fileId: string): Promise<Blob> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Upload video to YouTube
  async uploadVideo(
    metadata: VideoMetadata,
    videoBlob: Blob,
    onProgress?: (progress: { status: string; progress: number; error?: string }) => void
  ): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      onProgress?.({ status: 'uploading', progress: 0 });

      // Create form data for upload
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify({
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.categoryId || '27', // Education category
        },
        status: {
          privacyStatus: metadata.privacyStatus,
        },
      })], { type: 'application/json' }));
      formData.append('video', videoBlob);

      // Upload to YouTube
      const response = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      onProgress?.({ status: 'completed', progress: 100 });

      return data.id;
    } catch (error) {
      onProgress?.({ 
        status: 'failed', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      return null;
    }
  }

  // Update video privacy status
  async updateVideoPrivacy(videoId: string, privacyStatus: 'private' | 'unlisted' | 'public'): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: videoId,
            status: {
              privacyStatus: privacyStatus,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Privacy update failed: ${errorData.error?.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update video privacy:', error);
      return false;
    }
  }

  // Bulk upload videos
  async bulkUpload(
    videos: VideoMetadata[],
    onProgress?: (videoId: string, progress: { status: string; progress: number; error?: string }) => void
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const video of videos) {
      try {
        // Download from Google Drive
        const videoBlob = await this.downloadFromDrive(video.googleDriveFileId);
        
        // Upload to YouTube
        const youtubeId = await this.uploadVideo(video, videoBlob, (progress) => {
          onProgress?.(video.id, progress);
        });

        if (youtubeId) {
          success.push(video.id);
          
          // Save to database
          await supabase.from('videos').upsert({
            id: video.id,
            youtube_id: youtubeId,
            title: video.title,
            description: video.description,
            season: video.season,
            episode: video.episode,
            language: video.language,
            tags: video.tags,
            privacy_status: video.privacyStatus,
            upload_status: 'completed',
          });
        } else {
          failed.push(video.id);
        }
      } catch (error) {
        failed.push(video.id);
        onProgress?.(video.id, { 
          status: 'failed', 
          progress: 0, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        });
      }
    }

    return { success, failed };
  }

  // Parse ISO 8601 duration to readable format
  parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}

// Export singleton instance
export const youtubeApiService = new YouTubeApiService(); 