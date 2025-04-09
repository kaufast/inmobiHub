import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { CardContent, Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Grid, List, SquareIcon, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type PropertyView = "grid" | "list" | "map";
type ListingType = "buy" | "sell" | "rent";

export default function PropertyBrowser() {
  const [viewType, setViewType] = useState<PropertyView>("grid");
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["house"]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [location, setLocation] = useState<string>("");
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);
  const [bathroomsFilter, setBathroomsFilter] = useState<number | null>(null);
  
  // Fetch properties with filters
  const { isLoading, data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties/search", listingType, propertyTypes, priceRange, location, bedroomsFilter, bathroomsFilter],
    queryFn: async () => {
      const filters = {
        listingType,
        propertyType: propertyTypes.length === 1 ? propertyTypes[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 2000000 ? priceRange[1] : undefined,
        location: location || undefined,
        beds: bedroomsFilter || undefined,
        baths: bathroomsFilter || undefined
      };
      const res = await apiRequest("POST", "/api/properties/search", filters);
      return res.json();
    },
  });
  
  const PropertyTypeCheckbox = ({ type, label }: { type: string, label: string }) => (
    <div className="flex items-center space-x-2 mb-2">
      <Checkbox 
        id={`type-${type}`}
        checked={propertyTypes.includes(type)}
        onCheckedChange={(checked) => {
          if (checked) {
            setPropertyTypes([...propertyTypes, type]);
          } else {
            setPropertyTypes(propertyTypes.filter(t => t !== type));
          }
        }}
      />
      <Label htmlFor={`type-${type}`} className="text-sm text-primary-700">{label}</Label>
    </div>
  );

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-52 bg-primary-100">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-primary-200">
            <Home className="h-12 w-12 text-primary-400" />
          </div>
        )}
        <button 
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-primary-600 hover:text-secondary-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Toggle favorite logic would go here
          }}
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-primary-800 mb-1">${property.price.toLocaleString()}</h3>
        <div className="flex items-center text-sm text-primary-600 mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>
        <div className="flex space-x-4 text-sm font-medium text-primary-700">
          <div className="flex items-center">
            {property.bedrooms} <span className="ml-1 text-primary-500">beds</span>
          </div>
          <div className="flex items-center">
            {property.bathrooms} <span className="ml-1 text-primary-500">ba</span>
          </div>
          <div className="flex items-center">
            {property.squareFeet} <span className="ml-1 text-primary-500">m²</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyListItem = ({ property }: { property: Property }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-1/3 h-48">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-primary-200">
              <Home className="h-12 w-12 text-primary-400" />
            </div>
          )}
          <button 
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-primary-600 hover:text-secondary-500 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Toggle favorite logic would go here
            }}
          >
            <Heart className="h-5 w-5" />
          </button>
          
          {/* Premium badge placeholder */}
        </div>
        <CardContent className="p-4 md:w-2/3">
          <h3 className="text-xl font-bold text-primary-800 mb-1">${property.price.toLocaleString()}</h3>
          <div className="flex items-center text-sm text-primary-600 mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>
          <p className="text-primary-600 mb-4 line-clamp-2">{property.description}</p>
          <div className="flex space-x-6 text-sm font-medium text-primary-700">
            <div className="flex items-center">
              {property.bedrooms} <span className="ml-1 text-primary-500">beds</span>
            </div>
            <div className="flex items-center">
              {property.bathrooms} <span className="ml-1 text-primary-500">ba</span>
            </div>
            <div className="flex items-center">
              {property.squareFeet} <span className="ml-1 text-primary-500">m²</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-primary-800">Browse Properties</h2>
          <div className="flex items-center">
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as PropertyView)} className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grid" className="px-3">
                  <Grid className="h-4 w-4 mr-1" /> Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <List className="h-4 w-4 mr-1" /> List
                </TabsTrigger>
                <TabsTrigger value="map" className="px-3">
                  <MapPin className="h-4 w-4 mr-1" /> Map
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Tabs value={listingType} onValueChange={(v) => setListingType(v as ListingType)} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="buy" className="px-6">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="px-6">Sell</TabsTrigger>
              <TabsTrigger value="rent" className="px-6">Rent</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Input 
            placeholder="Location e.g. Seattle, WA" 
            className="w-full lg:w-auto lg:flex-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Filters sidebar */}
        <div className="lg:w-1/4 p-6 border-r border-gray-200">
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Real estate type</h3>
            <PropertyTypeCheckbox type="house" label="Houses" />
            <PropertyTypeCheckbox type="townhouse" label="Townhomes" />
            <PropertyTypeCheckbox type="apartment" label="Apartments" />
            <PropertyTypeCheckbox type="condo" label="Condos/Co-ops" />
            <PropertyTypeCheckbox type="land" label="Lots/Land" />
            <PropertyTypeCheckbox type="commercial" label="Commercial" />
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Price range</h3>
            <div className="px-2 mb-4">
              <Slider 
                defaultValue={[priceRange[0], priceRange[1]]} 
                max={2000000} 
                step={10000}
                onValueChange={(value) => setPriceRange([value[0], value[1]])}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-primary-500 text-sm">$</span>
                </div>
                <Input 
                  placeholder="Min" 
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 pl-7"
                />
              </div>
              <span className="text-primary-400">to</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-primary-500 text-sm">$</span>
                </div>
                <Input 
                  placeholder="Max" 
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 pl-7"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Beds</h3>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <Button 
                  key={num} 
                  variant={bedroomsFilter === num ? "default" : "outline"}
                  size="sm"
                  className={num === 0 ? "px-3" : "px-4"}
                  onClick={() => setBedroomsFilter(bedroomsFilter === num ? null : num)}
                >
                  {num === 0 ? "Any" : num === 5 ? "5+" : num}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Baths</h3>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <Button 
                  key={num} 
                  variant={bathroomsFilter === num ? "default" : "outline"}
                  size="sm"
                  className={num === 0 ? "px-3" : "px-4"}
                  onClick={() => setBathroomsFilter(bathroomsFilter === num ? null : num)}
                >
                  {num === 0 ? "Any" : num === 5 ? "5+" : num}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Floor area</h3>
            <div className="flex items-center justify-between mb-4">
              <Input 
                placeholder="Min m²" 
                type="number"
                className="w-24"
              />
              <span className="text-primary-400 mx-2">to</span>
              <Input 
                placeholder="Max m²" 
                type="number"
                className="w-24"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Lot size</h3>
            <div className="flex items-center justify-between mb-4">
              <Input 
                placeholder="Min m²" 
                type="number"
                className="w-24"
              />
              <span className="text-primary-400 mx-2">to</span>
              <Input 
                placeholder="Max m²" 
                type="number"
                className="w-24"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-primary-800 mb-3">Year built</h3>
            <div className="px-2 py-6 border border-gray-200 rounded-md">
              {/* Year built slider or range UI would go here */}
            </div>
          </div>
        </div>
        
        {/* Property grid */}
        <div className="lg:w-3/4 p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-primary-800">
                {properties.length} Properties Found
              </h3>
              {location && (
                <p className="text-sm text-primary-600">
                  Results for: {location}
                </p>
              )}
            </div>
            <div>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {viewType === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <Link key={property.id} href={`/property/${property.id}`}>
                        <PropertyCard property={property} />
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <h3 className="text-xl font-semibold text-primary-700 mb-2">No properties found</h3>
                      <p className="text-primary-500">Try adjusting your filters to see more results</p>
                    </div>
                  )}
                </div>
              )}
              
              {viewType === "list" && (
                <div className="space-y-4">
                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <Link key={property.id} href={`/property/${property.id}`}>
                        <PropertyListItem property={property} />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-semibold text-primary-700 mb-2">No properties found</h3>
                      <p className="text-primary-500">Try adjusting your filters to see more results</p>
                    </div>
                  )}
                </div>
              )}
              
              {viewType === "map" && (
                <div className="bg-primary-100 rounded-lg h-[600px] flex items-center justify-center">
                  <p className="text-primary-600">Map view coming soon</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}