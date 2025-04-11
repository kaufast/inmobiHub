import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyCardProps = {
  property: {
    id: string | number;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    imageUrl: string;
    featured?: boolean;
  };
  priority?: boolean;
};

export default function LazyPropertyCard({ property, priority = false }: PropertyCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  const [isLoaded, setIsLoaded] = useState(priority);

  useEffect(() => {
    if (inView && !isLoaded) {
      setIsLoaded(true);
    }
  }, [inView, isLoaded]);

  // Format price with commas e.g. 1,450,000
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div ref={ref} className="transition-opacity duration-500" style={{ opacity: isLoaded ? 1 : 0 }}>
      {isLoaded ? (
        <Card className="overflow-hidden h-full border border-gray-700 bg-gray-900/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <img 
              src={property.imageUrl} 
              alt={property.title} 
              className="w-full h-48 object-cover"
              loading={priority ? "eager" : "lazy"}
              width={400}
              height={300}
            />
            {property.featured && (
              <div className="absolute top-2 right-2">
                <div className="bg-[#131c28] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                  Featured
                </div>
              </div>
            )}
            <div className="absolute top-2 left-2">
              <button className="bg-[#131c28] p-1.5 rounded-full shadow-md transition-transform hover:scale-110 hover:bg-[#0c1319]">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
          
          <CardContent className="p-3">
            <h3 className="font-bold text-white">{property.title}</h3>
            <p className="text-white font-medium">{formattedPrice}</p>
            
            <div className="flex items-center text-gray-400 text-xs mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{property.location}</span>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
              <div className="flex space-x-3 text-xs">
                <div className="flex items-center text-gray-300">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Maximize className="h-3 w-3 mr-1" />
                  <span>{property.squareMeters} m²</span>
                </div>
              </div>
              <button className="text-white bg-[#131c28] hover:bg-[#0c1319] text-xs py-1.5 px-3 rounded-md shadow-sm transition-all hover:shadow-md">
                View
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden h-full border border-gray-700 bg-gray-900/90 backdrop-blur-md">
          <div className="relative w-full h-48">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-3">
            <Skeleton className="h-6 w-4/5 mb-2" />
            <Skeleton className="h-5 w-2/5 mb-2" />
            <Skeleton className="h-4 w-3/5 mb-3" />
            <div className="pt-3 border-t border-gray-700">
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}