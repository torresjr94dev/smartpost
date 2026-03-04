/**
 * Stripe Webhook handler.
 * Handles: checkout.session.completed, invoice.paid,
 *          customer.subscription.updated, customer.subscription.deleted
 *
 * IMPORTANT: This route must NOT use getServerSession — it's called by Stripe, not users.
 * The raw body must be read as Buffer for signature verification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── New subscription created via Checkout ─────────────────
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        if (checkoutSession.mode !== 'subscription') break

        const customerId     = checkoutSession.customer as string
        const subscriptionId = checkoutSession.subscription as string
        const metadata       = checkoutSession.metadata ?? {}
        const userId         = metadata.userId
        const plan           = metadata.plan ?? 'basic'

        if (!userId) {
          console.warn('[Webhook] checkout.session.completed: no userId in metadata')
          break
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'active',
            subscriptionId,
            stripeCustomerId:   customerId,
            plan,
          },
        })
        break
      }

      // ── Invoice paid — keep subscription active ────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subRef = invoice.parent?.subscription_details?.subscription
        const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id ?? null
        if (!subscriptionId) break

        await prisma.user.updateMany({
          where: { subscriptionId },
          data:  { subscriptionStatus: 'active' },
        })
        break
      }

      // ── Invoice payment failed ─────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subRef = invoice.parent?.subscription_details?.subscription
        const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id ?? null
        if (!subscriptionId) break

        await prisma.user.updateMany({
          where: { subscriptionId },
          data:  { subscriptionStatus: 'past_due' },
        })
        break
      }

      // ── Subscription updated (plan change, trial end) ──────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const planName = sub.metadata?.plan ?? 'basic'

        let newStatus: string = sub.status
        // Map Stripe statuses to our app statuses
        if (sub.status === 'trialing') newStatus = 'trialing'
        else if (sub.status === 'active') newStatus = 'active'
        else if (sub.status === 'past_due') newStatus = 'past_due'
        else if (sub.status === 'canceled') newStatus = 'canceled'

        await prisma.user.updateMany({
          where: { subscriptionId: sub.id },
          data:  { subscriptionStatus: newStatus, plan: planName },
        })
        break
      }

      // ── Subscription deleted (canceled) ───────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await prisma.user.updateMany({
          where: { subscriptionId: sub.id },
          data:  { subscriptionStatus: 'canceled' },
        })
        break
      }

      default:
        // Unhandled event type — ignore silently
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// App Router: no body parser by default — req.text() works without additional config
