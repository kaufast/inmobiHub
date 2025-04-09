import { 
  users, type User, type InsertUser, type RegisterUser,
  properties, type Property, type InsertProperty,
  favorites, type Favorite, type InsertFavorite,
  messages, type Message, type InsertMessage,
  searchHistory, type SearchProperties, neighborhoods, type Neighborhood
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
  getNeighborhoods(limit?: number): Promise<Neighborhood[]>;
  
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
  
  async createUser(user: RegisterUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
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
  
  async getFeaturedProperties(limit = 3): Promise<Property[]> {
    return db.select()
      .from(properties)
      .where(eq(properties.isPremium, true))
      .limit(limit)
      .orderBy(desc(properties.createdAt));
  }
  
  async searchProperties(search: SearchProperties, limit = 10, offset = 0): Promise<Property[]> {
    let query = db.select().from(properties);
    
    // Apply filters
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
      // This requires a more complex query since features is stored as a JSON array
      // Simplified approach that checks for any overlap
      query = query.where(
        sql`${properties.features} ?& ${JSON.stringify(search.features)}`
      );
    }
    
    return query.limit(limit).offset(offset).orderBy(desc(properties.createdAt));
  }
  
  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }
  
  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
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
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
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
  async getNeighborhoods(limit = 5): Promise<Neighborhood[]> {
    return db.select()
      .from(neighborhoods)
      .orderBy(neighborhoods.rank)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
