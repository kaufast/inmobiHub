import { seedSuggestedQuestions } from './suggested-questions';

async function runAllSeeds() {
  try {
    console.log('Starting database seed process...');
    
    // Run suggested questions seed
    const suggestedQuestionsResult = await seedSuggestedQuestions();
    console.log('Suggested questions seed result:', suggestedQuestionsResult);
    
    // Add additional seed functions here as needed
    
    console.log('All seed operations completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  runAllSeeds()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during database seeding:', error);
      process.exit(1);
    });
}

export { runAllSeeds };