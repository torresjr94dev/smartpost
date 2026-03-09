'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { BlurText } from '@/components/animations/CountUp'
import { waitForFB } from '@/components/FacebookSDKLoader'
import type { FBLoginResponse } from '@/components/FacebookSDKLoader'

// ─── SVG Icons ────────────────────────────────────────────────────
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
         strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <polyline points="20 6 9 17 4 12"/>
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

// ─── Floating Label Input ─────────────────────────────────────────
function FloatingInput({
  id, label, type = 'text', value, onChange,
  icon, autoComplete, autoFocus, rightSlot,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  autoComplete?: string
  autoFocus?: boolean
  rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || !!value

  return (
    <div
      className="relative flex items-center transition-all duration-200"
      style={{
        background:   'var(--bg-surface)',
        border:       `1px solid ${focused ? '#16C784' : 'var(--border)'}`,
        borderRadius: '10px',
        boxShadow:    focused ? '0 0 0 3px rgba(22,199,132,0.12)' : 'none',
      }}
    >
      {/* Leading icon */}
      <span
        className="ml-3.5 transition-colors duration-150"
        style={{ color: focused ? '#16C784' : 'var(--text-subtle)' }}
      >
        {icon}
      </span>

      {/* Input + floating label */}
      <div className="relative flex-1 px-3">
        <label
          htmlFor={id}
          className="absolute left-3 pointer-events-none select-none font-body transition-all duration-200"
          style={{
            fontSize:  floated ? '10px' : '13px',
            top:       floated ? '5px'  : '50%',
            transform: floated ? 'none' : 'translateY(-50%)',
            color:     focused ? '#16C784' : 'var(--text-subtle)',
            fontWeight: floated ? 500 : 400,
          }}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm outline-none font-body"
          style={{
            color:       'var(--text)',
            paddingTop:  floated ? '16px' : '0',
            paddingBottom: '6px',
            caretColor:  '#16C784',
          }}
        />
      </div>

      {rightSlot && <span className="mr-2 flex-shrink-0">{rightSlot}</span>}
    </div>
  )
}

// ─── Brand features list ──────────────────────────────────────────
function FeatureItem({ text, delay }: { text: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-3 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(22,199,132,0.15)', color: '#16C784' }}
      >
        <IconCheck />
      </span>
      <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
        {text}
      </span>
    </div>
  )
}

// ─── Abstract background pattern (left panel) ─────────────────────
function AbstractPattern() {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="200" stroke="#16C784" strokeWidth="1"/>
      <circle cx="300" cy="300" r="300" stroke="#16C784" strokeWidth="0.5"/>
      <circle cx="300" cy="300" r="100" stroke="#6366F1" strokeWidth="1"/>
      <circle cx="150" cy="150" r="80"  stroke="#16C784" strokeWidth="0.75"/>
      <circle cx="450" cy="450" r="100" stroke="#6366F1" strokeWidth="0.75"/>
      <line x1="0" y1="300" x2="600" y2="300" stroke="#16C784" strokeWidth="0.5"/>
      <line x1="300" y1="0" x2="300" y2="600" stroke="#16C784" strokeWidth="0.5"/>
      <line x1="0" y1="0" x2="600" y2="600" stroke="#6366F1" strokeWidth="0.35"/>
      <line x1="600" y1="0" x2="0" y2="600" stroke="#6366F1" strokeWidth="0.35"/>
    </svg>
  )
}

