import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { getFieldVisits } from '@/lib/fieldVisitApi';
import { getClients } from '@/lib/clientsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isWithinInterval, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { ViewAnalysisDialog } from '@/components/analysis/ViewAnalysisDialog';
import { Analysis, FieldVisit, Client } from '@/lib/types';
import { 
  Paperclip, 
  Calendar, 
  MapPin, 
  FlaskConical, 
  Clock, 
  Filter, 
  Search,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import KpiCard from '@/components/metrics/KpiCard';

// Combined timeline item type
type TimelineItem = {
  id: string;
  type: 'analysis' | 'field_visit';
  date: Date;
  title: string;
  subtitle: string;
  status: string;
  data: Analysis | FieldVisit;
  icon: React.ReactNode;
  color: string;
};

const ClientChronologyPage: React.FC = () => {
  // Queries
  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: getAnalyses,
  });

  const { data: fieldVisits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['fieldVisits'],
    queryFn: getFieldVisits,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // State
  const [selectedClient, setSelectedClient] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['analysis', 'field_visit']);
  const [viewingAnalysis, setViewingAnalysis] = useState<Analysis | null>(null);
  const [viewingVisit, setViewingVisit] = useState<FieldVisit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewVisitDialogOpen, setViewVisitDialogOpen] = useState(false);

  const isLoading = analysesLoading || visitsLoading || clientsLoading;

  // Helper function to get client name
  const getClientName = (client: any) => {
    if (!client) return '—';
    if (typeof client === 'string') return client;
    if (typeof client === 'object' && 'name' in client) return client.name;
    return '—';
  };

  // Create timeline items
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add analyses
    analyses.forEach(analysis => {
      items.push({
        id: `analysis-${analysis.id}`,
        type: 'analysis',
        date: new Date(analysis.created_at),
        title: `${analysis.analysis_type.toUpperCase()} Analysis`,
        subtitle: `${analysis.crop} - ${analysis.consultant}`,
        status: analysis.status,
        data: analysis,
        icon: <FlaskConical className="h-4 w-4" />,
        color: analysis.analysis_type === 'soil' ? '#10b981' : '#3b82f6'
      });
    });

    // Add field visits
    fieldVisits.forEach(visit => {
      items.push({
        id: `visit-${visit.id}`,
        type: 'field_visit',
        date: new Date(visit.visit_date),
        title: 'Field Visit',
        subtitle: `${visit.crop || 'No crop'} - ${visit.consultant}`,
        status: visit.status,
        data: visit,
        icon: <MapPin className="h-4 w-4" />,
        color: visit.status === 'Completed' ? '#10b981' : 
               visit.status === 'Scheduled' ? '#3b82f6' : 
               visit.status === 'In Progress' ? '#f59e0b' : '#ef4444'
      });
    });

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [analyses, fieldVisits]);

  // Filter timeline items
  const filteredItems = useMemo(() => {
    let filtered = timelineItems;

    // Filter by client
    if (selectedClient && selectedClient !== 'all') {
      filtered = filtered.filter(item => {
        if (item.type === 'analysis') {
          const analysis = item.data as Analysis;
          return analysis.client_name === selectedClient;
        } else {
          const visit = item.data as FieldVisit;
          return getClientName(visit.client) === selectedClient;
        }
      });
    }

    // Filter by date range
    if (dateFrom && dateTo) {
      filtered = filtered.filter(item => {
        return isWithinInterval(item.date, { 
          start: startOfDay(parseISO(dateFrom)), 
          end: startOfDay(parseISO(dateTo)) 
        });
      });
    }

    // Filter by type
    if (selectedTypes.length < 2) {
      filtered = filtered.filter(item => selectedTypes.includes(item.type));
    }

    return filtered;
  }, [timelineItems, selectedClient, dateFrom, dateTo, selectedTypes]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: TimelineItem[] } = {};
    filteredItems.forEach(item => {
      const date = format(item.date, 'PPP');
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Statistics
  const stats = useMemo(() => {
    const selectedClientItems = selectedClient && selectedClient !== 'all' ? filteredItems : timelineItems;
    const totalItems = selectedClientItems.length;
    const analyses = selectedClientItems.filter(item => item.type === 'analysis').length;
    const visits = selectedClientItems.filter(item => item.type === 'field_visit').length;
    const upcomingVisits = selectedClientItems.filter(item => 
      item.type === 'field_visit' && 
      isAfter(item.date, new Date()) &&
      (item.data as FieldVisit).status === 'Scheduled'
    ).length;

    return { totalItems, analyses, visits, upcomingVisits };
  }, [filteredItems, selectedClient, timelineItems]);

  const handleItemClick = (item: TimelineItem) => {
    if (item.type === 'analysis') {
      setViewingAnalysis(item.data as Analysis);
      setViewDialogOpen(true);
    } else {
      setViewingVisit(item.data as FieldVisit);
      setViewVisitDialogOpen(true);
    }
  };

  const clearFilters = () => {
    setSelectedClient('all');
    setDateFrom('');
    setDateTo('');
    setSelectedTypes(['analysis', 'field_visit']);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Chronology</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive timeline of all client interactions including analyses and field visits.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Activities"
          value={stats.totalItems}
          description="All interactions"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          title="Analyses"
          value={stats.analyses}
          description="Lab analyses"
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <KpiCard
          title="Field Visits"
          value={stats.visits}
          description="Site visits"
          icon={<MapPin className="h-4 w-4" />}
        />
        <KpiCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          description="Scheduled visits"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Filter the timeline by client, date range, and activity type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Client Select */}
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="Start date"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="End date"
              />
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Activity Type</label>
              <Select 
                value={selectedTypes.join(',')} 
                onValueChange={(value) => setSelectedTypes(value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analysis,field_visit">All activities</SelectItem>
                  <SelectItem value="analysis">Analyses only</SelectItem>
                  <SelectItem value="field_visit">Field visits only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Client Timeline
          </CardTitle>
          <CardDescription>
            {selectedClient && selectedClient !== 'all' ? `Showing activities for ${selectedClient}` : 'Showing all client activities'}
            {filteredItems.length > 0 && ` • ${filteredItems.length} items found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-lg">Loading client data...</div>
            </div>
          ) : !selectedClient || selectedClient === 'all' ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="text-muted-foreground">Select a client to view their timeline</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                No activities found for {selectedClient} in the selected date range
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date}>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {date}
                  </h3>
                  <div className="space-y-3 border-l-2 border-muted pl-6">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative group bg-card border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => handleItemClick(item)}
                      >
                        <div 
                          className="absolute -left-8 top-6 w-4 h-4 rounded-full border-2 border-background shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-muted-foreground">
                                {item.icon}
                              </div>
                              <h4 className="font-medium">{item.title}</h4>
                              <Badge 
                                variant={
                                  item.status === 'Completed' || item.status === 'Emailed' ? 'default' :
                                  item.status === 'Scheduled' ? 'secondary' :
                                  item.status === 'In Progress' ? 'outline' : 'destructive'
                                }
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>
                            
                            {/* Additional details based on type */}
                            {item.type === 'analysis' && (() => {
                              const analysis = item.data as Analysis;
                              return (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>EAL: {analysis.eal_lab_no || 'N/A'}</span>
                                  <span>Tests: {analysis.test_count || 'N/A'}</span>
                                  {analysis.pdf_file_path && (
                                    <a
                                      href={(supabase.storage.from('analysis-reports') as any).getPublicUrl(analysis.pdf_file_path)?.data?.publicUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Paperclip className="h-3 w-3" />
                                      PDF
                                    </a>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {item.type === 'field_visit' && (() => {
                              const visit = item.data as FieldVisit;
                              return (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Farm: {visit.farm || 'N/A'}</span>
                                  <span>Reason: {visit.visit_reason || 'N/A'}</span>
                                  {visit.soil_ph && <span>pH: {visit.soil_ph}</span>}
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {format(item.date, 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      <ViewAnalysisDialog 
        analysis={viewingAnalysis} 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
      />

      {/* Field Visit Dialog */}
      <Dialog open={viewVisitDialogOpen} onOpenChange={setViewVisitDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Field Visit Details</DialogTitle>
            <DialogDescription>
              Complete information for this field visit.
            </DialogDescription>
          </DialogHeader>
          
          {viewingVisit && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{getClientName(viewingVisit.client)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Consultant</label>
                  <p className="text-sm">{viewingVisit.consultant}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Date</label>
                  <p className="text-sm">{format(new Date(viewingVisit.visit_date), "PPP")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge 
                    variant={
                      viewingVisit.status === 'Completed' ? 'default' :
                      viewingVisit.status === 'Scheduled' ? 'secondary' :
                      viewingVisit.status === 'In Progress' ? 'outline' : 'destructive'
                    }
                  >
                    {viewingVisit.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Farm</label>
                  <p className="text-sm">{viewingVisit.farm || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Crop</label>
                  <p className="text-sm">{viewingVisit.crop || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visit Reason</label>
                  <p className="text-sm">{viewingVisit.visit_reason || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">{viewingVisit.address || 'N/A'}</p>
                </div>
              </div>

              {/* Soil and Plant Data */}
              {(viewingVisit.soil_ph || viewingVisit.soil_texture || viewingVisit.plant_height) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Soil & Plant Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingVisit.soil_ph && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Soil pH</label>
                        <p className="text-sm">{viewingVisit.soil_ph}</p>
                      </div>
                    )}
                    {viewingVisit.soil_texture && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Soil Texture</label>
                        <p className="text-sm">{viewingVisit.soil_texture}</p>
                      </div>
                    )}
                    {viewingVisit.plant_height && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Plant Height</label>
                        <p className="text-sm">{viewingVisit.plant_height} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments */}
              {(viewingVisit.in_field_observations || viewingVisit.general_comments) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Comments</h3>
                  {viewingVisit.in_field_observations && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-muted-foreground">In-Field Observations</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {viewingVisit.in_field_observations}
                      </p>
                    </div>
                  )}
                  {viewingVisit.general_comments && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">General Comments</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {viewingVisit.general_comments}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientChronologyPage; 