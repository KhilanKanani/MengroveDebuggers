import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapboxMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  reports?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    incident_type: string;
    severity: string;
  }>;
  center?: [number, number];
  zoom?: number;
  style?: string;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  onLocationSelect,
  reports = [],
  center = [0, 0],
  zoom = 2,
  style = 'mapbox://styles/mapbox/outdoors-v12',
  className = "w-full h-96"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [needsToken, setNeedsToken] = useState(true);

  useEffect(() => {
    // Check if Mapbox token is available from environment or storage
    const token = localStorage.getItem('mapbox_token');
    if (token) {
      setMapboxToken(token);
      setNeedsToken(false);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || needsToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect(lat, lng);
      });
    }

    // Add markers for reports
    reports.forEach((report) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: ${getSeverityColor(report.severity)};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${report.title}</h3>
                <p class="text-sm text-gray-600">${report.incident_type}</p>
                <p class="text-xs text-gray-500">Severity: ${report.severity}</p>
              </div>
            `)
        )
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, needsToken, center, zoom, style, reports, onLocationSelect]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setNeedsToken(false);
    }
  };

  if (needsToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-lg border`}>
        <div className="text-center space-y-4 p-6">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground">
              Please enter your Mapbox public token to enable the map
            </p>
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full max-w-md"
            />
            <Button onClick={handleTokenSubmit} className="w-full max-w-md">
              Enable Map
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your token at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

export default MapboxMap;