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
    return NextResponse.json({
      status: 'not_registered',
      message:
        '❌ Tu número de WhatsApp no está vinculado a ninguna cuenta en SmartPost.\n\n' +
        'Regístrate en nuestra plataforma y vincula tu número desde el panel administrativo para comenzar. 🚀',
    })
  }

  // ── 4. Verificar suscripción activa ───────────────────────────────
  if (!ACTIVE_STATUSES.includes(user.subscriptionStatus)) {
    return NextResponse.json({
      status: 'subscription_inactive',
      message:
        '⚠️ Tu suscripción no está activa.\n\n' +
        'Para seguir usando SmartPost Bot necesitas un plan vigente. ' +
        'Ingresa al panel administrativo para renovar tu suscripción. 💳',
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
    return NextResponse.json({
      status: 'no_accounts',
      message:
        '⚠️ No tienes redes sociales conectadas con tokens válidos.\n\n' +
        'Ve al panel administrativo para conectar o reconectar tus cuentas de Facebook, Instagram o LinkedIn. 🔗',
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
