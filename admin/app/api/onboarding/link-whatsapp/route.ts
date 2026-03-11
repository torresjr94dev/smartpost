/**
 * POST /api/onboarding/link-whatsapp
 *
 * Validates and saves a WhatsApp phone number to the user's profile.
 * Validates:
 *   1. International format (10-15 digits, optionally prefixed with +)
 *   2. Not already used by another user in the DB
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function normalizePhone(raw: string): string {
  // Keep leading + if present, strip everything else except digits
  const hasPlus = raw.trimStart().startsWith('+')
  const digits  = raw.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body  = await req.json() as { phone?: string }
  const phone = body.phone?.trim() ?? ''

  if (!phone) {
    return NextResponse.json({ error: 'El número de WhatsApp es requerido' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)

  if (!isValidPhone(normalized)) {
    return NextResponse.json(
      { error: 'Número inválido. Ingresa el número con código de país (ej. +521234567890)' },
      { status: 400 }
    )
  }

  // Check if already used by another user
  const existing = await prisma.user.findUnique({ where: { waId: normalized } })
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: 'Este número ya está registrado en otra cuenta' },
      { status: 409 }
    )
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { waId: normalized },
  })

  return NextResponse.json({ success: true, waId: normalized })
}
