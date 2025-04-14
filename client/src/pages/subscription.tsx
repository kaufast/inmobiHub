import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === 'basic') {
      // Handle free plan signup
      try {
        setLoading(true);
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: planId,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          toast({
            title: 'Success!',
            description: 'Your free Basic plan has been activated.',
          });
          router.push('/dashboard');
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to activate free plan',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // For paid plans, redirect to Stripe Checkout
      try {
        setLoading(true);
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: planId,
          }),
        });

        const { sessionId } = await response.json();
        
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({
          sessionId,
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to redirect to checkout',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Choose Your Plan</h1>
        <SubscriptionPlans 
          onSelectPlan={handlePlanSelect} 
          selectedPlan={selectedPlan}
          loading={loading}
        />
      </div>
    </div>
  );
} 