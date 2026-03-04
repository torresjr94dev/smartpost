/**
 * Next.js Middleware — protege rutas del dashboard.
 * Redirige a /login si no hay sesión activa.
 * Redirige a /suscripcion si la suscripción está cancelada/vencida.
 */

import { withAuth } from 'next-auth/middleware'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Rutas que NO requieren autenticación
const PUBLIC_PATHS = ['/login', '/api/auth', '/api/webhooks']

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token = req.nextauth?.token

    // Permitir rutas públicas sin verificación adicional
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next()
    }

    // Si está en /suscripcion, siempre permitir (para que puedan pagar)
    if (pathname.startsWith('/suscripcion')) {
      return NextResponse.next()
    }

    // Verificar subscription status para rutas protegidas del dashboard
    if (token) {
      const status = (token as Record<string, unknown>).subscriptionStatus as string | undefined
      const blockedStatuses = ['canceled', 'past_due']

      if (status && blockedStatuses.includes(status) && !pathname.startsWith('/suscripcion')) {
        return NextResponse.redirect(new URL('/suscripcion', req.url))
      }
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
    // Proteger todo excepto Next.js internals, archivos estáticos y webhooks
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
}
