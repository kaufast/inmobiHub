import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon, LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Property, Neighborhood } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'wouter';
import InteractiveMapTooltip from './interactive-map-tooltip';
import 'leaflet/dist/leaflet.css';

// Default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Premium marker icon
const premiumIcon = new Icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/48-bubbles/48/12.Location-512.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

interface EnhancedPropertyMapProps {
  properties?: Property[];
  initialProperty?: Property;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string | number;
  showNeighborhoodData?: boolean;
}

function MapInnerComponent() {
  const map = useMap();
  
  useEffect(() => {
    // Fix the 'tiles not loading' issue that can happen with Leaflet
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  
  return null;
}

function NeighborhoodHighlightLayer({ neighborhoodId }: { neighborhoodId?: number }) {
  const map = useMap();
  
  const { data: neighborhood } = useQuery<Neighborhood>({
    queryKey: [`/api/neighborhoods/${neighborhoodId}`],
    enabled: !!neighborhoodId,
  });
  
  useEffect(() => {
    // This would render a neighborhood polygon highlight layer
    // Would require neighborhood boundary data (GeoJSON)
    // For now, this is a placeholder
  }, [neighborhood, map]);
  
  return null;
}

export default function EnhancedPropertyMap({
  properties = [],
  initialProperty,
  center,
  zoom = 14,
  height = 500,
  showNeighborhoodData = true,
}: EnhancedPropertyMapProps) {
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Calculate center from properties if not provided
  const mapCenter = center || (initialProperty 
    ? { lat: initialProperty.latitude, lng: initialProperty.longitude }
    : properties.length > 0 
      ? { lat: properties[0].latitude, lng: properties[0].longitude }
      : { lat: 40.7128, lng: -74.006 }
  );
  
  // Update marker position when hovering
  const handleMarkerHover = (property: Property, event: LeafletMouseEvent) => {
    if (isMobile) return; // Disable hovering on mobile for better UX
    
    // Convert the marker's geographic position to pixel coordinates
    const containerPoint = event.containerPoint;
    
    setHoveredProperty(property);
    setMarkerPosition({
      x: containerPoint.x,
      y: containerPoint.y,
    });
  };
  
  const handleMarkerLeave = () => {
    setHoveredProperty(null);
    setMarkerPosition(null);
  };
  
  // Create property price markers for the map
  const createPriceMarker = (property: Property) => {
    // Premium properties get a special styling
    const isPremium = property.isPremium;
    
    // Price label HTML
    const priceLabel = `<div class="${isPremium 
      ? 'bg-secondary-500 text-white shadow-lg border-2 border-white' 
      : 'bg-white text-primary-900 shadow-md border border-primary-200'} 
      px-2 py-1 rounded-full font-medium text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg">
      ${formatPrice(property.price, true)}
    </div>`;
    
    // Create a div icon with the price
    return new DivIcon({
      html: priceLabel,
      className: 'price-marker-icon',
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    });
  };
  
  return (
    <div 
      ref={mapContainerRef}
      className="relative rounded-xl overflow-hidden border border-primary-100 shadow-md"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={zoom} 
        className="h-full w-full z-0"
        zoomControl={!isMobile}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {showNeighborhoodData && initialProperty?.neighborhoodId && (
          <NeighborhoodHighlightLayer neighborhoodId={initialProperty.neighborhoodId} />
        )}
        
        {initialProperty && (
          <Marker 
            position={[initialProperty.latitude, initialProperty.longitude]}
            icon={initialProperty.isPremium ? premiumIcon : defaultIcon}
            eventHandlers={{
              mouseover: (e) => handleMarkerHover(initialProperty, e),
              mouseout: () => handleMarkerLeave(),
            }}
          >
            <Popup>
              <Link href={`/properties/${initialProperty.id}`}>
                <a className="font-medium text-primary-900 hover:text-primary-600">
                  {initialProperty.title}
                </a>
              </Link>
              <br />
              <span className="text-sm text-primary-600">{initialProperty.address}</span>
            </Popup>
          </Marker>
        )}
        
        {properties
          .filter(p => !initialProperty || p.id !== initialProperty.id)
          .map((property) => (
            <Marker 
              key={property.id}
              position={[property.latitude, property.longitude] as LatLngExpression}
              icon={createPriceMarker(property)}
              eventHandlers={{
                mouseover: (e) => handleMarkerHover(property, e),
                mouseout: () => handleMarkerLeave(),
                click: () => window.location.href = `/properties/${property.id}`,
              }}
            />
          ))}
        
        <MapInnerComponent />
      </MapContainer>
      
      {hoveredProperty && markerPosition && (
        <InteractiveMapTooltip 
          property={hoveredProperty}
          isHovered={!!hoveredProperty}
          position={markerPosition}
        />
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm z-10 text-xs text-primary-700 border border-primary-100">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-white border border-primary-200 mr-1"></div>
          <span>Standard listing</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-4 h-4 rounded-full bg-secondary-500 border-2 border-white mr-1"></div>
          <span>Premium listing</span>
        </div>
      </div>
    </div>
  );
}