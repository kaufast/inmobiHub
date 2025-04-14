import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';

// Create a connection pool
const pool = new Pool({
  user: 'melchor',
  database: 'neondb_local',
  ssl: false
});

// Create Drizzle instance
export const db = drizzle(pool);
