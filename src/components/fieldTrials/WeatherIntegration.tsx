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
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  Calendar,
  Map,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';

const MOCK_WEATHER_DATA = {
  current: {
    temperature: 24.5,
    humidity: 65,
    rainfall: 0,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    feelsLike: 26.2,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6
  },
  forecast: [
    { date: '2024-03-16', high: 26, low: 18, condition: 'Sunny', rainfall: 0, humidity: 60 },
    { date: '2024-03-17', high: 28, low: 20, condition: 'Partly Cloudy', rainfall: 5, humidity: 65 },
    { date: '2024-03-18', high: 25, low: 17, condition: 'Rainy', rainfall: 15, humidity: 80 },
    { date: '2024-03-19', high: 27, low: 19, condition: 'Cloudy', rainfall: 8, humidity: 70 },
    { date: '2024-03-20', high: 29, low: 21, condition: 'Sunny', rainfall: 0, humidity: 55 },
  ],
  historical: [
    { date: '2024-03-10', avgTemp: 22.5, totalRainfall: 0, avgHumidity: 58 },
    { date: '2024-03-11', avgTemp: 23.1, totalRainfall: 0, avgHumidity: 62 },
    { date: '2024-03-12', avgTemp: 21.8, totalRainfall: 12, avgHumidity: 75 },
    { date: '2024-03-13', avgTemp: 24.2, totalRainfall: 0, avgHumidity: 65 },
    { date: '2024-03-14', avgTemp: 25.7, totalRainfall: 0, avgHumidity: 60 },
    { date: '2024-03-15', avgTemp: 24.5, totalRainfall: 0, avgHumidity: 65 },
  ]
};

const WEATHER_ALERTS = [
  { id: 1, type: 'warning', message: 'High UV index expected tomorrow', severity: 'moderate' },
  { id: 2, type: 'info', message: 'Rainfall expected in 48 hours', severity: 'low' },
  { id: 3, type: 'alert', message: 'Frost warning for tonight', severity: 'high' },
];

const WeatherIntegration: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('Farm A - Field 3');
  const [timeRange, setTimeRange] = useState('7d');

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-yellow-500" />;
      case 'partly cloudy': return <Cloud className="text-gray-500" />;
      case 'cloudy': return <Cloud className="text-gray-600" />;
      case 'rainy': return <CloudRain className="text-blue-500" />;
      default: return <Sun className="text-yellow-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-yellow-600" />;
      case 'alert': return <AlertTriangle className="text-red-600" />;
      case 'info': return <Eye className="text-blue-600" />;
      default: return <Eye className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Weather Integration</h2>
          <p className="text-gray-600">Real-time weather data and forecasts for your trial location</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2" size={16} />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Map className="mr-2" size={16} />
            Change Location
          </Button>
        </div>
      </div>

      {/* Location and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farm A - Field 3">Farm A - Field 3</SelectItem>
                  <SelectItem value="Farm B - Field 1">Farm B - Field 1</SelectItem>
                  <SelectItem value="Farm C - Field 2">Farm C - Field 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-sm font-medium">2 minutes ago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="text-red-500" />
                Current Weather Conditions
              </CardTitle>
              <CardDescription>
                Real-time weather data for {selectedLocation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{MOCK_WEATHER_DATA.current.temperature}°C</div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-xs text-gray-500">Feels like {MOCK_WEATHER_DATA.current.feelsLike}°C</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{MOCK_WEATHER_DATA.current.humidity}%</div>
                  <div className="text-sm text-gray-600">Humidity</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Droplets size={16} className="text-blue-500" />
                    <span className="text-xs">{MOCK_WEATHER_DATA.current.rainfall}mm</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-500">{MOCK_WEATHER_DATA.current.windSpeed} km/h</div>
                  <div className="text-sm text-gray-600">Wind Speed</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Wind size={16} className="text-gray-500" />
                    <span className="text-xs">SE</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{MOCK_WEATHER_DATA.current.uvIndex}</div>
                  <div className="text-sm text-gray-600">UV Index</div>
                  <div className="text-xs text-gray-500">Moderate</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-2">
                {getWeatherIcon(MOCK_WEATHER_DATA.current.condition)}
                <span className="text-lg font-medium">{MOCK_WEATHER_DATA.current.condition}</span>
              </div>
            </CardContent>
          </Card>

          {/* Weather Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-blue-500" />
                5-Day Forecast
              </CardTitle>
              <CardDescription>
                Weather predictions for the upcoming week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {MOCK_WEATHER_DATA.forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="my-2">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="text-lg font-bold">{day.high}°</div>
                    <div className="text-sm text-gray-600">{day.low}°</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Droplets size={12} className="text-blue-500" />
                      <span className="text-xs">{day.rainfall}mm</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historical Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-green-500" />
                Historical Weather Data
              </CardTitle>
              <CardDescription>
                Past weather conditions for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Avg Temp (°C)</TableHead>
                    <TableHead>Rainfall (mm)</TableHead>
                    <TableHead>Avg Humidity (%)</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_WEATHER_DATA.historical.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell>{day.avgTemp}</TableCell>
                      <TableCell>{day.totalRainfall}</TableCell>
                      <TableCell>{day.avgHumidity}</TableCell>
                      <TableCell>
                        {index > 0 && (
                          day.avgTemp > MOCK_WEATHER_DATA.historical[index - 1].avgTemp ? 
                            <TrendingUp className="text-green-500" size={16} /> : 
                            <TrendingDown className="text-red-500" size={16} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                Weather Alerts
              </CardTitle>
              <CardDescription>
                Important weather notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WEATHER_ALERTS.map(alert => (
                  <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div className="text-sm">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Impact Analysis</CardTitle>
              <CardDescription>
                How weather affects your trial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Optimal Growing Conditions</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Water Stress Risk</span>
                  <span>15%</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disease Pressure</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Weather Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Highest Temp</span>
                <span className="font-medium">29°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lowest Temp</span>
                <span className="font-medium">17°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Rainfall</span>
                <span className="font-medium">27mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Humidity</span>
                <span className="font-medium">64%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeatherIntegration;
