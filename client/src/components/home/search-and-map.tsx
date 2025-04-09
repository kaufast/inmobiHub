import { useState } from "react";
import { useLocation } from "wouter";
import { SearchProperties } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, Sliders } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";

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
              {/* Mock map content */}
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-73.9857,40.7484,12,0/800x500')] bg-cover bg-center"></div>
              
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
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex-shrink-0 w-60 glassmorphism-card rounded-lg overflow-hidden">
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&w=400&h=250&crop=entropy&fit=crop&q=80&index=${index}`} 
                        className="w-full h-full object-cover" 
                        alt="Property preview" 
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-primary-800">${(900 + index * 100).toLocaleString()},000</h4>
                      <p className="text-sm text-primary-600">{2 + index} bd | {2} ba | {(1800 + index * 100).toLocaleString()} sqft</p>
                      <p className="text-xs text-primary-500 truncate">{123 + index * 100} Maple Street, Brooklyn</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
