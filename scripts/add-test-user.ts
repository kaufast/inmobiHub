import { db } from "../server/db";
import { users } from "@shared/schema";

async function addTestUser() {
  try {
    const [user] = await db.insert(users).values({
      username: "testuser",
      password: "password123", // In a real app, this would be hashed
      email: "test@example.com",
      fullName: "Test User",
      role: "agent",
      subscriptionTier: "premium",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log("Successfully created test user:", user);
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

addTestUser(); 