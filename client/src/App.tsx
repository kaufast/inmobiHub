import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertyDetailsPage from "@/pages/property-details";
import SearchResultsPage from "@/pages/search-results";
import DashboardPage from "@/pages/dashboard";
import NotificationsDemo from "@/pages/notifications-demo";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { AuthProvider } from "./hooks/use-auth";
import { BubbleNotificationsProvider } from "./hooks/use-bubble-notifications";
import { PropertyComparisonProvider } from "./hooks/use-property-comparison";
import { useEffect, useState } from "react";
import { handleRedirectResult } from "./lib/firebase";
import { useToast } from "./hooks/use-toast";
import { Loader2 } from "lucide-react";

function AppContent() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/property/:id" component={PropertyDetailsPage} />
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
  return (
    <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
      <FirebaseAuthHandler>
        <AuthProvider>
          <PropertyComparisonProvider maxProperties={4}>
            <AppContent />
          </PropertyComparisonProvider>
        </AuthProvider>
      </FirebaseAuthHandler>
    </BubbleNotificationsProvider>
  );
}

export default App;
