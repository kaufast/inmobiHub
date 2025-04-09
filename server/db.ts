import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Optional: Disable forcing SSL as we're in a secure environment
neonConfig.fetchConnectionCache = true;

// Use the connection string from environment variables
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance
export const db = drizzle(sql);
