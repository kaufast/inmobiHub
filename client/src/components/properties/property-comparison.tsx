import { useState, useEffect } from "react";
import { X, Check, AlertCircle, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPropertyTypeLabel } from "@/lib/utils";

interface PropertyComparisonProps {
  propertyIds: number[];
  onClose: () => void;
}

export default function PropertyComparison({ propertyIds, onClose }: PropertyComparisonProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties/compare", propertyIds.join(",")],
    enabled: propertyIds.length > 0,
  });

  if (isLoading) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 shadow-lg w-[800px] max-w-[90vw] h-[600px] max-h-[80vh]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Comparing Properties</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !properties) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 shadow-lg w-[800px] max-w-[90vw]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-red-500">
            <AlertCircle className="h-5 w-5 inline-block mr-2" /> Error
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p>Unable to load property comparison data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 shadow-lg w-[800px] max-w-[90vw]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Property Comparison</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <Home className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties selected</h3>
            <p className="text-gray-500 text-center mb-4">
              Select multiple properties to compare them side by side
            </p>
            <Link href="/search">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg w-[800px] max-w-[90vw] h-[600px] max-h-[80vh]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg font-semibold">
          Comparing {properties.length} Properties
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-70px)]">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="neighborhood">Neighborhood</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100%-50px)] w-full">
          <TabsContent value="overview" className="m-0 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Property</TableHead>
                  {properties.map((property) => (
                    <TableHead key={property.id} className="text-center">
                      <Link href={`/property/${property.id}`}>
                        <div className="font-medium hover:text-blue-600 hover:underline cursor-pointer">
                          {property.title}
                        </div>
                      </Link>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-price`} className="text-center">
                      <span className="font-semibold text-lg">{formatPrice(property.price)}</span>
                      {property.isPremium && (
                        <Badge className="ml-2 bg-amber-500">Premium</Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-type`} className="text-center">
                      {getPropertyTypeLabel(property.propertyType)}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Bedrooms</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-beds`} className="text-center">
                      {property.bedrooms}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Bathrooms</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-baths`} className="text-center">
                      {property.bathrooms}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Square Feet</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-sqft`} className="text-center">
                      {property.squareFeet.toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Year Built</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-year`} className="text-center">
                      {property.yearBuilt || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Address</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-address`} className="text-center">
                      {property.address}<br />
                      {property.city}, {property.state} {property.zipCode}
                    </TableCell>
                  ))}
                </TableRow>
                
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
          </TabsContent>

          <TabsContent value="features" className="m-0 p-4">
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
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="neighborhood" className="m-0 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Neighborhood</TableHead>
                  {properties.map((property) => (
                    <TableHead key={property.id} className="text-center">
                      {property.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">City</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-city`} className="text-center">
                      {property.city}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">State</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-state`} className="text-center">
                      {property.state}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Zip Code</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-zip`} className="text-center">
                      {property.zipCode}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Country</TableCell>
                  {properties.map((property) => (
                    <TableCell key={`${property.id}-country`} className="text-center">
                      {property.country}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="images" className="m-0 p-4 space-y-6">
            {properties.map((property) => (
              <div key={`${property.id}-images`} className="space-y-2">
                <h3 className="font-medium text-lg">{property.title}</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {property.images.map((image, index) => (
                      <CarouselItem key={index} className="basis-1/3">
                        <div className="p-1">
                          <div 
                            className="aspect-square rounded-md overflow-hidden bg-cover bg-center" 
                            style={{ backgroundImage: `url(${image})` }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
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