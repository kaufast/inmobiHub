import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import PropertyComparison from "@/components/properties/property-comparison";

interface PropertyComparisonContextType {
  compareIds: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearComparison: () => void;
  isInComparison: (id: number) => boolean;
  openComparisonModal: () => void;
  closeComparisonModal: () => void;
}

export const PropertyComparisonContext = createContext<PropertyComparisonContextType | undefined>(
  undefined
);

export interface PropertyComparisonProviderProps {
  children: ReactNode;
  maxProperties?: number;
}

export function PropertyComparisonProvider({
  children,
  maxProperties = 4,
}: PropertyComparisonProviderProps) {
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const { toast } = useToast();

  const addToCompare = useCallback(
    (id: number) => {
      if (compareIds.includes(id)) {
        toast({
          title: "Already in comparison",
          description: "This property is already in your comparison list",
        });
        return;
      }

      if (compareIds.length >= maxProperties) {
        toast({
          title: "Comparison limit reached",
          description: `You can compare up to ${maxProperties} properties at once`,
          variant: "destructive",
        });
        return;
      }

      setCompareIds((prev) => [...prev, id]);
      toast({
        title: "Added to comparison",
        description: "Property added to your comparison list",
      });
    },
    [compareIds, maxProperties, toast]
  );

  const removeFromCompare = useCallback(
    (id: number) => {
      setCompareIds((prev) => prev.filter((prevId) => prevId !== id));
      toast({
        title: "Removed from comparison",
        description: "Property removed from your comparison list",
      });
    },
    [toast]
  );

  const clearComparison = useCallback(() => {
    setCompareIds([]);
    toast({
      title: "Comparison cleared",
      description: "All properties have been removed from comparison",
    });
  }, [toast]);

  const isInComparison = useCallback(
    (id: number) => compareIds.includes(id),
    [compareIds]
  );

  const openComparisonModal = useCallback(() => {
    if (compareIds.length === 0) {
      toast({
        title: "No properties to compare",
        description: "Add properties to your comparison list first",
      });
      return;
    }
    setIsComparisonOpen(true);
  }, [compareIds, toast]);

  const closeComparisonModal = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  // Create an internal comparison button to avoid circular dependencies
  const InternalCompareButton = () => {
    if (compareIds.length === 0) {
      return null;
    }
    
    return (
      <button 
        onClick={openComparisonModal}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-md shadow-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        Compare {compareIds.length} {compareIds.length === 1 ? "Property" : "Properties"}
      </button>
    );
  };

  return (
    <PropertyComparisonContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isInComparison,
        openComparisonModal,
        closeComparisonModal,
      }}
    >
      {children}
      <InternalCompareButton />
      {isComparisonOpen && (
        <PropertyComparison
          propertyIds={compareIds}
          onClose={closeComparisonModal}
        />
      )}
    </PropertyComparisonContext.Provider>
  );
}

export function usePropertyComparison() {
  const context = useContext(PropertyComparisonContext);
  if (context === undefined) {
    throw new Error(
      "usePropertyComparison must be used within a PropertyComparisonProvider"
    );
  }
  return context;
}