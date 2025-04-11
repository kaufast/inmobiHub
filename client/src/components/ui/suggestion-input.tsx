import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
  isTextarea?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function SuggestionInput({
  value,
  onChange,
  suggestions = [],
  placeholder = '',
  className = '',
  maxSuggestions = 4,
  isTextarea = false,
  rows = 5,
  disabled = false,
}: SuggestionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update filtered suggestions when the input value or suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions.slice(0, maxSuggestions)
      );
    }
  }, [suggestions, maxSuggestions]);
  
  // Close suggestions panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Apply suggestion on click
  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };
  
  // Toggle suggestions display
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };
  
  return (
    <div ref={containerRef} className="relative">
      <div className="flex">
        {isTextarea ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn("flex-1 rounded-r-none", className)}
            rows={rows}
            disabled={disabled}
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn("flex-1 rounded-r-none", className)}
            disabled={disabled}
          />
        )}
        
        {suggestions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-l-none border-l-0"
            onClick={toggleSuggestions}
            disabled={disabled}
          >
            {showSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-background rounded-md border border-input shadow-md max-h-[300px] overflow-y-auto">
          <div className="p-2 text-xs text-muted-foreground">Suggestions:</div>
          <ul className="py-1 px-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="cursor-pointer rounded-sm text-sm p-2.5 hover:bg-accent flex items-start gap-2"
                onClick={() => applySuggestion(suggestion)}
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary opacity-70" />
                <span className={isTextarea ? "whitespace-normal" : "truncate"}>
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}