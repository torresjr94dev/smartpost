/**
 * Facebook OAuth 2.0 Callback — Facebook Login for Business (FLoB)
 *
 * Handles two flows via the `state` query param:
 *   state=login   — Unauthenticated login. Finds user by FB ID, creates NextAuth session.
 *   state=connect — Authenticated user connecting their FB/IG accounts from Cuentas page.
 *
 * Steps:
 *   1. Exchange code → short-lived token
 *   2. Exchange short-lived → long-lived token (60 days)
 *   3. Fetch user info + Pages list + IG Business Account ID
 *   4. Encrypt token + upsert UserSocialAccount (facebook + instagram)
 *   5a. [login]   Create NextAuth JWT session cookie → redirect /dashboard
 *   5b. [connect] Require existing session → redirect /cuentas?success=facebook
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

const GRAPH    = 'https://graph.facebook.com/v20.0'
const BASE_URL = process.env.NEXTAUTH_URL!

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') ?? 'connect' // 'login' | 'connect'

  // Handle user-denied OAuth
  if (error || !code) {
    const dest = state === 'login' ? '/login?error=facebook_denied' : '/cuentas?error=facebook_denied'
    return NextResponse.redirect(new URL(dest, BASE_URL))
  }

  const appId       = process.env.META_APP_ID!
  const appSecret   = process.env.META_APP_SECRET!
  const callbackUrl = process.env.META_CALLBACK_URL!

  try {
    // ── Step 1: Exchange code for short-lived token ──────────────
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?` +
        new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: callbackUrl, code }),
      { cache: 'no-store' }
    )
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`)
    const { access_token: shortToken } = await tokenRes.json() as { access_token: string }

    // ── Step 2: Exchange for long-lived token (60 days) ──────────
    const llRes = await fetch(
      `${GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortToken,
        }),
      { cache: 'no-store' }
    )
    if (!llRes.ok) throw new Error(`Long-lived token exchange failed: ${await llRes.text()}`)
    const { access_token: longToken, expires_in: expiresIn } =
      await llRes.json() as { access_token: string; expires_in: number }

    // ── Step 3: Get user info ─────────────────────────────────────
    const meRes  = await fetch(`${GRAPH}/me?fields=id,name&access_token=${longToken}`, { cache: 'no-store' })
    const meData = await meRes.json() as { id: string; name: string }

    // ── Step 4: Get Pages → Page token + IG Business Account ─────
    const pagesRes  = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`,
      { cache: 'no-store' }
    )
    const pagesData = await pagesRes.json() as {
      data: Array<{
        id: string
        name: string
        access_token: string
        instagram_business_account?: { id: string }
      }>
    }

    const page       = pagesData.data?.[0]
    const pageId     = page?.id ?? null
    const igUserId   = page?.instagram_business_account?.id ?? null
    const finalToken = page?.access_token ?? longToken
    const expiresAt  = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    const encrypted  = encryptToken(finalToken)

    // ── Determine user: login flow needs lookup, connect flow uses session ──
    let userId: string

    if (state === 'login') {
      // Find user by FB platform ID
      const fbAccount = await prisma.userSocialAccount.findFirst({
        where:   { platformUserId: meData.id, platform: 'facebook' },
        include: { user: true },
      })
      let user = fbAccount?.user ?? null

      if (!user) {
        // Auto-create user on first Facebook login
        // Email placeholder until they set a real one in onboarding
        const placeholderEmail = `fb_${meData.id}@pending.sp`
        user = await prisma.user.upsert({
          where:  { email: placeholderEmail },
          create: {
            email:              placeholderEmail,
            name:               meData.name,
            subscriptionStatus: 'onboarding',
          },
          update: {},
        })
      }
      userId = user.id
    } else {
      // Require active session
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.redirect(new URL('/login', BASE_URL))
      }
      userId = session.user.id
    }

    // ── Step 5: Upsert UserSocialAccount (facebook) ───────────────
    await prisma.userSocialAccount.upsert({
      where:  { userId_platform: { userId, platform: 'facebook' } },
      create: {
        userId,
        platform:       'facebook',
        accessToken:    encrypted,
        tokenExpiresAt: expiresAt,
        platformUserId: meData.id,
        pageId,
        igUserId,
        profileName:    meData.name,
        isActive:       true,
      },
      update: {
        accessToken:    encrypted,
        tokenExpiresAt: expiresAt,
        platformUserId: meData.id,
        pageId,
        igUserId,
        profileName:    meData.name,
        isActive:       true,
      },
    })

    // ── Step 6: Upsert UserSocialAccount (instagram) ──────────────
    if (igUserId) {
      await prisma.userSocialAccount.upsert({
        where:  { userId_platform: { userId, platform: 'instagram' } },
        create: {
          userId,
          platform:       'instagram',
          accessToken:    encrypted,
          tokenExpiresAt: expiresAt,
          platformUserId: igUserId,
          igUserId,
          pageId,
          profileName:    `${meData.name} (Instagram)`,
          isActive:       true,
        },
        update: {
          accessToken:    encrypted,
          tokenExpiresAt: expiresAt,
          platformUserId: igUserId,
          igUserId,
          pageId,
          profileName:    `${meData.name} (Instagram)`,
          isActive:       true,
        },
      })
    }

    // ── Step 7: Respond based on state ───────────────────────────
    if (state === 'login') {
      // Create NextAuth JWT session cookie
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return NextResponse.redirect(new URL('/login', BASE_URL))

      const nowSeconds = Math.floor(Date.now() / 1000)
      const maxAge     = 30 * 24 * 60 * 60

      const token = await encode({
        token: {
          id:                 user.id,
          email:              user.email,
          name:               user.name,
          subscriptionStatus: user.subscriptionStatus,
          plan:               user.plan,
          waId:               user.waId ?? null,
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

      const cookieStore = await cookies()
      cookieStore.set(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   isProduction,
        maxAge,
      })

      const dest = user.subscriptionStatus === 'onboarding' ? '/onboarding' : '/dashboard'
      return NextResponse.redirect(new URL(dest, BASE_URL))
    }

    return NextResponse.redirect(new URL('/cuentas?success=facebook', BASE_URL))

  } catch (err) {
    console.error('[Facebook OAuth]', err)
    const dest = state === 'login' ? '/login?error=facebook_failed' : '/cuentas?error=facebook_failed'
    return NextResponse.redirect(new URL(dest, BASE_URL))
  }
}
