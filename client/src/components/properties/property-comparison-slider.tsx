import { useState, useRef, useEffect } from "react";
import { Property } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { Bed, Bath, Home, Ruler, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface PropertyComparisonSliderProps {
  properties: Property[];
  onClose?: () => void;
}

export default function PropertyComparisonSlider({ properties, onClose }: PropertyComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Make sure we have at least 2 properties to compare
  if (properties.length < 2) {
    return (
      <div className="p-8 text-center">
        <p>At least two properties are needed for comparison</p>
        <Button className="mt-4" onClick={onClose}>Close</Button>
      </div>
    );
  }
  
  // Handle property navigation
  useEffect(() => {
    if (activeIndex >= properties.length) {
      setActiveIndex(0);
    }
    
    setNextIndex((activeIndex + 1) % properties.length);
  }, [activeIndex, properties.length]);
  
  const handleSliderChange = (value: number[]) => {
    setSliderPosition(value[0]);
  };
  
  const handlePrevProperty = () => {
    setActiveIndex((current) => (current - 1 + properties.length) % properties.length);
  };
  
  const handleNextProperty = () => {
    setActiveIndex((current) => (current + 1) % properties.length);
  };
  
  const propertyA = properties[activeIndex];
  const propertyB = properties[nextIndex];
  
  // Calculate price difference percentage
  const priceDiff = propertyB.price - propertyA.price;
  const priceDiffPercentage = ((priceDiff / propertyA.price) * 100).toFixed(1);
  const priceDiffLabel = priceDiff > 0 
    ? `${priceDiffPercentage}% more expensive` 
    : `${Math.abs(Number(priceDiffPercentage))}% less expensive`;
  
  // Calculate size difference
  const sizeDiff = propertyB.squareFeet - propertyA.squareFeet;
  const sizeDiffPercentage = ((sizeDiff / propertyA.squareFeet) * 100).toFixed(1);
  const sizeDiffLabel = sizeDiff > 0 
    ? `${sizeDiffPercentage}% larger` 
    : `${Math.abs(Number(sizeDiffPercentage))}% smaller`;
  
  return (
    <div className="relative bg-background rounded-lg shadow-xl overflow-hidden max-w-5xl mx-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Interactive Property Comparison</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      {/* Comparison controls */}
      <div className="flex justify-between items-center p-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevProperty}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Comparing {activeIndex + 1} of {properties.length} with {nextIndex + 1} of {properties.length}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextProperty}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-48">
          <Slider
            defaultValue={[50]}
            value={[sliderPosition]}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="cursor-ew-resize"
          />
        </div>
      </div>
      
      {/* Property comparison container */}
      <div className="relative h-[600px] overflow-hidden" ref={containerRef}>
        {/* Left property (Property A) */}
        <div 
          className="absolute inset-0 transition-all duration-300 ease-in-out"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            zIndex: 10,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)'
          }}
        >
          <PropertyView property={propertyA} />
        </div>
        
        {/* Comparison slider handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-secondary-500 cursor-ew-resize z-30 shadow-md"
          style={{ 
            left: `${sliderPosition}%`,
            marginLeft: '-2px'
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-secondary-500 shadow-lg flex items-center justify-center">
            <div className="h-2 w-1 bg-white rounded-full mr-1"></div>
            <div className="h-2 w-1 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Right property (Property B) */}
        <div 
          className="absolute inset-0 transition-all duration-300 ease-in-out"
          style={{ zIndex: 5 }}
        >
          <PropertyView property={propertyB} />
        </div>
      </div>
      
      {/* Comparison details */}
      <div className="p-6 bg-muted/10 border-t">
        <h4 className="text-lg font-semibold mb-3">Quick Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium mb-2">Price Difference</h5>
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-sm text-muted-foreground">{propertyA.title}</span>
                <span className="text-lg font-medium">{formatPrice(propertyA.price)}</span>
              </div>
              <div className="text-center font-medium text-sm px-3 py-1 rounded-full bg-muted">
                vs
              </div>
              <div className="text-right">
                <span className="block text-sm text-muted-foreground">{propertyB.title}</span>
                <span className="text-lg font-medium">{formatPrice(propertyB.price)}</span>
              </div>
            </div>
            <div className={`mt-2 text-sm font-medium px-3 py-1 rounded-full text-center ${priceDiff > 0 ? 'bg-error/20 text-error' : 'bg-success/20 text-success'}`}>
              {priceDiffLabel}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Size Difference</h5>
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-sm text-muted-foreground">{propertyA.title}</span>
                <span className="text-lg font-medium">{propertyA.squareFeet.toLocaleString()} sqft</span>
              </div>
              <div className="text-center font-medium text-sm px-3 py-1 rounded-full bg-muted">
                vs
              </div>
              <div className="text-right">
                <span className="block text-sm text-muted-foreground">{propertyB.title}</span>
                <span className="text-lg font-medium">{propertyB.squareFeet.toLocaleString()} sqft</span>
              </div>
            </div>
            <div className={`mt-2 text-sm font-medium px-3 py-1 rounded-full text-center ${sizeDiff > 0 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {sizeDiffLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component to display property view
function PropertyView({ property }: { property: Property }) {
  return (
    <div className="h-full overflow-auto">
      {/* Property image */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h3 className="text-white text-2xl font-bold">{property.title}</h3>
          <p className="text-white/80 mt-1">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
          <p className="text-white text-xl font-bold mt-2">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
      
      {/* Property details */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <Bed className="h-6 w-6 text-primary mr-3" />
            <div>
              <span className="block text-sm text-muted-foreground">Bedrooms</span>
              <span className="text-lg font-medium">{property.bedrooms}</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <Bath className="h-6 w-6 text-primary mr-3" />
            <div>
              <span className="block text-sm text-muted-foreground">Bathrooms</span>
              <span className="text-lg font-medium">{property.bathrooms}</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <Home className="h-6 w-6 text-primary mr-3" />
            <div>
              <span className="block text-sm text-muted-foreground">Type</span>
              <span className="text-lg font-medium capitalize">{property.propertyType}</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <Ruler className="h-6 w-6 text-primary mr-3" />
            <div>
              <span className="block text-sm text-muted-foreground">Size</span>
              <span className="text-lg font-medium">{property.squareFeet.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
        
        {property.yearBuilt && (
          <div className="flex items-center mb-6">
            <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-sm">Built in {property.yearBuilt}</span>
          </div>
        )}
        
        <h4 className="text-lg font-medium mb-2">About this property</h4>
        <p className="text-muted-foreground">{property.description}</p>
        
        {/* Features list */}
        {property.features && property.features.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3">Key Features</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {property.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}