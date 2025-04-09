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
/**
 * Generate smart property recommendations based on user preferences and behavior
 * @param user User to generate recommendations for
 * @param properties All available properties
 * @param searchHistory User's search history
 * @param favoritedProperties Properties the user has favorited
 * @param limit Number of recommendations to return
 * @returns Array of recommended properties with personalized reasons
 */
export async function generatePropertyRecommendations(
  user: User,
  properties: Property[],
  searchHistory: SearchProperties[] = [],
  favoritedProperties: Property[] = [],
  limit: number = 5
): Promise<{ property: Property; reason: string }[]> {
  try {
    // Create an enhanced user profile based on search history and favorited properties
    const userProfile = createUserProfile(user, searchHistory, favoritedProperties);

    // Create a detailed representation of properties for the AI to process
    const detailedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: {
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        fullLocation: `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`
      },
      specifications: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet,
        propertyType: property.propertyType,
        yearBuilt: property.yearBuilt
      },
      amenities: {
        features: property.features,
        hasParking: property.features?.includes('Parking') || property.features?.includes('Garage') || false,
        hasPool: property.features?.includes('Pool') || false,
        hasGarden: property.features?.includes('Garden') || property.features?.includes('Backyard') || false,
        isNewConstruction: property.yearBuilt ? new Date().getFullYear() - property.yearBuilt < 5 : false
      },
      financials: {
        price: property.price,
        pricePerSqFt: property.squareFeet ? Math.round(property.price / property.squareFeet) : null,
        isPremium: property.isPremium,
        isInvestmentProperty: property.rentalYield ? true : false,
        estimatedRentalYield: property.rentalYield || null
      },
      images: property.images ? property.images.length : 0,
      listedDate: property.createdAt
    }));

    // Generate recommendations using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI-powered real estate recommendation engine that helps users discover ideal properties based on their preferences and behavior patterns. Your recommendations should be personalized, insightful, and focus on why specific properties would be perfect matches for this particular user.
          
Prioritize these factors when making recommendations:
1. Properties that closely match the user's explicitly searched preferences (location, price range, beds/baths)
2. Properties with features the user has shown interest in through favorited properties
3. Properties that match the user's subscription tier expectations (premium properties for premium subscribers)
4. Properties that represent good value based on price per square foot
5. Properties with unique selling points that align with the user's search patterns`
        },
        {
          role: "user",
          content: `I need property recommendations for a specific user based on their profile data and available properties.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

AVAILABLE PROPERTIES:
${JSON.stringify(detailedProperties, null, 2)}

Please recommend exactly ${limit} properties that would be most suitable for this user. For each recommendation, provide:
1. The property ID
2. A brief but personalized reason (2-3 sentences) explaining why this property is an excellent match for this specific user based on their preferences, search history, and behavior patterns.

Format your response as a JSON object with a single "recommendations" array containing objects with "propertyId" (number) and "reason" (string) fields.`
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
      return { 
        property, 
        reason: rec.reason 
      };
    }).filter(Boolean);

    return result.slice(0, limit);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Fallback: return random properties if AI fails
    return properties
      .slice(0, limit)
      .map(property => ({ 
        property, 
        reason: "This property may match your preferences based on your browsing history." 
      }));
  }
}

/**
 * Creates a user profile based on their search history and favorited properties
 */
