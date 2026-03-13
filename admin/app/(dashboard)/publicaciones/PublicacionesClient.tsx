'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { AnimatedList } from '@/components/animations/AnimatedList'
import { useI18n } from '@/lib/i18n'

// ─── Types ────────────────────────────────────────────────────────
export interface PostItem {
  id:           string
  platform:     string
  content:      string
  imageUrl:     string | null
  status:       string
  publishedAt:  string | null
  scheduledFor: string | null
  likes:        number | null
  comments:     number | null
  shares:       number | null
  reach:        number | null
  errorMessage: string | null
  createdAt:    string
}

interface PublicacionesClientProps {
  posts:        PostItem[]
  total:        number
  failedCount:  number
  page:         number
  pageSize:     number
  platform:     string
  status:       string
  dateFrom:     string
  dateTo:       string
}

// ─── Platform Icons ───────────────────────────────────────────────
function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const s = `${size}px`
  if (platform === 'facebook') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
  if (platform === 'instagram') return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-pub" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-pub)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (platform === 'linkedin') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
  return null
}

// ─── Metric Cell (SVG icons, no emojis) ───────────────────────────
function MetricCell({ likes, comments, reach }: { likes: number; comments: number; reach: number }) {
  return (
    <div className="flex items-center gap-3 font-mono-num text-xs" style={{ color: 'var(--text-subtle)' }}>
      <span className="flex items-center gap-1" title="Likes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
             className="w-3.5 h-3.5 flex-shrink-0">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {likes}
      </span>
      <span className="flex items-center gap-1" title="Comentarios">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
             className="w-3.5 h-3.5 flex-shrink-0">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {comments}
      </span>
      <span className="flex items-center gap-1 max-sm:hidden" title="Alcance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
             className="w-3.5 h-3.5 flex-shrink-0">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        {reach}
      </span>
    </div>
  )
}

