import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/shared/schema';

// Use connection pooling for better performance
const connectionString = process.env.DATABASE_URL || 'postgresql://inmobiHub_owner:npg_yeGskW7cX0ip@ep-sweet-firefly-a4a6vr9j-pooler.us-east-1.aws.neon.tech/inmobiHub?sslmode=require';

// Create a postgres client with connection pooling
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create the drizzle instance with the schema
export const db = drizzle(client, { schema });

// Export the client for direct use if needed
export { client }; 