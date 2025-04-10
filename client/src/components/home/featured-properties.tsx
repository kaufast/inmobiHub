import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import PropertyCard from "@/components/properties/property-card";
import { Loader2 } from "lucide-react";

export default function FeaturedProperties() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const blueBackgroundStyle = {
    backgroundColor: '#1d4ed8',
    backgroundImage: 'linear-gradient(to bottom, #1d4ed8, #1e40af)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  return (
    <section 
      id="featured-properties" 
      className="py-16"
      style={blueBackgroundStyle}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Properties</h2>
            <p className="text-white/80 mt-2">Exclusive listings with premium potential</p>
          </div>
          <Link href="/search">
            <a className="text-white hover:text-white/80 font-medium mt-4 md:mt-0 inline-flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
              View all properties
              <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </Link>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl p-8 text-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-white bg-red-500 px-4 py-2 rounded-lg inline-block">Failed to load featured properties</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties && properties.length > 0 ? (
                properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-white bg-blue-600 px-4 py-3 rounded-lg inline-block shadow-sm">No featured properties available at the moment</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
