import { db } from '../server/db';
import { 
  users, properties, neighborhoods, favorites, searchHistory, 
  propertyDrafts, suggestedQuestions 
} from '../shared/schema';
import { sql } from 'drizzle-orm';

// Generate test data
async function generateTestData() {
  try {
    // Clear existing data
    await db.delete(suggestedQuestions);
    await db.delete(propertyDrafts);
    await db.delete(favorites);
    await db.delete(searchHistory);
    await db.delete(properties);
    await db.delete(neighborhoods);
    await db.delete(users);

    // Insert test users
    const [testUser, agentUser, adminUser] = await db.insert(users).values([
      {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'user',
        subscriptionTier: 'free',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'agent1',
        password: 'agent123',
        email: 'agent@example.com',
        fullName: 'Real Estate Agent',
        role: 'agent',
        subscriptionTier: 'premium',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        fullName: 'System Admin',
        role: 'admin',
        subscriptionTier: 'enterprise',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    // Insert test neighborhoods
    const [downtown, marina, mission] = await db.insert(neighborhoods).values([
      {
        name: 'Downtown',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194,
        overallScore: 85,
        safetyScore: 80,
        schoolScore: 75,
        transitScore: 90,
        walkabilityScore: 85,
        description: 'Vibrant downtown area with excellent amenities',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marina District',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94123',
        latitude: 37.8025,
        longitude: -122.4360,
        overallScore: 90,
        safetyScore: 85,
        schoolScore: 80,
        transitScore: 85,
        walkabilityScore: 90,
        description: 'Upscale neighborhood with beautiful waterfront views',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mission District',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        latitude: 37.7599,
        longitude: -122.4148,
        overallScore: 80,
        safetyScore: 75,
        schoolScore: 70,
        transitScore: 85,
        walkabilityScore: 90,
        description: 'Cultural hub with vibrant nightlife and diverse community',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    // Insert test properties
    const propertiesData = await db.insert(properties).values([
      {
        title: 'Modern Downtown Apartment',
        description: 'Beautiful modern apartment in the heart of downtown with stunning city views',
        price: 750000,
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194,
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        propertyType: 'apartment',
        yearBuilt: 2010,
        features: ['gym', 'pool', 'parking', 'doorman'],
        images: ['https://example.com/image1.jpg'],
        ownerId: testUser.id,
        neighborhoodId: downtown.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Luxury Marina Condo',
        description: 'Spacious condo with panoramic bay views and high-end finishes',
        price: 1200000,
        address: '456 Beach St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94123',
        latitude: 37.8025,
        longitude: -122.4360,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1800,
        propertyType: 'condo',
        yearBuilt: 2015,
        features: ['view', 'parking', 'elevator', 'fitness center'],
        images: ['https://example.com/image2.jpg'],
        ownerId: agentUser.id,
        neighborhoodId: marina.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Charming Mission District Home',
        description: 'Historic home with modern updates in a vibrant neighborhood',
        price: 950000,
        address: '789 Valencia St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        latitude: 37.7599,
        longitude: -122.4148,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1600,
        propertyType: 'house',
        yearBuilt: 1920,
        features: ['garden', 'garage', 'fireplace', 'hardwood floors'],
        images: ['https://example.com/image3.jpg'],
        ownerId: agentUser.id,
        neighborhoodId: mission.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    // Insert test favorites
    await db.insert(favorites).values([
      {
        userId: testUser.id,
        propertyId: propertiesData[0].id,
        createdAt: new Date()
      },
      {
        userId: testUser.id,
        propertyId: propertiesData[1].id,
        createdAt: new Date()
      },
      {
        userId: agentUser.id,
        propertyId: propertiesData[2].id,
        createdAt: new Date()
      }
    ]);

    // Insert test search history
    await db.insert(searchHistory).values([
      {
        userId: testUser.id,
        searchParams: {
          location: 'San Francisco',
          minPrice: 500000,
          maxPrice: 1000000,
          propertyType: 'apartment'
        },
        createdAt: new Date()
      },
      {
        userId: testUser.id,
        searchParams: {
          location: 'Marina District',
          minPrice: 800000,
          maxPrice: 1500000,
          propertyType: 'condo'
        },
        createdAt: new Date()
      },
      {
        userId: agentUser.id,
        searchParams: {
          location: 'Mission District',
          minPrice: 700000,
          maxPrice: 1200000,
          propertyType: 'house'
        },
        createdAt: new Date()
      }
    ]);

    // Insert test property drafts
    await db.insert(propertyDrafts).values([
      {
        userId: testUser.id,
        formData: {
          title: 'New Property Draft',
          description: 'This is a draft property',
          price: 600000
        },
        name: 'Draft 1',
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        userId: agentUser.id,
        formData: {
          title: 'Luxury Property Draft',
          description: 'High-end property draft',
          price: 1200000
        },
        name: 'Luxury Draft',
        lastUpdated: new Date(),
        createdAt: new Date()
      }
    ]);

    // Insert test suggested questions
    await db.insert(suggestedQuestions).values([
      {
        question: 'What is the average price in this neighborhood?',
        category: 'pricing',
        isGeneralQuestion: true,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'How safe is this area?',
        category: 'safety',
        isGeneralQuestion: true,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'What are the nearby schools?',
        category: 'education',
        isGeneralQuestion: true,
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'What is the walkability score?',
        category: 'transportation',
        isGeneralQuestion: true,
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('Test data generated successfully!');
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

generateTestData(); 