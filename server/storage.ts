import { 
  users, type User, type InsertUser, type RegisterUser,
  properties, type Property, type InsertProperty,
  favorites, type Favorite, type InsertFavorite,
  messages, type Message, type InsertMessage,
  searchHistory, type SearchProperties, neighborhoods, type Neighborhood,
  propertyTours, type PropertyTour, type InsertPropertyTour, type UpdatePropertyTour,
  chatAnalytics, type ChatAnalytics, type InsertChatAnalytics,
  suggestedQuestions, type SuggestedQuestion, type InsertSuggestedQuestion,
  propertyDrafts, type PropertyDraft, type InsertPropertyDraft
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, inArray, like, gte, lte, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: 'user' | 'agent' | 'admin'): Promise<User[]>;
  getAllMessageRecipients(currentUserId: number): Promise<User[]>;
  createUser(user: RegisterUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser> & { subscriptionTier?: 'free' | 'premium' | 'enterprise' }): Promise<User | undefined>;
  
  // Properties
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(limit?: number, offset?: number): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  searchProperties(search: SearchProperties, limit?: number, offset?: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  getPropertiesByUser(userId: number): Promise<Property[]>;
  
  // Property Drafts
  getPropertyDrafts(userId: number): Promise<PropertyDraft[]>;
  getPropertyDraft(id: number): Promise<PropertyDraft | undefined>;
  createPropertyDraft(draft: InsertPropertyDraft): Promise<PropertyDraft>;
  updatePropertyDraft(id: number, draft: Partial<InsertPropertyDraft>): Promise<PropertyDraft | undefined>;
  deletePropertyDraft(id: number): Promise<boolean>;
  
  // Recommendations
  getRecommendedProperties(userId: number, limit?: number): Promise<{ property: Property; reason: string }[]>;
  saveSearchHistory(userId: number, search: SearchProperties): Promise<any>;
  getSearchHistory(userId: number, limit?: number): Promise<SearchProperties[]>;
  
  // Favorites
  getFavorite(userId: number, propertyId: number): Promise<Favorite | undefined>;
  getFavoritesByUser(userId: number): Promise<Property[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, propertyId: number): Promise<boolean>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number, role: 'sender' | 'recipient'): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: 'read' | 'replied' | 'archived'): Promise<Message | undefined>;
  
  // Neighborhoods
  getNeighborhood(id: number): Promise<Neighborhood | undefined>;
  getNeighborhoods(limit?: number): Promise<Neighborhood[]>;
  
  // Property Tours
  getPropertyTour(id: number): Promise<PropertyTour | undefined>;
  getPropertyToursByUser(userId: number): Promise<PropertyTour[]>;
  getPropertyToursByProperty(propertyId: number): Promise<PropertyTour[]>;
  getPropertyToursByAgent(agentId: number): Promise<PropertyTour[]>;
  createPropertyTour(tour: InsertPropertyTour): Promise<PropertyTour>;
  updatePropertyTour(id: number, tour: UpdatePropertyTour): Promise<PropertyTour | undefined>;
  cancelPropertyTour(id: number): Promise<PropertyTour | undefined>;
  getAvailableTourTimeSlots(propertyId: number, date: Date): Promise<string[]>; // Returns available times
  
  // Chat Analytics
  saveChatInteraction(analytics: InsertChatAnalytics): Promise<ChatAnalytics>;
  getChatAnalytics(limit?: number, offset?: number): Promise<ChatAnalytics[]>;
  getChatAnalyticsByUser(userId: number, limit?: number): Promise<ChatAnalytics[]>;
  getChatAnalyticsByProperty(propertyId: number, limit?: number): Promise<ChatAnalytics[]>;
  getTopChatQuestions(limit?: number): Promise<{message: string, count: number}[]>;
  getChatCategories(): Promise<{category: string, count: number}[]>;
  getChatSentimentBreakdown(): Promise<{sentiment: string, count: number}[]>;
  
  // User Verification
  getVerifiedUsers(): Promise<User[]>;
  getVerificationRequests(): Promise<User[]>;
  
  // Suggested Questions
  getSuggestedQuestions(category?: string, propertyType?: string, limit?: number): Promise<SuggestedQuestion[]>;
  getSuggestedQuestion(id: number): Promise<SuggestedQuestion | undefined>;
  createSuggestedQuestion(question: InsertSuggestedQuestion): Promise<SuggestedQuestion>;
  updateSuggestedQuestion(id: number, question: Partial<InsertSuggestedQuestion>): Promise<SuggestedQuestion | undefined>;
  deleteSuggestedQuestion(id: number): Promise<boolean>;
  incrementQuestionClickCount(id: number): Promise<boolean>;
  getPopularSuggestedQuestions(limit?: number): Promise<SuggestedQuestion[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
      },
      createTableIfMissing: true,
    });
  }
  
  // Recommendations
  async getRecommendedProperties(userId: number, limit = 5): Promise<{ property: Property; reason: string }[]> {
    try {
      // Get the user
      const user = await this.getUser(userId);
      if (!user) {
        return [];
      }
      
      // Get all properties to recommend from
      const allProperties = await this.getProperties(100); // Get a decent sample size
      
      // Get user's search history
      const searchHistory = await this.getSearchHistory(userId);
      
      // Get user's favorited properties
      const favoritedProperties = await this.getFavoritesByUser(userId);
      
      // Use OpenAI to generate recommendations
      const { generatePropertyRecommendations } = await import('./openai');
      return generatePropertyRecommendations(
        user,
        allProperties,
        searchHistory,
        favoritedProperties,
        limit
      );
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
  
  async saveSearchHistory(userId: number, search: SearchProperties): Promise<any> {
    try {
      const [result] = await db.insert(searchHistory)
        .values({
          userId,
          searchParams: search as any,
          createdAt: new Date()
        })
        .returning();
      return result;
    } catch (error) {
      console.error('Error saving search history:', error);
      return null;
    }
  }
  
  async getSearchHistory(userId: number, limit = 20): Promise<SearchProperties[]> {
    try {
      const results = await db.select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.createdAt))
        .limit(limit);
        
      return results.map(item => item.searchParams as unknown as SearchProperties);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUsersByRole(role: 'user' | 'agent' | 'admin'): Promise<User[]> {
    return db.select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(users.fullName);
  }
  
  async getAllMessageRecipients(currentUserId: number): Promise<User[]> {
    // Get all users except the current user, ordered by role (admin, agent, user) and then name
    return db.select()
      .from(users)
      .where(
        and(
          // Exclude current user
          sql`${users.id} != ${currentUserId}`,
          // Only include active users (not suspended)
          sql`${users.status} != 'suspended'`
        )
      )
      .orderBy(
        // Sort by role priority (admin first, then agent, then user)
        sql`CASE 
          WHEN ${users.role} = 'admin' THEN 1 
          WHEN ${users.role} = 'agent' THEN 2 
          ELSE 3 
        END`,
        // Then sort by name
        users.fullName
      );
  }
  
  async createUser(user: RegisterUser): Promise<User> {
    try {
      // Check for existing email first
      const existingEmail = await this.getUserByEmail(user.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
      
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async updateUser(id: number, user: Partial<InsertUser> & { subscriptionTier?: 'free' | 'premium' | 'enterprise' }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Properties
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }
  
  async getProperties(limit = 10, offset = 0): Promise<Property[]> {
    return db.select()
      .from(properties)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(properties.createdAt));
  }
  
  async getFeaturedProperties(limit = 5): Promise<Property[]> {
    return db.select()
      .from(properties)
      .where(eq(properties.isPremium, true))
      .limit(limit)
      .orderBy(desc(properties.createdAt));
  }
  
  async searchProperties(search: SearchProperties, limit = 10, offset = 0): Promise<Property[]> {
    // If using spatial search with coordinates and radius, use PostGIS
    if (search.latitude && search.longitude && search.radius) {
      // Convert radius from kilometers to meters for ST_DWithin
      const radiusInMeters = search.radius * 1000;
      
      // Create parameterized SQL for better safety
      let query = sql`
        SELECT * FROM properties
        WHERE ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${search.longitude}, ${search.latitude}), 4326),
          ${radiusInMeters}
        )
      `;
      
      // Add additional filters
      if (search.propertyType) {
        query = sql`${query} AND property_type = ${search.propertyType}`;
      }
      
      if (search.minPrice) {
        query = sql`${query} AND price >= ${search.minPrice}`;
      }
      
      if (search.maxPrice) {
        query = sql`${query} AND price <= ${search.maxPrice}`;
      }
      
      if (search.beds) {
        query = sql`${query} AND bedrooms >= ${search.beds}`;
      }
      
      if (search.baths) {
        query = sql`${query} AND bathrooms >= ${search.baths}`;
      }
      
      if (search.minSqft) {
        query = sql`${query} AND square_feet >= ${search.minSqft}`;
      }
      
      if (search.maxSqft) {
        query = sql`${query} AND square_feet <= ${search.maxSqft}`;
      }
      
      if (search.features && search.features.length > 0) {
        // This syntax for jsonb array overlap is specific to PostgreSQL
        query = sql`${query} AND features ?& ${JSON.stringify(search.features)}`;
      }
      
      // Add ordering and pagination
      query = sql`
        ${query}
        ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint(${search.longitude}, ${search.latitude}), 4326))
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      // Execute the query and convert to required types
      const results = await db.execute(query);
      
      // Check if results is an array (Neon returns an array of rows)
      if (Array.isArray(results)) {
        const properties = results.map(row => {
          // Convert raw database rows to Property type
          return {
            id: row.id as number,
            title: row.title as string,
            description: row.description as string,
            price: row.price as number,
            address: row.address as string,
            city: row.city as string,
            state: row.state as string,
            zipCode: row.zip_code as string,
            country: row.country as string,
            latitude: row.latitude as number,
            longitude: row.longitude as number,
            bedrooms: row.bedrooms as number,
            bathrooms: row.bathrooms as number,
            squareFeet: row.square_feet as number,
            propertyType: row.property_type as ('house' | 'condo' | 'apartment' | 'townhouse' | 'land'),
            yearBuilt: row.year_built as number || null,
            isPremium: row.is_premium as boolean,
            features: row.features as string[],
            images: row.images as string[],
            neighborhoodId: row.neighborhood_id as number || null,
            ownerId: row.owner_id as number,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string)
          } as Property;
        });
        
        return properties;
      }
      
      // If results is not an array, it might be an object with rows property
      if (results && typeof results === 'object' && 'rows' in results && Array.isArray(results.rows)) {
        const properties = results.rows.map(row => {
          // Similar conversion as above
          return {
            id: row.id as number,
            title: row.title as string,
            description: row.description as string,
            price: row.price as number,
            address: row.address as string,
            city: row.city as string,
            state: row.state as string,
            zipCode: row.zip_code as string,
            country: row.country as string,
            latitude: row.latitude as number,
            longitude: row.longitude as number,
            bedrooms: row.bedrooms as number,
            bathrooms: row.bathrooms as number,
            squareFeet: row.square_feet as number,
            propertyType: row.property_type as ('house' | 'condo' | 'apartment' | 'townhouse' | 'land'),
            yearBuilt: row.year_built as number || null,
            isPremium: row.is_premium as boolean,
            features: row.features as string[],
            images: row.images as string[],
            neighborhoodId: row.neighborhood_id as number || null,
            ownerId: row.owner_id as number,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string)
          } as Property;
        });
        
        return properties;
      }
      
      // If we can't process the results, return an empty array
      console.error('Unexpected results format:', results);
      return [];
    }
    // Otherwise, use the standard query builder
    else {
      let query = db.select().from(properties);
      
      // Apply standard location filters
      if (search.location) {
        query = query.where(
          or(
            like(properties.city, `%${search.location}%`),
            like(properties.state, `%${search.location}%`),
            like(properties.zipCode, `%${search.location}%`),
            like(properties.address, `%${search.location}%`)
          )
        );
      }
      
      if (search.propertyType) {
        query = query.where(eq(properties.propertyType, search.propertyType));
      }
      
      if (search.minPrice) {
        query = query.where(gte(properties.price, search.minPrice));
      }
      
      if (search.maxPrice) {
        query = query.where(lte(properties.price, search.maxPrice));
      }
      
      if (search.beds) {
        query = query.where(gte(properties.bedrooms, search.beds));
      }
      
      if (search.baths) {
        query = query.where(gte(properties.bathrooms, search.baths));
      }
      
      if (search.minSqft) {
        query = query.where(gte(properties.squareFeet, search.minSqft));
      }
      
      if (search.maxSqft) {
        query = query.where(lte(properties.squareFeet, search.maxSqft));
      }
      
      if (search.features && search.features.length > 0) {
        // Check for any overlap in features
        query = query.where(
          sql`${properties.features} ?& ${JSON.stringify(search.features)}`
        );
      }
      
      return query.limit(limit).offset(offset).orderBy(desc(properties.createdAt));
    }
  }
  
  async createProperty(property: InsertProperty): Promise<Property> {
    // Create a new property with PostGIS location data
    const propertyWithLocation = {
      ...property,
    };
    
    // Insert the property
    const [newProperty] = await db.insert(properties).values(propertyWithLocation).returning();
    
    // Now update with the PostGIS location point
    if (newProperty && newProperty.latitude && newProperty.longitude) {
      await db.execute(sql`
        UPDATE properties 
        SET location = ST_SetSRID(ST_MakePoint(${newProperty.longitude}, ${newProperty.latitude}), 4326)
        WHERE id = ${newProperty.id}
      `);
      
      // Get the updated property with the location
      const [updatedProperty] = await db.select()
        .from(properties)
        .where(eq(properties.id, newProperty.id));
        
      return updatedProperty;
    }
    
    return newProperty;
  }
  
  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    // Update property general data
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    
    // If latitude or longitude was updated, update the PostGIS location point
    if ((property.latitude !== undefined || property.longitude !== undefined) && updatedProperty) {
      // Get the current values if not provided in the update
      const latitude = property.latitude !== undefined ? property.latitude : updatedProperty.latitude;
      const longitude = property.longitude !== undefined ? property.longitude : updatedProperty.longitude;
      
      // Update the location point
      await db.execute(sql`
        UPDATE properties 
        SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${id}
      `);
      
      // Get the updated property with the location
      const [refreshedProperty] = await db.select()
        .from(properties)
        .where(eq(properties.id, id));
        
      return refreshedProperty;
    }
    
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    await db.delete(properties).where(eq(properties.id, id));
    return true;
  }
  
  async getPropertiesByUser(userId: number): Promise<Property[]> {
    return db.select()
      .from(properties)
      .where(eq(properties.ownerId, userId))
      .orderBy(desc(properties.createdAt));
  }
  
  // Favorites
  async getFavorite(userId: number, propertyId: number): Promise<Favorite | undefined> {
    const [favorite] = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return favorite;
  }
  
  async getFavoritesByUser(userId: number): Promise<Property[]> {
    const result = await db.select({
      property: properties
    })
    .from(favorites)
    .leftJoin(properties, eq(favorites.propertyId, properties.id))
    .where(eq(favorites.userId, userId));
    
    return result.map(r => r.property);
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values([favorite]).returning();
    return newFavorite;
  }
  
  async removeFavorite(userId: number, propertyId: number): Promise<boolean> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return true;
  }
  
  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesByUser(userId: number, role: 'sender' | 'recipient'): Promise<Message[]> {
    const column = role === 'sender' ? messages.senderId : messages.recipientId;
    return db.select()
      .from(messages)
      .where(eq(column, userId))
      .orderBy(desc(messages.createdAt));
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async updateMessageStatus(id: number, status: 'read' | 'replied' | 'archived'): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
  
  // Neighborhoods
  async getNeighborhood(id: number): Promise<Neighborhood | undefined> {
    const [neighborhood] = await db.select()
      .from(neighborhoods)
      .where(eq(neighborhoods.id, id));
    return neighborhood;
  }
  
  async getNeighborhoods(limit = 5): Promise<Neighborhood[]> {
    return db.select()
      .from(neighborhoods)
      .orderBy(neighborhoods.rank)
      .limit(limit);
  }
  
  // Property Tours
  async getPropertyTour(id: number): Promise<PropertyTour | undefined> {
    const [tour] = await db.select()
      .from(propertyTours)
      .where(eq(propertyTours.id, id));
    return tour;
  }
  
  async getPropertyToursByUser(userId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.userId, userId))
      .orderBy(desc(propertyTours.tourDate));
  }
  
  async getPropertyToursByProperty(propertyId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.propertyId, propertyId))
      .orderBy(desc(propertyTours.tourDate));
  }
  
  async getPropertyToursByAgent(agentId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.agentId, agentId))
      .orderBy(desc(propertyTours.tourDate));
  }
  
  async createPropertyTour(tour: InsertPropertyTour): Promise<PropertyTour> {
    // Get property data to assign an agent
    const property = await this.getProperty(tour.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Assign the property owner as the agent if they are an agent or admin
    const owner = await this.getUser(property.ownerId);
    let agentId = null;
    
    if (owner && (owner.role === 'agent' || owner.role === 'admin')) {
      agentId = owner.id;
    } else {
      // Find an available agent
      const [agent] = await db.select()
        .from(users)
        .where(eq(users.role, 'agent'))
        .limit(1);
        
      if (agent) {
        agentId = agent.id;
      }
    }
    
    // Create the tour with an assigned agent
    const [newTour] = await db.insert(propertyTours)
      .values({
        ...tour,
        agentId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return newTour;
  }
  
  async updatePropertyTour(id: number, tour: UpdatePropertyTour): Promise<PropertyTour | undefined> {
    const [updatedTour] = await db.update(propertyTours)
      .set({
        ...tour,
        updatedAt: new Date(),
      })
      .where(eq(propertyTours.id, id))
      .returning();
      
    return updatedTour;
  }
  
  async cancelPropertyTour(id: number): Promise<PropertyTour | undefined> {
    const [cancelledTour] = await db.update(propertyTours)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(propertyTours.id, id))
      .returning();
      
    return cancelledTour;
  }
  
  async getAvailableTourTimeSlots(propertyId: number, date: Date): Promise<string[]> {
    // Get all tour slots for the property on the given date
    const tours = await db.select()
      .from(propertyTours)
      .where(
        and(
          eq(propertyTours.propertyId, propertyId),
          sql`DATE(${propertyTours.tourDate}) = DATE(${date})`
        )
      );
    
    // Generate time slots from 9:00 to 17:00 with 30-minute intervals
    const allTimeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    // Filter out booked slots
    const bookedTimes = tours.map(tour => tour.tourTime);
    const availableSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));
    
    return availableSlots;
  }

  // Chat Analytics
  async saveChatInteraction(analytics: InsertChatAnalytics): Promise<ChatAnalytics> {
    try {
      const [result] = await db.insert(chatAnalytics)
        .values(analytics)
        .returning();
      return result;
    } catch (error) {
      console.error('Error saving chat interaction:', error);
      throw error;
    }
  }

  async getChatAnalytics(limit = 50, offset = 0): Promise<ChatAnalytics[]> {
    try {
      return db.select()
        .from(chatAnalytics)
        .orderBy(desc(chatAnalytics.timestamp))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      return [];
    }
  }

  async getChatAnalyticsByUser(userId: number, limit = 20): Promise<ChatAnalytics[]> {
    try {
      return db.select()
        .from(chatAnalytics)
        .where(eq(chatAnalytics.userId, userId))
        .orderBy(desc(chatAnalytics.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Error getting user chat analytics:', error);
      return [];
    }
  }

  async getChatAnalyticsByProperty(propertyId: number, limit = 20): Promise<ChatAnalytics[]> {
    try {
      return db.select()
        .from(chatAnalytics)
        .where(eq(chatAnalytics.propertyId, propertyId))
        .orderBy(desc(chatAnalytics.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Error getting property chat analytics:', error);
      return [];
    }
  }

  async getTopChatQuestions(limit = 10): Promise<{message: string, count: number}[]> {
    try {
      // Use SQL for aggregation
      const results = await db.execute(sql`
        SELECT message, COUNT(*) as count
        FROM chat_analytics
        GROUP BY message
        ORDER BY count DESC
        LIMIT ${limit}
      `);
      
      // Process results based on return format
      if (Array.isArray(results)) {
        return results.map(row => ({
          message: row.message as string,
          count: Number(row.count)
        }));
      } else if (results && 'rows' in results) {
        return results.rows.map(row => ({
          message: row.message as string,
          count: Number(row.count)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting top chat questions:', error);
      return [];
    }
  }

  async getChatCategories(): Promise<{category: string, count: number}[]> {
    try {
      // Only get categories that are non-null
      const results = await db.execute(sql`
        SELECT category, COUNT(*) as count
        FROM chat_analytics
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `);
      
      // Process results
      if (Array.isArray(results)) {
        return results.map(row => ({
          category: row.category as string,
          count: Number(row.count)
        }));
      } else if (results && 'rows' in results) {
        return results.rows.map(row => ({
          category: row.category as string,
          count: Number(row.count)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting chat categories:', error);
      return [];
    }
  }

  async getChatSentimentBreakdown(): Promise<{sentiment: string, count: number}[]> {
    try {
      // Only get sentiment that are non-null
      const results = await db.execute(sql`
        SELECT sentiment, COUNT(*) as count
        FROM chat_analytics
        WHERE sentiment IS NOT NULL
        GROUP BY sentiment
        ORDER BY count DESC
      `);
      
      // Process results
      if (Array.isArray(results)) {
        return results.map(row => ({
          sentiment: row.sentiment as string,
          count: Number(row.count)
        }));
      } else if (results && 'rows' in results) {
        return results.rows.map(row => ({
          sentiment: row.sentiment as string,
          count: Number(row.count)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting chat sentiment breakdown:', error);
      return [];
    }
  }

  // User Verification methods
  async getVerifiedUsers(): Promise<User[]> {
    try {
      // Get all users with isVerified = true
      const verifiedUsers = await db.select()
        .from(users)
        .where(eq(users.isVerified, true))
        .orderBy(desc(users.verificationDate));
        
      return verifiedUsers;
    } catch (error) {
      console.error('Error getting verified users:', error);
      return [];
    }
  }

  async getVerificationRequests(): Promise<User[]> {
    try {
      // Get all users with pending verification status
      const pendingRequests = await db.select()
        .from(users)
        .where(eq(users.idVerificationStatus, 'pending'))
        .orderBy(desc(users.idVerificationDate));
        
      return pendingRequests;
    } catch (error) {
      console.error('Error getting verification requests:', error);
      return [];
    }
  }

  // Suggested Questions
  async getSuggestedQuestions(category?: string, propertyType?: string, limit = 5): Promise<SuggestedQuestion[]> {
    try {
      let query = db.select()
        .from(suggestedQuestions)
        .where(eq(suggestedQuestions.isActive, true));
      
      if (category) {
        query = query.where(eq(suggestedQuestions.category, category));
      }
      
      if (propertyType) {
        query = query.where(eq(suggestedQuestions.propertyType, propertyType as any));
      }
      
      return query
        .orderBy(desc(suggestedQuestions.displayOrder))
        .limit(limit);
    } catch (error) {
      console.error('Error getting suggested questions:', error);
      return [];
    }
  }
  
  async getSuggestedQuestion(id: number): Promise<SuggestedQuestion | undefined> {
    try {
      const [question] = await db.select()
        .from(suggestedQuestions)
        .where(eq(suggestedQuestions.id, id));
      return question;
    } catch (error) {
      console.error('Error getting suggested question:', error);
      return undefined;
    }
  }
  
  async createSuggestedQuestion(question: InsertSuggestedQuestion): Promise<SuggestedQuestion> {
    try {
      const [newQuestion] = await db.insert(suggestedQuestions)
        .values(question)
        .returning();
      return newQuestion;
    } catch (error) {
      console.error('Error creating suggested question:', error);
      throw error;
    }
  }
  
  async updateSuggestedQuestion(id: number, question: Partial<InsertSuggestedQuestion>): Promise<SuggestedQuestion | undefined> {
    try {
      const [updatedQuestion] = await db.update(suggestedQuestions)
        .set({ ...question, updatedAt: new Date() })
        .where(eq(suggestedQuestions.id, id))
        .returning();
      return updatedQuestion;
    } catch (error) {
      console.error('Error updating suggested question:', error);
      return undefined;
    }
  }
  
  async deleteSuggestedQuestion(id: number): Promise<boolean> {
    try {
      await db.delete(suggestedQuestions)
        .where(eq(suggestedQuestions.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting suggested question:', error);
      return false;
    }
  }
  
  async incrementQuestionClickCount(id: number): Promise<boolean> {
    try {
      await db.update(suggestedQuestions)
        .set({
          clickCount: sql`${suggestedQuestions.clickCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(suggestedQuestions.id, id));
      return true;
    } catch (error) {
      console.error('Error incrementing question click count:', error);
      return false;
    }
  }
  
  async getPopularSuggestedQuestions(limit = 5): Promise<SuggestedQuestion[]> {
    try {
      return db.select()
        .from(suggestedQuestions)
        .where(eq(suggestedQuestions.isActive, true))
        .orderBy(desc(suggestedQuestions.clickCount))
        .limit(limit);
    } catch (error) {
      console.error('Error getting popular suggested questions:', error);
      return [];
    }
  }
  
  // Property Drafts methods
  async getPropertyDrafts(userId: number): Promise<PropertyDraft[]> {
    try {
      const drafts = await db.select()
        .from(propertyDrafts)
        .where(eq(propertyDrafts.userId, userId))
        .orderBy(desc(propertyDrafts.lastUpdated));
      return drafts;
    } catch (error) {
      console.error('Error getting property drafts:', error);
      return [];
    }
  }
  
  async getPropertyDraft(id: number): Promise<PropertyDraft | undefined> {
    try {
      const [draft] = await db.select()
        .from(propertyDrafts)
        .where(eq(propertyDrafts.id, id));
      return draft;
    } catch (error) {
      console.error('Error getting property draft:', error);
      return undefined;
    }
  }
  
  async createPropertyDraft(draft: InsertPropertyDraft): Promise<PropertyDraft> {
    try {
      const [newDraft] = await db.insert(propertyDrafts)
        .values(draft)
        .returning();
      return newDraft;
    } catch (error) {
      console.error('Error creating property draft:', error);
      throw error;
    }
  }
  
  async updatePropertyDraft(id: number, draft: Partial<InsertPropertyDraft>): Promise<PropertyDraft | undefined> {
    try {
      const [updatedDraft] = await db.update(propertyDrafts)
        .set({ 
          ...draft, 
          lastUpdated: new Date() 
        })
        .where(eq(propertyDrafts.id, id))
        .returning();
      return updatedDraft;
    } catch (error) {
      console.error('Error updating property draft:', error);
      return undefined;
    }
  }
  
  async deletePropertyDraft(id: number): Promise<boolean> {
    try {
      await db.delete(propertyDrafts)
        .where(eq(propertyDrafts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting property draft:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
