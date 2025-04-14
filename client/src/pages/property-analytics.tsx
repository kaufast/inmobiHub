import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';

interface AnalyticsData {
  viewsData: Array<{ date: string; views: number; marketAverage: number }>;
  inquiriesData: Array<{ date: string; inquiries: number; marketAverage: number }>;
  conversionData: Array<{ date: string; conversionRate: number; marketAverage: number }>;
  marketComparison: Array<{ name: string; property: number; market: number }>;
  priceHistory: Array<{ date: string; price: number; marketAverage: number }>;
  regionalData: Array<{ city: string; pricePerSqFt: number }>;
  rentalYield: number;
  valueChange: number;
  occupancyRate: number;
  projectedIncome: number;
  seasonalTrends: Array<{ season: string; views: number; inquiries: number; priceChange: string }>;
  competitorAnalysis: Array<{
    id: number;
    price: number;
    pricePerSqFt: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    daysOnMarket: number;
  }>;
}

const PropertyAnalyticsPage: React.FC = () => {
  const [params] = useParams();
  const propertyId = params.id;

  const { data: property, isLoading: isPropertyLoading } = useQuery<Property>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      return response.json();
    },
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['property-analytics', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  if (isPropertyLoading || isAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!property || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Property or analytics data not found</p>
      </div>
    );
  }

  // ... rest of the existing code ...
};

export default PropertyAnalyticsPage;