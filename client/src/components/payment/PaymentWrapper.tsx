import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { PaymentForm } from './PaymentForm';

interface PaymentWrapperProps {
  amount: number;
  onSuccess: () => void;
}

export function PaymentWrapper({ amount, onSuccess }: PaymentWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
} 