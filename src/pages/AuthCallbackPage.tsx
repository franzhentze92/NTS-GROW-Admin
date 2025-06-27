import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { youtubeApiService } from '@/lib/youtubeApi';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError(`Authentication failed: ${error}`);
          setStatus('error');
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Exchange code for access token
        const accessToken = await youtubeApiService.exchangeCodeForToken(code);
        
        // Store the token (you might want to store this more securely)
        localStorage.setItem('youtube_access_token', accessToken);
        
        setStatus('success');
        
        // Close the popup window if it's a popup
        if (window.opener) {
          window.opener.postMessage({ type: 'youtube-auth-success', accessToken }, window.location.origin);
          window.close();
        } else {
          // Redirect back to video manager after a short delay
          setTimeout(() => {
            window.location.href = '/video-upload-manager';
          }, 2000);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, []);

  const goBack = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/video-upload-manager';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Authenticating...
            </CardTitle>
            <CardDescription>
              Completing YouTube authentication...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Please wait while we complete the authentication process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {status === 'success' ? 'Authentication Successful' : 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'success' 
              ? 'You can now use YouTube features in your platform.'
              : 'There was an issue with the authentication process.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                YouTube authentication completed successfully! You can now fetch and manage your videos.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={goBack} className="w-full flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {window.opener ? 'Close Window' : 'Go Back to Video Manager'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage; 