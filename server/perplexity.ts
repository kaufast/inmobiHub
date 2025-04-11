import { Property } from '@shared/schema';

// Check for the Perplexity API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.warn("PERPLEXITY_API_KEY is not set in the environment variables");
}

// Type for chat messages
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Define the response type from Perplexity API
interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Handles chat messages using Perplexity's API
 * @param message The user's message
 * @param chatHistory Previous messages in the conversation
 * @param propertyContext Optional property data to provide context
 * @returns The AI's response
 */
export async function handleChatWithPerplexity(
  message: string,
  chatHistory: Message[] = [],
  propertyContext?: Property
): Promise<string> {
  try {
    // System message that provides context and instructions for the AI
    const systemMessage = {
      role: 'system',
      content: `You are a helpful and knowledgeable real estate assistant for our platform called Inmobi.
You provide information about properties, real estate trends, and advice to potential buyers.
Your responses should be friendly, professional, concise, and informative.
You should avoid making up specific details about properties that you don't know about.
When asked about property specifics, only use the information provided to you.
${propertyContext ? `
I'm going to give you information about a specific property that the user is viewing:
Property ID: ${propertyContext.id}
Title: ${propertyContext.title}
Price: $${propertyContext.price.toLocaleString()}
Address: ${propertyContext.address}, ${propertyContext.city}, ${propertyContext.state} ${propertyContext.zipCode}
Type: ${propertyContext.propertyType || 'Not specified'}
Bedrooms: ${propertyContext.bedrooms || 'Not specified'}
Bathrooms: ${propertyContext.bathrooms || 'Not specified'}
Square Feet: ${propertyContext.squareFeet || 'Not specified'}
Year Built: ${propertyContext.yearBuilt || 'Not specified'}
Description: ${propertyContext.description}

When the user asks about this property, use this information to answer their questions accurately.` : ''}`
    };

    // Format the messages for Perplexity API
    const formattedMessages = [
      systemMessage,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Make the request to Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: formattedMessages,
        temperature: 0.2,
        max_tokens: 500,
        top_p: 0.9,
        search_recency_filter: 'month',
        stream: false,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityResponse = await response.json();
    
    // Extract the AI's response
    const aiContent = data.choices[0]?.message?.content;
    
    // Include citations if available
    let formattedResponse = aiContent || "I couldn't generate a proper response. Please try again.";
    
    // Add citations if present
    if (data.citations && data.citations.length > 0) {
      formattedResponse += "\n\nSources:";
      data.citations.slice(0, 3).forEach((citation, index) => {
        formattedResponse += `\n${index + 1}. ${citation}`;
      });
    }
    
    return formattedResponse;
  } catch (error) {
    console.error("Error in Perplexity chat agent:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}

/**
 * Analyzes an image using Perplexity's API
 * - Note: This is a placeholder as Perplexity doesn't support image analysis directly yet
 * @param imageUrl URL of the image to analyze
 * @returns A description of the real estate properties in the image
 */
export async function analyzeImageWithPerplexity(imageUrl: string): Promise<string> {
  // This is a placeholder for future implementation when Perplexity supports image analysis
  // For now, we'll just return a message explaining the limitation
  return "I'm sorry, our current Perplexity integration doesn't support image analysis yet. Please describe what you're seeing in the image and I'll do my best to help.";
}