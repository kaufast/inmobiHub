import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, MapPin, Building, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import NeighborhoodInsights from '@/components/neighborhoods/neighborhood-insights';
import EnhancedPropertyMap from '@/components/map/enhanced-property-map';

export default function NeighborhoodInsightsPage() {
  const [selectedCity, setSelectedCity] = useState('Mexico City');
  const [selectedState, setSelectedState] = useState('CDMX');
  
  // Set document title
  useEffect(() => {
    document.title = `${selectedCity} Real Estate Insights - Inmobi`;
  }, [selectedCity]);

  // Sample city data
  const cityOptions = [
    { city: 'Mexico City', state: 'CDMX' },
    { city: 'Cancún', state: 'Quintana Roo' },
  ];

  // Sample neighborhood data for Mexico City
  const mexicoCityNeighborhoods = [
    { id: 1, name: 'Polanco', lat: 19.4284, lng: -99.1996 },
    { id: 2, name: 'Condesa', lat: 19.4136, lng: -99.1709 },
    { id: 3, name: 'Roma Norte', lat: 19.4194, lng: -99.1599 },
  ];

  // Sample neighborhood data for Cancún
  const cancunNeighborhoods = [
    { id: 4, name: 'Zona Hotelera', lat: 21.0921, lng: -86.7664 },
    { id: 5, name: 'Puerto Juárez', lat: 21.1768, lng: -86.8098 },
  ];

  // Get neighborhoods based on selected city
  const neighborhoods = selectedCity === 'Mexico City' ? mexicoCityNeighborhoods : cancunNeighborhoods;

  const cityLatLng = selectedCity === 'Mexico City' 
    ? { lat: 19.4326, lng: -99.1332 } 
    : { lat: 21.1619, lng: -86.8515 };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center mb-6 text-sm">
          <Link href="/">
            <a className="text-primary-600 hover:text-primary-800 transition">Home</a>
          </Link>
          <span className="mx-2 text-primary-400">/</span>
          <span className="text-primary-800 font-medium">Neighborhood Insights</span>
        </div>

        {/* Back button */}
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-800 mb-2">
              Neighborhood Insights
            </h1>
            <p className="text-primary-600 max-w-2xl">
              Discover detailed insights about neighborhoods including market trends, livability scores, schools, and amenities to help you make informed real estate decisions.
            </p>
          </div>

          {/* City selector */}
          <div className="w-full md:w-auto">
            <Select
              value={`${selectedCity}-${selectedState}`}
              onValueChange={(value) => {
                const [city, state] = value.split('-');
                setSelectedCity(city);
                setSelectedState(state);
              }}
            >
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((option) => (
                  <SelectItem 
                    key={`${option.city}-${option.state}`} 
                    value={`${option.city}-${option.state}`}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                      {option.city}, {option.state}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map and Neighborhood overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 h-[400px] bg-white rounded-xl shadow-md overflow-hidden">
            <EnhancedPropertyMap
              center={cityLatLng}
              zoom={12}
              height="100%"
              showNeighborhoodData={true}
            />
          </div>

          <Card className="lg:col-span-1 bg-white shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary-500" />
                Neighborhoods in {selectedCity}
              </h2>
              <div className="space-y-3">
                {neighborhoods.map((neighborhood) => (
                  <div 
                    key={neighborhood.id}
                    className="p-3 rounded-lg border border-primary-100 hover:bg-primary-50 transition cursor-pointer"
                    onClick={() => {
                      const section = document.getElementById(`neighborhood-${neighborhood.id}`);
                      if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-primary-800">{neighborhood.name}</h3>
                        <p className="text-sm text-primary-600">{selectedCity}, {selectedState}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary-600">
                        <Info className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Neighborhood insights sections */}
        {neighborhoods.map((neighborhood) => (
          <div 
            key={neighborhood.id}
            id={`neighborhood-${neighborhood.id}`}
            className="mb-16 pb-8 border-b border-primary-200 last:border-b-0 last:pb-0"
          >
            <NeighborhoodInsights 
              neighborhoodId={neighborhood.id} 
              city={selectedCity} 
              state={selectedState} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}