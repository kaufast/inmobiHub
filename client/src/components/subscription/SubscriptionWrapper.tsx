import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import SubscriptionPage from '@/pages/subscription';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionPage />
    </Elements>
  );
} 