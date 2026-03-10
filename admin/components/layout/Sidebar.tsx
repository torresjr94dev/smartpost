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
         strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px]">
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
  { code: 'es' as const, label: 'ES', flag: '🇲🇽' },
  { code: 'en' as const, label: 'EN', flag: '🇺🇸' },
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
      className="sticky top-0 h-screen flex flex-col w-[256px] border-r border-[var(--border)] flex-shrink-0 overflow-y-auto"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* ── Logo ── */}
      <div className="h-[72px] flex items-center gap-3 px-5 border-b border-[var(--border)] flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/smartpost_logo_icon_bg.png"
          alt="SmartPost"
          width={36}
          height={36}
          className="rounded-xl flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(0,214,114,0.35), 0 4px 12px rgba(0,0,0,0.3)' }}
        />
        <div>
          <p className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            SmartPost
          </p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {t('nav.adminPanel')}
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5" aria-label="Navegación principal">
        <p className="text-[9px] font-bold uppercase tracking-[1.4px] px-3 mb-3"
           style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
          Menú
        </p>

        {NAV_LINKS.map(link => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-[14px]',
                'text-[13px] font-medium transition-all duration-200 cursor-pointer',
              )}
              style={{
                color:      isActive ? '#00d672' : 'var(--text-muted)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(0,214,114,0.10) 0%, rgba(0,214,114,0.03) 100%)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(0,214,114,0.13)'
                  : '1px solid transparent',
                boxShadow: isActive
                  ? 'inset 0 1px 0 rgba(0,214,114,0.07), 0 1px 6px rgba(0,0,0,0.12)'
                  : 'none',
              }}
            >
              {/* Icon chip */}
              <span
                className={clsx(
                  'w-[34px] h-[34px] rounded-xl flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200',
                  !isActive && 'group-hover:bg-[var(--border)]'
                )}
                style={isActive ? {
                  background: 'rgba(0,214,114,0.14)',
                  color:      '#00d672',
                  boxShadow:  '0 0 16px rgba(0,214,114,0.20), 0 2px 6px rgba(0,0,0,0.15)',
                } : {
                  color: 'var(--text-muted)',
                }}
              >
                {link.icon}
              </span>

              <span>{link.label}</span>

              {/* Active indicator — glowing dot on the right */}
              {isActive && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00d672', boxShadow: '0 0 6px rgba(0,214,114,0.8)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="border-t border-[var(--border)] p-3 flex flex-col gap-2 flex-shrink-0">

        {/* Profile card */}
        <div
          className="relative overflow-hidden rounded-2xl px-3 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(124,99,248,0.09) 0%, rgba(0,214,114,0.04) 100%)',
            border:     '1px solid rgba(124,99,248,0.15)',
          }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7c63f8 0%, #5e48d6 100%)',
                boxShadow:  '0 0 16px rgba(124,99,248,0.40), 0 2px 8px rgba(0,0,0,0.30)',
              }}
            >
              {initial}
            </div>
            {/* Online dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background:  '#00d672',
                borderColor: 'var(--bg-card)',
                boxShadow:   '0 0 6px rgba(0,214,114,0.6)',
              }}
            />
          </div>

          {/* Name + plan */}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
              {userName ?? 'Usuario'}
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize inline-block mt-0.5"
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

        {/* Language + Logout row */}
        <div className="flex items-center gap-1.5">
          {LOCALES.map(l => {
            const isLangActive = locale === l.code
            return (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all duration-150 flex-1"
                style={{
                  background: isLangActive ? 'rgba(0,214,114,0.10)' : 'var(--bg-surface)',
                  color:      isLangActive ? '#00d672' : 'var(--text-muted)',
                  border:     isLangActive ? '1px solid rgba(0,214,114,0.20)' : '1px solid var(--border)',
                }}
                aria-pressed={isLangActive}
                aria-label={`Idioma ${l.label}`}
              >
                <span style={{ fontSize: '13px', lineHeight: 1 }} aria-hidden="true">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            )
          })}

          {/* Logout — compact icon button */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 flex-shrink-0"
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
