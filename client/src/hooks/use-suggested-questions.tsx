import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SuggestedQuestion } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

interface UseSuggestedQuestionsReturn {
  questions: SuggestedQuestion[];
  popularQuestions: SuggestedQuestion[];
  isLoading: boolean;
  error: Error | null;
  incrementQuestionClick: (questionId: number) => void;
}

/**
 * Hook to fetch suggested questions for the chat widget
 */
export function useSuggestedQuestions(
  category?: string,
  propertyType?: string,
): UseSuggestedQuestionsReturn {
  // Fetch category-based questions
  const {
    data: categoryQuestions = [],
    isLoading: isCategoryQuestionsLoading,
    error: categoryQuestionsError,
  } = useQuery<SuggestedQuestion[], Error>({
    queryKey: ['/api/suggested-questions', category, propertyType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (propertyType) params.append('propertyType', propertyType);
      
      const response = await fetch(`/api/suggested-questions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggested questions');
      }
      
      return response.json();
    },
    enabled: !!category, // Only fetch when category is provided
  });

  // Fetch popular questions (separate endpoint)
  const {
    data: popularQuestionsData = [],
    isLoading: isPopularQuestionsLoading,
    error: popularQuestionsError,
  } = useQuery<SuggestedQuestion[], Error>({
    queryKey: ['/api/suggested-questions/popular'],
    queryFn: async () => {
      const response = await fetch('/api/suggested-questions/popular');
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular questions');
      }
      
      return response.json();
    },
  });

  // Mutation to increment question click count
  const incrementClickMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await fetch(`/api/suggested-questions/${questionId}/click`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question click count');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({queryKey: ['/api/suggested-questions/popular']});
    },
  });

  const isLoading = isCategoryQuestionsLoading || isPopularQuestionsLoading;
  const error = categoryQuestionsError || popularQuestionsError || null;

  // Function to handle incrementing click count
  const incrementQuestionClick = (questionId: number) => {
    incrementClickMutation.mutate(questionId);
  };

  return {
    questions: categoryQuestions,
    popularQuestions: popularQuestionsData,
    isLoading,
    error,
    incrementQuestionClick,
  };
}