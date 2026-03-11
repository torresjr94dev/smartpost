/**
 * POST /api/auth/facebook-login
 *
 * Login via Facebook JS SDK from the login page (no existing session).
 *
 * Steps:
 * 1. Exchanges short-lived token → long-lived token
 * 2. Fetches user info (id, name, email) from Graph API
 * 3. Looks up existing user by FB platformUserId OR email
 * 4. Upserts UserSocialAccount (facebook + instagram if available)
 * 5. Creates a NextAuth JWT session and sets the session cookie
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

const GRAPH = 'https://graph.facebook.com/v20.0'

export async function POST(req: NextRequest) {
  const body = await req.json() as { accessToken?: string }
  const shortToken = body.accessToken
  if (!shortToken) {
    return NextResponse.json({ error: 'accessToken requerido' }, { status: 400 })
  }

  const appId     = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!

  try {
    // ── Step 1: Exchange short-lived → long-lived token ──────────
    const llRes = await fetch(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        grant_type:        'fb_exchange_token',
        client_id:         appId,
        client_secret:     appSecret,
        fb_exchange_token: shortToken,
      })}`,
      { cache: 'no-store' }
    )
    if (!llRes.ok) {
      throw new Error(`Token exchange failed: ${await llRes.text()}`)
    }
    const { access_token: longToken, expires_in: expiresIn } =
      await llRes.json() as { access_token: string; expires_in: number }

    // ── Step 2: Fetch user info including email ───────────────────
    const meRes  = await fetch(
      `${GRAPH}/me?fields=id,name,email&access_token=${longToken}`,
      { cache: 'no-store' }
    )
    const meData = await meRes.json() as { id: string; name: string; email?: string }

    // ── Step 3: Find existing user ────────────────────────────────
    // Priority 1: match by existing FB social account
    const fbAccount = await prisma.userSocialAccount.findFirst({
      where:   { platformUserId: meData.id, platform: 'facebook' },
      include: { user: true },
    })

    let user = fbAccount?.user ?? null

    // Priority 2: match by email
    if (!user && meData.email) {
      user = await prisma.user.findUnique({
        where: { email: meData.email.toLowerCase().trim() },
      }) ?? null
    }

    if (!user) {
      // Account not found — user must register with email/password first
      return NextResponse.json({ error: 'account_not_found' }, { status: 404 })
    }

    // ── Step 4: Get Pages + IG Business Account ───────────────────
    const pagesRes  = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`,
      { cache: 'no-store' }
    )
    const pagesData = await pagesRes.json() as {
      data: Array<{
        id:                          string
        name:                        string
        access_token:                string
        instagram_business_account?: { id: string }
      }>
    }

    const page       = pagesData.data?.[0]
    const pageId     = page?.id ?? null
    const igUserId   = page?.instagram_business_account?.id ?? null
    const finalToken = page?.access_token ?? longToken
    const expiresAt  = new Date(
      Date.now() + (expiresIn ?? 60 * 24 * 60 * 60) * 1000
    )
    const encrypted  = encryptToken(finalToken)

    // ── Step 5: Upsert social accounts ────────────────────────────
    await prisma.userSocialAccount.upsert({
      where:  { userId_platform: { userId: user.id, platform: 'facebook' } },
      create: {
        userId:         user.id,
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

    if (igUserId) {
      await prisma.userSocialAccount.upsert({
        where:  { userId_platform: { userId: user.id, platform: 'instagram' } },
        create: {
          userId:         user.id,
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

    // ── Step 6: Create NextAuth JWT session ───────────────────────
    const nowSeconds = Math.floor(Date.now() / 1000)
    const maxAge     = 30 * 24 * 60 * 60 // 30 days (matches authOptions)

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

    // NextAuth uses different cookie names for http vs https
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Facebook Login SDK]', err)
    return NextResponse.json({ error: 'Login fallido' }, { status: 500 })
  }
}
