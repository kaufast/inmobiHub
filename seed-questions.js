// Simple script to run the seed function
import { seedSuggestedQuestions } from './server/seeds/suggested-questions.js';

async function main() {
  try {
    console.log('Starting to seed suggested questions...');
    const result = await seedSuggestedQuestions();
    console.log('Seed result:', result);
    
    if (result.success) {
      console.log(`✅ Successfully seeded ${result.count} suggested questions`);
    } else {
      console.error(`❌ Failed to seed suggested questions: ${result.error}`);
    }
  } catch (error) {
    console.error('Error running seed:', error);
  }
  process.exit(0);
}

main();