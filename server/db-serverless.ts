import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import ws from "ws";

// This is important for Vercel serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// For Vercel serverless environment, we use connection pooling
// with a prepared statement cache
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export a function to check database connectivity
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result[0].connected === 1;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}