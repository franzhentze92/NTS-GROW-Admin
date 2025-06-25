import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Analysis } from '@/lib/types';

interface ViewAnalysisDialogProps {
  analysis: Analysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewAnalysisDialog: React.FC<ViewAnalysisDialogProps> = ({
  analysis,
  open,
  onOpenChange,
}) => {
  if (!analysis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analysis Details</DialogTitle>
          <DialogDescription>
            View complete information for this analysis record.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Client Name</label>
              <p className="text-sm">{analysis.client_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Consultant</label>
              <p className="text-sm">{analysis.consultant}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Analysis Type</label>
              <div className="mt-1">
                <Badge variant={analysis.analysis_type === "soil" ? "secondary" : "default"} className="capitalize">
                  {analysis.analysis_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Crop</label>
              <p className="text-sm">{analysis.crop}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sample No.</label>
              <p className="text-sm">{analysis.sample_no || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">EAL Lab No.</label>
              <p className="text-sm">{analysis.eal_lab_no || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">No. of Tests</label>
              <p className="text-sm">{analysis.test_count || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge 
                  variant={
                    analysis.status === 'Emailed' ? 'default' :
                    analysis.status === 'Checked Ready to be Emailed' ? 'secondary' :
                    analysis.status === 'Ready to be Checked' ? 'outline' :
                    analysis.status === 'Draft' ? 'destructive' : 'destructive'
                  }
                  className="capitalize"
                >
                  {analysis.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Created</label>
              <p className="text-sm">{format(new Date(analysis.created_at), "PPP")}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <p className="text-sm mt-1 p-3 bg-muted rounded-md">
              {analysis.notes || 'No notes available'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Updated By</label>
              <p className="text-sm">
                {typeof analysis.updated_by === 'object' ? analysis.updated_by.name : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">
                {analysis.status_updated_at ? format(new Date(analysis.status_updated_at), "PPP") : 'Never'}
              </p>
            </div>
          </div>

          {/* Step Tracking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step Tracking</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${analysis.draft_by ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Draft</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.draft_by && analysis.draft_date ? (
                      <>
                        by {analysis.draft_by} on {format(new Date(analysis.draft_date), "PPP")}
                      </>
                    ) : (
                      'Not completed'
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${analysis.ready_check_by ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Ready to be Checked</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.ready_check_by && analysis.ready_check_date ? (
                      <>
                        by {analysis.ready_check_by} on {format(new Date(analysis.ready_check_date), "PPP")}
                      </>
                    ) : (
                      'Not completed'
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${analysis.checked_by ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Checked Ready to be Emailed</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.checked_by && analysis.checked_date ? (
                      <>
                        by {analysis.checked_by} on {format(new Date(analysis.checked_date), "PPP")}
                      </>
                    ) : (
                      'Not completed'
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${analysis.emailed_by ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Emailed</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.emailed_by && analysis.emailed_date ? (
                      <>
                        by {analysis.emailed_by} on {format(new Date(analysis.emailed_date), "PPP")}
                      </>
                    ) : (
                      'Not completed'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 