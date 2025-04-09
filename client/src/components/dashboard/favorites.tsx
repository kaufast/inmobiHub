import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Heart,
  MapPin,
  Bed,
  Bath,
  SquareIcon,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  Trash2,
  ExternalLink,
  Share2,
  MessageCircle,
} from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState<Property | null>(null);
  
  // Fetch favorites
  const { data: favoriteProperties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
  });
  
  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest("DELETE", `/api/user/favorites/${propertyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "The property has been removed from your favorites",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      setIsDeleteConfirmOpen(false);
      setPropertyToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter properties by search term
  const filteredProperties = () => {
    if (!favoriteProperties) return [];
    
    if (!searchTerm) return favoriteProperties;
    
    const term = searchTerm.toLowerCase();
    return favoriteProperties.filter(property => 
      property.title.toLowerCase().includes(term) || 
      property.description.toLowerCase().includes(term) || 
      property.address.toLowerCase().includes(term) || 
      property.city.toLowerCase().includes(term)
    );
  };
  
  // Start removal process
  const handleRemoveClick = (property: Property) => {
    setPropertyToRemove(property);
    setIsDeleteConfirmOpen(true);
  };
  
  // Confirm removal
  const confirmRemove = () => {
    if (propertyToRemove) {
      removeFromFavoritesMutation.mutate(propertyToRemove.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Favorite Properties</h1>
          <p className="text-primary-600">
            {favoriteProperties?.length || 0} saved properties
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400" />
          <Input
            placeholder="Search favorites..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : filteredProperties().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties().map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden group">
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/property/${property.id}`}>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share property
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact agent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleRemoveClick(property)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from favorites
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="font-bold text-xl">
                    {formatPrice(property.price)}
                  </span>
                </div>
                
                {property.isPremium && (
                  <Badge className="absolute top-3 left-3 bg-secondary-500">
                    Premium
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary-800 text-lg mb-1">
                  {property.title}
                </h3>
                <p className="text-primary-500 text-sm flex items-center mb-3">
                  <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {property.address}, {property.city}, {property.state}
                  </span>
                </p>
                
                <div className="flex justify-between text-sm text-primary-600 mb-4">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{property.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{property.bathrooms} baths</span>
                  </div>
                  <div className="flex items-center">
                    <SquareIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{property.squareFeet.toLocaleString()} sqft</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="text-xs text-primary-500">
                  Added {new Date(property.createdAt).toLocaleDateString()}
                </div>
                <Link href={`/property/${property.id}`}>
                  <Button variant="ghost" size="sm" className="text-secondary-500 hover:text-secondary-600 p-0">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-4 text-primary-400">
              <Heart className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-primary-800 mb-2">No favorite properties</h3>
            <p className="text-primary-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? "No properties match your search criteria. Try a different search term."
                : "You haven't added any properties to your favorites yet. Browse properties and click the heart icon to add them here."}
            </p>
            <Link href="/search">
              <Button className="bg-secondary-500 hover:bg-secondary-600">
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {/* Confirm removal dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove from Favorites</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this property from your favorites?
            </DialogDescription>
          </DialogHeader>
          
          {propertyToRemove && (
            <div className="flex items-center space-x-3 p-3 rounded-md bg-primary-50">
              <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                <img 
                  src={propertyToRemove.images[0]} 
                  alt={propertyToRemove.title} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-primary-800 text-sm truncate">{propertyToRemove.title}</h4>
                <p className="text-primary-500 text-xs truncate">{propertyToRemove.address}, {propertyToRemove.city}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemove}
              disabled={removeFromFavoritesMutation.isPending}
            >
              {removeFromFavoritesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
