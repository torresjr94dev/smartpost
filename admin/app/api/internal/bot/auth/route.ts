/**
 * POST /api/internal/bot/auth
 *
 * Endpoint interno exclusivo para el BOT de WhatsApp en n8n.
 * Recibe un wa_id, valida el usuario y devuelve tokens descifrados + estado.
 *
 * Protegido por: X-Bot-Secret header (valor en env BOT_INTERNAL_SECRET)
 * El mismo valor debe estar hardcodeado en el HTTP Request node de n8n.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptToken } from '@/lib/crypto'

const ACTIVE_STATUSES = ['active', 'trialing']

// Plataformas soportadas por el bot
const PLATFORMS = ['facebook', 'instagram', 'linkedin'] as const
type Platform = (typeof PLATFORMS)[number]

export async function POST(req: NextRequest) {
  // ── 1. Validar secreto ────────────────────────────────────────────
  const secret = req.headers.get('x-bot-secret')
  if (!secret || secret !== process.env.BOT_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parsear body ───────────────────────────────────────────────
  let wa_id: string | undefined
  try {
    const body = await req.json()
    wa_id = body?.wa_id
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!wa_id) {
    return NextResponse.json({ error: 'wa_id is required' }, { status: 400 })
  }

  // ── 3. Buscar usuario por wa_id ───────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { waId: wa_id },
    include: {
      socialAccounts: {
        where: { isActive: true },
      },
    },
  })

  // Usuario no registrado en la plataforma
  if (!user) {
    const landingUrl = process.env.LANDING_URL ?? ''
    const adminUrl = process.env.NEXTAUTH_URL ?? ''
    return NextResponse.json({
      status: 'not_registered',
      message:
        '👋 ¡Hola! Tu número no está registrado en SmartPost.\n\n' +
        'SmartPost es un bot que te ayuda a crear y publicar contenido en tus redes sociales directo desde WhatsApp, con ayuda de IA. 🤖\n\n' +
        `🌐 Conoce más: ${landingUrl}\n` +
        `✍️ Crea tu cuenta: ${adminUrl}/register`,
    })
  }

  // ── 4. Verificar suscripción activa ───────────────────────────────
  if (!ACTIVE_STATUSES.includes(user.subscriptionStatus)) {
    const adminUrl = process.env.NEXTAUTH_URL ?? ''
    return NextResponse.json({
      status: 'subscription_inactive',
      message:
        '⚠️ Tu suscripción de SmartPost ha vencido.\n\n' +
        'Sin un plan activo el bot no puede publicar en tus redes. Renueva tu plan para retomar el control de tu contenido:\n' +
        `💳 ${adminUrl}/suscripcion`,
    })
  }

  // ── 5. Descifrar tokens de redes sociales ─────────────────────────
  const accounts: Record<string, {
    connected: boolean
    token?: string
    pageId?: string
    igUserId?: string
    liPersonId?: string
    platformUserId?: string
    profileName?: string
    tokenExpired?: boolean
  }> = {}

  // Inicializar todas las plataformas como no conectadas
  for (const platform of PLATFORMS) {
    accounts[platform] = { connected: false }
  }

  const connectedPlatforms: string[] = []
  const now = new Date()

  for (const account of user.socialAccounts) {
    const platform = account.platform.toLowerCase() as Platform
    if (!PLATFORMS.includes(platform)) continue

    // Verificar expiración del token
    const tokenExpired =
      account.tokenExpiresAt != null && account.tokenExpiresAt < now

    // Descifrar token (no lo enviamos si está vencido)
    let decryptedToken: string | undefined
    try {
      decryptedToken = tokenExpired ? undefined : decryptToken(account.accessToken)
    } catch {
      // Token corrupto — tratar como vencido
      accounts[platform] = { connected: true, tokenExpired: true }
      continue
    }

    accounts[platform] = {
      connected: true,
      token: decryptedToken,
      pageId: account.pageId ?? undefined,
      igUserId: account.igUserId ?? undefined,
      liPersonId: account.liPersonId ?? undefined,
      platformUserId: account.platformUserId ?? undefined,
      profileName: account.profileName ?? undefined,
      tokenExpired,
    }

    // Solo contar como disponible si el token está vigente
    if (!tokenExpired) {
      // Capitalizar para coincidir con lo que espera el agente FSM
      const displayName =
        platform === 'facebook'
          ? 'Facebook'
          : platform === 'instagram'
            ? 'Instagram'
            : 'LinkedIn'
      connectedPlatforms.push(displayName)
    }
  }

  // Sin plataformas conectadas con token válido
  if (connectedPlatforms.length === 0) {
    const adminUrl = process.env.NEXTAUTH_URL ?? ''
    return NextResponse.json({
      status: 'no_accounts',
      message:
        '🔐 No tienes redes sociales conectadas con tokens válidos.\n\n' +
        'Sin acceso a tus redes el bot no puede publicar. Conecta o reconecta tus cuentas en unos segundos:\n' +
        `🔗 ${adminUrl}/cuentas`,
      user: {
        id: user.id,
        name: user.name,
        plan: user.plan,
      },
      accounts,
      connectedPlatforms: [],
    })
  }

  // ── 6. Respuesta exitosa ──────────────────────────────────────────
  return NextResponse.json({
    status: 'active',
    user: {
      id: user.id,
      name: user.name,
      plan: user.plan,
    },
    accounts,
    connectedPlatforms, // e.g. ["Facebook", "Instagram"]
  })
}
