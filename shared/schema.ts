import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum('role', ['user', 'agent', 'admin']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'enterprise']);
export const propertyTypeEnum = pgEnum('property_type', ['house', 'condo', 'apartment', 'townhouse', 'land']);
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read', 'replied', 'archived']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default('user'),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default('free'),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  favoriteProperties: many(favorites),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'recipient' }),
}));

// Properties
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default('USA'),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  yearBuilt: integer("year_built"),
  isPremium: boolean("is_premium").notNull().default(false),
  features: jsonb("features").$type<string[]>(),
  images: jsonb("images").$type<string[]>().notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  favorites: many(favorites),
}));

// Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default('unread'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
  property: one(properties, {
    fields: [messages.propertyId],
    references: [properties.id],
  }),
}));

// Search history
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  query: jsonb("query").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

// Neighborhoods
export const neighborhoods = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  growth: doublePrecision("growth").notNull(),
  rank: integer("rank"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  subscriptionTier: true,
  subscriptionExpiresAt: true,
});

export const registerUserSchema = insertUserSchema.pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const searchPropertiesSchema = z.object({
  location: z.string().optional(),
  propertyType: z.enum(['house', 'condo', 'apartment', 'townhouse', 'land']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  features: z.array(z.string()).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type SearchProperties = z.infer<typeof searchPropertiesSchema>;
export type Neighborhood = typeof neighborhoods.$inferSelect;
