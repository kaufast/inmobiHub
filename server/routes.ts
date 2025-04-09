import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { searchPropertiesSchema, insertPropertySchema, insertMessageSchema, insertFavoriteSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has premium access
const hasPremiumAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as Express.User;
  if (user.subscriptionTier === 'free') {
    return res.status(403).json({ message: "Premium subscription required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Property routes
  app.get("/api/properties", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const properties = await storage.getProperties(limit, offset);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/properties/featured", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const featuredProperties = await storage.getFeaturedProperties(limit);
      res.json(featuredProperties);
    } catch (error) {
      next(error);
    }
  });
  
  // Compare multiple properties
  app.get("/api/properties/compare/:ids", async (req, res, next) => {
    try {
      const ids = req.params.ids.split(",").map(id => Number(id));
      
      if (ids.length === 0) {
        return res.status(400).json({ message: "No property IDs provided" });
      }
      
      if (ids.length > 4) {
        return res.status(400).json({ message: "Cannot compare more than 4 properties" });
      }
      
      const properties = await Promise.all(
        ids.map(id => storage.getProperty(id))
      );
      
      // Filter out any undefined properties (not found)
      const validProperties = properties.filter(property => property !== undefined) as any[];
      
      res.json(validProperties);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/properties/:id", async (req, res, next) => {
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/properties/search", async (req, res, next) => {
    try {
      const searchParams = searchPropertiesSchema.parse(req.body);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const properties = await storage.searchProperties(searchParams, limit, offset);
      res.json(properties);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid search parameters",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  app.post("/api/properties", isAuthenticated, async (req, res, next) => {
    try {
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: req.user!.id,
      });
      
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid property data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  app.put("/api/properties/:id", isAuthenticated, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check ownership
      if (property.ownerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this property" });
      }
      
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/properties/:id", isAuthenticated, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check ownership
      if (property.ownerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this property" });
      }
      
      await storage.deleteProperty(propertyId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // User properties
  app.get("/api/user/properties", isAuthenticated, async (req, res, next) => {
    try {
      const properties = await storage.getPropertiesByUser(req.user!.id);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  });
  
  // Favorites
  app.get("/api/user/favorites", isAuthenticated, async (req, res, next) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user!.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/favorites", isAuthenticated, async (req, res, next) => {
    try {
      const { propertyId } = insertFavoriteSchema.parse(req.body);
      
      // Check if already favorited
      const existingFavorite = await storage.getFavorite(req.user!.id, propertyId);
      if (existingFavorite) {
        return res.status(409).json({ message: "Property already in favorites" });
      }
      
      const favorite = await storage.addFavorite({
        userId: req.user!.id,
        propertyId,
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({
          message: "Invalid favorite data",
          errors: fromZodError(error).message,
          details: error.errors
        });
      }
      console.error("Error adding favorite:", error);
      next(error);
    }
  });
  
  app.delete("/api/user/favorites/:propertyId", isAuthenticated, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      
      // Check if in favorites
      const existingFavorite = await storage.getFavorite(req.user!.id, propertyId);
      if (!existingFavorite) {
        return res.status(404).json({ message: "Property not found in favorites" });
      }
      
      await storage.removeFavorite(req.user!.id, propertyId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Messages
  app.get("/api/user/messages", isAuthenticated, async (req, res, next) => {
    try {
      const role = req.query.role === 'sent' ? 'sender' : 'recipient';
      const messages = await storage.getMessagesByUser(req.user!.id, role);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/messages", isAuthenticated, async (req, res, next) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid message data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  app.patch("/api/messages/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const messageId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['read', 'replied', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only recipient can update status
      if (message.recipientId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this message" });
      }
      
      const updatedMessage = await storage.updateMessageStatus(messageId, status as 'read' | 'replied' | 'archived');
      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });
  
  // Premium data endpoints
  app.get("/api/neighborhoods", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const neighborhoods = await storage.getNeighborhoods(limit);
      res.json(neighborhoods);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/neighborhoods/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const neighborhood = await storage.getNeighborhood(id);
      
      if (!neighborhood) {
        return res.status(404).json({ message: "Neighborhood not found" });
      }
      
      res.json(neighborhood);
    } catch (error) {
      next(error);
    }
  });
  
  // Subscription routes
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    const user = req.user!;
    res.json({ tier: user.subscriptionTier });
  });
  
  app.post("/api/subscription", isAuthenticated, async (req, res, next) => {
    try {
      const { plan } = req.body;
      
      if (!['premium', 'enterprise'].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      // In a real application, you would process payment here
      // For now, just update the user's subscription tier
      const updatedUser = await storage.updateUser(req.user!.id, {
        subscriptionTier: plan
      });
      
      res.json({ tier: updatedUser?.subscriptionTier });
    } catch (error) {
      next(error);
    }
  });
  
  // AI-Powered Recommendation Routes
  app.get("/api/properties/recommended", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Save search parameters to search history if provided
      if (Object.keys(req.query).length > 1) { // More than just limit
        const searchParams: any = {};
        
        if (req.query.location) searchParams.location = req.query.location as string;
        if (req.query.propertyType) searchParams.propertyType = req.query.propertyType as string;
        if (req.query.minPrice) searchParams.minPrice = parseInt(req.query.minPrice as string);
        if (req.query.maxPrice) searchParams.maxPrice = parseInt(req.query.maxPrice as string);
        if (req.query.beds) searchParams.beds = parseInt(req.query.beds as string);
        if (req.query.baths) searchParams.baths = parseInt(req.query.baths as string);
        
        await storage.saveSearchHistory(userId, searchParams);
      }
      
      // Get AI-powered recommendations
      const recommendations = await storage.getRecommendedProperties(userId, limit);
      
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  });
  
  // Save search history
  app.post("/api/search/history", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const searchHistory = await storage.saveSearchHistory(userId, req.body);
      res.status(201).json(searchHistory);
    } catch (error) {
      next(error);
    }
  });
  
  // Get personalized property description
  app.get("/api/properties/:id/personalized-description", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const propertyId = parseInt(req.params.id);
      
      const property = await storage.getProperty(propertyId);
      const user = await storage.getUser(userId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if property is premium and user has appropriate subscription
      if (property.isPremium && user.subscriptionTier === 'free') {
        return res.status(403).json({ 
          message: "Premium subscription required",
          details: "This is a premium property. Please upgrade your subscription to access AI-powered insights."
        });
      }
      
      const { generatePersonalizedDescription } = await import('./openai');
      const personalizedDescription = await generatePersonalizedDescription(property, user);
      
      res.json({ personalizedDescription });
    } catch (error) {
      next(error);
    }
  });
  
  const httpServer = createServer(app);
  
  // Set up WebSocket server on a distinct path to avoid conflict with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Types for WebSocket messages
  type WebSocketMessage = {
    type: 'subscribe' | 'unsubscribe' | 'newProperty' | 'propertyUpdated' | 'ping';
    payload?: any;
  };
  
  // Keep track of clients and their subscriptions
  const clients = new Map<WebSocket, {
    userId?: number;
    isAuthenticated: boolean;
    subscriptions: {
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
    }
  }>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Initialize client record
    clients.set(ws, {
      isAuthenticated: false,
      subscriptions: {}
    });
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'subscribe':
            // Store user's subscription preferences
            if (data.payload && clients.has(ws)) {
              const clientData = clients.get(ws);
              if (clientData) {
                if (data.payload.userId) {
                  clientData.userId = data.payload.userId;
                  clientData.isAuthenticated = true;
                }
                clientData.subscriptions = {
                  ...clientData.subscriptions,
                  ...data.payload.filters
                };
                clients.set(ws, clientData);
              }
              
              // Send confirmation
              ws.send(JSON.stringify({
                type: 'subscribed',
                payload: {
                  message: 'Successfully subscribed to property notifications',
                  filters: clients.get(ws)?.subscriptions
                }
              }));
            }
            break;
            
          case 'unsubscribe':
            // Clear subscription preferences
            if (clients.has(ws)) {
              const clientData = clients.get(ws);
              if (clientData) {
                clientData.subscriptions = {};
                clients.set(ws, clientData);
              }
              
              // Send confirmation
              ws.send(JSON.stringify({
                type: 'unsubscribed',
                payload: {
                  message: 'Successfully unsubscribed from property notifications'
                }
              }));
            }
            break;
            
          case 'ping':
            // Keep connection alive
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
            
          default:
            console.warn('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      payload: {
        message: 'Connected to real estate notification system',
        timestamp: new Date().toISOString()
      }
    }));
  });
  
  // Helper function to send property notifications to subscribed clients
  const notifyClientsAboutProperty = (property: any, notificationType: 'newProperty' | 'propertyUpdated') => {
    clients.forEach((clientData, ws) => {
      try {
        // Skip if client is not ready
        if (ws.readyState !== WebSocket.OPEN) return;
        
        // Check if client is subscribed to this type of property
        const subs = clientData.subscriptions;
        
        // Simple filter matching
        let matches = true;
        
        if (subs.location && !property.address.toLowerCase().includes(subs.location.toLowerCase()) && 
            !property.city.toLowerCase().includes(subs.location.toLowerCase()) && 
            !property.state.toLowerCase().includes(subs.location.toLowerCase())) {
          matches = false;
        }
        
        if (matches && subs.propertyType && property.propertyType !== subs.propertyType) {
          matches = false;
        }
        
        if (matches && subs.minPrice && property.price < subs.minPrice) {
          matches = false;
        }
        
        if (matches && subs.maxPrice && property.price > subs.maxPrice) {
          matches = false;
        }
        
        if (matches && subs.bedrooms && property.bedrooms < subs.bedrooms) {
          matches = false;
        }
        
        if (matches && subs.bathrooms && property.bathrooms < subs.bathrooms) {
          matches = false;
        }
        
        // If all conditions match, send notification
        if (matches) {
          ws.send(JSON.stringify({
            type: notificationType,
            payload: {
              property: {
                id: property.id,
                title: property.title,
                price: property.price,
                address: property.address,
                city: property.city,
                state: property.state,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                squareFeet: property.squareFeet,
                propertyType: property.propertyType,
                isPremium: property.isPremium,
                images: property.images && property.images.length > 0 ? property.images : []
              },
              timestamp: new Date().toISOString()
            }
          }));
        }
      } catch (error) {
        console.error('Error sending notification to client:', error);
      }
    });
  };
  
  // Override the createProperty method to send notifications
  const originalCreateProperty = storage.createProperty;
  storage.createProperty = async (propertyData) => {
    const newProperty = await originalCreateProperty(propertyData);
    
    // Notify clients about the new property
    notifyClientsAboutProperty(newProperty, 'newProperty');
    
    return newProperty;
  };
  
  // Override the updateProperty method to send notifications for significant updates
  const originalUpdateProperty = storage.updateProperty;
  storage.updateProperty = async (id, propertyData) => {
    const updatedProperty = await originalUpdateProperty(id, propertyData);
    
    // Only notify for significant updates (price change, etc.)
    if (propertyData.price || propertyData.isPremium === true) {
      notifyClientsAboutProperty(updatedProperty, 'propertyUpdated');
    }
    
    return updatedProperty;
  };
  
  return httpServer;
}
