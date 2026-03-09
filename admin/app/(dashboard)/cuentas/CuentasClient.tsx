'use client'

import { useState, useCallback } from 'react'
import { waitForFB } from '@/components/FacebookSDKLoader'
import type { FBLoginResponse } from '@/components/FacebookSDKLoader'
import Image from 'next/image'
import { differenceInDays } from 'date-fns'
import { motion } from 'motion/react'
import { useI18n } from '@/lib/i18n'
import ShinyText from '@/components/animations/ShinyText'

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
  accounts:        SocialAccount[]
  linkedinAuthUrl: string
  /** @deprecated – kept for server-side fallback reference only */
  facebookAuthUrl?: string
}

// ─── Platform meta ────────────────────────────────────────────────
const PLATFORM_META: Record<string, { accent: string; bg: string }> = {
  facebook:  { accent: '#1877F2', bg: 'rgba(24,119,242,0.08)' },
  instagram: { accent: '#DD2A7B', bg: 'rgba(221,42,123,0.08)' },
  linkedin:  { accent: '#0A66C2', bg: 'rgba(10,102,194,0.08)' },
}

// ─── Platform Icons ───────────────────────────────────────────────
function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-card" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F58529"/>
          <stop offset="50%"  stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-card)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function LinkedInIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

const PLATFORM_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  facebook:  (s) => <FacebookIcon size={s} />,
  instagram: (s) => <InstagramIcon size={s} />,
  linkedin:  (s) => <LinkedInIcon size={s} />,
}

// ─── SVG Icons ────────────────────────────────────────────────────
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function IconPower() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4">
      <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/>
    </svg>
  )
}

