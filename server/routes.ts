import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { searchPropertiesSchema, insertPropertySchema, insertMessageSchema, insertFavoriteSchema, insertPropertyTourSchema, updatePropertyTourSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';
import { handleChatMessage } from "./anthropic";

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

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as Express.User;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // ChatAI Agent endpoint
  app.post("/api/chat", async (req, res, next) => {
    try {
      const { message, chatHistory, propertyId, category } = req.body;
      const userId = req.user?.id; // Get user ID if authenticated
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      let propertyContext;
      if (propertyId) {
        // Fetch property data to provide context to the chatbot
        propertyContext = await storage.getProperty(parseInt(propertyId));
      }
      
      // Get response from Anthropic
      const response = await handleChatMessage(
        message, 
        chatHistory || [], 
        propertyContext
      );
      
      // Save the chat interaction for analytics
      try {
        await storage.saveChatInteraction({
          userId: userId || null,
          message,
          response,
          propertyId: propertyId ? parseInt(propertyId) : null,
          category: category || null,
          isPropertySpecific: !!propertyId,
          sentiment: null, // This could be populated by an AI sentiment analysis in the future
        });
      } catch (analyticsError) {
        // We don't want analytics errors to break the main functionality
        console.error("Error saving chat analytics:", analyticsError);
      }
      
      res.json({ response });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
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
  
  // Market trends and analytics data
  app.get("/api/market/trends", hasPremiumAccess, async (req, res) => {
    try {
      // Get location param (city name)
      const location = req.query.location as string;

      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      // Generate market data based on location
      // In a real app, this would come from a database or external API
      const currentDate = new Date();
      const marketData = {
        location,
        timestamp: currentDate.toISOString(),
        medianPrice: 0,
        averagePricePerSqFt: 0,
        inventoryCount: 0,
        averageDaysOnMarket: 0,
        monthlyTrends: [],
        yearlyTrends: [],
        forecast: {}
      };

      // Simulate different market data for different cities
      if (location.toLowerCase().includes('seattle')) {
        marketData.medianPrice = 850000;
        marketData.averagePricePerSqFt = 525;
        marketData.inventoryCount = 1250;
        marketData.averageDaysOnMarket = 18;
      } else if (location.toLowerCase().includes('bellevue')) {
        marketData.medianPrice = 1250000;
        marketData.averagePricePerSqFt = 680;
        marketData.inventoryCount = 420;
        marketData.averageDaysOnMarket = 15;
      } else if (location.toLowerCase().includes('redmond')) {
        marketData.medianPrice = 980000;
        marketData.averagePricePerSqFt = 550;
        marketData.inventoryCount = 320;
        marketData.averageDaysOnMarket = 17;
      } else if (location.toLowerCase().includes('kirkland')) {
        marketData.medianPrice = 1050000;
        marketData.averagePricePerSqFt = 590;
        marketData.inventoryCount = 280;
        marketData.averageDaysOnMarket = 16;
      } else {
        // Default data for other locations
        marketData.medianPrice = 750000;
        marketData.averagePricePerSqFt = 450;
        marketData.inventoryCount = 500;
        marketData.averageDaysOnMarket = 22;
      }
      
      // Generate monthly trends for the past 12 months
      const monthlyTrends = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        
        // Generate price fluctuations with an overall upward trend
        const priceFluctuation = 1 + ((Math.random() * 0.04) - 0.02); // -2% to +2%
        const trendFactor = 1 + (0.005 * (12 - i)); // Slight upward trend
        
        monthlyTrends.push({
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          medianPrice: Math.round(marketData.medianPrice / trendFactor * priceFluctuation),
          inventory: Math.round(marketData.inventoryCount * (0.85 + (Math.random() * 0.3))),
          daysOnMarket: Math.round(marketData.averageDaysOnMarket * (0.9 + (Math.random() * 0.2))),
          pricePerSqFt: Math.round(marketData.averagePricePerSqFt / trendFactor * priceFluctuation)
        });
      }
      
      // Generate yearly trends for the past 5 years
      const yearlyTrends = [];
      for (let i = 4; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setFullYear(date.getFullYear() - i);
        
        // Generate yearly appreciation with some randomness
        const yearlyAppreciation = 1.04 + (Math.random() * 0.02);
        const cumulativeAppreciation = Math.pow(yearlyAppreciation, i);
        
        yearlyTrends.push({
          year: date.getFullYear(),
          medianPrice: Math.round(marketData.medianPrice / cumulativeAppreciation),
          appreciation: i === 0 ? 0 : Math.round((yearlyAppreciation - 1) * 100 * 10) / 10,
          inventory: Math.round(marketData.inventoryCount * (0.85 + (i * 0.03))),
          affordabilityIndex: Math.round((5.5 - (i * 0.15)) * 10) / 10
        });
      }
      
      // Add forecast data
      const forecast = {
        oneYear: {
          priceGrowth: Math.round((3 + (Math.random() * 3)) * 10) / 10,
          inventoryChange: Math.round((-5 + (Math.random() * 10)) * 10) / 10,
          daysOnMarketChange: Math.round((-10 + (Math.random() * 20)) * 10) / 10,
          confidenceScore: Math.round((6.5 + (Math.random() * 2.5)) * 10) / 10
        },
        fiveYear: {
          priceGrowth: Math.round((15 + (Math.random() * 10)) * 10) / 10,
          hotness: Math.round((1 + (Math.random() * 9)) * 10) / 10,
          investmentRating: ['A', 'A-', 'B+', 'B', 'B-'][Math.floor(Math.random() * 5)]
        }
      };
      
      marketData.monthlyTrends = monthlyTrends;
      marketData.yearlyTrends = yearlyTrends;
      marketData.forecast = forecast;
      
      res.json(marketData);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch market trends" });
    }
  });
  
  // Property value predictions
  app.get("/api/properties/:id/value-prediction", hasPremiumAccess, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const years = req.query.years ? parseInt(req.query.years as string) : 5;
      
      if (years < 1 || years > 10) {
        return res.status(400).json({ message: "Years parameter must be between 1 and 10" });
      }
      
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Get city trends data
      const cityTrends = [];
      const currentYear = new Date().getFullYear();
      
      // Generate sample market data
      // In a production app, this would come from a real market data source
      for (let i = 5; i >= 0; i--) {
        const yearGrowth = 0.04 + (Math.random() * 0.02 - 0.01); // 3-5% growth
        cityTrends.push({
          year: currentYear - i,
          growth: yearGrowth
        });
      }
      
      // Get property's neighborhood data
      let neighborhoodScores;
      if (property.neighborhoodId) {
        const neighborhood = await storage.getNeighborhood(property.neighborhoodId);
        if (neighborhood) {
          // Get neighborhood scores, using default values if not available
          neighborhoodScores = {
            safety: neighborhood.safetyScore || null,
            schools: neighborhood.schoolScore || null,
            amenities: neighborhood.amenitiesScore || neighborhood.overallScore || null,
            transport: neighborhood.transportScore || null
          };
        }
      }
      
      // Fetch some comparable properties
      const comparableProperties = await storage.searchProperties({
        propertyType: property.propertyType,
        minBeds: property.bedrooms > 0 ? property.bedrooms - 1 : 0,
        maxBeds: property.bedrooms + 1,
        minBaths: property.bathrooms > 0 ? Math.floor(property.bathrooms) : 0,
        maxBaths: Math.ceil(property.bathrooms + 1),
        minPrice: property.price * 0.7,
        maxPrice: property.price * 1.3,
        location: property.city
      }, 5);
      
      // Remove the current property from comparables if it's in there
      const filteredComps = comparableProperties.filter(p => p.id !== propertyId);
      
      const simplifiedComps = filteredComps.map(p => ({
        price: p.price,
        squareFeet: p.squareFeet,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        yearBuilt: p.yearBuilt
      }));
      
      // Economic indicators - in a real app, these would come from an economic data API
      const economicIndicators = {
        interestRate: 4.5 + (Math.random() * 0.5 - 0.25), // 4.25-4.75%
        unemploymentRate: 3.5 + (Math.random() * 1), // 3.5-4.5%
        gdpGrowth: 2.0 + (Math.random() * 1) // 2-3%
      };
      
      // Construct market data for the prediction
      const marketData = {
        cityTrends,
        neighborhoodScores,
        comparableProperties: simplifiedComps,
        economicIndicators
      };
      
      // Import dynamically to avoid circular dependencies
      const { predictPropertyValueTrends } = await import('./openai');
      
      // Get the prediction
      const prediction = await predictPropertyValueTrends(property, marketData, years);
      
      res.json(prediction);
    } catch (error) {
      console.error("Error predicting property values:", error);
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
  
  // Property Tour Endpoints
  
  // Get available tour slots for a property on a specific date
  app.get("/api/properties/:propertyId/tour-slots", async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const dateStr = req.query.date as string;
      
      if (!dateStr) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const availableSlots = await storage.getAvailableTourTimeSlots(propertyId, date);
      res.json(availableSlots);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all tours for a property
  app.get("/api/properties/:propertyId/tours", isAuthenticated, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const tours = await storage.getPropertyToursByProperty(propertyId);
      res.json(tours);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's tours
  app.get("/api/user/tours", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const tours = await storage.getPropertyToursByUser(userId);
      res.json(tours);
    } catch (error) {
      next(error);
    }
  });
  
  // Get agent's tours (only for agents and admins)
  app.get("/api/agent/tours", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'agent' && user.role !== 'admin') {
        return res.status(403).json({ message: "Only agents and admins can access this endpoint" });
      }
      
      const tours = await storage.getPropertyToursByAgent(user.id);
      res.json(tours);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific tour by ID
  app.get("/api/tours/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const tour = await storage.getPropertyTour(id);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Check if the user has permission to view this tour (as the user, agent, or admin)
      const user = req.user!;
      if (tour.userId !== user.id && tour.agentId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to view this tour" });
      }
      
      res.json(tour);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new property tour
  app.post("/api/properties/:propertyId/tours", isAuthenticated, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user!.id;
      
      // Validate that the property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Parse and validate using schema
      const { tourDate, tourTime, duration, notes, tourType, contactPhone, contactEmail, additionalAttendees } = req.body;
      
      const parsedTour = insertPropertyTourSchema.safeParse({
        propertyId,
        userId,
        tourDate: new Date(tourDate),
        tourTime,
        duration: duration || 30,
        notes,
        tourType: tourType || 'in-person',
        contactPhone,
        contactEmail,
        additionalAttendees: additionalAttendees || 0
      });
      
      if (!parsedTour.success) {
        return res.status(400).json({ message: "Invalid tour data", errors: parsedTour.error.errors });
      }
      
      // Check if the selected time slot is available
      const availableSlots = await storage.getAvailableTourTimeSlots(propertyId, new Date(tourDate));
      if (!availableSlots.includes(tourTime)) {
        return res.status(400).json({ message: "The selected time slot is not available" });
      }
      
      const newTour = await storage.createPropertyTour(parsedTour.data);
      res.status(201).json(newTour);
    } catch (error) {
      next(error);
    }
  });
  
  // Update a property tour
  app.put("/api/tours/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user!;
      
      // Check if the tour exists
      const existingTour = await storage.getPropertyTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Check if the user has permission to update this tour
      if (existingTour.userId !== user.id && existingTour.agentId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this tour" });
      }
      
      // Parse and validate update data
      const parsedUpdate = updatePropertyTourSchema.safeParse({
        id,
        ...req.body
      });
      
      if (!parsedUpdate.success) {
        return res.status(400).json({ message: "Invalid tour data", errors: parsedUpdate.error.errors });
      }
      
      // If updating the date/time, check if the new slot is available
      if (parsedUpdate.data.tourDate && parsedUpdate.data.tourTime) {
        const availableSlots = await storage.getAvailableTourTimeSlots(
          existingTour.propertyId, 
          parsedUpdate.data.tourDate
        );
        
        // Allow keeping the same time slot even if it's "unavailable" (because it's the current booking)
        const isCurrentTimeSlot = existingTour.tourDate.toDateString() === parsedUpdate.data.tourDate.toDateString() && 
                                existingTour.tourTime === parsedUpdate.data.tourTime;
                                
        if (!isCurrentTimeSlot && !availableSlots.includes(parsedUpdate.data.tourTime)) {
          return res.status(400).json({ message: "The selected time slot is not available" });
        }
      }
      
      const updatedTour = await storage.updatePropertyTour(id, parsedUpdate.data);
      res.json(updatedTour);
    } catch (error) {
      next(error);
    }
  });
  
  // Cancel a property tour
  app.post("/api/tours/:id/cancel", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user!;
      
      // Check if the tour exists
      const existingTour = await storage.getPropertyTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Check if the tour is already cancelled
      if (existingTour.status === 'cancelled') {
        return res.status(400).json({ message: "Tour is already cancelled" });
      }
      
      // Check if the user has permission to cancel this tour
      if (existingTour.userId !== user.id && existingTour.agentId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to cancel this tour" });
      }
      
      const cancelledTour = await storage.cancelPropertyTour(id);
      res.json(cancelledTour);
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
  
  // Bulk upload properties endpoint (premium feature)
  app.post("/api/properties/bulk-upload", isAuthenticated, hasPremiumAccess, async (req, res, next) => {
    try {
      const { properties } = req.body;
      
      if (!Array.isArray(properties) || properties.length === 0) {
        return res.status(400).json({ 
          message: "Invalid request format. Expected an array of properties."
        });
      }
      
      if (properties.length > 100) {
        return res.status(400).json({ 
          message: "Maximum of 100 properties can be uploaded at once."
        });
      }
      
      // Process each property and validate
      const results = {
        successful: 0,
        failed: 0,
        errors: [],
        created: []
      };
      
      for (const propertyData of properties) {
        try {
          // Add owner ID to each property
          const propertyWithOwner = {
            ...propertyData,
            ownerId: req.user!.id
          };
          
          // Validate with schema
          const validatedData = insertPropertySchema.parse(propertyWithOwner);
          
          // Create property in database
          const createdProperty = await storage.createProperty(validatedData);
          results.successful++;
          results.created.push({ id: createdProperty.id, title: createdProperty.title });
        } catch (error) {
          results.failed++;
          if (error instanceof ZodError) {
            results.errors.push({
              property: propertyData.title || 'Unknown property',
              error: fromZodError(error).message
            });
          } else {
            results.errors.push({
              property: propertyData.title || 'Unknown property',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
      
      res.status(201).json(results);
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
  
  // Chat Analytics endpoints (admin-only)
  app.get("/api/admin/chat-analytics", isAdmin, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const analytics = await storage.getChatAnalytics(limit, offset);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/chat-analytics/top-questions", isAdmin, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const topQuestions = await storage.getTopChatQuestions(limit);
      res.json(topQuestions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/chat-analytics/categories", isAdmin, async (req, res, next) => {
    try {
      const categories = await storage.getChatCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/chat-analytics/sentiment", isAdmin, async (req, res, next) => {
    try {
      const sentiment = await storage.getChatSentimentBreakdown();
      res.json(sentiment);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/chat-analytics/by-property/:propertyId", isAdmin, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const analytics = await storage.getChatAnalyticsByProperty(propertyId, limit);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/chat-analytics/by-user/:userId", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const analytics = await storage.getChatAnalyticsByUser(userId, limit);
      res.json(analytics);
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
