import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import PublicacionesClient from './PublicacionesClient'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'

export const metadata: Metadata = { title: 'Publicaciones' }

const PAGE_SIZE = 20

interface SearchParams {
  page?:     string
  platform?: string
  status?:   string
  dateFrom?: string
  dateTo?:   string
}

// Next.js 15/16: searchParams is now a Promise
export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Await the Promise before destructuring
  const sp = await searchParams

  const userId   = session.user.id
  const page     = Math.max(1, parseInt(sp.page ?? '1', 10))
  const platform = sp.platform ?? ''
  const status   = sp.status   ?? ''
  const dateFrom = sp.dateFrom ?? ''
  const dateTo   = sp.dateTo   ?? ''

  // Build Prisma where clause
  const where: Prisma.PostWhereInput = { userId }

  if (platform) where.platform = platform
  if (status)   where.status   = status

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id:          true,
        platform:    true,
        content:     true,
        imageUrl:    true,
        status:      true,
        publishedAt: true,
        scheduledFor: true,
        likes:       true,
        comments:    true,
        shares:      true,
        reach:       true,
        createdAt:   true,
      },
    }),
    prisma.post.count({ where }),
  ])

  // Serialize dates for client component
  const serialized = posts.map(p => ({
    ...p,
    publishedAt:  p.publishedAt?.toISOString()  ?? null,
    scheduledFor: p.scheduledFor?.toISOString() ?? null,
    createdAt:    p.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Publicaciones"
        subtitle={`${total} publicaciones encontradas`}
      />
      <div className="flex-1 p-8">
        <PublicacionesClient
          posts={serialized}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          platform={platform}
          status={status}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>
    </div>
  )
}
