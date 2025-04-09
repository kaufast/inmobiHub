import React, { useState } from 'react';
import { usePropertyComparison } from '@/hooks/use-property-comparison';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  ArrowDownUp, 
  Share, 
  Printer, 
  Home, 
  Bath, 
  Bed, 
  Square, 
  Layers 
} from 'lucide-react';
import { formatPrice, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { PropertyComparisonSlide } from './property-comparison-slide';

export default function PropertyComparisonDashboard() {
  const { compareIds, removeFromCompare, clearComparison } = usePropertyComparison();
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sqft-asc' | 'sqft-desc'>('default');
  const { toast } = useToast();
  
  // Fetch property details for all properties in comparison
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['properties-comparison', compareIds],
    queryFn: async () => {
      if (compareIds.length === 0) return [];
      
      const propertiesData = await Promise.all(
        compareIds.map(async (id) => {
          const res = await fetch(`/api/properties/${id}`);
          if (!res.ok) throw new Error(`Failed to fetch property ${id}`);
          return res.json();
        })
      );
      
      return propertiesData;
    },
    enabled: compareIds.length > 0,
  });
  
  // Handle sorting properties
  const sortedProperties = React.useMemo(() => {
    if (!properties) return [];
    
    let sorted = [...properties];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'sqft-asc':
        return sorted.sort((a, b) => a.squareFeet - b.squareFeet);
      case 'sqft-desc':
        return sorted.sort((a, b) => b.squareFeet - a.squareFeet);
      default:
        return sorted;
    }
  }, [properties, sortBy]);
  
  // Print comparison
  const handlePrint = () => {
    window.print();
  };
  
  // Share comparison
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Property Comparison',
        text: 'Check out these properties I\'m comparing',
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast({
            title: 'Link copied',
            description: 'Comparison link copied to clipboard',
          });
        })
        .catch(err => {
          toast({
            title: 'Failed to copy link',
            description: 'Please try again',
            variant: 'destructive',
          });
        });
    }
  };
  
  // Check if a value differs across properties
  const isDifferent = (key: keyof Property, properties: Property[]) => {
    if (!properties || properties.length < 2) return false;
    
    const firstValue = properties[0][key];
    return properties.some(property => property[key] !== firstValue);
  };
  
  // Determine if a cell should be highlighted
  const shouldHighlight = (key: keyof Property, properties: Property[]) => {
    return highlightDifferences && isDifferent(key, properties);
  };
  
  // Empty state
  if (compareIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-center">
        <div className="p-6 rounded-full bg-primary-50 mb-6">
          <ArrowDownUp className="h-12 w-12 text-primary-300" />
        </div>
        <h2 className="text-2xl font-bold text-primary-900 mb-3">No Properties to Compare</h2>
        <p className="text-primary-600 mb-6 max-w-md">
          Add properties to your comparison list by clicking the comparison button on property cards.
        </p>
        <Link href="/search">
          <Button className="bg-secondary-500 hover:bg-secondary-600">
            Browse Properties
          </Button>
        </Link>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Property Comparison</h2>
          <div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(compareIds.length).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render property card component
  const PropertyCard = ({ property }: { property: Property }) => {
    return (
      <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100 flex flex-col">
        {/* Property Image & Price */}
        <div className="relative">
          <img 
            src={property.images?.[0] || '/placeholder-property.jpg'} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFromCompare(property.id)}
              className="bg-white/80 hover:bg-white text-primary-900 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {property.isPremium && (
            <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1">{property.title}</h3>
            <p className="text-primary-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
          
          <div className="flex-1">
            <p className="text-primary-700 mb-4">{truncateText(property.description, 150)}</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`p-3 rounded bg-primary-50 ${shouldHighlight('bedrooms', sortedProperties) ? 'ring-2 ring-secondary-400' : ''}`}>
                <p className="text-xs text-primary-600">Bedrooms</p>
                <p className="text-lg font-semibold text-primary-900">{property.bedrooms}</p>
              </div>
              
              <div className={`p-3 rounded bg-primary-50 ${shouldHighlight('bathrooms', sortedProperties) ? 'ring-2 ring-secondary-400' : ''}`}>
                <p className="text-xs text-primary-600">Bathrooms</p>
                <p className="text-lg font-semibold text-primary-900">{property.bathrooms}</p>
              </div>
              
              <div className={`p-3 rounded bg-primary-50 ${shouldHighlight('squareFeet', sortedProperties) ? 'ring-2 ring-secondary-400' : ''}`}>
                <p className="text-xs text-primary-600">Sq. Feet</p>
                <p className="text-lg font-semibold text-primary-900">{property.squareFeet.toLocaleString()}</p>
              </div>
              
              <div className={`p-3 rounded bg-primary-50 ${shouldHighlight('yearBuilt', sortedProperties) ? 'ring-2 ring-secondary-400' : ''}`}>
                <p className="text-xs text-primary-600">Year Built</p>
                <p className="text-lg font-semibold text-primary-900">{property.yearBuilt || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-primary-100">
            <Link href={`/property/${property.id}`}>
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  // Property Details Card Component
  const PropertyDetailsCard = ({ property }: { property: Property }) => {
    return (
      <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100 flex flex-col">
        {/* Property Image & Price */}
        <div className="relative">
          <img 
            src={property.images?.[0] || '/placeholder-property.jpg'} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFromCompare(property.id)}
              className="bg-white/80 hover:bg-white text-primary-900 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {property.isPremium && (
            <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1">{property.title}</h3>
            <p className="text-primary-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className={`flex justify-between border-b pb-2 ${shouldHighlight('propertyType', sortedProperties) ? 'bg-secondary-50' : ''}`}>
              <span className="text-primary-600">Type</span>
              <span className="text-primary-900 font-medium">{property.propertyType}</span>
            </div>
            
            <div className={`flex justify-between border-b pb-2 ${shouldHighlight('lotSize', sortedProperties) ? 'bg-secondary-50' : ''}`}>
              <span className="text-primary-600">Lot Size</span>
              <span className="text-primary-900 font-medium">{property.lotSize ? property.lotSize.toLocaleString() + ' sq ft' : 'N/A'}</span>
            </div>
            
            <div className={`flex justify-between border-b pb-2 ${shouldHighlight('garageSpaces', sortedProperties) ? 'bg-secondary-50' : ''}`}>
              <span className="text-primary-600">Garage</span>
              <span className="text-primary-900 font-medium">{property.garageSpaces || '0'} cars</span>
            </div>
            
            <div className={`flex justify-between border-b pb-2 ${shouldHighlight('listingType', sortedProperties) ? 'bg-secondary-50' : ''}`}>
              <span className="text-primary-600">Listing Type</span>
              <span className="text-primary-900 font-medium capitalize">{property.listingType || 'Sale'}</span>
            </div>
            
            {property.isPremium && (
              <div className={`flex justify-between border-b pb-2`}>
                <span className="text-primary-600">Price per Sq Ft</span>
                <span className="text-primary-900 font-medium">${Math.round(property.price / property.squareFeet)}</span>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-primary-100">
            <Link href={`/property/${property.id}`}>
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  // Property Features Card Component
  const PropertyFeaturesCard = ({ property }: { property: Property }) => {
    return (
      <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100 flex flex-col">
        {/* Property Image & Price */}
        <div className="relative">
          <img 
            src={property.images?.[0] || '/placeholder-property.jpg'} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFromCompare(property.id)}
              className="bg-white/80 hover:bg-white text-primary-900 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {property.isPremium && (
            <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1">{property.title}</h3>
            <p className="text-primary-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
          
          <div className="space-y-3 flex-1">
            {property.features && property.features.length > 0 ? (
              <ul className="text-primary-700 space-y-1">
                {property.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-secondary-500 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-primary-500 italic">No features listed</p>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-primary-100">
            <Link href={`/property/${property.id}`}>
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  // Property Location Card Component
  const PropertyLocationCard = ({ property }: { property: Property }) => {
    return (
      <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100 flex flex-col">
        {/* Property Image & Price */}
        <div className="relative">
          <img 
            src={property.images?.[0] || '/placeholder-property.jpg'} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFromCompare(property.id)}
              className="bg-white/80 hover:bg-white text-primary-900 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {property.isPremium && (
            <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1">{property.title}</h3>
            <p className="text-primary-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="text-center mb-3">
                <h4 className="font-medium text-primary-900">Location Score</h4>
                <div className="flex justify-center">
                  <span className="text-3xl font-bold text-secondary-600">
                    {property.locationScore ? property.locationScore : '85'}/100
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded">
                  <p className="text-primary-600">Schools</p>
                  <p className="font-medium text-primary-900">★★★★☆</p>
                </div>
                
                <div className="bg-white p-2 rounded">
                  <p className="text-primary-600">Transit</p>
                  <p className="font-medium text-primary-900">★★★☆☆</p>
                </div>
                
                <div className="bg-white p-2 rounded">
                  <p className="text-primary-600">Walkability</p>
                  <p className="font-medium text-primary-900">★★★★☆</p>
                </div>
                
                <div className="bg-white p-2 rounded">
                  <p className="text-primary-600">Safety</p>
                  <p className="font-medium text-primary-900">★★★★★</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-primary-100">
            <Link href={`/property/${property.id}`}>
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  // Property Investment Card Component
  const PropertyInvestmentCard = ({ property }: { property: Property }) => {
    return (
      <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100 flex flex-col">
        {/* Property Image & Price */}
        <div className="relative">
          <img 
            src={property.images?.[0] || '/placeholder-property.jpg'} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFromCompare(property.id)}
              className="bg-white/80 hover:bg-white text-primary-900 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {property.isPremium && (
            <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1">{property.title}</h3>
            <p className="text-primary-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
          
          <div className="space-y-3 flex-1">
            {property.isPremium ? (
              <>
                <div className="bg-secondary-50 p-4 rounded-lg mb-3">
                  <h4 className="font-medium text-primary-900 mb-2">Investment Potential</h4>
                  <div className="text-3xl font-bold text-secondary-600 mb-1">★★★★☆</div>
                  <p className="text-sm text-primary-700">Strong growth potential in this area</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Est. Monthly Rental</span>
                    <span className="font-medium text-primary-900">${Math.round(property.price * 0.005).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Rental Yield</span>
                    <span className="font-medium text-primary-900">~{(6 + Math.random() * 2).toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">5-Yr Appreciation</span>
                    <span className="font-medium text-primary-900">~{(15 + Math.random() * 10).toFixed(1)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Plus className="h-10 w-10 text-primary-300 mb-3" />
                <h4 className="text-primary-900 font-medium mb-2">Premium Feature</h4>
                <p className="text-primary-600 text-sm mb-4">
                  Upgrade to Premium to access investment analytics for this property
                </p>
                <Button size="sm" className="bg-secondary-500 hover:bg-secondary-600">
                  Upgrade
                </Button>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-primary-100">
            <Link href={`/property/${property.id}`}>
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="comparison-dashboard p-6 space-y-6" id="property-comparison">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Property Comparison</h2>
          <p className="text-primary-600">Comparing {sortedProperties.length} properties</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  className={highlightDifferences ? 'bg-secondary-50 border-secondary-200 text-secondary-700' : ''}
                >
                  <ArrowDownUp className="h-4 w-4 mr-1" />
                  Highlight Differences
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Highlight values that differ between properties</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowDownUp className="h-4 w-4 mr-1" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('default')}>
                Default Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-asc')}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-desc')}>
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('sqft-asc')}>
                Size: Small to Large
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('sqft-desc')}>
                Size: Large to Small
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          
          <Button variant="outline" size="sm" onClick={clearComparison}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>
      
      {/* Comparison Tabs */}
      <Tabs defaultValue="slide">
        <TabsList className="mb-6">
          <TabsTrigger value="slide">
            <Layers className="h-4 w-4 mr-2" />
            Slide View
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          {sortedProperties.some(p => p.isPremium) && (
            <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
          )}
        </TabsList>
        
        {/* Slide View */}
        <TabsContent value="slide" className="flex-1 overflow-hidden">
          <PropertyComparisonSlide />
        </TabsContent>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <ScrollArea className="w-full pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Details Tab */}
        <TabsContent value="details">
          <ScrollArea className="w-full pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              {sortedProperties.map((property) => (
                <PropertyDetailsCard key={property.id} property={property} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features">
          <ScrollArea className="w-full pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              {sortedProperties.map((property) => (
                <PropertyFeaturesCard key={property.id} property={property} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Location Tab */}
        <TabsContent value="location">
          <ScrollArea className="w-full pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              {sortedProperties.map((property) => (
                <PropertyLocationCard key={property.id} property={property} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Investment Tab */}
        <TabsContent value="investment">
          <ScrollArea className="w-full pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              {sortedProperties.map((property) => (
                <PropertyInvestmentCard key={property.id} property={property} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}