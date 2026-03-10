/**
 * POST /api/facebook/deauthorize
 *
 * Facebook calls this when a user removes the app from their Facebook settings.
 * Receives a signed_request (form-encoded), verifies it with HMAC-SHA256,
 * then marks the user's Facebook + Instagram accounts as inactive.
 *
 * Configure this URL in Meta App Dashboard:
 *   Facebook Login → Settings → Deauthorize Callback URL
 *   → https://smartpost.torresjr.dev/api/facebook/deauthorize
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'

function base64UrlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

export async function POST(req: NextRequest) {
  const formData  = await req.formData()
  const signedReq = formData.get('signed_request') as string | null

  if (!signedReq) {
    return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
  }

  const [encodedSig, payload] = signedReq.split('.')

  // Verify signature
  const appSecret   = process.env.META_APP_SECRET!
  const expectedSig = createHmac('sha256', appSecret)
    .update(payload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  if (encodedSig !== expectedSig) {
    console.warn('[Facebook Deauthorize] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const data = JSON.parse(base64UrlDecode(payload)) as { user_id?: string }

  if (data.user_id) {
    await prisma.userSocialAccount.updateMany({
      where:  { platformUserId: data.user_id, platform: { in: ['facebook', 'instagram'] } },
      data:   { isActive: false },
    })
    console.log(`[Facebook Deauthorize] Deactivated accounts for FB user ${data.user_id}`)
  }

  return NextResponse.json({ success: true })
}
