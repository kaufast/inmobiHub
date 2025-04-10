import { useState } from "react";
import { SearchProperties } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, MapPin, Sliders, Image, Mic } from "lucide-react";

interface PropertySearchProps {
  initialValues?: Partial<SearchProperties>;
  onSearch: (params: SearchProperties) => void;
  compact?: boolean;
}

export default function PropertySearch({ 
  initialValues = { searchType: "text" }, 
  onSearch,
  compact = false
}: PropertySearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchProperties>({
    searchType: initialValues.searchType || "text",
    location: initialValues.location || "",
    listingType: initialValues.listingType || "buy",
    propertyType: initialValues.propertyType,
    minPrice: initialValues.minPrice,
    maxPrice: initialValues.maxPrice,
    beds: initialValues.beds,
    baths: initialValues.baths,
    minSqft: initialValues.minSqft,
    maxSqft: initialValues.maxSqft,
    features: initialValues.features || [],
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className={compact ? "p-4" : "p-6"}>
      <h3 className={`${compact ? "text-lg" : "text-xl"} font-semibold text-primary-800 mb-4`}>Search Properties</h3>
      
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        {/* Location input */}
        <div>
          <Label htmlFor="location" className="block text-sm font-medium text-primary-700 mb-1">Location</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-primary-400" />
            </div>
            <Input 
              id="location" 
              placeholder="Enter city, zip or address"
              className="pl-10 pr-10 bg-gray-100 focus:bg-white border-gray-300"
              value={searchParams.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                className="h-full px-3 text-gray-500 hover:text-secondary-600 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Search by section */}
        <div className="mb-6">
          <Label className="block text-base font-bold text-secondary-600 mb-5">Search by</Label>
          <div className="flex items-center space-x-6 mt-4 pt-2">
            {/* Text search button */}
            <Button
              type="button"
              size="icon"
              variant={searchParams.searchType === 'text' ? 'default' : 'outline'}
              className="h-14 w-14 rounded-full bg-primary-800" 
              onClick={() => handleInputChange('searchType', 'text')}
            >
              <Search className="h-6 w-6" />
            </Button>
            
            {/* Image search icon */}
            <Button
              type="button"
              size="icon"
              variant={searchParams.searchType === 'image' ? 'default' : 'outline'}
              className="h-14 w-14 rounded-full"
              onClick={() => handleInputChange('searchType', 'image')}
            >
              <Image className="h-6 w-6" />
            </Button>
            
            {/* Voice search icon */}
            <Button
              type="button"
              size="icon"
              variant={searchParams.searchType === 'audio' ? 'default' : 'outline'}
              className="h-14 w-14 rounded-full"
              onClick={() => handleInputChange('searchType', 'audio')}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Listing Type */}
        <div>
          <Label htmlFor="listing_type" className="block text-sm font-medium text-primary-700 mb-1">Listing Type</Label>
          <Select 
            value={searchParams.listingType} 
            onValueChange={(value) => handleInputChange('listingType', value as any)}
          >
            <SelectTrigger id="listing_type">
              <SelectValue placeholder="Buy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Property type */}
        <div>
          <Label htmlFor="property_type" className="block text-sm font-medium text-primary-700 mb-1">Property Type</Label>
          <Select 
            value={searchParams.propertyType} 
            onValueChange={(value) => handleInputChange('propertyType', value as any)}
          >
            <SelectTrigger id="property_type">
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
          <Label htmlFor="price_range" className="block text-sm font-medium text-primary-700 mb-1">Price Range</Label>
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
            <Label htmlFor="beds" className="block text-sm font-medium text-primary-700 mb-1">Beds</Label>
            <Select 
              value={searchParams.beds?.toString()} 
              onValueChange={(value) => handleInputChange('beds', value ? Number(value) : undefined)}
            >
              <SelectTrigger id="beds">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="baths" className="block text-sm font-medium text-primary-700 mb-1">Baths</Label>
            <Select 
              value={searchParams.baths?.toString()} 
              onValueChange={(value) => handleInputChange('baths', value ? Number(value) : undefined)}
            >
              <SelectTrigger id="baths">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
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
                More filters
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
                <Label htmlFor="sqft" className="block text-sm font-medium text-primary-700 mb-1">Square Footage</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    id="min_sqft" 
                    placeholder="Min" 
                    type="number"
                    value={searchParams.minSqft || ''}
                    onChange={(e) => handleInputChange('minSqft', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <Input 
                    id="max_sqft" 
                    placeholder="Max" 
                    type="number"
                    value={searchParams.maxSqft || ''}
                    onChange={(e) => handleInputChange('maxSqft', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              {/* Features checklist */}
              <div>
                <Label className="block text-sm font-medium text-primary-700 mb-2">Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="feature-pool" 
                      checked={(searchParams.features || []).includes('pool')}
                      onCheckedChange={() => handleFeatureToggle('pool')}
                    />
                    <label htmlFor="feature-pool" className="text-sm text-primary-700">Pool</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="feature-garage" 
                      checked={(searchParams.features || []).includes('garage')}
                      onCheckedChange={() => handleFeatureToggle('garage')}
                    />
                    <label htmlFor="feature-garage" className="text-sm text-primary-700">Garage</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="feature-waterfront" 
                      checked={(searchParams.features || []).includes('waterfront')}
                      onCheckedChange={() => handleFeatureToggle('waterfront')}
                    />
                    <label htmlFor="feature-waterfront" className="text-sm text-primary-700">Waterfront</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="feature-fireplace" 
                      checked={(searchParams.features || []).includes('fireplace')}
                      onCheckedChange={() => handleFeatureToggle('fireplace')}
                    />
                    <label htmlFor="feature-fireplace" className="text-sm text-primary-700">Fireplace</label>
                  </div>
                </div>
              </div>
              
              {/* Apply button for more filters */}
              <div className="mt-4">
                <Button 
                  type="button"
                  onClick={handleSearchSubmit}
                  variant="secondary"
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Search button */}
        <Button 
          type="submit"
          className="w-full bg-secondary-500 hover:bg-secondary-600"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Properties
        </Button>
        
        {/* Save search */}
        <div className="text-center">
          <button type="button" className="text-secondary-500 hover:text-secondary-600 text-sm font-medium inline-flex items-center">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Save this search
          </button>
        </div>
      </form>
    </div>
  );
}
