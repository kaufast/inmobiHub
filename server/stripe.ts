import Stripe from 'stripe';
import { storage } from './storage';

// Initialize Stripe as undefined by default - effectively disabling payment features
const stripe = undefined;

// Subscription plans - these should match the plans created in your Stripe dashboard
export const SUBSCRIPTION_PLANS = {
  PREMIUM: 'price_premium',
  ENTERPRISE: 'price_enterprise',
};

// Subscription features
export const SUBSCRIPTION_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic property search',
      'Save up to 5 favorite properties',
      'Limited AI property insights',
      'Email support',
    ],
  },
  premium: {
    name: 'Premium (Coming Soon)',
    price: 19.99,
    features: [
      'Unlimited property search',
      'Unlimited favorites',
      'Advanced AI property insights',
      'Market trend analysis',
      'Neighborhood analytics',
      'Priority email support',
      'Virtual property tours',
    ],
  },
  enterprise: {
    name: 'Enterprise (Coming Soon)',
    price: 49.99,
    features: [
      'All Premium features',
      'Investment portfolio analytics',
      'ROI prediction tools',
      'Real estate market reports',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Team collaboration tools',
    ],
  },
};

// No-op implementation of Stripe functions
export const createStripeCustomer = async () => ({ id: 'disabled' });
export const createPaymentIntent = async () => ({ client_secret: 'disabled' });
export const createSubscription = async () => ({ subscriptionId: 'disabled', clientSecret: 'disabled' });
export const getSubscription = async () => ({ status: 'disabled' });
export const cancelSubscription = async () => ({ status: 'disabled' });
export const updateSubscription = async () => ({ status: 'disabled' });
export const handleStripeWebhook = async () => ({ success: true, message: 'Payments disabled' });

export default stripe;