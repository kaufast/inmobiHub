import { Link } from "wouter";
import { Property } from "@shared/schema";
import { formatPrice, truncateText } from "@/lib/utils";
import { Heart, MapPin, Bed, Bath, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import ComparePropertyButton from "@/components/properties/compare-property-button";
import VerificationBadge from "@/components/users/verification-badge";

interface PropertyCardProps {
  property: Property;
  layout?: "vertical" | "horizontal";
}

export default function PropertyCard({ property, layout = "vertical" }: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Fetch favorites data to check if this property is already favorited
  const { data: favorites } = useQuery({
    queryKey: ["/api/user/favorites"],
    enabled: !!user, // Only run this query if user is logged in
    queryFn: async () => {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Check if this property is in favorites
  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      const isInFavorites = favorites.some((fav) => fav.id === Number(property.id));
      setIsFavorite(isInFavorites);
    }
  }, [favorites, property.id]);
  
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
        await apiRequest("POST", "/api/user/favorites", { propertyId: Number(property.id) });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Property added to your favorites list",
        });
      }
      
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    } catch (error: any) {
      console.error("Favorites error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (layout === "horizontal") {
    return (
      <Link href={`/property/${property.id}`}>
        <a className="block group glassmorphism-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/5 border border-white/10">
          <div className="flex flex-col sm:flex-row">
            {/* Property image */}
            <div className="relative sm:w-1/3 h-52 sm:h-auto overflow-hidden">
              {property.isPremium && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#131c28] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                    Premium
                  </div>
                </div>
              )}
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={property.title}
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <svg className="h-12 w-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white">
                <span className="font-bold text-xl">{formatPrice(property.price)}</span>
              </div>
            </div>
            
            {/* Action buttons below the image visible only on small screens */}
            <div className="sm:hidden flex justify-between p-2 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isFavorite ? 'text-secondary-500 bg-secondary-50' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavoriteToggle(e);
                  }}
                  disabled={isLoading}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-secondary-500' : ''}`} />
                  <span className="text-sm font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#131c28] text-white hover:bg-[#0c1319] transition-colors shadow-sm hover:shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareProperty(e);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
              
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center"
              >
                <ComparePropertyButton 
                  propertyId={property.id} 
                  variant="ghost" 
                  size="sm" 
                  showIcon={true}
                  showLabel={true}
                  className="text-gray-600 hover:text-secondary-500 hover:bg-gray-50 transition"
                />
              </div>
            </div>
            
            {/* Property details */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-white mb-1">{property.title}</h3>
                <p className="text-white/80 text-sm flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
                
                <p className="text-white/70 text-sm mb-4">
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
                <div className="flex items-center gap-2">
                  <button 
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isFavorite ? 'text-secondary-500 bg-secondary-50' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavoriteToggle(e);
                    }}
                    disabled={isLoading}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-secondary-500' : ''}`} />
                    <span className="text-sm font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>
                  
                  <button 
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#131c28] text-white hover:bg-[#0c1319] transition-colors shadow-sm hover:shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShareProperty(e);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="hidden sm:block"
                  >
                    <ComparePropertyButton 
                      propertyId={property.id} 
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-secondary-500 hover:bg-gray-50 transition"
                    />
                  </div>
                  <div className="text-white bg-[#131c28] hover:bg-[#0c1319] px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all">
                    View Details
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  }
  
  const handleShareProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/property/${property.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: url,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Property link has been shared",
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        // Fallback for when sharing fails
        fallbackShare(url);
      });
    } else {
      // Fallback for browsers that don't support the Share API
      fallbackShare(url);
    }
  };
  
  const fallbackShare = (url: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "Property link has been copied to your clipboard",
      });
    }).catch(err => {
      toast({
        title: "Failed to copy link",
        description: "Could not copy the property link",
        variant: "destructive",
      });
    });
  };
  
  return (
    <Link href={`/property/${property.id}`}>
      <a className="group glassmorphism-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative backdrop-blur-sm bg-white/5 border border-white/10">
        
        {/* Property image */}
        <div className="relative h-52 overflow-hidden">
          {/* Premium badge */}
          {property.isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-[#131c28] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                Premium
              </div>
            </div>
          )}
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt={property.title} 
              onMouseEnter={() => setShowQuickActions(true)}
              onMouseLeave={() => setShowQuickActions(false)}
            />
          ) : (
            <div 
              className="w-full h-full bg-primary-100 flex items-center justify-center"
              onMouseEnter={() => setShowQuickActions(true)}
              onMouseLeave={() => setShowQuickActions(false)}
            >
              <svg className="h-12 w-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 text-white">
            <span className="font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
          
          {/* Quick action buttons */}
          <div 
            className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${
              showQuickActions ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={() => setShowQuickActions(true)}
            onMouseLeave={() => setShowQuickActions(false)}
          >
            <button 
              className={`h-9 w-9 rounded-full flex items-center justify-center shadow-lg ${
                isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              } transition-all`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteToggle(e);
              }}
              disabled={isLoading}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
            
            <button 
              className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all"
              onClick={handleShareProperty}
              title="Share property"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Action buttons below the image */}
        <div className="flex justify-between p-2 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isFavorite ? 'text-secondary-500 bg-secondary-50' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteToggle(e);
              }}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-secondary-500' : ''}`} />
              <span className="text-sm font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
            
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#131c28] text-white hover:bg-[#0c1319] transition-colors shadow-sm hover:shadow-md"
              onClick={handleShareProperty}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
          
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center"
          >
            <ComparePropertyButton 
              propertyId={property.id} 
              variant="ghost" 
              size="sm" 
              showIcon={true}
              showLabel={true}
              className="text-gray-600 hover:text-secondary-500 hover:bg-gray-50 transition"
            />
          </div>
        </div>
        
        {/* Property details */}
        <div className="p-4">
          
          <h3 className="font-semibold text-lg text-white mb-1">{property.title}</h3>
          <p className="text-white/80 text-sm flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}, {property.city}, {property.state}
          </p>
          
          {/* Property features */}
          <div className="flex justify-between mt-3 text-sm text-white/70">
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Agent" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <span className="text-xs text-white/70">Listed by <span className="font-medium text-white">Agent</span></span>
            </div>
            <div className="text-white bg-[#131c28] hover:bg-[#0c1319] px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all">
              Details
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