/**
 * Creates a user profile based on their search history, favorited properties and user data
 * @param user User data from the database 
 * @param searchHistory User's search history
 * @param favoritedProperties Properties the user has favorited
 * @returns A comprehensive user profile for recommendation generation
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
    
  // Weight recent searches more heavily (most recent searches are at the end of the array)
  const recentSearches = searchHistory.slice(-5);
  
  // Extract most frequently searched locations
  const locationCounts: Record<string, number> = {};
  searchHistory.forEach((search, index) => {
    if (search.location) {
      // Give more weight to recent searches
      const weight = index >= searchHistory.length - 5 ? 2 : 1;
      locationCounts[search.location] = (locationCounts[search.location] || 0) + weight;
    }
  });

  // Get top locations
  const preferredLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([location]) => location);

  // Extract bedroom and bathroom preferences with recency bias
  const bedroomPreferences = searchHistory
    .filter(search => search.beds !== undefined && search.beds !== null)
    .map((search, index) => {
      // Apply recency weight
      const weight = index >= searchHistory.length - 5 ? 2 : 1;
      return { value: search.beds, weight };
    });
  
  const bathroomPreferences = searchHistory
    .filter(search => search.baths !== undefined && search.baths !== null)
    .map((search, index) => {
      // Apply recency weight
      const weight = index >= searchHistory.length - 5 ? 2 : 1;
      return { value: search.baths, weight };
    });
    
  // Calculate weighted averages
  let bedroomPreference = null;
  if (bedroomPreferences.length > 0) {
    const totalValue = bedroomPreferences.reduce((sum, item) => sum + (item.value * item.weight), 0);
    const totalWeight = bedroomPreferences.reduce((sum, item) => sum + item.weight, 0);
    bedroomPreference = Math.round(totalValue / totalWeight);
  }
  
  let bathroomPreference = null;
  if (bathroomPreferences.length > 0) {
    const totalValue = bathroomPreferences.reduce((sum, item) => sum + (item.value * item.weight), 0);
    const totalWeight = bathroomPreferences.reduce((sum, item) => sum + item.weight, 0);
    bathroomPreference = Math.round(totalValue / totalWeight * 2) / 2; // Round to nearest 0.5
  }

  // Extract property type preferences with recency bias
  const propertyTypeCounts: Record<string, number> = {};
  searchHistory.forEach((search, index) => {
    if (search.propertyType) {
      // Give more weight to recent searches
      const weight = index >= searchHistory.length - 5 ? 2 : 1;
      propertyTypeCounts[search.propertyType] = (propertyTypeCounts[search.propertyType] || 0) + weight;
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
    
  // Extract square footage preferences
  const squareFootagePreferences = searchHistory
    .filter(search => search.minSquareFeet || search.maxSquareFeet)
    .map(search => ({
      min: search.minSquareFeet || 0,
      max: search.maxSquareFeet || 10000
    }));
    
  // Calculate average min and max square footage if available
  const avgMinSquareFeet = squareFootagePreferences.length
    ? squareFootagePreferences.reduce((sum, range) => sum + range.min, 0) / squareFootagePreferences.length
    : null;
  
  const avgMaxSquareFeet = squareFootagePreferences.length
    ? squareFootagePreferences.reduce((sum, range) => sum + range.max, 0) / squareFootagePreferences.length
    : null;
    
  // Get general property category preferences (luxury, budget, etc.)
  const isPremiumFan = favoritedProperties.filter(p => p.isPremium).length > 
                      (favoritedProperties.length / 2);
                      
  // Calculate average price per square foot of favorited properties
  let avgPricePerSqFt = null;
  if (favoritedProperties.length > 0) {
    const validProperties = favoritedProperties.filter(p => p.price && p.squareFeet);
    if (validProperties.length > 0) {
      avgPricePerSqFt = validProperties.reduce((sum, p) => sum + (p.price / p.squareFeet), 0) / validProperties.length;
    }
  }
  
  // Analyze user browsing history through search parameters
  const recentSearchTerms = recentSearches.flatMap(search => {
    const terms = [];
    if (search.keyword) terms.push(search.keyword);
    if (search.location) terms.push(search.location);
    if (search.propertyType) terms.push(search.propertyType);
    return terms;
  });

  // Build enhanced user profile
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    preferences: {
      price: avgMinPrice !== null && avgMaxPrice !== null
        ? { min: avgMinPrice, max: avgMaxPrice } 
        : null,
      locations: preferredLocations.length ? preferredLocations : null,
      bedrooms: bedroomPreference,
      bathrooms: bathroomPreference,
      squareFeet: avgMinSquareFeet !== null && avgMaxSquareFeet !== null
        ? { min: avgMinSquareFeet, max: avgMaxSquareFeet }
        : null,
      propertyTypes: preferredPropertyTypes.length ? preferredPropertyTypes : null,
      features: preferredFeatures.length ? preferredFeatures : null,
      avgPricePerSqFt,
      premiumPreference: isPremiumFan ? "premium" : "standard",
    },
    activityInsights: {
      favoritedCount: favoritedProperties.length,
      favoritedIds: favoritedProperties.map(p => p.id),
      searchHistoryCount: searchHistory.length,
      recentSearchTerms: recentSearchTerms,
      searchRecency: searchHistory.length > 0 ? "active" : "inactive",
      lastSearch: searchHistory.length > 0 ? searchHistory[searchHistory.length - 1] : null
    },
    userProfile: {
      subscriptionTier: user.subscriptionTier,
      role: user.role,
      accountAge: user.createdAt ? new Date().getTime() - new Date(user.createdAt).getTime() : null,
    }
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