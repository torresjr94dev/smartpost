import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa en Stripe' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   user.stripeCustomerId,
      return_url: `${baseUrl}/suscripcion`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[Stripe Portal]', err)
    return NextResponse.json({ error: 'Error al abrir el portal de Stripe' }, { status: 500 })
  }
}
