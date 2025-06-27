import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Play, Globe, Calendar } from 'lucide-react';
import { Video, videoApiService } from '../lib/videoApi';
import VideoPlayer from '../components/VideoPlayer';

// Import the processed video data
import processedVideosData from '../../processed-videos.json';

const EducationVideoPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedEpisode, setSelectedEpisode] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    // Use the processed video data instead of API calls
    const processedVideos: Video[] = processedVideosData.videos.map(video => ({
      id: video.id,
      title: video.title || 'Untitled',
      description: (video as any).description || 'No description available',
      season: video.season,
      episode: video.episode,
      language: video.language || 'Unknown',
      tags: (video as any).tags || [], // Provide empty array as default
      category_id: (video as any).category_id || null,
      privacy_status: (video as any).privacy_status as 'private' | 'unlisted' | 'public' || 'private',
      google_drive_file_id: video.google_drive_file_id,
      youtube_video_id: (video as any).youtube_video_id || '',
      upload_status: (video as any).upload_status as 'pending' | 'uploading' | 'completed' | 'failed' || 'completed',
      upload_date: (video as any).upload_date || new Date().toISOString(),
      duration: (video as any).duration || 'N/A',
      thumbnail_url: (video as any).thumbnail_url || null,
      created_at: (video as any).created_at || new Date().toISOString(),
      updated_at: (video as any).updated_at || new Date().toISOString(),
      series: (video as any).series || 'Unknown'
    }));

    setVideos(processedVideos);
    setFilteredVideos(processedVideos);
    setLoading(false);
  }, []);

  // Filter videos based on search and filters
  useEffect(() => {
    let filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Series filter
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(video => video.series === selectedSeries);
    }

    // Season filter
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(video => video.season === parseInt(selectedSeason));
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(video => video.language === selectedLanguage);
    }

    // Episode filter
    if (selectedEpisode !== 'all') {
      filtered = filtered.filter(video => video.episode === parseInt(selectedEpisode));
    }

    setFilteredVideos(filtered);
  }, [videos, searchTerm, selectedSeries, selectedSeason, selectedLanguage, selectedEpisode]);

  const getUniqueSeasons = () => {
    const seasons = [...new Set(videos.map(video => video.season).filter(season => season !== null))].sort((a, b) => a - b);
    return seasons;
  };

  const getUniqueLanguages = () => {
    const languages = [...new Set(videos.map(video => video.language))].sort();
    return languages;
  };

  const getUniqueEpisodes = () => {
    const episodes = [...new Set(videos.map(video => video.episode).filter(episode => episode !== null))].sort((a, b) => a - b);
    return episodes;
  };

  const getUniqueSeries = () => {
    const series = [...new Set(videos.map(video => video.series || 'Unknown'))].sort();
    return series;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSeason('all');
    setSelectedLanguage('all');
    setSelectedEpisode('all');
    setSelectedSeries('all');
  };

  const openVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const closeVideo = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">G.R.O.W Video Library</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access our comprehensive collection of educational videos covering sustainable agriculture, 
          soil health, crop management, and more. Available in multiple languages.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search videos by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Series</label>
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger>
                  <SelectValue placeholder="All Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {getUniqueSeries().map(series => (
                    <SelectItem key={series} value={series}>
                      {series}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Season</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="All Seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {getUniqueSeasons().map(season => (
                    <SelectItem key={season} value={season.toString()}>
                      Season {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {getUniqueLanguages().map(language => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Episode</label>
              <Select value={selectedEpisode} onValueChange={setSelectedEpisode}>
                <SelectTrigger>
                  <SelectValue placeholder="All Episodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Episodes</SelectItem>
                  {getUniqueEpisodes().map(episode => (
                    <SelectItem key={episode} value={episode.toString()}>
                      Episode {episode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Badge variant="secondary" className="text-sm">
                {filteredVideos.length} videos found
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_video_id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                    onClick={() => openVideo(video)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.duration || 'N/A'}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {video.language}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {video.upload_date ? new Date(video.upload_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      S{video.season || '?'}E{video.episode || '?'}
                    </Badge>
                    {(video.tags || []).slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openVideo(video)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.youtube_video_id || ''}
          title={selectedVideo.title}
          isOpen={isVideoPlayerOpen}
          onClose={closeVideo}
          autoPlay={true}
          googleDriveFileId={selectedVideo.google_drive_file_id || undefined}
        />
      )}
    </div>
  );
};

export default EducationVideoPage; 