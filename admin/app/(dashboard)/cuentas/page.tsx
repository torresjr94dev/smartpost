import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import CuentasClient from './CuentasClient'
import type { Metadata } from 'next'
import { randomBytes } from 'crypto'

export const metadata: Metadata = { title: 'Cuentas conectadas' }

// Generate Meta OAuth URL with CSRF state
function buildFacebookOAuthUrl(state: string): string {
  const appId       = process.env.META_APP_ID!
  const callbackUrl = process.env.META_CALLBACK_URL!
  const scope = [
    'pages_manage_posts',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'business_management',
  ].join(',')

  const params = new URLSearchParams({
    client_id:    appId,
    redirect_uri: callbackUrl,
    scope,
    response_type: 'code',
    state,
  })

  return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`
}

// Generate LinkedIn OAuth URL
function buildLinkedInOAuthUrl(state: string): string {
  const clientId    = process.env.LINKEDIN_CLIENT_ID!
  const callbackUrl = process.env.LINKEDIN_CALLBACK_URL!
  const scope = 'openid profile email w_member_social'

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     clientId,
    redirect_uri:  callbackUrl,
    scope,
    state,
  })

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params       = await searchParams
  const errorParam   = params.error ?? null
  const successParam = params.success ?? null

  // Fetch user's social accounts
  const accounts = await prisma.userSocialAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id:             true,
      platform:       true,
      isActive:       true,
      tokenExpiresAt: true,
      profileName:    true,
      profileImage:   true,
      connectedAt:    true,
    },
    orderBy: { connectedAt: 'desc' },
  })

  // Generate CSRF state tokens — stored in session ideally
  // For simplicity, using random bytes (stateless check done in callback)
  const fbState  = randomBytes(16).toString('hex')
  const liState  = randomBytes(16).toString('hex')

  type AccountRow = typeof accounts[number]
  const serialized = accounts.map((a: AccountRow) => ({
    ...a,
    tokenExpiresAt: a.tokenExpiresAt?.toISOString() ?? null,
    connectedAt:    a.connectedAt.toISOString(),
  }))

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Cuentas conectadas"
        subtitle="Gestiona tus conexiones con redes sociales"
      />
      <div className="flex-1 p-8">
        <CuentasClient
          accounts={serialized}
          facebookAuthUrl={buildFacebookOAuthUrl(fbState)}
          linkedinAuthUrl={buildLinkedInOAuthUrl(liState)}
          plan={session.user.plan}
          initialError={errorParam === 'linkedin_pro_required' ? 'LinkedIn solo está disponible en el Plan Pro. Mejora tu plan para conectarlo.' : null}
          initialSuccess={successParam}
        />
      </div>
    </div>
  )
}
