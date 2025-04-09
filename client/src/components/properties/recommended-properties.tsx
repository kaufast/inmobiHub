import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Home, Bed, Bath, Square, PiggyBank, Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RecommendedProperty = {
  property: Property;
  reason: string;
};

interface RecommendedPropertiesProps {
  limit?: number;
  className?: string;
}

export default function RecommendedProperties({ limit = 3, className = "" }: RecommendedPropertiesProps) {
  const { user } = useAuth();
  
  const { data: recommendations, isLoading, error } = useQuery<RecommendedProperty[]>({
    queryKey: ["/api/properties/recommended", limit],
    queryFn: undefined, // Use default fetcher
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="bg-white/50 backdrop-blur-xl shadow-md rounded-lg border border-gray-100 p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Log in to see personalized property recommendations
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/auth">
            <Button className="mt-4">Log in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-500" />
          AI-Powered Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !recommendations || recommendations.length === 0) {
    return (
      <Card className={`bg-white/50 backdrop-blur-xl shadow-md rounded-lg border border-gray-100 p-6 ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            {error ? "Error loading recommendations" : "No recommendations available yet. Browse more properties to get personalized suggestions."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Star className="mr-2 h-5 w-5 text-yellow-500" />
        AI-Powered Recommendations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <RecommendedPropertyCard key={rec.property.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendedPropertyCard({ recommendation }: { recommendation: RecommendedProperty }) {
  const { property, reason } = recommendation;
  const mainImage = property.images && property.images.length > 0 ? property.images[0] : "/placeholder-property.jpg";

  return (
    <Card className="overflow-hidden h-full flex flex-col bg-white/50 backdrop-blur-xl hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        {property.isPremium && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Premium
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{property.title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="flex items-center text-sm">
          <PiggyBank className="h-4 w-4 mr-1 inline" />
          <span className="font-medium text-green-700">{formatPrice(property.price)}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{reason}</p>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center text-sm text-gray-600">
            <Home className="h-4 w-4 mr-1" />
            <span>{property.propertyType}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.squareFeet.toLocaleString()} sqft</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/properties/${property.id}`}>
          <Button className="w-full" variant="outline">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}