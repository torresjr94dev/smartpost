/**
 * Returns current subscription details for the /suscripcion page.
 * Fetches fresh data from Stripe including payment method and invoices.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: {
        plan:               true,
        subscriptionStatus: true,
        subscriptionId:     true,
        stripeCustomerId:   true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // No Stripe subscription recorded yet — still fetch PM + invoices via customer
    if (!user.subscriptionId) {
      let paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null = null
      let invoices: { id: string; amount: number; currency: string; date: string; status: string; pdfUrl: string | null; hostedUrl: string | null }[] = []

      if (user.stripeCustomerId) {
        const [pms, invList] = await Promise.all([
          stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card', limit: 1 }),
          stripe.invoices.list({ customer: user.stripeCustomerId, limit: 5 }),
        ])
        const pm = pms.data[0] ?? null
        if (pm?.card) {
          paymentMethod = { brand: pm.card.brand, last4: pm.card.last4, expMonth: pm.card.exp_month, expYear: pm.card.exp_year }
        }
        invoices = invList.data.map(inv => ({
          id:        inv.id,
          amount:    inv.amount_paid,
          currency:  inv.currency,
          date:      new Date(inv.created * 1000).toISOString(),
          status:    inv.status ?? 'unknown',
          pdfUrl:    inv.invoice_pdf ?? null,
          hostedUrl: inv.hosted_invoice_url ?? null,
        }))

        // If Stripe already has an active subscription but webhook missed it, auto-recover
        const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, limit: 1, status: 'active' })
        const activeSub = subs.data[0]
        if (activeSub) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEnd = (activeSub as any).current_period_end ?? activeSub.items.data[0]?.current_period_end ?? null
          const price     = activeSub.items.data[0]?.price
          await prisma.user.update({
            where: { id: session.user.id },
            data:  { subscriptionId: activeSub.id, subscriptionStatus: activeSub.status, plan: activeSub.metadata?.plan ?? user.plan },
          })
          return NextResponse.json({
            plan:               activeSub.metadata?.plan ?? user.plan,
            subscriptionStatus: activeSub.status,
            subscriptionId:     activeSub.id,
            currentPeriodEnd:   periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancelAtPeriodEnd:  activeSub.cancel_at_period_end,
            amount:             price?.unit_amount ?? null,
            currency:           price?.currency    ?? null,
            interval:           price?.recurring?.interval ?? null,
            trialEnd:           null,
            trialDaysLeft:      null,
            paymentMethod,
            invoices,
          })
        }
      }

      return NextResponse.json({
        plan:               user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId:     null,
        currentPeriodEnd:   null,
        cancelAtPeriodEnd:  false,
        amount:             null,
        currency:           null,
        interval:           null,
        trialEnd:           null,
        trialDaysLeft:      null,
        paymentMethod,
        invoices,
      })
    }

    // ── Fetch subscription + payment method ──────────────────────
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
      expand: ['items.data.price', 'default_payment_method'],
    })

    const item      = subscription.items.data[0]
    const price     = item?.price
    // stripe v20 (API 2025) moved current_period_end — access at runtime via cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (subscription as any).current_period_end
      ?? item?.current_period_end
      ?? null

    // ── Trial info ───────────────────────────────────────────────
    const trialEnd      = subscription.trial_end ?? null
    const trialDaysLeft = trialEnd
      ? Math.max(0, Math.ceil((trialEnd * 1000 - Date.now()) / 86_400_000))
      : null

    // ── Payment method ───────────────────────────────────────────
    let paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null = null

    // Try subscription-level PM first, then customer-level
    let pm = subscription.default_payment_method as Stripe.PaymentMethod | null

    if (!pm && user.stripeCustomerId) {
      const pms = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type:     'card',
        limit:    1,
      })
      pm = pms.data[0] ?? null
    }

    if (pm?.card) {
      paymentMethod = {
        brand:    pm.card.brand,
        last4:    pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear:  pm.card.exp_year,
      }
    }

    // ── Invoice history (last 5) ─────────────────────────────────
    const invoiceList = user.stripeCustomerId
      ? await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 5 })
      : { data: [] as Stripe.Invoice[] }

    const invoices = invoiceList.data.map(inv => ({
      id:         inv.id,
      amount:     inv.amount_paid,
      currency:   inv.currency,
      date:       new Date((inv.created) * 1000).toISOString(),
      status:     inv.status ?? 'unknown',
      pdfUrl:     inv.invoice_pdf ?? null,
      hostedUrl:  inv.hosted_invoice_url ?? null,
    }))

    return NextResponse.json({
      plan:               user.plan,
      subscriptionStatus: subscription.status,
      subscriptionId:     subscription.id,
      currentPeriodEnd:   periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancelAtPeriodEnd:  subscription.cancel_at_period_end,
      amount:             price?.unit_amount ?? null,
      currency:           price?.currency    ?? null,
      interval:           price?.recurring?.interval ?? null,
      trialEnd:           trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
      trialDaysLeft,
      paymentMethod,
      invoices,
    })
  } catch (err) {
    console.error('[Stripe Subscription GET]', err)
    return NextResponse.json({ error: 'Error al obtener suscripción' }, { status: 500 })
  }
}
