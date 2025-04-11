import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Loader2, 
  Check, 
  X, 
  CreditCard,
  Landmark,
  Building,
  BadgeCheck,
  Award,
  Clock,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { CheckoutForm } from '@/components/payment/checkout-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { SubscriptionFeatures, SubscriptionResponse, UserSubscription } from '@/types/subscription';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Subscription features - hardcoded for now, could be fetched from API later
const subscriptionFeatures: SubscriptionFeatures = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic property search',
      'View property details',
      'Contact listing agents',
      'Save favorites (up to 5)',
      'Limited AI search capabilities'
    ]
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    features: [
      'All Free features',
      'Advanced search filters',
      'Unlimited favorites',
      'Full AI assistant capabilities',
      'Neighborhood insights',
      'Property comparison',
      'Personalized recommendations',
      'Premium listing placement',
      'Property price history'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    features: [
      'All Premium features',
      'Market analytics dashboard',
      'Investment ROI calculator',
      'Property management tools',
      'Premium support',
      'API access',
      'Custom reports',
      'Bulk listing import',
      'Remove Inmobi branding',
      'Team collaboration tools'
    ]
  }
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise'>('premium');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Fetch current subscription info
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/subscription');
      const data = await res.json() as UserSubscription;
      return data;
    },
    enabled: !!user
  });
  
  // Start checkout flow for new subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest('POST', '/api/subscription', { priceId });
      return res.json() as Promise<SubscriptionResponse>;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });
  
  // Update existing subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest('PUT', '/api/subscription', { priceId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Updated',
        description: 'Your subscription has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      });
    },
  });
  
  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/subscription');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    },
  });
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your subscription',
        variant: 'destructive',
      });
      setLocation('/auth');
    }
  }, [user, toast, setLocation]);
  
  // Handle subscription checkout
  const handleSubscribe = () => {
    const plan = subscriptionFeatures[selectedPlan];
    
    // Subscription already active, prompt to update
    if (subscription?.tier !== 'free') {
      const userConfirmed = window.confirm(
        `You already have an active ${subscription?.tier} subscription. Would you like to change your plan to ${plan.name}?`
      );
      
      if (!userConfirmed) return;
      
      // Call update API
      const priceId = selectedPlan === 'premium' ? 'price_premium' : 'price_enterprise'; // These would be actual Stripe Price IDs
      updateSubscriptionMutation.mutate(priceId);
    } else {
      // Create new subscription
      const priceId = selectedPlan === 'premium' ? 'price_premium' : 'price_enterprise'; // These would be actual Stripe Price IDs
      createSubscriptionMutation.mutate(priceId);
    }
  };
  
  // Handle cancellation
  const handleCancel = () => {
    if (!subscription || subscription.tier === 'free') {
      return;
    }
    
    const userConfirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    );
    
    if (userConfirmed) {
      cancelSubscriptionMutation.mutate();
    }
  };
  
  // Reset checkout flow
  const handleResetCheckout = () => {
    setClientSecret(null);
  };
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    toast({
      title: 'Subscription Activated',
      description: `Your ${selectedPlan} subscription has been activated successfully.`,
    });
    setClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
  };
  
  // Loading state
  if (isLoadingSubscription || !user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If in checkout flow, show payment form
  if (clientSecret) {
    return (
      <div className="container py-8">
        <PageHeader
          title="Complete Subscription"
          description="Enter your payment details to activate your subscription"
        />
        
        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{subscriptionFeatures[selectedPlan].name} Plan</CardTitle>
              <CardDescription>
                ${subscriptionFeatures[selectedPlan].price.toFixed(2)} / month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={stripePromise} 
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <CheckoutForm 
                  amount={subscriptionFeatures[selectedPlan].price} 
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleResetCheckout}
                  description={`Inmobi ${subscriptionFeatures[selectedPlan].name} Subscription`}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <PageHeader
        title="Subscription Plans"
        description="Choose the right plan for your real estate needs"
        actions={
          subscription && subscription.tier !== 'free' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                Current plan: <span className="font-semibold text-foreground">{subscription.tier}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Cancel Subscription
              </Button>
            </div>
          )
        }
      />
      
      {/* Current subscription info */}
      {subscription && subscription.tier !== 'free' && (
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <BadgeCheck className="mr-2 h-5 w-5 text-primary" />
                Active Subscription
              </h3>
              <p className="text-sm text-muted-foreground">
                Your {subscription.tier} plan is active until {new Date(subscription.expiresAt || '').toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {subscription.status === 'active' ? 'Renews' : 'Expires'} on {new Date(subscription.expiresAt || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card className={`relative overflow-hidden ${subscription?.tier === 'free' ? 'border-primary' : ''}`}>
          {subscription?.tier === 'free' && (
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium">
              Current
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-muted-foreground" />
              {subscriptionFeatures.free.name}
            </CardTitle>
            <CardDescription className="flex items-end gap-1">
              <span className="text-2xl font-bold">${subscriptionFeatures.free.price.toFixed(2)}</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {subscriptionFeatures.free.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>
        
        {/* Premium Plan */}
        <Card className={`relative overflow-hidden ${
          selectedPlan === 'premium' ? 'border-primary ring-1 ring-primary' : ''
        } ${subscription?.tier === 'premium' ? 'border-primary' : ''}`}>
          {subscription?.tier === 'premium' && (
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium">
              Current
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              {subscriptionFeatures.premium.name}
            </CardTitle>
            <CardDescription className="flex items-end gap-1">
              <span className="text-2xl font-bold">${subscriptionFeatures.premium.price.toFixed(2)}</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {subscriptionFeatures.premium.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.tier === 'premium' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={() => {
                  setSelectedPlan('premium');
                  handleSubscribe();
                }}
                disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
              >
                {createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {subscription?.tier === 'enterprise' ? 'Downgrade' : 'Subscribe'}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Enterprise Plan */}
        <Card className={`relative overflow-hidden ${
          selectedPlan === 'enterprise' ? 'border-primary ring-1 ring-primary' : ''
        } ${subscription?.tier === 'enterprise' ? 'border-primary' : ''}`}>
          {subscription?.tier === 'enterprise' && (
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium">
              Current
            </div>
          )}
          <CardHeader>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600"></div>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              {subscriptionFeatures.enterprise.name}
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Best Value
              </span>
            </CardTitle>
            <CardDescription className="flex items-end gap-1">
              <span className="text-2xl font-bold">${subscriptionFeatures.enterprise.price.toFixed(2)}</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {subscriptionFeatures.enterprise.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.tier === 'enterprise' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:from-primary/90 hover:via-blue-500/90 hover:to-purple-600/90"
                onClick={() => {
                  setSelectedPlan('enterprise');
                  handleSubscribe();
                }}
                disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
              >
                {createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {subscription?.tier === 'premium' ? 'Upgrade' : 'Subscribe'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens when I upgrade?</h3>
            <p className="text-muted-foreground">
              When you upgrade, you'll immediately gain access to all the features of your new plan.
              You'll be charged the prorated difference for the remainder of your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access to your 
              plan's features until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How do I change my plan?</h3>
            <p className="text-muted-foreground">
              You can change your plan at any time by selecting a new plan on this page.
              Upgrades take effect immediately, while downgrades apply at the end of your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, including Visa, Mastercard, American Express, and Discover.
              All payments are securely processed by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}