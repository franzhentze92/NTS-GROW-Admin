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
} from 'chart.js';
import type { LatLngTuple } from 'leaflet';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WeatherDay {
  date: string;
  temperature: number;
  rain: number;
  wind: number;
  humidity: number;
  max_temp: number;
  min_temp: number;
}

// Comprehensive agronomy database based on scientific knowledge
interface AgronomyGuidelines {
  condition: 'optimal' | 'caution' | 'avoid';
  threshold: string;
  reasoning: string;
  recommendations: string[];
}

const SOIL_APPLICATION_GUIDELINES: Record<string, AgronomyGuidelines[]> = {
  temperature: [
    {
      condition: 'optimal',
      threshold: '15-25°C',
      reasoning: 'Optimal soil temperature for microbial activity and nutrient uptake',
      recommendations: [
        'Proceed with soil applications as planned',
        'Microbial products will have maximum efficacy',
        'Nutrient availability is optimal for plant uptake'
      ]
    },
    {
      condition: 'caution',
      threshold: '10-15°C or 25-30°C',
      reasoning: 'Reduced microbial activity and nutrient availability',
      recommendations: [
        'Consider increasing application rates by 10-15%',
        'Monitor soil moisture to ensure proper activation',
        'Allow longer time for product activation'
      ]
    },
    {
      condition: 'avoid',
      threshold: '<10°C or >30°C',
      reasoning: 'Minimal microbial activity and potential nutrient loss',
      recommendations: [
        'Delay application until temperature improves',
        'Consider foliar alternatives for immediate needs',
        'Monitor soil conditions for optimal timing'
      ]
    }
  ],
  rainfall: [
    {
      condition: 'optimal',
      threshold: '0-5mm',
      reasoning: 'Ideal soil moisture for application and activation',
      recommendations: [
        'Proceed with soil applications',
        'Products will integrate well with soil moisture',
        'Minimal risk of leaching or runoff'
      ]
    },
    {
      condition: 'caution',
      threshold: '5-15mm',
      reasoning: 'Increased risk of leaching and reduced efficacy',
      recommendations: [
        'Monitor soil drainage conditions',
        'Consider split applications to reduce leaching risk',
        'Ensure proper soil incorporation'
      ]
    },
    {
      condition: 'avoid',
      threshold: '>15mm',
      reasoning: 'High risk of leaching, runoff, and product loss',
      recommendations: [
        'Delay application until rainfall subsides',
        'Wait 24-48 hours after heavy rainfall',
        'Consider alternative application methods'
      ]
    }
  ]
};

