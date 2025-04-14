import { type Express } from 'express';
import { type User as DbUser } from '@shared/schema';

declare global {
  namespace Express {
    interface User extends DbUser {
      challenge?: string;
      passkeyPublicKey?: string;
      passkeyCounter?: number;
      stripeSubscriptionId?: string;
      subscriptionStatus?: string;
      firebaseUid?: string;
    }
  }
}

export type MessageRecipient = {
  id: number;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
};

export type WebSocketMessage = {
  type: 'subscribe' | 'unsubscribe' | 'newProperty' | 'propertyUpdated' | 'ping';
  payload?: any;
};

export type AnalyticsData = {
  viewTrends: { date: string; views: number; marketAverage: number; }[];
  inquiryTrends: { date: string; inquiries: number; marketAverage: number; }[];
  conversionTrends: { date: string; conversionRate: number; marketAverage: number; }[];
  performanceMetrics: { name: string; property: number; market: number; }[];
  priceTrends: { date: string; price: number; marketAverage: number; }[];
  comparablePrices: { city: string; pricePerSqFt: number; }[];
  valueChange: number | null;
  projectedIncome: number | null;
  seasonalTrends: { season: string; views: number; inquiries: number; priceChange: string; }[];
  comparableProperties: { id: number; price: number; pricePerSqFt: number; area: number; bedrooms: number; bathrooms: number; daysOnMarket: number; }[];
}; 