/**
 * Stripe Webhook — actualiza la BD cuando Stripe confirma pagos/cambios.
 *
 * Eventos manejados:
 *   checkout.session.completed      → guarda subscriptionId, plan, status
 *   customer.subscription.updated   → actualiza status y plan
 *   customer.subscription.deleted   → marca canceled
 *   invoice.paid                    → confirma status active
 *   invoice.payment_failed          → marca past_due
 *
 * Configura en Stripe Dashboard → Webhooks → Endpoint URL:
 *   https://tu-dominio.com/api/stripe/webhook
 * Secret: STRIPE_WEBHOOK_SECRET en .env.local
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

// Next.js App Router: raw body needed for Stripe signature verification
export const dynamic = 'force-dynamic'

/** Extracts plan from subscription metadata, falling back to price lookup */
function planFromSub(sub: Stripe.Subscription): string {
  return (sub.metadata?.plan as string) ?? 'basic'
}

export async function POST(req: NextRequest) {
  const sig     = req.headers.get('stripe-signature')
  const secret  = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Checkout completado → guarda subscriptionId + plan ────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId        = session.metadata?.userId
        const plan          = session.metadata?.plan ?? 'basic'
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null

        if (!userId || !subscriptionId) break

        // Fetch full subscription to get status
        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId,
            plan,
            subscriptionStatus: sub.status,
          },
        })
        break
      }

      // ── Suscripción actualizada (upgrade, downgrade, renovación) ──
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId:     sub.id,
            subscriptionStatus: sub.status,
            plan:               planFromSub(sub),
          },
        })
        break
      }

      // ── Suscripción cancelada ─────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'canceled',
            plan:               'basic',
          },
        })
        break
      }

      // ── Factura pagada → confirma active ──────────────────────────
      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subId   = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription?.id ?? null)
        if (!subId) break

        await prisma.user.updateMany({
          where: { subscriptionId: subId },
          data:  { subscriptionStatus: 'active' },
        })
        break
      }

      // ── Pago fallido → past_due ───────────────────────────────────
      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subId   = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription?.id ?? null)
        if (!subId) break

        await prisma.user.updateMany({
          where: { subscriptionId: subId },
          data:  { subscriptionStatus: 'past_due' },
        })
        break
      }

      default:
        // Ignorar eventos no manejados
        break
    }
  } catch (err) {
    console.error(`[Webhook] Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
