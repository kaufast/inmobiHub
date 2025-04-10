import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

// Tour steps for different pages
const homeTourSteps: Step[] = [
  {
    target: ".navbar-logo",
    content: "Welcome to Inmobi! This is our modern real estate platform that helps you find your dream property.",
    title: "Welcome to Inmobi",
    disableBeacon: true,
  },
  {
    target: ".search-container",
    content: "Use our advanced search to find properties that match your criteria. Filter by location, price, property type, and more.",
    title: "Property Search",
  },
  {
    target: ".map-container",
    content: "Explore properties visually on our interactive map. Click on markers to see property details.",
    title: "Interactive Map",
  },
  {
    target: ".featured-properties",
    content: "Browse our featured properties that might interest you. Click on any property card to view detailed information.",
    title: "Featured Properties",
  },
  {
    target: ".notification-bell",
    content: "Get real-time notifications about new properties that match your preferences.",
    title: "Real-time Notifications",
  },
  {
    target: ".property-comparison-button",
    content: "Compare different properties side-by-side to make informed decisions.",
    title: "Property Comparison",
  },
];

const propertyDetailsTourSteps: Step[] = [
  {
    target: ".property-gallery",
    content: "View high-quality images of the property. Click to see a larger version.",
    title: "Property Gallery",
    disableBeacon: true,
  },
  {
    target: ".property-info",
    content: "Here you'll find all the essential details about the property including price, size, and features.",
    title: "Property Information",
  },
  {
    target: ".property-actions",
    content: "Add to favorites, share, or request more information about this property.",
    title: "Property Actions",
  },
  {
    target: ".neighborhood-section",
    content: "Learn about the neighborhood, including nearby amenities, safety information, and market trends.",
    title: "Neighborhood Information",
  },
  {
    target: ".contact-agent",
    content: "Contact the listing agent directly to schedule a viewing or ask questions.",
    title: "Contact Agent",
  },
];

const dashboardTourSteps: Step[] = [
  {
    target: ".dashboard-sidebar",
    content: "Navigate between different sections of your dashboard using this sidebar menu.",
    title: "Dashboard Navigation",
    disableBeacon: true,
  },
  {
    target: ".user-properties",
    content: "Manage your property listings - add new ones, edit existing ones, or remove listings.",
    title: "Your Properties",
  },
  {
    target: ".saved-searches",
    content: "Access your saved searches to quickly find properties you're interested in.",
    title: "Saved Searches",
  },
  {
    target: ".favorites-section",
    content: "View and manage properties you've marked as favorites.",
    title: "Favorites",
  },
  {
    target: ".messages-section",
    content: "Communicate with agents and property owners through our messaging system.",
    title: "Messages",
  },
  {
    target: ".subscription-info",
    content: "Manage your subscription level to access premium features and listings.",
    title: "Subscription",
  },
];

interface TourContextType {
  run: boolean;
  steps: Step[];
  startTour: (tourType: TourType) => void;
  stopTour: () => void;
}

type TourType = 'home' | 'propertyDetails' | 'dashboard' | 'custom';

interface TourProviderProps {
  children: ReactNode;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const OnboardingTourProvider = ({ children }: TourProviderProps) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourCompleted, setTourCompleted] = useState(() => {
    const completed = localStorage.getItem('tourCompleted');
    return completed ? JSON.parse(completed) : {};
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  // Auto-start tour on initial visit
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    if (isFirstVisit) {
      // Set as visited
      localStorage.setItem('hasVisitedBefore', 'true');
      
      // Delay tour start to ensure page has fully loaded
      const timer = setTimeout(() => {
        startTour('home');
        toast({
          title: t("tour.welcomeTitle"),
          description: t("tour.welcomeMessage"),
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [toast, t]);

  const handleCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Mark current tour as completed
      if (status === STATUS.FINISHED) {
        const updatedTourCompleted = { ...tourCompleted };
        
        if (steps === homeTourSteps) {
          updatedTourCompleted.home = true;
        } else if (steps === propertyDetailsTourSteps) {
          updatedTourCompleted.propertyDetails = true;
        } else if (steps === dashboardTourSteps) {
          updatedTourCompleted.dashboard = true;
        }
        
        setTourCompleted(updatedTourCompleted);
        localStorage.setItem('tourCompleted', JSON.stringify(updatedTourCompleted));
        
        toast({
          title: t("tour.completedTitle"),
          description: t("tour.completedMessage"),
        });
      }
    }
  };

  const startTour = useCallback((tourType: TourType, customSteps?: Step[]) => {
    // Check if tour was already completed
    if (tourType !== 'custom' && tourCompleted[tourType]) {
      return;
    }
    
    // Set the appropriate steps based on tour type
    switch (tourType) {
      case 'home':
        setSteps(homeTourSteps);
        break;
      case 'propertyDetails':
        setSteps(propertyDetailsTourSteps);
        break;
      case 'dashboard':
        setSteps(dashboardTourSteps);
        break;
      case 'custom':
        if (customSteps && customSteps.length > 0) {
          setSteps(customSteps);
        } else {
          console.error('Custom tour requires steps');
          return;
        }
        break;
    }
    
    setRun(true);
  }, [tourCompleted]);

  const stopTour = useCallback(() => {
    setRun(false);
  }, []);

  return (
    <TourContext.Provider value={{ run, steps, startTour, stopTour }}>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleCallback}
        styles={{
          options: {
            arrowColor: 'var(--primary)',
            backgroundColor: 'var(--background)',
            primaryColor: 'var(--primary)',
            textColor: 'var(--foreground)',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 'var(--radius)',
            fontSize: '15px',
          },
          buttonNext: {
            backgroundColor: 'var(--primary)',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: 'var(--muted-foreground)',
            fontSize: '14px',
            marginRight: '10px',
          },
        }}
        locale={{
          back: t("tour.back"),
          close: t("tour.close"),
          last: t("tour.finish"),
          next: t("tour.next"),
          skip: t("tour.skip"),
        }}
      />
      {children}
    </TourContext.Provider>
  );
};

export const useOnboardingTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useOnboardingTour must be used within an OnboardingTourProvider');
  }
  return context;
};

// Helper component for custom tours
export const TourTarget = ({ 
  className, 
  children, 
  id 
}: { 
  className?: string; 
  children: ReactNode; 
  id: string;
}) => {
  return (
    <div className={`${className || ''} tour-target-${id}`} data-tour={id}>
      {children}
    </div>
  );
};