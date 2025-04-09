import OpenAI from "openai";
import { Property, User, SearchProperties } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Generate property recommendations based on user preferences and search history
 * @param user User to generate recommendations for
 * @param properties All available properties
 * @param searchHistory User's search history
 * @param favoritedProperties Properties the user has favorited
 * @param limit Number of recommendations to return
 * @returns Array of recommended properties with reasons
 */
export async function generatePropertyRecommendations(
  user: User,
  properties: Property[],
  searchHistory: SearchProperties[] = [],
  favoritedProperties: Property[] = [],
  limit: number = 5
): Promise<{ property: Property; reason: string }[]> {
  try {
    // Create a user profile based on search history and favorited properties
    const userProfile = createUserProfile(user, searchHistory, favoritedProperties);

    // Create a simplified version of properties for the AI to process
    const simplifiedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: `${property.city}, ${property.state}`,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType,
      features: property.features,
      isPremium: property.isPremium
    }));

    // Generate recommendations using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate recommendation assistant helping match users with properties they might be interested in based on their preferences and behavior."
        },
        {
          role: "user",
          content: `Based on this user profile: ${JSON.stringify(userProfile)}\n\nRecommend ${limit} properties from this list that would be most suitable for this user: ${JSON.stringify(simplifiedProperties)}\n\nFor each recommendation, provide a brief, personalized reason why it matches their preferences. Respond with a JSON array where each object has 'propertyId', 'reason' fields.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse recommendations from OpenAI
    const recommendations = JSON.parse(response.choices[0].message.content);
    
    // Match recommended property IDs with actual properties
    const result = recommendations.recommendations.map((rec: { propertyId: number; reason: string }) => {
      const property = properties.find(p => p.id === rec.propertyId);
      if (!property) return null;
      return { property, reason: rec.reason };
    }).filter(Boolean);

    return result.slice(0, limit);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Fallback: return random properties if AI fails
    return properties
      .slice(0, limit)
      .map(property => ({ 
        property, 
        reason: "Property may match your preferences" 
      }));
  }
}

/**
 * Creates a user profile based on their search history and favorited properties
 */
function createUserProfile(
  user: User,
  searchHistory: SearchProperties[],
  favoritedProperties: Property[]
) {
  // Extract preferred price range from search history
  const priceRanges = searchHistory
    .filter(search => search.minPrice || search.maxPrice)
    .map(search => ({
      min: search.minPrice || 0,
      max: search.maxPrice || 1000000000
    }));

  // Calculate average min and max price if available
  const avgMinPrice = priceRanges.length
    ? priceRanges.reduce((sum, range) => sum + range.min, 0) / priceRanges.length
    : null;
  
  const avgMaxPrice = priceRanges.length
    ? priceRanges.reduce((sum, range) => sum + range.max, 0) / priceRanges.length
    : null;

  // Extract most frequently searched locations
  const locationCounts: Record<string, number> = {};
  searchHistory.forEach(search => {
    if (search.location) {
      locationCounts[search.location] = (locationCounts[search.location] || 0) + 1;
    }
  });

  // Get top locations
  const preferredLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([location]) => location);

  // Extract bedroom and bathroom preferences
  const bedroomPreferences = searchHistory
    .filter(search => search.beds)
    .map(search => search.beds);
  
  const bathroomPreferences = searchHistory
    .filter(search => search.baths)
    .map(search => search.baths);

  // Extract property type preferences
  const propertyTypeCounts: Record<string, number> = {};
  searchHistory.forEach(search => {
    if (search.propertyType) {
      propertyTypeCounts[search.propertyType] = (propertyTypeCounts[search.propertyType] || 0) + 1;
    }
  });

  // Top property types
  const preferredPropertyTypes = Object.entries(propertyTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([type]) => type);

  // Extract features from favorited properties
  const favoriteFeatures: Record<string, number> = {};
  favoritedProperties.forEach(property => {
    if (property.features) {
      property.features.forEach(feature => {
        favoriteFeatures[feature] = (favoriteFeatures[feature] || 0) + 1;
      });
    }
  });

  // Top favorite features
  const preferredFeatures = Object.entries(favoriteFeatures)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([feature]) => feature);

  // Build user profile
  return {
    userId: user.id,
    username: user.username,
    priceRange: avgMinPrice !== null && avgMaxPrice !== null
      ? { min: avgMinPrice, max: avgMaxPrice } 
      : null,
    preferredLocations: preferredLocations.length ? preferredLocations : null,
    bedroomPreference: bedroomPreferences.length
      ? Math.round(bedroomPreferences.reduce((sum, beds) => sum + beds, 0) / bedroomPreferences.length)
      : null,
    bathroomPreference: bathroomPreferences.length
      ? Math.round(bathroomPreferences.reduce((sum, baths) => sum + baths, 0) / bathroomPreferences.length * 2) / 2 // Round to nearest 0.5
      : null,
    preferredPropertyTypes: preferredPropertyTypes.length ? preferredPropertyTypes : null,
    preferredFeatures: preferredFeatures.length ? preferredFeatures : null,
    // Include favorited property details
    favoritedPropertyCount: favoritedProperties.length,
    favoritedPropertyIds: favoritedProperties.map(p => p.id),
    subscriptionTier: user.subscriptionTier
  };
}

/**
 * Analyze user's search patterns and provide insights
 */
export async function analyzeUserSearchPatterns(
  user: User,
  searchHistory: SearchProperties[]
): Promise<string> {
  if (!searchHistory.length) {
    return "Not enough search data to provide insights.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an analytical assistant that helps real estate platforms understand user search patterns."
        },
        {
          role: "user",
          content: `Analyze this user's search history and provide brief insights about their preferences: ${JSON.stringify(searchHistory)}`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing search patterns:", error);
    return "Unable to analyze search patterns at this time.";
  }
}

/**
 * Generate a personalized property description based on user preferences
 */
export async function generatePersonalizedDescription(
  property: Property,
  user: User
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate copywriter specializing in personalizing property descriptions to match user preferences."
        },
        {
          role: "user",
          content: `Create a personalized description of this property: ${JSON.stringify(property)}\n\nFor this user: ${JSON.stringify(user)}\n\nLimit to 3-4 sentences that highlight aspects of the property that would appeal to this user based on their subscription tier and profile.`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating personalized description:", error);
    return property.description; // Fallback to original description
  }
}