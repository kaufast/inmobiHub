import React from "react";
import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: "card" | "profile" | "inline";
  showTooltip?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  variant = "inline",
  showTooltip = true,
}) => {
  if (!isVerified) {
    return null;
  }

  const renderBadge = () => {
    switch (variant) {
      case "card":
        return (
          <BadgeCheck className="h-3 w-3 text-primary" />
        );
      case "profile":
        return (
          <div className="flex items-center gap-1 bg-primary-50 text-primary py-0.5 px-2 rounded-full text-xs">
            <BadgeCheck className="h-3 w-3" />
            <span>Verified</span>
          </div>
        );
      case "inline":
      default:
        return (
          <BadgeCheck className="h-4 w-4 text-primary" />
        );
    }
  };

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="inline-flex cursor-help">
              {renderBadge()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              This account has been verified by our team,
              <br />
              confirming their identity and credentials.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderBadge();
};

export default VerificationBadge;