'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────
export interface PostItem {
  id:          string
  platform:    string
  content:     string
  imageUrl:    string | null
  status:      string
  publishedAt: string | null
  scheduledFor: string | null
  likes:       number | null
  comments:    number | null
  shares:      number | null
  reach:       number | null
  createdAt:   string
}

interface PublicacionesClientProps {
  posts:       PostItem[]
  total:       number
  page:        number
  pageSize:    number
  platform:    string
  status:      string
  dateFrom:    string
  dateTo:      string
}

// ─── Platform Icons ───────────────────────────────────────────────
function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  if (platform === 'facebook') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <linearGradient id={`ig-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F58529"/><stop offset="50%" stopColor="#DD2A7B"/><stop offset="100%" stopColor="#8134AF"/>
          </linearGradient>
        </defs>
        <path fill={`url(#ig-${size})`} d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  }
  if (platform === 'linkedin') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
  return null
}

// ─── Filters Component ────────────────────────────────────────────
function Filters({
  platform, status, dateFrom, dateTo, onApply, loading,
}: {
  platform: string; status: string; dateFrom: string; dateTo: string
  onApply: (f: Record<string, string>) => void; loading: boolean
}) {
  const [form, setForm] = useState({ platform, status, dateFrom, dateTo })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
      {/* Platform */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">Plataforma</label>
        <select
          value={form.platform}
          onChange={e => set('platform', e.target.value)}
          className="input-base py-2 cursor-pointer"
        >
          <option value="">Todas</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">Estado</label>
        <select
          value={form.status}
          onChange={e => set('status', e.target.value)}
          className="input-base py-2 cursor-pointer"
        >
          <option value="">Todos</option>
          <option value="published">Publicado</option>
          <option value="scheduled">Programado</option>
          <option value="draft">Borrador</option>
          <option value="failed">Fallido</option>
        </select>
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">Desde</label>
        <input type="date" value={form.dateFrom} onChange={e => set('dateFrom', e.target.value)} className="input-base py-2" />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">Hasta</label>
        <input type="date" value={form.dateTo} onChange={e => set('dateTo', e.target.value)} className="input-base py-2" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pb-0.5">
        <button
          onClick={() => onApply(form)}
          disabled={loading}
          className="btn-primary py-2"
        >
          {loading ? <span className="w-4 h-4 rounded-full border-2 border-[#003d1f]/30 border-t-[#003d1f] sp" /> : 'Filtrar'}
        </button>
        <button
          onClick={() => {
            const reset = { platform: '', status: '', dateFrom: '', dateTo: '' }
            setForm(reset)
            onApply(reset)
          }}
          className="btn-secondary py-2"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function PublicacionesClient({
  posts, total, page, pageSize, platform, status, dateFrom, dateTo,
}: PublicacionesClientProps) {
  const router         = useRouter()
  const pathname       = usePathname()
  const searchParams   = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  function updateParams(updates: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === undefined) params.delete(k)
      else params.set(k, String(v))
    })
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleFilterApply(filters: Record<string, string>) {
    updateParams({ ...filters, page: 1 })
  }

  const statusVariant: Record<string, 'published' | 'scheduled' | 'draft' | 'failed'> = {
    published: 'published',
    scheduled: 'scheduled',
    draft:     'draft',
    failed:    'failed',
  }

  const platformLabel: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn',
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Filters */}
      <Filters
        platform={platform}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onApply={handleFilterApply}
        loading={isPending}
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-3 border-b border-dark-border grid grid-cols-[60px_1fr_140px_120px_140px_180px] gap-4 text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">
          <span>Imagen</span>
          <span>Texto</span>
          <span>Plataforma</span>
          <span>Estado</span>
          <span>Fecha</span>
          <span>Métricas</span>
        </div>

        {/* Rows */}
        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-ink-muted mx-auto mb-3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[14px] text-ink-secondary">No hay publicaciones con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="w-full px-6 py-4 grid grid-cols-[60px_1fr_140px_120px_140px_180px] gap-4 items-center hover:bg-white/[0.025] transition-colors text-left cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-surface border border-dark-border flex items-center justify-center flex-shrink-0">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-ink-muted">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>

                {/* Content */}
                <p className="text-[13px] text-ink-secondary line-clamp-2 text-left">
                  {post.content}
                </p>

                {/* Platform */}
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} />
                  <span className="text-[13px] text-ink-primary capitalize">
                    {platformLabel[post.platform] ?? post.platform}
                  </span>
                </div>

                {/* Status */}
                <Badge variant={statusVariant[post.status] ?? 'draft'} />

                {/* Date */}
                <span className="text-[12px] text-ink-secondary">
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), "d MMM yyyy, HH:mm", { locale: es })
                    : post.scheduledFor
                    ? format(new Date(post.scheduledFor), "d MMM yyyy, HH:mm", { locale: es })
                    : '—'}
                </span>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-[12px] text-ink-muted">
                  <span title="Likes">♥ {post.likes ?? 0}</span>
                  <span title="Comentarios">💬 {post.comments ?? 0}</span>
                  <span title="Alcance">👁 {post.reach ?? 0}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
            <p className="text-[12px] text-ink-muted">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} publicaciones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateParams({ page: page - 1 })}
                disabled={page <= 1 || isPending}
                className="btn-secondary py-1.5 px-3 text-[12px] disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-[13px] text-ink-secondary px-2">{page} / {totalPages}</span>
              <button
                onClick={() => updateParams({ page: page + 1 })}
                disabled={page >= totalPages || isPending}
                className="btn-secondary py-1.5 px-3 text-[12px] disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title="Detalle de publicación"
        size="lg"
      >
        {selectedPost && (
          <div className="flex flex-col gap-5">
            {/* Image */}
            {selectedPost.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-dark-border max-h-72 flex items-center justify-center bg-dark-surface">
                <Image
                  src={selectedPost.imageUrl}
                  alt="Post image"
                  width={600}
                  height={300}
                  className="object-contain max-h-72 w-auto"
                />
              </div>
            )}

            {/* Platform + status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dark-border bg-white/[0.03]">
                <PlatformIcon platform={selectedPost.platform} size={18} />
                <span className="text-[13px] font-medium text-ink-primary capitalize">
                  {platformLabel[selectedPost.platform] ?? selectedPost.platform}
                </span>
              </div>
              <Badge variant={statusVariant[selectedPost.status] ?? 'draft'} dot />
            </div>

            {/* Content */}
            <div>
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px] mb-2">Contenido</p>
              <p className="text-[14px] text-ink-secondary leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              {selectedPost.publishedAt && (
                <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
                  <p className="text-[11px] text-ink-muted uppercase tracking-[0.5px] mb-1">Publicado</p>
                  <p className="text-[13px] text-ink-primary font-medium">
                    {format(new Date(selectedPost.publishedAt), "d MMMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
              )}
              {selectedPost.scheduledFor && (
                <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
                  <p className="text-[11px] text-ink-muted uppercase tracking-[0.5px] mb-1">Programado para</p>
                  <p className="text-[13px] text-ink-primary font-medium">
                    {format(new Date(selectedPost.scheduledFor), "d MMMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div>
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px] mb-3">Métricas</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Likes',       value: selectedPost.likes   ?? 0 },
                  { label: 'Comentarios', value: selectedPost.comments ?? 0 },
                  { label: 'Shares',      value: selectedPost.shares  ?? 0 },
                  { label: 'Alcance',     value: selectedPost.reach   ?? 0 },
                ].map(m => (
                  <div key={m.label} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border text-center">
                    <p className="text-[22px] font-bold text-ink-primary">{m.value.toLocaleString()}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
