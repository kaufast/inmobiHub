import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  isTextarea?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function SuggestionInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  isTextarea = false,
  rows = 4,
  disabled = false
}: SuggestionInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Filter suggestions based on input value
  useEffect(() => {
    if (!value) {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(
        suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value, suggestions]);
  
  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Don't hide immediately to allow for click on suggestion
    setTimeout(() => {
      if (!isFocused) {
        setShowSuggestions(false);
      }
    }, 150);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeSuggestion < filteredSuggestions.length - 1) {
        setActiveSuggestion(activeSuggestion + 1);
      }
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeSuggestion > 0) {
        setActiveSuggestion(activeSuggestion - 1);
      }
    }
    // Enter
    else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      onChange(filteredSuggestions[activeSuggestion]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
    // Escape
    else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };
  
  return (
    <div ref={wrapperRef} className="relative w-full">
      {isTextarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("resize-none", className)}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
      )}
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute mt-1 w-full bg-popover border border-border rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm truncate hover:bg-muted",
                index === activeSuggestion && "bg-muted"
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}