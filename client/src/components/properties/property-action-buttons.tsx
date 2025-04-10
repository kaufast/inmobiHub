import { useState, useEffect } from 'react';
import { Property } from '@shared/schema';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import SharePropertyDialog from './share-property-dialog';

interface PropertyActionButtonsProps {
  property: Property;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'inline';
  showLabels?: boolean;
  className?: string;
}

export default function PropertyActionButtons({
  property,
  size = 'md',
  variant = 'default',
  showLabels = true,
  className = ''
}: PropertyActionButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Check if this property is in favorites
  const { data: favorites } = useQuery({
    queryKey: ["/api/user/favorites"],
    enabled: !!user, // Only run this query if user is logged in
    queryFn: async () => {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Set favorite state based on data
  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      const isInFavorites = favorites.some((fav) => fav.id === Number(property.id));
      setIsFavorite(isInFavorites);
    }
  }, [favorites, property.id]);

  const handleFavoriteToggle = async () => {
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

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  // Define button sizes
  const buttonSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Define variants
  if (variant === 'floating') {
    return (
      <>
        <div className={`fixed bottom-6 right-6 flex flex-col gap-3 z-40 ${className}`}>
          <Button
            className={`rounded-full shadow-lg bg-white hover:bg-gray-100 ${buttonSizeClasses[size]}`}
            size="icon"
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            <Heart 
              className={`${iconSizeClasses[size]} ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} 
            />
          </Button>
          
          <Button
            className={`rounded-full shadow-lg bg-[#131c28] hover:bg-[#0c1319] ${buttonSizeClasses[size]}`}
            size="icon"
            onClick={handleShareClick}
          >
            <Share2 className={`${iconSizeClasses[size]} text-white`} />
          </Button>
        </div>
        
        <SharePropertyDialog 
          property={property}
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
        />
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1.5 rounded-md ${isFavorite ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
            {showLabels && <span>{isFavorite ? 'Saved' : 'Save'}</span>}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-md bg-[#131c28] border-[#0c1319] text-white hover:bg-[#0c1319]"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4" />
            {showLabels && <span>Share</span>}
          </Button>
        </div>
        
        <SharePropertyDialog 
          property={property}
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant={isFavorite ? "destructive" : "outline"}
          size="sm"
          className={`flex items-center gap-1.5 ${!isFavorite && 'text-gray-600 hover:bg-gray-50'}`}
          onClick={handleFavoriteToggle}
          disabled={isLoading}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
          {showLabels && <span>{isFavorite ? 'Saved' : 'Save'}</span>}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 bg-[#131c28] border-[#0c1319] text-white hover:bg-[#0c1319]"
          onClick={handleShareClick}
        >
          <Share2 className="h-4 w-4" />
          {showLabels && <span>Share</span>}
        </Button>
      </div>
      
      <SharePropertyDialog 
        property={property}
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </>
  );
}