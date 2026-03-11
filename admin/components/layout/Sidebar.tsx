'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import clsx from 'clsx'
import { useI18n } from '@/lib/i18n'

// ─── Icons ────────────────────────────────────────────────────────
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────
interface SidebarProps {
  userName?:  string | null
  userEmail?: string | null
  plan?:      string
}

const PLAN_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  basic:      { bg: 'rgba(255,255,255,0.06)',  color: 'rgba(255,255,255,0.40)', border: 'rgba(255,255,255,0.08)' },
  pro:        { bg: 'rgba(0,214,114,0.12)',    color: '#00d672',               border: 'rgba(0,214,114,0.25)' },
  enterprise: { bg: 'rgba(124,99,248,0.12)',   color: '#7c63f8',               border: 'rgba(124,99,248,0.25)' },
}

const LOCALES = [
  { code: 'es' as const, label: 'ES' },
  { code: 'en' as const, label: 'EN' },
]

export default function Sidebar({ userName, userEmail, plan = 'basic' }: SidebarProps) {
  const pathname                 = usePathname()
  const { t, locale, setLocale } = useI18n()

  const NAV_LINKS = [
    { href: '/dashboard',     label: t('nav.dashboard'),    icon: <IconGrid /> },
    { href: '/cuentas',       label: t('nav.accounts'),     icon: <IconLink /> },
    { href: '/publicaciones', label: t('nav.posts'),        icon: <IconFile /> },
    { href: '/suscripcion',   label: t('nav.subscription'), icon: <IconCreditCard /> },
  ]

  const badge   = PLAN_BADGE[plan] ?? PLAN_BADGE.basic
  const initial = (userName?.[0] ?? userEmail?.[0] ?? 'U').toUpperCase()

  return (
    <aside
      className="sticky top-0 h-screen flex flex-col w-[256px] border-r border-[var(--border)] flex-shrink-0 overflow-hidden"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* ── Ambient glow layers ── */}
      {/* Top accent line: green → purple */}
      <div
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        style={{ height: '1px', background: 'linear-gradient(90deg, #00d672 0%, #7c63f8 60%, transparent 100%)' }}
        aria-hidden="true"
      />
      {/* Top-left radial glow */}
      <div
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,214,114,0.055) 0%, transparent 65%)' }}
        aria-hidden="true"
      />
      {/* Bottom-right subtle purple glow */}
      <div
        className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,99,248,0.04) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* ── Logo ── */}
      <div className="h-[72px] flex items-center gap-3 px-5 border-b border-[var(--border)] flex-shrink-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/smartpost_logo_icon_bg.png"
          alt="SmartPost"
          width={34}
          height={34}
          className="rounded-[10px] flex-shrink-0"
          style={{ boxShadow: '0 0 18px rgba(0,214,114,0.30), 0 4px 10px rgba(0,0,0,0.3)' }}
        />
        <div className="min-w-0">
          <p
            className="text-[14px] font-extrabold tracking-tight leading-none"
            style={{
              background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SmartPost
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#00d672', boxShadow: '0 0 5px rgba(0,214,114,0.8)' }}
            />
            <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>
              {t('nav.adminPanel')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── scrollable, flex-1 with min-h-0 */}
      <nav
        className="flex-1 min-h-0 overflow-y-auto px-3 py-5 flex flex-col z-10"
        aria-label="Navegación principal"
        style={{ scrollbarWidth: 'none' }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-[1.6px] px-3 mb-3"
          style={{ color: 'var(--text-muted)', opacity: 0.35 }}
        >
          Menú
        </p>

        <div className="flex flex-col gap-0.5">
          {NAV_LINKS.map(link => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl',
                  'text-[13px] font-medium transition-all duration-200 cursor-pointer',
                )}
                style={{
                  color:      isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0,214,114,0.18) 0%, rgba(0,214,114,0.06) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(0,214,114,0.20)'
                    : '1px solid transparent',
                  boxShadow: isActive
                    ? '0 2px 12px rgba(0,214,114,0.08), inset 0 1px 0 rgba(0,214,114,0.10)'
                    : 'none',
                }}
              >
                {/* Icon chip */}
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    'transition-all duration-200',
                    !isActive && 'group-hover:bg-white/5',
                  )}
                  style={isActive ? {
                    background: 'rgba(0,214,114,0.20)',
                    color:      '#00d672',
                    boxShadow:  '0 0 14px rgba(0,214,114,0.25)',
                  } : {
                    color: 'var(--text-muted)',
                  }}
                >
                  {link.icon}
                </span>

                <span className={clsx('transition-all duration-200', !isActive && 'group-hover:text-white/70')}>
                  {link.label}
                </span>

                {/* Glowing pill indicator */}
                {isActive && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width:     '5px',
                      height:    '5px',
                      background: '#00d672',
                      boxShadow: '0 0 8px 2px rgba(0,214,114,0.55)',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Bottom section ── ALWAYS visible, never scrolls away */}
      <div className="border-t border-[var(--border)] p-3 flex flex-col gap-2 flex-shrink-0 z-10">

        {/* User row */}
        <div className="flex items-center gap-2.5 px-1.5 py-1">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7c63f8 0%, #5e48d6 100%)',
                boxShadow:  '0 0 12px rgba(124,99,248,0.40)',
              }}
            >
              {initial}
            </div>
            {/* Online dot */}
            <span
              className="absolute -bottom-px -right-px w-2 h-2 rounded-full border"
              style={{
                background:  '#00d672',
                borderColor: 'var(--bg-card)',
                boxShadow:   '0 0 5px rgba(0,214,114,0.7)',
              }}
            />
          </div>

          {/* Name + plan */}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: 'var(--text)' }}>
              {userName ?? 'Usuario'}
            </p>
            <span
              className="text-[9px] font-bold px-1.5 py-px rounded-full capitalize inline-block mt-0.5 leading-tight"
              style={{
                background: badge.bg,
                color:      badge.color,
                border:     `1px solid ${badge.border}`,
              }}
            >
              {plan}
            </span>
          </div>
        </div>

        {/* Language segmented control + Logout */}
        <div className="flex items-center gap-1.5">
          {/* Segmented language control */}
          <div
            className="flex flex-1 rounded-xl overflow-hidden p-0.5 gap-0.5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            {LOCALES.map(l => {
              const isLangActive = locale === l.code
              return (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className="flex-1 py-1.5 rounded-[10px] text-[11px] font-bold transition-all duration-150 cursor-pointer"
                  style={{
                    background: isLangActive ? 'rgba(0,214,114,0.15)' : 'transparent',
                    color:      isLangActive ? '#00d672' : 'var(--text-muted)',
                    boxShadow:  isLangActive ? 'inset 0 1px 0 rgba(0,214,114,0.10)' : 'none',
                  }}
                  aria-pressed={isLangActive}
                  aria-label={`Idioma ${l.label}`}
                >
                  {l.label}
                </button>
              )
            })}
          </div>

          {/* Logout icon button */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 flex-shrink-0"
            style={{
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border)',
              color:      'var(--text-muted)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = 'rgba(239,68,68,0.10)'
              e.currentTarget.style.color       = '#f87171'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.22)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'var(--bg-surface)'
              e.currentTarget.style.color       = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
          >
            <IconLogout />
          </button>
        </div>

      </div>
    </aside>
  )
}