function IconWarn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
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
  const { t, fmtDate } = useI18n()
  const [hovered, setHovered] = useState(false)

  const meta        = PLATFORM_META[platform] ?? { accent: '#16C784', bg: 'rgba(22,199,132,0.08)' }
  const isConnected = account?.isActive ?? false
  const daysLeft    = account?.tokenExpiresAt
    ? differenceInDays(new Date(account.tokenExpiresAt), new Date())
    : null
  const isExpired  = daysLeft !== null && daysLeft <= 0
  const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 7

  const statusBadge = isExpired
    ? { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', label: t('status.expired') }
    : isConnected
    ? { bg: 'rgba(22,199,132,0.1)', color: '#16C784', label: t('status.connected') }
    : { bg: 'var(--border)',        color: 'var(--text-muted)', label: t('status.inactive') }

  const platformDesc: Record<string, string> = {
    facebook:  t('accounts.facebook.desc'),
    instagram: t('accounts.instagram.desc'),
    linkedin:  t('accounts.linkedin.desc'),
  }

  return (
    <motion.div
      className="glass-card p-6 flex flex-col gap-5 cursor-default"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.015 : 1,
        backdropFilter: hovered ? 'blur(20px)' : 'blur(12px)',
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderColor: hovered ? meta.accent + '33' : undefined }}
    >
      {/* Accent top line on hover */}
      <motion.div
        className="absolute top-0 left-6 right-6 h-[1px] -mt-[1px] rounded-full"
        style={{ background: meta.accent }}
        animate={{ opacity: hovered ? 0.6 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0"
            style={{
              background:   hovered ? meta.bg : 'var(--bg-surface)',
              borderColor:  hovered ? meta.accent + '40' : 'var(--border)',
              transition:   'background 0.2s, border-color 0.2s',
            }}
          >
            {PLATFORM_ICONS[platform]?.(22)}
          </div>
          <div>
            <p className="font-display text-base font-semibold" style={{ color: 'var(--text)' }}>
              {hovered ? (
                <ShinyText
                  text={t(`accounts.${platform}.name`)}
                  color={meta.accent}
                  shineColor="#ffffff"
                  speed={1.5}
                />
              ) : (
                t(`accounts.${platform}.name`)
              )}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {platformDesc[platform]}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="badge text-xs whitespace-nowrap"
          style={{ background: statusBadge.bg, color: statusBadge.color }}
        >
          {isConnected && !isExpired && (
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-accent flex-shrink-0"
              style={{ background: '#16C784' }}
            />
          )}
          {statusBadge.label}
        </span>
      </div>

      {/* Profile info */}
      {isConnected && account && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          {account.profileImage ? (
            <Image
              src={account.profileImage}
              alt={account.profileName ?? 'Perfil'}
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
            >
              {(account.profileName?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {account.profileName ?? t('accounts.connectedAs')}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {fmtDate(account.connectedAt, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Expiry warning */}
      {isExpiring && !isExpired && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{
            background:  'rgba(245,158,11,0.08)',
            border:      '1px solid rgba(245,158,11,0.2)',
            color:       '#F59E0B',
          }}
        >
          <IconWarn />
          <span className="font-body text-sm">
            {t('accounts.tokenExpires')} <strong>{daysLeft} días</strong>.
          </span>
        </div>
      )}

      {/* Expiry error */}
      {isExpired && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border:     '1px solid rgba(239,68,68,0.2)',
            color:      '#EF4444',
          }}
        >
          <IconX />
          <span className="font-body text-sm">{t('status.expired')}.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {(!isConnected || isExpired) ? (
          <button onClick={onConnect} disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#052e1c]/25 border-t-[#052e1c] sp" />
            ) : (
              <><IconLink />{isExpired ? t('accounts.reconnect') : t('accounts.connect')}</>
            )}
          </button>
        ) : (
          <>
            {isExpiring && (
              <button onClick={onConnect} disabled={loading} className="btn-secondary flex-1">
                {t('accounts.reconnect')}
              </button>
            )}
            <button
              onClick={() => account && onDisconnect(account.id)}
              disabled={loading}
              className="btn-danger flex-1"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-red-400/25 border-t-red-400 sp" />
              ) : (
                <><IconPower />{t('accounts.disconnect')}</>
              )}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function CuentasClient({
  accounts,
  linkedinAuthUrl,
}: CuentasClientProps) {
  const { t } = useI18n()
  const [localAccounts, setLocalAccounts] = useState<SocialAccount[]>(accounts)
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)
  const [error, setError] = useState('')

  const getAccount = (platform: string) =>
    localAccounts.find(a => a.platform === platform && a.isActive) ?? null

  /** Facebook + Instagram: use popup via FB JS SDK */
  const handleFacebookConnect = useCallback(async () => {
    setError('')
    setLoadingPlatform('facebook')

    let FB
    try {
      FB = await waitForFB()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
      setLoadingPlatform(null)
      return
    }

    // FB.login callback must be synchronous — handle async work in a separate function
    async function onFBLogin(response: FBLoginResponse) {
      if (response.status !== 'connected' || !response.authResponse) {
        setLoadingPlatform(null)
        return
      }
      try {
        const res = await fetch('/api/auth/connect/facebook', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ accessToken: response.authResponse.accessToken }),
        })
        const data = await res.json() as { success?: boolean; hasInstagram?: boolean; error?: string }
        if (!res.ok) throw new Error(data.error ?? t('common.error'))

        window.location.reload()
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'))
        setLoadingPlatform(null)
      }
    }

    FB.login((response: FBLoginResponse) => { void onFBLogin(response) }, {
      scope: [
        'pages_manage_posts',
        'pages_read_engagement',
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list',
        'business_management',
      ].join(','),
    })
  }, [t])

  /** LinkedIn: keep existing redirect flow */
  function handleLinkedInConnect() {
    setLoadingPlatform('linkedin')
    window.location.href = linkedinAuthUrl
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
        throw new Error(data.error ?? t('common.error'))
      }
      setLocalAccounts(prev =>
        prev.map(a => a.id === accountId ? { ...a, isActive: false } : a)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setLoadingPlatform(null)
    }
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <div
          className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-xl font-body text-sm"
          style={{
            background:  'rgba(239,68,68,0.08)',
            border:      '1px solid rgba(239,68,68,0.2)',
            color:       '#EF4444',
          }}
          role="alert"
        >
          <IconX />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {(['facebook', 'instagram', 'linkedin'] as const).map(platform => (
          <AccountCard
            key={platform}
            platform={platform}
            account={getAccount(platform)}
            onConnect={
              platform === 'linkedin'
                ? handleLinkedInConnect
                : handleFacebookConnect   // facebook + instagram share same OAuth
            }
            onDisconnect={(id) => handleDisconnect(id, platform)}
            loading={loadingPlatform === platform}
          />
        ))}
      </div>
    </div>
  )
}
