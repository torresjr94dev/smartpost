/**
 * Facebook OAuth 2.0 Callback
 * 1. Receives `code` from Meta
 * 2. Exchanges for short-lived token
 * 3. Exchanges for long-lived token (60 days)
 * 4. Fetches Pages list → gets Page ID + IG Business Account ID
 * 5. Encrypts token with AES-256 and upserts UserSocialAccount
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'

const META_GRAPH_URL = 'https://graph.facebook.com/v20.0'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle user-denied OAuth
  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/cuentas?error=facebook_denied`, req.url)
    )
  }

  const appId       = process.env.META_APP_ID!
  const appSecret   = process.env.META_APP_SECRET!
  const callbackUrl = process.env.META_CALLBACK_URL!

  try {
    // ── Step 1: Exchange code for short-lived token ──────────────
    const tokenRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          client_id:     appId,
          client_secret: appSecret,
          redirect_uri:  callbackUrl,
          code,
        }),
      { cache: 'no-store' }
    )
    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      throw new Error(`Token exchange failed: ${body}`)
    }
    const { access_token: shortToken } = await tokenRes.json() as { access_token: string }

    // ── Step 2: Exchange for long-lived token (60 days) ──────────
    const llRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          grant_type:        'fb_exchange_token',
          client_id:         appId,
          client_secret:     appSecret,
          fb_exchange_token: shortToken,
        }),
      { cache: 'no-store' }
    )
    if (!llRes.ok) {
      const body = await llRes.text()
      throw new Error(`Long-lived token exchange failed: ${body}`)
    }
    const { access_token: longToken, expires_in: expiresIn } =
      await llRes.json() as { access_token: string; expires_in: number }

    // ── Step 3: Get user info ────────────────────────────────────
    const meRes = await fetch(
      `${META_GRAPH_URL}/me?fields=id,name&access_token=${longToken}`,
      { cache: 'no-store' }
    )
    const meData = await meRes.json() as { id: string; name: string }

    // ── Step 4: Get Pages → Page token + IG Business Account ─────
    const pagesRes = await fetch(
      `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`,
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

    const page      = pagesData.data?.[0]           // Use first page
    const pageId    = page?.id ?? null
    const igUserId  = page?.instagram_business_account?.id ?? null
    // Use page-level token if available (doesn't expire if user grants permanent)
    const finalToken = page?.access_token ?? longToken

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days fallback

    const encryptedToken = encryptToken(finalToken)

    // ── Step 5: Save Facebook account ────────────────────────────
    await prisma.userSocialAccount.upsert({
      where:  { userId_platform: { userId: session.user.id, platform: 'facebook' } },
      create: {
        userId:         session.user.id,
        platform:       'facebook',
        accessToken:    encryptedToken,
        tokenExpiresAt: expiresAt,
        platformUserId: meData.id,
        pageId,
        igUserId,
        profileName:    meData.name,
        isActive:       true,
      },
      update: {
        accessToken:    encryptedToken,
        tokenExpiresAt: expiresAt,
        platformUserId: meData.id,
        pageId,
        igUserId,
        profileName:    meData.name,
        isActive:       true,
      },
    })

    // ── Step 6: Save Instagram account (if business account found) ─
    if (igUserId) {
      await prisma.userSocialAccount.upsert({
        where:  { userId_platform: { userId: session.user.id, platform: 'instagram' } },
        create: {
          userId:         session.user.id,
          platform:       'instagram',
          accessToken:    encryptedToken,  // Same token — IG uses FB page token
          tokenExpiresAt: expiresAt,
          platformUserId: igUserId,
          igUserId,
          pageId,
          profileName:    `${meData.name} (Instagram)`,
          isActive:       true,
        },
        update: {
          accessToken:    encryptedToken,
          tokenExpiresAt: expiresAt,
          platformUserId: igUserId,
          igUserId,
          pageId,
          profileName:    `${meData.name} (Instagram)`,
          isActive:       true,
        },
      })
    }

    return NextResponse.redirect(
      new URL('/cuentas?success=facebook', req.url)
    )
  } catch (err) {
    console.error('[Facebook OAuth]', err)
    return NextResponse.redirect(
      new URL('/cuentas?error=facebook_failed', req.url)
    )
  }
}
