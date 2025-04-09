import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property, SearchProperties } from "@shared/schema";
import PropertySearch from "@/components/properties/property-search";
import PropertyCard from "@/components/properties/property-card";
import PropertyMap from "@/components/properties/property-map";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, List, Grid, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchProperties>({});
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  
  // Parse search params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newSearchParams: SearchProperties = {};
    
    if (params.get("location")) newSearchParams.location = params.get("location") || undefined;
    if (params.get("propertyType")) newSearchParams.propertyType = params.get("propertyType") as any || undefined;
    if (params.get("minPrice")) newSearchParams.minPrice = Number(params.get("minPrice")) || undefined;
    if (params.get("maxPrice")) newSearchParams.maxPrice = Number(params.get("maxPrice")) || undefined;
    if (params.get("beds")) newSearchParams.beds = Number(params.get("beds")) || undefined;
    if (params.get("baths")) newSearchParams.baths = Number(params.get("baths")) || undefined;
    if (params.get("minSqft")) newSearchParams.minSqft = Number(params.get("minSqft")) || undefined;
    if (params.get("maxSqft")) newSearchParams.maxSqft = Number(params.get("maxSqft")) || undefined;
    
    setSearchParams(newSearchParams);
  }, [location]);

  // Set document title
  useEffect(() => {
    document.title = "Search Properties - Foundation";
  }, []);
  
  // Search properties
  const { isLoading, error, data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties/search", searchParams],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/properties/search", searchParams);
      return res.json();
    },
  });
  
  const handleSearch = (newParams: SearchProperties) => {
    // Build URL parameters
    const params = new URLSearchParams();
    
    if (newParams.location) params.set("location", newParams.location);
    if (newParams.propertyType) params.set("propertyType", newParams.propertyType);
    if (newParams.minPrice) params.set("minPrice", String(newParams.minPrice));
    if (newParams.maxPrice) params.set("maxPrice", String(newParams.maxPrice));
    if (newParams.beds) params.set("beds", String(newParams.beds));
    if (newParams.baths) params.set("baths", String(newParams.baths));
    if (newParams.minSqft) params.set("minSqft", String(newParams.minSqft));
    if (newParams.maxSqft) params.set("maxSqft", String(newParams.maxSqft));
    
    // Update URL and trigger new search
    setLocation(`/search?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search Panel */}
          <div className="lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              <PropertySearch
                initialValues={searchParams}
                onSearch={handleSearch}
              />
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="lg:w-2/3 xl:w-3/4">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-3 sm:mb-0">
                <h1 className="text-xl font-bold text-primary-800">
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching properties...
                    </span>
                  ) : properties?.length ? (
                    `${properties.length} Properties Found`
                  ) : (
                    "No properties found"
                  )}
                </h1>
                {searchParams.location && (
                  <div className="flex items-center text-primary-600 text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Results for: {searchParams.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-sm text-primary-600 mr-2 hidden sm:inline">View:</span>
                <Tabs defaultValue={view} onValueChange={(v) => setView(v as any)} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="grid">
                      <Grid className="h-4 w-4 mr-1" /> Grid
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4 mr-1" /> List
                    </TabsTrigger>
                    <TabsTrigger value="map">
                      <MapPin className="h-4 w-4 mr-1" /> Map
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
                <p className="text-primary-600">Searching for properties...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <h2 className="text-xl font-bold text-primary-800 mb-3">Search Error</h2>
                <p className="text-primary-600 mb-6">
                  There was an error processing your search. Please try again.
                </p>
                <Button onClick={() => handleSearch({})}>
                  Reset Search
                </Button>
              </div>
            )}
            
            {/* Results Content */}
            {!isLoading && !error && (
              <>
                {/* Grid View */}
                {view === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties?.length ? (
                      properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))
                    ) : (
                      <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                        <h2 className="text-xl font-bold text-primary-800 mb-3">No Properties Found</h2>
                        <p className="text-primary-600 mb-6">
                          Try adjusting your search criteria to find more properties.
                        </p>
                        <Button onClick={() => handleSearch({})}>
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* List View */}
                {view === "list" && (
                  <div className="space-y-4">
                    {properties?.length ? (
                      properties.map((property) => (
                        <PropertyCard key={property.id} property={property} layout="horizontal" />
                      ))
                    ) : (
                      <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <h2 className="text-xl font-bold text-primary-800 mb-3">No Properties Found</h2>
                        <p className="text-primary-600 mb-6">
                          Try adjusting your search criteria to find more properties.
                        </p>
                        <Button onClick={() => handleSearch({})}>
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Map View */}
                {view === "map" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-[600px] relative">
                      {properties?.length ? (
                        <PropertyMap
                          properties={properties}
                          zoom={12}
                          center={
                            properties.length > 0
                              ? { lat: properties[0].latitude, lng: properties[0].longitude }
                              : undefined
                          }
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8">
                            <h2 className="text-xl font-bold text-primary-800 mb-3">No Properties Found</h2>
                            <p className="text-primary-600 mb-6">
                              Try adjusting your search criteria to find more properties.
                            </p>
                            <Button onClick={() => handleSearch({})}>
                              Reset Filters
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
