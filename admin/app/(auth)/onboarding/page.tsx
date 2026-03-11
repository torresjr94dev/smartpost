'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

// ─── Plans ────────────────────────────────────────────────────────
const PLANS = {
  basic: {
    label:    'Basic',
    subtitle: 'Para solopreneurs',
    monthly:  29,
    annual:   19,
    features: ['1 número WhatsApp', 'Facebook + Instagram', '30 posts/mes', 'Analytics básico'],
    pro:      false,
  },
  pro: {
    label:    'Pro',
    subtitle: 'Para PYMES activas',
    monthly:  69,
    annual:   49,
    features: ['1 número WhatsApp', 'FB + IG + LinkedIn', 'Posts ilimitados', 'Analytics avanzado'],
    pro:      true,
  },
} as const
type PlanKey = keyof typeof PLANS

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

  .ob-page { font-family:'Syne', system-ui, sans-serif; }

  @keyframes ob-in {
    from { opacity:0; transform:translateY(14px) scale(0.99); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes ob-stagger {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ob-spin {
    to { transform:rotate(360deg); }
  }
  @keyframes ob-shimmer {
    from { left:-70%; }
    to   { left:160%; }
  }
  @keyframes ob-glow {
    0%,100% { box-shadow:0 4px 24px rgba(0,214,114,0.38); }
    50%      { box-shadow:0 4px 38px rgba(0,214,114,0.62); }
  }
  @keyframes ob-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-5px); }
    40%     { transform:translateX(5px); }
    60%     { transform:translateX(-3px); }
    80%     { transform:translateX(3px); }
  }
  @keyframes ob-check {
    from { opacity:0; transform:scale(0.3) rotate(-10deg); }
    to   { opacity:1; transform:scale(1) rotate(0deg); }
  }

  /* Underline input — identical to login */
  .ob-field {
    position:relative;
    border-bottom:1.5px solid rgba(255,255,255,0.1);
    transition:border-color 220ms;
    padding-bottom:2px;
    margin-bottom:22px;
  }
  .ob-field:focus-within { border-bottom-color:#00d672; }
  .ob-field.err { border-bottom-color:rgba(239,68,68,0.7); animation:ob-shake 0.4s ease; }

  .ob-bare-input {
    width:100%; background:transparent; border:none; outline:none;
    color:rgba(255,255,255,0.92); font-size:14.5px;
    padding:22px 0 5px; caret-color:#00d672;
    font-family:'Syne', system-ui, sans-serif;
    letter-spacing:-0.01em;
  }
  .ob-bare-input:-webkit-autofill,
  .ob-bare-input:-webkit-autofill:focus {
    -webkit-text-fill-color:rgba(255,255,255,0.92);
    -webkit-box-shadow:0 0 0 1000px #050709 inset;
    transition:background-color 5000s ease-in-out 0s;
  }
  .ob-bare-label {
    position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    font-size:12.5px; color:rgba(255,255,255,0.3);
    pointer-events:none;
    transition:all 200ms cubic-bezier(0.4,0,0.2,1);
    letter-spacing:0.01em;
    font-family:'DM Mono', monospace;
  }
  .ob-field:focus-within .ob-bare-label,
  .ob-bare-label.up {
    top:3px; transform:translateY(0);
    font-size:8.5px; letter-spacing:0.13em;
    text-transform:uppercase; color:#00d672;
  }

  /* Plan card */
  .ob-plan {
    width:100%; text-align:left; cursor:pointer; border:none;
    padding:18px; border-radius:14px; position:relative;
    border:1.5px solid rgba(255,255,255,0.08);
    background:rgba(255,255,255,0.02);
    transition:all 180ms;
    font-family:'Syne', system-ui, sans-serif;
  }
  .ob-plan:hover:not(:disabled) {
    border-color:rgba(255,255,255,0.14);
    background:rgba(255,255,255,0.04);
  }
  .ob-plan.sel {
    border-color:rgba(0,214,114,0.5);
    background:rgba(0,214,114,0.05);
  }
  .ob-plan.sel-pro {
    border-color:#00d672;
    background:rgba(0,214,114,0.07);
    box-shadow:0 0 28px rgba(0,214,114,0.1);
  }
  .ob-plan:disabled { opacity:0.55; cursor:not-allowed; }

  /* Billing toggle */
  .ob-toggle {
    display:inline-flex; padding:4px; gap:2px;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:10px;
  }
  .ob-tbtn {
    padding:7px 18px; border-radius:7px;
    border:1px solid transparent;
    font-size:12px; font-weight:600; cursor:pointer;
    font-family:'DM Mono', monospace;
    letter-spacing:0.02em;
    transition:all 160ms; display:flex; align-items:center; gap:7px;
  }
  .ob-tbtn.on {
    background:rgba(255,255,255,0.07);
    border-color:rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.9);
  }
  .ob-tbtn.off {
    background:transparent;
    color:rgba(255,255,255,0.32);
  }

  @media (prefers-reduced-motion:reduce) {
    *, *::before, *::after {
      animation-duration:0.01ms !important;
      animation-iteration-count:1 !important;
      transition-duration:0.01ms !important;
    }
  }
