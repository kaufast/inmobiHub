import { Link } from "wouter";
import { Property } from "@shared/schema";
import { formatPrice, truncateText } from "@/lib/utils";
import { Heart, MapPin, Bed, Bath } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: Property;
  layout?: "vertical" | "horizontal";
}

export default function PropertyCard({ property, layout = "vertical" }: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/user/favorites/${property.id}`);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Property removed from your favorites list",
        });
      } else {
        await apiRequest("POST", "/api/user/favorites", { propertyId: property.id });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Property added to your favorites list",
        });
      }
      
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (layout === "horizontal") {
    return (
      <Link href={`/property/${property.id}`}>
        <a className="block group bg-white rounded-xl overflow-hidden shadow-lg border border-primary-200 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row">
            {/* Property image */}
            <div className="relative sm:w-1/3 h-52 sm:h-auto overflow-hidden">
              {property.isPremium && (
                <Badge className="absolute top-4 left-4 z-10 bg-secondary-500 text-white">
                  Premium
                </Badge>
              )}
              <img 
                src={property.images[0]} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={property.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white">
                <span className="font-bold text-xl">{formatPrice(property.price)}</span>
              </div>
              <button 
                className={`absolute top-3 right-3 bg-white/20 hover:bg-white/40 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm text-white transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleFavoriteToggle}
                disabled={isLoading}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : ''}`} />
              </button>
            </div>
            
            {/* Property details */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-primary-800 mb-1">{property.title}</h3>
                <p className="text-primary-500 text-sm flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
                
                <p className="text-primary-600 text-sm mb-4">
                  {truncateText(property.description, 120)}
                </p>
              </div>
              
              {/* Property features */}
              <div className="flex justify-between mt-3 text-sm text-primary-600 mb-4">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms} beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} baths</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                  <span>{property.squareFeet.toLocaleString()} sqft</span>
                </div>
              </div>
              
              {/* Agent info and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Agent" />
                    <AvatarFallback>AG</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-primary-500">Listed by <span className="font-medium text-primary-700">Agent</span></span>
                </div>
                <div className="text-secondary-500 hover:text-secondary-600 text-sm font-medium">
                  View Details
                </div>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  }
  
  return (
    <Link href={`/property/${property.id}`}>
      <a className="group bg-white rounded-xl overflow-hidden shadow-lg border border-primary-200 hover:shadow-xl transition-all duration-300 relative">
        {/* Premium badge */}
        {property.isPremium && (
          <Badge className="absolute top-4 left-4 z-10 bg-secondary-500 text-white">
            Premium
          </Badge>
        )}
        
        {/* Property image */}
        <div className="relative h-52 overflow-hidden">
          <img 
            src={property.images[0]} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            alt={property.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 text-white">
            <span className="font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
          <button 
            className={`absolute top-3 right-3 bg-white/20 hover:bg-white/40 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm text-white transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : ''}`} />
          </button>
        </div>
        
        {/* Property details */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-primary-800 mb-1">{property.title}</h3>
          <p className="text-primary-500 text-sm flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}, {property.city}, {property.state}
          </p>
          
          {/* Property features */}
          <div className="flex justify-between mt-3 text-sm text-primary-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              <span>{property.squareFeet.toLocaleString()} sqft</span>
            </div>
          </div>
          
          {/* Agent info and CTA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-100">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Agent" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <span className="text-xs text-primary-500">Listed by <span className="font-medium text-primary-700">Agent</span></span>
            </div>
            <div className="text-secondary-500 hover:text-secondary-600 text-sm font-medium">
              Details
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
