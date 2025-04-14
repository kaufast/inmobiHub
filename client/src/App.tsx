import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat/ChatWidget";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PropertyDetailsPage from "@/pages/property-details";
import PropertyAnalyticsPage from "@/pages/property-analytics";
import SearchResultsPage from "@/pages/search-results";
import DashboardPage from "@/pages/dashboard";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AgentDashboardPage from "@/pages/agent-dashboard";
import NotificationsDemo from "@/pages/notifications-demo";
import PropertyComparisonPage from "@/pages/property-comparison";
import BulkUploadPage from "@/pages/bulk-upload";
import AddPropertyPage from "@/pages/add-property";
import CookiePolicy from "@/pages/cookie-policy";
import NeighborhoodInsightsPage from "@/pages/neighborhood-insights-page";
import UserVerificationPage from "@/pages/user-verification";
import SubscriptionPage from "@/pages/subscription-page";
import PaymentPage from "@/pages/payment-page";
import MessagesPage from "@/pages/messages-page";
import TestFormComponentsPage from "@/pages/test-form-components";
import AuthTestPage from "@/pages/auth-test";
import { 
  ProtectedRoute, 
  UserProtectedRoute, 
  AgentProtectedRoute, 
  AdminProtectedRoute,
  PublisherProtectedRoute
} from "./lib/protected-route";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { AuthProvider } from "./hooks/use-auth";
import { BubbleNotificationsProvider } from "./hooks/use-bubble-notifications";
import { PropertyComparisonProvider } from "./hooks/use-property-comparison";
import { PropertyNotificationsProvider } from "./hooks/use-property-notifications";
import { useEffect, useState } from "react";
import { useToast } from "./hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OrganizationSchema } from "./components/seo/schema-markup";
import { Helmet } from "react-helmet";
import { OnboardingTourProvider } from "./hooks/use-onboarding-tour";
import { useLanguage } from "./hooks/use-language";

function AppContent() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/property/:id" component={PropertyDetailsPage} />
          <Route path="/property/:id/analytics" component={PropertyAnalyticsPage} />
          <Route path="/property-comparison" component={PropertyComparisonPage} />
          <Route path="/search" component={SearchResultsPage} />
          <Route path="/neighborhoods" component={NeighborhoodInsightsPage} />
          <Route path="/notifications-demo" component={NotificationsDemo} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route path="/payment" component={PaymentPage} />
          <Route path="/payment/success" component={PaymentPage} />
          <Route path="/test-form-components" component={TestFormComponentsPage} />
          <Route path="/auth-test" component={AuthTestPage} />
          <UserProtectedRoute path="/subscription" component={SubscriptionPage} />
          
          {/* Role-Specific Dashboard Routes */}
          <UserProtectedRoute path="/dashboard" component={DashboardPage} />
          <AdminProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
          <AgentProtectedRoute path="/agent/dashboard" component={AgentDashboardPage} />
          <UserProtectedRoute path="/dashboard/properties/new" component={AddPropertyPage} />
          <UserProtectedRoute path="/verification" component={UserVerificationPage} />
          <UserProtectedRoute path="/messages" component={MessagesPage} />
          
          {/* Premium Features */}
          <PublisherProtectedRoute path="/bulk-upload" component={BulkUploadPage} />
          
          {/* Catch-all for 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ChatWidget delayAppearance={10000} />
      <Toaster />
    </>
  );
}

function FirebaseAuthHandler({ children }: { children: React.ReactNode }) {
  // We're no longer using redirect-based authentication, so this component is simpler now
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Just a quick initialization check to ensure Firebase is ready
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Initializing application...</span>
      </div>
    );
  }
  
  return <>{children}</>;
}

// SEO component with language-aware meta tags
function SEOHelmet() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://foundation.com';
  const { currentLanguage } = useLanguage(); // Now this hook is called within the context of all providers

  return (
    <>
      {/* Global SEO */}
      <Helmet>
        <html lang={currentLanguage.split('-')[0]} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        
        {/* Default meta tags, will be overridden by page-specific ones */}
        <title>Inmobi - Modern Real Estate Platform</title>
        <meta name="description" content="A modern real estate platform for finding your dream home. Browse listings, connect with agents, and discover properties that match your needs." />
        
        {/* Default Open Graph */}
        <meta property="og:site_name" content="Inmobi" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:title" content="Inmobi - Modern Real Estate Platform" />
        <meta property="og:description" content="Find your dream home with Inmobi's intelligent real estate platform. Personalized recommendations, comprehensive property details, and easy communication with agents." />
        
        {/* Default Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@foundation" />
      </Helmet>
      
      {/* Global Organization Schema */}
      <OrganizationSchema 
        baseUrl={baseUrl}
        logoUrl={`${baseUrl}/logo.png`}
        name="Inmobi Real Estate"
      />
    </>
  );
}

function App() {
  return (
    <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
      <FirebaseAuthHandler>
        <AuthProvider>
          <PropertyNotificationsProvider maxNotifications={10}>
            <OnboardingTourProvider>
              <PropertyComparisonProvider maxProperties={4}>
                <AppWithSEO />
              </PropertyComparisonProvider>
            </OnboardingTourProvider>
          </PropertyNotificationsProvider>
        </AuthProvider>
      </FirebaseAuthHandler>
    </BubbleNotificationsProvider>
  );
}

// This component is rendered after all providers are available
function AppWithSEO() {
  return (
    <>
      <SEOHelmet />
      <AppContent />
    </>
  );
}

export default App;
