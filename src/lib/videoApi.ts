// Video Management API Service
// Handles CRUD operations for videos and integration with YouTube API

import { supabase } from './supabaseClient';

export interface Video {
  id: string;
  title: string;
  description: string;
  season: number;
  episode: number;
  language: string;
  tags: string[];
  category_id: string;
  privacy_status: 'private' | 'unlisted' | 'public';
  google_drive_file_id: string;
  youtube_video_id?: string;
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed';
  upload_date?: string;
  duration?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalytics {
  id: string;
  video_id: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  watch_time_minutes: number;
  last_updated: string;
}

export interface VideoPlaylist {
  id: string;
  name: string;
  description?: string;
  season?: number;
  language?: string;
  created_at: string;
  updated_at: string;
}

class VideoApiService {
  // Get all videos with optional filters
  async getVideos(filters?: {
    season?: number;
    episode?: number;
    language?: string;
    upload_status?: string;
  }): Promise<Video[]> {
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .order('season', { ascending: true })
        .order('episode', { ascending: true });

      if (filters?.season) {
        query = query.eq('season', filters.season);
      }
      if (filters?.episode) {
        query = query.eq('episode', filters.episode);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }
      if (filters?.upload_status) {
        query = query.eq('upload_status', filters.upload_status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      return [];
    }
  }

  // Get video by ID
  async getVideoById(id: string): Promise<Video | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching video:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch video:', error);
      return null;
    }
  }

  // Create new video
  async createVideo(videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create video:', error);
      return null;
    }
  }

  // Update video
  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update video:', error);
      return null;
    }
  }

  // Delete video
  async deleteVideo(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting video:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  // Search videos
  async searchVideos(query: string): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('season', { ascending: true })
        .order('episode', { ascending: true });

      if (error) {
        console.error('Error searching videos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search videos:', error);
      return [];
    }
  }

  // Get unique seasons
  async getUniqueSeasons(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('season')
        .order('season', { ascending: true });

      if (error) {
        console.error('Error fetching seasons:', error);
        return [];
      }

      const seasons = [...new Set(data?.map(item => item.season))];
      return seasons.sort((a, b) => a - b);
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
      return [];
    }
  }

  // Get unique languages
  async getUniqueLanguages(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('language')
        .order('language', { ascending: true });

      if (error) {
        console.error('Error fetching languages:', error);
        return [];
      }

      const languages = [...new Set(data?.map(item => item.language))];
      return languages.sort();
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      return [];
    }
  }

  // Get unique episodes
  async getUniqueEpisodes(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('episode')
        .order('episode', { ascending: true });

      if (error) {
        console.error('Error fetching episodes:', error);
        return [];
      }

      const episodes = [...new Set(data?.map(item => item.episode))];
      return episodes.sort((a, b) => a - b);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      return [];
    }
  }

  // Get video analytics
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .eq('video_id', videoId)
        .single();

      if (error) {
        console.error('Error fetching video analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch video analytics:', error);
      return null;
    }
  }

  // Get video playlists
  async getVideoPlaylists(): Promise<VideoPlaylist[]> {
    try {
      const { data, error } = await supabase
        .from('video_playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching video playlists:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch video playlists:', error);
      return [];
    }
  }
}

export const videoApiService = new VideoApiService(); 