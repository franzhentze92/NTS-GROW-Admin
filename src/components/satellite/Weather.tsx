import React, { useState, useEffect } from 'react';

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStats, setCurrentStats] = useState({ temp: 0, rain: 0, wind: 0, humidity: 0 });

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);

        const res = await fetch('http://localhost:3001/fetch-weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_from: from.toISOString().slice(0, 10) + 'T00:00',
            date_to: to.toISOString().slice(0, 10) + 'T00:00',
          })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch weather data');
        }

        const parsedData = data.data.map(d => ({
          date: d.Date,
          temperature: ((d.Temp_air_min + d.Temp_air_max) / 2),
          humidity: d.Rel_humidity,
          rain: d.Rain ? (Object.values(d.Rain).reduce((a, b) => a + b, 0)) : 0,
          wind: d.Windspeed ? (Object.values(d.Windspeed).reduce((a, b) => a + b, 0) / Object.values(d.Windspeed).length) : 0
        }));

        setWeatherData(parsedData);

        if (parsedData.length > 0) {
          const latestData = parsedData[parsedData.length - 1];
          setCurrentStats({
            temp: latestData.temperature,
            rain: latestData.rain,
            wind: latestData.wind,
            humidity: latestData.humidity,
          });
        }
      } catch (e) {
        setError(e.message);
        console.error('Error fetching weather data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Weather data loaded. UI to be implemented.</p>
    </div>
  );
};

export default Weather;