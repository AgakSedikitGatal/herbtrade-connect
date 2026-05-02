import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AlertCircle, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCoordinate } from "@/lib/complianceUtils";
import type { FarmerDigitalIdentity } from "@/types/compliance";

interface FarmLocationMapProps {
  farmerIdentity: FarmerDigitalIdentity;
}

export const FarmLocationMap = ({ farmerIdentity }: FarmLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState(() => localStorage.getItem("mapbox-token") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const center: [number, number] = [
        farmerIdentity.coordinates.longitude,
        farmerIdentity.coordinates.latitude,
      ];

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom: 12,
        pitch: 35,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

      mapRef.current.on("load", () => {
        if (!mapRef.current) return;

        const polygonCoordinates = [
          [
            ...farmerIdentity.polygon.map((point) => [point.longitude, point.latitude]),
            [farmerIdentity.polygon[0].longitude, farmerIdentity.polygon[0].latitude],
          ],
        ];

        mapRef.current.addSource("farm-polygon", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              name: farmerIdentity.farmName,
            },
            geometry: {
              type: "Polygon",
              coordinates: polygonCoordinates,
            },
          },
        });

        mapRef.current.addLayer({
          id: "farm-polygon-fill",
          type: "fill",
          source: "farm-polygon",
          paint: {
            "fill-color": farmerIdentity.deforestationRisk === "high" ? "#ef4444" : farmerIdentity.deforestationRisk === "medium" ? "#f59e0b" : "#22c55e",
            "fill-opacity": 0.25,
          },
        });

        mapRef.current.addLayer({
          id: "farm-polygon-line",
          type: "line",
          source: "farm-polygon",
          paint: {
            "line-color": "#22c55e",
            "line-width": 3,
            "line-dasharray": [2, 1],
          },
        });

        const markerElement = document.createElement("div");
        markerElement.innerHTML = `<div class="relative"><div class="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">●</div><div class="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping"></div></div>`;

        new mapboxgl.Marker(markerElement)
          .setLngLat(center)
          .setPopup(
            new mapboxgl.Popup({ offset: 24 }).setHTML(
              `<div class="p-2"><strong>${farmerIdentity.farmName}</strong><div>${formatCoordinate(farmerIdentity.coordinates.latitude, farmerIdentity.coordinates.longitude)}</div></div>`,
            ),
          )
          .addTo(mapRef.current);

        const bounds = new mapboxgl.LngLatBounds();
        polygonCoordinates[0].forEach((coordinate) => bounds.extend(coordinate as [number, number]));
        mapRef.current.fitBounds(bounds, { padding: 70, maxZoom: 14 });
      });

      mapRef.current.on("error", () => {
        setMapError("Failed to load farm geospatial map. Please check your Mapbox public token.");
      });

      setMapError(null);
    } catch (error) {
      console.error("Farm map initialization failed", error);
      setMapError("Failed to initialize farm geospatial map.");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [farmerIdentity, mapboxToken]);

  const handleSaveToken = () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem("mapbox-token", tokenInput.trim());
    setMapboxToken(tokenInput.trim());
  };

  if (!mapboxToken) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Farm Geotag Map</h3>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <Navigation className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Enable Farm Polygon Visualization</h4>
              <p className="text-sm text-muted-foreground mt-2">
                The project already uses Mapbox. Enter a public token to render farm coordinates and polygon boundaries.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-3 text-left">
              <Label htmlFor="farm-mapbox-token">Mapbox Public Token</Label>
              <Input
                id="farm-mapbox-token"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="pk.eyJ1Ijo..."
                className="bg-muted/30 border-border/50"
              />
              <Button className="w-full btn-web3" onClick={handleSaveToken}>
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Farm Geotag Map</h3>
              <p className="text-xs text-muted-foreground">
                {formatCoordinate(farmerIdentity.coordinates.latitude, farmerIdentity.coordinates.longitude)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 bg-muted/30"
            onClick={() => {
              localStorage.removeItem("mapbox-token");
              setMapboxToken("");
            }}
          >
            Reset Token
          </Button>
        </div>

        {mapError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 p-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4" />
            {mapError}
          </div>
        )}

        <div ref={mapContainer} className="h-[420px] w-full overflow-hidden rounded-lg border border-border/50" />
      </CardContent>
    </Card>
  );
};
