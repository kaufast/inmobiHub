import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface VerificationBadgeProps {
  isVerified?: boolean;
  idVerificationStatus?: VerificationStatus;
  role?: 'user' | 'agent' | 'admin';
  variant?: 'default' | 'property-card' | 'profile';
  showTooltip?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified = false, 
  idVerificationStatus = 'none',
  role = 'user',
  variant = 'default',
  showTooltip = true
}) => {
  // If user is not verified at all, don't show the badge
  if (!isVerified && idVerificationStatus === 'none') {
    return null;
  }

  // Different styles based on verification status
  const getBadgeStyle = () => {
    // Verified user with blue checkmark (highest level)
    if (isVerified) {
      return {
        icon: <CheckCircle className="h-4 w-4 mr-1 text-white" />,
        text: role === 'agent' ? 'Verified Agent' : 'Verified User',
        class: 'bg-blue-500 hover:bg-blue-600 text-white',
        tooltip: 'This user has been officially verified by Inmobi and has verified identity credentials'
      };
    }
    
    // ID verification status badges
    switch (idVerificationStatus) {
      case 'approved':
        return {
          icon: <Shield className="h-4 w-4 mr-1 text-white" />,
          text: 'ID Verified',
          class: 'bg-green-500 hover:bg-green-600 text-white',
          tooltip: 'This user has verified their identity with official documents'
        };
      case 'pending':
        return {
          icon: <AlertCircle className="h-4 w-4 mr-1 text-amber-800" />,
          text: 'Verification Pending',
          class: 'bg-amber-300 hover:bg-amber-400 text-amber-800',
          tooltip: 'This user has submitted verification documents, pending review'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-4 w-4 mr-1 text-white" />,
          text: 'Verification Failed',
          class: 'bg-red-500 hover:bg-red-600 text-white',
          tooltip: 'Identity verification was unsuccessful. Contact support for assistance.'
        };
      default:
        return null;
    }
  };

  const badgeStyle = getBadgeStyle();
  if (!badgeStyle) return null;

  // For property cards, use a more compact badge with just the icon
  if (variant === 'property-card') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`inline-flex px-2 py-0.5 text-xs ${badgeStyle.class}`}>
              {badgeStyle.icon}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{badgeStyle.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For profile pages, use a larger badge
  if (variant === 'profile') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`inline-flex px-3 py-1 text-sm ${badgeStyle.class}`}>
              {badgeStyle.icon}
              <span>{badgeStyle.text}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{badgeStyle.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default badge style
  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`inline-flex items-center px-2 py-0.5 text-xs ${badgeStyle.class}`}>
            {badgeStyle.icon}
            <span>{badgeStyle.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{badgeStyle.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Badge variant="outline" className={`inline-flex items-center px-2 py-0.5 text-xs ${badgeStyle.class}`}>
      {badgeStyle.icon}
      <span>{badgeStyle.text}</span>
    </Badge>
  );
};

export default VerificationBadge;