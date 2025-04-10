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

// Create a fallback component that renders when there are WebSocket issues
const PropertyNotificationsFallback = ({ children }: { children: ReactNode }) => {
  console.log("Using PropertyNotifications fallback component");
  
  // Provide minimal context values that allow the app to function
  const fallbackValues: PropertyNotificationsContextType = {
    notifications: [],
    connectionStatus: 'disconnected',
    subscribe: () => console.log("Subscribe called on fallback provider"),
    unsubscribe: () => console.log("Unsubscribe called on fallback provider"),
    clearNotifications: () => console.log("Clear notifications called on fallback provider"),
    recentProperties: []
  };
  
  return (
    <PropertyNotificationsContext.Provider value={fallbackValues}>
      {children}
    </PropertyNotificationsContext.Provider>
  );
};

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
    // Don't require user - allow anonymous connections for property updates
    // This makes the WebSocket connection more resilient
    
    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Determine WebSocket URL with explicit port for development
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log("Connecting to WebSocket at:", wsUrl);
      setConnectionStatus('connecting');
      
      // Create socket with error handling
      const socket = new WebSocket(wsUrl);
      
      // Add global error event handler
      socket.addEventListener('error', (event) => {
        console.error("WebSocket error occurred:", event);
        setConnectionStatus('error');
      });
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
  }, [filters, maxNotifications]);
  
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
  
  // Connect on component mount and when user changes
  useEffect(() => {
    // Always try to connect, not only for authenticated users
    // This lets visitors see property notifications
    connect();
    
    // Enhance user experience when authenticated
    if (user) {
      // If user just authenticated, could customize notifications here
    }
    
    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect, user]);
  
  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure WebSocket is closed and timeout cleared
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
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