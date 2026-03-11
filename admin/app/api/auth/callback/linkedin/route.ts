/**
 * LinkedIn OAuth 2.0 Callback
 * 1. Receives `code` from LinkedIn
 * 2. Exchanges for access token (expires in 60 days)
 * 3. Fetches profile info (name, photo, person URN)
 * 4. Encrypts token with AES-256 and upserts UserSocialAccount
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'

const LI_TOKEN_URL   = 'https://www.linkedin.com/oauth/v2/accessToken'
const LI_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo'  // OpenID Connect

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // LinkedIn is a Pro-only feature — block non-pro users at the server level
  if (session.user.plan !== 'pro') {
    return NextResponse.redirect(new URL('/cuentas?error=linkedin_pro_required', req.url))
  }

  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/cuentas?error=linkedin_denied', req.url)
    )
  }

  const clientId     = process.env.LINKEDIN_CLIENT_ID!
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!
  const callbackUrl  = process.env.LINKEDIN_CALLBACK_URL!

  try {
    // ── Step 1: Exchange code for access token ───────────────────
    const tokenRes = await fetch(LI_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  callbackUrl,
        client_id:     clientId,
        client_secret: clientSecret,
      }),
      cache: 'no-store',
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      throw new Error(`LinkedIn token exchange failed: ${body}`)
    }

    const {
      access_token:  accessToken,
      expires_in:    expiresIn,    // seconds — LinkedIn: 5183999 (~60 days)
      refresh_token: refreshToken,
    } = await tokenRes.json() as {
      access_token:   string
      expires_in:     number
      refresh_token?: string
    }

    const expiresAt = new Date(Date.now() + (expiresIn ?? 5183999) * 1000)

    // ── Step 2: Fetch profile via OpenID userinfo ────────────────
    const profileRes = await fetch(LI_PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache:   'no-store',
    })

    if (!profileRes.ok) {
      throw new Error('Failed to fetch LinkedIn profile')
    }

    const profile = await profileRes.json() as {
      sub:     string          // LinkedIn person URN (numeric string)
      name?:   string
      given_name?: string
      family_name?: string
      picture?: string
      email?:   string
    }

    const fullName = profile.name ?? `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim()

    // ── Step 3: Encrypt tokens ───────────────────────────────────
    const encryptedAccess  = encryptToken(accessToken)
    const encryptedRefresh = refreshToken ? encryptToken(refreshToken) : null

    // ── Step 4: Upsert LinkedIn account ──────────────────────────
    await prisma.userSocialAccount.upsert({
      where:  { userId_platform: { userId: session.user.id, platform: 'linkedin' } },
      create: {
        userId:         session.user.id,
        platform:       'linkedin',
        accessToken:    encryptedAccess,
        refreshToken:   encryptedRefresh,
        tokenExpiresAt: expiresAt,
        platformUserId: profile.sub,
        liPersonId:     `urn:li:person:${profile.sub}`,
        profileName:    fullName || null,
        profileImage:   profile.picture ?? null,
        isActive:       true,
      },
      update: {
        accessToken:    encryptedAccess,
        refreshToken:   encryptedRefresh,
        tokenExpiresAt: expiresAt,
        platformUserId: profile.sub,
        liPersonId:     `urn:li:person:${profile.sub}`,
        profileName:    fullName || null,
        profileImage:   profile.picture ?? null,
        isActive:       true,
      },
    })

    return NextResponse.redirect(
      new URL('/cuentas?success=linkedin', req.url)
    )
  } catch (err) {
    console.error('[LinkedIn OAuth]', err)
    return NextResponse.redirect(
      new URL('/cuentas?error=linkedin_failed', req.url)
    )
  }
}
