// update-db.js
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function alterTable() {
  try {
    console.log("Adding new columns to users table...");
    
    // Add is_verified column
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL`);
    
    // Add verification_date column
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP`);
    
    // Add verified_by column
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by INTEGER`);
    
    // Add passkey columns
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey TEXT`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT FALSE NOT NULL`);
    
    // Add ID verification columns
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_id_verification BOOLEAN DEFAULT FALSE NOT NULL`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_verification_type TEXT`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_verification_date TIMESTAMP`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_verification_status TEXT DEFAULT 'none'`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_verification_notes TEXT`);
    
    console.log("Database update completed successfully!");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    process.exit(0);
  }
}

alterTable();