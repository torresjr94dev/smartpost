import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let accountId: string
  try {
    const body = await req.json() as { accountId?: string }
    if (!body.accountId) {
      return NextResponse.json({ error: 'accountId requerido' }, { status: 400 })
    }
    accountId = body.accountId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    // Verify the account belongs to the authenticated user before updating
    const account = await prisma.userSocialAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    })

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    await prisma.userSocialAccount.update({
      where: { id: accountId },
      data:  { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Disconnect]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
