import { useQuery } from '@tanstack/react-query';
import { SuggestedQuestion } from '@shared/schema';

/**
 * Hook to fetch suggested questions for the chat widget
 */
export function useSuggestedQuestions(
  category?: string,
  propertyType?: string,
  limit: number = 5
) {
  // Get suggested questions filtered by category and/or property type
  const { data: questions, isLoading, error } = useQuery<SuggestedQuestion[]>({
    queryKey: ['/api/suggested-questions', category, propertyType, limit],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (propertyType) params.append('propertyType', propertyType);
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`/api/suggested-questions?${params.toString()}`, { signal });
      if (!response.ok) {
        throw new Error('Failed to fetch suggested questions');
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Get popular suggested questions
  const { data: popularQuestions } = useQuery<SuggestedQuestion[]>({
    queryKey: ['/api/suggested-questions/popular', limit],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`/api/suggested-questions/popular?${params.toString()}`, { signal });
      if (!response.ok) {
        throw new Error('Failed to fetch popular questions');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mark a question as clicked to increase its popularity
  const incrementQuestionClick = async (questionId: number) => {
    try {
      await fetch(`/api/suggested-questions/${questionId}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing question click count:', error);
    }
  };

  return {
    questions: questions || [],
    popularQuestions: popularQuestions || [],
    isLoading,
    error,
    incrementQuestionClick,
  };
}