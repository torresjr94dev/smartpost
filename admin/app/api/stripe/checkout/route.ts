/**
 * Creates a Stripe Checkout Session for new subscriptions.
 * If the user doesn't have a stripeCustomerId, creates one first.
 *
 * Body params:
 *   plan     — 'basic' | 'pro'
 *   interval — 'month' | 'year'
 *   from     — 'onboarding' (optional) → adds 7-day trial + different redirect URLs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getPriceId } from '@/lib/stripe'

const TRIAL_DAYS = 7

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let plan: string
  let interval: 'month' | 'year'
  let fromOnboarding: boolean
  try {
    const body   = await req.json() as { plan?: string; interval?: string; from?: string }
    plan          = body.plan     ?? 'basic'
    interval      = body.interval === 'year' ? 'year' : 'month'
    fromOnboarding = body.from === 'onboarding'
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const priceId = getPriceId(plan, interval)
  if (!priceId) {
    return NextResponse.json({
      error: `Sin priceId para plan "${plan}" intervalo "${interval}". Configura STRIPE_PRICE_ID_${plan.toUpperCase()}_${interval === 'year' ? 'ANNUAL' : 'MONTHLY'} en .env.local`
    }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        name:     user.name ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data:  { stripeCustomerId: customerId },
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Onboarding: session-refresh after success so JWT gets the new subscriptionStatus
    const successUrl = fromOnboarding
      ? `${baseUrl}/api/auth/session-refresh?callbackUrl=/dashboard`
      : `${baseUrl}/suscripcion?checkout=success`
    const cancelUrl = fromOnboarding
      ? `${baseUrl}/onboarding?checkout=canceled`
      : `${baseUrl}/suscripcion?checkout=canceled`

    const checkoutSession = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          successUrl,
      cancel_url:           cancelUrl,
      metadata:             { userId: user.id, plan },
      subscription_data: {
        trial_period_days: fromOnboarding ? TRIAL_DAYS : undefined,
        metadata:          { userId: user.id, plan },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[Stripe Checkout]', err)
    return NextResponse.json({ error: 'Error al crear sesión de Stripe' }, { status: 500 })
  }
}