`

// ─── Icons ────────────────────────────────────────────────────────
function IconCheck({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
         style={{ width: size, height: size }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" style={{ width:16, height:16 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" style={{ width:16, height:16 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" style={{ width:15, height:15, flexShrink:0 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

// ─── Underline Input ──────────────────────────────────────────────
function ObInput({
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
    <div className={`ob-field${hasError ? ' err' : ''}`}>
      <label htmlFor={id} className={`ob-bare-label${floated ? ' up' : ''}`}>{label}</label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete} autoFocus={autoFocus}
        className="ob-bare-input"
      />
      {rightSlot && (
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-30%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────
function PlanCard({ planKey, annual, selected, onSelect, disabled }: {
  planKey: PlanKey; annual: boolean; selected: boolean;
  onSelect: () => void; disabled: boolean;
}) {
  const plan  = PLANS[planKey]
  const price = annual ? plan.annual : plan.monthly
  const cls   = selected
    ? (plan.pro ? 'ob-plan sel sel-pro' : 'ob-plan sel')
    : 'ob-plan'

  return (
    <button type="button" className={cls} onClick={onSelect} disabled={disabled}>
      {/* Popular badge */}
      {plan.pro && (
        <span style={{
          position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
          padding:'3px 10px', borderRadius:20,
          fontSize:9.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
          background:'#00d672', color:'#052e1c',
          fontFamily:"'DM Mono', monospace",
          boxShadow:'0 2px 12px rgba(0,214,114,0.4)',
          whiteSpace:'nowrap',
        }}>
          Más popular
        </span>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <p style={{
            fontSize:10, fontWeight:700, letterSpacing:'0.14em',
            textTransform:'uppercase', color: plan.pro ? '#00d672' : 'rgba(255,255,255,0.5)',
            fontFamily:"'DM Mono', monospace", marginBottom:3,
          }}>
            {plan.label}
          </p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono', monospace" }}>
            {plan.subtitle}
          </p>
        </div>
        {/* Radio dot */}
        <div style={{
          width:18, height:18, borderRadius:'50%', flexShrink:0,
          border:`2px solid ${selected ? '#00d672' : 'rgba(255,255,255,0.18)'}`,
          background: selected ? '#00d672' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 150ms',
        }}>
          {selected && (
            <span style={{ animation:'ob-check 0.2s ease both', color:'#052e1c', display:'flex' }}>
              <IconCheck size={9} />
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div style={{ display:'flex', alignItems:'baseline', gap:2, marginBottom:14 }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Mono', monospace" }}>$</span>
        <span style={{
          fontSize:38, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1,
          color: plan.pro ? '#00d672' : 'rgba(255,255,255,0.88)',
        }}>
          {price}
        </span>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Mono', monospace" }}>/mes</span>
      </div>

      {/* Features */}
      <ul style={{ display:'flex', flexDirection:'column', gap:7, listStyle:'none', padding:0, margin:0 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{
              width:16, height:16, borderRadius:'50%', flexShrink:0,
              background:'rgba(0,214,114,0.12)', color:'#00d672',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <IconCheck size={8} />
            </span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Mono', monospace" }}>
              {f}
            </span>
          </li>
        ))}
      </ul>
    </button>
  )
}

// ─── Left Panel ───────────────────────────────────────────────────
function OnboardingVisual() {
  const features = [
    'Publica en Instagram, Facebook y LinkedIn desde WhatsApp — sin abrir ninguna app',
    'Respuestas automáticas e inteligentes para generar y publicar contenido',
    'Analytics en tiempo real: alcance, likes, comentarios por plataforma',
    'Multi-plataforma en un solo número — sin complicaciones técnicas',
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'48px' }}>

      {/* Stats row */}
      <div
        style={{ display:'flex', gap:32, animation:'ob-stagger 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
      >
        {[
          { num: '500+',  label: 'Marcas activas' },
          { num: '50K+',  label: 'Posts publicados' },
          { num: '7 días', label: 'Gratis, sin riesgo' },
        ].map(s => (
          <div key={s.num}>
            <p style={{
              color:'#00d672', fontSize:20, fontWeight:800,
              letterSpacing:'-0.04em', lineHeight:1, fontVariantNumeric:'tabular-nums',
            }}>
              {s.num}
            </p>
            <p style={{
              color:'rgba(255,255,255,0.28)', fontSize:10, letterSpacing:'0.06em',
              textTransform:'uppercase', fontFamily:"'DM Mono', monospace", marginTop:3,
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Center: heading + feature list */}
      <div style={{ flex:1, display:'flex', alignItems:'center', paddingTop:48, paddingBottom:48 }}>
        <div style={{ width:'100%' }}>
          <p style={{
            fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace",
            marginBottom:12,
            animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both',
          }}>
            — incluido desde el día 1
          </p>

          <h2 style={{
            fontSize:'clamp(2rem,2.8vw,3rem)', fontWeight:800, lineHeight:0.96,
            letterSpacing:'-0.045em', color:'rgba(255,255,255,0.92)',
            marginBottom:36,
            animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.62s both',
          }}>
            Todo lo que<br />
            necesitas,{' '}
            <span style={{ color:'#00d672', textShadow:'0 0 40px rgba(0,214,114,0.45)' }}>
              listo.
            </span>
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display:'flex', alignItems:'flex-start', gap:14,
                  animation:`ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) ${0.72 + i * 0.1}s both`,
                }}
              >
                <div style={{
                  width:26, height:26, borderRadius:8, flexShrink:0, marginTop:1,
                  background:'rgba(0,214,114,0.08)',
                  border:'1px solid rgba(0,214,114,0.18)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#00d672',
                }}>
                  <IconCheck size={11} />
                </div>
                <p style={{
                  fontSize:12.5, color:'rgba(255,255,255,0.45)',
                  lineHeight:1.65, fontFamily:"'DM Mono', monospace",
                }}>
                  {f}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: tagline */}
      <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 1.15s both' }}>
        <h3 style={{
          fontSize:'clamp(1.5rem,2vw,2.1rem)', fontWeight:800, lineHeight:0.96,
          letterSpacing:'-0.04em', color:'rgba(255,255,255,0.88)',
          marginBottom:10,
        }}>
          Empieza hoy,<br />
          <span style={{ color:'rgba(255,255,255,0.35)' }}>sin excusas.</span>
        </h3>
        <p style={{
          fontSize:11.5, color:'rgba(255,255,255,0.22)',
          fontFamily:"'DM Mono', monospace", lineHeight:1.7,
        }}>
          Pago seguro · Sin contratos · Cancela en cualquier momento
        </p>
      </div>

      {/* Vertical label — right edge */}
      <div style={{
        position:'absolute', right:24, top:'50%',
        transform:'translateY(-50%) rotate(90deg)',
        transformOrigin:'center',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <div style={{ width:24, height:1, background:'rgba(255,255,255,0.12)' }} />
        <span style={{
          fontSize:9, letterSpacing:'0.2em', color:'rgba(255,255,255,0.2)',
          textTransform:'uppercase', fontFamily:"'DM Mono', monospace", whiteSpace:'nowrap',
        }}>
          Social Automation Platform
        </span>
        <div style={{ width:24, height:1, background:'rgba(255,255,255,0.12)' }} />
      </div>
    </div>
  )
}

// ─── Step dots ────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height:6, borderRadius:3,
            width: i === current ? 22 : 6,
            background: i <= current ? '#00d672' : 'rgba(255,255,255,0.12)',
            opacity: i < current ? 0.45 : 1,
            transition:'all 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      ))}
    </div>
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
  const { data: session, status: sessionStatus } = useSession()
  const searchParams = useSearchParams()

  const hasWaId        = !!(session?.user?.waId)
  const isFbUser       = session?.user?.email?.endsWith('@pending.sp') ?? false
  const isResubscribing = !!session?.user?.subscriptionStatus && session.user.subscriptionStatus !== 'onboarding'

  // Dynamic steps: wa (if no waId) → account (if FB user) → plan (always)
  const steps = [...(!hasWaId ? ['wa'] : []), ...(isFbUser ? ['account'] : []), 'plan']

  const [stepIndex, setStepIndex] = useState(0)

  // WhatsApp step state
  const [waPhone,    setWaPhone]    = useState('')
  const [waLoading,  setWaLoading]  = useState(false)

  // Account step state (FB users: complete account)
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [step0Loading, setStep0Loading] = useState(false)

  // Plan step state
  const [selectedPlan,     setSelectedPlan]     = useState<PlanKey>('pro')
  const [annual,           setAnnual]           = useState(true)
  const [checkoutLoading,  setCheckoutLoading]  = useState(false)

  const [error,    setError]    = useState('')
  const [hasError, setHasError] = useState(false)

  const checkoutCanceled = searchParams.get('checkout') === 'canceled'
  const userName         = session?.user?.name?.split(' ')[0] ?? ''

  function triggerError(msg: string) {
    setError(msg)
    setHasError(true)
    setTimeout(() => setHasError(false), 500)
  }

  async function handleLinkWhatsApp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!waPhone.trim()) return triggerError('El número de WhatsApp es requerido')
    setWaLoading(true)
    try {
      const res  = await fetch('/api/onboarding/link-whatsapp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: waPhone }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) { triggerError(data.error ?? 'Error al guardar. Intenta de nuevo.'); return }
      setStepIndex(i => i + 1)
    } catch {
      triggerError('Error de conexión. Intenta de nuevo.')
    } finally {
      setWaLoading(false)
    }
  }

  async function handleAccountStep(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!email)                      return triggerError('El email es requerido')
    if (password.length < 8)         return triggerError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirmPass)    return triggerError('Las contraseñas no coinciden')

    setStep0Loading(true)
    try {
      const res  = await fetch('/api/onboarding/update-account', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) { triggerError(data.error ?? 'Error al guardar. Intenta de nuevo.'); return }
      setStepIndex(i => i + 1)
    } catch {
      triggerError('Error de conexión. Intenta de nuevo.')
    } finally {
      setStep0Loading(false)
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

  const anyLoading = step0Loading || checkoutLoading || waLoading

  // Show spinner while session is loading
  if (sessionStatus === 'loading') {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'#050709',
      }}>
        <span style={{
          width:28, height:28, borderRadius:'50%',
          border:'2.5px solid rgba(255,255,255,0.1)',
          borderTopColor:'#00d672',
          animation:'ob-spin 0.7s linear infinite',
          display:'block',
        }} />
        <style>{`@keyframes ob-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

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
          position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)',
          backgroundSize:'48px 48px',
        }} />
        {/* Green focal glow */}
        <div style={{
          position:'absolute', top:'50%', left:'28%',
          width:600, height:600,
          transform:'translate(-50%,-50%)',
          background:'radial-gradient(circle,rgba(0,214,114,0.1) 0%,transparent 68%)',
          filter:'blur(40px)',
        }} />
        {/* Purple accent */}
        <div style={{
          position:'absolute', bottom:-80, right:-60,
          width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(124,99,248,0.12) 0%,transparent 68%)',
          filter:'blur(70px)',
        }} />
        {/* Ghost SP watermark */}
        <div style={{
          position:'absolute', bottom:-60, left:-40,
          fontSize:'40vw', fontWeight:800,
          fontFamily:"'Syne', system-ui, sans-serif",
          color:'rgba(255,255,255,0.015)',
          lineHeight:1, userSelect:'none', letterSpacing:'-0.06em',
        }}>
          SP
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="ob-page relative min-h-screen flex" style={{ zIndex: 1 }}>

        {/* ── LEFT: Brand panel ───────────────────────────────── */}
        <div
          className="hidden lg:block relative overflow-hidden"
          style={{
            width: '48%',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(4,6,10,0.5)',
          }}
        >
          <OnboardingVisual />
        </div>

        {/* ── RIGHT: Form panel ───────────────────────────────── */}
        <div
          className="flex flex-col justify-center flex-1"
          style={{ padding: 'clamp(32px,6vw,72px)' }}
        >
          <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>

            {/* Logo + step dots */}
            <div
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:52,
                animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/smartpost_logo_icon_bg.png"
                  alt="SmartPost"
                  width={34} height={34}
                  style={{ borderRadius:10, boxShadow:'0 4px 16px rgba(0,214,114,0.38)' }}
                />
                <span style={{
                  color:'rgba(255,255,255,0.75)',
                  fontSize:11, fontWeight:600,
                  letterSpacing:'0.18em', textTransform:'uppercase',
                  fontFamily:"'DM Mono', monospace",
                }}>
                  SmartPost
                </span>
              </div>
              {steps.length > 1 && (
                <StepDots total={steps.length} current={stepIndex} />
              )}
            </div>

            {/* ── Step: Link WhatsApp ──────────────────────────── */}
            {steps[stepIndex] === 'wa' && (
              <form onSubmit={handleLinkWhatsApp} noValidate>
                {/* Heading */}
                <div style={{ marginBottom:40, animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both' }}>
                  <p style={{
                    fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace",
                    marginBottom:10,
                  }}>
                    — Paso {stepIndex + 1} de {steps.length}
                  </p>
                  <h1 style={{
                    fontSize:'clamp(2rem,3.5vw,2.6rem)', fontWeight:800, lineHeight:1.02,
                    letterSpacing:'-0.045em', color:'rgba(255,255,255,0.95)', marginBottom:10,
                  }}>
                    Conecta tu<br />
                    <span style={{ color:'#00d672' }}>WhatsApp</span>
                  </h1>
                  <p style={{
                    fontSize:13, color:'rgba(255,255,255,0.35)',
                    lineHeight:1.65, fontFamily:"'DM Mono', monospace",
                  }}>
                    Tu número de WhatsApp es el canal principal desde donde gestionas y publicas contenido.
                  </p>
                </div>

                {/* WA Icon + Input */}
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}>
                  {/* WhatsApp visual hint */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:12, marginBottom:24,
                    padding:'12px 16px', borderRadius:12,
                    background:'rgba(37,211,102,0.06)', border:'1px solid rgba(37,211,102,0.14)',
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%', flexShrink:0,
                      background:'#25D366',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 0 16px rgba(37,211,102,0.35)',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Mono', monospace", lineHeight:1.5 }}>
                      Ingresa el número <strong style={{ color:'rgba(255,255,255,0.7)' }}>con código de país</strong><br />
                      Ej: <span style={{ color:'#00d672' }}>+52 1 234 567 8900</span>
                    </p>
                  </div>

                  <ObInput
                    id="waphone" label="Número de WhatsApp (ej. +521234567890)"
                    type="tel" value={waPhone} onChange={setWaPhone}
                    autoComplete="tel" autoFocus
                    hasError={hasError && !waPhone.trim()}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div role="alert" style={{
                    display:'flex', alignItems:'center', gap:10,
                    background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)',
                    borderRadius:10, padding:'10px 14px', marginBottom:18,
                    color:'#f87171', fontSize:12.5, fontFamily:"'DM Mono', monospace",
                    animation:'ob-stagger 0.3s ease both',
                  }}>
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both' }}>
                  <button
                    type="submit"
                    disabled={anyLoading}
                    style={{
                      position:'relative', overflow:'hidden',
                      width:'100%', height:50, borderRadius:12,
                      background:'linear-gradient(135deg,#00d672 0%,#00b85e 100%)',
                      border:'none', cursor: anyLoading ? 'not-allowed' : 'pointer',
                      opacity: anyLoading ? 0.65 : 1,
                      animation: !anyLoading
                        ? 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both,ob-glow 3s ease-in-out infinite 1.2s'
                        : 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both',
                      transition:'transform 150ms',
                    }}
                    onMouseEnter={e => { if (!anyLoading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}
                  >
                    {!anyLoading && (
                      <span aria-hidden="true" style={{
                        position:'absolute', top:0, bottom:0, width:'45%',
                        background:'linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.24) 50%,transparent 100%)',
                        animation:'ob-shimmer 3s cubic-bezier(0.4,0,0.6,1) infinite 1.5s',
                      }} />
                    )}
                    <span style={{
                      position:'relative', zIndex:1,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      color:'#052e1c', fontSize:15, fontWeight:700, letterSpacing:'-0.01em',
                      fontFamily:"'Syne', system-ui, sans-serif",
                    }}>
                      {waLoading
                        ? <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(5,46,28,0.25)', borderTopColor:'#052e1c', animation:'ob-spin 0.7s linear infinite', display:'block' }} /> Verificando...</>
                        : 'Vincular WhatsApp →'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: Complete account (FB users only) ──────── */}
            {steps[stepIndex] === 'account' && (
              <form onSubmit={handleAccountStep} noValidate>
                {/* Heading */}
                <div style={{ marginBottom:40, animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both' }}>
                  <p style={{
                    fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace",
                    marginBottom:10,
                  }}>
                    — Paso {stepIndex + 1} de {steps.length}
                  </p>
                  <h1 style={{
                    fontSize:'clamp(2rem,3.5vw,2.6rem)', fontWeight:800, lineHeight:1.02,
                    letterSpacing:'-0.045em', color:'rgba(255,255,255,0.95)', marginBottom:10,
                  }}>
                    {userName ? `¡Hola, ${userName}!` : '¡Bienvenido!'}<br />
                    <span style={{ color:'#00d672' }}>Completa tu cuenta</span>
                  </h1>
                  <p style={{
                    fontSize:13, color:'rgba(255,255,255,0.35)',
                    lineHeight:1.65, fontFamily:"'DM Mono', monospace",
                  }}>
                    Vinculaste Facebook. Elige un email y contraseña para poder acceder de ambas formas.
                  </p>
                </div>

                {/* Fields */}
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}>
                  <ObInput id="email" label="Tu email" type="email" value={email}
                    onChange={setEmail} autoComplete="email" autoFocus
                    hasError={hasError && !email} />
                </div>
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}>
                  <ObInput
                    id="password" label="Contraseña (mín. 8 caracteres)"
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={setPassword}
                    autoComplete="new-password"
                    hasError={hasError && password.length < 8}
                    rightSlot={
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{
                          background:'none', border:'none', cursor:'pointer', padding:2,
                          color:'rgba(255,255,255,0.28)', transition:'color 150ms',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#00d672')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                      >
                        <IconEye open={showPass} />
                      </button>
                    }
                  />
                </div>
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both' }}>
                  <ObInput id="confirm" label="Confirmar contraseña"
                    type={showPass ? 'text' : 'password'}
                    value={confirmPass} onChange={setConfirmPass}
                    autoComplete="new-password"
                    hasError={hasError && password !== confirmPass} />
                </div>

                {/* Error */}
                {error && (
                  <div role="alert" style={{
                    display:'flex', alignItems:'center', gap:10,
                    background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)',
                    borderRadius:10, padding:'10px 14px', marginBottom:18,
                    color:'#f87171', fontSize:12.5, fontFamily:"'DM Mono', monospace",
                    animation:'ob-stagger 0.3s ease both',
                  }}>
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.44s both' }}>
                  <button
                    type="submit"
                    disabled={anyLoading}
                    style={{
                      position:'relative', overflow:'hidden',
                      width:'100%', height:50, borderRadius:12,
                      background:'linear-gradient(135deg,#00d672 0%,#00b85e 100%)',
                      border:'none', cursor: anyLoading ? 'not-allowed' : 'pointer',
                      opacity: anyLoading ? 0.65 : 1,
                      animation: !anyLoading
                        ? 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.44s both,ob-glow 3s ease-in-out infinite 1.2s'
                        : 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.44s both',
                      transition:'transform 150ms',
                    }}
                    onMouseEnter={e => { if (!anyLoading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}
                  >
                    {!anyLoading && (
                      <span aria-hidden="true" style={{
                        position:'absolute', top:0, bottom:0, width:'45%',
                        background:'linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.24) 50%,transparent 100%)',
                        animation:'ob-shimmer 3s cubic-bezier(0.4,0,0.6,1) infinite 1.5s',
                      }} />
                    )}
                    <span style={{
                      position:'relative', zIndex:1,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      color:'#052e1c', fontSize:15, fontWeight:700, letterSpacing:'-0.01em',
                      fontFamily:"'Syne', system-ui, sans-serif",
                    }}>
                      {step0Loading
                        ? <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(5,46,28,0.25)', borderTopColor:'#052e1c', animation:'ob-spin 0.7s linear infinite', display:'block' }} /> Guardando...</>
                        : 'Continuar →'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: Choose plan ────────────────────────────── */}
            {steps[stepIndex] === 'plan' && (
              <div>
                {/* Heading */}
                <div style={{ marginBottom:36, animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both' }}>
                  {steps.length > 1 && (
                    <p style={{
                      fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase',
                      color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace",
                      marginBottom:10,
                    }}>
                      — Paso {stepIndex + 1} de {steps.length}
                    </p>
                  )}
                  <h1 style={{
                    fontSize:'clamp(2rem,3.5vw,2.6rem)', fontWeight:800, lineHeight:1.02,
                    letterSpacing:'-0.045em', color:'rgba(255,255,255,0.95)', marginBottom:10,
                  }}>
                    Elige tu plan<br />
                    <span style={{ color:'#00d672' }}>
                      {isResubscribing ? 'Reactiva tu acceso.' : '7 días sin cargos.'}
                    </span>
                  </h1>
                  <p style={{
                    fontSize:13, color:'rgba(255,255,255,0.35)',
                    lineHeight:1.65, fontFamily:"'DM Mono', monospace",
                  }}>
                    {isResubscribing
                      ? 'Tu prueba gratuita ya fue utilizada. Elige un plan para continuar.'
                      : 'Sin cargos hasta el día 8. Cancela cuando quieras.'}
                  </p>
                </div>

                {/* Billing toggle */}
                <div style={{ marginBottom:24, animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.24s both' }}>
                  <div className="ob-toggle">
                    <button
                      type="button"
                      className={`ob-tbtn ${!annual ? 'on' : 'off'}`}
                      onClick={() => setAnnual(false)}
                    >
                      Mensual
                    </button>
                    <button
                      type="button"
                      className={`ob-tbtn ${annual ? 'on' : 'off'}`}
                      onClick={() => setAnnual(true)}
                    >
                      Anual
                      <span style={{
                        padding:'2px 6px', borderRadius:5, fontSize:9.5, fontWeight:700,
                        background: annual ? 'rgba(0,214,114,0.2)' : 'rgba(255,255,255,0.06)',
                        color: annual ? '#00d672' : 'rgba(255,255,255,0.28)',
                      }}>
                        −35%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plan cards */}
                <div
                  className="grid grid-cols-2 gap-4"
                  style={{ marginBottom:24, animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}
                >
                  {(Object.keys(PLANS) as PlanKey[]).map(key => (
                    <PlanCard
                      key={key} planKey={key} annual={annual}
                      selected={selectedPlan === key}
                      onSelect={() => setSelectedPlan(key)}
                      disabled={checkoutLoading}
                    />
                  ))}
                </div>

                {/* Error / canceled */}
                {(error || checkoutCanceled) && (
                  <div role="alert" style={{
                    display:'flex', alignItems:'center', gap:10,
                    background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)',
                    borderRadius:10, padding:'10px 14px', marginBottom:18,
                    color:'#f87171', fontSize:12.5, fontFamily:"'DM Mono', monospace",
                    animation:'ob-stagger 0.3s ease both',
                  }}>
                    <IconAlert />
                    <span>{error || 'Cancelaste el pago. Puedes intentarlo de nuevo.'}</span>
                  </div>
                )}

                {/* CTA */}
                <div style={{ animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both' }}>
                  <button
                    type="button"
                    onClick={handleStartTrial}
                    disabled={checkoutLoading}
                    style={{
                      position:'relative', overflow:'hidden',
                      width:'100%', height:54, borderRadius:12,
                      background:'linear-gradient(135deg,#00d672 0%,#00b85e 100%)',
                      border:'none', cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                      opacity: checkoutLoading ? 0.65 : 1,
                      animation: !checkoutLoading
                        ? 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both,ob-glow 3s ease-in-out infinite 1.2s'
                        : 'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both',
                      transition:'transform 150ms',
                    }}
                    onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform='scale(0.98)' }}
                    onMouseUp={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                  >
                    {!checkoutLoading && (
                      <span aria-hidden="true" style={{
                        position:'absolute', top:0, bottom:0, width:'45%',
                        background:'linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.24) 50%,transparent 100%)',
                        animation:'ob-shimmer 3s cubic-bezier(0.4,0,0.6,1) infinite 1.5s',
                      }} />
                    )}
                    <span style={{
                      position:'relative', zIndex:1,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      color:'#052e1c', fontSize:15, fontWeight:700, letterSpacing:'-0.01em',
                      fontFamily:"'Syne', system-ui, sans-serif",
                    }}>
                      {checkoutLoading
                        ? <><span style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(5,46,28,0.25)', borderTopColor:'#052e1c', animation:'ob-spin 0.7s linear infinite', display:'block' }} /> Redirigiendo...</>
                        : isResubscribing ? 'Suscribirse ahora →' : 'Iniciar prueba gratuita de 7 días →'}
                    </span>
                  </button>
                </div>

                {/* Footer note */}
                <p style={{
                  marginTop:16, textAlign:'center',
                  fontSize:10.5, color:'rgba(255,255,255,0.18)',
                  fontFamily:"'DM Mono', monospace", letterSpacing:'0.03em',
                  animation:'ob-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both',
                }}>
                  {isResubscribing
                    ? 'Pago seguro con Stripe · Cancela en cualquier momento'
                    : 'Sin cargos hasta el día 8 · Pago seguro con Stripe · Cancela en cualquier momento'}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  )
}
