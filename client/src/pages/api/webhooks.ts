import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get the subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // Update user's subscription in database
      await db.update(users)
        .set({
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionTier: session.metadata?.plan || 'basic',
          subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(users.id, session.metadata?.userId));

      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Update subscription expiration date
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        await db.update(users)
          .set({
            subscriptionStatus: subscription.status,
            subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(users.stripeSubscriptionId, subscription.id));
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Update subscription status to past_due
      if (invoice.subscription) {
        await db.update(users)
          .set({
            subscriptionStatus: 'past_due',
          })
          .where(eq(users.stripeSubscriptionId, invoice.subscription as string));
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Update subscription status
      await db.update(users)
        .set({
          subscriptionStatus: subscription.status,
          subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(users.stripeSubscriptionId, subscription.id));
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
} 