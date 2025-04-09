import React, { useState, useEffect, useCallback } from 'react';
import { usePropertyComparison } from '@/hooks/use-property-comparison';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Heart, 
  Home, 
  Bath, 
  Bed, 
  Square,
  ArrowDownUp,
  Check,
  Share
} from 'lucide-react';
import { formatPrice, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

export function PropertyComparisonSlide() {
  const { compareIds, removeFromCompare, clearComparison } = usePropertyComparison();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<Property | null>(null);
  const [sortedProperties, setSortedProperties] = useState<Property[]>([]);
  const [activeFeature, setActiveFeature] = useState<string>('price');
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

  useEffect(() => {
    if (properties && properties.length > 0) {
      setSortedProperties(properties);
    }
  }, [properties]);

  // Handle navigation
  const goToNext = useCallback(() => {
    if (!sortedProperties.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedProperties.length - 1 ? 0 : prevIndex + 1
    );
  }, [sortedProperties]);

  const goToPrevious = useCallback(() => {
    if (!sortedProperties.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedProperties.length - 1 : prevIndex - 1
    );
  }, [sortedProperties]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious]);

  // Handle removing a property
  const handleRemoveProperty = (propertyId: number) => {
    removeFromCompare(propertyId);
    toast({
      title: "Property removed",
      description: "Property removed from comparison",
    });
  };

  // Expand property details
  const handleExpandProperty = (property: Property) => {
    setExpandedProperty(property);
  };

  // Get relative value indicators
  const getRelativeValues = (properties: Property[], feature: keyof Property) => {
    if (!properties || properties.length < 2) return {};

    const values = properties.map(p => typeof p[feature] === 'number' ? p[feature] as number : 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const result: Record<number, { value: number, percentage: number }> = {};
    
    properties.forEach((property, index) => {
      const value = typeof property[feature] === 'number' ? property[feature] as number : 0;
      const percentage = range === 0 ? 100 : ((value - min) / range) * 100;
      result[property.id] = { value, percentage };
    });

    return result;
  };

  // Feature comparison data display
  const renderFeatureComparison = (properties: Property[]) => {
    if (!properties || properties.length < 2) return null;

    const features: { key: keyof Property, label: string }[] = [
      { key: 'price', label: 'Price' },
      { key: 'squareFeet', label: 'Square Feet' },
      { key: 'bedrooms', label: 'Bedrooms' },
      { key: 'bathrooms', label: 'Bathrooms' },
      { key: 'yearBuilt', label: 'Year Built' }
    ];

    const activeFeatureData = getRelativeValues(properties, activeFeature as keyof Property);
    const currentProperty = properties[currentIndex];

    if (!currentProperty || !activeFeatureData) return null;

    return (
      <div className="px-4 py-2 mt-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">{features.find(f => f.key === activeFeature)?.label}</div>
          <div className="flex space-x-1">
            {features.map((feature) => (
              <Button
                key={feature.key as string}
                variant={activeFeature === feature.key ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setActiveFeature(feature.key as string)}
              >
                {feature.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {properties.map((property) => {
            const data = activeFeatureData[property.id];
            return (
              <div key={property.id} className={`relative ${property.id === currentProperty.id ? 'bg-secondary-50 p-2 rounded-md' : ''}`}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {property.id === currentProperty.id && <Check className="h-3 w-3 inline mr-1 text-secondary-500" />}
                    {property.title}
                  </span>
                  <span className="text-sm font-bold">
                    {activeFeature === 'price' 
                      ? formatPrice(data.value) 
                      : activeFeature === 'squareFeet' 
                        ? `${data.value.toLocaleString()} sqft` 
                        : data.value}
                  </span>
                </div>
                <Progress value={data.percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (compareIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
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

  if (isLoading || !sortedProperties.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center w-full max-w-3xl">
          <div className="h-48 w-full bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-full bg-gray-200 mt-4 rounded"></div>
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentProperty = sortedProperties[currentIndex];

  return (
    <>
      <div className="property-comparison-slide p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-900">Interactive Comparison</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={highlightDifferences ? 'bg-secondary-50 border-secondary-200' : ''}
            >
              <ArrowDownUp className="h-4 w-4 mr-1" />
              Highlight Differences
            </Button>
            <Button variant="outline" size="sm" onClick={clearComparison}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="comparison-carousel relative mb-4">
          <div className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full" 
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="comparison-card bg-white rounded-xl shadow-md overflow-hidden border border-primary-100">
            <div className="relative">
              <img 
                src={currentProperty.images?.[0] || '/placeholder-property.jpg'} 
                alt={currentProperty.title}
                className="w-full h-64 object-cover"
              />
              {currentProperty.isPremium && (
                <Badge className="absolute top-4 left-4 bg-secondary-500">Premium</Badge>
              )}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={() => handleExpandProperty(currentProperty)}
                  className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={() => handleRemoveProperty(currentProperty.id)}
                  className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <span className="text-white font-bold text-xl">{formatPrice(currentProperty.price)}</span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-primary-900 mb-1">{currentProperty.title}</h3>
                <p className="text-primary-600 text-sm">{currentProperty.address}, {currentProperty.city}, {currentProperty.state}</p>
              </div>

              <p className="text-primary-700 mb-4">{truncateText(currentProperty.description, 150)}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded bg-primary-50 flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-primary-400" />
                  <div>
                    <p className="text-xs text-primary-600">Bedrooms</p>
                    <p className="text-lg font-semibold text-primary-900">{currentProperty.bedrooms}</p>
                  </div>
                </div>
                
                <div className="p-3 rounded bg-primary-50 flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-primary-400" />
                  <div>
                    <p className="text-xs text-primary-600">Bathrooms</p>
                    <p className="text-lg font-semibold text-primary-900">{currentProperty.bathrooms}</p>
                  </div>
                </div>
                
                <div className="p-3 rounded bg-primary-50 flex items-center">
                  <Square className="h-5 w-5 mr-2 text-primary-400" />
                  <div>
                    <p className="text-xs text-primary-600">Sq. Feet</p>
                    <p className="text-lg font-semibold text-primary-900">{currentProperty.squareFeet.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="p-3 rounded bg-primary-50 flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary-400" />
                  <div>
                    <p className="text-xs text-primary-600">Type</p>
                    <p className="text-lg font-semibold text-primary-900 capitalize">{currentProperty.propertyType}</p>
                  </div>
                </div>
              </div>

              {/* Feature comparison section */}
              {renderFeatureComparison(sortedProperties)}
            </div>

            <div className="px-5 pb-4 flex justify-between items-center border-t border-gray-100 pt-4">
              <div className="text-sm text-primary-600">
                Property {currentIndex + 1} of {sortedProperties.length}
              </div>
              <div className="flex items-center space-x-3">
                <Link href={`/property/${currentProperty.id}`}>
                  <Button variant="secondary" size="sm">View Details</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full" 
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Property thumbnails */}
        <div className="property-thumbnails grid grid-cols-6 gap-2 mt-4">
          {sortedProperties.map((property, index) => (
            <button
              key={property.id}
              className={`relative rounded-md overflow-hidden h-16 w-full ${
                index === currentIndex ? 'ring-2 ring-secondary-500' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <img 
                src={property.images?.[0] || '/placeholder-property.jpg'} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 border-2 border-secondary-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded property dialog */}
      <Dialog open={!!expandedProperty} onOpenChange={(open) => !open && setExpandedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {expandedProperty?.title}
            </DialogTitle>
            <DialogDescription>
              {expandedProperty?.address}, {expandedProperty?.city}, {expandedProperty?.state}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {expandedProperty && (
              <div className="space-y-4">
                {/* Property images carousel */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {expandedProperty.images && expandedProperty.images.length > 0 ? (
                      expandedProperty.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <div 
                              className="aspect-video w-full rounded-md overflow-hidden bg-cover bg-center" 
                              style={{ backgroundImage: `url(${image})` }}
                            />
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="p-1">
                          <div className="aspect-video w-full rounded-md overflow-hidden bg-primary-100 flex items-center justify-center">
                            <Home className="h-16 w-16 text-primary-300" />
                          </div>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                </Carousel>
                
                {/* Property details */}
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Details</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-semibold">{formatPrice(expandedProperty.price)}</span>
                      </li>
                      <li className="flex items-center">
                        <Bed className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{expandedProperty.bedrooms} Bedrooms</span>
                      </li>
                      <li className="flex items-center">
                        <Bath className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{expandedProperty.bathrooms} Bathrooms</span>
                      </li>
                      <li className="flex items-center">
                        <Square className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{expandedProperty.squareFeet.toLocaleString()} sqft</span>
                      </li>
                      <li className="flex items-center">
                        <Home className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="capitalize">{expandedProperty.propertyType}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Features</h3>
                    <ul className="grid grid-cols-1 gap-2">
                      {expandedProperty.features?.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {(!expandedProperty.features || expandedProperty.features.length === 0) && (
                        <li className="text-muted-foreground">No features listed</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="px-4 pb-2">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {expandedProperty.description}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Link href={`/property/${expandedProperty?.id}`}>
              <Button>View Full Details</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}