import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface ShipmentLocation {
  name: string;
  coordinates: [number, number];
  status: 'completed' | 'current' | 'pending';
}

interface ShipmentMapProps {
  locations?: ShipmentLocation[];
}

const defaultLocations: ShipmentLocation[] = [
  { name: 'Jakarta Port, Indonesia', coordinates: [106.8456, -6.1088], status: 'completed' },
  { name: 'Singapore Hub', coordinates: [103.8198, 1.3521], status: 'completed' },
  { name: 'Hong Kong Port', coordinates: [114.1694, 22.3193], status: 'current' },
  { name: 'Destination Port', coordinates: [121.4737, 31.2304], status: 'pending' },
];

export const ShipmentMap = ({ locations = defaultLocations }: ShipmentMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(() => 
    localStorage.getItem('mapbox-token') || ''
  );
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [110, 10],
        zoom: 3,
        pitch: 30,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', () => {
        if (!map.current) return;

        // Add route line
        const routeCoordinates = locations.map(loc => loc.coordinates);
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#22c55e',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 1],
          },
        });

        // Add markers for each location
        locations.forEach((location, index) => {
          const el = document.createElement('div');
          el.className = 'shipment-marker';
          el.innerHTML = `
            <div class="relative">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                location.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : location.status === 'current'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-500 text-white'
              }">
                ${index + 1}
              </div>
              ${location.status === 'current' ? '<div class="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping"></div>' : ''}
            </div>
          `;

          new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
                  <strong>${location.name}</strong>
                  <div class="text-xs mt-1 capitalize ${
                    location.status === 'completed' ? 'text-green-600' :
                    location.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                  }">${location.status}</div>
                </div>`
              )
            )
            .addTo(map.current!);
        });

        // Fit bounds to show all markers
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(loc => bounds.extend(loc.coordinates));
        map.current.fitBounds(bounds, { padding: 50 });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your Mapbox token.');
      });

      setMapError(null);
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map. Please check your token.');
    }
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap(mapboxToken);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox-token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
    }
  };

  if (!mapboxToken) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Shipment Map</h3>
          </div>
          
          <div className="p-6 rounded-lg bg-muted/30 border border-border/50 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Navigation className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Enable Map Tracking</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your Mapbox public token to visualize the shipment route. 
                Get your token at{' '}
                <a 
                  href="https://mapbox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <div className="space-y-2 text-left">
                <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                <Input
                  id="mapbox-token"
                  type="text"
                  placeholder="pk.eyJ1Ijo..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="glass border-border/50"
                />
              </div>
              <Button onClick={handleSaveToken} className="w-full btn-web3">
                <MapPin className="h-4 w-4 mr-2" />
                Enable Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Live Shipment Tracking</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-muted-foreground">Pending</span>
            </div>
          </div>
        </div>

        {mapError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">{mapError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-red-400"
              onClick={() => {
                localStorage.removeItem('mapbox-token');
                setMapboxToken('');
                setTokenInput('');
              }}
            >
              Reset Token
            </Button>
          </div>
        )}

        <div 
          ref={mapContainer} 
          className="w-full h-[400px] rounded-lg overflow-hidden border border-border/50"
        />
      </CardContent>
    </Card>
  );
};
