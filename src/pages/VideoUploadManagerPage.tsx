import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Youtube, Database, Settings, CheckCircle, XCircle, FileVideo } from 'lucide-react';
import YouTubeVideoImporter from '@/components/YouTubeVideoImporter';
import { youtubeApiService, VideoMetadata } from '@/lib/youtubeApi';

const VideoUploadManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: any }>({});

  // Authenticate with YouTube for uploads
  const authenticateForUploads = async () => {
    try {
      const authUrl = youtubeApiService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=500,height=600');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Mock function to load videos from Google Drive/Sheets
  const loadVideosFromGoogleDrive = async () => {
    // This would typically fetch from Google Sheets or Drive API
    const mockVideos: VideoMetadata[] = [
      {
        id: '1',
        title: 'Introduction to Soil Health - English',
        description: 'Learn the fundamentals of soil health and why it matters for sustainable agriculture.',
        season: 1,
        episode: 1,
        language: 'English',
        tags: ['soil health', 'basics', 'introduction', 'education'],
        categoryId: '27', // Education category
        privacyStatus: 'unlisted',
        googleDriveFileId: 'mock-drive-file-id-1',
        uploadStatus: 'pending',
      },
      {
        id: '2',
        title: 'Introduction to Soil Health - Spanish',
        description: 'Aprende los fundamentos de la salud del suelo y por qué es importante para la agricultura sostenible.',
        season: 1,
        episode: 1,
        language: 'Spanish',
        tags: ['soil health', 'basics', 'introduction', 'education', 'spanish'],
        categoryId: '27',
        privacyStatus: 'unlisted',
        googleDriveFileId: 'mock-drive-file-id-2',
        uploadStatus: 'pending',
      },
    ];

    return mockVideos;
  };

  // Start bulk upload from Google Drive to YouTube
  const startBulkUpload = async () => {
    if (!isAuthenticated) {
      alert('Please authenticate with YouTube first');
      return;
    }

    setIsUploading(true);
    
    try {
      const videos = await loadVideosFromGoogleDrive();
      
      for (const video of videos) {
        setUploadProgress(prev => ({ 
          ...prev, 
          [video.id]: { status: 'uploading', progress: 0 } 
        }));

        try {
          // Download from Google Drive
          const videoBlob = await youtubeApiService.downloadFromDrive(video.googleDriveFileId);
          
          // Upload to YouTube
          const youtubeId = await youtubeApiService.uploadVideo(video, videoBlob, (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              [video.id]: progress 
            }));
          });

          if (youtubeId) {
            // Set as unlisted
            await youtubeApiService.updateVideoPrivacy(youtubeId, 'unlisted');
            setUploadProgress(prev => ({ 
              ...prev, 
              [video.id]: { status: 'completed', progress: 100 } 
            }));
          }
        } catch (error) {
          console.error(`Failed to upload video ${video.id}:`, error);
          setUploadProgress(prev => ({ 
            ...prev, 
            [video.id]: { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' } 
          }));
        }

        // Rate limiting - wait between uploads
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Video Management</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your educational videos. Import existing YouTube videos or upload new videos from Google Drive.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            Import YouTube Videos
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload from Drive
          </TabsTrigger>
        </TabsList>

        {/* Import YouTube Videos Tab */}
        <TabsContent value="import" className="space-y-6">
          <YouTubeVideoImporter />
        </TabsContent>

        {/* Upload from Google Drive Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Videos from Google Drive to YouTube
              </CardTitle>
              <CardDescription>
                Bulk upload videos from Google Drive to YouTube and add them to your library.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Authentication Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">Authenticated with YouTube</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">Not authenticated</span>
                    </>
                  )}
                </div>
                {!isAuthenticated && (
                  <Button onClick={authenticateForUploads}>
                    Authenticate
                  </Button>
                )}
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  This feature uploads videos from Google Drive to YouTube as unlisted videos, then imports them to your library.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Process</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Videos are downloaded from Google Drive</p>
                  <p>2. Uploaded to YouTube as unlisted videos</p>
                  <p>3. Video metadata is imported to your library</p>
                  <p>4. Videos are embedded in your platform</p>
                </div>

                <Button 
                  onClick={startBulkUpload}
                  disabled={!isAuthenticated || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading Videos...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Start Bulk Upload
                    </>
                  )}
                </Button>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Upload Progress</h4>
                  {Object.entries(uploadProgress).map(([videoId, progress]) => (
                    <div key={videoId} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Video {videoId}</span>
                      <div className="flex items-center gap-2">
                        {progress.status === 'uploading' && (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">{progress.progress}%</span>
                          </>
                        )}
                        {progress.status === 'completed' && (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">Completed</span>
                          </>
                        )}
                        {progress.status === 'failed' && (
                          <>
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoUploadManagerPage; 