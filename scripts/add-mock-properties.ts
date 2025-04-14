import { db } from "../server/db";
import { properties, users } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

const mockProperties = [
  {
    title: "Modern Downtown Condo",
    description: "Stunning modern condo in the heart of downtown with panoramic city views. Features floor-to-ceiling windows, high-end finishes, and access to building amenities including pool, gym, and 24/7 concierge.",
    price: 750000,
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    propertyType: "condo",
    yearBuilt: 2018,
    isPremium: true,
    features: ["Pool", "Gym", "Concierge", "Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-603b3fc3ddc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 95,
    ownerId: 1
  },
  {
    title: "Luxury Hillside Mansion",
    description: "Exquisite hillside mansion with breathtaking views of the bay. Features a gourmet kitchen, home theater, wine cellar, and expansive outdoor living spaces with infinity pool.",
    price: 4500000,
    address: "456 Hillside Dr",
    city: "San Francisco",
    state: "CA",
    zipCode: "94123",
    latitude: 37.8024,
    longitude: -122.4058,
    bedrooms: 5,
    bathrooms: 6,
    squareFeet: 8000,
    propertyType: "house",
    yearBuilt: 2015,
    isPremium: true,
    features: ["Pool", "Home Theater", "Wine Cellar", "Smart Home", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: 15000,
    garageSpaces: 3,
    listingType: "sale",
    locationScore: 98,
    ownerId: 1
  },
  {
    title: "Charming Victorian Home",
    description: "Beautifully restored Victorian home in a historic neighborhood. Features original architectural details, modern updates, and a lovely garden. Walking distance to shops and restaurants.",
    price: 1200000,
    address: "789 Victorian Ln",
    city: "San Francisco",
    state: "CA",
    zipCode: "94110",
    latitude: 37.7508,
    longitude: -122.4155,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 2200,
    propertyType: "house",
    yearBuilt: 1890,
    isPremium: false,
    features: ["Garden", "Hardwood Floors", "Fireplace", "Original Details"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: 5000,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 92,
    ownerId: 1
  },
  {
    title: "Waterfront Apartment",
    description: "Luxurious waterfront apartment with stunning bay views. Features modern appliances, in-unit laundry, and access to building amenities including pool and fitness center.",
    price: 850000,
    address: "101 Bay View Dr",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    latitude: 37.7946,
    longitude: -122.3940,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 900,
    propertyType: "apartment",
    yearBuilt: 2019,
    isPremium: true,
    features: ["Water View", "Pool", "Fitness Center", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 96,
    ownerId: 1
  },
  {
    title: "Modern Townhouse",
    description: "Contemporary townhouse in a vibrant neighborhood. Features open floor plan, rooftop deck, and smart home technology. Close to public transportation and local amenities.",
    price: 950000,
    address: "202 Urban St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 1800,
    propertyType: "townhouse",
    yearBuilt: 2017,
    isPremium: false,
    features: ["Rooftop Deck", "Smart Home", "Parking", "Modern Design"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: 2000,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 90,
    ownerId: 1
  },
  {
    title: "Luxury Penthouse",
    description: "Spectacular penthouse with 360-degree city views. Features high-end finishes, private elevator, and expansive outdoor terrace. Includes access to building amenities.",
    price: 3500000,
    address: "303 Skyline Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 4,
    bathrooms: 5,
    squareFeet: 4000,
    propertyType: "condo",
    yearBuilt: 2020,
    isPremium: true,
    features: ["Private Elevator", "Terrace", "Smart Home", "Concierge", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 2,
    listingType: "sale",
    locationScore: 99,
    ownerId: 1
  },
  {
    title: "Historic Loft",
    description: "Spacious loft in a converted historic building. Features exposed brick, high ceilings, and large windows. Located in a trendy neighborhood with great restaurants and shops.",
    price: 1200000,
    address: "404 Industrial Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 2000,
    propertyType: "condo",
    yearBuilt: 1920,
    isPremium: false,
    features: ["Exposed Brick", "High Ceilings", "Open Floor Plan", "Historic Building"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 88,
    ownerId: 1
  },
  {
    title: "Garden Cottage",
    description: "Charming garden cottage with private outdoor space. Features updated kitchen and bathroom, hardwood floors, and plenty of natural light. Perfect for those seeking a peaceful retreat.",
    price: 850000,
    address: "505 Garden Way",
    city: "San Francisco",
    state: "CA",
    zipCode: "94117",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 1200,
    propertyType: "house",
    yearBuilt: 1940,
    isPremium: false,
    features: ["Garden", "Hardwood Floors", "Updated Kitchen", "Private Outdoor Space"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: 3000,
    garageSpaces: 1,
    listingType: "sale",
    locationScore: 85,
    ownerId: 1
  },
  {
    title: "Modern Studio",
    description: "Elegant studio apartment in a prime location. Features modern design, efficient layout, and access to building amenities. Perfect for urban living.",
    price: 550000,
    address: "606 Urban Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 600,
    propertyType: "apartment",
    yearBuilt: 2018,
    isPremium: false,
    features: ["Modern Design", "Efficient Layout", "Building Amenities", "Prime Location"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 0,
    listingType: "sale",
    locationScore: 92,
    ownerId: 1
  },
  {
    title: "Luxury Apartment",
    description: "Sophisticated apartment in a prestigious building. Features high-end finishes, gourmet kitchen, and access to premium amenities including pool, spa, and fitness center.",
    price: 1800000,
    address: "707 Luxury Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94108",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2500,
    propertyType: "apartment",
    yearBuilt: 2019,
    isPremium: true,
    features: ["Pool", "Spa", "Fitness Center", "Gourmet Kitchen", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    lotSize: null,
    garageSpaces: 2,
    listingType: "sale",
    locationScore: 97,
    ownerId: 1
  }
];

async function addMockProperties() {
  try {
    // Get the test user by username
    const [user] = await db.select().from(users).where(eq(users.username, "testuser"));
    
    if (!user) {
      console.error("Test user not found. Please run add-test-user.ts first.");
      return;
    }

    // Add the mock properties
    for (const property of mockProperties) {
      await db.insert(properties).values({
        ...property,
        ownerId: user.id, // Use the found user's ID
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log("Successfully added 10 mock properties!");
  } catch (error) {
    console.error("Error adding mock properties:", error);
  }
}

addMockProperties(); 