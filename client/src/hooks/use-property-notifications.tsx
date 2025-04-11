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
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!user) {
      return;
    }
    
    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Determine WebSocket URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      setConnectionStatus('connecting');
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connection established');
        
        // Subscribe with filters
        if (filters) {
          const message = JSON.stringify({
            type: 'subscribe',
            payload: filters,
          });
          socket.send(message);
        }
        
        // Setup ping interval to keep connection alive
        const pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds
        
        // Clear interval on socket close
        socket.onclose = () => {
          clearInterval(pingInterval);
          setConnectionStatus('disconnected');
          scheduleReconnect();
        };
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        scheduleReconnect();
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'newProperty' || data.type === 'propertyUpdated') {
            if (data.property && data.property.id) {
              const timestamp = new Date().toISOString();
              const id = `${data.type}-${data.property.id}-${timestamp}`;
              
              const newNotification: PropertyNotification = {
                id,
                type: data.type,
                property: data.property,
                timestamp,
              };
              
              setNotifications((prev) => {
                // Check if notification already exists (avoid duplicates)
                const exists = prev.some((n) => 
                  n.type === newNotification.type && 
                  n.property.id === newNotification.property.id
                );
                
                if (exists) return prev;
                
                // Add new notification at the beginning and limit to maxNotifications
                const updated = [newNotification, ...prev];
                return updated.slice(0, maxNotifications);
              });
              
              // Update recentProperties
              setRecentProperties((prev) => {
                const exists = prev.some((p) => p.id === data.property.id);
                if (exists) {
                  return prev.map((p) => p.id === data.property.id ? { ...p, ...data.property } : p);
                } else {
                  const updated = [data.property, ...prev];
                  return updated.slice(0, 5); // Limit to 5 recent properties
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket server:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [user, filters, maxNotifications]);
  
  // Schedule reconnection
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000); // Reconnect after 5 seconds
  };
  
  // Subscribe with filters
  const subscribe = useCallback((newFilters?: PropertyNotificationFilters) => {
    setFilters(newFilters);
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'subscribe',
        payload: newFilters,
      });
      socketRef.current.send(message);
    } else {
      // If socket is not open, connect will handle the subscription
      connect();
    }
  }, [connect]);
  
  // Unsubscribe from notifications
  const unsubscribe = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'unsubscribe' });
      socketRef.current.send(message);
    }
    
    setFilters(undefined);
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Connect when user changes
  useEffect(() => {
    if (user) {
      connect();
    } else {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setConnectionStatus('disconnected');
      setNotifications([]);
      setRecentProperties([]);
    }
    
    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, connect]);
  
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