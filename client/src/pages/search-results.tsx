import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property, SearchProperties } from "@shared/schema";
import PropertySearch from "@/components/properties/property-search";
import PropertyCard from "@/components/properties/property-card";
import PropertyMap from "@/components/properties/property-map";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, List, Grid, MapPin, Image, Mic, ArrowLeft, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { PropertyListSchema } from "@/components/seo/schema-markup";
import { SearchMetaTags } from "@/components/seo/meta-tags";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchProperties>({});
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [searchType, setSearchType] = useState<"text" | "image" | "audio">("text");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // Check for search type parameter
    const type = params.get("searchType");
    if (type && ["text", "image", "audio"].includes(type)) {
      setSearchType(type as "text" | "image" | "audio");
    }
    
    setSearchParams(newSearchParams);
  }, [location]);

  // Set document title
  useEffect(() => {
    document.title = "Search Properties - Foundation";
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageDataUrl(event.target?.result as string);
        setIsUploading(false);
        
        // Automatically trigger search with the image
        performMultimodalSearch("image", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImageDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Handle multimodal search
  const performMultimodalSearch = async (type: "image" | "audio" | "text", data?: string) => {
    if (type === "image" && !data) return;
    
    try {
      // Build search request params for API
      const searchRequest = {
        ...searchParams,
        searchType: type,
        mediaData: data, // Base64 image data or audio transcription
      };
      
      // This would be called from the useQuery hook
      setSearchType(type);
    } catch (error) {
      console.error("Error performing multimodal search:", error);
    }
  };
  
  // Search properties
  const { isLoading, error, data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties/search", searchParams, searchType, imageDataUrl],
    queryFn: async () => {
      // Prepare request data based on search type
      const requestData = {
        ...searchParams,
        searchType,
        mediaData: searchType === "image" ? imageDataUrl : undefined,
      };
      
      const res = await apiRequest("POST", "/api/properties/search", requestData);
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
    
    // Add search type
    params.set("searchType", searchType);
    
    // Update URL and trigger new search
    setLocation(`/search?${params.toString()}`);
  };
  
  // Define base URL for SEO
  const baseUrl = window.location.origin;
  
  // Generate descriptive title/meta info based on search parameters
  const getSearchDescription = () => {
    const parts = [];
    if (searchParams.location) parts.push(`in ${searchParams.location}`);
    if (searchParams.propertyType) parts.push(`${searchParams.propertyType} properties`);
    if (searchParams.minPrice && searchParams.maxPrice) parts.push(`$${searchParams.minPrice.toLocaleString()}-$${searchParams.maxPrice.toLocaleString()}`);
    else if (searchParams.minPrice) parts.push(`from $${searchParams.minPrice.toLocaleString()}`);
    else if (searchParams.maxPrice) parts.push(`up to $${searchParams.maxPrice.toLocaleString()}`);
    if (searchParams.beds) parts.push(`${searchParams.beds}+ bedrooms`);
    
    return parts.length > 0 ? parts.join(', ') : 'all properties';
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      {/* SEO Meta Tags */}
      <SearchMetaTags
        location={searchParams.location}
        propertyType={searchParams.propertyType}
        minPrice={searchParams.minPrice}
        maxPrice={searchParams.maxPrice}
        bedrooms={searchParams.beds}
        baseUrl={baseUrl}
        count={properties?.length || 0}
        keywords={[
          'real estate search',
          'property listings',
          ...(searchParams.location ? [searchParams.location] : []),
          ...(searchParams.propertyType ? [searchParams.propertyType] : [])
        ]}
      />
      
      {/* Schema.org Structured Data for Property List */}
      {properties && properties.length > 0 && (
        <PropertyListSchema 
          properties={properties} 
          baseUrl={baseUrl}
        />
      )}
      
      <div className="container mx-auto px-4">
        {/* Multimodal Search Badge and UI */}
        {searchType !== "text" && (
          <div className="mb-6">
            <Alert className="bg-white shadow-md border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {searchType === "image" && <Image className="h-5 w-5 text-secondary-500" />}
                  {searchType === "audio" && <Mic className="h-5 w-5 text-secondary-500" />}
                  <div className="flex flex-col">
                    <AlertTitle className="font-medium">
                      {searchType === "image" ? "Image-based search active" : "Voice-based search active"}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {searchType === "image" 
                        ? "We're finding properties similar to your uploaded image" 
                        : "We're finding properties based on your voice description"}
                    </AlertDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {searchType === "image" && imageDataUrl && (
                    <div className="relative h-12 w-12 border rounded-md overflow-hidden">
                      <img src={imageDataUrl} alt="Search reference" className="h-full w-full object-cover" />
                      <button 
                        onClick={clearImagePreview}
                        className="absolute top-0 right-0 bg-primary-800/70 p-0.5 rounded-bl-sm"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Switch back to text search
                      setSearchType("text");
                      setImageDataUrl(null);
                      const params = new URLSearchParams(window.location.search);
                      params.set("searchType", "text");
                      setLocation(`/search?${params.toString()}`);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Text Search
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search Panel */}
          <div className="lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
              {/* Upload image button for visual search */}
              {searchType === "text" && (
                <div className="px-4 py-3 border-b border-primary-100 bg-primary-50/50">
                  <h3 className="font-medium text-primary-800 mb-2">Try Multimodal Search</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center border-secondary-200 hover:border-secondary-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="h-4 w-4 mr-1 text-secondary-500" />
                      Upload Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center border-secondary-200 hover:border-secondary-300"
                      onClick={() => performMultimodalSearch("audio")}
                    >
                      <Mic className="h-4 w-4 mr-1 text-secondary-500" />
                      Voice Search
                    </Button>
                  </div>
                </div>
              )}
              
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
