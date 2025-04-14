import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Map plan IDs to Stripe price IDs
const PRICE_IDS = {
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

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription`,
      metadata: {
        plan: priceId,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
} 