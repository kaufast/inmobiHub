import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { searchPropertiesSchema, insertPropertySchema, insertMessageSchema, insertFavoriteSchema, insertPropertyTourSchema, updatePropertyTourSchema, passkeyRegisterSchema, passkeyAuthenticateSchema, idVerificationRequestSchema, updateVerificationStatusSchema, userVerificationSchema, insertSuggestedQuestionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from 'ws';
import { handleChatMessage } from "./anthropic";
import { generatePropertyRecommendations } from "./openai";
import Stripe from 'stripe';
import multer from 'multer';
import path from 'path';
import { processImage, processMultipleImages } from './image-utils';
import {
  createStripeCustomer,
  createPaymentIntent,
  createSubscription,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  handleStripeWebhook,
  SUBSCRIPTION_FEATURES
} from './stripe';
import { 
  generatePasskeyRegistrationOptions, 
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication
} from './webauthn';
import { generateSitemaps } from './sitemap-generator';

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
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Serve static files from the public directory
  app.use('/public', express.static(path.join(process.cwd(), 'public')));
  
  // Serve the test page directly
  app.get('/test-perplexity', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'test-perplexity.html'));
  });
  
  // Configure multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
  
  // SEO Routes - Sitemap generation
  app.get("/api/sitemap/generate", isAdmin, async (req, res) => {
    try {
      const outputDir = path.join(process.cwd(), 'public');
      const result = await generateSitemaps(outputDir);
      
      if (result.success) {
        res.json({
          success: true,
          message: "Sitemaps generated successfully",
          sitemapIndexPath: result.sitemapIndexPath
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to generate sitemaps",
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error generating sitemaps:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate sitemaps",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Image upload endpoints
  app.post("/api/images/upload", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const result = await processImage(
        req.file.buffer,
        req.file.originalname,
        {
          quality: 80,
          stripExif: true,
          generateSizes: ['thumbnail', 'medium', 'large'],
          format: 'webp',
          preserveOriginal: true
        }
      );
      
      // Return paths and metadata
      res.status(201).json({
        success: true,
        image: {
          id: result.id,
          filename: result.filename,
          urls: {
            original: `/uploads/original/${path.basename(result.paths.original || '')}`,
            webp: `/uploads/webp/${path.basename(result.paths.webp || '')}`,
            thumbnail: `/uploads/thumbnails/${path.basename(result.paths.thumbnail || '')}`,
            medium: `/uploads/webp/${path.basename(result.paths.medium || '')}`,
            large: `/uploads/webp/${path.basename(result.paths.large || '')}`,
            lqip: `/uploads/webp/${path.basename(result.paths.lqip || '')}`
          },
          metadata: result.metadata
        }
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Multiple images upload
  app.post("/api/images/upload-multiple", isAuthenticated, upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }
      
      // Process each image
      const images = req.files as Express.Multer.File[];
      const imagePromises = images.map(file => 
        processImage(
          file.buffer,
          file.originalname,
          {
            quality: 80,
            stripExif: true,
            generateSizes: ['thumbnail', 'medium'],
            format: 'webp',
            preserveOriginal: true
          }
        )
      );
      
      const results = await Promise.all(imagePromises);
      
      // Format the response
      const processedImages = results.map(result => ({
        id: result.id,
        filename: result.filename,
        urls: {
          original: `/uploads/original/${path.basename(result.paths.original || '')}`,
          webp: `/uploads/webp/${path.basename(result.paths.webp || '')}`,
          thumbnail: `/uploads/thumbnails/${path.basename(result.paths.thumbnail || '')}`,
          medium: `/uploads/webp/${path.basename(result.paths.medium || '')}`,
          lqip: `/uploads/webp/${path.basename(result.paths.lqip || '')}`
        },
        metadata: result.metadata
      }));
      
      res.status(201).json({
        success: true,
        images: processedImages
      });
    } catch (error) {
      console.error("Error processing images:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process images",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Image delete endpoint
  app.delete("/api/images/:id", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.id;
      const result = await import('./image-utils').then(module => module.deleteImage(fileId));
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete image",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
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
      
      let response: string;
      let apiSource: 'perplexity' | 'anthropic' = 'anthropic';
      
      // Use Perplexity if API key exists, otherwise fallback to Anthropic
      if (process.env.PERPLEXITY_API_KEY) {
        try {
          console.log("Using Perplexity API for chat response");
          // Import Perplexity handler dynamically to avoid issues if not configured
          const { handleChatWithPerplexity } = await import('./perplexity');
          response = await handleChatWithPerplexity(
            message, 
            chatHistory || [], 
            propertyContext
          );
          apiSource = 'perplexity';
        } catch (perplexityError) {
          console.error("Error with Perplexity API, falling back to Anthropic:", perplexityError);
          response = await handleChatMessage(
            message, 
            chatHistory || [], 
            propertyContext
          );
          apiSource = 'anthropic';
        }
      } else {
        // Use Anthropic as fallback
        console.log("Perplexity API key not found, using Anthropic fallback");
        response = await handleChatMessage(
          message, 
          chatHistory || [], 
          propertyContext
        );
      }
      
      // Add header to indicate which API was used
      res.setHeader('X-Api-Source', apiSource);
      
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
      
      res.json({ response, apiSource });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Simple test endpoint for verifying Perplexity API works
  app.get("/api/test-perplexity", async (req, res) => {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(400).json({ 
          success: false, 
          message: "Perplexity API key not found in environment variables" 
        });
      }
      
      const { handleChatWithPerplexity } = await import('./perplexity');
      const testQuestion = "What are the current real estate trends in Mexico?";
      
      console.log("Testing Perplexity API with question:", testQuestion);
      const response = await handleChatWithPerplexity(testQuestion, []);
      
      return res.status(200).json({ 
        success: true, 
        message: "Perplexity API is working!", 
        testQuestion,
        response 
      });
    } catch (error) {
      console.error("Error testing Perplexity API:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error testing Perplexity API", 
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
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
      
      // Handle multimodal search types
      if (searchParams.searchType && searchParams.searchType !== 'text') {
        // Process multimedia content to generate a natural language query
        try {
          if (searchParams.searchType === 'image' && searchParams.imageData) {
            // Process image using AI
            const { analyzeImage } = await import('./anthropic');
            searchParams.multimodalQuery = await analyzeImage(searchParams.imageData);
          } else if (searchParams.searchType === 'audio' && searchParams.audioData) {
            // Process audio using AI
            const { transcribeAudio } = await import('./openai');
            searchParams.multimodalQuery = await transcribeAudio(searchParams.audioData);
          }
          
          // If we have a multimodal query, log it
          if (searchParams.multimodalQuery) {
            console.log(`Processed ${searchParams.searchType} search: ${searchParams.multimodalQuery}`);
            
            // Extract location info from natural language query
            if (!searchParams.location) {
              // This would extract location information from the query
              // For simplicity and accuracy, we'll just set the location directly
              searchParams.location = searchParams.multimodalQuery;
            }
          }
        } catch (err) {
          console.error(`Error processing ${searchParams.searchType} search:`, err);
          return res.status(400).json({
            message: `Failed to process ${searchParams.searchType} data`,
            error: err.message
          });
        }
      }
      
      // Proceed with search using the processed parameters
      const properties = await storage.searchProperties(searchParams, limit, offset);
      
      // Save search history if user is authenticated
      if (req.isAuthenticated()) {
        try {
          await storage.saveSearchHistory(req.user.id, searchParams);
        } catch (err) {
          console.error('Error saving search history:', err);
        }
      }
      
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
            transport: neighborhood.transitScore || null
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
  
  // One-time payment intent
  app.post("/api/payment-intent", async (req, res) => {
    try {
      const { amount, metadata = {} } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          ...metadata,
          userId: req.user?.id.toString() || 'guest'
        },
        payment_method_types: ['card'],
        receipt_email: req.user?.email,
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error creating payment intent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // User subscription status
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      
      // If no subscription, return free tier info
      if (!user.stripeSubscriptionId || user.subscriptionTier === 'free') {
        return res.json({
          tier: 'free',
          status: 'none',
          expiresAt: null,
          features: {
            name: 'Free',
            price: 0,
            features: [
              'Basic property search',
              'View property details',
              'Contact listing agents',
              'Save favorites (up to 5)',
              'Limited AI search capabilities'
            ]
          }
        });
      }
      
      // User has a subscription, fetch details from Stripe
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      // Map Stripe status to our internal status
      let status = 'none';
      switch (subscription.status) {
        case 'active':
          status = 'active';
          break;
        case 'past_due':
          status = 'past_due';
          break;
        case 'canceled':
          status = 'canceled';
          break;
        case 'incomplete':
          status = 'incomplete';
          break;
        case 'incomplete_expired':
          status = 'incomplete_expired';
          break;
        default:
          status = 'none';
      }
      
      // Get subscription features based on tier
      const features = {
        name: user.subscriptionTier === 'premium' ? 'Premium' : 'Enterprise',
        price: user.subscriptionTier === 'premium' ? 9.99 : 49.99,
        features: user.subscriptionTier === 'premium' ? 
          [
            'All Free features',
            'Advanced search filters',
            'Unlimited favorites',
            'Full AI assistant capabilities',
            'Neighborhood insights',
            'Property comparison',
            'Personalized recommendations',
            'Premium listing placement',
            'Property price history'
          ] :
          [
            'All Premium features',
            'Market analytics dashboard',
            'Investment ROI calculator',
            'Property management tools',
            'Premium support',
            'API access',
            'Custom reports',
            'Bulk listing import',
            'Remove Inmobi branding',
            'Team collaboration tools'
          ]
      };
      
      // Return subscription info
      res.json({
        tier: user.subscriptionTier,
        status,
        expiresAt: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : null,
        features
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ 
        message: "Error fetching subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
      
      // Get user data for personalized recommendations
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get search history for this user
      const searchHistory = await storage.getSearchHistory(userId);
      
      // Get favorited properties
      const favoritedProperties = await storage.getFavoritesByUser(userId);
      
      // Get all properties that can be recommended
      const allProperties = await storage.getProperties(100); // Get a larger pool to recommend from
      
      // Use OpenAI's recommendation engine for more personalized results with match scores
      let recommendations;
      try {
        recommendations = await generatePropertyRecommendations(
          user,
          allProperties,
          searchHistory,
          favoritedProperties,
          limit
        );
      } catch (aiError) {
        console.error("Error generating AI recommendations:", aiError);
        // Fallback to database recommendations if AI fails
        recommendations = await storage.getRecommendedProperties(userId, limit);
      }
      
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
  
  // User Verification Routes for realtors and agents
  
  // Request verification as a realtor (agent)
  app.post("/api/users/verify/id", isAuthenticated, async (req, res, next) => {
    try {
      const { idVerificationType, idVerificationDocument, notes } = idVerificationRequestSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Update user with verification request
      const user = await storage.updateUser(req.user!.id, {
        idVerificationType,
        idVerificationStatus: 'pending',
        idVerificationNotes: notes || null,
        idVerificationDate: new Date(),
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        message: "ID verification request submitted successfully",
        status: user.idVerificationStatus
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid verification data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  // Admin: Approve or reject verification request
  app.patch("/api/admin/users/:userId/verification", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const { idVerificationStatus, idVerificationNotes, isVerified } = updateVerificationStatusSchema.parse({
        ...req.body,
        userId
      });
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update verification status
      const updatedUser = await storage.updateUser(userId, {
        idVerificationStatus,
        idVerificationNotes: idVerificationNotes || null,
        isVerified: isVerified || false,
        verificationDate: isVerified ? new Date() : null,
        verifiedBy: isVerified ? req.user!.id : null,
      });
      
      res.status(200).json({
        message: `User verification ${idVerificationStatus}`,
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          role: updatedUser!.role,
          isVerified: updatedUser!.isVerified,
          idVerificationStatus: updatedUser!.idVerificationStatus
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid verification data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  // Admin: Mark user as verified (blue checkmark)
  app.patch("/api/admin/users/:userId/verified", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isVerified, notes } = userVerificationSchema.parse({
        ...req.body,
        userId
      });
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update verification status
      const updatedUser = await storage.updateUser(userId, {
        isVerified,
        verificationDate: isVerified ? new Date() : null,
        verifiedBy: isVerified ? req.user!.id : null,
      });
      
      res.status(200).json({
        message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          role: updatedUser!.role,
          isVerified: updatedUser!.isVerified
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid verification data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  // Passkey routes
  
  // Generate registration options for passkey
  app.get("/api/users/passkey/register-options", isAuthenticated, async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const registrationOptions = await generatePasskeyRegistrationOptions(
        req.user.id,
        req.user.username
      );
      
      res.status(200).json(registrationOptions);
    } catch (error) {
      console.error("Error generating passkey registration options:", error);
      next(error);
    }
  });
  
  // Verify passkey registration response
  app.post("/api/users/passkey/register-verify", isAuthenticated, async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const verification = await verifyPasskeyRegistration(
        req.user.id,
        req.body
      );
      
      if (!verification.verified) {
        return res.status(400).json({ message: "Passkey registration failed" });
      }
      
      res.status(200).json({ 
        message: "Passkey registered successfully",
        passkeyEnabled: true
      });
    } catch (error) {
      console.error("Error verifying passkey registration:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid passkey data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  // Generate authentication options for passkey login
  app.post("/api/auth/passkey/login-options", async (req, res, next) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      try {
        const authOptions = await generatePasskeyAuthenticationOptions(username);
        res.status(200).json(authOptions);
      } catch (error) {
        // Don't reveal if user exists or not for security
        console.error("Error generating passkey authentication options:", error);
        res.status(400).json({ message: "Could not generate authentication options" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Verify passkey authentication
  app.post("/api/auth/passkey/login-verify", async (req, res, next) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      try {
        const verification = await verifyPasskeyAuthentication(
          username,
          req.body
        );
        
        if (!verification.verified) {
          return res.status(401).json({ message: "Authentication failed" });
        }
        
        // Login the user
        req.login(verification.user, (err) => {
          if (err) {
            return next(err);
          }
          
          return res.status(200).json({
            message: "Authentication successful",
            user: verification.user
          });
        });
      } catch (error) {
        console.error("Error verifying passkey authentication:", error);
        res.status(401).json({ message: "Authentication failed" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Disable passkey for a user
  app.delete("/api/users/passkey", isAuthenticated, async (req, res, next) => {
    try {
      // Update user to disable passkey
      const user = await storage.updateUser(req.user!.id, {
        passkey: null,
        passkeyEnabled: false,
        challenge: null
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        message: "Passkey disabled successfully",
        passkeyEnabled: false
      });
    } catch (error) {
      next(error);
    }
  });

  // Get list of verified users (for displaying verification badges)
  app.get("/api/verified-users", async (req, res, next) => {
    try {
      const verifiedUsers = await storage.getVerifiedUsers();
      res.json(verifiedUsers.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        isVerified: user.isVerified,
        role: user.role
      })));
    } catch (error) {
      next(error);
    }
  });

  // Admin: Get list of pending verification requests
  app.get("/api/admin/verification-requests", isAdmin, async (req, res, next) => {
    try {
      const pendingRequests = await storage.getVerificationRequests();
      res.json(pendingRequests);
    } catch (error) {
      next(error);
    }
  });

  // Suggested Questions API
  app.get("/api/suggested-questions", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const category = req.query.category as string | undefined;
      const propertyType = req.query.propertyType as string | undefined;
      
      const questions = await storage.getSuggestedQuestions(category, propertyType, limit);
      res.json(questions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/suggested-questions/popular", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const questions = await storage.getPopularSuggestedQuestions(limit);
      res.json(questions);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/suggested-questions/:id/click", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementQuestionClickCount(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Admin routes for managing suggested questions
  app.post("/api/admin/suggested-questions", isAdmin, async (req, res, next) => {
    try {
      const questionData = insertSuggestedQuestionSchema.parse(req.body);
      const question = await storage.createSuggestedQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid question data",
          errors: fromZodError(error).message,
        });
      }
      next(error);
    }
  });
  
  app.put("/api/admin/suggested-questions/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuestion = await storage.updateSuggestedQuestion(id, req.body);
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/admin/suggested-questions/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSuggestedQuestion(id);
      
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Suggested Questions API endpoints
  app.get('/api/suggested-questions', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const propertyType = req.query.propertyType as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const questions = await storage.getSuggestedQuestions(category, propertyType, limit);
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch suggested questions' });
    }
  });
  
  app.get('/api/suggested-questions/popular', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const questions = await storage.getPopularSuggestedQuestions(limit);
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch popular questions' });
    }
  });
  
  app.post('/api/suggested-questions/:id/click', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const success = await storage.incrementQuestionClickCount(questionId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Question not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to increment question click count' });
    }
  });
  
  // Stripe payment routes
  
  // Get subscription details for the current user
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      
      // Return subscription info from user object
      res.json({
        tier: user.subscriptionTier,
        status: user.subscriptionStatus || "none",
        expiresAt: user.subscriptionExpiresAt,
        features: SUBSCRIPTION_FEATURES[user.subscriptionTier]
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ 
        message: "Error fetching subscription details",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get subscription plan information
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      res.json(SUBSCRIPTION_FEATURES);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ 
        message: "Error fetching subscription plans",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a payment intent for one-time purchases
  app.post("/api/payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, metadata = {} } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const user = req.user as Express.User;
      
      // Create or get Stripe customer
      const customer = await createStripeCustomer(user);
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent(
        Math.round(amount * 100), // Convert to cents
        customer.id,
        { ...metadata, userId: user.id }
      );
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error creating payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a subscription
  app.post("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      
      const user = req.user as Express.User;
      
      // If user already has a subscription, return error
      if (user.stripeSubscriptionId) {
        return res.status(400).json({ 
          message: "User already has a subscription. Use the update endpoint to change subscription.", 
          subscriptionId: user.stripeSubscriptionId 
        });
      }
      
      // Create or get Stripe customer
      const customer = await createStripeCustomer(user);
      
      // Create subscription
      const subscription = await createSubscription(customer.id, priceId, user.id);
      
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ 
        message: "Error creating subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update a subscription
  app.put("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      
      const user = req.user as Express.User;
      
      // Check if user has a subscription
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      
      // Update subscription with new price
      const updatedSubscription = await updateSubscription(user.stripeSubscriptionId, priceId);
      
      res.json(updatedSubscription);
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ 
        message: "Error updating subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Cancel a subscription
  app.delete("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      
      // Check if user has a subscription
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      
      // Cancel subscription
      const canceledSubscription = await cancelSubscription(user.stripeSubscriptionId);
      
      // Update user record
      await storage.updateUser(user.id, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled'
      });
      
      res.json({ success: true, message: "Subscription canceled successfully" });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ 
        message: "Error canceling subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    let event: Stripe.Event;
    
    try {
      // Get Stripe signature from headers
      const signature = req.headers['stripe-signature'] as string;
      
      // Verify webhook signature
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Missing Stripe webhook secret');
      }
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      // Process event
      const result = await handleStripeWebhook(event);
      
      res.json({ received: true, result });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(400).json({ 
        message: "Webhook error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