const FOLIAR_APPLICATION_GUIDELINES: Record<string, AgronomyGuidelines[]> = {
  temperature: [
    {
      condition: 'optimal',
      threshold: '18-28°C',
      reasoning: 'Optimal temperature for foliar absorption and plant metabolism',
      recommendations: [
        'Proceed with foliar applications',
        'Maximum absorption efficiency expected',
        'Minimal risk of phytotoxicity'
      ]
    },
    {
      condition: 'caution',
      threshold: '15-18°C or 28-32°C',
      reasoning: 'Reduced absorption efficiency and potential stress',
      recommendations: [
        'Apply during early morning or late afternoon',
        'Consider adjuvants to improve absorption',
        'Monitor for signs of plant stress'
      ]
    },
    {
      condition: 'avoid',
      threshold: '<15°C or >32°C',
      reasoning: 'Minimal absorption and high risk of phytotoxicity',
      recommendations: [
        'Delay application until temperature improves',
        'Consider soil application alternatives',
        'Monitor plant stress indicators'
      ]
    }
  ],
  humidity: [
    {
      condition: 'optimal',
      threshold: '60-80%',
      reasoning: 'Ideal humidity for foliar absorption and droplet retention',
      recommendations: [
        'Proceed with foliar applications',
        'Optimal droplet retention on leaf surfaces',
        'Maximum absorption efficiency'
      ]
    },
    {
      condition: 'caution',
      threshold: '40-60% or 80-90%',
      reasoning: 'Reduced absorption efficiency or excessive moisture',
      recommendations: [
        'Consider adjuvants for low humidity conditions',
        'Monitor for disease pressure in high humidity',
        'Adjust application timing if possible'
      ]
    },
    {
      condition: 'avoid',
      threshold: '<40% or >90%',
      reasoning: 'Poor absorption or excessive moisture leading to runoff',
      recommendations: [
        'Delay application until humidity improves',
        'Consider soil application alternatives',
        'Monitor for disease development in high humidity'
      ]
    }
  ],
  wind: [
    {
      condition: 'optimal',
      threshold: '0-8 km/h',
      reasoning: 'Ideal conditions for precise application and minimal drift',
      recommendations: [
        'Proceed with foliar applications',
        'Maximum application precision',
        'Minimal drift and off-target movement'
      ]
    },
    {
      condition: 'caution',
      threshold: '8-15 km/h',
      reasoning: 'Moderate drift risk and reduced application precision',
      recommendations: [
        'Use drift reduction nozzles and adjuvants',
        'Consider buffer zones around sensitive areas',
        'Monitor wind direction and speed during application'
      ]
    },
    {
      condition: 'avoid',
      threshold: '>15 km/h',
      reasoning: 'High drift risk and poor application precision',
      recommendations: [
        'Delay application until wind conditions improve',
        'Consider soil application alternatives',
        'Reschedule for calmer conditions'
      ]
    }
  ],
  rainfall: [
    {
      condition: 'optimal',
      threshold: '0-1mm',
      reasoning: 'Dry conditions for maximum foliar absorption',
      recommendations: [
        'Proceed with foliar applications',
        'Maximum absorption efficiency',
        'No risk of wash-off'
      ]
    },
    {
      condition: 'caution',
      threshold: '1-3mm',
      reasoning: 'Risk of reduced efficacy due to wash-off',
      recommendations: [
        'Monitor weather forecast for additional rainfall',
        'Consider rain-fast adjuvants',
        'Allow adequate drying time before rainfall'
      ]
    },
    {
      condition: 'avoid',
      threshold: '>3mm',
      reasoning: 'High risk of wash-off and product loss',
      recommendations: [
        'Delay application until rainfall subsides',
        'Wait 4-6 hours after rainfall for leaf drying',
        'Consider soil application alternatives'
      ]
    }
  ]
};

