import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Property, Neighborhood } from "@shared/schema";
import { useParams, Link } from "wouter";
import { Loader2Icon, MapPin, Bed, Bath, ArrowLeft, Heart, Share, Printer, Home, Info, MessageCircle, Sparkles, BarChart2, TrendingUp, CalendarClock } from "lucide-react";
import PersonalizedDescription from "@/components/properties/personalized-description";
import PropertyValuePredictor from "@/components/property/PropertyValuePredictor";
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
import PropertyActionButtons from "@/components/properties/property-action-buttons";
import EnhancedPropertyMap from "@/components/map/enhanced-property-map";
import NeighborhoodScoreCard from "@/components/neighborhoods/neighborhood-score-card";
import { formatPrice } from "@/lib/utils";
import { PropertySchema, BreadcrumbsSchema } from "@/components/seo/schema-markup";
import { PropertyMetaTags } from "@/components/seo/meta-tags";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PropertyTourWidget from "@/components/properties/property-tour-widget";
import TourScheduler from "@/components/properties/tour-scheduler";

interface PropertyDetailsPageProps {
  id: string;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Property Details - Inmobi";
  }, []);

  const { isLoading, error, data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      return response.json();
    },
  });

  const { data: favorites } = useQuery<Property[]>({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/user/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    },
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
        <Loader2Icon className="h-8 w-8 animate-spin text-primary-500" />
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
      
      {/* Floating Action Buttons for one-click saving and sharing */}
      <PropertyActionButtons 
        property={property}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        variant="floating"
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
            
            <Link href={`/property/${property.id}/analytics`}>
              <Button 
                variant="outline"
                className={user?.subscriptionTier === 'free' ? 'opacity-60' : ''}
                onClick={(e) => {
                  if (user?.subscriptionTier === 'free') {
                    e.preventDefault();
                    toast({
                      title: "Premium Feature",
                      description: "Upgrade to premium to access property analytics",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <BarChart2 className="mr-2 h-4 w-4" /> Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Property Gallery */}
        <PropertyGallery images={property.images} />

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-primary-800 mb-2">{property.title}</h1>
            <div className="flex items-center text-primary-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1 text-primary-600" />
                <span>{property.bedrooms} beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1 text-primary-600" />
                <span>{property.bathrooms} baths</span>
              </div>
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-1 text-primary-600" />
                <span>{property.squareFeet.toLocaleString()} sq ft</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">Description</h2>
              <p className="text-primary-600 whitespace-pre-line">{property.description}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-secondary-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">Location</h2>
              <EnhancedPropertyMap 
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <div className="text-3xl font-bold text-primary-800 mb-2">
                {formatPrice(property.price)}
              </div>
              
              <div className="flex items-center text-primary-600 mb-4">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Price per sq ft: ${Math.round(property.price / property.squareFeet)}</span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <Button className="w-full" size="lg">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Schedule a Tour
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Agent
                </Button>

                <Button variant="outline" className="w-full" size="lg" onClick={toggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save Property'}
                </Button>

                <PropertyShare property={property} variant="button" className="w-full" />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary-600">Property Type:</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Year Built:</span>
                  <span className="font-medium">{property.yearBuilt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Lot Size:</span>
                  <span className="font-medium">{property.lotSize.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Garage:</span>
                  <span className="font-medium">{property.garage ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Pool:</span>
                  <span className="font-medium">{property.pool ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <PropertyValuePredictor property={property} />
            </div>
          </div>
        </div>

        {/* Neighborhood Information */}
        {property.neighborhoodId && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary-800 mb-6">Neighborhood</h2>
            <NeighborhoodScoreCard neighborhoodId={property.neighborhoodId} />
          </div>
        )}

        {/* Personalized Description */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary-800 mb-6">Personalized Description</h2>
          <PersonalizedDescription property={property} />
        </div>

        {/* Chat Widget */}
        <ChatWidget propertyId={property.id} />

        {/* Tour Scheduler */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="fixed bottom-4 right-4">
              <CalendarClock className="mr-2 h-4 w-4" />
              Schedule a Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule a Property Tour</DialogTitle>
              <DialogDescription>
                Choose a date and time that works for you to tour this property.
              </DialogDescription>
            </DialogHeader>
            <TourScheduler propertyId={property.id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
