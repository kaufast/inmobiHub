import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressSuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressSuggestionInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Enter address',
  className = '',
  disabled = false,
}: AddressSuggestionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update filtered suggestions
  useEffect(() => {
    if (suggestions.length > 0) {
      // Filter suggestions that include the current value (case insensitive)
      const filtered = value 
        ? suggestions.filter(s => 
            s.toLowerCase().includes(value.toLowerCase())
          )
        : suggestions;
      
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);
  
  // Handle clicking outside to close suggestions
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
  
  // Apply selected suggestion
  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };
  
  // Toggle suggestions dropdown
  const toggleSuggestions = () => {
    setShowSuggestions(prev => !prev);
  };
  
  // Focus input and show suggestions
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  return (
    <div ref={containerRef} className="relative">
      <div className="flex">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn("flex-1 rounded-r-none", className)}
          disabled={disabled}
        />
        
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
          <div className="p-2 text-xs text-muted-foreground">Address Suggestions:</div>
          <ul className="py-1 px-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="cursor-pointer rounded-sm text-sm p-2.5 hover:bg-accent flex items-start gap-2"
                onClick={() => applySuggestion(suggestion)}
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary opacity-70" />
                <span className="truncate">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}