import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Satellite, 
  Map, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Download, 
  Calendar,
  Target,
  Leaf,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const MOCK_NDVI_DATA = {
  current: {
    value: 0.72,
    status: 'healthy',
    trend: 'increasing',
    lastUpdate: '2024-03-15'
  },
  historical: [
    { date: '2024-03-01', value: 0.45, status: 'poor' },
    { date: '2024-03-05', value: 0.52, status: 'fair' },
    { date: '2024-03-10', value: 0.68, status: 'good' },
    { date: '2024-03-15', value: 0.72, status: 'healthy' },
  ],
  byPlot: [
    { plot: 'A1', ndvi: 0.68, status: 'good', treatment: 'Control' },
    { plot: 'A2', ndvi: 0.71, status: 'healthy', treatment: 'Control' },
    { plot: 'B1', ndvi: 0.75, status: 'healthy', treatment: 'Low N' },
    { plot: 'B2', ndvi: 0.73, status: 'healthy', treatment: 'Low N' },
    { plot: 'C1', ndvi: 0.78, status: 'excellent', treatment: 'Medium N' },
    { plot: 'C2', ndvi: 0.76, status: 'excellent', treatment: 'Medium N' },
    { plot: 'D1', ndvi: 0.81, status: 'excellent', treatment: 'High N' },
    { plot: 'D2', ndvi: 0.79, status: 'excellent', treatment: 'High N' },
  ]
};

const MOCK_SATELLITE_IMAGES = [
  { id: 1, date: '2024-03-15', type: 'NDVI', resolution: '10m', cloudCover: '5%' },
  { id: 2, date: '2024-03-10', type: 'RGB', resolution: '10m', cloudCover: '15%' },
  { id: 3, date: '2024-03-05', type: 'NDVI', resolution: '10m', cloudCover: '20%' },
  { id: 4, date: '2024-02-28', type: 'RGB', resolution: '10m', cloudCover: '8%' },
];

const MOCK_CROP_HEALTH = [
  { metric: 'Vegetation Density', value: 85, status: 'excellent', trend: 'up' },
  { metric: 'Stress Detection', value: 12, status: 'low', trend: 'down' },
  { metric: 'Growth Rate', value: 78, status: 'good', trend: 'up' },
  { metric: 'Biomass Estimate', value: 92, status: 'excellent', trend: 'up' },
];

const SatelliteIntegration: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [selectedImageType, setSelectedImageType] = useState('ndvi');

  const getNDVIStatus = (value: number) => {
    if (value >= 0.8) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (value >= 0.7) return { status: 'healthy', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (value >= 0.6) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (value >= 0.5) return { status: 'fair', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' || trend === 'increasing' ? 
      <TrendingUp className="text-green-500" size={16} /> : 
      <TrendingDown className="text-red-500" size={16} />;
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="text-green-500" size={16} />;
      case 'healthy': return <CheckCircle className="text-blue-500" size={16} />;
      case 'good': return <CheckCircle className="text-yellow-500" size={16} />;
      case 'fair': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'poor': return <XCircle className="text-red-500" size={16} />;
      default: return <Eye className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Satellite Integration</h2>
          <p className="text-gray-600">Satellite imagery and NDVI analysis for crop monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2" size={16} />
            Export Data
          </Button>
          <Button variant="outline">
            <Map className="mr-2" size={16} />
            View Map
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Satellite className="mr-2" size={16} />
            Request New Image
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium">Image Date</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SATELLITE_IMAGES.map(img => (
                    <SelectItem key={img.id} value={img.date}>
                      {new Date(img.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Image Type</label>
              <Select value={selectedImageType} onValueChange={setSelectedImageType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ndvi">NDVI</SelectItem>
                  <SelectItem value="rgb">RGB</SelectItem>
                  <SelectItem value="nir">NIR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-600">Last Satellite Pass</div>
              <div className="text-sm font-medium">2 days ago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* NDVI Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="text-green-500" />
                NDVI Analysis
              </CardTitle>
              <CardDescription>
                Normalized Difference Vegetation Index for crop health assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{MOCK_NDVI_DATA.current.value}</div>
                  <div className="text-sm text-gray-600">Current NDVI</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getTrendIcon(MOCK_NDVI_DATA.current.trend)}
                    <span className="text-xs text-green-600">Increasing</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getNDVIStatus(MOCK_NDVI_DATA.current.value).color}`}>
                    {getNDVIStatus(MOCK_NDVI_DATA.current.value).status.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Crop Health Status</div>
                  <div className="text-xs text-gray-500">Based on NDVI values</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-gray-600">Field Coverage</div>
                  <div className="text-xs text-gray-500">Healthy vegetation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satellite Image Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="text-blue-500" />
                Satellite Imagery
              </CardTitle>
              <CardDescription>
                {selectedImageType.toUpperCase()} image from {new Date(selectedDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Satellite size={48} className="mx-auto mb-2" />
                  <p className="text-sm">Satellite image will appear here</p>
                  <p className="text-xs text-gray-400">
                    {selectedImageType.toUpperCase()} - {new Date(selectedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>Resolution: 10m</span>
                <span>Cloud Cover: 5%</span>
                <span>Satellite: Sentinel-2</span>
              </div>
            </CardContent>
          </Card>

          {/* NDVI by Plot */}
          <Card>
            <CardHeader>
              <CardTitle>NDVI by Plot</CardTitle>
              <CardDescription>
                Vegetation index values for each trial plot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>NDVI Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_NDVI_DATA.byPlot.map((plot, index) => {
                    const status = getNDVIStatus(plot.ndvi);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{plot.plot}</TableCell>
                        <TableCell>{plot.treatment}</TableCell>
                        <TableCell className="font-bold">{plot.ndvi}</TableCell>
                        <TableCell>
                          <Badge className={status.bg + ' ' + status.color}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getTrendIcon('up')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Crop Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Health Metrics</CardTitle>
              <CardDescription>
                Satellite-derived health indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_CROP_HEALTH.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <div className="flex items-center gap-1">
                      {getHealthIcon(metric.status)}
                      <span className="text-sm font-bold">{metric.value}%</span>
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs text-gray-500">
                      {metric.trend === 'up' ? 'Improving' : 'Declining'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Images */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Images</CardTitle>
              <CardDescription>
                Latest satellite captures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_SATELLITE_IMAGES.map(img => (
                  <div key={img.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{img.type.toUpperCase()}</div>
                      <Badge variant="outline" className="text-xs">
                        {img.cloudCover} clouds
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(img.date).toLocaleDateString()} • {img.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Field Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Area</span>
                <span className="font-medium">3.2 ha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg NDVI</span>
                <span className="font-medium">0.72</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Stress Areas</span>
                <span className="font-medium">12%</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <div className="font-medium text-yellow-800">Low NDVI detected in Plot A1</div>
                  <div className="text-yellow-600 text-xs">Check for irrigation issues</div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <div className="font-medium text-blue-800">New satellite image available</div>
                  <div className="text-blue-600 text-xs">Updated 2 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SatelliteIntegration;
