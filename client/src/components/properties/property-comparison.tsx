import { useState, useRef, useEffect } from "react";
import { 
  X, Check, AlertCircle, Home, ChevronRight, ChevronLeft, 
  Maximize2, ArrowRight, Bath, Bed, Square, Calendar, Trophy,
  Heart, Trash2, PanelLeftOpen, PanelRightOpen, Share, DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getPropertyTypeLabel } from "@/lib/utils";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { useToast } from "@/hooks/use-toast";
import PropertyCard from './property-card';

interface PropertyComparisonProps {
  properties: Property[];
  onRemove: (propertyId: string) => void;
}

export default function PropertyComparison({ properties, onRemove }: PropertyComparisonProps) {
  if (properties.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle>Property Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No properties selected for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle>Property Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="space-y-4">
                <PropertyCard
                  property={property}
                  layout="vertical"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(property.id.toString())}
                  className="w-full"
                >
                  Remove from Comparison
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle>Comparison Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">{property.title}</h3>
                  <div className="space-y-1 text-sm text-white/70">
                    <p>Price: ${property.price.toLocaleString()}</p>
                    <p>{property.bedrooms} beds • {property.bathrooms} baths</p>
                    <p>{property.squareFeet.toLocaleString()} sqft</p>
                    <p>{property.propertyType}</p>
                    <p>Built in {property.yearBuilt || 'N/A'}</p>
                    <p>{property.address}</p>
                    <p>{property.city}, {property.state} {property.zipCode}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Table view component
function TableView({ 
  properties, 
  onRemove 
}: { 
  properties: Property[], 
  onRemove: (property: Property) => void 
}) {
  return (
    <div className="space-y-6">
      {/* Basic info table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Property</TableHead>
              {properties.map((property) => (
                <TableHead key={property.id} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/property/${property.id}`}>
                      <div className="font-medium hover:text-blue-600 hover:underline cursor-pointer max-w-[150px] truncate">
                        {property.title}
                      </div>
                    </Link>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-500"
                      onClick={() => onRemove(property)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Image row */}
            <TableRow>
              <TableCell className="font-medium">Image</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-image`} className="text-center p-2">
                  <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32">
                    {property.images && property.images.length > 0 ? (
                      <div 
                        className="w-full h-full rounded-md bg-cover bg-center border"
                        style={{ backgroundImage: `url(${property.images[0]})` }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-md border flex items-center justify-center bg-primary-100">
                        <Home className="h-8 w-8 text-primary-300" />
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            
            {/* Price row */}
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-price`} className="text-center">
                  <div className="font-semibold text-lg text-blue-600">{formatPrice(property.price)}</div>
                  {property.isPremium && (
                    <Badge className="mt-1 bg-amber-500">Premium</Badge>
                  )}
                </TableCell>
              ))}
            </TableRow>
            
            {/* Type row */}
            <TableRow>
              <TableCell className="font-medium">Type</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-type`} className="text-center">
                  {getPropertyTypeLabel(property.propertyType)}
                </TableCell>
              ))}
            </TableRow>
            
            {/* Bedrooms row */}
            <TableRow>
              <TableCell className="font-medium">Bedrooms</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-beds`} className="text-center">
                  <div className="flex items-center justify-center">
                    <Bed className="h-4 w-4 mr-2 text-blue-500" />
                    {property.bedrooms}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            
            {/* Bathrooms row */}
            <TableRow>
              <TableCell className="font-medium">Bathrooms</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-baths`} className="text-center">
                  <div className="flex items-center justify-center">
                    <Bath className="h-4 w-4 mr-2 text-blue-500" />
                    {property.bathrooms}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            
            {/* Square Feet row */}
            <TableRow>
              <TableCell className="font-medium">Square Feet</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-sqft`} className="text-center">
                  <div className="flex items-center justify-center">
                    <Square className="h-4 w-4 mr-2 text-blue-500" />
                    {property.squareFeet.toLocaleString()}
                  </div>
                </TableCell>
              ))}
            </TableRow>
            
            {/* Year Built row */}
            <TableRow>
              <TableCell className="font-medium">Year Built</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-year`} className="text-center">
                  {property.yearBuilt || "N/A"}
                </TableCell>
              ))}
            </TableRow>
            
            {/* Address row */}
            <TableRow>
              <TableCell className="font-medium">Address</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-address`} className="text-center">
                  {property.address}<br />
                  {property.city}, {property.state} {property.zipCode}
                </TableCell>
              ))}
            </TableRow>
            
            {/* Listed row */}
            <TableRow>
              <TableCell className="font-medium">Listed</TableCell>
              {properties.map((property) => (
                <TableCell key={`${property.id}-created`} className="text-center">
                  {new Date(property.createdAt).toLocaleDateString()}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {/* Features table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Features</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Features</TableHead>
              {properties.map((property) => (
                <TableHead key={property.id} className="text-center">
                  {property.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getAllFeatures(properties).map((feature) => (
              <TableRow key={feature}>
                <TableCell className="font-medium">{feature}</TableCell>
                {properties.map((property) => (
                  <TableCell key={`${property.id}-${feature}`} className="text-center">
                    {hasFeature(property, feature) ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-300 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {getAllFeatures(properties).length === 0 && (
              <TableRow>
                <TableCell colSpan={properties.length + 1} className="text-center py-4 text-muted-foreground">
                  No features available for comparison
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper functions
function getAllFeatures(properties: Property[]): string[] {
  const allFeatures = new Set<string>();
  
  properties.forEach(property => {
    if (property.features && Array.isArray(property.features)) {
      property.features.forEach(feature => allFeatures.add(feature));
    }
  });
  
  return Array.from(allFeatures).sort();
}

function hasFeature(property: Property, feature: string): boolean {
  if (!property.features || !Array.isArray(property.features)) {
    return false;
  }
  
  return property.features.includes(feature);
}