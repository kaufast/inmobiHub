import { useState } from "react";
import { useLocation } from "wouter";
import { SearchProperties } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, Sliders, Home, SlidersHorizontal, Bed, Bath, Maximize } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

export default function SearchAndMap() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchProperties>({
    location: "",
    propertyType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    beds: undefined,
    baths: undefined,
    minSqft: undefined,
    maxSqft: undefined,
    minLotSize: undefined,
    maxLotSize: undefined,
    yearBuiltMin: undefined,
    yearBuiltMax: undefined,
    listingType: "buy", // Default to buy
    features: [],
  });

  const handleInputChange = (field: keyof SearchProperties, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setSearchParams(prev => {
      const currentFeatures = prev.features || [];
      if (currentFeatures.includes(feature)) {
        return {
          ...prev,
          features: currentFeatures.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...currentFeatures, feature]
        };
      }
    });
  };

  const handleSearch = () => {
    // Build URL parameters
    const params = new URLSearchParams();
    
    if (searchParams.location) params.set("location", searchParams.location);
    if (searchParams.propertyType) params.set("propertyType", searchParams.propertyType);
    if (searchParams.minPrice) params.set("minPrice", String(searchParams.minPrice));
    if (searchParams.maxPrice) params.set("maxPrice", String(searchParams.maxPrice));
    if (searchParams.beds) params.set("beds", String(searchParams.beds));
    if (searchParams.baths) params.set("baths", String(searchParams.baths));
    if (searchParams.minSqft) params.set("minSqft", String(searchParams.minSqft));
    if (searchParams.maxSqft) params.set("maxSqft", String(searchParams.maxSqft));
    if (searchParams.minLotSize) params.set("minLotSize", String(searchParams.minLotSize));
    if (searchParams.maxLotSize) params.set("maxLotSize", String(searchParams.maxLotSize));
    if (searchParams.yearBuiltMin) params.set("yearBuiltMin", String(searchParams.yearBuiltMin));
    if (searchParams.yearBuiltMax) params.set("yearBuiltMax", String(searchParams.yearBuiltMax));
    if (searchParams.listingType) params.set("listingType", searchParams.listingType);
    
    // Handle features array
    if (searchParams.features && searchParams.features.length > 0) {
      params.set("features", searchParams.features.join(','));
    }
    
    // Update URL and trigger new search
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-primary-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-10 text-center">{t('common.findYourDreamProperty')}</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search Panel */}
          <div className="lg:w-1/3">
            <div className="glassmorphism-card p-6">
              <h3 className="text-xl font-semibold text-primary-800 mb-4">{t('common.searchProperties')}</h3>
              
              {/* Buy/Sell/Rent Tabs */}
              <Tabs 
                defaultValue={searchParams.listingType || "buy"} 
                className="mb-4"
                onValueChange={(value) => handleInputChange('listingType', value)}
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="buy" className="text-sm">Buy</TabsTrigger>
                  <TabsTrigger value="rent" className="text-sm">Rent</TabsTrigger>
                  <TabsTrigger value="sell" className="text-sm">Sell</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Search Form */}
              <div className="space-y-4">
                {/* Location input */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-primary-700 mb-1">{t('common.location')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-primary-400" />
                    </div>
                    <Input 
                      id="location" 
                      placeholder="Enter city, zip or address"
                      className="pl-10"
                      value={searchParams.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Property type */}
                <div>
                  <label htmlFor="property_type" className="block text-sm font-medium text-primary-700 mb-1">{t('common.propertyType')}</label>
                  <Select 
                    value={searchParams.propertyType} 
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Property Types" />
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
                
                {/* Price range */}
                <div>
                  <label htmlFor="price_range" className="block text-sm font-medium text-primary-700 mb-1">{t('common.priceRange')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-primary-500">$</span>
                      </div>
                      <Input 
                        id="min_price" 
                        placeholder="Min" 
                        className="pl-8"
                        type="number"
                        value={searchParams.minPrice || ''}
                        onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-primary-500">$</span>
                      </div>
                      <Input 
                        id="max_price" 
                        placeholder="Max" 
                        className="pl-8"
                        type="number"
                        value={searchParams.maxPrice || ''}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Beds & Baths */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="beds-field" className="block text-sm font-medium text-primary-700 mb-1">{t('common.beds')}</label>
                    <Select 
                      value={searchParams.beds?.toString()} 
                      onValueChange={(value) => handleInputChange('beds', value ? Number(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.any')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('common.any')}</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="baths" className="block text-sm font-medium text-primary-700 mb-1">{t('common.baths')}</label>
                    <Select 
                      value={searchParams.baths?.toString()} 
                      onValueChange={(value) => handleInputChange('baths', value ? Number(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.any')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('common.any')}</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* More filters dropdown */}
                <div className="border-t border-primary-200 pt-4 mt-2">
                  <Collapsible
                    open={isAdvancedOpen}
                    onOpenChange={setIsAdvancedOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <button type="button" className="flex items-center text-primary-600 hover:text-primary-800 text-sm">
                        <Sliders className="h-4 w-4 mr-2" />
                        {t('common.moreFilters')}
                        <svg 
                          className={`ml-1 h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4 space-y-4">
                      {/* Square footage */}
                      <div>
                        <label htmlFor="sqft" className="block text-sm font-medium text-primary-700 mb-1">{t('common.squareFootage')}</label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            id="min_sqft" 
                            placeholder={t('common.min')} 
                            type="number"
                            value={searchParams.minSqft || ''}
                            onChange={(e) => handleInputChange('minSqft', e.target.value ? Number(e.target.value) : undefined)}
                          />
                          <Input 
                            id="max_sqft" 
                            placeholder={t('common.max')} 
                            type="number"
                            value={searchParams.maxSqft || ''}
                            onChange={(e) => handleInputChange('maxSqft', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>
                      
                      {/* Lot size */}
                      <div>
                        <label htmlFor="lot_size" className="block text-sm font-medium text-primary-700 mb-1">Lot Size (m²)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            id="min_lot_size" 
                            placeholder={t('common.min')} 
                            type="number"
                            value={searchParams.minLotSize || ''}
                            onChange={(e) => handleInputChange('minLotSize', e.target.value ? Number(e.target.value) : undefined)}
                          />
                          <Input 
                            id="max_lot_size" 
                            placeholder={t('common.max')} 
                            type="number"
                            value={searchParams.maxLotSize || ''}
                            onChange={(e) => handleInputChange('maxLotSize', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>
                      
                      {/* Year built */}
                      <div>
                        <label htmlFor="year_built" className="block text-sm font-medium text-primary-700 mb-1">Year Built</label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            id="year_built_min" 
                            placeholder="From" 
                            type="number"
                            value={searchParams.yearBuiltMin || ''}
                            onChange={(e) => handleInputChange('yearBuiltMin', e.target.value ? Number(e.target.value) : undefined)}
                          />
                          <Input 
                            id="year_built_max" 
                            placeholder="To" 
                            type="number"
                            value={searchParams.yearBuiltMax || ''}
                            onChange={(e) => handleInputChange('yearBuiltMax', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>
                      
                      {/* Features checklist */}
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">{t('common.features.title')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="feature-pool" 
                              checked={(searchParams.features || []).includes('pool')}
                              onCheckedChange={() => handleFeatureToggle('pool')}
                            />
                            <label htmlFor="feature-pool" className="text-sm text-primary-700">{t('common.features.pool')}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="feature-garage" 
                              checked={(searchParams.features || []).includes('garage')}
                              onCheckedChange={() => handleFeatureToggle('garage')}
                            />
                            <label htmlFor="feature-garage" className="text-sm text-primary-700">{t('common.features.garage')}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="feature-waterfront" 
                              checked={(searchParams.features || []).includes('waterfront')}
                              onCheckedChange={() => handleFeatureToggle('waterfront')}
                            />
                            <label htmlFor="feature-waterfront" className="text-sm text-primary-700">{t('common.features.waterfront')}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="feature-fireplace" 
                              checked={(searchParams.features || []).includes('fireplace')}
                              onCheckedChange={() => handleFeatureToggle('fireplace')}
                            />
                            <label htmlFor="feature-fireplace" className="text-sm text-primary-700">{t('common.features.fireplace')}</label>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Search button */}
                <Button 
                  className="w-full bg-secondary-500 hover:bg-secondary-600"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('common.searchProperties')}
                </Button>
                
                {/* Save search */}
                <div className="text-center">
                  <button type="button" className="text-secondary-500 hover:text-secondary-600 text-sm font-medium inline-flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {t('common.saveThisSearch')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map */}
          <div className="lg:w-2/3 rounded-xl overflow-hidden shadow-lg glassmorphism-card relative">
            {/* This would be a real interactive map in production */}
            <div className="h-[500px] bg-primary-100 relative" id="property-map">
              {/* Barcelona map content */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579282240050-352db0a14c21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1366&h=768&q=80')] bg-cover bg-center"></div>
              
              {/* Map Markers */}
              <div className="absolute" style={{ top: '40%', left: '35%' }}>
                <div className="glassmorphism-small text-primary-800 font-bold px-2 py-1 rounded-lg shadow-lg hover:bg-white/40 cursor-pointer">
                  $1.2M
                </div>
              </div>
              <div className="absolute" style={{ top: '55%', left: '48%' }}>
                <div className="glassmorphism-small text-primary-800 font-bold px-2 py-1 rounded-lg shadow-lg hover:bg-white/40 cursor-pointer">
                  $785K
                </div>
              </div>
              <div className="absolute" style={{ top: '30%', left: '60%' }}>
                <div className="glassmorphism-small text-primary-800 font-bold px-2 py-1 rounded-lg shadow-lg hover:bg-white/40 cursor-pointer">
                  $3.4M
                </div>
              </div>
              
              {/* Map controls */}
              <div className="absolute top-4 right-4 glassmorphism-small rounded-lg shadow-md">
                <button className="p-2 hover:bg-primary-50 transition text-primary-800">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div className="border-t border-primary-200"></div>
                <button className="p-2 hover:bg-primary-50 transition text-primary-800">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Property cards preview */}
            <div className="p-4 border-t border-primary-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-primary-800">{t('common.propertiesFound', { count: 15 })}</h3>
                <div className="flex items-center">
                  <span className="text-sm text-primary-500 mr-2">{t('common.view')}:</span>
                  <button className="p-1.5 rounded bg-primary-100 text-primary-800 mr-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded text-primary-600 hover:bg-primary-50">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Horizontal scrolling preview */}
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* Property 1 */}
                <div className="flex-shrink-0 w-60 rounded-lg overflow-hidden bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-lg">
                  <div className="h-32 overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&w=400&h=250&crop=entropy&fit=crop&q=80" 
                      className="w-full h-full object-cover" 
                      alt="Modern home with large windows" 
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
                    <h4 className="font-bold text-white">$1,000,000</h4>
                    <p className="text-secondary-400 font-medium">3 bd | 2 ba | 1,900 sqft</p>
                    
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>223 Maple Street, Brooklyn</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
                      <div className="flex space-x-3 text-xs">
                        <div className="flex items-center text-gray-300">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>3</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>2</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Maximize className="h-3 w-3 mr-1" />
                          <span>1,900</span>
                        </div>
                      </div>
                      <button className="text-white bg-secondary-500 hover:bg-secondary-600 text-xs py-1 px-3 rounded">
                        View
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Property 2 */}
                <div className="flex-shrink-0 w-60 rounded-lg overflow-hidden bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-lg">
                  <div className="h-32 overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=400&h=250&crop=entropy&fit=crop&q=80" 
                      className="w-full h-full object-cover" 
                      alt="Luxury home with pool" 
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
                    <h4 className="font-bold text-white">$1,100,000</h4>
                    <p className="text-secondary-400 font-medium">4 bd | 2 ba | 2,000 sqft</p>
                    
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>323 Maple Street, Brooklyn</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
                      <div className="flex space-x-3 text-xs">
                        <div className="flex items-center text-gray-300">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>4</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>2</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Maximize className="h-3 w-3 mr-1" />
                          <span>2,000</span>
                        </div>
                      </div>
                      <button className="text-white bg-secondary-500 hover:bg-secondary-600 text-xs py-1 px-3 rounded">
                        View
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Property 3 */}
                <div className="flex-shrink-0 w-60 rounded-lg overflow-hidden bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-lg">
                  <div className="h-32 overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&w=400&h=250&crop=entropy&fit=crop&q=80" 
                      className="w-full h-full object-cover" 
                      alt="Modern single family home" 
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
                    <h4 className="font-bold text-white">$1,200,000</h4>
                    <p className="text-secondary-400 font-medium">5 bd | 2 ba | 2,100 sqft</p>
                    
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>423 Maple Street, Brooklyn</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
                      <div className="flex space-x-3 text-xs">
                        <div className="flex items-center text-gray-300">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>5</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>2</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Maximize className="h-3 w-3 mr-1" />
                          <span>2,100</span>
                        </div>
                      </div>
                      <button className="text-white bg-secondary-500 hover:bg-secondary-600 text-xs py-1 px-3 rounded">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
