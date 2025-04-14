import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Map payment types to Stripe price IDs
const PAYMENT_TYPES = {
  premium_listing: 'price_premium_listing',  // Your actual Stripe price ID
  property_appraisal: 'price_property_appraisal', // Your actual Stripe price ID
  virtual_staging: 'price_virtual_staging', // Your actual Stripe price ID
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentType, metadata } = req.body;

    if (!paymentType || !Object.keys(PAYMENT_TYPES).includes(paymentType)) {
      return res.status(400).json({ error: 'Invalid payment type' });
    }

    const stripePriceId = PAYMENT_TYPES[paymentType as keyof typeof PAYMENT_TYPES];

    // Create a checkout session with automatic tax calculation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
          tax_rates: ['txr_auto'], // Use automatic tax rates
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment`,
      metadata: {
        paymentType,
        ...metadata,
      },
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
      customer_creation: 'always', // Create a customer for tax purposes
      billing_address_collection: 'required', // Required for tax calculation
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return res.status(500).json({ error: 'Failed to create payment session' });
  }
} 