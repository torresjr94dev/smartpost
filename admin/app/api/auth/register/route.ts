/**
 * POST /api/auth/register
 *
 * Creates a new user account with email + password.
 * New users start with subscriptionStatus='onboarding'.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const body = await req.json() as { name?: string; email?: string; password?: string }

  const name     = body.name?.trim()
  const email    = body.email?.toLowerCase().trim()
  const password = body.password

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password:           hash,
      subscriptionStatus: 'onboarding',
    },
  })

  return NextResponse.json({ success: true })
}
