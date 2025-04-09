import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertyDetailsPage from "@/pages/property-details";
import SearchResultsPage from "@/pages/search-results";
import DashboardPage from "@/pages/dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/property/:id" component={PropertyDetailsPage} />
          <Route path="/search" component={SearchResultsPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router />
  );
}

export default App;
