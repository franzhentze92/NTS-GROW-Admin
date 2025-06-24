import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  expectedDate?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon.",
  expectedDate 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expectedDate && (
            <div className="text-sm text-muted-foreground">
              Expected release: <span className="font-medium">{expectedDate}</span>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage; 