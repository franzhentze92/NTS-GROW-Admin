import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NTSProductRecommendatorPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Embedded Tool */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg">NTS Product Recommendator Tool</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
            <iframe
              src="/grow-tools/NTSProductRecommendator/index.html"
              className="w-full h-full border-0"
              title="NTS Product Recommendator Tool"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NTSProductRecommendatorPage; 