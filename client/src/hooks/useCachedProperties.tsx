import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { getQueryFn } from '@/lib/queryClient';

/**
 * Enhanced Property Query Hook with IndexedDB Caching
 * - Loads data from cache first for instant loading
 * - Updates cache with fresh data from API
 * - Provides a cache clearing mechanism
 */

// Define the database schema
interface PropertyDB extends DBSchema {
  properties: {
    key: number;
    value: Property;
    indexes: { 'by-updated': Date };
  };
  propertyCollections: {
    key: string;
    value: {
      properties: Property[];
      timestamp: Date;
      params?: any;
    };
  };
}

// Database connection singleton
let dbPromise: Promise<IDBPDatabase<PropertyDB>> | null = null;

// Get database connection
const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PropertyDB>('property-cache', 1, {
      upgrade(db) {
        // Property store for individual properties
        const propertyStore = db.createObjectStore('properties', {
          keyPath: 'id',
        });
        propertyStore.createIndex('by-updated', 'updatedAt');
        
        // Store for collections of properties (search results, etc.)
        db.createObjectStore('propertyCollections', {
          keyPath: 'id',
        });
      },
    });
  }
  return dbPromise;
};

// Cache a single property
export async function cacheProperty(property: Property): Promise<void> {
  try {
    const db = await getDB();
    await db.put('properties', property);
  } catch (error) {
    console.error('Failed to cache property:', error);
  }
}

// Cache multiple properties
export async function cacheProperties(
  properties: Property[],
  collectionId: string,
  params?: any
): Promise<void> {
  try {
    const db = await getDB();
    // Store each property individually
    await Promise.all(properties.map(property => db.put('properties', property)));
    
    // Store the collection
    await db.put('propertyCollections', {
      id: collectionId,
      properties,
      timestamp: new Date(),
      params,
    });
  } catch (error) {
    console.error('Failed to cache properties:', error);
  }
}

// Custom hook for getting a property with cache
export function useCachedProperty(id: number): UseQueryResult<Property, Error> & { clearCache: () => Promise<void> } {
  const baseQuery = useQuery<Property, Error>({
    queryKey: ['/api/properties', id],
    queryFn: async ({ queryKey }) => {
      // Try to get from cache first
      try {
        const db = await getDB();
        const cachedProperty = await db.get('properties', id);
        
        if (cachedProperty) {
          // If found in cache and not too old, use it
          const cacheAge = new Date().getTime() - new Date(cachedProperty.updatedAt).getTime();
          const cacheIsValid = cacheAge < 5 * 60 * 1000; // 5 minutes
          
          if (cacheIsValid) {
            console.log(`Using cached property ${id}`);
            return cachedProperty;
          }
        }
      } catch (error) {
        console.warn('Error accessing cache:', error);
      }
      
      // Fetch from API
      const fetchFn = getQueryFn();
      const property = await fetchFn({ queryKey });
      
      // Cache for next time
      if (property) {
        cacheProperty(property).catch(console.error);
      }
      
      return property;
    },
  });
  
  const clearCache = async () => {
    try {
      const db = await getDB();
      await db.delete('properties', id);
    } catch (error) {
      console.error('Failed to clear property cache:', error);
    }
  };
  
  return { ...baseQuery, clearCache };
}

// Custom hook for getting property collections with cache
export function useCachedProperties<T extends Property[]>(
  endpoint: string,
  params?: any
): UseQueryResult<T, Error> & { clearCache: () => Promise<void> } {
  // Create a deterministic collection ID based on the endpoint and params
  const collectionId = `${endpoint}:${JSON.stringify(params || {})}`;
  
  const baseQuery = useQuery<T, Error>({
    queryKey: [endpoint, params],
    queryFn: async ({ queryKey }) => {
      // Try to get from cache first
      try {
        const db = await getDB();
        const cachedCollection = await db.get('propertyCollections', collectionId);
        
        if (cachedCollection) {
          // If found in cache and not too old, use it
          const cacheAge = new Date().getTime() - new Date(cachedCollection.timestamp).getTime();
          const cacheIsValid = cacheAge < 2 * 60 * 1000; // 2 minutes
          
          if (cacheIsValid) {
            console.log(`Using cached collection ${collectionId}`);
            return cachedCollection.properties as T;
          }
        }
      } catch (error) {
        console.warn('Error accessing cache:', error);
      }
      
      // Fetch from API
      const fetchFn = getQueryFn();
      const properties = await fetchFn({ queryKey }) as T;
      
      // Cache for next time
      if (properties && Array.isArray(properties)) {
        cacheProperties(properties, collectionId, params).catch(console.error);
      }
      
      return properties;
    },
  });
  
  const clearCache = async () => {
    try {
      const db = await getDB();
      await db.delete('propertyCollections', collectionId);
    } catch (error) {
      console.error('Failed to clear collection cache:', error);
    }
  };
  
  return { ...baseQuery, clearCache };
}

// Clear all cached data - useful for logout or forced refresh
export async function clearAllPropertyCaches(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('properties');
    await db.clear('propertyCollections');
    console.log('All property caches cleared');
  } catch (error) {
    console.error('Failed to clear all property caches:', error);
  }
}