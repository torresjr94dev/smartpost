/**
 * POST /api/onboarding/update-account
 *
 * Step 1 of onboarding for Facebook-login users.
 * Updates their placeholder email and sets a real password.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json() as { email?: string; password?: string }
  const email    = body.email?.toLowerCase().trim()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
  }

  // Check email not already in use by another account
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { email, password: hash },
  })

  return NextResponse.json({ success: true })
}
