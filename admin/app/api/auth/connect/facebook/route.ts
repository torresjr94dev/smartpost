/**
 * POST /api/auth/connect/facebook
 *
 * Receives a short-lived accessToken from the Facebook JS SDK (client-side).
 * The user must already have an active session.
 *
 * Steps:
 * 1. Exchanges short-lived token → long-lived token (60 days)
 * 2. Fetches user info + Pages + IG Business Account
 * 3. Upserts UserSocialAccount for facebook + instagram
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'

const GRAPH = 'https://graph.facebook.com/v20.0'

const FB_SCOPES = [
  'pages_manage_posts',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'business_management',
].join(',')

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json() as { accessToken?: string }
  const shortToken = body.accessToken
  if (!shortToken) {
    return NextResponse.json({ error: 'accessToken requerido' }, { status: 400 })
  }

  const appId     = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!

  try {
    // ── Step 1: Exchange short-lived → long-lived (60 days) ──────
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
      const err = await llRes.text()
      throw new Error(`Long-lived token exchange failed: ${err}`)
    }
    const { access_token: longToken, expires_in: expiresIn } =
      await llRes.json() as { access_token: string; expires_in: number }

    // ── Step 2: Get user info ────────────────────────────────────
    const meRes  = await fetch(
      `${GRAPH}/me?fields=id,name&access_token=${longToken}`,
      { cache: 'no-store' }
    )
    const meData = await meRes.json() as { id: string; name: string }

    // ── Step 3: Get Pages + IG Business Account ──────────────────
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

    // ── Step 4: Upsert Facebook account ──────────────────────────
    await prisma.userSocialAccount.upsert({
      where:  { userId_platform: { userId: session.user.id, platform: 'facebook' } },
      create: {
        userId:         session.user.id,
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

    // ── Step 5: Upsert Instagram account (if Business Account) ───
    if (igUserId) {
      await prisma.userSocialAccount.upsert({
        where:  { userId_platform: { userId: session.user.id, platform: 'instagram' } },
        create: {
          userId:         session.user.id,
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

    return NextResponse.json({
      success:      true,
      profileName:  meData.name,
      hasInstagram: !!igUserId,
    })
  } catch (err) {
    console.error('[Connect Facebook SDK]', err)
    return NextResponse.json({ error: 'Error al conectar Facebook' }, { status: 500 })
  }
}

// Export scopes so the client can use the exact same list
export { FB_SCOPES }
