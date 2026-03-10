'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

// ─── Constants ────────────────────────────────────────────────────
const PLANS = {
  basic: {
    label:    'Basic',
    subtitle: 'Para solopreneurs y freelancers',
    monthly:  29,
    annual:   19,
    features: ['1 número de WhatsApp', 'Facebook + Instagram', '30 posts por mes', 'Analytics básico'],
    color:    'var(--text-secondary)',
    pro:      false,
  },
  pro: {
    label:    'Pro',
    subtitle: 'Para PYMES y emprendedores activos',
    monthly:  69,
    annual:   49,
    features: ['1 número de WhatsApp', 'Facebook + Instagram + LinkedIn', 'Posts ilimitados', 'Analytics avanzado'],
    color:    '#00d672',
    pro:      true,
  },
} as const
type PlanKey = keyof typeof PLANS

// ─── Icons ────────────────────────────────────────────────────────
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

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

// ─── Floating Label Input ─────────────────────────────────────────
function FloatingInput({
  id, label, type = 'text', value, onChange, icon, autoFocus, rightSlot,
}: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; icon: React.ReactNode
  autoFocus?: boolean; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || !!value

  return (
    <div
      className="relative flex items-center transition-all duration-200"
      style={{
        background:   'var(--bg-surface)',
        border:       `1px solid ${focused ? '#00d672' : 'var(--border)'}`,
        borderRadius: '10px',
        boxShadow:    focused ? '0 0 0 3px rgba(0,214,114,0.12)' : 'none',
      }}
    >
      <span className="ml-3.5 transition-colors duration-150" style={{ color: focused ? '#00d672' : 'var(--text-subtle)' }}>
        {icon}
      </span>
      <div className="relative flex-1 px-3">
        <label htmlFor={id} className="absolute left-3 pointer-events-none select-none font-body transition-all duration-200"
          style={{ fontSize: floated ? '10px' : '13px', top: floated ? '5px' : '50%',
                   transform: floated ? 'none' : 'translateY(-50%)',
                   color: focused ? '#00d672' : 'var(--text-subtle)', fontWeight: floated ? 500 : 400 }}>
          {label}
        </label>
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm outline-none font-body"
          style={{ color: 'var(--text)', paddingTop: floated ? '16px' : '0', paddingBottom: '6px', caretColor: '#00d672' }} />
      </div>
      {rightSlot && <span className="mr-2 flex-shrink-0">{rightSlot}</span>}
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="transition-all duration-300 rounded-full"
          style={{
            width:      i === current ? '24px' : '8px',
            height:     '8px',
            background: i <= current ? '#00d672' : 'var(--border)',
            opacity:    i < current ? 0.5 : 1,
          }} />
      ))}
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────
function PlanCard({ planKey, annual, selected, onSelect, loading }: {
  planKey: PlanKey; annual: boolean; selected: boolean
  onSelect: () => void; loading: boolean
}) {
  const plan  = PLANS[planKey]
  const price = annual ? plan.annual : plan.monthly

  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className="text-left w-full transition-all duration-200 rounded-2xl p-6 relative cursor-pointer"
      style={{
        background:  'var(--bg-card)',
        border:      `2px solid ${selected ? (plan.pro ? '#00d672' : 'rgba(0,214,114,0.4)') : 'var(--border)'}`,
        boxShadow:   selected && plan.pro ? '0 0 32px rgba(0,214,114,0.12)' : 'none',
      }}
    >
      {plan.pro && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: '#00d672', color: '#003d1f', boxShadow: '0 2px 12px rgba(0,214,114,0.4)' }}>
          Más popular
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest mb-0.5" style={{ color: plan.color }}>
            {plan.label}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{plan.subtitle}</p>
        </div>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
          style={{
            borderColor: selected ? '#00d672' : 'var(--border)',
            background:  selected ? '#00d672' : 'transparent',
          }}
        >
          {selected && <IconCheck size={10} />}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>$</span>
        <span className="text-[40px] font-black tracking-tight leading-none" style={{ color: plan.pro ? '#00d672' : 'var(--text)' }}>
          {price}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>/mes</span>
      </div>

      <ul className="flex flex-col gap-2">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,214,114,0.15)', color: '#00d672' }}>
              <IconCheck size={9} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingPageInner />
    </Suspense>
  )
}

