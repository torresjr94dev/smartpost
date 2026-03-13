/**
 * PATCH /api/internal/bot/posts/[id]
 *
 * Endpoint interno para actualizar una publicación existente.
 * Útil para actualizar métricas (likes, reach, etc.) o cambiar
 * el status (ej: de scheduled a published, o a failed).
 *
 * Protegido por: X-Bot-Secret header (BOT_INTERNAL_SECRET env var)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
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

  const { status, platformPostId, publishedAt, likes, comments, shares, reach, errorMessage } =
    body as Record<string, string | number | undefined>

  // ── 3. Verificar que el post existe ───────────────────────────────
  const existing = await prisma.post.findUnique({ where: { id: id } })
  if (!existing) {
    return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
  }

  // ── 4. Construir los campos a actualizar ──────────────────────────
  // Solo se actualizan los campos que vengan en el body
  const data: Record<string, unknown> = {}

  if (status !== undefined) data.status = status
  if (platformPostId !== undefined) data.platformPostId = platformPostId
  if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt as string)
  if (likes !== undefined) data.likes = Number(likes)
  if (comments !== undefined) data.comments = Number(comments)
  if (shares !== undefined) data.shares = Number(shares)
  if (reach !== undefined) data.reach = Number(reach)
  if (errorMessage !== undefined) data.errorMessage = errorMessage
  // Si se resuelve el error, limpiar el mensaje
  if (status !== undefined && status !== 'failed') data.errorMessage = null

  // Si se marca como published y no viene publishedAt, usar now()
  if (status === 'published' && publishedAt === undefined && !existing.publishedAt) {
    data.publishedAt = new Date()
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  // ── 5. Actualizar ─────────────────────────────────────────────────
  const post = await prisma.post.update({
    where: { id: id },
    data,
  })

  return NextResponse.json({ success: true, post })
}
