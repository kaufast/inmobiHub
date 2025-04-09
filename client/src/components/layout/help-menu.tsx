import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";

export default function HelpMenu() {
  const { t } = useTranslation();
  const { startTour } = useOnboardingTour();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStartTour = () => {
    setIsOpen(false);
    
    // Get current path to determine which tour to start
    const path = window.location.pathname;
    
    // Determine which tour to start based on current location
    if (path === "/") {
      startTour("home");
    } else if (path.startsWith("/property/")) {
      startTour("propertyDetails");
    } else if (path.startsWith("/dashboard")) {
      startTour("dashboard");
    } else {
      // Default to home tour for other pages
      startTour("home");
    }
  };
  
  // Listen for custom events from mobile menu
  useEffect(() => {
    const startTourHandler = () => handleStartTour();
    window.addEventListener('startTour', startTourHandler);
    
    return () => {
      window.removeEventListener('startTour', startTourHandler);
    };
  }, []);
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label={t("common.help")}>
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("common.help")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleStartTour}>
          {t("common.startTour")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open("/faq", "_blank")}>
          {t("common.faq")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open("/contact", "_blank")}>
          {t("common.contactSupport")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}