const InfoTooltip = ({ text }: { text: string }) => (
  <RadixTooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <span
        className="ml-1 inline-flex items-center justify-center w-4 h-4 cursor-pointer text-[#8cb43a] hover:text-[#6b8e23] transition-colors"
        tabIndex={0}
        role="button"
        aria-label="Info"
        title={text}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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

const WeatherPage: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState('North Farm');
  const [selectedPaddock, setSelectedPaddock] = useState('Iowa Demo Field');
  const [fromDate, setFromDate] = useState('2025-06-23');
  const [toDate, setToDate] = useState('2025-06-27');
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToolInfo, setShowToolInfo] = useState(false);

  // Fetch weather data from EOSDA API
  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/fetch-historical-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date_start: fromDate, 
          date_end: toDate 
        })
      });
      
      const data = await response.json();
      console.log('EOSDA API response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch EOSDA weather');
      }
      
      // Transform EOSDA data to our format
      const weatherDays: WeatherDay[] = data.data.map((day: any) => ({
        date: day.date || day.Date,
        temperature: day.temperature || day.Temp_air || ((day.temperature_max || day.Temp_air_max) + (day.temperature_min || day.Temp_air_min)) / 2,
        rain: day.precipitation || day.Precipitation || 0,
        wind: day.wind_speed || day.Wind_speed || 0,
        humidity: day.humidity || day.Humidity || 0,
        max_temp: day.temperature_max || day.Temp_air_max,
        min_temp: day.temperature_min || day.Temp_air_min
      }));
      
      setWeatherData(weatherDays);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
      
      // Fallback to mock data when API is not available
      console.log('Using fallback mock data');
      const mockWeatherDays: WeatherDay[] = [
        { date: '2025-06-23', temperature: 22.5, rain: 0, wind: 5.2, humidity: 65, max_temp: 25, min_temp: 18 },
        { date: '2025-06-24', temperature: 23.1, rain: 2.5, wind: 4.8, humidity: 70, max_temp: 26, min_temp: 19 },
        { date: '2025-06-25', temperature: 21.8, rain: 8.0, wind: 12.5, humidity: 85, max_temp: 24, min_temp: 17 },
        { date: '2025-06-26', temperature: 24.3, rain: 0, wind: 3.2, humidity: 55, max_temp: 27, min_temp: 20 },
        { date: '2025-06-27', temperature: 25.7, rain: 1.5, wind: 6.8, humidity: 60, max_temp: 28, min_temp: 21 }
      ];
      setWeatherData(mockWeatherDays);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate current weather from latest data
  const currentWeather = useMemo(() => {
    if (weatherData.length === 0) {
      return {
        temperature: 22.5,
        rain: 0,
        wind: 5.2,
        humidity: 65,
      };
    }
    
    const latest = weatherData[weatherData.length - 1];
    return {
      temperature: latest.temperature,
      rain: latest.rain,
      wind: latest.wind,
      humidity: latest.humidity,
    };
  }, [weatherData]);

  // Chart data generation
  const chartData = (label: string, color: string, dataKey: keyof WeatherDay) => ({
    labels: weatherData.map(day => new Date(day.date).toLocaleDateString()),
    datasets: [
      {
        label,
        data: weatherData.map(day => day[dataKey]),
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

  // Scientific weather-based application recommendation logic
  const getApplicationRecommendation = (day: WeatherDay, type: 'soil' | 'foliar') => {
    const { temperature, humidity, rain, wind } = day;
    let limitingFactors: string[] = [];
    let whyExplanation = '';
    let recs: string[] = [];
    
    if (type === 'soil') {
      // Soil application analysis
      const tempGuideline = SOIL_APPLICATION_GUIDELINES.temperature.find(guideline => {
        if (guideline.condition === 'optimal') return temperature >= 15 && temperature <= 25;
        if (guideline.condition === 'caution') return (temperature >= 10 && temperature < 15) || (temperature > 25 && temperature <= 30);
        if (guideline.condition === 'avoid') return temperature < 10 || temperature > 30;
        return false;
      });
      
      const rainGuideline = SOIL_APPLICATION_GUIDELINES.rainfall.find(guideline => {
        if (guideline.condition === 'optimal') return rain >= 0 && rain <= 5;
        if (guideline.condition === 'caution') return rain > 5 && rain <= 15;
        if (guideline.condition === 'avoid') return rain > 15;
        return false;
      });
      
      // Determine overall condition (worst case scenario)
      const conditions = [tempGuideline?.condition, rainGuideline?.condition].filter(Boolean);
      const overallCondition = conditions.includes('avoid') ? 'avoid' : 
                              conditions.includes('caution') ? 'caution' : 'optimal';
      
      // Find limiting factors and build explanation
      if (tempGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Temperature</b> (${temperature}°C)`);
        whyExplanation += `The current soil temperature (${temperature}°C) is ${tempGuideline?.condition === 'caution' ? 'a bit outside the optimal range' : 'well outside the optimal range'}, which ${tempGuideline?.reasoning.toLowerCase()}. `;
      }
      if (rainGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Rainfall</b> (${rain} mm)`);
        whyExplanation += `Rainfall is ${rain} mm, which is ${rainGuideline?.condition === 'caution' ? 'higher than ideal' : 'much higher than ideal'}, so ${rainGuideline?.reasoning.toLowerCase()}. `;
      }
      if (!limitingFactors.length) {
        whyExplanation = 'All weather parameters are within optimal ranges for soil application.';
      }
      // Only show recommendations matching the overall condition
      if (tempGuideline?.condition === overallCondition) {
        recs = recs.concat(tempGuideline.recommendations);
      }
      if (rainGuideline?.condition === overallCondition) {
        recs = recs.concat(rainGuideline.recommendations);
      }
      const getConditionColor = (condition: string) => {
        switch (condition) {
          case 'optimal': return 'text-green-600';
          case 'caution': return 'text-orange-600';
          case 'avoid': return 'text-red-600';
          default: return 'text-gray-600';
        }
      };
      const getConditionIcon = (condition: string) => {
        switch (condition) {
          case 'optimal': return '✅';
          case 'caution': return '⚠️';
          case 'avoid': return '❌';
          default: return '❓';
        }
      };
      const getConditionText = (condition: string) => {
        switch (condition) {
          case 'optimal': return 'Optimal conditions';
          case 'caution': return 'Caution required';
          case 'avoid': return 'Avoid application';
          default: return 'Unknown condition';
        }
      };
      return (
        <div className="space-y-2">
          <div className={`font-medium ${getConditionColor(overallCondition)}`}>
            {getConditionIcon(overallCondition)} {getConditionText(overallCondition)}
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Temperature:</strong> {tempGuideline?.threshold} - {tempGuideline?.reasoning}</div>
            <div><strong>Rainfall:</strong> {rainGuideline?.threshold} - {rainGuideline?.reasoning}</div>
          </div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Why?</strong> <span dangerouslySetInnerHTML={{__html: whyExplanation}} />
          </div>
          <div className="text-xs text-gray-700 mt-2">
            <strong>Recommendations:</strong>
            <ul className="list-disc ml-4 mt-1">
              {recs.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else {
      // Foliar application analysis
      const tempGuideline = FOLIAR_APPLICATION_GUIDELINES.temperature.find(guideline => {
        if (guideline.condition === 'optimal') return temperature >= 18 && temperature <= 28;
        if (guideline.condition === 'caution') return (temperature >= 15 && temperature < 18) || (temperature > 28 && temperature <= 32);
        if (guideline.condition === 'avoid') return temperature < 15 || temperature > 32;
        return false;
      });
      const humidityGuideline = FOLIAR_APPLICATION_GUIDELINES.humidity.find(guideline => {
        if (guideline.condition === 'optimal') return humidity >= 60 && humidity <= 80;
        if (guideline.condition === 'caution') return (humidity >= 40 && humidity < 60) || (humidity > 80 && humidity <= 90);
        if (guideline.condition === 'avoid') return humidity < 40 || humidity > 90;
        return false;
      });
      const windGuideline = FOLIAR_APPLICATION_GUIDELINES.wind.find(guideline => {
        const windKmh = wind * 3.6; // Convert m/s to km/h
        if (guideline.condition === 'optimal') return windKmh >= 0 && windKmh <= 8;
        if (guideline.condition === 'caution') return windKmh > 8 && windKmh <= 15;
        if (guideline.condition === 'avoid') return windKmh > 15;
        return false;
      });
      const rainGuideline = FOLIAR_APPLICATION_GUIDELINES.rainfall.find(guideline => {
        if (guideline.condition === 'optimal') return rain >= 0 && rain <= 1;
        if (guideline.condition === 'caution') return rain > 1 && rain <= 3;
        if (guideline.condition === 'avoid') return rain > 3;
        return false;
      });
      // Determine overall condition (worst case scenario)
      const conditions = [tempGuideline?.condition, humidityGuideline?.condition, windGuideline?.condition, rainGuideline?.condition].filter(Boolean);
      const overallCondition = conditions.includes('avoid') ? 'avoid' : 
                              conditions.includes('caution') ? 'caution' : 'optimal';
      // Find limiting factors and build explanation
      if (tempGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Temperature</b> (${temperature}°C)`);
        whyExplanation += `The temperature (${temperature}°C) is ${tempGuideline?.condition === 'caution' ? 'a bit outside the optimal range' : 'well outside the optimal range'}, which ${tempGuideline?.reasoning.toLowerCase()}. `;
      }
      if (humidityGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Humidity</b> (${humidity}%)`);
        whyExplanation += `Humidity is ${humidity}%, which is ${humidityGuideline?.condition === 'caution' ? 'a bit outside the ideal range' : 'well outside the ideal range'}, so ${humidityGuideline?.reasoning.toLowerCase()}. `;
      }
      if (windGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Wind</b> (${(wind * 3.6).toFixed(1)} km/h)`);
        whyExplanation += `Wind speed is ${(wind * 3.6).toFixed(1)} km/h, which is ${windGuideline?.condition === 'caution' ? 'moderately high' : 'too high'}, so ${windGuideline?.reasoning.toLowerCase()}. `;
      }
      if (rainGuideline?.condition !== 'optimal') {
        limitingFactors.push(`<b>Rainfall</b> (${rain} mm)`);
        whyExplanation += `Rainfall is ${rain} mm, which is ${rainGuideline?.condition === 'caution' ? 'a bit high' : 'too high'}, so ${rainGuideline?.reasoning.toLowerCase()}. `;
      }
      if (!limitingFactors.length) {
        whyExplanation = 'All weather parameters are within optimal ranges for foliar application.';
      }
      // Only show recommendations matching the overall condition
      if (tempGuideline?.condition === overallCondition) {
        recs = recs.concat(tempGuideline.recommendations);
      }
      if (humidityGuideline?.condition === overallCondition) {
        recs = recs.concat(humidityGuideline.recommendations);
      }
      if (windGuideline?.condition === overallCondition) {
        recs = recs.concat(windGuideline.recommendations);
      }
      if (rainGuideline?.condition === overallCondition) {
        recs = recs.concat(rainGuideline.recommendations);
      }
      const getConditionColor = (condition: string) => {
        switch (condition) {
          case 'optimal': return 'text-green-600';
          case 'caution': return 'text-orange-600';
          case 'avoid': return 'text-red-600';
          default: return 'text-gray-600';
        }
      };
      const getConditionIcon = (condition: string) => {
        switch (condition) {
          case 'optimal': return '✅';
          case 'caution': return '⚠️';
          case 'avoid': return '❌';
          default: return '❓';
        }
      };
      const getConditionText = (condition: string) => {
        switch (condition) {
          case 'optimal': return 'Optimal conditions';
          case 'caution': return 'Caution required';
          case 'avoid': return 'Avoid application';
          default: return 'Unknown condition';
        }
      };
      return (
        <div className="space-y-2">
          <div className={`font-medium ${getConditionColor(overallCondition)}`}>
            {getConditionIcon(overallCondition)} {getConditionText(overallCondition)}
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Temperature:</strong> {tempGuideline?.threshold} - {tempGuideline?.reasoning}</div>
            <div><strong>Humidity:</strong> {humidityGuideline?.threshold} - {humidityGuideline?.reasoning}</div>
            <div><strong>Wind:</strong> {windGuideline?.threshold} - {windGuideline?.reasoning}</div>
            <div><strong>Rainfall:</strong> {rainGuideline?.threshold} - {rainGuideline?.reasoning}</div>
          </div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Why?</strong> <span dangerouslySetInnerHTML={{__html: whyExplanation}} />
          </div>
          <div className="text-xs text-gray-700 mt-2">
            <strong>Recommendations:</strong>
            <ul className="list-disc ml-4 mt-1">
              {recs.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  };

  // Load weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3 p-4 bg-white rounded-xl shadow-sm">
        <h2 className="mb-1 font-bold text-xl">G.R.O.W Weather Watch</h2>
        <p className="text-gray-600 mb-0">Stay ahead of the season — access localized forecasts to plan with precision and protect yield.</p>
      </div>

      {/* How to Use This Tool - expert agronomist version */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center mb-2">
          <h5 className="mb-0 font-bold text-lg">How to Use This Tool</h5>
          <button
            className="ml-auto px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => setShowToolInfo((v) => !v)}
            aria-expanded={showToolInfo}
            aria-controls="howToUseCollapse"
          >
            {showToolInfo ? 'Hide' : 'Show'}
          </button>
        </div>
        {showToolInfo && (
          <div id="howToUseCollapse" className="mt-2 text-sm text-gray-700 space-y-6">
            <div className="font-semibold text-[#8cb43a] mb-2">A High-Precision Weather Intelligence Tool for NTS G.R.O.W Agronomists</div>
            <div className="mb-4">
              <p className="mb-2">This advanced weather monitoring tool is designed exclusively for NTS G.R.O.W agronomists to deliver data-driven, precision agriculture recommendations. By integrating real-time, historical, and forecasted weather data with your nutritional and crop protection programs, you can optimize timing, enhance efficacy, and maximize return on investment for your clients.</p>
              <p className="mb-2">Use this tool to:</p>
              <ul className="list-disc ml-6 mb-2">
                <li><strong>Optimize Application Timing:</strong> Schedule foliar applications, soil amendments, and crop protection products based on precise weather conditions</li>
                <li><strong>Enhance Product Efficacy:</strong> Ensure optimal environmental conditions for biological products, foliar nutrients, and soil amendments</li>
                <li><strong>Risk Assessment:</strong> Identify weather-related stress periods that may require additional nutritional support or crop protection</li>
                <li><strong>Historical Analysis:</strong> Correlate past weather patterns with crop performance to refine future recommendations</li>
                <li><strong>Forecast Planning:</strong> Proactively adjust programs based on predicted weather conditions to prevent stress and optimize applications</li>
                <li><strong>Client Communication:</strong> Provide evidence-based explanations for timing and product selection decisions</li>
                <li><strong>Yield Protection:</strong> Anticipate weather stress and proactively adjust nutritional programs</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h6 className="font-semibold text-blue-800 mb-2">Key Weather Parameters for Agronomy Decisions:</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong className="text-blue-700">Temperature (°C):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Optimal application windows for foliar products</li>
                    <li>• Plant stress identification and mitigation</li>
                    <li>• Microbial activity correlation</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">Rainfall (mm):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Soil moisture management strategies</li>
                    <li>• Nutrient leaching risk assessment</li>
                    <li>• Application timing optimization</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">Wind Speed (m/s):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Spray application efficiency</li>
                    <li>• Evapotranspiration rates</li>
                    <li>• Product drift prevention</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">Humidity (%):</strong>
                  <ul className="ml-4 mt-1 text-blue-600">
                    <li>• Disease pressure assessment</li>
                    <li>• Foliar absorption optimization</li>
                    <li>• Plant stress monitoring</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h6 className="font-semibold text-green-800 mb-2">Strategic Application Scenarios:</h6>
              <div className="space-y-2 text-sm text-green-700">
                <div><strong>High Temperature + Low Humidity:</strong> Consider additional stress mitigation products, adjust application timing to early morning/evening</div>
                <div><strong>High Rainfall Periods:</strong> Monitor for nutrient leaching, recommend soil amendments, adjust foliar program timing</div>
                <div><strong>High Wind Conditions:</strong> Delay foliar applications, focus on soil-applied products, consider drift-reduction strategies</div>
                <div><strong>High Humidity + Moderate Temperature:</strong> Monitor disease pressure, optimize fungicide timing, enhance biological product applications</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <h6 className="font-semibold text-yellow-800 mb-2">Weather Forecasting for Proactive Agronomy:</h6>
              <div className="space-y-2 text-sm text-yellow-700">
                <div><strong>7-Day Forecast Integration:</strong> Plan applications 1-2 weeks ahead based on predicted conditions</div>
                <div><strong>Stress Prevention:</strong> Identify upcoming adverse weather and recommend protective measures</div>
                <div><strong>Optimal Timing:</strong> Schedule applications during forecasted favorable weather windows</div>
                <div><strong>Resource Planning:</strong> Coordinate equipment and labor based on weather predictions</div>
                <div><strong>Client Advisory:</strong> Provide advance notice of weather-related recommendations and timing</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 italic">
              <strong>Note:</strong> This tool provides weather intelligence to support your agronomic decisions. Always consider local conditions, crop stage, and specific product requirements when making recommendations. Weather data is sourced from EOSDA's high-precision satellite and ground-based monitoring systems.
            </div>
          </div>
        )}
      </div>

      {/* Filters + Date Range */}
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
        <label className="text-sm font-medium mb-0 ml-4">Date Range:</label>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto ml-2" />
        <button 
          className="bg-[#8cb43a] text-white px-4 py-1 rounded-lg font-medium text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchWeatherData}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Apply'}
        </button>
      </div>

      {/* Error Display */}
      {error && !weatherData.length && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      
      {/* Fallback Data Notice */}
      {error && weatherData.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="text-blue-800 text-sm">
            <strong>Note:</strong> Using sample data for demonstration. The EOSDA weather API is currently unavailable. 
            <br />
            <span className="text-xs">To connect to real weather data, ensure the proxy server is running at http://localhost:3001</span>
          </div>
        </div>
      )}

      {/* Current Weather Cards */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">Temperature</span>
              <InfoTooltip text="Temperature is a measure of the warmth or coldness of the atmosphere. It affects plant growth, development, and physiological processes." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{currentWeather.temperature}°C</div>
            <div className="text-gray-500 text-xs">Air Temperature</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">Rain</span>
              <InfoTooltip text="Rainfall is the amount of precipitation that falls from the atmosphere to the ground. Crucial for crop growth and irrigation planning." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{currentWeather.rain} mm</div>
            <div className="text-gray-500 text-xs">Rainfall</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">Wind Speed</span>
              <InfoTooltip text="Wind speed is the rate at which air is moving horizontally. It affects evapotranspiration, pollination, and can cause crop damage." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{currentWeather.wind} m/s</div>
            <div className="text-gray-500 text-xs">Wind Speed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="font-bold">Humidity</span>
              <InfoTooltip text="Humidity is the concentration of water vapor in the air. High humidity can increase the risk of plant diseases." />
              <span className="ml-2 bg-[#e6f4d7] text-[#8cb43a] text-xs font-semibold rounded px-2 py-0.5">Current</span>
            </div>
            <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
            <div className="text-gray-500 text-xs">Relative Humidity</div>
          </div>
        </div>
      </div>

      {/* Weather-Based Fertilizer Application Recommendations */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
        <h5 className="mb-3 font-semibold flex items-center">
          Current Weather Application Analysis
          <InfoTooltip text="Scientific analysis of current weather conditions for optimal fertilizer application timing. Recommendations are based on agronomic research and consider temperature, humidity, rainfall, and wind conditions for both soil and foliar applications." />
        </h5>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm font-semibold">Loading weather analysis...</div>
          </div>
        ) : weatherData.length > 0 ? (
          <div className="space-y-4">
            {/* Current Day Analysis */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h6 className="font-semibold text-[#8cb43a] mb-3">Today's Application Conditions</h6>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-700 mb-3 text-lg">Soil Application Analysis</div>
                  {getApplicationRecommendation(weatherData[weatherData.length - 1], 'soil')}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-700 mb-3 text-lg">Foliar Application Analysis</div>
                  {getApplicationRecommendation(weatherData[weatherData.length - 1], 'foliar')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm font-semibold">No weather data available</div>
            <div className="text-xs">Click "Apply" to load weather data and get scientific application recommendations</div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h5 className="mb-3 font-semibold">Map View</h5>
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

      {/* Charts */}
      <div className="mb-4 grid grid-cols-1 gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">Temperature Time Series<InfoTooltip text="Temperature is a measure of the warmth or coldness of the atmosphere. It affects plant growth, development, and physiological processes." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">Loading temperature data...</div>
                </div>
              </div>
            ) : weatherData.length > 0 ? (
              <Line data={chartData('Temperature', '#e53935', 'temperature')} options={chartOptions('Temperature (°C)')} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">No temperature data available</div>
                  <div className="text-xs">Click "Apply" to load weather data</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">Rain Time Series<InfoTooltip text="Rainfall is the amount of precipitation that falls from the atmosphere to the ground. Crucial for crop growth and irrigation planning." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">Loading rainfall data...</div>
                </div>
              </div>
            ) : weatherData.length > 0 ? (
              <Line data={chartData('Rain', '#1976d2', 'rain')} options={chartOptions('Rain (mm)')} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">No rainfall data available</div>
                  <div className="text-xs">Click "Apply" to load weather data</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">Wind Speed Time Series<InfoTooltip text="Wind speed is the rate at which air is moving horizontally. It affects evapotranspiration, pollination, and can cause crop damage." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">Loading wind data...</div>
                </div>
              </div>
            ) : weatherData.length > 0 ? (
              <Line data={chartData('Wind Speed', '#43a047', 'wind')} options={chartOptions('Wind Speed (m/s)')} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">No wind data available</div>
                  <div className="text-xs">Click "Apply" to load weather data</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-2" style={{ minHeight: 220 }}>
          <h6 className="mb-2 font-semibold flex items-center">Humidity Time Series<InfoTooltip text="Humidity is the concentration of water vapor in the air. High humidity can increase the risk of plant diseases." /></h6>
          <div className="w-full flex-grow" style={{ height: 300, minWidth: 0 }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">Loading humidity data...</div>
                </div>
              </div>
            ) : weatherData.length > 0 ? (
              <Line data={chartData('Humidity', '#fbc02d', 'humidity')} options={chartOptions('Humidity (%)')} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-semibold">No humidity data available</div>
                  <div className="text-xs">Click "Apply" to load weather data</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage; 