// ─── Login form (inner) ───────────────────────────────────────────
function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fbLoading, setFbLoading] = useState(false)
  const [error, setError]       = useState('')

  async function handleFacebookLogin() {
    setError('')
    setFbLoading(true)

    let FB
    try {
      FB = await waitForFB()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Facebook SDK no disponible.')
      setFbLoading(false)
      return
    }

    // FB.login callback must be synchronous — handle async work in a separate function
    async function onFBLogin(response: FBLoginResponse) {
      if (response.status !== 'connected' || !response.authResponse) {
        setFbLoading(false)
        return
      }
      try {
        const res = await fetch('/api/auth/facebook-login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ accessToken: response.authResponse.accessToken }),
        })
        const data = await res.json() as { success?: boolean; error?: string }
        if (!res.ok) {
          if (data.error === 'account_not_found') {
            setError('No existe una cuenta con este Facebook. Inicia sesión con tu correo.')
          } else {
            setError('Error al iniciar sesión con Facebook.')
          }
          setFbLoading(false)
          return
        }
        router.push('/dashboard')
        router.refresh()
      } catch {
        setError(t('auth.errorConnection'))
        setFbLoading(false)
      }
    }

    FB.login((response: FBLoginResponse) => { void onFBLogin(response) }, { scope: 'email,public_profile' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError(t('auth.errorEmpty'))
      return
    }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        setError(t('auth.errorCredentials'))
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t('auth.errorConnection'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FloatingInput
        id="email"
        label={t('auth.email')}
        type="email"
        value={form.email}
        onChange={v => setForm(f => ({ ...f, email: v }))}
        icon={<IconMail />}
        autoComplete="email"
        autoFocus
      />

      <FloatingInput
        id="password"
        label={t('auth.password')}
        type={showPass ? 'text' : 'password'}
        value={form.password}
        onChange={v => setForm(f => ({ ...f, password: v }))}
        icon={<IconLock />}
        autoComplete="current-password"
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="p-1.5 cursor-pointer transition-colors duration-150 rounded-lg"
            style={{ color: 'var(--text-subtle)' }}
            aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
          >
            <IconEye open={showPass} />
          </button>
        }
      />

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border:     '1px solid rgba(239,68,68,0.2)',
            color:      '#EF4444',
          }}
          role="alert"
          aria-live="polite"
        >
          <IconAlert />
          <span className="font-body text-sm">{error}</span>
        </div>
      )}

      {/* CTA — full-width shimmer button */}
      <button
        type="submit"
        disabled={loading || fbLoading}
        className="relative w-full h-12 overflow-hidden cursor-pointer select-none
                   transition-all duration-200 active:scale-[0.98]
                   disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background:   'linear-gradient(135deg, #16C784 0%, #0FA366 100%)',
          borderRadius: '10px',
          boxShadow:    loading ? 'none' : '0 4px 20px rgba(22,199,132,0.4)',
          border:       'none',
        }}
      >
        {/* Shimmer sweep */}
        {!loading && (
          <span
            className="absolute inset-0 pointer-events-none animate-shimmer"
            style={{
              background:     'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)',
              backgroundSize: '200% 100%',
            }}
          />
        )}
        <span
          className="relative z-10 flex items-center justify-center gap-2.5 font-display font-semibold"
          style={{ color: '#052e1c', fontSize: '15px' }}
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 sp"
                style={{ borderColor: 'rgba(5,46,28,0.25)', borderTopColor: '#052e1c' }}
              />
              {t('auth.loggingIn')}
            </>
          ) : t('auth.loginButton')}
        </span>
      </button>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="font-body text-xs" style={{ color: 'var(--text-subtle)' }}>
          o continúa con
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* ── Facebook login button ──────────────────────────────── */}
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={loading || fbLoading}
        className="relative w-full h-12 flex items-center justify-center gap-3
                   cursor-pointer select-none transition-all duration-200
                   active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: '10px',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1877F2'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow   = '0 0 0 3px rgba(24,119,242,0.12)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow   = 'none'
        }}
      >
        {fbLoading ? (
          <span
            className="w-4 h-4 rounded-full border-2"
            style={{ borderColor: 'rgba(24,119,242,0.25)', borderTopColor: '#1877F2' }}
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )}
        <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {fbLoading ? 'Conectando...' : 'Continuar con Facebook'}
        </span>
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const { t } = useI18n()

  const features = [
    t('auth.feature1'),
    t('auth.feature2'),
    t('auth.feature3'),
    t('auth.feature4'),
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── LEFT PANEL: Brand + Abstract Illustration (lg+) ────── */}
      <aside
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        {/* Mesh glow layers */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(22,199,132,0.09) 0%, transparent 60%)' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 70% 70%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}
        />

        {/* Abstract geometric pattern */}
        <AbstractPattern />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #16C784, #0FA366)',
                boxShadow:  '0 4px 16px rgba(22,199,132,0.35)',
                color:      '#052e1c',
              }}
            >
              <IconWhatsApp />
            </div>
            <BlurText
              text="SmartPost"
              className="font-display text-xl font-bold text-[var(--text)]"
              delay={0}
            />
          </div>

          {/* Tagline — two-line with staggered reveal */}
          <div className="mb-10">
            <h1
              className="font-display font-bold leading-[1.15] mb-4"
              style={{ fontSize: '2.6rem', color: 'var(--text)' }}
            >
              <BlurText text={t('auth.brandTagline').split('\n')[0]} delay={80} />
              <br />
              <BlurText
                text={t('auth.brandTagline').split('\n')[1] ?? ''}
                delay={160}
                style={{ color: '#16C784' } as React.CSSProperties}
              />
            </h1>
            <BlurText
              text={t('auth.brandSub')}
              delay={240}
              as="p"
              className="font-body text-base leading-relaxed"
              style={{ color: 'var(--text-muted)', maxWidth: '360px' } as React.CSSProperties}
            />
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {features.map((f, i) => (
              <FeatureItem key={f} text={f} delay={300 + i * 80} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          className="relative z-10 font-body text-xs"
          style={{ color: 'var(--text-subtle)' }}
        >
          {t('auth.copyright')} · {new Date().getFullYear()}
        </p>
      </aside>

      {/* ── RIGHT PANEL: Form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative min-h-screen">

        {/* Corner ambient glows */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(22,199,132,0.05) 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 100%, rgba(99,102,241,0.04) 0%, transparent 60%)' }}
        />

        {/* Language switcher — top right */}
        <div className="absolute top-5 right-5 z-20">
          <LanguageSwitcher />
        </div>

        {/* Form container */}
        <div className="w-full max-w-[400px] relative z-10 animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #16C784, #0FA366)',
                boxShadow:  '0 4px 14px rgba(22,199,132,0.3)',
                color:      '#052e1c',
              }}
            >
              <IconWhatsApp />
            </div>
            <span className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>
              SmartPost
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2
              className="font-display font-bold mb-2"
              style={{ fontSize: '1.625rem', color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              {t('auth.formTitle')}
            </h2>
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('auth.formSubtitle')}
            </p>
          </div>

          {/* Glass card */}
          <div
            className="p-7 rounded-2xl"
            style={{
              background:             'var(--bg-card)',
              border:                 '1px solid var(--border)',
              backdropFilter:         'blur(16px)',
              WebkitBackdropFilter:   'blur(16px)',
              boxShadow:              'var(--shadow-glass)',
            }}
          >
            <LoginForm />
          </div>

          {/* Footer */}
          <p
            className="text-center mt-6 font-body text-xs"
            style={{ color: 'var(--text-subtle)' }}
          >
            {t('auth.copyright')} · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
