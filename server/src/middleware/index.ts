import { Express } from 'express';

export function setupMiddleware(app: Express) {
  // Add any middleware setup here
  // For now, we'll just log that middleware is being set up
  console.log('Setting up middleware...');
} 