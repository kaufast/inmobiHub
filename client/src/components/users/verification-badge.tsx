import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: "property-card" | "profile" | "inline";
  showTooltip?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  variant = "inline",
  showTooltip = true,
}) => {
  if (!isVerified) return null;

  // Different styles based on where the badge is being used
  const badgeContent = () => {
    switch (variant) {
      case "property-card":
        return (
          <span className="flex items-center gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3 text-blue-500" />
          </span>
        );
      case "profile":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 px-2 py-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Verified</span>
          </Badge>
        );
      case "inline":
      default:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 text-xs">
            Verified
          </Badge>
        );
    }
  };

  const tooltipContent = "This user's identity has been verified by Inmobi®";

  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent()}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    badgeContent()
  );
};

export default VerificationBadge;