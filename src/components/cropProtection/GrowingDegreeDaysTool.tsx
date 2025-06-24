import React, { useState, useMemo } from 'react';
import gddStages from './gddStages';
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
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { PRODUCTS } from '@/lib/constants';
import { enhancedMicrobeProducts } from '../../../GROW Tools/NTS-Product-Recommendator/src/data/enhancedMicrobeProducts.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherDay {
  date: string;
  max_temp: number;
  min_temp: number;
  gdd: number;
}

interface GrowingDegreeDaysToolProps {
  className?: string;
}

// Add a simple InfoTooltip component for consistent info icons
const InfoTooltip = ({ text }: { text: string }) => (
  <span
    className="ml-1 align-middle cursor-pointer text-[#8cb43a] hover:text-[#6b8e23]"
    tabIndex={0}
    title={text}
    aria-label="Info"
    style={{ outline: 'none' }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  </span>
);

const GrowingDegreeDaysTool: React.FC<GrowingDegreeDaysToolProps> = ({ className }) => {
  const [selectedFarm, setSelectedFarm] = useState('Yandina Farm');
  const [selectedPaddock, setSelectedPaddock] = useState('Paddock A');
  const [selectedPest, setSelectedPest] = useState('ascospore');
  const [biofixDate, setBiofixDate] = useState('2024-01-01');
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [currentStage, setCurrentStage] = useState<any>(null);
  const [accumulatedGdd, setAccumulatedGdd] = useState<number | null>(null);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get available pests for the dropdown
  const availablePests = Object.keys(gddStages);
  const currentPestData = gddStages[selectedPest as keyof typeof gddStages];

  // GDD Calculation
  const calculateGDD = (maxTemp: number, minTemp: number, baseTemp: number) => {
    const avgTemp = (maxTemp + minTemp) / 2;
    return Math.max(0, avgTemp - baseTemp);
  };

  // Fetch weather data
  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      // Use EOSDA API through local proxy server (same as original GDD tool)
      const response = await fetch('http://localhost:3001/fetch-historical-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date_start: biofixDate, 
          date_end: new Date().toISOString().split('T')[0] 
        })
      });
      
      const data = await response.json();
      console.log('EOSDA API response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch EOSDA weather');
      }
      
      // Get the base temperature for the selected pest
      const baseTemp = (currentPestData as any)?.base_temp || currentPestData?.stages?.[0]?.base_temp || 10;
      
      // Transform EOSDA data to our format
      const weatherDays: WeatherDay[] = data.data.map((day: any) => ({
        date: day.date || day.Date,
        max_temp: day.temperature_max || day.Temp_air_max,
        min_temp: day.temperature_min || day.Temp_air_min,
        gdd: calculateGDD(
          day.temperature_max || day.Temp_air_max, 
          day.temperature_min || day.Temp_air_min, 
          baseTemp
        )
      }));
      
      setWeatherData(weatherDays);
      
      // Calculate accumulated GDD
      const totalGDD = weatherDays.reduce((sum, day) => sum + day.gdd, 0);
      setAccumulatedGdd(totalGDD);
      
      // Find current stage
      if (currentPestData) {
        const stages = currentPestData.stages;
        const currentStage = stages.find((stage: any) => 
          totalGDD >= stage.min && totalGDD <= stage.max
        );
        setCurrentStage(currentStage || stages[0]);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart data
  const chartData = useMemo(() => {
    if (weatherData.length === 0) return null;
    
    const accumulatedGDD = weatherData.reduce((acc, day, index) => {
      if (index === 0) return [day.gdd];
      return [...acc, acc[index - 1] + day.gdd];
    }, [] as number[]);

    return {
      labels: weatherData.map(day => new Date(day.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Accumulated GDD',
          data: accumulatedGDD,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Daily GDD',
          data: weatherData.map(day => day.gdd),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }, [weatherData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    elements: {
      line: {
        borderWidth: 3
      },
      point: {
        radius: 3
      }
    },
    plugins: {
      legend: { 
        display: true,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11, weight: 'bold' as const }
        }
      },
      tooltip: { 
        mode: 'index' as const, 
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#8cb43a',
        borderWidth: 2
      }
    },
    scales: {
      x: { 
        display: true, 
        title: { display: true, text: 'Date', font: { weight: 'bold' as const } },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        offset: false,
        beginAtZero: false
      },
      y: { 
        type: 'linear' as const, 
        display: true, 
        position: 'left' as const, 
        title: { display: true, text: 'Accumulated GDD', font: { weight: 'bold' as const } },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      y1: { 
        type: 'linear' as const, 
        display: true, 
        position: 'right' as const, 
        title: { display: true, text: 'Daily GDD', font: { weight: 'bold' as const } }, 
        grid: { drawOnChartArea: false, color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  const yandinaCoords: LatLngExpression[] = [
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
    [-26.49630785386763, 152.9148355104133]
  ];

  // Get all unique recommended products for the current pest
  const recommendedProductNames = Array.from(new Set(
    (currentPestData?.stages || [])
      .flatMap((stage: any) => stage.recommended_products || [])
  ));
  const recommendedProducts = enhancedMicrobeProducts.filter(p => recommendedProductNames.includes(p.product_name));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* How to Use This Tool - expert agronomist version */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center mb-2">
          <h5 className="mb-0 font-bold text-lg">How to Use This Tool</h5>
          <button
            className="ml-auto px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => setShowModelInfo((v) => !v)}
            aria-expanded={showModelInfo}
            aria-controls="howToUseCollapse"
          >
            {showModelInfo ? 'Hide' : 'Show'}
          </button>
        </div>
        {showModelInfo && (
          <div id="howToUseCollapse" className="mt-2 text-sm text-gray-700 space-y-6">
            <div className="font-semibold text-[#8cb43a] mb-2">A High-Precision Agronomy Tool for NTS G.R.O.W Professionals</div>
            <div className="mb-4">
              <p className="mb-2">This tool is designed exclusively for the agronomists of the NTS G.R.O.W Agronomy Department. It empowers you to deliver high-precision, evidence-based recommendations to your clients, leveraging advanced phenological modeling and real-time weather data. By integrating Growing Degree Days (GDD) with pest and disease risk models, you can anticipate threats, optimize intervention timing, and correlate biological risks with nutritional status and recommendations.</p>
              <p className="mb-2">Use this tool to:</p>
              <ul className="list-disc ml-6 mb-2">
                <li>Precisely track pest and disease development for each client's farm or paddock</li>
                <li>Identify critical risk periods and correlate them with nutritional analysis results</li>
                <li>Integrate GDD-driven risk with your nutritional and biological product recommendations</li>
                <li>Provide proactive, data-driven advice to maximize crop health and yield</li>
                <li>Document and justify your agronomic decisions with scientific rigor</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="font-bold text-[#8cb43a] mb-1">Professional Workflow</h6>
                <ol className="list-decimal ml-5 text-gray-600 mb-0">
                  <li><strong>Select Farm/Paddock:</strong> Choose the client's farm and paddock for analysis.</li>
                  <li><strong>Choose Pest/Disease:</strong> Select the relevant pest or disease model for the crop and region.</li>
                  <li><strong>Set Biofix Date:</strong> <span className="text-[#8cb43a] font-bold">CRITICAL</span> – Enter the observed biofix (first activity) date. This is the anchor for all GDD calculations and risk predictions.</li>
                  <li><strong>Correlate with Nutrition:</strong> Use the GDD stage and risk to inform or adjust nutritional recommendations and interpret analysis results in context.</li>
                </ol>
              </div>
              <div>
                <h6 className="font-bold text-[#8cb43a] mb-1">Advanced Insights</h6>
                <ul className="list-disc ml-5 text-gray-600 mb-0">
                  <li><strong>Current Growth Stage:</strong> Pinpoint the exact phenological stage and risk for each pest/disease</li>
                  <li><strong>Risk Windows:</strong> Identify and communicate high-risk periods to clients for timely intervention</li>
                  <li><strong>Integrated Recommendations:</strong> Link biological and nutritional product advice to real-time risk</li>
                  <li><strong>Data-Driven Justification:</strong> Use the tool's outputs to support and document your professional recommendations</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="font-bold text-[#8cb43a] mb-1">Why Precision Matters</h6>
                <ul className="list-disc ml-5 text-gray-600 mb-0">
                  <li>GDD-based models outperform calendar-based approaches for pest and disease prediction</li>
                  <li>Accurate risk timing enables targeted, cost-effective, and sustainable interventions</li>
                  <li>Correlating GDD risk with nutritional analysis provides a holistic view of crop health</li>
                  <li>Professional use of this tool elevates the standard of agronomic service and client trust</li>
                </ul>
              </div>
              <div>
                <h6 className="font-bold text-[#8cb43a] mb-1">Pro Tips for NTS Agronomists</h6>
                <ul className="list-disc ml-5 text-gray-600 mb-0">
                  <li><span className="font-bold">Biofix accuracy is paramount</span> – verify with field observations and client records</li>
                  <li>Combine GDD risk with nutritional and tissue analysis for comprehensive recommendations</li>
                  <li>Document all decisions and advice for traceability and continuous improvement</li>
                  <li>Use the tool collaboratively with clients to build trust and demonstrate expertise</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex items-start mt-2">
              <div className="text-blue-500 font-bold mr-2">Why This Tool is Essential:</div>
              <ul className="text-blue-700 text-sm space-y-1 ml-2">
                <li>This is not a generic GDD calculator – it is a professional-grade, integrated risk and recommendation engine for advanced agronomy</li>
                <li>Empowers you to deliver the highest standard of service and results for NTS clients</li>
                <li>Transforms data into actionable, science-based advice for every farm and season</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Simple Header - matches original */}
      <div className="mb-3 p-4 bg-white rounded-xl shadow-sm">
        <h2 className="mb-1 font-bold text-xl">Growing Degree Days</h2>
        <p className="text-gray-600 mb-0">Use growing degree days to anticipate pest and disease development, optimize biofix timing, and improve risk management decisions for your crops.</p>
      </div>

      {/* Filters Bar - matches original horizontal layout */}
      <div className="mb-4 bg-white p-3 rounded-xl shadow-sm flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium mb-0">Farm:</label>
        <select 
          value={selectedFarm} 
          onChange={(e) => setSelectedFarm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto"
        >
          <option>Nutrition Farms Yandina</option>
          <option>South Farm</option>
        </select>
        
        <label className="text-sm font-medium mb-0">Paddock:</label>
        <select 
          value={selectedPaddock} 
          onChange={(e) => setSelectedPaddock(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto"
        >
          <option>Ginger Paddock</option>
        </select>
        
        <label className="text-sm font-medium mb-0">Pest/Disease:</label>
        <select 
          value={selectedPest} 
          onChange={(e) => setSelectedPest(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto"
        >
          {availablePests.map(pest => (
            <option key={pest} value={pest}>{gddStages[pest as keyof typeof gddStages]?.name || pest}</option>
          ))}
        </select>
        
        <label className="text-sm font-medium mb-0 ml-auto text-[#8cb43a] font-bold">Biofix Date:</label>
        <input 
          type="date" 
          value={biofixDate} 
          onChange={(e) => setBiofixDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-auto"
        />
        <button 
          onClick={fetchWeatherData}
          disabled={isLoading}
          className="bg-[#8cb43a] text-white px-4 py-1 rounded-lg font-medium text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Apply'}
        </button>
      </div>

      {/* Map and Current Growth Stage - side by side like original */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Map Column */}
        <div className="lg:col-span-7">
          <div className="bg-white p-4 rounded-xl shadow-sm h-full flex flex-col" style={{height: '100%'}}>
            <h5 className="mb-3 font-semibold">Map View</h5>
            <div className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer 
                center={[-26.4963, 152.9148]} 
                zoom={18} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                />
                <Polygon 
                  positions={yandinaCoords}
                  pathOptions={{ color: '#8cb43a', fillColor: '#8cb43a', fillOpacity: 0.3, weight: 2 }}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <div className="font-bold text-[#8cb43a] text-sm">Yandina Farm</div>
                      <div className="text-xs text-gray-600">Ginger Paddock</div>
                      <div className="text-xs text-gray-500">Coordinates: -26.4963, 152.9148</div>
                    </div>
                  </Popup>
                </Polygon>
              </MapContainer>
            </div>
          </div>
        </div>
        
        {/* Current Growth Stage Column */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow p-6 h-full flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center mb-2">
                <span className="font-bold text-lg">Current Growth Stage</span>
                <InfoTooltip text="This section shows the current pest or disease development stage, key GDD values, and recommended actions for your selected farm and pest." />
              </div>
              {currentStage ? (
                <>
                  <div className="text-3xl font-extrabold text-[#8cb43a] mb-2">{currentStage.title}</div>
                  <hr className="my-2" />
                  <div className="mb-2"><span className="font-bold">Today's GDD:</span> <span className="text-blue-700 font-bold">{weatherData[weatherData.length - 1]?.gdd.toFixed(0) || '0'}</span> <InfoTooltip text="The GDD value accumulated for today based on local weather data." /></div>
                  <div className="mb-2"><span className="font-bold">Accumulated GDD:</span> <span className="text-blue-700 font-bold">{accumulatedGdd?.toFixed(0) || '0'}</span> <InfoTooltip text="The total GDD accumulated since the biofix date. Used to determine pest/disease stage." /></div>
                  <div className="mb-2"><span className="font-bold">GDD Range:</span> <span>{currentStage.min} - {currentStage.max}</span> <InfoTooltip text="The GDD range for this growth stage. When accumulated GDD passes the max, the next stage begins." /></div>
                  <div className="mt-3 mb-1 font-bold">Fungus {currentPestData?.name || ''}: <InfoTooltip text="The pest or disease model currently being analyzed." /></div>
                  <div className="text-xs text-gray-700 mb-1">Base Temp: {currentStage.base_temp}&deg;C, Max Temp: {currentStage.upper_temp}&deg;C <InfoTooltip text="The minimum and maximum temperatures used for GDD calculation in this stage." /></div>
                  <div className="mb-2">{currentStage.desc}</div>
                  {currentStage.recommended_products && (
                    <div className="mb-1">
                      <span className="font-bold">Recommended Products: </span>
                      <span className="font-bold text-[#8cb43a]">{currentStage.recommended_products.join(', ')}</span> <InfoTooltip text="Biological products recommended for this stage based on risk and crop needs." />
                    </div>
                  )}
                  {currentStage.reasoning && (
                    <div className="italic text-gray-600 text-sm mb-2">{currentStage.reasoning}</div>
                  )}
                  {currentPestData?.stages && (() => {
                    const currentIndex = currentPestData.stages.findIndex((stage: any) => stage.title === currentStage.title);
                    const nextStage = currentIndex < currentPestData.stages.length - 1 ? currentPestData.stages[currentIndex + 1] : null;
                    return nextStage ? (
                      <div className="mt-4 font-bold">Next Stage: {nextStage.title} (at {nextStage.min} GDD) <InfoTooltip text="The next predicted stage and the GDD value at which it will begin." /></div>
                    ) : null;
                  })()}
                </>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Click "Apply" to load current growth stage
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accumulated GDD Chart - matches original */}
      <div className="mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <h6 className="mb-2 font-semibold flex items-center">
            Accumulated & Monthly GDD
            <InfoTooltip text="Shows the total accumulated Growing Degree Days (GDD) and daily GDD over the selected period, based on the chosen base temperature and biofix date." />
          </h6>
          <div className="w-full flex-grow" style={{ height: 400, minWidth: 0 }}>
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="material-icons text-4xl mb-2 text-gray-300">bar_chart</span>
                  <div className="text-sm font-semibold">Click "Apply" to view chart</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Growth Stages - detailed like original */}
      <div className="mb-4">
        <div className="bg-white rounded-xl shadow-sm h-full border-0">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <span className="font-bold">All Growth Stages</span>
              <InfoTooltip text="A detailed breakdown of all pest/disease stages, their GDD ranges, recommended products, and status." />
            </div>
            {weatherData.length === 0 ? (
              <div className="text-gray-400 text-center py-8 italic">
                Select farm, pest, and biofix date, then click <span className="font-bold text-[#8cb43a]">Apply</span> to view tailored growth stages for your client.
              </div>
            ) : (
              <div className="space-y-2">
                {currentPestData?.stages.map((stage: any, idx: number) => {
                  // Determine status
                  let status = 'Upcoming';
                  if (accumulatedGdd >= stage.max) status = 'Completed';
                  else if (accumulatedGdd >= stage.min && accumulatedGdd <= stage.max) status = 'Current';
                  // Style for current
                  const isCurrent = currentStage?.title === stage.title;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between ${
                        isCurrent
                          ? 'border-[#8cb43a] bg-green-100' // green background for current
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-1">{stage.title}</div>
                        <div className="text-xs text-gray-700 mb-1">
                          Base Temp: {stage.base_temp}&deg;C, Max Temp: {stage.upper_temp}&deg;C
                        </div>
                        <div className="text-gray-700 text-sm mb-1">{stage.desc}</div>
                        {stage.recommended_products && (
                          <div className="mb-1">
                            <span className="font-bold">Recommended Products: </span>
                            <span className="font-bold text-[#8cb43a]">
                              {stage.recommended_products.join(', ')}
                            </span>
                          </div>
                        )}
                        {stage.reasoning && (
                          <div className="italic text-gray-600 text-xs mb-1">{stage.reasoning}</div>
                        )}
                        <div className="mt-1">
                          <span className={`text-xs font-bold ${
                            status === 'Completed'
                              ? 'text-gray-500'
                              : status === 'Current'
                              ? 'text-[#388e3c]'
                              : 'text-gray-400'
                          }`}>{status}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 md:ml-4 mt-2 md:mt-0 text-right">
                        <span className={`text-sm ${isCurrent ? 'font-bold text-[#388e3c]' : 'text-gray-500'}`}>{stage.min} - {stage.max} GDD</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Recommendations for the Entire Season */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
          <div>
            <span className="font-bold text-lg">Product Recommendations for the Entire Season</span>
            <div className="italic text-gray-600 text-sm mt-1">
              Note: Each growth stage will display its own recommended product combination below the stage description. The combination of all products throughout the season provides integral control - this comprehensive approach is essential for maximum efficacy. <span className="font-bold">Very important:</span> Don't forget to feed the microbes throughout the season with recommended microbial foods for optimal performance!
            </div>
          </div>
        </div>
        {weatherData.length === 0 ? (
          <div className="text-gray-400 text-center py-8 italic">
            Select farm, pest, and biofix date, then click <span className="font-bold text-[#8cb43a]">Apply</span> to view customized product recommendations for your client.
          </div>
        ) : (
          recommendedProducts.map((product, index) => {
            // Fix image path for public/grow-tools/assets/
            let imageSrc = product.image;
            if (imageSrc && !/^https?:\/\//.test(imageSrc)) {
              // Remove leading slash if present
              imageSrc = imageSrc.replace(/^\//, '');
              imageSrc = `/grow-tools/assets/${imageSrc}`;
            }
            return (
              <div key={product.product_name} className="bg-white rounded-xl shadow p-6 mt-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/5 flex flex-col items-center justify-center mb-4 md:mb-0">
                  {imageSrc && (
                    <img src={imageSrc} alt={product.product_name} className="w-28 h-28 object-contain rounded-lg border bg-gray-50 mb-2" />
                  )}
                  {product.link && (
                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 border border-[#8cb43a] text-[#8cb43a] rounded text-xs font-semibold hover:bg-[#8cb43a] hover:text-white transition">Learn More</a>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-2xl mb-1">{product.product_name}</div>
                  <div className="text-gray-700 mb-3 text-sm">{product.description}</div>
                  <div className="bg-blue-50 rounded p-3 mb-2">
                    <span className="font-bold text-blue-900">Active Microbes:</span>
                    <ul className="list-disc ml-6 mt-1 text-blue-900">
                      {product.microbes?.map((m: string, i: number) => (
                        <li key={i} className="italic">{m}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="bg-[#8cb43a] text-white px-4 py-1 rounded font-semibold text-sm mb-2"
                    onClick={() => setExpandedProduct(expandedProduct === product.product_name ? null : product.product_name)}
                  >
                    {expandedProduct === product.product_name ? 'Hide Details' : 'Show Details'}
                  </button>
                  {expandedProduct === product.product_name && (
                    <>
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="bg-green-50 rounded p-4 mb-2">
                          <div className="font-bold text-green-800 mb-2">Key Benefits:</div>
                          <ul className="list-disc ml-6 text-green-900">
                            {product.benefits.map((b: string, i: number) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product.recommended_foods && product.recommended_foods.length > 0 && (
                        <div className="bg-orange-50 rounded p-4 mb-2">
                          <div className="font-bold text-orange-800 mb-2">Recommended Microbial Foods:</div>
                          <ul className="list-disc ml-6 text-orange-900">
                            {product.recommended_foods.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product.application_rates && (
                        <div className="bg-blue-50 rounded p-4 mb-2">
                          <div className="font-bold text-blue-900 mb-2">Application Rates:</div>
                          <div className="text-blue-900 text-sm">
                            {Object.entries(product.application_rates).map(([method, rates]: [string, any], i) => (
                              <div key={i} className="mb-2">
                                <span className="font-bold">{method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                                {typeof rates === 'string' ? (
                                  <span>{rates}</span>
                                ) : (
                                  <ul className="list-disc ml-6">
                                    {Object.entries(rates).map(([crop, rate]: [string, any], j) => (
                                      <li key={j}><span className="font-bold">{crop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {rate}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.notes && (
                        <div className="mt-2">
                          <div className="font-bold text-gray-700 mb-1">Application Notes:</div>
                          <div className="text-gray-700 text-sm">{product.notes}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Continuous Monitoring Reminder - matches original */}
      <div className="mb-4">
        <div className="bg-white rounded-xl shadow-sm border-0 border-l-4 border-l-[#8cb43a]">
          <div className="p-4">
            <div className="flex items-start">
              <div>
                <h6 className="font-bold mb-2">Continuous Monitoring is Essential</h6>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Remember:</strong> GDD predictions are tools to guide your monitoring, but they cannot replace regular field scouting and observation. Always verify predictions with actual field conditions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-bold text-[#8cb43a] text-sm">What to Monitor:</h6>
                    <ul className="text-gray-600 text-sm mb-0">
                      <li>Visual signs of pest/disease presence</li>
                      <li>Population levels and distribution</li>
                      <li>Plant damage symptoms</li>
                      <li>Weather conditions and microclimate</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-bold text-[#8cb43a] text-sm">Monitoring Frequency:</h6>
                    <ul className="text-gray-600 text-sm mb-0">
                      <li>Weekly during growing season</li>
                      <li>More frequent during high-risk periods</li>
                      <li>After weather events</li>
                      <li>Before and after treatments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowingDegreeDaysTool; 