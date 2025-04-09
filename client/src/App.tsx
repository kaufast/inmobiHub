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

function App() {
  return (
    <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
      <AuthProvider>
        <PropertyComparisonProvider maxProperties={4}>
          <AppContent />
        </PropertyComparisonProvider>
      </AuthProvider>
    </BubbleNotificationsProvider>
  );
}

export default App;