function OnboardingPageInner() {
  const { data: session } = useSession()
  const searchParams      = useSearchParams()

  // Detect if user came from FB login (placeholder email)
  const isFbUser  = session?.user?.email?.endsWith('@pending.sp') ?? false
  const totalSteps = isFbUser ? 2 : 1
  const [step, setStep] = useState(0) // 0 = account (FB only) | 1 = plan (or 0 if email user)

  // Step 1 state
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [step1Loading, setStep1Loading] = useState(false)

  // Step 2 state
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro')
  const [annual, setAnnual]             = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const [error, setError] = useState('')

  const checkoutCanceled = searchParams.get('checkout') === 'canceled'

  // Effective step index (FB users: 0=account, 1=plan / email users: 0=plan)
  const effectiveStep = isFbUser ? step : 1

  const userName = session?.user?.name?.split(' ')[0] ?? 'Bienvenido'

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) return setError('El email es requerido')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirmPass) return setError('Las contraseñas no coinciden')

    setStep1Loading(true)
    try {
      const res  = await fetch('/api/onboarding/update-account', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar. Intenta de nuevo.')
        return
      }
      setStep(1)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setStep1Loading(false)
    }
  }

  async function handleStartTrial() {
    setError('')
    setCheckoutLoading(true)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: selectedPlan, interval: annual ? 'year' : 'month', from: 'onboarding' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al crear sesión de Stripe')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
           style={{ background: 'radial-gradient(circle at 100% 0%, rgba(0,214,114,0.06) 0%, transparent 60%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
           style={{ background: 'radial-gradient(circle at 0% 100%, rgba(124,99,248,0.05) 0%, transparent 60%)' }} />

      <div className="w-full max-w-[480px] relative z-10">

        {/* Logo + progress */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/smartpost_logo_icon_bg.png" alt="SmartPost" width={32} height={32} className="rounded-lg" />
            <span className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>SmartPost</span>
          </div>
          <StepDots total={totalSteps} current={isFbUser ? step : 0} />
        </div>

        {/* ── Step 1: Complete account (FB users only) ─────────── */}
        {isFbUser && effectiveStep === 0 && (
          <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#00d672' }}>
                Paso 1 de {totalSteps}
              </p>
              <h1 className="font-display font-bold text-[1.5rem] mb-1.5" style={{ color: 'var(--text)' }}>
                ¡Hola, {userName}! 👋
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Vinculaste tu cuenta de Facebook. Ahora elige un email y contraseña para poder iniciar sesión de ambas formas.
              </p>
            </div>

            <form onSubmit={handleAccountStep} className="flex flex-col gap-3">
              <FloatingInput id="email" label="Tu email" type="email" value={email} onChange={setEmail}
                icon={<IconMail />} autoFocus />

              <FloatingInput id="password" label="Contraseña (mín. 8 caracteres)" type={showPass ? 'text' : 'password'}
                value={password} onChange={setPassword} icon={<IconLock />}
                rightSlot={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="p-1.5 cursor-pointer rounded-lg transition-colors"
                    style={{ color: 'var(--text-subtle)' }}>
                    <IconEye open={showPass} />
                  </button>
                }
              />

              <FloatingInput id="confirm" label="Confirmar contraseña" type={showPass ? 'text' : 'password'}
                value={confirmPass} onChange={setConfirmPass} icon={<IconLock />} />

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={step1Loading}
                className="relative w-full h-12 overflow-hidden cursor-pointer select-none transition-all duration-200 active:scale-[0.98] disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #00d672 0%, #0FA366 100%)', borderRadius: '10px', border: 'none',
                         boxShadow: step1Loading ? 'none' : '0 4px 20px rgba(0,214,114,0.35)' }}>
                <span className="font-display font-semibold text-[15px]" style={{ color: '#052e1c' }}>
                  {step1Loading ? 'Guardando...' : 'Continuar →'}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Choose plan ──────────────────────────────── */}
        {effectiveStep === 1 && (
          <div className="flex flex-col gap-5">

            {/* Header */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {isFbUser && (
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#00d672' }}>
                  Paso 2 de {totalSteps}
                </p>
              )}
              <h1 className="font-display font-bold text-[1.4rem] mb-1.5" style={{ color: 'var(--text)' }}>
                Elige tu plan
              </h1>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Prueba <strong className="text-[var(--text)]">7 días gratis</strong>. Cancela cuando quieras, sin compromiso.
              </p>

              {/* Trial badge */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                   style={{ background: 'rgba(0,214,114,0.08)', border: '1px solid rgba(0,214,114,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00d672" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  <strong className="text-[#00d672]">7 días gratis</strong> — sin cargos hasta que termine el período de prueba
                </p>
              </div>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center rounded-xl p-1 gap-0.5"
                   style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                {(['month', 'year'] as const).map(iv => (
                  <button key={iv} onClick={() => setAnnual(iv === 'year')}
                    className="px-5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer select-none flex items-center gap-2"
                    style={{
                      background:   (iv === 'year') === annual ? 'var(--bg-card)' : 'transparent',
                      color:        (iv === 'year') === annual ? 'var(--text)' : 'var(--text-muted)',
                      border:       (iv === 'year') === annual ? '1px solid var(--border-hover)' : '1px solid transparent',
                    }}>
                    {iv === 'month' ? 'Mensual' : 'Anual'}
                    {iv === 'year' && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                            style={{ background: annual ? 'rgba(0,214,114,0.2)' : 'rgba(255,255,255,0.06)',
                                     color: annual ? '#00d672' : 'var(--text-muted)' }}>
                        −35%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(PLANS) as PlanKey[]).map(key => (
                <PlanCard key={key} planKey={key} annual={annual}
                  selected={selectedPlan === key}
                  onSelect={() => setSelectedPlan(key)}
                  loading={checkoutLoading} />
              ))}
            </div>

            {/* Error / canceled notice */}
            {(error || checkoutCanceled) && (
              <div className="px-4 py-3 rounded-xl text-sm"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                {error || 'Cancelaste el proceso de pago. Puedes intentarlo de nuevo.'}
              </div>
            )}

            {/* CTA */}
            <button onClick={handleStartTrial} disabled={checkoutLoading}
              className="relative w-full h-14 overflow-hidden cursor-pointer select-none transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #00d672 0%, #0FA366 100%)', borderRadius: '12px', border: 'none',
                       boxShadow: checkoutLoading ? 'none' : '0 6px 24px rgba(0,214,114,0.4)' }}>
              {checkoutLoading ? (
                <span className="w-5 h-5 rounded-full border-2 inline-block"
                      style={{ borderColor: 'rgba(5,46,28,0.25)', borderTopColor: '#052e1c',
                               animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <span className="font-display font-bold text-[15px]" style={{ color: '#052e1c' }}>
                  Iniciar prueba gratuita de 7 días →
                </span>
              )}
            </button>

            <p className="text-center text-[11px]" style={{ color: 'var(--text-subtle)' }}>
              Sin cargos hasta el día 8 · Cancela en cualquier momento · Pago seguro con Stripe
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
