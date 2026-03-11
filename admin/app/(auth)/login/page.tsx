'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

  .sp-page { font-family: 'Syne', system-ui, sans-serif; }

  @keyframes ring-out {
    0%   { transform:translate(-50%,-50%) scale(0.2); opacity:0.7; }
    100% { transform:translate(-50%,-50%) scale(1.9);  opacity:0; }
  }
  @keyframes sp-enter {
    from { opacity:0; transform:translateY(22px) scale(0.98); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }
  @keyframes sp-stagger {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes sp-spin {
    to { transform:rotate(360deg); }
  }
  @keyframes sp-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-5px); }
    40%     { transform:translateX(5px); }
    60%     { transform:translateX(-3px); }
    80%     { transform:translateX(3px); }
  }
  @keyframes sp-shimmer {
    from { left:-70%; }
    to   { left:160%; }
  }
  @keyframes sp-pulse-dot {
    0%,100% { box-shadow:0 0 0 0 rgba(0,214,114,0.55); }
    50%     { box-shadow:0 0 0 7px rgba(0,214,114,0); }
  }
  @keyframes sp-glow-btn {
    0%,100% { box-shadow:0 4px 24px rgba(0,214,114,0.38); }
    50%     { box-shadow:0 4px 38px rgba(0,214,114,0.62); }
  }
  @keyframes sp-orbit {
    from { transform:translate(-50%,-50%) rotate(0deg); }
    to   { transform:translate(-50%,-50%) rotate(360deg); }
  }
  @keyframes sp-counter-orbit {
    from { transform:rotate(0deg); }
    to   { transform:rotate(-360deg); }
  }
  @keyframes sp-line-in {
    from { stroke-dashoffset:160; opacity:0; }
    to   { stroke-dashoffset:0;   opacity:1; }
  }
  @keyframes sp-hub-in {
    from { opacity:0; transform:scale(0.6); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes sp-float {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes sp-ticker {
    from { transform:translateX(0); }
    to   { transform:translateX(-50%); }
  }
  @keyframes sp-noise-move {
    0%   { background-position: 0 0; }
    100% { background-position: 200px 200px; }
  }

  /* ── Field ── */
  .sp-field-wrap {
    position:relative;
    border-bottom:1.5px solid rgba(255,255,255,0.1);
    transition:border-color 220ms;
    padding-bottom:2px;
  }
  .sp-field-wrap:focus-within { border-bottom-color:#00d672; }
  .sp-field-wrap.has-error    { border-bottom-color:rgba(239,68,68,0.7); animation:sp-shake 0.4s ease; }

  .sp-bare-input {
    width:100%; background:transparent; border:none; outline:none;
    color:rgba(255,255,255,0.92); font-size:14.5px;
    padding:22px 0 5px; caret-color:#00d672;
    font-family:'Syne', system-ui, sans-serif;
    letter-spacing:-0.01em;
  }
  .sp-bare-input:-webkit-autofill,
  .sp-bare-input:-webkit-autofill:hover,
  .sp-bare-input:-webkit-autofill:focus {
    -webkit-text-fill-color: rgba(255,255,255,0.92);
    -webkit-box-shadow: 0 0 0 1000px #07090f inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  .sp-bare-label {
    position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    font-size:12.5px; color:rgba(255,255,255,0.3);
    pointer-events:none;
    transition:all 200ms cubic-bezier(0.4,0,0.2,1);
    letter-spacing:0.01em;
    font-family:'DM Mono', monospace;
  }
  .sp-field-wrap:focus-within .sp-bare-label,
  .sp-bare-label.floated {
    top:3px; transform:translateY(0);
    font-size:8.5px; letter-spacing:0.13em;
    text-transform:uppercase; color:#00d672;
  }

  /* ── Checkbox ── */
  .sp-checkbox {
    appearance:none; -webkit-appearance:none;
    width:13px; height:13px; border-radius:3px;
    border:1.5px solid rgba(255,255,255,0.16);
    background:transparent; cursor:pointer; flex-shrink:0;
    transition:all 150ms; position:relative;
  }
  .sp-checkbox:checked { background:#00d672; border-color:#00d672; }
  .sp-checkbox:checked::after {
    content:''; position:absolute;
    left:2px; top:0px; width:4px; height:7px;
    border:1.5px solid #050709;
    border-top:none; border-left:none; transform:rotate(45deg);
  }
  .sp-checkbox:focus { outline:none; box-shadow:0 0 0 3px rgba(0,214,114,0.2); }

  /* ── OAuth ── */
  .sp-oauth {
    display:flex; align-items:center; justify-content:center; gap:8px;
    height:42px; border-radius:10px;
    font-size:13px; font-weight:600; cursor:pointer;
    transition:all 180ms;
    border:1px solid rgba(255,255,255,0.08);
    background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.7);
    font-family:'Syne', system-ui, sans-serif;
    letter-spacing:-0.01em;
  }
  .sp-oauth:hover:not(:disabled) {
    background:rgba(255,255,255,0.06);
    border-color:rgba(255,255,255,0.15);
    color:rgba(255,255,255,0.9);
    transform:translateY(-1px);
    box-shadow:0 4px 16px rgba(0,0,0,0.3);
  }
  .sp-oauth:disabled { opacity:0.5; cursor:not-allowed; }

  @media (prefers-reduced-motion:reduce) {
    *, *::before, *::after {
      animation-duration:0.01ms !important;
      animation-iteration-count:1 !important;
      transition-duration:0.01ms !important;
    }
  }
`

// ─── Icons ────────────────────────────────────────────────────────
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function IconGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ─── Underline Input ──────────────────────────────────────────────
function UnderlineInput({
  id, label, type = 'text', value, onChange,
  autoComplete, autoFocus, rightSlot, hasError,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void;
  autoComplete?: string; autoFocus?: boolean;
  rightSlot?: React.ReactNode; hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || !!value

  return (
    <div className={`sp-field-wrap${hasError ? ' has-error' : ''}`}>
      <label htmlFor={id} className={`sp-bare-label${floated ? ' floated' : ''}`}>
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete} autoFocus={autoFocus}
        className="sp-bare-input"
      />
      {rightSlot && (
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-30%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Signal Hub (right panel visual) ─────────────────────────────
function SignalHub() {
  const platforms = [
    {
      label: 'Instagram', angle: -90,
      gradient: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
      shadow: 'rgba(220,39,67,0.5)',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook', angle: 30,
      gradient: '#1877F2',
      shadow: 'rgba(24,119,242,0.5)',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn', angle: 150,
      gradient: '#0A66C2',
      shadow: 'rgba(10,102,194,0.5)',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ]

  const R = 110 // orbit radius in px
  const toRad = (deg: number) => (deg * Math.PI) / 180

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'sp-hub-in 1s cubic-bezier(0.16,1,0.3,1) 0.4s both',
      }}
    >
      {/* Broadcast rings */}
      {[0, 1300, 2600, 3900].map((delay) => (
        <div
          key={delay}
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 280, height: 280, borderRadius: '50%',
            border: '1px solid rgba(0,214,114,0.18)',
            animation: `ring-out 5.2s ease-out ${delay}ms infinite`,
          }}
        />
      ))}

      {/* SVG connection lines + data particles */}
      <svg
        viewBox="-150 -150 300 300"
        style={{
          position: 'absolute',
          width: 300, height: 300,
          overflow: 'visible',
          zIndex: 2,
        }}
        aria-hidden="true"
      >
        {/* Path definitions for animateMotion */}
        <defs>
          {platforms.map((p) => {
            const x = Math.round(R * Math.cos(toRad(p.angle)))
            const y = Math.round(R * Math.sin(toRad(p.angle)))
            return (
              <path
                key={`def-${p.label}`}
                id={`sp-path-${p.label.toLowerCase()}`}
                d={`M0,0 L${x},${y}`}
              />
            )
          })}
        </defs>

        {/* Visible connection lines */}
        {platforms.map((p) => {
          const x = Math.round(R * Math.cos(toRad(p.angle)))
          const y = Math.round(R * Math.sin(toRad(p.angle)))
          const pathLen = Math.sqrt(x * x + y * y)
          return (
            <line
              key={p.label}
              x1="0" y1="0" x2={x} y2={y}
              stroke="rgba(0,214,114,0.25)"
              strokeWidth="1"
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen}
              style={{ animation: `sp-line-in 0.8s cubic-bezier(0.4,0,0.2,1) ${0.9 + platforms.indexOf(p) * 0.15}s forwards` }}
            />
          )
        })}

        {/* Data packet particles — travel from WhatsApp outward */}
        {platforms.map((p, i) => (
          <circle key={`particle-${p.label}`} r="2.5" fill="#00d672" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              keyTimes="0;0.1;0.8;1"
              dur="2.4s"
              repeatCount="indefinite"
              begin={`${2 + i * 0.8}s`}
            />
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              begin={`${2 + i * 0.8}s`}
              calcMode="spline"
              keySplines="0.4 0 0.6 1"
            >
              <mpath href={`#sp-path-${p.label.toLowerCase()}`} />
            </animateMotion>
          </circle>
        ))}
      </svg>

      {/* Central WhatsApp node */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          width: 72, height: 72, borderRadius: '50%',
          background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 14px rgba(37,211,102,0.07), 0 0 50px rgba(37,211,102,0.45)',
          animation: 'sp-glow-btn 4s ease-in-out infinite 2s',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>

      {/* Platform nodes */}
      {platforms.map((p, i) => {
        const x = R * Math.cos(toRad(p.angle))
        const y = R * Math.sin(toRad(p.angle))
        return (
          <div
            key={p.label}
            aria-label={p.label}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              marginTop: y - 22, marginLeft: x - 22,
              width: 44, height: 44, borderRadius: '50%',
              background: p.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 20px ${p.shadow}`,
              zIndex: 10,
              opacity: 0,
              animation: `sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) ${1.1 + i * 0.12}s both`,
              animationFillMode: 'both',
            }}
          >
            {p.icon}
          </div>
        )
      })}
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────
function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()

  const [form, setForm]             = useState({ email: '', password: '' })
  const [showPass, setShowPass]     = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [fbLoading, setFbLoading]   = useState(false)
  const [gLoading, setGLoading]     = useState(false)
  const [error, setError]           = useState('')
  const [hasError, setHasError]     = useState(false)

  function handleFacebookLogin() {
    setFbLoading(true)
    window.location.href = '/api/auth/facebook-redirect?state=login'
  }

  async function handleGoogleLogin() {
    setGLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setHasError(false)
    if (!form.email || !form.password) {
      setError(t('auth.errorEmpty'))
      setHasError(true)
      setTimeout(() => setHasError(false), 500)
      return
    }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        setError(t('auth.errorCredentials'))
        setHasError(true)
        setTimeout(() => setHasError(false), 500)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t('auth.errorConnection'))
      setHasError(true)
      setTimeout(() => setHasError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const anyLoading = loading || fbLoading || gLoading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate style={{ gap: '0' }}>

      {/* Email */}
      <div style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both', marginBottom: '20px' }}>
        <UnderlineInput
          id="email" label={t('auth.email')} type="email"
          value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
          autoComplete="email" autoFocus
          hasError={hasError && !form.email}
        />
      </div>

      {/* Password */}
      <div style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.34s both', marginBottom: '18px' }}>
        <UnderlineInput
          id="password" label={t('auth.password')}
          type={showPass ? 'text' : 'password'}
          value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))}
          autoComplete="current-password"
          hasError={hasError && !form.password}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: 'rgba(255,255,255,0.28)', transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00d672')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
              aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              <IconEye open={showPass} />
            </button>
          }
        />
      </div>

      {/* Remember + Forgot */}
      <div
        className="flex items-center justify-between"
        style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.40s both', marginBottom: '28px' }}
      >
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox" className="sp-checkbox"
            checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
          />
          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.38)', fontFamily: "'DM Mono', monospace" }}>
            Recordarme
          </span>
        </label>
        <a
          href="/forgot-password"
          style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono', monospace", transition: 'color 150ms', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00d672')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert" aria-live="polite"
          className="flex items-center gap-2.5"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#f87171',
            fontSize: '12.5px',
            fontFamily: "'DM Mono', monospace",
            animation: 'sp-stagger 0.3s ease both',
          }}
        >
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <div style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both', marginBottom: '20px' }}>
        <button
          type="submit"
          disabled={anyLoading}
          style={{
            position: 'relative', overflow: 'hidden',
            width: '100%', height: '50px',
            background: 'linear-gradient(135deg, #00d672 0%, #00b85e 100%)',
            border: 'none', borderRadius: '12px', cursor: anyLoading ? 'not-allowed' : 'pointer',
            opacity: anyLoading ? 0.65 : 1,
            transition: 'all 200ms',
            animation: !anyLoading
              ? 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both, sp-glow-btn 3s ease-in-out infinite 1.2s'
              : 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both',
          }}
          onMouseEnter={e => { if (!anyLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
        >
          {!anyLoading && (
            <span aria-hidden="true" style={{
              position: 'absolute', top: 0, bottom: 0, width: '45%',
              background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.24) 50%, transparent 100%)',
              animation: 'sp-shimmer 3s cubic-bezier(0.4,0,0.6,1) infinite 1.5s',
            }} />
          )}
          <span style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            color: '#052e1c', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em',
            fontFamily: "'Syne', system-ui, sans-serif",
          }}>
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(5,46,28,0.25)',
                  borderTopColor: '#052e1c',
                  animation: 'sp-spin 0.7s linear infinite',
                  display: 'block',
                }} />
                {t('auth.loggingIn')}
              </>
            ) : t('auth.loginButton')}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div
        className="flex items-center gap-3"
        style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.52s both', marginBottom: '16px' }}
      >
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
          o continúa con
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* OAuth */}
      <div
        className="grid grid-cols-2 gap-2.5"
        style={{ animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.58s both' }}
      >
        <button type="button" onClick={handleGoogleLogin} disabled={anyLoading} className="sp-oauth">
          {gLoading
            ? <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'white', animation:'sp-spin 0.7s linear infinite', display:'block' }} />
            : <IconGoogle />}
          <span>{gLoading ? 'Conectando...' : 'Google'}</span>
        </button>

        <button
          type="button" onClick={handleFacebookLogin} disabled={anyLoading} className="sp-oauth"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(24,119,242,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(24,119,242,0.07)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
        >
          {fbLoading
            ? <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(24,119,242,0.25)', borderTopColor:'#1877F2', animation:'sp-spin 0.7s linear infinite', display:'block' }} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
          <span>{fbLoading ? 'Conectando...' : 'Facebook'}</span>
        </button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const { t } = useI18n()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Background ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ background: '#050709', zIndex: 0 }}
      >
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Green focal glow — right side */}
        <div style={{
          position: 'absolute', top: '50%', right: '25%',
          width: 600, height: 600,
          transform: 'translate(50%,-50%)',
          background: 'radial-gradient(circle, rgba(0,214,114,0.12) 0%, transparent 68%)',
          filter: 'blur(40px)',
        }} />

        {/* Purple accent — bottom left */}
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-60px',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,99,248,0.14) 0%, transparent 68%)',
          filter: 'blur(70px)',
        }} />

        {/* Ghost "SP" watermark */}
        <div style={{
          position: 'absolute',
          bottom: '-60px', right: '-40px',
          fontSize: '40vw', fontWeight: 800,
          fontFamily: "'Syne', system-ui, sans-serif",
          color: 'rgba(255,255,255,0.018)',
          lineHeight: 1, userSelect: 'none',
          letterSpacing: '-0.06em',
          pointerEvents: 'none',
        }}>
          SP
        </div>
      </div>

      {/* Language switcher */}
      <div className="fixed top-5 right-5 z-50">
        <LanguageSwitcher />
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div
        className="sp-page relative min-h-screen flex"
        style={{ zIndex: 1 }}
      >

        {/* ── LEFT: Form column ───────────────────────────────── */}
        <div
          className="flex flex-col justify-center w-full lg:w-[48%] xl:w-[44%]"
          style={{
            padding: 'clamp(32px, 6vw, 72px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Inner wrapper — max width */}
          <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>

            {/* Logo + brand */}
            <div
              className="flex items-center gap-3"
              style={{
                marginBottom: '52px',
                animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/smartpost_logo_icon_bg.png"
                alt="SmartPost"
                width={34} height={34}
                style={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,214,114,0.38)' }}
              />
              <span style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontFamily: "'DM Mono', monospace",
              }}>
                SmartPost
              </span>
            </div>

            {/* Heading */}
            <div
              style={{
                marginBottom: '40px',
                animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both',
              }}
            >
              <p style={{
                fontSize: '11px', letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase',
                fontFamily: "'DM Mono', monospace", marginBottom: '10px',
              }}>
                — Bienvenido de nuevo
              </p>
              <h1 style={{
                fontSize: 'clamp(2.1rem, 3.5vw, 2.8rem)',
                fontWeight: 800, lineHeight: 1.0,
                letterSpacing: '-0.045em',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: '10px',
              }}>
                Accede a tu<br />
                <span style={{ color: '#00d672' }}>panel de control</span>
              </h1>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.65,
                fontFamily: "'DM Mono', monospace",
              }}>
                {t('auth.formSubtitle')}
              </p>
            </div>

            {/* Form */}
            <LoginForm />

            {/* Footer */}
            <div
              style={{
                marginTop: '32px',
                animation: 'sp-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s both',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <p style={{
                fontSize: '12.5px',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.03em',
                textAlign: 'center',
              }}>
                ¿No tienes cuenta?{' '}
                <a
                  href="/register"
                  style={{ color: '#00d672', textDecoration: 'none', fontWeight: 600, transition: 'opacity 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Regístrate
                </a>
              </p>
              <p style={{
                fontSize: '10.5px',
                color: 'rgba(255,255,255,0.18)',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.03em',
                textAlign: 'center',
              }}>
                {t('auth.copyright')} · {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Brand panel ──────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
          style={{
            background: 'rgba(4,6,10,0.6)',
          }}
        >
          {/* Content stack */}
          <div className="flex flex-col h-full" style={{ padding: '48px', gap: '0' }}>

            {/* Top: Stats row */}
            <div
              className="flex gap-8"
              style={{ animation: 'sp-stagger 0.6s cubic-bezier(0.16,1,0.3,1) 0.6s both', marginBottom: 'auto' }}
            >
              {[
                { num: '500+', label: 'Marcas activas' },
                { num: '50K+', label: 'Posts publicados' },
                { num: '3',    label: 'Plataformas' },
              ].map((s, i) => (
                <div key={s.num} style={{ animationDelay: `${0.65 + i * 0.08}s` }}>
                  <p style={{
                    color: '#00d672', fontSize: '22px', fontWeight: 800,
                    letterSpacing: '-0.04em', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.num}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.28)',
                    fontSize: '10px', letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontFamily: "'DM Mono', monospace",
                    marginTop: '3px',
                  }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Center: Orbital hub */}
            <div
              className="flex-1 flex items-center justify-center"
              style={{ minHeight: 340 }}
            >
              <SignalHub />
            </div>

            {/* Bottom: Tagline + platform labels */}
            <div style={{ animation: 'sp-stagger 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 2.8vw, 3rem)',
                fontWeight: 800, lineHeight: 0.96,
                letterSpacing: '-0.045em',
                color: 'rgba(255,255,255,0.92)',
                marginBottom: '12px',
              }}>
                Publica más,<br />
                trabaja{' '}
                <span style={{ color: '#00d672', textShadow: '0 0 40px rgba(0,214,114,0.5)' }}>
                  menos.
                </span>
              </h2>
              <p style={{
                fontSize: '12.5px', color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.7, maxWidth: '300px',
                fontFamily: "'DM Mono', monospace",
              }}>
                Gestiona Instagram, Facebook y LinkedIn desde WhatsApp — sin abrir ninguna app.
              </p>
            </div>
          </div>

          {/* Vertical label — right edge */}
          <div style={{
            position: 'absolute', right: 24, top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            transformOrigin: 'center',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ width: 24, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{
              fontSize: '9px', letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              fontFamily: "'DM Mono', monospace",
              whiteSpace: 'nowrap',
            }}>
              Social Automation Platform
            </span>
            <div style={{ width: 24, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
          </div>
        </div>

      </div>
    </>
  )
}
