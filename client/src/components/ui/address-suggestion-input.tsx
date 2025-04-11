import React, { useState, useEffect } from "react";
import { SuggestionInput } from "./suggestion-input";
import { Label } from "./label";

interface AddressSuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function AddressSuggestionInput({
  value,
  onChange,
  suggestions,
  placeholder = "Street address",
  className,
  label,
  helperText,
  disabled = false
}: AddressSuggestionInputProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);
  
  useEffect(() => {
    setFilteredSuggestions(suggestions);
  }, [suggestions]);
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <SuggestionInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        suggestions={filteredSuggestions}
        className={className}
        disabled={disabled}
      />
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}