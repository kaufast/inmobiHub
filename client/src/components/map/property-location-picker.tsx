import { useEffect, useRef, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents,
  Popup
} from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Home, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Fix icon paths for Leaflet
import { useIsMobile } from "@/hooks/use-mobile";

interface PropertyLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
  className?: string;
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// LocationMarker component that handles map interactions
function LocationMarker({ 
  initialPosition, 
  onPositionChange,
  readOnly = false
}: { 
  initialPosition?: [number, number];
  onPositionChange: (position: LatLng) => void;
  readOnly?: boolean;
}) {
  const [position, setPosition] = useState<LatLng | null>(
    initialPosition ? new LatLng(initialPosition[0], initialPosition[1]) : null
  );
  const { t } = useTranslation();
  
  const map = useMapEvents({
    click(e) {
      if (readOnly) return;
      
      setPosition(e.latlng);
      onPositionChange(e.latlng);
    },
  });

  useEffect(() => {
    if (initialPosition) {
      setPosition(new LatLng(initialPosition[0], initialPosition[1]));
      map.flyTo(initialPosition, map.getZoom());
    }
  }, [initialPosition, map]);

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={customIcon}
      draggable={!readOnly}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPosition = marker.getLatLng();
          setPosition(newPosition);
          onPositionChange(newPosition);
        },
      }}
    >
      <Popup>
        <div className="text-center">
          <MapPin className="inline-block mb-1 text-primary" size={18} />
          <div>
            {t('property.selectedLocation')}
            <div className="text-sm text-muted-foreground">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function PropertyLocationPicker({ 
  latitude, 
  longitude, 
  onLocationChange,
  readOnly = false,
  className
}: PropertyLocationPickerProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // NYC default
  const initialPosition = latitude && longitude ? [latitude, longitude] as [number, number] : undefined;
  const [currentSearch, setCurrentSearch] = useState('');

  const handlePositionChange = (newPosition: LatLng) => {
    onLocationChange(newPosition.lat, newPosition.lng);
  };

  const handleSearch = async () => {
    if (!currentSearch.trim() || !mapRef.current) return;
    
    try {
      // Use Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentSearch)}`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Get first result
        const { lat, lon } = data[0];
        
        // Convert to numbers
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        // Update location and fly to it
        onLocationChange(newLat, newLng);
        
        // Get map instance from ref and fly to location
        const map = (mapRef.current as any)?.leafletElement;
        if (map) {
          map.flyTo([newLat, newLng], 15);
        }
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {!readOnly && (
        <div className="flex flex-col md:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('property.searchLocationPlaceholder')}
              className="w-full p-2 pr-10 rounded-md border border-input bg-background"
              value={currentSearch}
              onChange={(e) => setCurrentSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <MapPin size={18} />
            </button>
          </div>
          <Button onClick={handleSearch} variant="outline" className="shrink-0">
            {t('common.search')}
          </Button>
        </div>
      )}
      
      <div className={cn(
        "relative border rounded-md overflow-hidden",
        isMobile ? "h-[300px]" : "h-[500px]"
      )}>
        <MapContainer
          center={initialPosition || defaultCenter}
          zoom={initialPosition ? 15 : 10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            initialPosition={initialPosition}
            onPositionChange={handlePositionChange}
            readOnly={readOnly}
          />
        </MapContainer>
        
        {!readOnly && (
          <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-80 p-3 rounded-md shadow text-sm">
            <Home className="inline-block mr-2 text-primary" size={16} />
            {initialPosition 
              ? t('property.locationSelected') 
              : t('property.clickMapToSetLocation')}
          </div>
        )}
      </div>
    </div>
  );
}