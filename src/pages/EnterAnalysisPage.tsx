import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AnalysisFormDialog } from '@/components/analysis/AnalysisFormDialog';
import { ViewAnalysisDialog } from '@/components/analysis/ViewAnalysisDialog';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from '@/components/analysis/analysisColumns';
import { Skeleton } from '@/components/ui/skeleton';
import { Analysis } from '@/lib/types';

const EnterAnalysisPage: React.FC = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['analyses'],
    queryFn: getAnalyses,
  });

  const handleViewDetails = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setViewDialogOpen(true);
  };

  const handleEditAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setEditDialogOpen(true);
  };

  const columns = createColumns({
    onViewDetails: handleViewDetails,
    onEditAnalysis: handleEditAnalysis,
  });

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Creation Monitoring</h1>
          <p className="text-muted-foreground">
            Track and manage all soil and leaf therapy analysis records.
          </p>
        </div>
        <AnalysisFormDialog mode="create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Analysis
          </Button>
        </AnalysisFormDialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={analyses || []} />
      )}

      <ViewAnalysisDialog
        analysis={selectedAnalysis}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <AnalysisFormDialog 
        mode="edit" 
        analysis={selectedAnalysis}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      >
        <div style={{ display: 'none' }}></div>
      </AnalysisFormDialog>
    </div>
  );
};

export default EnterAnalysisPage; 