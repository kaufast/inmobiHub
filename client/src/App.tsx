import { createContext, ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import { useToast } from "./hooks/use-toast";

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
          
          {/* Role-Specific Dashboard Routes */}
          <UserProtectedRoute path="/dashboard" component={DashboardPage} />
          <AdminProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
          <AgentProtectedRoute path="/agent/dashboard" component={AgentDashboardPage} />
          <UserProtectedRoute path="/dashboard/properties/new" component={AddPropertyPage} />
          
          {/* Premium Features */}
          <PublisherProtectedRoute path="/bulk-upload" component={BulkUploadPage} />
          
          {/* Catch-all for 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ChatWidget delayAppearance={10000} />
      <CookieConsent />
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
    
    // Add a timeout to prevent getting stuck on authentication check
    const authTimeout = setTimeout(() => {
      if (isCheckingRedirect) {
        console.log("Authentication check timed out, continuing to app");
        setIsCheckingRedirect(false);
      }
    }, 3000); // 3 second timeout
    
    checkRedirectResult();
    
    return () => {
      clearTimeout(authTimeout);
    };
  }, [toast, isCheckingRedirect]);
  
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

// ErrorBoundary component to catch runtime errors
type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App error:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-6 text-center max-w-md">
            We're sorry, but there was an issue loading the application. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// TEMPORARY: Create a simple mock of PropertyNotificationsContext
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface PropertyNotification {
  id: string;
  type: 'newProperty' | 'propertyUpdated';
  property: any;
  timestamp: string;
}

interface PropertyNotificationsContextType {
  notifications: PropertyNotification[];
  connectionStatus: ConnectionStatus;
  subscribe: (filters?: any) => void;
  unsubscribe: () => void;
  clearNotifications: () => void;
  recentProperties: any[];
}

const PropertyNotificationsContext = createContext<PropertyNotificationsContextType>({
  notifications: [],
  connectionStatus: 'disconnected',
  subscribe: () => console.log('subscribe called'),
  unsubscribe: () => console.log('unsubscribe called'),
  clearNotifications: () => console.log('clearNotifications called'),
  recentProperties: []
});

// Mock PropertyNotificationsProvider that doesn't use WebSockets
function PropertyNotificationsProvider({ 
  children 
}: { 
  children: ReactNode,
  maxNotifications?: number,
  onError?: (error: Error) => void 
}) {
  return (
    <PropertyNotificationsContext.Provider 
      value={{
        notifications: [],
        connectionStatus: 'disconnected',
        subscribe: () => console.log('subscribe called'),
        unsubscribe: () => console.log('unsubscribe called'),
        clearNotifications: () => console.log('clearNotifications called'),
        recentProperties: []
      }}
    >
      {children}
    </PropertyNotificationsContext.Provider>
  );
}

// Helper to use the context safely
export function usePropertyNotifications() {
  return {
    notifications: [],
    connectionStatus: 'disconnected' as ConnectionStatus,
    subscribe: () => console.log('subscribe called'),
    unsubscribe: () => console.log('unsubscribe called'),
    clearNotifications: () => console.log('clearNotifications called'),
    recentProperties: []
  };
}

// This is a simplified version that doesn't actually need a Safe wrapper
// but keeping the interface the same for consistency
function SafePropertyNotificationsProvider({ 
  children
}: { 
  children: ReactNode,
  maxNotifications?: number
}) {
  return (
    <PropertyNotificationsProvider>
      {children}
    </PropertyNotificationsProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
        <FirebaseAuthHandler>
          <AuthProvider>
            <SafePropertyNotificationsProvider maxNotifications={10}>
              <OnboardingTourProvider>
                <PropertyComparisonProvider maxProperties={4}>
                  <AppWithSEO />
                </PropertyComparisonProvider>
              </OnboardingTourProvider>
            </SafePropertyNotificationsProvider>
          </AuthProvider>
        </FirebaseAuthHandler>
      </BubbleNotificationsProvider>
    </ErrorBoundary>
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
