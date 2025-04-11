import Stripe from 'stripe';
import { storage } from './storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Subscription plans - these should match the plans created in your Stripe dashboard
export const SUBSCRIPTION_PLANS = {
  PREMIUM: 'price_premium', // Replace with actual Stripe price ID
  ENTERPRISE: 'price_enterprise', // Replace with actual Stripe price ID
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
    name: 'Premium',
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
    name: 'Enterprise',
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

/**
 * Create a Stripe customer
 * @param user User object from the database
 * @returns Stripe customer object
 */
export async function createStripeCustomer(user: any) {
  try {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      // Fetch and return existing customer
      return await stripe.customers.retrieve(user.stripeCustomerId);
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName || user.username,
      metadata: {
        userId: user.id.toString(),
      },
    });

    // Update user with Stripe customer ID
    await storage.updateUser(user.id, {
      stripeCustomerId: customer.id,
    });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a payment intent for one-time payments
 * @param amount Amount in cents
 * @param currency Currency code (default: usd)
 * @param customerId Stripe customer ID
 * @param metadata Additional metadata
 * @returns Payment intent
 */
export async function createPaymentIntent(amount: number, customerId: string, metadata = {}, currency = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Create a subscription for a user
 * @param customerId Stripe customer ID
 * @param priceId Stripe price ID
 * @param userId User ID in our database
 * @returns Subscription object
 */
export async function createSubscription(customerId: string, priceId: string, userId: number) {
  try {
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId: userId.toString() },
    });

    // Get the client secret for the subscription's first invoice payment intent
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    const clientSecret = paymentIntent.client_secret;

    return {
      subscriptionId: subscription.id,
      clientSecret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 * @param subscriptionId Stripe subscription ID
 * @returns Subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param subscriptionId Stripe subscription ID
 * @returns Canceled subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Update a subscription plan
 * @param subscriptionId Stripe subscription ID
 * @param newPriceId New Stripe price ID
 * @returns Updated subscription
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the first subscription item ID
    const itemId = subscription.items.data[0].id;
    
    // Update the subscription with the new price
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: itemId,
        price: newPriceId,
      }],
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 * @param event Stripe webhook event
 * @returns Processing result
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId);
        const status = subscription.status;
        
        // Determine subscription tier based on the price ID
        let subscriptionTier: 'free' | 'premium' | 'enterprise' = 'free';
        const priceId = subscription.items.data[0].price.id;
        
        if (priceId === SUBSCRIPTION_PLANS.PREMIUM) {
          subscriptionTier = 'premium';
        } else if (priceId === SUBSCRIPTION_PLANS.ENTERPRISE) {
          subscriptionTier = 'enterprise';
        }
        
        // Update user's subscription details
        await storage.updateUser(userId, {
          stripeSubscriptionId: subscription.id,
          subscriptionTier,
          subscriptionStatus: status,
          subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
        });
        
        return { success: true, message: 'Subscription processed successfully' };
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId);
        
        // Reset user to free tier
        await storage.updateUser(userId, {
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
        });
        
        return { success: true, message: 'Subscription cancellation processed' };
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Update subscription expiry date
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = parseInt(subscription.metadata.userId);
          
          await storage.updateUser(userId, {
            subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
          });
        }
        
        return { success: true, message: 'Invoice payment processed' };
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Mark subscription as past_due
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = parseInt(subscription.metadata.userId);
          
          await storage.updateUser(userId, {
            subscriptionStatus: 'past_due',
          });
        }
        
        return { success: true, message: 'Invoice payment failure processed' };
      }
      
      default:
        return { success: true, message: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    throw error;
  }
}

export default stripe;