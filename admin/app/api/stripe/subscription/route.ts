/**
 * Returns current subscription details for the /suscripcion page.
 * Fetches fresh data from Stripe using the subscriptionId stored in DB.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

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

    // If no Stripe subscription, return DB data only
    if (!user.subscriptionId) {
      return NextResponse.json({
        plan:               user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId:     null,
        currentPeriodEnd:   null,
        cancelAtPeriodEnd:  false,
        amount:             null,
        currency:           null,
        interval:           null,
      })
    }

    // Fetch fresh details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
      expand: ['items.data.price'],
    })

    const item  = subscription.items.data[0]
    const price = item?.price
    const periodEnd = item?.current_period_end ?? null

    return NextResponse.json({
      plan:               user.plan,
      subscriptionStatus: subscription.status,
      subscriptionId:     subscription.id,
      currentPeriodEnd:   periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancelAtPeriodEnd:  subscription.cancel_at_period_end,
      amount:             price?.unit_amount ?? null,
      currency:           price?.currency    ?? null,
      interval:           price?.recurring?.interval ?? null,
    })
  } catch (err) {
    console.error('[Stripe Subscription GET]', err)
    return NextResponse.json({ error: 'Error al obtener suscripción' }, { status: 500 })
  }
}
