import Anthropic from '@anthropic-ai/sdk';
import { Property } from '@shared/schema';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set in the environment variables");
}

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model to use for chat
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025.
const MODEL = 'claude-3-7-sonnet-20250219';

// Type for chat messages
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Handles chat messages using Anthropic's Claude model
 * @param message The user's message
 * @param chatHistory Previous messages in the conversation
 * @param propertyContext Optional property data to provide context
 * @returns The AI's response
 */
export async function handleChatMessage(
  message: string,
  chatHistory: Message[] = [],
  propertyContext?: Property
): Promise<string> {
  try {
    // System message that provides context and instructions for the AI
    let systemPrompt = `You are a helpful and knowledgeable real estate assistant for our platform called Foundation.
You provide information about properties, real estate trends, and advice to potential buyers.
Your responses should be friendly, professional, concise, and informative.
You should avoid making up specific details about properties that you don't know about.
When asked about property specifics, only use the information provided to you.
`;

    // If property context is provided, add it to the system prompt
    if (propertyContext) {
      systemPrompt += `\nI'm going to give you information about a specific property that the user is viewing:
Property ID: ${propertyContext.id}
Title: ${propertyContext.title}
Price: $${propertyContext.price.toLocaleString()}
Address: ${propertyContext.address}, ${propertyContext.city}, ${propertyContext.state} ${propertyContext.zipCode}
Type: ${propertyContext.propertyType}
Bedrooms: ${propertyContext.bedrooms}
Bathrooms: ${propertyContext.bathrooms}
Square Feet: ${propertyContext.squareFeet}
Year Built: ${propertyContext.yearBuilt}
Description: ${propertyContext.description}

When the user asks about this property, use this information to answer their questions accurately.
`;
    }

    // Format the messages for Anthropic API
    const messages = [
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // Make the request to Anthropic's Claude
    const response = await anthropic.messages.create({
      system: systemPrompt,
      model: MODEL,
      max_tokens: 500,
      messages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : "I couldn't generate a proper response. Please try again.";
  } catch (error) {
    console.error("Error in chat agent:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}

/**
 * Analyzes an image using Claude's multimodal capabilities
 * @param imageData Base64 encoded image data
 * @returns A natural language description of real estate properties in the image
 */
export async function analyzeImage(imageData: string): Promise<string> {
  try {
    // Handle data URI format if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    // Make API request
    const response = await anthropic.messages.create({
      model: MODEL,
      system: `You are a real estate image analysis expert. Your task is to analyze property images 
      and extract key information that would be useful for real estate search. Focus on identifying 
      property type, style, features, condition, and surroundings. Be specific but concise, highlighting 
      the most notable aspects that would be relevant for someone searching for properties.`,
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            },
            {
              type: 'text',
              text: 'Please analyze this real estate property image and describe what you see. Focus on property type, architectural style, notable features, condition, and any distinctive elements that would be relevant for a property search. Provide your analysis in a concise paragraph.'
            }
          ]
        }
      ]
    });
    
    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : "Unable to analyze the image. Please try a different image or use text search.";
      
  } catch (error) {
    console.error('Error analyzing image with Claude:', error);
    throw new Error('Failed to analyze the property image. Please try again or use text search instead.');
  }
}