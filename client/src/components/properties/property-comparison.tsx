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
import { Separator } from "@/components/ui/separator";
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

interface PropertyComparisonProps {
  propertyIds: number[];
  onClose: () => void;
}

export default function PropertyComparison({ propertyIds, onClose }: PropertyComparisonProps) {
  const [activeTab, setActiveTab] = useState<string>("side-by-side");
  const [expandedProperty, setExpandedProperty] = useState<Property | null>(null);
  const { removeFromCompare, clearComparison } = usePropertyComparison();
  const { toast } = useToast();
  
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties/compare", propertyIds.join(",")],
    enabled: propertyIds.length > 0,
  });

  const handleRemoveProperty = (property: Property) => {
    removeFromCompare(property.id);
    toast({
      title: "Property removed",
      description: `${property.title} removed from comparison`,
    });
  };

  const handleExpandProperty = (property: Property) => {
    setExpandedProperty(property);
  };

  const handleClearAll = () => {
    clearComparison();
    onClose();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-[90vw] max-w-7xl max-h-[90vh] shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Comparing Properties</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !properties) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-[90vw] max-w-7xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-red-500">
              <AlertCircle className="h-5 w-5 inline-block mr-2" /> Error
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="mb-4">Unable to load property comparison data. Please try again later.</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No properties state
  if (properties.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-[90vw] max-w-7xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Property Comparison</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8">
              <Home className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No properties selected</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Select multiple properties to compare them side by side. Add properties to your comparison list by clicking the compare button on property listings.
              </p>
              <Link href="/search">
                <Button size="lg">Browse Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main comparison view
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-[95vw] max-w-7xl h-[90vh] shadow-xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b space-y-0 pb-3">
            <div>
              <CardTitle className="text-xl font-semibold">
                Comparing {properties.length} Properties
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View details side by side or in table format
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-2 px-4">
              <TabsTrigger value="side-by-side">
                <PanelRightOpen className="h-4 w-4 mr-2" />
                Side by Side
              </TabsTrigger>
              <TabsTrigger value="table-view">
                <DollarSign className="h-4 w-4 mr-2" />
                Data Table
              </TabsTrigger>
            </TabsList>
            
            {/* Side-by-side comparison */}
            <TabsContent value="side-by-side" className="flex-1 overflow-hidden p-0 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {properties.map((property) => (
                      <PropertyCard 
                        key={property.id} 
                        property={property} 
                        onRemove={() => handleRemoveProperty(property)}
                        onExpand={() => handleExpandProperty(property)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            {/* Table view comparison */}
            <TabsContent value="table-view" className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <TableView properties={properties} onRemove={handleRemoveProperty} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
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
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                
                {/* Property details */}
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Details</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
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
                        <span>{getPropertyTypeLabel(expandedProperty.propertyType)}</span>
                      </li>
                      <li className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Built in {expandedProperty.yearBuilt || "N/A"}</span>
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
              <Button>
                View Full Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Property card for side-by-side view
function PropertyCard({ 
  property, 
  onRemove, 
  onExpand 
}: { 
  property: Property, 
  onRemove: () => void, 
  onExpand: () => void 
}) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <div 
            className="aspect-video bg-cover bg-center"
            style={{ backgroundImage: `url(${property.images[0]})` }}
          />
        ) : (
          <div className="aspect-video bg-primary-100 flex items-center justify-center">
            <Home className="h-12 w-12 text-primary-300" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80" onClick={onExpand}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {property.isPremium && (
          <Badge className="absolute top-2 left-2 bg-amber-500">Premium</Badge>
        )}
      </div>
      
      <CardContent className="p-4 flex-grow">
        <Link href={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 hover:underline">{property.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">
          {property.address}, {property.city}
        </p>
        
        <div className="text-xl font-bold mb-3 text-blue-600">
          {formatPrice(property.price)}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <Bed className="h-4 w-4 mb-1 text-gray-500" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
            <span className="text-xs text-gray-500">Beds</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <Bath className="h-4 w-4 mb-1 text-gray-500" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
            <span className="text-xs text-gray-500">Baths</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <Square className="h-4 w-4 mb-1 text-gray-500" />
            <span className="text-sm font-medium">{property.squareFeet}</span>
            <span className="text-xs text-gray-500">Sq ft</span>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="mb-2">
            <span className="font-medium">Type:</span> {getPropertyTypeLabel(property.propertyType)}
          </div>
          <div className="mb-2">
            <span className="font-medium">Year built:</span> {property.yearBuilt || "N/A"}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/property/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
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