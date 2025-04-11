import { db } from '../db';
import { suggestedQuestions } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed data for suggested questions in different categories and for different property types
 */
export async function seedSuggestedQuestions() {
  try {
    console.log('Starting to seed suggested questions...');
    
    // Clear existing questions (optional, comment out if you want to keep existing ones)
    await db.delete(suggestedQuestions).execute();
    console.log('Cleared existing suggested questions');
    
    // Define suggested questions by category
    const questionSeedData = [
      // Pricing Questions
      {
        question: "What factors affect property prices in this area?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "How have property values changed in this neighborhood in the last 5 years?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "What is the average price per square foot in this area?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "Is this property fairly priced compared to similar ones?",
        category: "pricing",
        isGeneralQuestion: false,
        displayOrder: 70,
        propertyType: "house"
      },
      {
        question: "What's the typical ROI for investment properties in this area?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Property Features
      {
        question: "What are the most important features buyers look for?",
        category: "features",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "What upgrades would add the most value to this property?",
        category: "features",
        isGeneralQuestion: false,
        displayOrder: 90
      },
      {
        question: "How energy efficient are homes in this area?",
        category: "features",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "What smart home features are most valued in the market now?",
        category: "features",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "What are the typical amenities in luxury condos?",
        category: "features",
        propertyType: "condo",
        isGeneralQuestion: false,
        displayOrder: 60
      },
      
      // Neighborhood Info
      {
        question: "What's the walkability score of this neighborhood?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "What are the best schools in this area?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "Is crime a concern in this neighborhood?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "What shopping and dining options are nearby?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "How is the public transportation in this area?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Financing & Mortgages
      {
        question: "What mortgage options are available for first-time buyers?",
        category: "financing",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "How much down payment is typically needed?",
        category: "financing",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "What are current mortgage rates?",
        category: "financing",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "Are there any government programs for homebuyers in Mexico?",
        category: "financing",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "What credit score is needed for the best mortgage rates?",
        category: "financing",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Buying/Selling Process
      {
        question: "What are the steps to buying a property in Mexico?",
        category: "process",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "How long does the closing process usually take?",
        category: "process",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "What documents do I need to sell my property?",
        category: "process",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "What inspections should be done before buying?",
        category: "process",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "How do I know if a property has a clean title?",
        category: "process",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Legal Questions
      {
        question: "What are the property taxes in this area?",
        category: "legal",
        isGeneralQuestion: true,
        displayOrder: 100
      },
      {
        question: "Are there any restrictions on foreign buyers in Mexico?",
        category: "legal",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "What should be included in a purchase agreement?",
        category: "legal",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "How does the fideicomiso (bank trust) work for foreigners?",
        category: "legal",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "What are the closing costs when buying property?",
        category: "legal",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Scheduling & Tours
      {
        question: "How can I schedule a tour of this property?",
        category: "scheduling",
        isGeneralQuestion: false,
        displayOrder: 100
      },
      {
        question: "Do you offer virtual tours?",
        category: "scheduling",
        isGeneralQuestion: true,
        displayOrder: 90
      },
      {
        question: "How many properties should I tour before making a decision?",
        category: "scheduling",
        isGeneralQuestion: true,
        displayOrder: 80
      },
      {
        question: "What should I look for during a property tour?",
        category: "scheduling",
        isGeneralQuestion: true,
        displayOrder: 70
      },
      {
        question: "Can I bring a home inspector to the tour?",
        category: "scheduling",
        isGeneralQuestion: true,
        displayOrder: 60
      },
      
      // Property Type Specific - House
      {
        question: "What are common issues in older houses I should look for?",
        category: "features",
        propertyType: "house",
        isGeneralQuestion: false,
        displayOrder: 100
      },
      {
        question: "How much does home maintenance typically cost annually?",
        category: "features",
        propertyType: "house",
        isGeneralQuestion: false,
        displayOrder: 90
      },
      {
        question: "What's the average lot size in this neighborhood?",
        category: "features",
        propertyType: "house",
        isGeneralQuestion: false,
        displayOrder: 80
      },
      
      // Property Type Specific - Condo
      {
        question: "What do the HOA fees cover in this building?",
        category: "features",
        propertyType: "condo",
        isGeneralQuestion: false,
        displayOrder: 100
      },
      {
        question: "Are there any special assessments planned?",
        category: "features",
        propertyType: "condo",
        isGeneralQuestion: false,
        displayOrder: 90
      },
      {
        question: "What are the condo association rules?",
        category: "features",
        propertyType: "condo",
        isGeneralQuestion: false,
        displayOrder: 80
      },
      
      // Property Type Specific - Apartment
      {
        question: "What's the typical lease length for apartments?",
        category: "features",
        propertyType: "apartment",
        isGeneralQuestion: false,
        displayOrder: 100
      },
      {
        question: "Are utilities included in the rent?",
        category: "features",
        propertyType: "apartment",
        isGeneralQuestion: false,
        displayOrder: 90
      },
      {
        question: "What's the process for maintenance requests?",
        category: "features",
        propertyType: "apartment",
        isGeneralQuestion: false,
        displayOrder: 80
      },
      
      // Investment Specific
      {
        question: "What's the average cap rate for rental properties in this area?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 50
      },
      {
        question: "What types of properties have the best rental yields?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 40
      },
      {
        question: "Which neighborhoods are seeing the most appreciation?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 50
      },
      
      // Mexico Specific
      {
        question: "What are the best beach areas for investment in Mexico?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 40
      },
      {
        question: "How does the Mexican real estate market compare to the US?",
        category: "pricing",
        isGeneralQuestion: true,
        displayOrder: 30
      },
      {
        question: "What are the emerging real estate markets in Mexico?",
        category: "neighborhood",
        isGeneralQuestion: true,
        displayOrder: 30
      }
    ];
    
    // Insert seed data
    for (const question of questionSeedData) {
      await db.insert(suggestedQuestions).values({
        ...question,
        isActive: true,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log(`Successfully seeded ${questionSeedData.length} suggested questions`);
    return { success: true, count: questionSeedData.length };
  } catch (error) {
    console.error('Error seeding suggested questions:', error);
    return { success: false, error: (error as Error).message };
  }
}

// For direct execution of this file
if (require.main === module) {
  seedSuggestedQuestions()
    .then(() => {
      console.log('Suggested questions seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during suggested questions seeding:', error);
      process.exit(1);
    });
}