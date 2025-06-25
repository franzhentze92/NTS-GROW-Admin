import React from 'react';

const GeneralWeatherPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Title and Subtitle */}
      <div className="mb-3 p-4 bg-white rounded-xl shadow-sm">
        <h2 className="mb-1 font-bold text-xl">General Weather</h2>
        <p className="text-gray-600 mb-0">Global weather visualization and monitoring</p>
      </div>

      {/* Weather iframe with rounded corners */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div 
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
              padding: '0 0 56.308%',
              left: '0',
              top: '0',
              right: '0',
              bottom: '0'
            }}
          >
            <iframe 
              src="https://embed.ventusky.com/?p=-28.9;148.5;5&l=temperature-2m" 
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
              title="Global Weather Map"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralWeatherPage; 