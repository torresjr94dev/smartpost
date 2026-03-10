/**
 * Next.js Middleware — protege rutas del dashboard.
 * Redirige a /login si no hay sesión activa.
 * Redirige a /onboarding si la suscripción está inactiva/vencida/en onboarding.
 */

import { withAuth } from 'next-auth/middleware'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Rutas que NO requieren autenticación
const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/webhooks',
  '/api/facebook',
]

// Statuses que bloquean acceso al dashboard → redirigen a /onboarding
const BLOCKED_STATUSES = ['onboarding', 'canceled', 'past_due', 'incomplete']

// Statuses con acceso completo al dashboard
const ACTIVE_STATUSES = ['active', 'trialing']

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token  = req.nextauth?.token
    const status = (token as Record<string, unknown>)?.subscriptionStatus as string | undefined

    // Permitir rutas públicas
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next()
    }

    // /onboarding y /api/onboarding: accesibles sin suscripción activa
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/api/onboarding')) {
      // Si ya tiene plan activo → redirigir al dashboard (no necesitan onboarding)
      if (status && ACTIVE_STATUSES.includes(status)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    // /suscripcion: accesible para usuarios con plan activo
    if (pathname.startsWith('/suscripcion')) {
      return NextResponse.next()
    }

    // Dashboard y demás rutas: bloquear si no tienen suscripción activa
    if (token && status && BLOCKED_STATUSES.includes(status)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|smartpost_logo).*)',
  ],
}
