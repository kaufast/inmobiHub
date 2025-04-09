import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal, Check, BarChartHorizontal } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { PropertyComparisonContext, usePropertyComparison } from "@/hooks/use-property-comparison";

interface ComparePropertyButtonProps {
  propertyId: number;
  variant?: "default" | "ghost" | "outline" | "link" | null;
  size?: "default" | "sm" | "lg" | "icon" | null;
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function ComparePropertyButton({
  propertyId,
  variant = "outline",
  size = "sm",
  showIcon = true,
  showLabel = true,
  className,
}: ComparePropertyButtonProps) {
  // Access the context directly for greater safety
  const context = useContext(PropertyComparisonContext);
  
  // If context is undefined, just render a dummy button
  if (!context) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        {showIcon && <SplitSquareHorizontal className="h-4 w-4" />}
        {showLabel && <span className={showIcon ? "ml-2" : ""}>Compare</span>}
      </Button>
    );
  }
  
  const { isInComparison, addToCompare, removeFromCompare } = context;
  const inComparison = isInComparison(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to parent elements
    if (inComparison) {
      removeFromCompare(propertyId);
    } else {
      addToCompare(propertyId);
    }
  };

  if (!showIcon && !showLabel) {
    showIcon = true; // Ensure at least one is shown
  }

  const buttonContent = (
    <>
      {showIcon && (
        inComparison 
          ? <Check className={cn("h-4 w-4", !showLabel && "mr-0")} /> 
          : <SplitSquareHorizontal className={cn("h-4 w-4", !showLabel && "mr-0")} />
      )}
      {showLabel && (
        <span className={showIcon ? "ml-2" : ""}>
          {inComparison ? "In Comparison" : "Compare"}
        </span>
      )}
    </>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={inComparison ? "default" : variant}
            size={size}
            onClick={handleClick}
            className={cn(
              inComparison ? "bg-blue-500 text-white hover:bg-blue-600" : "",
              className
            )}
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {inComparison 
            ? "Remove from comparison" 
            : "Add to comparison list"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CompareButton() {
  // Access the context directly
  const context = useContext(PropertyComparisonContext);
  
  // If no context or no properties to compare, don't render anything
  if (!context || context.compareIds.length === 0) {
    return null;
  }
  
  const { compareIds, openComparisonModal } = context;
  const count = compareIds.length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={openComparisonModal}
            className="fixed bottom-4 left-4 z-50 shadow-md bg-blue-500 hover:bg-blue-600"
          >
            <BarChartHorizontal className="h-4 w-4 mr-2" />
            Compare {count} {count === 1 ? "Property" : "Properties"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Open comparison view
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}