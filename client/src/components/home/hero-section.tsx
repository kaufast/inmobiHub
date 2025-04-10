import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Image, Mic, Camera, X, ChevronDown, Bed, Bath, Maximize, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchProperties } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function HeroSection() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"text" | "image" | "audio">("text");
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
    <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden min-h-[800px] h-auto">
      {/* Barcelona Background with Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1366&h=768&q=80')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-gray-900/90"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28 relative z-10">
        <div className="flex flex-col items-center text-center">
          <p className="mt-2 text-xl text-white/90 max-w-2xl mx-auto mb-6">
            {t('common.findYourDreamProperty')}
          </p>
          
          <h1 className="text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] font-bold text-white leading-none tracking-tight mb-8">
            OPENING MORE DOORS
          </h1>
          
          {/* Multimodal Search bar */}
          <div className="w-full max-w-4xl bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700">
            <Tabs value={activeTab} defaultValue="text" className="w-full" onValueChange={(value) => {
              const type = value as "text" | "image" | "audio";
              setActiveTab(type);
              setSearchType(type);
              setSearchParams(prev => ({
                ...prev,
                searchType: type
              }));
            }}>
              <div className="w-full mb-2">
                <div className="flex rounded-t-lg overflow-hidden border-b-0 justify-start">
                  <div className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium border border-gray-700 border-r-0 border-b-0 rounded-tl-lg flex items-center">
                    <span className="text-xs">Search by:</span>
                  </div>
                  <TabsList className="rounded-none bg-transparent border-0 border-gray-700 space-x-1 p-0">
                    <TabsTrigger 
                      value="text" 
                      className="flex items-center gap-1 text-white font-medium bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg border border-gray-700 data-[state=active]:border-b-0 py-1.5 px-3"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="text-xs">Text</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="image" 
                      className="flex items-center gap-1 text-white font-medium bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg border border-gray-700 data-[state=active]:border-b-0 py-1.5 px-3"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span className="text-xs">Image</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="audio" 
                      className="flex items-center gap-1 text-white font-medium bg-gray-700 data-[state=active]:bg-secondary-500 data-[state=active]:border-secondary-500 rounded-t-lg border border-gray-700 data-[state=active]:border-b-0 py-1.5 px-3"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span className="text-xs">Voice</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="text" className="mt-0 border border-gray-700 p-4 rounded-b-lg">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:flex md:items-start md:gap-3 relative">
                    <div className="relative w-full flex-grow">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <input
                        type="text"
                        value={searchParams.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter city, zip or address, buy or sell"
                        className="w-full h-14 pl-10 pr-28 bg-gray-700/90 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 text-lg placeholder:text-gray-300 placeholder:font-medium"
                        list="search-suggestions"
                      />
                      <datalist id="search-suggestions">
                        <option value="New York, buy" />
                        <option value="Miami, rent" />
                        <option value="Los Angeles, sell" />
                        <option value="Chicago, buy" />
                        <option value="Austin, rent" />
                        <option value="Seattle, buy" />
                      </datalist>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                        <button onClick={handleSearch} className="bg-secondary-500 hover:bg-secondary-600 rounded-md p-2">
                          <Search className="h-5 w-5 text-white" />
                        </button>
                        <button onClick={() => setActiveTab("image")} className="text-gray-400 hover:text-white">
                          <Camera className="h-5 w-5" />
                        </button>
                        <button onClick={() => setActiveTab("audio")} className="text-gray-400 hover:text-white">
                          <Mic className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <Collapsible className="mt-2 md:mt-0 md:w-auto flex-shrink-0">
                      <div className="flex items-center">
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="text-white font-medium flex items-center px-4 h-14 bg-gray-700/90 border-gray-600 hover:bg-gray-600 rounded-md">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Advanced Search
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="md:absolute md:top-16 md:left-0 md:right-0 md:bg-gray-800/95 md:backdrop-blur-sm md:p-4 md:rounded-lg md:border md:border-gray-700 md:shadow-lg md:z-20 mt-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
                
                {/* Apply button removed as requested */}
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
          
          {/* Map Mockup Section */}
          <div className="w-full max-w-4xl mt-12 bg-gray-800/70 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700 shadow-xl">
            <div className="relative h-[450px] w-full">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558642084-fd07fae5282e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1366&h=768')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-gray-900/50"></div>
              
              {/* Map Pins */}
              <div className="absolute left-1/4 top-1/3 w-6 h-6">
                <div className="animate-pulse absolute w-6 h-6 bg-secondary-500/30 rounded-full"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute left-[60%] top-[45%] w-6 h-6">
                <div className="animate-pulse absolute w-6 h-6 bg-secondary-500/30 rounded-full"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute left-[40%] top-[60%] w-6 h-6">
                <div className="animate-pulse absolute w-6 h-6 bg-secondary-500/30 rounded-full"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* Property Card Overlay */}
              <div className="absolute top-[15%] right-[14px] w-80 bg-gray-900/90 backdrop-blur-md rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                    alt="Featured property" 
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-secondary-500 text-white text-xs font-medium px-2 py-1 rounded">
                      Featured
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <button className="bg-white/90 p-1.5 rounded-full shadow-md">
                      <svg className="h-4 w-4 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-bold text-white">Modern Penthouse with Terrace</h3>
                  <p className="text-secondary-400 font-medium">€1,450,000</p>
                  
                  <div className="flex items-center text-gray-400 text-xs mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Diagonal Mar, Barcelona</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
                    <div className="flex space-x-3 text-xs">
                      <div className="flex items-center text-gray-300">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>4</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Bath className="h-3 w-3 mr-1" />
                        <span>3</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Maximize className="h-3 w-3 mr-1" />
                        <span>180 m²</span>
                      </div>
                    </div>
                    <button className="text-white bg-secondary-500 hover:bg-secondary-600 text-xs py-1 px-3 rounded">
                      View
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search Filters Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 flex items-center space-x-1 border border-gray-700">
                  <div className="text-white text-xs font-medium">Barcelona</div>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 flex items-center space-x-1 border border-gray-700">
                  <div className="text-white text-xs font-medium">Buy</div>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 flex items-center space-x-1 border border-gray-700">
                  <div className="text-white text-xs font-medium">2+ Beds</div>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 flex items-center space-x-1 border border-gray-700">
                  <div className="text-white text-xs font-medium">Any Price</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
