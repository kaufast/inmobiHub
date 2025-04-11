import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PropertyDetailsPage from "@/pages/property-details";
import SearchResultsPage from "@/pages/search-results";
import AuthPage from "@/pages/auth-page";
import { Helmet } from "react-helmet";

// Simple navbar component
function SimpleNavbar() {
  return (
    <header className="py-4 border-b bg-background">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <a href="/" className="text-2xl font-bold text-primary">Inmobi</a>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="/" className="text-foreground hover:text-primary">Home</a></li>
            <li><a href="/search" className="text-foreground hover:text-primary">Properties</a></li>
            <li><a href="/about" className="text-foreground hover:text-primary">About</a></li>
            <li><a href="/contact" className="text-foreground hover:text-primary">Contact</a></li>
            <li><a href="/auth" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">Sign In</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Simple footer component
function SimpleFooter() {
  return (
    <footer className="py-8 mt-auto bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-3">Inmobi</h3>
            <p className="max-w-sm text-muted-foreground">
              A modern real estate platform leveraging AI to transform your property search experience.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-muted-foreground">Phone: +34679680000</p>
            <p className="text-muted-foreground">Email: info@inmobi.mobi</p>
            <p className="text-muted-foreground">Address: c. de la Ribera 14, 08003 Barcelona</p>
          </div>
        </div>
        <div className="border-t mt-6 pt-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Inmobi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Simple cookie consent component
function SimpleCookieConsent() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-foreground">
          We use cookies to enhance your experience on our website. By continuing to use our site, you accept our use of cookies.
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={() => setVisible(false)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Accept
          </button>
          <a 
            href="/cookie-policy"
            className="border border-input px-4 py-2 rounded hover:bg-accent"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}

// Simple main application component
function SimpleApp() {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        
        <title>Inmobi - Modern Real Estate Platform</title>
        <meta name="description" content="A modern real estate platform for finding your dream home. Browse listings, connect with agents, and discover properties that match your needs." />
      </Helmet>
      
      <SimpleNavbar />
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/property/:id" component={PropertyDetailsPage} />
          <Route path="/search" component={SearchResultsPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <SimpleFooter />
      <SimpleCookieConsent />
      <Toaster />
    </div>
  );
}

export default SimpleApp;