import React from 'react';
import { Button } from '@/components/ui/button';
import { SuggestedQuestion } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface SuggestedQuestionsProps {
  categoryQuestions: SuggestedQuestion[];
  popularQuestions: SuggestedQuestion[];
  isLoading: boolean;
  onQuestionClick: (question: string, questionId: number) => void;
  propertyType?: string;
  category?: string;
}

export function SuggestedQuestions({
  categoryQuestions,
  popularQuestions,
  isLoading,
  onQuestionClick,
  propertyType,
  category
}: SuggestedQuestionsProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine which questions to show - prioritize category-specific
  const questionsToShow = categoryQuestions.length > 0 
    ? categoryQuestions 
    : popularQuestions;
    
  if (questionsToShow.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 mb-1">
        {categoryQuestions.length > 0 
          ? 'Suggested questions for this category:' 
          : 'Popular questions:'}
      </p>
      <div className="flex flex-wrap gap-2">
        {questionsToShow.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            size="sm"
            className="text-xs py-1 px-3 h-auto bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            onClick={() => onQuestionClick(question.question, question.id)}
          >
            {question.question}
          </Button>
        ))}
      </div>
    </div>
  );
}