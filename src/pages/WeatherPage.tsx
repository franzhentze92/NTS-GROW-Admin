import React from 'react';

const WeatherPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weather Forecast</h1>
        <p className="text-muted-foreground">
          View real-time weather maps and forecasts for your region.
        </p>
      </div>
      <div 
        className="rounded-lg overflow-hidden shadow-lg"
        style={{
          display: 'block',
          position: 'relative',
          maxWidth: '177.596vh',
          margin: 'auto',
          padding: '0',
          border: '0'
        }}
      >
        <div 
          style={{
            display: 'block',
            position: 'relative',
            width: '100%',
            height: '0',
            boxSizing: 'content-box',
            margin: '0',
            border: '0',
            padding: '0 0 56.308% 0',
            left: '0',
            top: '0',
            right: '0',
            bottom: '0'
          }}
        >
          <iframe 
            src="https://embed.ventusky.com/?p=-28.02;153.03;6&l=temperature-2m" 
            style={{
              display: 'block',
              position: 'absolute',
              left: '0',
              top: '0',
              width: '100%',
              height: '100%',
              margin: '0',
              padding: '0',
              border: '0',
              right: 'auto',
              bottom: 'auto'
            }} 
            loading="lazy"
            title="Ventusky Weather Map"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage; 