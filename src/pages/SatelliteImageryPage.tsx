import React, { useState } from 'react';
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
} from 'chart.js';
import type { LatLngTuple } from 'leaflet';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const InfoTooltip = ({ text }: { text: string }) => (
  <RadixTooltip delayDuration={300}>
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
  </RadixTooltip>
);

const yandinaCoords: LatLngTuple[] = [
  [-26.49630785386763, 152.9148355104133],
  [-26.49644491790693, 152.9149951437186],
  [-26.49643498282219, 152.9150826047683],
  [-26.49647654096426, 152.915136003929],
  [-26.49641027369633, 152.9151679717066],
  [-26.4963066956674, 152.9151522879532],
  [-26.49617943071427, 152.9151405649811],
  [-26.49603918146022, 152.9151330645278],
  [-26.49598117140157, 152.9150405267262],
  [-26.49619458038391, 152.9149028386955],
  [-26.49630785386763, 152.9148355104133],
];

const mockIndices = {
  ndvi: 0.723,
  evi: 0.512,
  savi: 0.634,
  moisture: 0.489,
};

const mockChartData = (label: string, color: string) => ({
  labels: ['6/23/2025', '6/24/2025', '6/25/2025', '6/26/2025', '6/27/2025'],
  datasets: [
    {
      label,
      data: [0.7, 0.72, 0.68, 0.74, 0.73],
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 3,
    },
  ],
});

const chartOptions = (yLabel: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: 0 },
  plugins: {
    legend: { display: true, labels: { usePointStyle: true, font: { size: 11, weight: 'bold' as const } } },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: { display: true, title: { display: true, text: 'Date', font: { weight: 'bold' as const } }, grid: { color: 'rgba(0,0,0,0.1)' }, offset: false },
    y: { display: true, title: { display: true, text: yLabel, font: { weight: 'bold' as const } }, grid: { color: 'rgba(0,0,0,0.1)' } },
  },
});

