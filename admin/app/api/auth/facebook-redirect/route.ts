/**
 * GET /api/auth/facebook-redirect?state=login|connect
 *
 * Builds the Facebook Login for Business OAuth URL (response_type=code)
 * and redirects the user. FB.login() popup uses response_type=token which
 * FLoB does not support — this server-side redirect is required instead.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state') ?? 'connect'

  const params = new URLSearchParams({
    client_id:     process.env.META_APP_ID!,
    redirect_uri:  process.env.META_CALLBACK_URL!,
    config_id:     '895993176778536',
    response_type: 'code',
    state,
  })

  return NextResponse.redirect(
    `https://www.facebook.com/dialog/oauth?${params.toString()}`
  )
}
