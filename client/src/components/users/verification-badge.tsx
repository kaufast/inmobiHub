import React from "react";
import { CheckCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: "card" | "profile" | "inline";
  showTooltip?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  variant = "inline",
  showTooltip = true,
}) => {
  // If not verified, show nothing (or pending badge if specified)
  if (!isVerified) {
    if (variant === "profile") {
      return (
        <Badge 
          variant="outline" 
          className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
        >
          Pending
        </Badge>
      );
    }
    return null;
  }

  const renderBadge = () => {
    switch (variant) {
      case "card":
        // Small badge for property cards
        return (
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-0.5">
            <CheckCircle className="h-3 w-3 text-green-700" />
          </div>
        );
      
      case "profile":
        // Larger badge with text for profile pages
        return (
          <Badge 
            variant="outline" 
            className="ml-2 bg-green-100 text-green-800 border-green-300 hover:bg-green-100"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
        
      case "inline":
      default:
        // Standard badge for inline usage
        return (
          <Badge 
            variant="outline" 
            className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
    }
  };

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {renderBadge()}
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <p className="text-sm">
                This user has verified their identity with official documents
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderBadge();
};

export default VerificationBadge;