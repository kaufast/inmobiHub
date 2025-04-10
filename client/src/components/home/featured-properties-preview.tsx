import React from 'react';
import { Building2, Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Mock property data
const mockProperties = [
  {
    id: 1,
    title: "Luxury Waterfront Villa",
    price: 1250000,
    location: "Miami Beach, FL",
    beds: 5,
    baths: 4,
    sqft: 3200,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3",
    listingType: "sale",
    isFeatured: true,
    isNew: true
  },
  {
    id: 2,
    title: "Modern Downtown Apartment",
    price: 3500,
    location: "New York, NY",
    beds: 2,
    baths: 2,
    sqft: 1100,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3",
    listingType: "rent",
    isFeatured: true,
    isNew: false
  },
  {
    id: 3,
    title: "Charming Suburban Home",
    price: 685000,
    location: "Austin, TX",
    beds: 4,
    baths: 3,
    sqft: 2400,
    image: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?ixlib=rb-4.0.3",
    listingType: "sale",
    isFeatured: true,
    isNew: true
  }
];

export default function FeaturedPropertiesPreview() {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-transparent pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Popular Properties</h2>
        <Button variant="ghost" className="text-white/80 hover:text-white">
          View all
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <div key={property.id} className="bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 group hover:border-gray-500 transition-all">
            <div className="relative">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {property.isNew && (
                  <Badge className="bg-secondary-500 hover:bg-secondary-600 text-white">
                    New
                  </Badge>
                )}
                <Badge className={property.listingType === 'sale' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'}>
                  {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
              <button className="absolute top-2 left-2 bg-gray-900/50 backdrop-blur-sm p-1.5 rounded-full text-white/70 hover:text-white hover:bg-gray-800/80 transition-all">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-secondary-400 transition-colors">
                  {property.title}
                </h3>
                <p className="font-bold text-white whitespace-nowrap ml-2">
                  {property.listingType === 'sale' 
                    ? `$${property.price.toLocaleString()}` 
                    : `$${property.price.toLocaleString()}/mo`}
                </p>
              </div>
              
              <div className="flex items-center text-gray-300 mb-3">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm truncate">{property.location}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-700">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm text-white">{property.beds} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm text-white">{property.baths} Baths</span>
                </div>
                <div className="flex items-center">
                  <Maximize className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm text-white">{property.sqft} sqft</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}