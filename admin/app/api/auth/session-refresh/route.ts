/**
 * GET /api/auth/session-refresh?callbackUrl=/dashboard
 *
 * Reads fresh user data from DB, re-encodes the JWT session cookie,
 * then redirects to callbackUrl. Used after Stripe checkout completes
 * so the new subscriptionStatus is reflected in the token immediately.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXTAUTH_URL!

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.redirect(new URL('/login', BASE_URL))
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.redirect(new URL('/login', BASE_URL))
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const maxAge     = 30 * 24 * 60 * 60

  const token = await encode({
    token: {
      id:                 user.id,
      email:              user.email,
      name:               user.name,
      subscriptionStatus: user.subscriptionStatus,
      plan:               user.plan,
      iat:                nowSeconds,
      exp:                nowSeconds + maxAge,
      jti:                crypto.randomUUID(),
    },
    secret: process.env.NEXTAUTH_SECRET!,
  })

  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName   = isProduction
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

  const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') ?? '/dashboard'
  const response    = NextResponse.redirect(new URL(callbackUrl, BASE_URL))

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    secure:   isProduction,
    maxAge,
  })

  return response
}