// ─── Failed Posts Alert ───────────────────────────────────────────
function PostsFallidosAlert({
  count,
  isFilteringFailed,
  onFilter,
}: {
  count: number
  isFilteringFailed: boolean
  onFilter: () => void
}) {
  if (count === 0 || isFilteringFailed) return null

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{
        background:   'color-mix(in srgb, #ef4444 8%, var(--bg-card))',
        border:       '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'color-mix(in srgb, #ef4444 15%, transparent)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2}
             className="w-4.5 h-4.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold" style={{ color: '#ef4444' }}>
          {count === 1
            ? '1 publicación falló al publicarse'
            : `${count} publicaciones fallaron al publicarse`}
        </p>
        <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Revisa los detalles para ver el motivo del error y volver a intentarlo.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onFilter}
        className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150"
        style={{
          background: 'color-mix(in srgb, #ef4444 15%, transparent)',
          color:      '#ef4444',
          border:     '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, #ef4444 25%, transparent)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, #ef4444 15%, transparent)')}
      >
        Ver fallidas
      </button>
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────────
function Filters({
  platform, status, dateFrom, dateTo, onApply, loading,
}: {
  platform: string; status: string; dateFrom: string; dateTo: string
  onApply: (f: Record<string, string>) => void; loading: boolean
}) {
  const { t } = useI18n()
  const [form, setForm] = useState({ platform, status, dateFrom, dateTo })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-150"

  const platformOptions = [
    { value: '',          label: t('common.all') },
    { value: 'facebook',  label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin',  label: 'LinkedIn' },
  ]

  const statusOptions = [
    { value: '',          label: t('common.all') },
    { value: 'published', label: t('status.published') },
    { value: 'scheduled', label: t('status.scheduled') },
    { value: 'draft',     label: t('status.draft') },
    { value: 'failed',    label: t('status.failed') },
  ]

  return (
    <div
      className="rounded-2xl p-4 flex flex-wrap gap-3 items-end"
      style={{
        background:     'var(--bg-card)',
        border:         '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Platform */}
      <div className="min-w-[140px]">
        <Select
          label={t('posts.columns.platform')}
          value={form.platform}
          onChange={v => set('platform', v)}
          options={platformOptions}
        />
      </div>

      {/* Status */}
      <div className="min-w-[140px]">
        <Select
          label={t('posts.columns.status')}
          value={form.status}
          onChange={v => set('status', v)}
          options={statusOptions}
        />
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.6px]"
           style={{ color: 'var(--text-muted)' }}>
          Desde
        </p>
        <input
          type="date"
          value={form.dateFrom}
          onChange={e => set('dateFrom', e.target.value)}
          className={inputClass}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.6px]"
           style={{ color: 'var(--text-muted)' }}>
          Hasta
        </p>
        <input
          type="date"
          value={form.dateTo}
          onChange={e => set('dateTo', e.target.value)}
          className={inputClass}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      <div className="flex gap-2 pb-0.5">
        <button onClick={() => onApply(form)} disabled={loading} className="btn-primary py-2">
          {loading
            ? <span className="w-4 h-4 rounded-full border-2 border-[#052e1c]/25 border-t-[#052e1c] sp" />
            : t('common.filter')}
        </button>
        <button
          onClick={() => {
            const r = { platform: '', status: '', dateFrom: '', dateTo: '' }
            setForm(r); onApply(r)
          }}
          className="btn-secondary py-2"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}

// ─── Post Row ─────────────────────────────────────────────────────
function PostRow({
  post,
  isSelected,
  onClick,
  fmtDate,
  statusVariant,
}: {
  post: PostItem
  isSelected: boolean
  onClick: () => void
  fmtDate: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string
  statusVariant: Record<string, 'published' | 'scheduled' | 'draft' | 'failed'>
}) {
  const platformLabel: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn',
  }

  return (
    <button
      onClick={onClick}
      className="w-full px-5 py-3.5 grid items-center gap-4 text-left cursor-pointer
                 transition-colors duration-150"
      style={{
        gridTemplateColumns: '48px 1fr 130px 110px 120px 160px',
        background: isSelected ? 'var(--bg-surface)' : 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
      onMouseLeave={e => (e.currentTarget.style.background = isSelected ? 'var(--bg-surface)' : 'transparent')}
    >
      {/* Thumbnail */}
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {post.imageUrl ? (
          <Image src={post.imageUrl} alt="" width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <p className="font-body text-sm line-clamp-2 text-left" style={{ color: 'var(--text-muted)' }}>
        {post.content}
      </p>

      {/* Platform */}
      <div className="flex items-center gap-2">
        <PlatformIcon platform={post.platform} size={15} />
        <span className="font-body text-sm capitalize" style={{ color: 'var(--text)' }}>
          {platformLabel[post.platform] ?? post.platform}
        </span>
      </div>

      {/* Status */}
      <Badge variant={statusVariant[post.status] ?? 'draft'} />

      {/* Date */}
      <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
        {post.publishedAt
          ? fmtDate(post.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' })
          : post.scheduledFor
          ? fmtDate(post.scheduledFor, { day: 'numeric', month: 'short' })
          : '—'}
      </span>

      {/* Metrics */}
      <MetricCell
        likes={post.likes ?? 0}
        comments={post.comments ?? 0}
        reach={post.reach ?? 0}
      />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function PublicacionesClient({
  posts, total, failedCount, page, pageSize, platform, status, dateFrom, dateTo,
}: PublicacionesClientProps) {
  const { t, fmtDate } = useI18n()
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  function updateParams(updates: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '') params.delete(k)
      else params.set(k, String(v))
    })
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const statusVariant: Record<string, 'published' | 'scheduled' | 'draft' | 'failed'> = {
    published: 'published', scheduled: 'scheduled', draft: 'draft', failed: 'failed',
  }

  const platformLabel: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn',
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Failed posts alert */}
      <PostsFallidosAlert
        count={failedCount}
        isFilteringFailed={status === 'failed'}
        onFilter={() => updateParams({ status: 'failed', page: 1 })}
      />

      {/* Filters */}
      <Filters
        platform={platform} status={status} dateFrom={dateFrom} dateTo={dateTo}
        onApply={(f) => updateParams({ ...f, page: 1 })}
        loading={isPending}
      />

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:   'var(--bg-card)',
          border:       '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Table header */}
        <div
          className="px-5 py-3 grid gap-4 border-b"
          style={{
            gridTemplateColumns: '48px 1fr 130px 110px 120px 160px',
            borderColor: 'var(--border)',
          }}
        >
          {[
            t('posts.columns.content'),
            t('posts.columns.platform'),
            t('posts.columns.status'),
            t('posts.columns.date'),
            t('posts.columns.metrics'),
          ].map((col, i) => (
            <span
              key={col}
              className="font-body text-2xs font-semibold uppercase tracking-[0.6px]"
              style={{ color: 'var(--text-muted)', gridColumn: i === 0 ? '2' : undefined }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows — AnimatedList */}
        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="font-body text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              {t('posts.empty')}
            </p>
            <p className="font-body text-xs" style={{ color: 'var(--text-subtle)' }}>
              {t('posts.emptyAction')}
            </p>
          </div>
        ) : (
          <AnimatedList
            items={posts}
            renderItem={(post, _, isSelected) => (
              <PostRow
                post={post}
                isSelected={isSelected}
                onClick={() => setSelectedPost(post)}
                fmtDate={fmtDate}
                statusVariant={statusVariant}
              />
            )}
            showGradients={false}
            enableArrowNavigation={false}
            className="divide-y"
            onItemSelect={(post) => setSelectedPost(post)}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateParams({ page: page - 1 })}
                disabled={page <= 1 || isPending}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="font-body text-sm px-2" style={{ color: 'var(--text-muted)' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: page + 1 })}
                disabled={page >= totalPages || isPending}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)} title={t('posts.columns.content')} size="lg">
        {selectedPost && (
          <div className="flex flex-col gap-5">
            {selectedPost.imageUrl && (
              <div
                className="rounded-xl overflow-hidden border max-h-72 flex items-center justify-center"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              >
                <Image src={selectedPost.imageUrl} alt="" width={600} height={300}
                       className="object-contain max-h-72 w-auto" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              >
                <PlatformIcon platform={selectedPost.platform} size={16} />
                <span className="font-body text-sm capitalize" style={{ color: 'var(--text)' }}>
                  {platformLabel[selectedPost.platform] ?? selectedPost.platform}
                </span>
              </div>
              <Badge variant={statusVariant[selectedPost.status] ?? 'draft'} dot />
            </div>

            {/* Error block — only shown for failed posts */}
            {selectedPost.status === 'failed' && selectedPost.errorMessage && (
              <div
                className="rounded-xl px-4 py-3 flex gap-3"
                style={{
                  background: 'color-mix(in srgb, #ef4444 8%, var(--bg-surface))',
                  border:     '1px solid color-mix(in srgb, #ef4444 25%, transparent)',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2}
                     className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <p className="font-body text-xs font-semibold mb-0.5" style={{ color: '#ef4444' }}>
                    Error al publicar
                  </p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {selectedPost.errorMessage}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="font-body text-2xs font-semibold uppercase tracking-[0.6px] mb-2"
                 style={{ color: 'var(--text-muted)' }}>
                {t('posts.columns.content')}
              </p>
              <p className="font-body text-sm leading-relaxed whitespace-pre-wrap"
                 style={{ color: 'var(--text-muted)' }}>
                {selectedPost.content}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Likes',    value: selectedPost.likes    ?? 0 },
                { label: t('posts.columns.metrics'), value: selectedPost.comments ?? 0 },
                { label: 'Shares',   value: selectedPost.shares   ?? 0 },
                { label: 'Alcance',  value: selectedPost.reach    ?? 0 },
              ].map(m => (
                <div
                  key={m.label}
                  className="px-4 py-3 rounded-xl border text-center"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                  <p className="font-mono-num text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {m.value.toLocaleString()}
                  </p>
                  <p className="font-body text-2xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
