import 'dotenv/config';
import { db } from './db';
import { users, properties, neighborhoods } from '../shared/schema';

async function testDatabase() {
  try {
    // Test users query
    const allUsers = await db.select().from(users);
    console.log('Users in database:', allUsers.length);
    
    // Test properties query
    const allProperties = await db.select().from(properties);
    console.log('Properties in database:', allProperties.length);
    
    // Test neighborhoods query
    const allNeighborhoods = await db.select().from(neighborhoods);
    console.log('Neighborhoods in database:', allNeighborhoods.length);
    
    console.log('Database connection and queries successful!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 