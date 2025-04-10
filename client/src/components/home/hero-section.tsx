import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Image, Mic, Camera, X, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchProperties } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function HeroSection() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchType, setSearchType] = useState<"text" | "image" | "audio">("text");
  const [searchParams, setSearchParams] = useState<SearchProperties>({
    searchType: "text",
    location: "",
    listingType: "buy",
    propertyType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    beds: undefined,
    baths: undefined,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (field: keyof SearchProperties, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording logic
      setIsRecording(false);
      setRecordingTime(0);
      // Process audio search
      handleSearch();
    } else {
      // Start recording logic
      setIsRecording(true);
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Cleanup timer after 30 seconds (max recording time)
      setTimeout(() => {
        clearInterval(timer);
        setIsRecording(false);
        setRecordingTime(0);
        // Process audio search after max time
        handleSearch();
      }, 30000);
      
      return () => clearInterval(timer);
    }
  };

  const handleSearch = () => {
    // Format and encode search parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) queryParams.set("location", searchParams.location);
    if (searchParams.listingType) queryParams.set("listingType", searchParams.listingType);
    if (searchParams.propertyType) queryParams.set("propertyType", searchParams.propertyType);
    if (searchParams.minPrice) queryParams.set("minPrice", searchParams.minPrice.toString());
    if (searchParams.maxPrice) queryParams.set("maxPrice", searchParams.maxPrice.toString());
    if (searchParams.beds) queryParams.set("beds", searchParams.beds.toString());
    if (searchParams.baths) queryParams.set("baths", searchParams.baths.toString());
    
    // Add search type
    queryParams.set("searchType", searchType);
    
    // Add multimodal data if present
    if (searchType === "image" && imagePreview) {
      queryParams.set("imageData", imagePreview);
      
      // If we have a multimodalQuery from the backend processing, add it
      if (searchParams.multimodalQuery) {
        queryParams.set("multimodalQuery", searchParams.multimodalQuery);
      }
    }
    
    if (searchType === "audio" && searchParams.audioData) {
      queryParams.set("audioData", searchParams.audioData);
      
      // If we have a multimodalQuery from the backend processing, add it
      if (searchParams.multimodalQuery) {
        queryParams.set("multimodalQuery", searchParams.multimodalQuery);
      }
    }
    
    // Navigate to search results page with parameters
    setLocation(`/search?${queryParams.toString()}`);
  };
  
  return (
    <section className="relative bg-primary-800 overflow-hidden">
      {/* Hero Background with Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight mb-8">
            OPENING<br/>MORE<br/>DOORS
          </h1>
          <p className="mt-2 text-xl text-white/90 max-w-2xl mx-auto mb-10">
            {t('common.findYourDreamProperty')}
          </p>
          
          {/* Multimodal Search bar */}
          <div className="w-full max-w-4xl bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700">
            <Tabs defaultValue="text" className="w-full" onValueChange={(value) => {
              const type = value as "text" | "image" | "audio";
              setSearchType(type);
              setSearchParams(prev => ({
                ...prev,
                searchType: type
              }));
            }}>
              <div className="w-full mb-6">
                <div className="flex rounded-t-lg overflow-hidden border-b-0">
                  <div className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium border border-gray-700 border-r-0 border-b-0 rounded-tl-lg">
                    Type of search:
                  </div>
                  <TabsList className="flex-1 rounded-none bg-transparent border-0 border-gray-700 space-x-1 p-0">
                    <TabsTrigger 
                      value="text" 
                      className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg flex-1 border border-gray-700 data-[state=active]:border-b-0 py-2"
                    >
                      <Search className="w-4 h-4" />
                      <span className="text-sm">Search</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="image" 
                      className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg flex-1 border border-gray-700 data-[state=active]:border-b-0 py-2"
                    >
                      <Image className="w-4 h-4" />
                      <span className="text-sm">Image</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="audio" 
                      className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg flex-1 border border-gray-700 data-[state=active]:border-b-0 py-2"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">Voice</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="text" className="mt-0 border border-gray-700 p-4 rounded-b-lg">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-white/60" />
                      </div>
                      <Input 
                        placeholder="Enter city, zip or address"
                        className="pl-10 bg-gray-700/90 border-gray-600 text-white h-12"
                        value={searchParams.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select 
                      value={searchParams.listingType || 'buy'} 
                      onValueChange={(value) => handleInputChange('listingType', value)}
                    >
                      <SelectTrigger className="bg-gray-700/90 border-gray-600 text-white h-12">
                        <SelectValue placeholder="Listing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-48">
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-secondary-500 hover:bg-secondary-600 text-white"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Search
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Collapsible className="w-full">
                    <div className="flex items-center">
                      <CollapsibleTrigger asChild>
                        <Button variant="link" className="text-white/80 hover:text-white font-medium text-base flex items-center">
                          {t('common.showMore')}
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent className="mt-3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Select 
                            value={searchParams.propertyType} 
                            onValueChange={(value) => handleInputChange('propertyType', value)}
                          >
                            <SelectTrigger className="bg-gray-700/90 border-gray-600 text-white">
                              <SelectValue placeholder="Property Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Select 
                            value={searchParams.beds?.toString()} 
                            onValueChange={(value) => handleInputChange('beds', Number(value))}
                          >
                            <SelectTrigger className="bg-gray-700/90 border-gray-600 text-white">
                              <SelectValue placeholder="Bedrooms" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1+ Bedroom</SelectItem>
                              <SelectItem value="2">2+ Bedrooms</SelectItem>
                              <SelectItem value="3">3+ Bedrooms</SelectItem>
                              <SelectItem value="4">4+ Bedrooms</SelectItem>
                              <SelectItem value="5">5+ Bedrooms</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Select 
                            value={searchParams.baths?.toString()} 
                            onValueChange={(value) => handleInputChange('baths', Number(value))}
                          >
                            <SelectTrigger className="bg-gray-700/90 border-gray-600 text-white">
                              <SelectValue placeholder="Bathrooms" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1+ Bathroom</SelectItem>
                              <SelectItem value="2">2+ Bathrooms</SelectItem>
                              <SelectItem value="3">3+ Bathrooms</SelectItem>
                              <SelectItem value="4">4+ Bathrooms</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth">
                    <Button variant="link" className="text-white font-medium text-base flex items-center">
                      {t('common.applyNow')}
                      <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="mt-0 border border-gray-700 p-4 rounded-b-lg">
                <div className="flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Image to search" 
                        className="max-h-60 rounded-lg border-2 border-gray-600"
                      />
                      <button
                        onClick={clearImagePreview}
                        className="absolute -top-2 -right-2 bg-primary-800 p-1 rounded-full text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="h-48 w-full max-w-lg border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 mb-4 bg-gray-700/70"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-10 w-10 text-white/60 mb-2" />
                      <p className="text-white/80 text-center px-4">
                        Upload or drag and drop an image of a property to find similar listings
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSearch}
                    className="h-12 px-6 bg-secondary-500 hover:bg-secondary-600 text-white"
                    disabled={!imagePreview}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Find Similar Properties
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="audio" className="mt-0 border border-gray-700 p-4 rounded-b-lg">
                <div className="flex flex-col items-center">
                  <div className="h-48 w-full max-w-lg border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center mb-4 bg-gray-700/70">
                    <button
                      onClick={toggleRecording}
                      className={`h-20 w-20 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-secondary-500'} flex items-center justify-center`}
                    >
                      <Mic className="h-10 w-10 text-white" />
                    </button>
                    
                    {isRecording ? (
                      <p className="text-white/80 mt-4">
                        Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                      </p>
                    ) : (
                      <p className="text-white/80 mt-4">
                        Tap to start recording your property search
                      </p>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm max-w-lg text-center mb-4">
                    Describe the property you're looking for in detail. For example: "I'm looking for a three bedroom house in Boston with a garage and backyard under $600,000"
                  </p>
                  
                  <Button 
                    onClick={handleSearch}
                    className="h-12 px-6 bg-secondary-500 hover:bg-secondary-600 text-white"
                    disabled={isRecording}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Properties
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
