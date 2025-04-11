import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, useRoute } from 'wouter';
import { Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { CheckoutForm } from '@/components/payment/checkout-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PaymentIntent } from '@/types/subscription';
import { PageHeader } from '@/components/shared/page-header';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment options with prices
const PAYMENT_OPTIONS = [
  { id: 'premium_listing', name: 'Premium Property Listing', amount: 49.99, description: 'Feature your property on the homepage and get premium placement in search results for 30 days.' },
  { id: 'property_appraisal', name: 'Professional Property Appraisal', amount: 199.99, description: 'Get a detailed appraisal report of your property\'s value based on market data and expert analysis.' },
  { id: 'virtual_staging', name: 'Virtual Staging Package', amount: 79.99, description: 'Transform empty rooms with virtual furniture and decor to show the full potential of your property.' },
];

export default function PaymentPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<typeof PAYMENT_OPTIONS[0] | null>(null);
  
  // Check if user is on success page
  const [isSuccessPage] = useRoute('/payment/success');
  
  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/payment-intent', { 
        amount,
        metadata: {
          service: selectedOption?.id,
          name: selectedOption?.name
        }
      });
      
      return res.json() as Promise<PaymentIntent>;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Setup Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle selecting a payment option
  const handleSelectOption = (option: typeof PAYMENT_OPTIONS[0]) => {
    setSelectedOption(option);
    createPaymentIntentMutation.mutate(option.amount);
  };
  
  // Handle canceling payment
  const handleCancel = () => {
    setSelectedOption(null);
    setClientSecret(null);
  };
  
  // Handle successful payment
  const handleSuccess = () => {
    setSelectedOption(null);
    setClientSecret(null);
    // Redirect to success page or show success message
    toast({
      title: 'Payment Successful',
      description: `Thank you for your purchase of ${selectedOption?.name}!`,
    });
  };
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user && !isSuccessPage) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a payment.',
        variant: 'destructive',
      });
      setLocation('/auth');
    }
  }, [user, isSuccessPage, toast, setLocation]);
  
  // Show success page if user is redirected after payment
  if (isSuccessPage) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full p-3 inline-flex items-center justify-center mb-6">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">Thank you for your purchase.</p>
          <Button onClick={() => setLocation('/')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <PageHeader
        title="Real Estate Services"
        description="Premium services to enhance your real estate experience"
      />
      
      {!selectedOption ? (
        // Payment options selection
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {PAYMENT_OPTIONS.map((option) => (
            <Card key={option.id} className="transition-all hover:border-primary">
              <CardHeader>
                <CardTitle>{option.name}</CardTitle>
                <CardDescription className="flex items-end gap-1">
                  <span className="text-2xl font-bold">${option.amount.toFixed(2)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">{option.description}</p>
                <Button className="w-full" onClick={() => handleSelectOption(option)}>
                  Select
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Payment form with Stripe
        <div className="max-w-md mx-auto mt-8">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 flex items-center"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Options
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>{selectedOption.name}</CardTitle>
              <CardDescription>{selectedOption.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ clientSecret, appearance: { theme: 'stripe' } }}
                >
                  <CheckoutForm 
                    amount={selectedOption.amount} 
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    description={selectedOption.description}
                  />
                </Elements>
              ) : (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}