'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { CountUp, BlurText, FadeContent } from '@/components/animations/CountUp'

// ─── Types ────────────────────────────────────────────────────────
interface SocialAccount {
  platform: string
  profileName: string | null
}

interface Post {
  id: string
  platform: string
  content: string
  status: string
  publishedAt: Date | null
  likes: number | null
  comments: number | null
  reach: number | null
}

interface DashboardClientProps {
  userName:       string
  totalPosts:     number
  publishedPosts: number
  totalReach:     number
  totalLikes:     number
  totalComments:  number
  socialAccounts: SocialAccount[]
  recentPosts:    Post[]
}

// ─── Platform Icons ───────────────────────────────────────────────
function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const s = `${size}px`
  if (platform === 'facebook') return (
    <svg viewBox="0 0 24 24" fill="#1877F2" style={{ width: s, height: s }} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
  if (platform === 'instagram') return (
    <svg viewBox="0 0 24 24" style={{ width: s, height: s }} aria-hidden="true">
      <defs>
        <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F58529"/>
          <stop offset="50%"  stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-g)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (platform === 'linkedin') return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" style={{ width: s, height: s }} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
  return null
}

// ─── KPI Card ─────────────────────────────────────────────────────
function KpiCard({
  label, sub, end, formatter, accent, delay,
}: {
  label: string
  sub?: string
  end: number
  formatter?: (n: number) => string
  accent?: string
  delay?: number
}) {
  return (
    <FadeContent delay={delay}>
      <div className="glass-card p-6 flex flex-col gap-1.5 cursor-default">
        <p
          className="font-body text-xs font-semibold uppercase tracking-[0.6px]"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p
          className="font-mono-num font-bold leading-none mt-1"
          style={{ fontSize: '2rem', color: accent ?? 'var(--text)' }}
        >
          <CountUp end={end} formatter={formatter} delay={delay} />
        </p>
        {sub && (
          <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
            {sub}
          </p>
        )}
      </div>
    </FadeContent>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  published: { bg: 'rgba(22,199,132,0.12)', color: '#16C784' },
  scheduled: { bg: 'rgba(99,102,241,0.12)', color: '#6366F1' },
  draft:     { bg: 'var(--border)',         color: 'var(--text-muted)' },
  failed:    { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444' },
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft
  return (
    <span
      className="badge whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color, opacity: 0.8 }}
      />
      {label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function DashboardClient({
  userName,
  totalPosts,
  publishedPosts,
  totalReach,
  totalLikes,
  totalComments,
  socialAccounts,
  recentPosts,
}: DashboardClientProps) {
  const { t, fmtDate, fmtRelative, locale } = useI18n()

  const statusLabel: Record<string, string> = {
    published: t('status.published'),
    scheduled: t('status.scheduled'),
    draft:     t('status.draft'),
    failed:    t('status.failed'),
  }

  const fmtNumber = (n: number) =>
    new Intl.NumberFormat(locale, { notation: n >= 10000 ? 'compact' : 'standard' }).format(n)

  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  }).format(new Date())
  // Capitalise first letter
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1
            className="font-display font-bold"
            style={{ fontSize: '1.375rem', color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            <BlurText text={t('dashboard.greeting', { name: userName })} delay={0} />
          </h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {todayStr} · {t('dashboard.subtitle')}
          </p>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 p-8 flex flex-col gap-8">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={t('dashboard.metrics.totalPosts')}
            sub={t('dashboard.metrics.totalPostsSub')}
            end={totalPosts}
            delay={0}
          />
          <KpiCard
            label={t('dashboard.metrics.published')}
            sub={t('dashboard.metrics.publishedSub')}
            end={publishedPosts}
            accent="#16C784"
            delay={80}
          />
          <KpiCard
            label={t('dashboard.metrics.reach')}
            sub={t('dashboard.metrics.reachSub')}
            end={totalReach}
            formatter={fmtNumber}
            accent="#6366F1"
            delay={160}
          />
          <KpiCard
            label={t('dashboard.metrics.interactions')}
            sub={t('dashboard.metrics.interactionsSub', {
              likes:    totalLikes,
              comments: totalComments,
            })}
            end={totalLikes + totalComments}
            formatter={fmtNumber}
            delay={240}
          />
        </div>

        {/* Connected accounts */}
        <FadeContent delay={320}>
          <section className="glass-card p-6">
            <h2
              className="font-display text-sm font-semibold mb-4"
              style={{ color: 'var(--text)' }}
            >
              {t('dashboard.accounts.title')}
            </h2>

            {socialAccounts.length === 0 ? (
              <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('dashboard.accounts.empty')}{' '}
                <Link
                  href="/cuentas"
                  className="underline cursor-pointer transition-colors duration-150"
                  style={{ color: '#16C784' }}
                >
                  {t('dashboard.accounts.connectNow')}
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {socialAccounts.map((acc) => (
                  <div
                    key={acc.platform}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl cursor-default
                               transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: 'var(--bg-surface)',
                      border:     '1px solid var(--border)',
                    }}
                  >
                    <PlatformIcon platform={acc.platform} size={15} />
                    <span
                      className="font-body text-sm font-medium capitalize"
                      style={{ color: 'var(--text)' }}
                    >
                      {acc.profileName ?? acc.platform}
                    </span>
                    {/* Pulsing status dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-accent flex-shrink-0"
                      style={{ background: '#16C784' }}
                      aria-label={t('status.connected')}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </FadeContent>

        {/* Recent posts */}
        <FadeContent delay={400}>
          <section className="glass-card overflow-hidden">
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2
                className="font-display text-sm font-semibold"
                style={{ color: 'var(--text)' }}
              >
                {t('dashboard.recentPosts.title')}
              </h2>
            </div>

            {recentPosts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('dashboard.recentPosts.empty')}
                </p>
              </div>
            ) : (
              <ul role="list">
                {recentPosts.map((post, i) => (
                  <li
                    key={post.id}
                    className="px-6 py-4 flex items-center gap-4 transition-colors duration-150"
                    style={{
                      borderBottom: i < recentPosts.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Platform icon */}
                    <div className="flex-shrink-0">
                      <PlatformIcon platform={post.platform} size={16} />
                    </div>

                    {/* Content */}
                    <p
                      className="flex-1 font-body text-sm truncate"
                      style={{ color: 'var(--text-muted)', minWidth: 0 }}
                      title={post.content}
                    >
                      {post.content}
                    </p>

                    {/* Metrics + badge */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {post.likes !== null && (
                        <span
                          className="font-mono-num text-xs hidden sm:block"
                          style={{ color: 'var(--text-subtle)' }}
                        >
                          {new Intl.NumberFormat(locale).format(post.likes)} likes
                        </span>
                      )}
                      {(post.publishedAt ?? post.likes !== null) && (
                        <span
                          className="font-body text-xs hidden md:block"
                          style={{ color: 'var(--text-subtle)' }}
                        >
                          {post.publishedAt
                            ? fmtDate(post.publishedAt, { day: 'numeric', month: 'short' })
                            : '—'}
                        </span>
                      )}
                      <StatusBadge
                        status={post.status}
                        label={statusLabel[post.status] ?? post.status}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </FadeContent>

      </div>
    </div>
  )
}
