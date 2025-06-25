import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { MOCK_CLIENTS } from '@/lib/constants';
import { ViewAnalysisDialog } from '@/components/analysis/ViewAnalysisDialog';
import { Analysis } from '@/lib/types';
import { Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AnalysisChronologyPage: React.FC = () => {
  const { data: analyses = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analyses'],
    queryFn: getAnalyses,
  });
  const [selectedClient, setSelectedClient] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewingAnalysis, setViewingAnalysis] = useState<Analysis | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Filter analyses by client and date
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;
    if (selectedClient) {
      filtered = filtered.filter(a => a.client_name === selectedClient);
    }
    if (dateFrom && dateTo) {
      filtered = filtered.filter(a => {
        const created = a.created_at ? parseISO(a.created_at) : null;
        if (!created) return false;
        return isWithinInterval(created, { start: parseISO(dateFrom), end: parseISO(dateTo) });
      });
    }
    return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [analyses, selectedClient, dateFrom, dateTo]);

  // Group analyses by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Analysis[] } = {};
    filteredAnalyses.forEach(a => {
      const date = a.created_at ? format(new Date(a.created_at), 'PPP') : 'Unknown Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return groups;
  }, [filteredAnalyses]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Chronology</h1>
          <p className="text-muted-foreground mt-1">Search by client and date to see all analyses in a time chronology.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CLIENTS.map(client => (
                  <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full md:w-2/3">
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-1/2"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-1/2"
              placeholder="To"
            />
            <Button variant="outline" onClick={() => { setSelectedClient(''); setDateFrom(''); setDateTo(''); }}>Clear</Button>
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Chronology</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading analyses...</div>
          ) : isError ? (
            <div className="text-red-600">Error: {error?.message}</div>
          ) : !selectedClient ? (
            <div className="text-muted-foreground">Select a client to view chronology.</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-muted-foreground">No analyses found for the selected client and date range.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, analyses]) => (
                <div key={date}>
                  <h3 className="font-semibold text-lg mb-2">{date}</h3>
                  <div className="space-y-2 border-l-2 border-primary pl-6">
                    {analyses.map(a => (
                      <div key={a.id} className="relative group bg-muted/50 rounded-lg p-3 hover:bg-muted transition cursor-pointer" onClick={() => { setViewingAnalysis(a); setViewDialogOpen(true); }}>
                        <div className="absolute -left-3 top-4 w-3 h-3 rounded-full bg-primary group-hover:bg-primary/80 border-2 border-white"></div>
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                          <span className="font-medium text-primary">{a.analysis_type.toUpperCase()}</span>
                          <span className="text-muted-foreground">Crop: {a.crop}</span>
                          <span className="text-muted-foreground">Consultant: {a.consultant}</span>
                          <span className="text-muted-foreground">Status: {a.status}</span>
                          <span className="text-muted-foreground">EAL Lab No: {a.eal_lab_no || '-'}</span>
                          {a.pdf_file_path && (() => {
                            const publicUrl = (supabase.storage.from('analysis-reports') as any).getPublicUrl(a.pdf_file_path)?.data?.publicUrl;
                            if (publicUrl) {
                              return (
                                <a
                                  href={publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View attached PDF"
                                  className="ml-2 text-green-600 hover:text-green-800"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <Paperclip className="inline h-5 w-5" />
                                </a>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {a.notes && <div className="mt-1 text-xs text-muted-foreground">Notes: {a.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ViewAnalysisDialog analysis={viewingAnalysis} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
    </div>
  );
};

export default AnalysisChronologyPage; 