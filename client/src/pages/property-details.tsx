import { useQuery } from "@tanstack/react-query";
import { Property, Neighborhood } from "@shared/schema";
import { useParams, Link } from "wouter";
import { Loader2, MapPin, Bed, Bath, ArrowLeft, Heart, Share, Printer, Home, Info, MessageCircle, Sparkles } from "lucide-react";
import PersonalizedDescription from "@/components/properties/personalized-description";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropertyGallery from "@/components/properties/property-gallery";
import PropertyShare from "@/components/properties/property-share";
import EnhancedPropertyMap from "@/components/map/enhanced-property-map";
import NeighborhoodScoreCard from "@/components/neighborhoods/neighborhood-score-card";
import { formatPrice } from "@/lib/utils";
import { PropertySchema, BreadcrumbsSchema } from "@/components/seo/schema-markup";
import { PropertyMetaTags } from "@/components/seo/meta-tags";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Property Details - Foundation";
  }, []);

  const { isLoading, error, data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  const { data: favorites } = useQuery<Property[]>({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
  });

  // Check if property is in favorites
  useEffect(() => {
    if (favorites && property) {
      const isFav = favorites.some(fav => fav.id === property.id);
      setIsFavorite(isFav);
    }
  }, [favorites, property]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/user/favorites/${property?.id}`);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Property removed from your favorites",
        });
      } else {
        await apiRequest("POST", "/api/user/favorites", { propertyId: property?.id });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Property added to your favorites",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-primary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h1 className="text-2xl font-bold text-primary-800 mb-4">Property Not Found</h1>
            <p className="text-primary-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Define base URL for SEO
  const baseUrl = window.location.origin;
  
  // Define breadcrumbs for schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/search' },
    { name: property.title, url: `/property/${property.id}` }
  ];

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      {/* SEO Meta Tags */}
      <PropertyMetaTags 
        property={{
          title: property.title,
          description: property.description,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFeet: property.squareFeet,
          address: property.address,
          city: property.city,
          state: property.state,
          image: property.images[0]
        }}
        baseUrl={baseUrl}
        propertyId={property.id}
        keywords={[
          'real estate', 
          property.city, 
          property.state, 
          property.propertyType
        ]}
      />
      
      {/* Schema.org Structured Data */}
      <PropertySchema 
        property={property} 
        baseUrl={baseUrl} 
      />
      
      {/* Breadcrumbs Schema */}
      <BreadcrumbsSchema 
        items={breadcrumbItems}
        baseUrl={baseUrl}
      />
      
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center mb-6 text-sm">
          <Link href="/">
            <a className="text-primary-600 hover:text-primary-800 transition">Home</a>
          </Link>
          <span className="mx-2 text-primary-400">/</span>
          <Link href="/search">
            <a className="text-primary-600 hover:text-primary-800 transition">Properties</a>
          </Link>
          <span className="mx-2 text-primary-400">/</span>
          <span className="text-primary-800 font-medium">{property.title}</span>
        </div>

        {/* Back button and actions */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <Link href="/search">
            <Button variant="outline" className="mb-2 sm:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>
          </Link>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={toggleFavorite}
              className={isFavorite ? 'border-secondary-500 text-secondary-500' : ''}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            
            <PropertyShare property={property} variant="button" />
            
            <Button 
              variant="outline"
              onClick={() => {
                window.print();
                toast({
                  title: "Printing",
                  description: "Preparing property details for printing",
                });
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "Authentication Required",
                    description: "Please login to message the owner",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Navigate to messages tab in dashboard
                window.location.href = `/dashboard?tab=messages&property=${property.id}`;
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Message
            </Button>
          </div>
        </div>

        {/* Property Overview */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Property Gallery */}
          <PropertyGallery images={property.images} />
          
          <div className="p-6">
            {/* Property header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                {property.isPremium && (
                  <span className="inline-block bg-secondary-500 text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                    Premium
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-primary-800 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-primary-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-3xl font-bold text-primary-800">
                  {formatPrice(property.price)}
                </div>
                {property.isPremium && (
                  <div className="text-secondary-500 font-medium text-sm flex items-center justify-end mt-1">
                    Premium listing
                  </div>
                )}
              </div>
            </div>
            
            {/* Property features */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-primary-100">
              <div className="text-center">
                <div className="flex justify-center">
                  <Bed className="h-5 w-5 text-primary-600" />
                </div>
                <div className="mt-1">
                  <span className="font-bold text-primary-800">{property.bedrooms}</span>
                  <span className="text-primary-600 text-sm ml-1">Beds</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center">
                  <Bath className="h-5 w-5 text-primary-600" />
                </div>
                <div className="mt-1">
                  <span className="font-bold text-primary-800">{property.bathrooms}</span>
                  <span className="text-primary-600 text-sm ml-1">Baths</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center">
                  <svg
                    className="h-5 w-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                </div>
                <div className="mt-1">
                  <span className="font-bold text-primary-800">{property.squareFeet.toLocaleString()}</span>
                  <span className="text-primary-600 text-sm ml-1">Sq Ft</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-800 mb-3">About This Property</h2>
              <p className="text-primary-600 mb-6">{property.description}</p>
              
              {/* AI-Powered Personalized Description */}
              {user && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-primary-800 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 text-secondary-500 mr-2" />
                    Personalized Insights
                  </h3>
                  <PersonalizedDescription propertyId={property.id} className="mt-2" />
                </div>
              )}
              
              {/* Share section */}
              <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-800 mb-2 flex items-center">
                  <Share className="h-4 w-4 text-secondary-500 mr-2" />
                  {t('property.shareTitle', 'Share this property')}
                </h3>
                <p className="text-primary-600 mb-4 text-sm">
                  {t('property.shareDescription', 'Share this property with friends and family, or save it for future reference. You can share via social media, email, or by copying the link.')}
                </p>
                <PropertyShare property={property} variant="iconButton" className="mt-2" />
              </div>
            </div>
            
            {/* Property features list */}
            {property.features && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary-800 mb-3">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg
                        className="h-4 w-4 text-secondary-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-primary-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact section */}
            <div className="bg-primary-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-primary-800 mb-4">Interested in this property?</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <Button className="flex-1 bg-secondary-600 hover:bg-secondary-700">Schedule a Viewing</Button>
                <Button variant="outline" className="flex-1">Contact Agent</Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Location and Neighborhood */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <Tabs defaultValue="location" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="neighborhood">Neighborhood</TabsTrigger>
              </TabsList>
              
              <TabsContent value="location" className="mt-0">
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <EnhancedPropertyMap
                    initialProperty={property}
                    center={{ lat: property.latitude, lng: property.longitude }}
                    zoom={15}
                    height="100%"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="neighborhood" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    {property.neighborhoodId ? (
                      <NeighborhoodScoreCard neighborhoodId={property.neighborhoodId} />
                    ) : (
                      <div className="bg-primary-50 p-6 rounded-lg text-center">
                        <Info className="h-10 w-10 text-primary-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-primary-800 mb-2">No Neighborhood Data</h3>
                        <p className="text-primary-600 text-sm">
                          Detailed neighborhood information is not available for this property.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-2 h-[400px] rounded-lg overflow-hidden">
                    <EnhancedPropertyMap
                      initialProperty={property}
                      center={{ lat: property.latitude, lng: property.longitude }}
                      zoom={14}
                      height="100%"
                      showNeighborhoodData={true}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
