import { useEffect, useRef } from "react";
import { Property } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  properties?: Property[];
  address?: string;
  center?: { lat: number; lng: number };
}

export default function PropertyMap({ 
  lat, 
  lng, 
  zoom = 14, 
  properties = [], 
  address,
  center
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  // Load Leaflet stylesheet
  useEffect(() => {
    const loadLeaflet = async () => {
      const leafletStylesheet = document.createElement('link');
      leafletStylesheet.rel = 'stylesheet';
      leafletStylesheet.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(leafletStylesheet);
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    // Dynamic import for Leaflet (server-side rendering compatibility)
    const initMap = async () => {
      if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
        try {
          const L = await import('leaflet');
          
          // Set center location
          let centerLat = center?.lat || lat || 40.7128;
          let centerLng = center?.lng || lng || -74.0060;
          
          // Create map
          mapInstanceRef.current = L.map(mapRef.current).setView([centerLat, centerLng], zoom);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);
          
          // If there's a single property location (detail page)
          if (lat && lng && address) {
            L.marker([lat, lng])
              .addTo(mapInstanceRef.current)
              .bindPopup(address)
              .openPopup();
          }
          
          // For multiple properties (search results)
          if (properties.length > 0) {
            const bounds = L.latLngBounds([]);
            
            properties.forEach(property => {
              const marker = L.marker([property.latitude, property.longitude])
                .addTo(mapInstanceRef.current)
                .bindPopup(`
                  <div style="width: 200px">
                    <img src="${property.images[0]}" alt="${property.title}" style="width: 100%; height: 100px; object-fit: cover; margin-bottom: 8px; border-radius: 4px;">
                    <h3 style="font-weight: 600; margin-bottom: 4px">${formatPrice(property.price)}</h3>
                    <p style="font-size: 0.875rem; margin-bottom: 4px">${property.bedrooms} bd | ${property.bathrooms} ba | ${property.squareFeet.toLocaleString()} sqft</p>
                    <p style="font-size: 0.75rem; color: #64748b;">${property.address}, ${property.city}</p>
                  </div>
                `);
              
              // Add to bounds for auto-zoom
              bounds.extend([property.latitude, property.longitude]);
            });
            
            // Fit map to show all markers
            if (properties.length > 1) {
              mapInstanceRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
              });
            }
          }
        } catch (error) {
          console.error("Error loading map:", error);
        }
      }
    };
    
    initMap();
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, properties, address, center]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
