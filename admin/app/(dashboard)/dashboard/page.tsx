import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = session.user.id

  // Fetch all data in parallel — no waterfall
  const [totalPosts, publishedPosts, recentPosts, socialAccounts, metrics] =
    await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.post.count({ where: { userId, status: 'published' } }),
      prisma.post.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        take:    8,
        select: {
          id: true, platform: true, content: true,
          status: true, publishedAt: true,
          likes: true, comments: true, reach: true,
        },
      }),
      prisma.userSocialAccount.findMany({
        where:  { userId, isActive: true },
        select: { platform: true, profileName: true },
      }),
      prisma.post.aggregate({
        where: { userId, status: 'published' },
        _sum:  { likes: true, comments: true, reach: true },
      }),
    ])

  return (
    <DashboardClient
      userName={session.user.name ?? 'Usuario'}
      totalPosts={totalPosts}
      publishedPosts={publishedPosts}
      totalReach={metrics._sum.reach    ?? 0}
      totalLikes={metrics._sum.likes    ?? 0}
      totalComments={metrics._sum.comments ?? 0}
      socialAccounts={socialAccounts}
      recentPosts={recentPosts}
    />
  )
}
