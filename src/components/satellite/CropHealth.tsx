import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Hardcoded GeoJSON for Yandina Farm
const yandinaPolygonGeoJSON = {
  type: 'Polygon',
  coordinates: [
    [
      [152.9148355104133, -26.49630785386763],
      [152.9149951437186, -26.49644491790693],
      [152.9150826047683, -26.49643498282219],
      [152.915136003929, -26.49647654096426],
      [152.9151679717066, -26.49641027369633],
      [152.9151522879532, -26.4963066956674],
      [152.9151405649811, -26.49617943071427],
      [152.9151330645278, -26.49603918146022],
      [152.9150405267262, -26.49598117140157],
      [152.9149028386955, -26.49619458038391],
      [152.9148355104133, -26.49630785386763]
    ]
  ]
} as const;

const CropHealth = () => {
  const [vegetationData, setVegetationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStats, setCurrentStats] = useState({ ndvi: 0, evi: 0, savi: 0, moisture: 0 });

  useEffect(() => {
    const fetchVegetationIndices = async () => {
      setLoading(true);
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);

        const res = await fetch('http://localhost:3001/fetch-vegetation-indices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_start: from.toISOString().slice(0, 10) + 'T00:00',
            date_end: to.toISOString().slice(0, 10) + 'T00:00',
            geometry: yandinaPolygonGeoJSON,
            limit: 50 // Increased limit
          })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        setVegetationData(data.data);
        if (data.data.length > 0) {
          const latestData = data.data[data.data.length - 1].indexes;
          setCurrentStats({
            ndvi: latestData.NDVI?.value || 0,
            evi: latestData.EVI?.value || 0,
            savi: latestData.SAVI?.value || 0,
            moisture: latestData.NDMI?.value || 0, // Assuming moisture is NDMI
          });
        }
      } catch (e) {
        setError(e.message);
        console.error('Error fetching vegetation indices:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchVegetationIndices();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const position: LatLngExpression = [-26.496, 152.915]; // Center of Yandina farm

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>NDVI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.ndvi.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Vegetation Health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>EVI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.evi.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Enhanced Vegetation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SAVI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.savi.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Soil Adjusted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Moisture (NDMI)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.moisture.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Soil Moisture</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Map View</h2>
          <MapContainer center={position} zoom={15} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON data={yandinaPolygonGeoJSON} />
          </MapContainer>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Charts</h2>
          <div className="space-y-4">
            <div style={{ height: '200px' }}>
              <h3 className="text-lg font-semibold">NDVI Time Series</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData.map(d => ({ date: d.date.slice(0, 10), value: d.indexes.NDVI?.value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="NDVI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ height: '200px' }}>
              <h3 className="text-lg font-semibold">EVI Time Series</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData.map(d => ({ date: d.date.slice(0, 10), value: d.indexes.EVI?.value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" name="EVI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ height: '200px' }}>
              <h3 className="text-lg font-semibold">SAVI Time Series</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData.map(d => ({ date: d.date.slice(0, 10), value: d.indexes.SAVI?.value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#ffc658" name="SAVI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ height: '200px' }}>
              <h3 className="text-lg font-semibold">Moisture (NDMI) Time Series</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData.map(d => ({ date: d.date.slice(0, 10), value: d.indexes.NDMI?.value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#0088FE" name="NDMI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropHealth;
