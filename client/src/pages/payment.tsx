import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PAYMENT_OPTIONS = [
  {
    id: 'premium_listing',
    name: 'Premium Property Listing',
    price: '€49.00',
    description: 'Feature your property on the homepage and get premium placement in search results for 30 days.',
  },
  {
    id: 'property_appraisal',
    name: 'Professional Property Appraisal',
    price: '€199.99',
    description: 'Get a detailed appraisal report of your property\'s value based on market data and expert analysis.',
  },
  {
    id: 'virtual_staging',
    name: 'Virtual Staging Package',
    price: '€79.99',
    description: 'Transform empty rooms with virtual furniture and decor to show the full potential of your property.',
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (paymentType: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType,
          metadata: {
            propertyId: router.query.propertyId,
          },
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
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Choose a Service</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAYMENT_OPTIONS.map((option) => (
            <Card key={option.id}>
              <CardHeader>
                <CardTitle>{option.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{option.price}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{option.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePayment(option.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Purchase Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 