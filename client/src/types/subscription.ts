export interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
}

export interface SubscriptionFeatures {
  free: SubscriptionPlan;
  premium: SubscriptionPlan;
  enterprise: SubscriptionPlan;
}

export interface UserSubscription {
  tier: 'free' | 'premium' | 'enterprise';
  status: 'none' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired';
  expiresAt: string | null;
  features: SubscriptionPlan;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}