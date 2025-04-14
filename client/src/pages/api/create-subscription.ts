import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Map plan IDs to Stripe price IDs
const PRICE_IDS = {
  basic: 'price_basic_free', // This should be a $0 price in Stripe
  pro: 'price_pro_monthly',  // Your actual Stripe price ID for Pro
  enterprise: 'price_enterprise_monthly', // Your actual Stripe price ID for Enterprise
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;

    if (!priceId || !Object.keys(PRICE_IDS).includes(priceId)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const stripePriceId = PRICE_IDS[priceId as keyof typeof PRICE_IDS];

    // Create or get customer
    const customer = await stripe.customers.create({
      metadata: {
        plan: priceId,
      },
    });

    if (priceId === 'basic') {
      // For the free Basic plan, create a subscription with a $0 price
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        automatic_tax: {
          enabled: true,
        },
      });

      return res.status(200).json({
        success: true,
        subscriptionId: subscription.id,
      });
    } else {
      // For paid plans, create a checkout session with automatic tax
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
            tax_rates: ['txr_auto'],
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscription`,
        metadata: {
          plan: priceId,
        },
        automatic_tax: {
          enabled: true,
        },
        tax_id_collection: {
          enabled: true,
        },
        billing_address_collection: 'required',
      });

      return res.status(200).json({ sessionId: session.id });
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
} 