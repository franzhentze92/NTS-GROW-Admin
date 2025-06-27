import React, { useMemo } from 'react';
import Weather from '@/components/satellite/Weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { getFieldVisits } from '@/lib/fieldVisitApi';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  MapPin, 
  Package, 
  Target, 
  Calendar, 
  Clock, 
  User, 
  Leaf, 
  FlaskConical,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// TODO: Implement getBatches and getTrials APIs or import if available
// import { getBatches } from '@/lib/batchApi';
// import { getTrials } from '@/lib/trialsApi';
// import { getTasks } from '@/lib/tasksApi';

const DashboardPage: React.FC = () => {
  // Soil & Plant Therapy Reports
  const { data: analyses = [], isLoading: loadingAnalyses, error: errorAnalyses } = useQuery({ queryKey: ['analyses'], queryFn: getAnalyses });
  const soilReports = useMemo(() => {
    const soil = analyses.filter((a: any) => a.analysis_type === 'soil');
    const grouped: Record<string, number> = {};
    soil.forEach((a: any) => {
      const date = a.created_at?.slice(0, 10);
      if (date) grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }, [analyses]);
  const plantReports = useMemo(() => {
    const leaf = analyses.filter((a: any) => a.analysis_type === 'leaf');
    const grouped: Record<string, number> = {};
    leaf.forEach((a: any) => {
      const date = a.created_at?.slice(0, 10);
      if (date) grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }, [analyses]);

  // Upcoming Field Visits
  const { data: fieldVisits = [], isLoading: loadingVisits, error: errorVisits } = useQuery({ queryKey: ['fieldVisits'], queryFn: getFieldVisits });
  const upcomingFieldVisits = useMemo(() => {
    return fieldVisits
      .filter((v: any) => v.status === 'Scheduled' || v.status === 'In Progress')
      .sort((a: any, b: any) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime())
      .slice(0, 5);
  }, [fieldVisits]);

  // TODO: Replace with real API calls
  const upcomingConsultings = [
    { id: 1, title: 'Soil Health Review', date: '2024-06-07', time: '10:00', consultant: 'Dr. Smith', type: 'zoom' },
    { id: 2, title: 'Crop Planning Session', date: '2024-06-08', time: '14:00', consultant: 'Maria Garcia', type: 'zoom' },
    { id: 3, title: 'Fertilizer Strategy', date: '2024-06-09', time: '09:30', consultant: 'Alan Montalbetti', type: 'zoom' },
  ];
  const lastBatches = [
    { id: 1, product: 'Nutri‑Life B.Sub™', date: '2024-06-05', batch: 'B-20240605-01', volume: 1000, status: 'completed' },
    { id: 2, product: 'Nutri‑Life BAM™', date: '2024-06-04', batch: 'B-20240604-01', volume: 800, status: 'completed' },
    { id: 3, product: 'Nutri‑Life Bio-Plex™', date: '2024-06-03', batch: 'B-20240603-01', volume: 1200, status: 'completed' },
  ];
  const ongoingTrials = [
    { id: 1, name: 'Corn Yield Optimization', status: 'Active', crop: 'Corn', endDate: '2024-10-20', progress: 65 },
    { id: 2, name: 'Cotton Irrigation Study', status: 'Active', crop: 'Cotton', endDate: '2024-11-30', progress: 45 },
    { id: 3, name: 'Wheat Disease Resistance', status: 'Active', crop: 'Wheat', endDate: '2024-09-15', progress: 80 },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Top section: Welcome + Weather */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to the G.R.O.W Admin Platform!</h1>
          <p className="text-muted-foreground mt-1">Your central hub for agronomy, analytics, and management.</p>
        </div>
        <Card className="max-w-md w-full md:w-96">
          <CardHeader>
            <CardTitle>Current Weather</CardTitle>
          </CardHeader>
          <CardContent>
            <Weather />
          </CardContent>
        </Card>
      </div>

      {/* Time series charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Soil Therapy Reports (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnalyses ? (
              <div>Loading...</div>
            ) : errorAnalyses ? (
              <div className="text-red-500">Error loading data</div>
            ) : (
              <LineChart 
                data={soilReports}
                lines={[{ dataKey: 'count', stroke: '#10b981', name: 'Soil Reports' }]}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plant Therapy Reports (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnalyses ? (
              <div>Loading...</div>
            ) : errorAnalyses ? (
              <div className="text-red-500">Error loading data</div>
            ) : (
              <LineChart 
                data={plantReports}
                lines={[{ dataKey: 'count', stroke: '#6366f1', name: 'Plant Reports' }]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming consultings and field visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Upcoming Zoom Consultings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingConsultings.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{c.title}</h4>
                      <Badge variant="secondary" className="text-xs">Zoom</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{c.consultant}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{c.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{c.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Upcoming Field Visits</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingVisits ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading field visits...</div>
              </div>
            ) : errorVisits ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : upcomingFieldVisits.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">No upcoming field visits</div>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingFieldVisits.map((v: any) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {typeof v.client === 'string'
                            ? v.client
                            : v.client?.name || 'Unknown Client'}
                        </h4>
                        <Badge 
                          variant={v.status === 'Scheduled' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {v.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{v.consultant || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{v.visit_date?.slice(0, 10) || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last batches produced and ongoing trials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Recent Batch Production</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastBatches.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{b.product}</h4>
                      <Badge variant="outline" className="text-xs">{b.batch}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{b.volume}L</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Active Field Trials</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ongoingTrials.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{t.name}</h4>
                      <Badge variant="default" className="text-xs bg-orange-600">{t.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3" />
                        <span>{t.crop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Ends: {t.endDate}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${t.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Progress</span>
                      <span>{t.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
