import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertyDetailsPage from "@/pages/property-details";
import PropertyAnalyticsPage from "@/pages/property-analytics";
import SearchResultsPage from "@/pages/search-results";
import DashboardPage from "@/pages/dashboard";
import NotificationsDemo from "@/pages/notifications-demo";
import PropertyComparisonPage from "@/pages/property-comparison";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { AuthProvider } from "./hooks/use-auth";
import { BubbleNotificationsProvider } from "./hooks/use-bubble-notifications";
import { PropertyComparisonProvider } from "./hooks/use-property-comparison";
import { PropertyNotificationsProvider } from "./hooks/use-property-notifications";
import { useEffect, useState } from "react";
import { handleRedirectResult } from "./lib/firebase";
import { useToast } from "./hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OrganizationSchema } from "./components/seo/schema-markup";
import { Helmet } from "react-helmet";
import { OnboardingTourProvider } from "./hooks/use-onboarding-tour";

function AppContent() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/property/:id" component={PropertyDetailsPage} />
          <Route path="/property/:id/analytics" component={PropertyAnalyticsPage} />
          <Route path="/property-comparison" component={PropertyComparisonPage} />
          <Route path="/search" component={SearchResultsPage} />
          <Route path="/notifications-demo" component={NotificationsDemo} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

function FirebaseAuthHandler({ children }: { children: React.ReactNode }) {
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          toast({
            title: "Firebase authentication successful",
            description: "Please wait while we sign you in...",
          });
        }
      } catch (error) {
        console.error("Firebase redirect error:", error);
        toast({
          title: "Authentication failed",
          description: "Could not complete authentication with social provider.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingRedirect(false);
      }
    };
    
    checkRedirectResult();
  }, [toast]);
  
  if (isCheckingRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Checking authentication status...</span>
      </div>
    );
  }
  
  return <>{children}</>;
}

function App() {
  // Base URL for organization schema
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://foundation.com';
  const logoUrl = `${baseUrl}/logo.png`; // Assuming a logo in the public folder

  return (
    <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
      <FirebaseAuthHandler>
        <AuthProvider>
          <PropertyNotificationsProvider maxNotifications={10}>
            <OnboardingTourProvider>
              <PropertyComparisonProvider maxProperties={4}>
              {/* Global SEO */}
              <Helmet>
                <html lang="en" />
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#4f46e5" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo192.png" />
                
                {/* Default meta tags, will be overridden by page-specific ones */}
                <title>Foundation - Modern Real Estate Platform</title>
                <meta name="description" content="A modern real estate platform for finding your dream home. Browse listings, connect with agents, and discover properties that match your needs." />
                
                {/* Default Open Graph */}
                <meta property="og:site_name" content="Foundation" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={baseUrl} />
                <meta property="og:title" content="Foundation - Modern Real Estate Platform" />
                <meta property="og:description" content="Find your dream home with Foundation's intelligent real estate platform. Personalized recommendations, comprehensive property details, and easy communication with agents." />
                
                {/* Default Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@foundation" />
              </Helmet>
              
              {/* Global Organization Schema */}
              <OrganizationSchema 
                baseUrl={baseUrl}
                logoUrl={logoUrl}
                name="Foundation Real Estate"
              />
              
              <AppContent />
            </PropertyComparisonProvider>
            </OnboardingTourProvider>
          </PropertyNotificationsProvider>
        </AuthProvider>
      </FirebaseAuthHandler>
    </BubbleNotificationsProvider>
  );
}

export default App;
