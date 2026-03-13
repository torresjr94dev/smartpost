/**
 * POST /api/internal/bot/posts
 *
 * Endpoint interno para que el bot de WhatsApp (n8n) registre
 * una publicación después de haberla publicado en la red social.
 *
 * Protegido por: X-Bot-Secret header (BOT_INTERNAL_SECRET env var)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_PLATFORMS = ['facebook', 'instagram', 'linkedin'] as const
const VALID_STATUSES = ['published', 'failed', 'scheduled', 'draft'] as const

export async function POST(req: NextRequest) {
  // ── 1. Validar secreto ────────────────────────────────────────────
  const secret = req.headers.get('x-bot-secret')
  if (!secret || secret !== process.env.BOT_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parsear body ───────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    userId,
    platform,
    content,
    imageUrl,
    status,
    platformPostId,
    publishedAt,
    scheduledFor,
    errorMessage,
  } = body as Record<string, string | undefined>

  // ── 3. Validar campos requeridos ──────────────────────────────────
  if (!userId || !platform || !content) {
    return NextResponse.json(
      { error: 'userId, platform y content son requeridos' },
      { status: 400 },
    )
  }

  if (!VALID_PLATFORMS.includes(platform as (typeof VALID_PLATFORMS)[number])) {
    return NextResponse.json(
      { error: `platform debe ser uno de: ${VALID_PLATFORMS.join(', ')}` },
      { status: 400 },
    )
  }

  const resolvedStatus = VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ? status
    : 'published'

  // ── 4. Verificar que el usuario existe ────────────────────────────
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // ── 5. Crear la publicación ───────────────────────────────────────
  const post = await prisma.post.create({
    data: {
      userId,
      platform: platform.toLowerCase(),
      content,
      imageUrl: imageUrl ?? null,
      status: resolvedStatus!,
      platformPostId: platformPostId ?? null,
      publishedAt: resolvedStatus === 'published'
        ? (publishedAt ? new Date(publishedAt) : new Date())
        : null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      errorMessage: resolvedStatus === 'failed' ? (errorMessage ?? null) : null,
    },
  })

  return NextResponse.json({ success: true, post }, { status: 201 })
}
