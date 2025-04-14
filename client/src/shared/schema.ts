import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'agent' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
  status: 'for_sale' | 'pending' | 'sold' | 'rented';
  features: string[];
  images: string[];
  latitude: number;
  longitude: number;
  ownerId: string;
  neighborhoodId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'agent', 'admin']).default('user'),
});

export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type SearchProperties = Partial<Property>; 