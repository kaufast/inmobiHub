import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { addOrUpdateBulkData, getAllData, STORES, needsRefresh } from '@/utils/indexedDB';

interface PropertiesCache {
  key: string; // Use key instead of id to fix the type issue
  data: Property[];
  timestamp: number;
}

/**
 * Custom hook for fetching and caching properties
 * - Uses IndexedDB to cache data locally
 * - Reduces API calls
 * - Provides faster loading experience
 */
export function useCachedProperties(limit: number = 10, offset: number = 0) {
  return useQuery<Property[]>({
    queryKey: ['/api/properties', limit, offset],
    queryFn: async ({ queryKey }) => {
      // First check IndexedDB cache
      try {
        const cachedData = await getAllData<PropertiesCache>(STORES.PROPERTIES);
        
        // If we have cached data that's not expired, use it
        if (cachedData.length > 0 && !needsRefresh(cachedData[0].timestamp)) {
          console.log('Using cached properties data');
          return cachedData[0].data;
        }
      } catch (error) {
        console.warn('Error retrieving from cache:', error);
        // Continue with the fetch if cache fails
      }
      
      // If no cache or expired, fetch from API
      const response = await fetch(`/api/properties?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const properties: Property[] = await response.json();
      
      // Cache the fresh data
      try {
        await addOrUpdateBulkData<PropertiesCache>(STORES.PROPERTIES, [
          { key: 'properties', data: properties, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.warn('Error caching properties:', error);
        // Continue even if caching fails
      }
      
      return properties;
    },
    // Don't refetch on window focus to reduce server load
    refetchOnWindowFocus: false,
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Custom hook for fetching and caching featured properties
 */
export function useCachedFeaturedProperties(limit: number = 5) {
  return useQuery<Property[]>({
    queryKey: ['/api/properties/featured', limit],
    queryFn: async ({ queryKey }) => {
      // First check IndexedDB cache
      try {
        const cachedData = await getAllData<PropertiesCache>(STORES.FEATURED_PROPERTIES);
        
        // If we have cached data that's not expired, use it
        if (cachedData.length > 0 && !needsRefresh(cachedData[0].timestamp)) {
          console.log('Using cached featured properties data');
          return cachedData[0].data;
        }
      } catch (error) {
        console.warn('Error retrieving from cache:', error);
        // Continue with the fetch if cache fails
      }
      
      // If no cache or expired, fetch from API
      const response = await fetch(`/api/properties/featured?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured properties');
      }
      
      const properties: Property[] = await response.json();
      
      // Cache the fresh data
      try {
        await addOrUpdateBulkData<PropertiesCache>(STORES.FEATURED_PROPERTIES, [
          { key: 'featured', data: properties, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.warn('Error caching featured properties:', error);
        // Continue even if caching fails
      }
      
      return properties;
    },
    // Don't refetch on window focus to reduce server load
    refetchOnWindowFocus: false,
    // Cache featured properties for 10 minutes
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Custom hook for fetching and caching a single property
 */
export function useCachedProperty(id: number | string | null) {
  return useQuery<Property | null>({
    queryKey: ['/api/properties', id],
    queryFn: async ({ queryKey }) => {
      if (!id) return null;
      
      // If no cache or expired, fetch from API
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch property with id ${id}`);
      }
      
      const property: Property = await response.json();
      
      return property;
    },
    // Enable if id is provided
    enabled: !!id,
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
}