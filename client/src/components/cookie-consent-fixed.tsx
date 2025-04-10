import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

// Lazy load heavier UI components
const Dialog = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.Dialog })));
const DialogContent = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.DialogContent })));
const DialogDescription = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.DialogDescription })));
const DialogFooter = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.DialogFooter })));
const DialogHeader = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.DialogHeader })));
const DialogTitle = lazy(() => import('@/components/ui/dialog').then(module => ({ default: module.DialogTitle })));
const Tabs = lazy(() => import('@/components/ui/tabs').then(module => ({ default: module.Tabs })));
const TabsContent = lazy(() => import('@/components/ui/tabs').then(module => ({ default: module.TabsContent })));
const TabsList = lazy(() => import('@/components/ui/tabs').then(module => ({ default: module.TabsList })));
const TabsTrigger = lazy(() => import('@/components/ui/tabs').then(module => ({ default: module.TabsTrigger })));

type CookieCategory = {
  id: string;
  name: string;
  description: string;
  required: boolean;
};

const cookieCategories: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Necessary Cookies',
    description: 'These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.',
    required: true,
  },
  {
    id: 'preference',
    name: 'Preference Cookies',
    description: 'These cookies enable the website to remember information that changes the way the website behaves or looks, like your preferred language or the region you are in.',
    required: false,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us understand the number of visitors, where visitors come from, and which pages they visit.',
    required: false,
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third-party advertisers.',
    required: false,
  },
];

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [activeTab, setActiveTab] = useState('simple');
  const [timeLeft, setTimeLeft] = useState(15);
  const [consents, setConsents] = useState<Record<string, boolean>>({
    necessary: true,
    preference: false,
    analytics: false,
    marketing: false,
  });

  // Check if consent has already been given and set auto-hide timer
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      // Only show the banner after a short delay to let the page load first
      const showTimer = setTimeout(() => setShowBanner(true), 1000);
      
      // Start the countdown timer
      let countdownInterval: NodeJS.Timeout;
      const hideTimer = setTimeout(() => {
        // Only hide if it's still showing and no interaction has happened
        // We check localStorage again to make sure user hasn't interacted with it
        if (!localStorage.getItem('cookieConsent')) {
          acceptNecessary(); // Default to necessary cookies only when auto-hiding
        }
      }, 16000); // 16 seconds (1s delay + 15s display)
      
      setTimeout(() => {
        // Start countdown after the banner is shown
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 1000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearInterval(countdownInterval);
      };
    } else {
      try {
        const savedConsents = JSON.parse(consentGiven);
        setConsents(savedConsents);
      } catch (error) {
        console.error('Error parsing stored cookie consent:', error);
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (consents: Record<string, boolean>) => {
    localStorage.setItem('cookieConsent', JSON.stringify(consents));
    setShowBanner(false);
    setOpen(false);
    
    // Here you would typically initialize analytics, marketing scripts, etc.
    // based on the user's consent
    if (consents.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log('Analytics cookies accepted');
    }
    
    if (consents.marketing) {
      // Initialize marketing cookies/scripts
      console.log('Marketing cookies accepted');
    }
  };

  const acceptAll = () => {
    const allConsents = {
      necessary: true,
      preference: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allConsents);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      preference: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(necessaryOnly);
  };

  const acceptSelected = () => {
    saveConsent(consents);
  };

  const openPreferences = () => {
    setOpen(true);
    setActiveTab('detailed');
  };

  const handleConsentChange = (id: string, checked: boolean) => {
    setConsents(prev => ({
      ...prev,
      [id]: id === 'necessary' ? true : checked,
    }));
  };

  const manageCookies = () => {
    setOpen(true);
  };

  if (!showBanner && !open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={manageCookies}
        className="fixed bottom-4 left-4 z-50 text-xs opacity-80 hover:opacity-100"
      >
        Cookie Settings
      </Button>
    );
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t shadow-lg dark:bg-gray-900 dark:border-gray-800">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">We Value Your Privacy</h2>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="mr-2">Auto-accept in {timeLeft}s</span>
                    <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-linear" 
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
                  Inmobi uses cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies as described in our <a href="/cookie-policy" className="underline hover:text-primary">Cookie Policy</a>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Button variant="outline" size="sm" onClick={openPreferences}>
                  Cookie Preferences
                </Button>
                <Button variant="outline" size="sm" onClick={acceptNecessary}>
                  Necessary Only
                </Button>
                <Button onClick={acceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Dialog - Lazy loaded */}
      {open && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-4 rounded-md shadow-lg">
              <p>Loading preferences...</p>
            </div>
          </div>
        }>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cookie Preferences</DialogTitle>
                <DialogDescription>
                  Manage your cookie preferences. You can enable or disable different types of cookies below.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="simple">Simple View</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                </TabsList>

                <TabsContent value="simple" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. You can choose which cookies you want to allow.
                    </p>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={acceptNecessary}>
                        Necessary Only
                      </Button>
                      <Button onClick={acceptAll}>
                        Accept All
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    {cookieCategories.map((category) => (
                      <div key={category.id} className="border rounded-md p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={category.id}
                              checked={consents[category.id]}
                              onCheckedChange={(checked) => handleConsentChange(category.id, checked === true)}
                              disabled={category.required}
                            />
                            <Label htmlFor={category.id} className="font-medium">
                              {category.name} {category.required && <span className="text-xs text-gray-500">(Required)</span>}
                            </Label>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-6">
                          {category.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={acceptSelected}>
                      Save Preferences
                    </Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </Suspense>
      )}
    </>
  );
}