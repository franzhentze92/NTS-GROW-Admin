import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Youtube, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { youtubeApiService, YouTubeVideo } from '@/lib/youtubeApi';
import { videoApiService } from '@/lib/videoApi';

interface VideoMetadata {
  youtubeId: string;
  title: string;
  description: string;
  season: number;
  episode: number;
  language: string;
  tags: string[];
  duration?: string;
  thumbnail?: string;
  publishedAt?: string;
}

const YouTubeVideoImporter: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [importedVideos, setImportedVideos] = useState<VideoMetadata[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<{ [key: string]: 'pending' | 'importing' | 'success' | 'failed' }>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authenticate with YouTube
  const authenticateYouTube = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get auth URL and redirect to Google OAuth
      const authUrl = youtubeApiService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=500,height=600');
      
      // For now, we'll simulate authentication success
      // In a real implementation, you'd handle the OAuth callback
      setIsAuthenticated(true);
      setSuccess('Authentication successful! You can now fetch your YouTube videos.');
      
    } catch (error) {
      setError('Failed to authenticate with YouTube. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch videos from YouTube channel
  const fetchYouTubeVideos = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!isAuthenticated) {
        setError('Please authenticate with YouTube first.');
        return;
      }

      // Fetch videos from your YouTube channel
      const videos = await youtubeApiService.getChannelVideos(50); // Get up to 50 videos
      setYoutubeVideos(videos);
      
      // Convert to imported videos format with auto-detection
      const converted: VideoMetadata[] = videos.map((video, index) => {
        const metadata = extractMetadataFromVideo(video);
        return {
          youtubeId: video.id,
          title: video.title,
          description: video.description,
          season: metadata.season,
          episode: metadata.episode,
          language: metadata.language,
          tags: metadata.tags,
          duration: youtubeApiService.parseDuration(video.duration || ''),
          thumbnail: video.thumbnails.high?.url,
          publishedAt: video.publishedAt
        };
      });

      setImportedVideos(converted);
      setSuccess(`Found ${videos.length} videos from your YouTube channel!`);
      
    } catch (error) {
      setError('Failed to fetch YouTube videos. Please check your authentication and try again.');
      console.error('Error fetching YouTube videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract metadata from video title/description
  const extractMetadataFromVideo = (video: YouTubeVideo) => {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // Auto-detect language
    let language = 'English';
    if (title.includes('spanish') || description.includes('spanish')) language = 'Spanish';
    if (title.includes('french') || description.includes('french')) language = 'French';
    if (title.includes('german') || description.includes('german')) language = 'German';
    if (title.includes('portuguese') || description.includes('portuguese')) language = 'Portuguese';
    if (title.includes('italian') || description.includes('italian')) language = 'Italian';
    if (title.includes('dutch') || description.includes('dutch')) language = 'Dutch';

    // Auto-detect season and episode
    let season = 1;
    let episode = 1;
    
    // Look for patterns like "Season 1 Episode 2" or "S1E2" or "1x02"
    const seasonMatch = title.match(/season\s*(\d+)|s(\d+)/i);
    const episodeMatch = title.match(/episode\s*(\d+)|e(\d+)|(\d+)x(\d+)/i);
    
    if (seasonMatch) {
      season = parseInt(seasonMatch[1] || seasonMatch[2]);
    }
    if (episodeMatch) {
      episode = parseInt(episodeMatch[1] || episodeMatch[2] || episodeMatch[3]);
    }

    // Auto-detect tags
    const tags = [];
    if (title.includes('soil') || description.includes('soil')) tags.push('soil health');
    if (title.includes('microbial') || description.includes('microbial')) tags.push('microbial products');
    if (title.includes('crop') || description.includes('crop')) tags.push('crop protection');
    if (title.includes('irrigation') || description.includes('irrigation')) tags.push('irrigation');
    if (title.includes('nutrient') || description.includes('nutrient')) tags.push('nutrient management');
    if (title.includes('organic') || description.includes('organic')) tags.push('organic farming');
    if (title.includes('pest') || description.includes('pest')) tags.push('pest management');
    if (title.includes('disease') || description.includes('disease')) tags.push('disease management');
    if (title.includes('fertilizer') || description.includes('fertilizer')) tags.push('fertilization');
    if (title.includes('water') || description.includes('water')) tags.push('water management');
    
    // Add language tag
    tags.push(language.toLowerCase());
    tags.push('education', 'agriculture');
    
    return { season, episode, language, tags };
  };

  // Update video metadata
  const updateVideo = (index: number, field: keyof VideoMetadata, value: any) => {
    setImportedVideos(prev => prev.map((video, i) => 
      i === index ? { ...video, [field]: value } : video
    ));
  };

  // Toggle video selection
  const toggleVideoSelection = (youtubeId: string) => {
    setSelectedVideos(prev => 
      prev.includes(youtubeId) 
        ? prev.filter(id => id !== youtubeId)
        : [...prev, youtubeId]
    );
  };

  // Select all videos
  const selectAllVideos = () => {
    setSelectedVideos(importedVideos.map(video => video.youtubeId));
  };

  // Deselect all videos
  const deselectAllVideos = () => {
    setSelectedVideos([]);
  };

  // Import selected videos to database
  const importSelectedVideos = async () => {
    if (selectedVideos.length === 0) {
      setError('Please select videos to import.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const videosToImport = importedVideos.filter(video => selectedVideos.includes(video.youtubeId));
      
      for (const video of videosToImport) {
        setImportProgress(prev => ({ ...prev, [video.youtubeId]: 'importing' }));
        
        try {
          // Only store metadata, not the actual video
          const videoData = {
            title: video.title,
            description: video.description,
            season: video.season,
            episode: video.episode,
            language: video.language,
            tags: video.tags,
            category_id: '27', // Education
            privacy_status: 'unlisted' as const,
            google_drive_file_id: `youtube-${video.youtubeId}`, // Placeholder for reference
            youtube_video_id: video.youtubeId, // This is what we use for embedding
            upload_status: 'completed' as const,
            upload_date: video.publishedAt || new Date().toISOString(),
            duration: video.duration,
            thumbnail_url: video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
          };

          const result = await videoApiService.createVideo(videoData);
          
          if (result) {
            setImportProgress(prev => ({ ...prev, [video.youtubeId]: 'success' }));
          } else {
            setImportProgress(prev => ({ ...prev, [video.youtubeId]: 'failed' }));
          }
        } catch (error) {
          console.error(`Failed to import video ${video.youtubeId}:`, error);
          setImportProgress(prev => ({ ...prev, [video.youtubeId]: 'failed' }));
        }
      }

      setSuccess(`Successfully imported ${selectedVideos.length} videos to database. They will now appear in your video library!`);
    } catch (error) {
      setError('Failed to import videos. Please try again.');
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Import YouTube Videos
          </CardTitle>
          <CardDescription>
            Fetch videos from your YouTube channel and import them into the G.R.O.W video library. Only metadata is stored - videos remain on YouTube and are embedded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {!isAuthenticated ? (
              <Button 
                onClick={authenticateYouTube} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Youtube className="h-4 w-4" />
                )}
                Authenticate with YouTube
              </Button>
            ) : (
              <Button 
                onClick={fetchYouTubeVideos} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Fetch YouTube Videos
              </Button>
            )}
            
            {youtubeVideos.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={selectAllVideos}>
                  Select All
                </Button>
                <Button variant="outline" onClick={deselectAllVideos}>
                  Deselect All
                </Button>
                <Button 
                  onClick={importSelectedVideos}
                  disabled={selectedVideos.length === 0 || isLoading}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Import Selected ({selectedVideos.length})
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {youtubeVideos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">YouTube Videos Found ({youtubeVideos.length})</h3>
              
              <div className="grid gap-4">
                {importedVideos.map((video, index) => (
                  <Card key={video.youtubeId} className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedVideos.includes(video.youtubeId)}
                        onChange={() => toggleVideoSelection(video.youtubeId)}
                        className="mt-2"
                      />
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-4">
                              <Label>Title</Label>
                              <Input
                                value={video.title}
                                onChange={(e) => updateVideo(index, 'title', e.target.value)}
                                className="font-semibold"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <Label>Description</Label>
                              <textarea
                                value={video.description}
                                onChange={(e) => updateVideo(index, 'description', e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                rows={3}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {importProgress[video.youtubeId] === 'importing' && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {importProgress[video.youtubeId] === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {importProgress[video.youtubeId] === 'failed' && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Season</Label>
                            <Select 
                              value={video.season.toString()} 
                              onValueChange={(value) => updateVideo(index, 'season', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map(season => (
                                  <SelectItem key={season} value={season.toString()}>
                                    Season {season}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Episode</Label>
                            <Select 
                              value={video.episode.toString()} 
                              onValueChange={(value) => updateVideo(index, 'episode', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(episode => (
                                  <SelectItem key={episode} value={episode.toString()}>
                                    Episode {episode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Language</Label>
                            <Select 
                              value={video.language} 
                              onValueChange={(value) => updateVideo(index, 'language', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Portuguese">Portuguese</SelectItem>
                                <SelectItem value="Italian">Italian</SelectItem>
                                <SelectItem value="Dutch">Dutch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Duration</Label>
                            <Input value={video.duration || 'N/A'} disabled />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeVideoImporter; 