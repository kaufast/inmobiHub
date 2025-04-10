import { Button } from '@/components/ui/button';
import { SuggestedQuestion } from '@shared/schema';
import { HelpCircle, TrendingUp, Tag } from 'lucide-react';

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
  // No questions available
  if (!isLoading && categoryQuestions.length === 0 && popularQuestions.length === 0) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="my-2">
        <div className="flex items-center gap-1 mb-2">
          <HelpCircle size={14} className="text-primary/70" />
          <span className="text-xs text-gray-400">Loading suggested questions...</span>
        </div>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-700 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-2">
      {/* Category-specific questions */}
      {categoryQuestions.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <Tag size={14} className="text-primary/70" />
            <span className="text-xs text-gray-400">
              Suggested questions {category ? `about ${category}` : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {categoryQuestions.map((question) => (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                className="text-xs py-0 h-auto bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200"
                onClick={() => onQuestionClick(question.question, question.id)}
              >
                {question.question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Popular questions */}
      {popularQuestions.length > 0 && categoryQuestions.length === 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp size={14} className="text-primary/70" />
            <span className="text-xs text-gray-400">Popular questions</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {popularQuestions.map((question) => (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                className="text-xs py-0 h-auto bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200"
                onClick={() => onQuestionClick(question.question, question.id)}
              >
                {question.question}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}