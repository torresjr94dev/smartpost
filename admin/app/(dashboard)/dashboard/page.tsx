import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TopBar from '@/components/layout/TopBar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

// ─── Metric Card ──────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  sub,
  accentClass,
}: {
  label: string
  value: string | number
  sub?: string
  accentClass?: string
}) {
  return (
    <div className="glass-card p-6 flex flex-col gap-1">
      <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-[0.6px]">{label}</p>
      <p className={`text-[32px] font-bold tracking-tight mt-1 ${accentClass ?? 'text-ink-primary'}`}>
        {value}
      </p>
      {sub && <p className="text-[12px] text-ink-secondary">{sub}</p>}
    </div>
  )
}

// ─── Platform Icon ────────────────────────────────────────────────
function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    facebook: (
      <svg viewBox="0 0 24 24" fill="#1877F2" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="url(#ig-grad)" className="w-4 h-4">
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F58529"/>
            <stop offset="50%" stopColor="#DD2A7B"/>
            <stop offset="100%" stopColor="#8134AF"/>
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  }
  return <>{icons[platform] ?? null}</>
}

// ─── Page ─────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const userId = session.user.id

  // Fetch all metrics in parallel
  const [totalPosts, publishedPosts, recentPosts, socialAccounts] = await Promise.all([
    prisma.post.count({ where: { userId } }),
    prisma.post.count({ where: { userId, status: 'published' } }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, platform: true, content: true,
        status: true, publishedAt: true, likes: true,
        comments: true, reach: true,
      },
    }),
    prisma.userSocialAccount.findMany({
      where: { userId, isActive: true },
      select: { platform: true, profileName: true },
    }),
  ])

  // Aggregate metrics
  const metrics = await prisma.post.aggregate({
    where: { userId, status: 'published' },
    _sum: { likes: true, comments: true, reach: true },
  })

  const totalLikes    = metrics._sum.likes    ?? 0
  const totalComments = metrics._sum.comments ?? 0
  const totalReach    = metrics._sum.reach    ?? 0

  const statusBadge: Record<string, string> = {
    published: 'bg-brand-green/15 text-brand-green',
    scheduled: 'bg-brand-purple/15 text-brand-purple',
    draft:     'bg-white/10 text-ink-secondary',
    failed:    'bg-red-500/15 text-red-400',
  }

  const statusLabel: Record<string, string> = {
    published: 'Publicado',
    scheduled: 'Programado',
    draft:     'Borrador',
    failed:    'Fallido',
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title={`Hola, ${session.user.name ?? 'Usuario'} 👋`}
        subtitle="Resumen de tu actividad reciente"
      />

      <div className="flex-1 p-8 flex flex-col gap-8 animate-fade-in">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Posts totales"
            value={totalPosts}
            sub="Todos los estados"
          />
          <MetricCard
            label="Publicados"
            value={publishedPosts}
            sub="En redes sociales"
            accentClass="text-brand-green"
          />
          <MetricCard
            label="Alcance total"
            value={totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach}
            sub="Impresiones acumuladas"
            accentClass="text-brand-purple"
          />
          <MetricCard
            label="Interacciones"
            value={totalLikes + totalComments}
            sub={`${totalLikes} likes · ${totalComments} comentarios`}
          />
        </div>

        {/* Connected accounts */}
        <div className="glass-card p-6">
          <h2 className="text-[14px] font-semibold text-ink-primary mb-4">Cuentas conectadas</h2>
          {socialAccounts.length === 0 ? (
            <p className="text-[13px] text-ink-secondary">
              No tienes cuentas conectadas.{' '}
              <a href="/cuentas" className="text-brand-green hover:underline cursor-pointer">
                Conectar ahora →
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {socialAccounts.map(acc => (
                <div key={acc.platform}
                     className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-dark-border bg-white/[0.03]">
                  <PlatformIcon platform={acc.platform} />
                  <span className="text-[13px] text-ink-primary capitalize font-medium">
                    {acc.profileName ?? acc.platform}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-green" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent posts */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-dark-border">
            <h2 className="text-[14px] font-semibold text-ink-primary">Publicaciones recientes</h2>
          </div>
          {recentPosts.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[13px] text-ink-secondary">Aún no tienes publicaciones.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {recentPosts.map(post => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-shrink-0">
                    <PlatformIcon platform={post.platform} />
                  </div>
                  <p className="flex-1 text-[13px] text-ink-secondary truncate">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {post.likes !== null && (
                      <span className="text-[12px] text-ink-muted">{post.likes} likes</span>
                    )}
                    <span className={`badge text-[11px] ${statusBadge[post.status] ?? statusBadge.draft}`}>
                      {statusLabel[post.status] ?? post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
