import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  MapPin, 
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CropHealthData {
  date: string;
  ndvi: number;
  evi: number;
  savi: number;
  ndmi: number;
}

interface FieldData {
  id: string;
  name: string;
  area: number;
  crop: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  coordinates: [number, number][];
  lastUpdate: string;
}

const CropHealth: React.FC = () => {
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('ndvi');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [showHowTo, setShowHowTo] = useState(false);

  // Mock data for crop health metrics
  const cropHealthData: CropHealthData[] = useMemo(() => {
    const data: CropHealthData[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        ndvi: 0.6 + Math.random() * 0.3 + Math.sin(i * 0.2) * 0.1,
        evi: 0.4 + Math.random() * 0.2 + Math.sin(i * 0.15) * 0.08,
        savi: 0.5 + Math.random() * 0.25 + Math.sin(i * 0.18) * 0.09,
        ndmi: 0.3 + Math.random() * 0.15 + Math.sin(i * 0.12) * 0.06,
      });
    }
    return data;
  }, []);

  // Mock field data
  const fields: FieldData[] = [
    {
      id: 'field-1',
      name: 'North Field',
      area: 45.2,
      crop: 'Corn',
      health: 'excellent',
      coordinates: [[-34.0522, 118.2437], [-34.0522, 118.2537], [-34.0622, 118.2537], [-34.0622, 118.2437]],
      lastUpdate: '2024-01-15T10:30:00Z'
    },
    {
      id: 'field-2',
      name: 'South Field',
      area: 32.8,
      crop: 'Soybeans',
      health: 'good',
      coordinates: [[-34.0422, 118.2337], [-34.0422, 118.2437], [-34.0522, 118.2437], [-34.0522, 118.2337]],
      lastUpdate: '2024-01-15T09:45:00Z'
    },
    {
      id: 'field-3',
      name: 'East Field',
      area: 28.5,
      crop: 'Wheat',
      health: 'fair',
      coordinates: [[-34.0522, 118.2537], [-34.0522, 118.2637], [-34.0622, 118.2637], [-34.0622, 118.2537]],
      lastUpdate: '2024-01-15T11:15:00Z'
    }
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'fair': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricInfo = (metric: string) => {
    switch (metric) {
      case 'ndvi':
        return {
          name: 'NDVI (Normalized Difference Vegetation Index)',
          description: 'Measures vegetation health and density',
          range: '0.0 - 1.0',
          interpretation: 'Higher values indicate healthier vegetation'
        };
      case 'evi':
        return {
          name: 'EVI (Enhanced Vegetation Index)',
          description: 'Improved vegetation index with atmospheric correction',
          range: '0.0 - 1.0',
          interpretation: 'Better sensitivity in high biomass regions'
        };
      case 'savi':
        return {
          name: 'SAVI (Soil-Adjusted Vegetation Index)',
          description: 'Vegetation index that minimizes soil brightness influences',
          range: '0.0 - 1.0',
          interpretation: 'More accurate in areas with exposed soil'
        };
      case 'ndmi':
        return {
          name: 'NDMI (Normalized Difference Moisture Index)',
          description: 'Measures vegetation water content',
          range: '0.0 - 1.0',
          interpretation: 'Higher values indicate higher moisture content'
        };
      default:
        return {
          name: 'Unknown Metric',
          description: '',
          range: '',
          interpretation: ''
        };
    }
  };

  const chartData = useMemo(() => {
    const metricKey = selectedMetric as keyof CropHealthData;
    const metricInfo = getMetricInfo(selectedMetric);
    
    return {
      labels: cropHealthData.map(d => d.date),
      datasets: [
        {
          label: metricInfo.name,
          data: cropHealthData.map(d => d[metricKey]),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }, [cropHealthData, selectedMetric]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${getMetricInfo(selectedMetric).name} Over Time`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const averageHealth = useMemo(() => {
    const total = fields.reduce((sum, field) => {
      const healthValues = { excellent: 4, good: 3, fair: 2, poor: 1 };
      return sum + healthValues[field.health];
    }, 0);
    return (total / fields.length).toFixed(1);
  }, [fields]);

  // Get the latest values for each index, with guard for empty data
  const latest = cropHealthData.length > 0 ? cropHealthData[cropHealthData.length - 1] : undefined;
  const kpiIndices = [
    {
      key: 'ndvi',
      label: 'NDVI',
      value: latest?.ndvi ?? 0,
      description: 'Vegetation Health',
      tooltip: 'Normalized Difference Vegetation Index (NDVI) is a widely used remote sensing index that measures the density and health of vegetation by comparing the difference between near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs). NDVI values range from -1 to 1, where higher values indicate healthier and denser green vegetation, while lower values indicate sparse or stressed vegetation, bare soil, or non-vegetated surfaces.'
    },
    {
      key: 'evi',
      label: 'EVI',
      value: latest?.evi ?? 0,
      description: 'Enhanced Vegetation',
      tooltip: 'Enhanced Vegetation Index (EVI) is an optimized vegetation index designed to enhance the vegetation signal with improved sensitivity in high biomass regions and improved vegetation monitoring through a de-coupling of the canopy background signal and a reduction in atmospheric influences. EVI is particularly useful in areas with dense canopy and is calculated using blue, red, and near-infrared bands.'
    },
    {
      key: 'savi',
      label: 'SAVI',
      value: latest?.savi ?? 0,
      description: 'Soil Adjusted',
      tooltip: 'Soil Adjusted Vegetation Index (SAVI) is a vegetation index that corrects for the influence of soil brightness in areas where vegetative cover is low. It introduces a soil brightness correction factor (L) to the NDVI formula, making it more reliable for arid and semi-arid regions. SAVI values also range from -1 to 1.'
    },
    {
      key: 'ndmi',
      label: 'NDMI',
      value: latest?.ndmi ?? 0,
      description: 'Moisture Index',
      tooltip: 'Normalized Difference Moisture Index (NDMI) measures the water content in vegetation and soil using near-infrared and shortwave infrared bands. Higher NDMI values indicate higher moisture content, which is crucial for plant health and drought monitoring.'
    },
  ];

  // InfoTooltip copied from SatelliteImageryPage for consistent UI
  const InfoTooltip = ({ text }: { text: string }) => (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <span
            className="ml-1 inline-flex items-center justify-center w-4 h-4 cursor-pointer text-[#8cb43a] hover:text-[#6b8e23] transition-colors"
            tabIndex={0}
            role="button"
            aria-label="Info"
            title={text}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="8" />
            </svg>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs z-[9999]">
          {text}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );

  const infoContent: Record<string, { title: string; content: React.ReactNode }> = {
    map: {
      title: 'Satellite Map View',
      content: (
        <div>
          <p><b>Satellite View:</b> This map displays your selected fields using high-resolution satellite imagery. Satellite view helps you visually assess field boundaries, crop patterns, and surrounding landscape context. It is especially useful for:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>Identifying field variability and management zones</li>
            <li>Spotting visible crop stress or bare patches</li>
            <li>Contextualizing NDVI and other index data with real-world imagery</li>
            <li>Planning field visits and scouting routes</li>
          </ul>
          <p className="mt-2">Satellite imagery is updated regularly and provides a true-color or near-true-color representation of your farm, making it easier to relate remote sensing data to what you see on the ground.</p>
        </div>
      ),
    },
    ndvi: {
      title: 'NDVI (Normalized Difference Vegetation Index)',
      content: (
        <div>
          <p><b>NDVI</b> is a widely used vegetation index that measures the density and health of green vegetation. It is calculated from satellite reflectance in the red and near-infrared bands:</p>
          <pre className="bg-gray-100 rounded p-2 mt-2">NDVI = (NIR - Red) / (NIR + Red)</pre>
          <ul className="list-disc ml-5 mt-2">
            <li>Values range from -1 to 1 (healthy crops: 0.6–0.9, bare soil: 0.1–0.2)</li>
            <li>High NDVI = dense, healthy vegetation</li>
            <li>Low NDVI = sparse, stressed, or no vegetation</li>
            <li>Used for crop monitoring, yield prediction, and stress detection</li>
          </ul>
          <p className="mt-2">NDVI is sensitive to chlorophyll content and is a key indicator for agronomists to track crop growth and identify problem areas early.</p>
        </div>
      ),
    },
    evi: {
      title: 'EVI (Enhanced Vegetation Index)',
      content: (
        <div>
          <p><b>EVI</b> improves on NDVI by correcting for atmospheric effects and soil background. It is especially useful in areas with dense vegetation or high biomass:</p>
          <pre className="bg-gray-100 rounded p-2 mt-2">EVI = 2.5 × (NIR - Red) / (NIR + 6×Red - 7.5×Blue + 1)</pre>
          <ul className="list-disc ml-5 mt-2">
            <li>More sensitive to canopy structure and leaf area</li>
            <li>Less affected by soil and atmospheric noise</li>
            <li>Ideal for monitoring forests, sugarcane, and other high-biomass crops</li>
          </ul>
          <p className="mt-2">EVI helps agronomists distinguish between healthy, dense crops and those with closed canopies or overlapping leaves.</p>
        </div>
      ),
    },
    savi: {
      title: 'SAVI (Soil-Adjusted Vegetation Index)',
      content: (
        <div>
          <p><b>SAVI</b> is designed to minimize the influence of soil brightness in areas with sparse vegetation. It is calculated as:</p>
          <pre className="bg-gray-100 rounded p-2 mt-2">SAVI = ((NIR - Red) / (NIR + Red + L)) × (1 + L), where L = 0.5</pre>
          <ul className="list-disc ml-5 mt-2">
            <li>Best for early season, arid, or low-cover fields</li>
            <li>Reduces soil background effects for more accurate crop assessment</li>
            <li>Complements NDVI for bare or recently planted fields</li>
          </ul>
          <p className="mt-2">SAVI is a valuable tool for monitoring emergence, establishment, and early crop vigor.</p>
        </div>
      ),
    },
    ndmi: {
      title: 'NDMI (Normalized Difference Moisture Index)',
      content: (
        <div>
          <p><b>NDMI</b> measures the water content in vegetation and soil using near-infrared and shortwave infrared bands:</p>
          <pre className="bg-gray-100 rounded p-2 mt-2">NDMI = (NIR - SWIR) / (NIR + SWIR)</pre>
          <ul className="list-disc ml-5 mt-2">
            <li>High NDMI = high moisture (well-watered crops)</li>
            <li>Low NDMI = water stress or drought</li>
            <li>Useful for irrigation scheduling and drought monitoring</li>
          </ul>
          <p className="mt-2">NDMI helps you detect early signs of water stress and optimize irrigation for maximum yield and resource efficiency.</p>
        </div>
      ),
    },
  };

  const [infoModal, setInfoModal] = React.useState<{ open: boolean; key: string | null }>({ open: false, key: null });

  const openInfo = (key: string) => setInfoModal({ open: true, key });
  const closeInfo = () => setInfoModal({ open: false, key: null });

  return (
    <div className="p-6 space-y-6">
      {/* Title and Subtitle */}
      <div className="mb-3 p-4 bg-white rounded-xl shadow-sm">
        <h2 className="mb-1 font-bold text-xl">Crop Health Monitoring</h2>
        <p className="text-gray-600 mb-0">Satellite-based vegetation analysis and health assessment</p>
      </div>

      {/* How to Use This Tool - professional, scientific, expandable */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center mb-2">
          <h5 className="mb-0 font-bold text-lg">How to Use This Tool</h5>
          <button
            className="ml-auto px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => setShowHowTo(v => !v)}
            aria-expanded={showHowTo}
            aria-controls="howToUseCollapse"
          >
            {showHowTo ? 'Hide' : 'Show'}
          </button>
        </div>
        {showHowTo && (
          <div id="howToUseCollapse" className="mt-2 text-sm text-gray-700 space-y-6">
            <div className="font-semibold text-[#8cb43a] mb-2">A Professional Satellite Crop Health Monitoring Platform for Agronomists</div>
            <div className="mb-4">
              <p className="mb-2">This advanced tool empowers agronomists to leverage satellite-derived vegetation indices for precision crop monitoring, stress detection, and data-driven recommendations. By integrating NDVI, EVI, SAVI, and NDMI with field boundaries and historical trends, you can:</p>
              <ul className="list-disc ml-6 mb-2">
                <li><strong>Diagnose Crop Stress:</strong> Detect early signs of nutrient deficiency, water stress, pest/disease outbreaks, and canopy closure issues.</li>
                <li><strong>Guide Sampling & Scouting:</strong> Target field visits to zones with abnormal index values for efficient ground-truthing.</li>
                <li><strong>Optimize Inputs:</strong> Support variable rate fertilization, irrigation, and crop protection by mapping spatial variability.</li>
                <li><strong>Track Crop Development:</strong> Monitor crop growth stages, canopy expansion, and senescence over time.</li>
                <li><strong>Correlate with Yield:</strong> Analyze historical index trends against yield maps to refine management strategies.</li>
                <li><strong>Communicate with Clients:</strong> Provide visual, evidence-based reports to growers and stakeholders.</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h6 className="font-semibold text-blue-800 mb-2">Key Vegetation Indices for Agronomy:</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong className="text-blue-700">NDVI (Normalized Difference Vegetation Index):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Gold standard for green biomass and crop vigor</li>
                    <li>• Sensitive to chlorophyll and canopy density</li>
                    <li>• Best for general crop health and stress mapping</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">EVI (Enhanced Vegetation Index):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Superior in high-biomass, dense canopy crops</li>
                    <li>• Reduces soil and atmospheric noise</li>
                    <li>• Ideal for forests, sugarcane, and late-season crops</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">SAVI (Soil-Adjusted Vegetation Index):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Best for early season, arid, or low-cover fields</li>
                    <li>• Corrects for soil background reflectance</li>
                    <li>• Useful for emergence and stand establishment</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">NDMI (Normalized Difference Moisture Index):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Quantifies crop and soil moisture status</li>
                    <li>• Supports irrigation scheduling and drought monitoring</li>
                    <li>• Detects water stress before visual symptoms</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h6 className="font-semibold text-green-800 mb-2">Best Practices for Professional Use:</h6>
              <div className="space-y-2 text-sm text-green-700">
                <div><strong>Integrate with Field Data:</strong> Always validate satellite insights with ground-truthing, tissue/soil tests, and local observations.</div>
                <div><strong>Monitor Trends, Not Just Snapshots:</strong> Use time series to distinguish between transient and persistent issues.</div>
                <div><strong>Account for Cloud Cover & Artifacts:</strong> Be aware of data gaps or anomalies due to weather or sensor limitations.</div>
                <div><strong>Leverage Zoning:</strong> Use index maps to define management zones for targeted sampling and input application.</div>
                <div><strong>Communicate Clearly:</strong> Use visuals and index explanations to educate growers and support recommendations.</div>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-300 p-4 rounded-xl mb-4">
              <div className="font-bold mb-1">Scientific Context & Limitations:</div>
              <ul className="text-[1rem] text-yellow-900 space-y-1">
                <li><b>Indices are Proxies:</b> Vegetation indices estimate, but do not directly measure, crop health. Always interpret in context.</li>
                <li><b>Sensor & Resolution:</b> This tool uses <b>EOSDA satellite services</b> with a <b>spatial resolution of 10 meters</b> (Sentinel-2 imagery). Different satellites (e.g., Sentinel-2, Landsat, Planet) have varying revisit times and pixel sizes.</li>
                <li><b>Environmental Factors:</b> Soil, residue, and atmospheric conditions can influence index values.</li>
                <li><b>Combine with Other Data:</b> Integrate weather, yield, and management records for holistic agronomy.</li>
              </ul>
            </div>
            <div className="text-xs text-gray-500 italic">
              <strong>Note:</strong> This tool is designed for professional agronomists. For optimal results, combine satellite analytics with your expertise, local knowledge, and client goals.
            </div>
          </div>
        )}
      </div>

      {/* Farm, Paddock, and Apply Button Row */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium mb-0">Farm:</label>
        <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option>North Farm</option>
          <option>South Farm</option>
        </select>
        <label className="text-sm font-medium mb-0">Paddock:</label>
        <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option>Iowa Demo Field</option>
        </select>
        <button className="bg-[#8cb43a] text-white px-4 py-1 rounded-lg font-medium text-sm ml-2">Apply</button>
      </div>

      {/* KPI Cards: Styled like Weather/Satellite pages */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiIndices.map(idx => (
            <div key={idx.key} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
              <div className="flex items-center mb-2">
                <span className="font-bold">{idx.label}</span>
                <InfoTooltip text={idx.tooltip} />
                <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
              </div>
              <div className="text-2xl font-bold">{idx.value.toFixed(3)}</div>
              <div className="text-gray-500 text-xs">{idx.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Only Health Metric and Time Range */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm flex flex-wrap gap-6 items-end justify-center">
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-sm font-medium mb-1">Health Metric</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ndvi">NDVI</SelectItem>
              <SelectItem value="evi">EVI</SelectItem>
              <SelectItem value="savi">SAVI</SelectItem>
              <SelectItem value="ndmi">NDMI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-sm font-medium mb-1">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Map - moved to top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Field Locations
              <button onClick={() => openInfo('map')} className="ml-2 text-[#8cb43a] hover:text-[#6b8e23]" title="About Satellite Map View">
                <Info className="h-5 w-5" />
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Interactive map showing field boundaries and health status
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative" style={{height: '400px', width: '100%'}}>
              <MapContainer
                center={[-34.0522, 118.2437]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
                {fields.map(field => (
                  <Polygon
                    key={field.id}
                    positions={field.coordinates}
                    pathOptions={{ color: '#8cb43a', fillColor: 'transparent', fillOpacity: 0, weight: 4 }}
                  >
                    {/* Popup removed as per user request */}
                  </Polygon>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Date Range Selector for time series charts (now below map) */}
        <div className="mb-4 bg-white p-3 rounded-xl shadow-sm flex flex-wrap gap-2 items-center justify-center">
          <label className="text-sm font-medium mb-0">Date Range:</label>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto" />
          <span className="mx-1">to</span>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto" />
          <button className="bg-[#8cb43a] text-white px-4 py-1 rounded-lg font-medium text-sm ml-2">Apply</button>
        </div>

        {/* NDVI Chart - full width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NDVI (Normalized Difference Vegetation Index)
              <button onClick={() => openInfo('ndvi')} className="ml-2 text-[#8cb43a] hover:text-[#6b8e23]" title="About NDVI">
                <Info className="h-5 w-5" />
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Measures vegetation health and density
            </p>
          </CardHeader>
          <CardContent>
            <div style={{width: '100%'}}>
              <Line data={{
                labels: cropHealthData.map(d => d.date),
                datasets: [
                  {
                    label: 'NDVI',
                    data: cropHealthData.map(d => d.ndvi),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* EVI Chart - full width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              EVI (Enhanced Vegetation Index)
              <button onClick={() => openInfo('evi')} className="ml-2 text-[#8cb43a] hover:text-[#6b8e23]" title="About EVI">
                <Info className="h-5 w-5" />
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Improved vegetation index with atmospheric correction
            </p>
          </CardHeader>
          <CardContent>
            <div style={{width: '100%'}}>
              <Line data={{
                labels: cropHealthData.map(d => d.date),
                datasets: [
                  {
                    label: 'EVI',
                    data: cropHealthData.map(d => d.evi),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* SAVI Chart - full width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SAVI (Soil-Adjusted Vegetation Index)
              <button onClick={() => openInfo('savi')} className="ml-2 text-[#8cb43a] hover:text-[#6b8e23]" title="About SAVI">
                <Info className="h-5 w-5" />
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Vegetation index that minimizes soil brightness influences
            </p>
          </CardHeader>
          <CardContent>
            <div style={{width: '100%'}}>
              <Line data={{
                labels: cropHealthData.map(d => d.date),
                datasets: [
                  {
                    label: 'SAVI',
                    data: cropHealthData.map(d => d.savi),
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* NDMI Chart - full width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NDMI (Normalized Difference Moisture Index)
              <button onClick={() => openInfo('ndmi')} className="ml-2 text-[#8cb43a] hover:text-[#6b8e23]" title="About NDMI">
                <Info className="h-5 w-5" />
              </button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Measures vegetation water content
            </p>
          </CardHeader>
          <CardContent>
            <div style={{width: '100%'}}>
              <Line data={{
                labels: cropHealthData.map(d => d.date),
                datasets: [
                  {
                    label: 'NDMI',
                    data: cropHealthData.map(d => d.ndmi),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }
                ]
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scientific Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Scientific Guidelines for Vegetation Indices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* NDVI */}
            <div>
              <h3 className="font-bold text-lg mb-1">NDVI (Normalized Difference Vegetation Index)</h3>
              <div className="mb-2 text-gray-700">A fundamental index for quantifying green vegetation using satellite reflectance data.</div>
              <div className="mb-2"><b>Formula:</b> <span className="font-mono bg-gray-100 rounded px-2 py-1">NDVI = (NIR - Red) / (NIR + Red)</span></div>
              <ul className="list-disc ml-6 mb-2 text-sm">
                <li><b>What it is:</b> NDVI measures the density and health of green vegetation by comparing near-infrared (NIR) and red light reflectance.</li>
                <li><b>How it is measured:</b> Calculated from satellite or drone imagery using the NIR and red spectral bands.</li>
                <li><b>Why it is important:</b> High NDVI values indicate healthy, photosynthetically active crops; low values signal stress, bare soil, or non-vegetated areas. NDVI is used for crop monitoring, yield prediction, and early stress detection.</li>
              </ul>
              <div className="text-xs text-gray-500">Typical range: -1 (water) to 1 (dense green vegetation). Most crops: 0.6–0.9 when healthy.</div>
            </div>
            {/* EVI */}
            <div>
              <h3 className="font-bold text-lg mb-1">EVI (Enhanced Vegetation Index)</h3>
              <div className="mb-2 text-gray-700">An advanced index for high-biomass and dense canopy crops, correcting for atmospheric and soil effects.</div>
              <div className="mb-2"><b>Formula:</b> <span className="font-mono bg-gray-100 rounded px-2 py-1">EVI = 2.5 × (NIR - Red) / (NIR + 6×Red - 7.5×Blue + 1)</span></div>
              <ul className="list-disc ml-6 mb-2 text-sm">
                <li><b>What it is:</b> EVI enhances the vegetation signal, especially in areas with dense canopy or high chlorophyll content.</li>
                <li><b>How it is measured:</b> Uses NIR, red, and blue bands from satellite sensors, with coefficients to correct for atmospheric and soil background noise.</li>
                <li><b>Why it is important:</b> EVI is less sensitive to soil and atmospheric variations, making it ideal for monitoring forests, sugarcane, and other high-biomass crops.</li>
              </ul>
              <div className="text-xs text-gray-500">EVI is particularly useful when NDVI saturates in dense vegetation.</div>
            </div>
            {/* SAVI */}
            <div>
              <h3 className="font-bold text-lg mb-1">SAVI (Soil-Adjusted Vegetation Index)</h3>
              <div className="mb-2 text-gray-700">A modification of NDVI that minimizes soil brightness influences, especially in sparse vegetation or early season crops.</div>
              <div className="mb-2"><b>Formula:</b> <span className="font-mono bg-gray-100 rounded px-2 py-1">SAVI = ((NIR - Red) / (NIR + Red + L)) × (1 + L), L = 0.5</span></div>
              <ul className="list-disc ml-6 mb-2 text-sm">
                <li><b>What it is:</b> SAVI corrects for soil reflectance, providing more accurate vegetation assessment in fields with exposed soil.</li>
                <li><b>How it is measured:</b> Uses the same bands as NDVI, with an added soil adjustment factor (L, typically 0.5).</li>
                <li><b>Why it is important:</b> Essential for early crop establishment monitoring, arid regions, and variable rate seeding/fertilization in low-cover fields.</li>
              </ul>
              <div className="text-xs text-gray-500">SAVI is best used when vegetation cover is less than 40%.</div>
            </div>
            {/* NDMI */}
            <div>
              <h3 className="font-bold text-lg mb-1">NDMI (Normalized Difference Moisture Index)</h3>
              <div className="mb-2 text-gray-700">A key index for assessing crop water status and guiding irrigation decisions.</div>
              <div className="mb-2"><b>Formula:</b> <span className="font-mono bg-gray-100 rounded px-2 py-1">NDMI = (NIR - SWIR) / (NIR + SWIR)</span></div>
              <ul className="list-disc ml-6 mb-2 text-sm">
                <li><b>What it is:</b> NDMI quantifies the moisture content in vegetation and soil using NIR and shortwave infrared (SWIR) bands.</li>
                <li><b>How it is measured:</b> Derived from satellite sensors with SWIR capability (e.g., Landsat, Sentinel-2).</li>
                <li><b>Why it is important:</b> High NDMI values indicate well-watered crops; low values signal drought stress. NDMI supports irrigation scheduling, drought monitoring, and water use efficiency studies.</li>
              </ul>
              <div className="text-xs text-gray-500">NDMI is highly responsive to changes in plant and soil moisture.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Modal for charts/visuals */}
      {infoModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          style={{ backdropFilter: 'blur(1px)' }}
          onClick={closeInfo}
          role="dialog"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeInfo}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            {infoModal.key && (
              <>
                <h2 className="text-xl font-bold mb-2">{infoContent[infoModal.key].title}</h2>
                <div className="text-gray-700 text-base">{infoContent[infoModal.key].content}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHealth;