const SatelliteImageryPage: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState('North Farm');
  const [selectedPaddock, setSelectedPaddock] = useState('Iowa Demo Field');
  const [selectedVariable, setSelectedVariable] = useState('ndvi');
  const [selectedDate, setSelectedDate] = useState('2025-06-27');
  const [fromDate, setFromDate] = useState('2025-06-23');
  const [toDate, setToDate] = useState('2025-06-27');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3 p-4 bg-white rounded-xl shadow-sm">
        <h2 className="mb-1 font-bold text-xl">Satellite Imagery Analysis</h2>
        <p className="text-gray-600 mb-0">Comprehensive satellite imagery analysis with vegetation indices and field mapping.</p>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium mb-0">Farm:</label>
        <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option>North Farm</option>
          <option>South Farm</option>
        </select>
        <label className="text-sm font-medium mb-0">Paddock:</label>
        <select value={selectedPaddock} onChange={e => setSelectedPaddock(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option>Iowa Demo Field</option>
        </select>
      </div>

      {/* Index Cards */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">NDVI</span>
              <InfoTooltip text="Normalized Difference Vegetation Index (NDVI) is a widely used remote sensing index that measures the density and health of vegetation by comparing the difference between near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs). NDVI values range from -1 to 1, where higher values indicate healthier and denser green vegetation, while lower values indicate sparse or stressed vegetation, bare soil, or non-vegetated surfaces." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{mockIndices.ndvi}</div>
            <div className="text-gray-500 text-xs">Vegetation Health</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">EVI</span>
              <InfoTooltip text="Enhanced Vegetation Index (EVI) is an optimized vegetation index designed to enhance the vegetation signal with improved sensitivity in high biomass regions and improved vegetation monitoring through a de-coupling of the canopy background signal and a reduction in atmospheric influences. EVI is particularly useful in areas with dense canopy and is calculated using blue, red, and near-infrared bands." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{mockIndices.evi}</div>
            <div className="text-gray-500 text-xs">Enhanced Vegetation</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">SAVI</span>
              <InfoTooltip text="Soil Adjusted Vegetation Index (SAVI) is a vegetation index that corrects for the influence of soil brightness in areas where vegetative cover is low. It introduces a soil brightness correction factor (L) to the NDVI formula, making it more reliable for arid and semi-arid regions. SAVI values also range from -1 to 1." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{mockIndices.savi}</div>
            <div className="text-gray-500 text-xs">Soil Adjusted</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">Moisture</span>
              <InfoTooltip text="Soil Moisture Index (or similar proxy) estimates the amount of water present in the soil, which is crucial for plant growth and health. It can be derived from remote sensing data using various spectral bands sensitive to water content. Higher values indicate wetter soil, while lower values indicate drier conditions." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{mockIndices.moisture}</div>
            <div className="text-gray-500 text-xs">Soil Moisture</div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="mb-2 flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium mb-0">Variable:</label>
        <select value={selectedVariable} onChange={e => setSelectedVariable(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option value="ndvi">NDVI</option>
          <option value="evi">EVI</option>
          <option value="savi">SAVI</option>
          <option value="moisture">Moisture</option>
        </select>
        <label className="text-sm font-medium mb-0">Day:</label>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto">
          <option value="2025-06-23">6/23/2025</option>
          <option value="2025-06-24">6/24/2025</option>
          <option value="2025-06-25">6/25/2025</option>
          <option value="2025-06-26">6/26/2025</option>
          <option value="2025-06-27">6/27/2025</option>
        </select>
      </div>

      {/* Map View */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h5 className="mb-3 font-semibold">Map View <span className="ml-2 bg-[#8cb43a] text-white text-xs font-semibold rounded px-2 py-0.5">{selectedVariable.toUpperCase()}</span> <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded px-2 py-0.5">{selectedDate}</span></h5>
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer center={[-26.4963, 152.9148]} zoom={18} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>' />
            <Polygon positions={yandinaCoords} pathOptions={{ color: '#8cb43a', fillColor: '#8cb43a', fillOpacity: 0.3, weight: 2 }}>
              <Popup>
                <div className="text-center p-1">
                  <div className="font-bold text-[#8cb43a] text-sm">Yandina Farm</div>
                  <div className="text-xs text-gray-600">Iowa Demo Field</div>
                  <div className="text-xs text-gray-500">Coordinates: -26.4963, 152.9148</div>
                </div>
              </Popup>
            </Polygon>
          </MapContainer>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="mb-2 flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium mb-0">Date Range:</label>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto ml-2" />
        <button className="bg-[#8cb43a] text-white px-4 py-1 rounded-lg font-medium text-sm ml-2">Apply</button>
      </div>

      {/* Charts */}
      <div className="mb-4 grid grid-cols-1 gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">NDVI Time Series<InfoTooltip text="Normalized Difference Vegetation Index (NDVI) is a widely used remote sensing index that measures the density and health of vegetation by comparing the difference between near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs). NDVI values range from -1 to 1, where higher values indicate healthier and denser green vegetation, while lower values indicate sparse or stressed vegetation, bare soil, or non-vegetated surfaces." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            <Line data={mockChartData('NDVI', '#43a047')} options={chartOptions('NDVI')} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">EVI Time Series<InfoTooltip text="Enhanced Vegetation Index (EVI) is an optimized vegetation index designed to enhance the vegetation signal with improved sensitivity in high biomass regions and improved vegetation monitoring through a de-coupling of the canopy background signal and a reduction in atmospheric influences. EVI is particularly useful in areas with dense canopy and is calculated using blue, red, and near-infrared bands." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            <Line data={mockChartData('EVI', '#1976d2')} options={chartOptions('EVI')} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">SAVI Time Series<InfoTooltip text="Soil Adjusted Vegetation Index (SAVI) is a vegetation index that corrects for the influence of soil brightness in areas where vegetative cover is low. It introduces a soil brightness correction factor (L) to the NDVI formula, making it more reliable for arid and semi-arid regions. SAVI values also range from -1 to 1." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            <Line data={mockChartData('SAVI', '#fbc02d')} options={chartOptions('SAVI')} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">Moisture Time Series<InfoTooltip text="Soil Moisture Index (or similar proxy) estimates the amount of water present in the soil, which is crucial for plant growth and health. It can be derived from remote sensing data using various spectral bands sensitive to water content. Higher values indicate wetter soil, while lower values indicate drier conditions." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            <Line data={mockChartData('Moisture', '#8cb43a')} options={chartOptions('Moisture')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteImageryPage;
