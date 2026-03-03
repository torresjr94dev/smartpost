'use client'

import { useState } from 'react'
import { differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────
interface SocialAccount {
  id:             string
  platform:       string
  isActive:       boolean
  tokenExpiresAt: string | null
  profileName:    string | null
  profileImage:   string | null
  connectedAt:    string
}

interface CuentasClientProps {
  accounts:      SocialAccount[]
  facebookAuthUrl: string
  linkedinAuthUrl: string
}

// ─── Platform Icons ───────────────────────────────────────────────
function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-g)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

// ─── Account Card ─────────────────────────────────────────────────
function AccountCard({
  platform,
  account,
  onConnect,
  onDisconnect,
  loading,
}: {
  platform:     string
  account:      SocialAccount | null
  onConnect:    () => void
  onDisconnect: (id: string) => void
  loading:      boolean
}) {
  const isConnected = account?.isActive ?? false

  // Days until expiry
  const daysLeft = account?.tokenExpiresAt
    ? differenceInDays(new Date(account.tokenExpiresAt), new Date())
    : null

  const isExpired   = daysLeft !== null && daysLeft <= 0
  const isExpiring  = daysLeft !== null && daysLeft > 0 && daysLeft <= 7

  const PlatformIconMap: Record<string, React.ReactNode> = {
    facebook:  <FacebookIcon size={24} />,
    instagram: <InstagramIcon size={24} />,
    linkedin:  <LinkedInIcon size={24} />,
  }

  const platformLabel: Record<string, string> = {
    facebook:  'Facebook',
    instagram: 'Instagram',
    linkedin:  'LinkedIn',
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-dark-surface flex items-center justify-center border border-dark-border">
            {PlatformIconMap[platform]}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-ink-primary">{platformLabel[platform]}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">
              {platform === 'facebook' ? 'Pages + Business API'
                : platform === 'instagram' ? 'Business Account'
                : 'Profile (60 días)'}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {isConnected && !isExpired && (
          <span className="badge bg-brand-green/15 text-brand-green text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-green" />
            Conectado
          </span>
        )}
        {isExpired && (
          <span className="badge bg-red-500/15 text-red-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Expirado
          </span>
        )}
        {!isConnected && !isExpired && (
          <span className="badge bg-white/10 text-ink-muted text-[11px]">
            No conectado
          </span>
        )}
      </div>

      {/* Profile info (when connected) */}
      {isConnected && account && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
          {account.profileImage ? (
            <Image
              src={account.profileImage}
              alt={account.profileName ?? 'Perfil'}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-purple flex items-center justify-center text-[13px] font-bold text-white">
              {(account.profileName?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[13px] font-medium text-ink-primary">{account.profileName ?? 'Cuenta'}</p>
            <p className="text-[11px] text-ink-muted">
              Conectado {format(new Date(account.connectedAt), "d MMM yyyy", { locale: es })}
            </p>
          </div>
        </div>
      )}

      {/* Expiry warning (LinkedIn) */}
      {isExpiring && !isExpired && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[13px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Tu token expira en <strong>{daysLeft} días</strong>. Reconecta para no interrumpir el servicio.
        </div>
      )}

      {/* Expiry error */}
      {isExpired && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Token expirado. Reconecta tu cuenta para restaurar el servicio.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {(!isConnected || isExpired) ? (
          <button
            onClick={onConnect}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#003d1f]/30 border-t-[#003d1f] sp" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                {isExpired ? 'Reconectar' : 'Conectar'}
              </>
            )}
          </button>
        ) : (
          <>
            {isExpiring && (
              <button onClick={onConnect} disabled={loading} className="btn-secondary flex-1">
                Reconectar
              </button>
            )}
            <button
              onClick={() => account && onDisconnect(account.id)}
              disabled={loading}
              className="btn-danger flex-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/>
              </svg>
              Desconectar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────
export default function CuentasClient({
  accounts,
  facebookAuthUrl,
  linkedinAuthUrl,
}: CuentasClientProps) {
  const [localAccounts, setLocalAccounts] = useState<SocialAccount[]>(accounts)
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)
  const [error, setError] = useState('')

  const getAccount = (platform: string) =>
    localAccounts.find(a => a.platform === platform && a.isActive) ?? null

  // Navigate to OAuth URL
  function handleConnect(platform: string, url: string) {
    setLoadingPlatform(platform)
    window.location.href = url
  }

  async function handleDisconnect(accountId: string, platform: string) {
    setError('')
    setLoadingPlatform(platform)
    try {
      const res = await fetch('/api/auth/disconnect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accountId }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Error al desconectar')
      }
      // Mark as inactive locally
      setLocalAccounts(prev =>
        prev.map(a => a.id === accountId ? { ...a, isActive: false } : a)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoadingPlatform(null)
    }
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Facebook */}
        <AccountCard
          platform="facebook"
          account={getAccount('facebook')}
          onConnect={() => handleConnect('facebook', facebookAuthUrl)}
          onDisconnect={(id) => handleDisconnect(id, 'facebook')}
          loading={loadingPlatform === 'facebook'}
        />

        {/* Instagram */}
        <AccountCard
          platform="instagram"
          account={getAccount('instagram')}
          onConnect={() => handleConnect('facebook', facebookAuthUrl)}
          onDisconnect={(id) => handleDisconnect(id, 'instagram')}
          loading={loadingPlatform === 'instagram'}
        />

        {/* LinkedIn */}
        <AccountCard
          platform="linkedin"
          account={getAccount('linkedin')}
          onConnect={() => handleConnect('linkedin', linkedinAuthUrl)}
          onDisconnect={(id) => handleDisconnect(id, 'linkedin')}
          loading={loadingPlatform === 'linkedin'}
        />
      </div>
    </div>
  )
}
