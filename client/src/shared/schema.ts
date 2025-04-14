import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Custom types for PostGIS
export const point = (name: string) => text(name).$type<any>();

// Enums
export const roleEnum = pgEnum('role', ['user', 'agent', 'admin']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'enterprise']);
export const propertyTypeEnum = pgEnum('property_type', ['house', 'condo', 'apartment', 'townhouse', 'land']);
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read', 'replied', 'archived']);
export const tourStatusEnum = pgEnum('tour_status', ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled']);
export const tourTypeEnum = pgEnum('tour_type', ['in-person', 'virtual']);

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
  preferredLanguage: text("preferred_language").default("en-GB"),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: timestamp("verification_date"),
  verifiedBy: integer("verified_by"),
  // Passkey authentication
  passkey: text("passkey"),
  passkeyEnabled: boolean("passkey_enabled").default(false).notNull(),
  // ID Verification
  hasIdVerification: boolean("has_id_verification").default(false).notNull(),
  idVerificationType: text("id_verification_type"), // e.g., "passport", "driver_license", "national_id"
  idVerificationDate: timestamp("id_verification_date"),
  idVerificationStatus: text("id_verification_status").default("none"), // "none", "pending", "approved", "rejected"
  idVerificationNotes: text("id_verification_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  properties: many(properties),
  favoriteProperties: many(favorites),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'recipient' }),
  verifiedUsers: many(users, { relationName: 'verifier' }),
  verifier: one(users, {
    fields: [users.verifiedBy],
    references: [users.id],
    relationName: 'verifier',
  }),
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
  location: point("location"),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  yearBuilt: integer("year_built"),
  isPremium: boolean("is_premium").notNull().default(false),
  features: jsonb("features").$type<string[]>(),
  images: jsonb("images").$type<string[]>().notNull(),
  lotSize: integer("lot_size"),
  garageSpaces: integer("garage_spaces"),
  listingType: text("listing_type").default('sale'),
  locationScore: integer("location_score"),
  neighborhoodId: integer("neighborhood_id").references(() => neighborhoods.id),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  neighborhood: one(neighborhoods, {
    fields: [properties.neighborhoodId],
    references: [neighborhoods.id],
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
  searchParams: jsonb("search_params").notNull(),
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
  zipCode: text("zip_code").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  
  // Overall score and ranking
  overallScore: integer("overall_score").notNull(), // 0-100 score
  rank: integer("rank"),

  // Specific insight metrics (0-100 scores)
  safetyScore: integer("safety_score"),
  schoolScore: integer("school_score"),
  transitScore: integer("transit_score"), // Renamed from transportScore to match DB column
  walkabilityScore: integer("walkability_score"),
  restaurantScore: integer("restaurant_score"),
  shoppingScore: integer("shopping_score"),
  nightlifeScore: integer("nightlife_score"),
  familyFriendlyScore: integer("family_friendly_score"),
  affordabilityScore: integer("affordability_score"),
  
  // Growth and trends
  growth: doublePrecision("growth"), // Annual growth rate
  medianHomePrice: integer("median_home_price"),
  priceHistory: jsonb("price_history").$type<{year: number, price: number}[]>(),
  
  // Descriptive content
  description: text("description"),
  highlights: jsonb("highlights").$type<string[]>(), // Key features of neighborhood
  challenges: jsonb("challenges").$type<string[]>(), // Challenges/downsides
  
  // Demographics
  population: integer("population"),
  demographics: jsonb("demographics").$type<{
    ageGroups: {group: string, percentage: number}[],
    incomeDistribution: {range: string, percentage: number}[]
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const neighborhoodsRelations = relations(neighborhoods, ({ many }) => ({
  properties: many(properties),
}));

// Property Tours
export const propertyTours = pgTable("property_tours", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => users.id),
  tourDate: timestamp("tour_date").notNull(),
  tourTime: text("tour_time").notNull(), // Store as HH:MM format
  duration: integer("duration").notNull().default(30), // Duration in minutes
  notes: text("notes"),
  status: tourStatusEnum("status").notNull().default('pending'),
  tourType: tourTypeEnum("tour_type").notNull().default('in-person'),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  additionalAttendees: integer("additional_attendees").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const propertyToursRelations = relations(propertyTours, ({ one }) => ({
  property: one(properties, {
    fields: [propertyTours.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [propertyTours.userId],
    references: [users.id],
  }),
  agent: one(users, {
    fields: [propertyTours.agentId],
    references: [users.id],
  }),
}));

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
  location: true, 
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertFavoriteSchema = z.object({
  propertyId: z.number().int().positive(),
  userId: z.number().int().positive().optional()
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
  minLotSize: z.number().optional(),
  maxLotSize: z.number().optional(),
  yearBuiltMin: z.number().optional(),
  yearBuiltMax: z.number().optional(),
  listingType: z.enum(['buy', 'sell', 'rent']).optional(),
  features: z.array(z.string()).optional(),
  // Spatial search parameters
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(), // in kilometers
  
  // Multimodal search parameters
  searchType: z.enum(['text', 'image', 'audio']).optional(),
  imageData: z.string().optional(), // Base64 encoded image data
  audioData: z.string().optional(), // Base64 encoded audio data
  multimodalQuery: z.string().optional(), // Natural language description from image/audio
}).transform(data => ({
  ...data,
  searchType: data.searchType || 'text' // Default to 'text' if not provided
}));

// Passkey schemas
export const passkeyRegisterSchema = z.object({
  userId: z.number().int().positive(),
  passkey: z.string().min(1, "Passkey is required"),
});

export const passkeyAuthenticateSchema = z.object({
  username: z.string().min(1, "Username is required"),
  passkey: z.string().min(1, "Passkey is required"),
});

// ID Verification schemas
export const idVerificationRequestSchema = z.object({
  userId: z.number().int().positive(),
  idVerificationType: z.string().min(1, "Verification type is required"),
  idVerificationDocument: z.string().min(1, "Verification document is required"), // Base64 encoded image
  notes: z.string().optional(),
});

export const updateVerificationStatusSchema = z.object({
  userId: z.number().int().positive(),
  idVerificationStatus: z.enum(['none', 'pending', 'approved', 'rejected']),
  idVerificationNotes: z.string().optional(),
  isVerified: z.boolean().optional(),
});

// User Verification by Admin
export const userVerificationSchema = z.object({
  userId: z.number().int().positive(),
  isVerified: z.boolean(),
  notes: z.string().optional(),
});

export const insertNeighborhoodSchema = createInsertSchema(neighborhoods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyTourSchema = createInsertSchema(propertyTours).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  agentId: true, // Assigned by the system
});

export const updatePropertyTourSchema = z.object({
  id: z.number().int().positive(),
  tourDate: z.date().optional(),
  tourTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM format",
  }).optional(),
  duration: z.number().int().min(15).max(120).optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled']).optional(),
  tourType: z.enum(['in-person', 'virtual']).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  additionalAttendees: z.number().int().min(0).max(10).optional(),
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

export type InsertNeighborhood = z.infer<typeof insertNeighborhoodSchema>;
export type Neighborhood = typeof neighborhoods.$inferSelect;

export type InsertPropertyTour = z.infer<typeof insertPropertyTourSchema>;
export type UpdatePropertyTour = z.infer<typeof updatePropertyTourSchema>;
export type PropertyTour = typeof propertyTours.$inferSelect;

// Property Drafts
export const propertyDrafts = pgTable("property_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  formData: jsonb("form_data").notNull(),
  name: text("name").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyDraftsRelations = relations(propertyDrafts, ({ one }) => ({
  user: one(users, {
    fields: [propertyDrafts.userId],
    references: [users.id],
  }),
}));

// Chat Analytics
export const chatAnalytics = pgTable("chat_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: 'set null' }),
  category: text("category"),
  sentiment: text("sentiment"),
  isPropertySpecific: boolean("is_property_specific").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const chatAnalyticsRelations = relations(chatAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [chatAnalytics.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [chatAnalytics.propertyId],
    references: [properties.id],
  }),
}));

// Suggested Questions for Chat
export const suggestedQuestions = pgTable("suggested_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  category: text("category"),
  propertyType: propertyTypeEnum("property_type"),
  isGeneralQuestion: boolean("is_general_question").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  clickCount: integer("click_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSuggestedQuestionSchema = createInsertSchema(suggestedQuestions).omit({
  id: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSuggestedQuestion = z.infer<typeof insertSuggestedQuestionSchema>;
export type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;

export const insertChatAnalyticsSchema = createInsertSchema(chatAnalytics).omit({
  id: true,
  timestamp: true,
});

export const insertPropertyDraftSchema = createInsertSchema(propertyDrafts).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export type InsertPropertyDraft = z.infer<typeof insertPropertyDraftSchema>;
export type PropertyDraft = typeof propertyDrafts.$inferSelect;

export type InsertChatAnalytics = z.infer<typeof insertChatAnalyticsSchema>;
export type ChatAnalytics = typeof chatAnalytics.$inferSelect;

export type SearchProperties = z.infer<typeof searchPropertiesSchema>;

// Auth and verification types
export type PasskeyRegister = z.infer<typeof passkeyRegisterSchema>;
export type PasskeyAuthenticate = z.infer<typeof passkeyAuthenticateSchema>;
export type IdVerificationRequest = z.infer<typeof idVerificationRequestSchema>;
export type UpdateVerificationStatus = z.infer<typeof updateVerificationStatusSchema>;
export type UserVerification = z.infer<typeof userVerificationSchema>;
