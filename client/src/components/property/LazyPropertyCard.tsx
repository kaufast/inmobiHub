import { useState, useEffect, type ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { Property } from '@shared/schema';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Link } from 'wouter';
import { Heart, MapPin, Building, BedDouble, Bath, ArrowUpRight, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface LazyPropertyCardProps {
  property: Property;
  showFavoriteButton?: boolean;
  priority?: boolean; 
  className?: string;
  matchScore?: number; // For AI recommendation match score
  matchReason?: string; // For AI recommendation reason
  onClick?: () => void;
  onFavoriteToggle?: (propertyId: number, isFavorited: boolean) => void;
}

/**
 * Optimized Property Card Component with lazy loading for better LCP
 * - Uses Intersection Observer for visibility detection
 * - Only renders full content when in viewport
 * - Optimizes image loading
 * - Shows skeleton while loading
 * - Provides favorite functionality
 */
export function LazyPropertyCard({
  property,
  showFavoriteButton = true,
  priority = false,
  className = '',
  matchScore,
  matchReason,
  onClick,
  onFavoriteToggle
}: LazyPropertyCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Start loading earlier for better UX
  });
  
  const [isLoaded, setIsLoaded] = useState(priority);
  const [favorited, setFavorited] = useState(property.favorited || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    
    try {
      if (favorited) {
        await apiRequest('DELETE', `/api/user/favorites/${property.id}`);
        toast({
          title: "Removed from favorites",
          description: "Property removed from your saved list"
        });
      } else {
        await apiRequest('POST', '/api/user/favorites', { propertyId: property.id });
        toast({
          title: "Added to favorites!",
          description: "Property saved to your favorites"
        });
      }
      
      setFavorited(!favorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(property.id, !favorited);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update favorite status. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Get the first image or fallback
  const coverImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : '/assets/property-placeholder.jpg';
  
  // For loading skeleton or partial content
  if (!inView && !priority) {
    return (
      <div 
        ref={ref}
        className={`rounded-lg overflow-hidden border border-border bg-card shadow-sm h-[400px] ${className}`}
        aria-busy="true"
      >
        <Skeleton className="w-full h-[200px]" />
        <div className="p-4 space-y-3">
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-1/2 h-4" />
          <div className="flex space-x-2 mt-2">
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
          </div>
          <Skeleton className="w-full h-10 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`group relative rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all ${className}`}
      onClick={onClick}
    >
      {/* Premium badge */}
      {property.isPremium && (
        <Badge variant="default" className="absolute top-3 left-3 z-10 bg-primary text-white">
          Premium
        </Badge>
      )}
      
      {/* Match score badge for recommendations */}
      {matchScore !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-primary/90 text-white rounded-md px-2 py-1 text-sm font-semibold flex items-center gap-1">
          <span className="text-xs">Match</span>
          <span>{Math.round(matchScore)}%</span>
        </div>
      )}
      
      {/* Favorite button */}
      {showFavoriteButton && (
        <Button
          size="icon"
          variant={favorited ? "default" : "outline"}
          className={`absolute top-3 right-3 z-10 rounded-full p-1 h-8 w-8 ${favorited ? 'bg-primary text-white' : 'bg-background/70 backdrop-blur-sm hover:bg-background/90'}`}
          onClick={toggleFavorite}
          disabled={isTogglingFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={favorited ? 'fill-current' : ''} size={18} />
        </Button>
      )}
      
      {/* Property image with optimization */}
      <div className="relative h-[200px] overflow-hidden">
        <OptimizedImage
          src={coverImage}
          alt={property.title}
          width={400}
          height={200}
          priority={priority}
          onLoad={handleImageLoad}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Absolute positioned property type badge */}
        <Badge variant="outline" className="absolute bottom-3 left-3 z-10 bg-background/70 backdrop-blur-sm text-foreground">
          {property.propertyType === 'apartment' ? (
            <Building size={14} className="mr-1" />
          ) : (
            <Building size={14} className="mr-1" />
          )}
          {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <Link href={`/property/${property.id}`}>
          <a className="block group-hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg line-clamp-1 flex items-center">
              {property.title}
              <ArrowUpRight size={14} className="ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </a>
        </Link>
        
        <div className="flex items-center mt-1 text-muted-foreground text-sm">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">
            {property.address}, {property.city}, {property.country}
          </span>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {formatCurrency(property.price)}
          </div>
          
          {property.transactionType === 'rent' && (
            <Badge variant="outline" className="text-xs">
              For Rent
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <BedDouble size={16} className="mr-1" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Bath size={16} className="mr-1" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Maximize size={16} className="mr-1" />
            <span>{property.squareFeet} ft²</span>
          </div>
        </div>
        
        {/* AI Match Reason Tooltip */}
        {matchReason && (
          <div className="mt-3 text-xs bg-muted p-2 rounded-md">
            <span className="font-semibold">Match reason:</span> {matchReason}
          </div>
        )}
        
        {/* View Details Button */}
        <Button 
          variant="default" 
          className="w-full mt-4"
          asChild
        >
          <Link href={`/property/${property.id}`}>
            <a>View Details</a>
          </Link>
        </Button>
      </div>
    </div>
  );
}