import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { SubscriptionFeatures, SubscriptionPlan } from '@/types/subscription';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation, useRoute } from 'wouter';
import { PageHeader } from '@/components/shared/page-header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [_, params] = useRoute<{ success?: string }>('/subscription/:success?');
  
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'enterprise'>(
    user?.subscriptionTier || 'free'
  );
  
  // Fetch subscription plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/subscription/plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/subscription/plans');
      return res.json() as Promise<SubscriptionFeatures>;
    },
  });
  
  // Fetch current subscription details
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/subscription'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await apiRequest('GET', '/api/subscription');
        return res.json();
      } catch (error) {
        // If the user doesn't have a subscription yet, return default values
        return { tier: 'free', status: 'none', features: plans?.free };
      }
    },
    enabled: !!user && !!plans,
  });
  
  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest('POST', '/api/subscription', { priceId: planId });
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        // Redirect to Stripe checkout
        const result = await stripe.redirectToCheckout({
          clientSecret: data.clientSecret,
        });
        
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest('PUT', '/api/subscription', { priceId: planId });
      return res.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: 'Subscription Updated',
        description: 'Your subscription has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/subscription');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });
      setSelectedPlan('free');
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Check for success parameter (redirect from Stripe)
  React.useEffect(() => {
    if (params?.success === 'true') {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: 'Subscription Successful',
        description: 'Thank you for subscribing to Inmobi!',
      });
      setLocation('/subscription'); // Remove success parameter from URL
    }
  }, [params?.success, queryClient, toast, setLocation]);
  
  const handleSubscriptionAction = async (planId: string, planTier: 'free' | 'premium' | 'enterprise') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe.',
        variant: 'destructive',
      });
      setLocation('/auth');
      return;
    }
    
    if (planTier === 'free') {
      // Downgrade to free tier
      await cancelSubscriptionMutation.mutateAsync();
      return;
    }
    
    // Determine the correct Stripe price ID based on the plan tier
    const stripePriceId = planTier === 'premium' 
      ? 'price_premium'  // Replace with actual Stripe price ID
      : 'price_enterprise'; // Replace with actual Stripe price ID
    
    if (subscription?.tier === 'free') {
      // Create new subscription
      await createSubscriptionMutation.mutateAsync(stripePriceId);
    } else {
      // Update existing subscription
      await updateSubscriptionMutation.mutateAsync(stripePriceId);
    }
  };
  
  const isLoading = isLoadingPlans || isLoadingSubscription || 
    createSubscriptionMutation.isPending || 
    updateSubscriptionMutation.isPending || 
    cancelSubscriptionMutation.isPending;
  
  if (isLoadingPlans || !plans) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <PageHeader
        title="Subscription Plans"
        description="Choose the plan that's right for you"
      />
      
      {/* Current subscription info */}
      {subscription && user && (
        <div className="mb-8 p-4 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Your Subscription</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Plan:</span>
              <span className="font-medium capitalize">{subscription.tier}</span>
            </div>
            {subscription.status && subscription.status !== 'none' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'outline'} className="capitalize">
                  {subscription.status}
                </Badge>
              </div>
            )}
            {subscription.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Renews:</span>
                <span>{new Date(subscription.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Subscription plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([key, plan]) => (
          <Card 
            key={key} 
            className={`${selectedPlan === key ? 'border-primary' : 'border-border'} transition-all`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="capitalize">{plan.name}</span>
                {selectedPlan === key && <Check className="h-5 w-5 text-primary" />}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={key === selectedPlan ? "outline" : "default"}
                disabled={isLoading || (key === subscription?.tier)}
                onClick={() => handleSubscriptionAction(`price_${key}`, key as any)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {key === subscription?.tier ? 'Current Plan' : 
                  key === 'free' ? 'Downgrade to Free' : 
                  subscription?.tier === 'free' ? `Subscribe to ${plan.name}` : 
                  `Upgrade to ${plan.name}`
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Help text */}
      <div className="mt-8 p-4 bg-card rounded-lg border">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About Subscriptions</p>
            <p>Premium and Enterprise plans give you access to exclusive features like advanced market analytics, unlimited property comparisons, and premium property listings.</p>
            <p className="mt-2">You can cancel or change your plan at any time. Your subscription will remain active until the end of the current billing period.</p>
          </div>
        </div>
      </div>
    </div>
  );
}