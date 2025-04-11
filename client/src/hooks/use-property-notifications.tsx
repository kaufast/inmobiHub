import { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Property } from '@shared/schema';
import { useAuth } from './use-auth';

type PropertyNotification = {
  id: string;
  type: 'newProperty' | 'propertyUpdated';
  property: Partial<Property> & { id: number };
  timestamp: string;
};

export type PropertyNotificationFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
};

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface PropertyNotificationsContextType {
  notifications: PropertyNotification[];
  connectionStatus: ConnectionStatus;
  subscribe: (filters?: PropertyNotificationFilters) => void;
  unsubscribe: () => void;
  clearNotifications: () => void;
  recentProperties: Partial<Property>[];
}

const PropertyNotificationsContext = createContext<PropertyNotificationsContextType | undefined>(undefined);

interface PropertyNotificationsProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const PropertyNotificationsProvider = ({
  children,
  maxNotifications = 20,
}: PropertyNotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<PropertyNotification[]>([]);
  const [recentProperties, setRecentProperties] = useState<Partial<Property>[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [filters, setFilters] = useState<PropertyNotificationFilters | undefined>(undefined);
  const { user } = useAuth();
  
  // IMPORTANT: WebSocket connections are temporarily disabled to prevent app loading issues
  
  // Mock functions that don't actually connect to WebSocket server
  const connect = useCallback(() => {
    console.log('WebSocket connections are temporarily disabled');
    setConnectionStatus('disconnected');
  }, []);
  
  // Mock schedule reconnect
  const scheduleReconnect = () => {
    console.log('WebSocket reconnection is disabled');
  };
  
  // Mock subscribe function
  const subscribe = useCallback((newFilters?: PropertyNotificationFilters) => {
    setFilters(newFilters);
    console.log('WebSocket subscriptions are temporarily disabled');
  }, []);
  
  // Mock unsubscribe function
  const unsubscribe = useCallback(() => {
    setFilters(undefined);
    console.log('WebSocket unsubscribe is temporarily disabled');
  }, []);
  
  // Clear all notifications (this function still works)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Use useEffect to set mock data for testing
  useEffect(() => {
    // Set some mock recent properties for UI testing
    setRecentProperties([
      { 
        id: 1, 
        title: 'Luxury Villa in Beachfront', 
        price: 1200000,
        address: '123 Ocean Drive',
        city: 'Cancún',
        state: 'Quintana Roo',
        country: 'Mexico',
        propertyType: 'house',
        bedrooms: 4,
        bathrooms: 3
      },
      { 
        id: 2, 
        title: 'Modern Apartment Downtown', 
        price: 450000,
        address: '456 Central Avenue',
        city: 'Mexico City',
        state: 'CDMX',
        country: 'Mexico',
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 2
      }
    ]);
  }, []);
  
  return (
    <PropertyNotificationsContext.Provider
      value={{
        notifications,
        connectionStatus,
        subscribe,
        unsubscribe,
        clearNotifications,
        recentProperties,
      }}
    >
      {children}
    </PropertyNotificationsContext.Provider>
  );
};

export const usePropertyNotifications = () => {
  const context = useContext(PropertyNotificationsContext);
  
  if (!context) {
    throw new Error('usePropertyNotifications must be used within a PropertyNotificationsProvider');
  }
  
  return context;
};