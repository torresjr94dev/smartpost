'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import clsx from 'clsx'

// ─── SVG Nav Icons ────────────────────────────────────────────────
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
    </svg>
  )
}

// ─── Nav links config ─────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/dashboard',     label: 'Dashboard',      icon: <IconGrid /> },
  { href: '/cuentas',       label: 'Cuentas',        icon: <IconLink /> },
  { href: '/publicaciones', label: 'Publicaciones',  icon: <IconFile /> },
  { href: '/suscripcion',   label: 'Suscripción',    icon: <IconCreditCard /> },
]

// ─── Component ────────────────────────────────────────────────────
interface SidebarProps {
  userName?: string | null
  userEmail?: string | null
  plan?: string
}

export default function Sidebar({ userName, userEmail, plan = 'basic' }: SidebarProps) {
  const pathname = usePathname()

  const planBadge: Record<string, string> = {
    basic:      'bg-ink-muted/20 text-ink-secondary',
    pro:        'bg-brand-green/15 text-brand-green',
    enterprise: 'bg-brand-purple/15 text-brand-purple',
  }

  return (
    <aside className="flex flex-col w-[240px] min-h-screen bg-dark-card border-r border-dark-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-green flex items-center justify-center text-[#003d1f] flex-shrink-0"
             style={{ boxShadow: '0 4px 16px rgba(0,214,114,0.3)' }}>
          <IconWhatsApp />
        </div>
        <div>
          <p className="text-[15px] font-bold text-ink-primary tracking-tight">SmartPost</p>
          <p className="text-[10px] text-ink-muted">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Navegación principal">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'sidebar-link',
              pathname.startsWith(link.href) && link.href !== '/' && 'active'
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-dark-border mx-3" />

      {/* Bottom: user + logout */}
      <div className="px-3 py-4 flex flex-col gap-1">
        {/* User info */}
        <div className="px-3 py-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {(userName?.[0] ?? userEmail?.[0] ?? 'U').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink-primary truncate">
              {userName ?? 'Usuario'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize', planBadge[plan] ?? planBadge.basic)}>
                {plan}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-link text-ink-muted hover:text-red-400 hover:bg-red-500/10 mt-0.5"
          aria-label="Cerrar sesión"
        >
          <IconLogout />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
