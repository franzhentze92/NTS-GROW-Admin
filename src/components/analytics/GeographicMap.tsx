import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeographicData } from '@/lib/analyticsApi';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeographicMapProps {
  data: GeographicData[];
  loading?: boolean;
}

const GeographicMap: React.FC<GeographicMapProps> = ({ data, loading = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-25.2744, 133.7751], 4); // Center on Australia

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    data.forEach(location => {
      if (location.latitude && location.longitude) {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.divIcon({
            html: `
              <div class="location-marker">
                <div class="marker-pulse"></div>
                <div class="marker-dot"></div>
              </div>
            `,
            className: 'custom-location-marker',
            iconSize: L.point(20, 20),
            iconAnchor: L.point(10, 10)
          })
        });

        // Create popup content
        const popupContent = `
          <div class="location-popup">
            <h3>${location.city || 'Unknown City'}</h3>
            <p><strong>Country:</strong> ${location.country}</p>
            <p><strong>Region:</strong> ${location.region || 'Unknown'}</p>
            <p><strong>Visitors:</strong> ${location.visitors.toLocaleString()}</p>
            <p><strong>Page Views:</strong> ${location.page_views.toLocaleString()}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      }
    });

    // Fit bounds if we have data
    if (data.length > 0 && markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      const bounds = group.getBounds();
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, loading]);

  if (loading) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Geographic Distribution</h3>
        <div className="text-sm text-muted-foreground">
          {data.length} locations • {data.reduce((sum, loc) => sum + loc.visitors, 0).toLocaleString()} visitors
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-96 rounded-lg border bg-background"
        style={{ zIndex: 1 }}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-location-marker {
            background: transparent;
            border: none;
          }
          
          .location-marker {
            position: relative;
            width: 20px;
            height: 20px;
          }
          
          .marker-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .marker-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
          
          .location-popup {
            min-width: 200px;
          }
          
          .location-popup h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
          }
          
          .location-popup p {
            margin: 4px 0;
            font-size: 14px;
          }
        `
      }} />
    </div>
  );
};

export default GeographicMap; 