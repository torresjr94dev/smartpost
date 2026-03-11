'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

  .rg-page { font-family: 'Syne', system-ui, sans-serif; }

  @keyframes rg-enter {
    from { opacity:0; transform:translateY(22px) scale(0.98); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }
  @keyframes rg-stagger {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rg-spin {
    to { transform:rotate(360deg); }
  }
  @keyframes rg-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-5px); }
    40%     { transform:translateX(5px); }
    60%     { transform:translateX(-3px); }
    80%     { transform:translateX(3px); }
  }
  @keyframes rg-shimmer {
    from { left:-70%; }
    to   { left:160%; }
  }
  @keyframes rg-glow-btn {
    0%,100% { box-shadow:0 4px 24px rgba(0,214,114,0.38); }
    50%     { box-shadow:0 4px 38px rgba(0,214,114,0.62); }
  }
  @keyframes rg-line-draw {
    from { height:0; opacity:0; }
    to   { height:100%; opacity:1; }
  }
  @keyframes rg-dot-pop {
    from { transform:scale(0.4); opacity:0; }
    to   { transform:scale(1); opacity:1; }
  }

  /* ── Field ── */
  .rg-field-wrap {
    position:relative;
    border-bottom:1.5px solid rgba(255,255,255,0.1);
    transition:border-color 220ms;
    padding-bottom:2px;
    margin-bottom:20px;
  }
  .rg-field-wrap:focus-within { border-bottom-color:#00d672; }
  .rg-field-wrap.has-error    { border-bottom-color:rgba(239,68,68,0.7); animation:rg-shake 0.4s ease; }

  .rg-bare-input {
    width:100%; background:transparent; border:none; outline:none;
    color:rgba(255,255,255,0.92); font-size:14.5px;
    padding:22px 0 5px; caret-color:#00d672;
    font-family:'Syne', system-ui, sans-serif;
    letter-spacing:-0.01em;
  }
  .rg-bare-input:-webkit-autofill,
  .rg-bare-input:-webkit-autofill:hover,
  .rg-bare-input:-webkit-autofill:focus {
    -webkit-text-fill-color: rgba(255,255,255,0.92);
    -webkit-box-shadow: 0 0 0 1000px #07090f inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  .rg-bare-label {
    position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    font-size:12.5px; color:rgba(255,255,255,0.3);
    pointer-events:none;
    transition:all 200ms cubic-bezier(0.4,0,0.2,1);
    letter-spacing:0.01em;
    font-family:'DM Mono', monospace;
  }
  .rg-field-wrap:focus-within .rg-bare-label,
  .rg-bare-label.floated {
    top:3px; transform:translateY(0);
    font-size:8.5px; letter-spacing:0.13em;
    text-transform:uppercase; color:#00d672;
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
    <div className={`rg-field-wrap${hasError ? ' has-error' : ''}`}>
      <label htmlFor={id} className={`rg-bare-label${floated ? ' floated' : ''}`}>
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete} autoFocus={autoFocus}
        className="rg-bare-input"
      />
      {rightSlot && (
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-30%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Onboarding Timeline (right panel visual) ─────────────────────
function OnboardingTimeline() {
  const steps = [
    {
      number: '01',
      title:  'Crea tu cuenta',
      desc:   'Email y contraseña en segundos.',
      active: true,
    },
    {
      number: '02',
      title:  'Conecta WhatsApp',
      desc:   'Tu número es el canal de publicación.',
      active: false,
    },
    {
      number: '03',
      title:  'Elige tu plan',
      desc:   '7 días de prueba gratis, sin tarjeta.',
      active: false,
    },
    {
      number: '04',
      title:  '¡Publica tu primer post!',
      desc:   'Envía un mensaje y listo.',
      active: false,
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'48px' }}>

      {/* Stats row */}
      <div style={{ display:'flex', gap:32, animation:'rg-stagger 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}>
        {[
          { num: '500+',  label: 'Marcas activas' },
          { num: '7 días', label: 'Gratis, sin riesgo' },
          { num: '3',     label: 'Plataformas' },
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

      {/* Center: timeline */}
      <div style={{ flex:1, display:'flex', alignItems:'center', paddingTop:48, paddingBottom:48 }}>
        <div style={{ width:'100%' }}>
          <p style={{
            fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.28)', fontFamily:"'DM Mono', monospace",
            marginBottom:12,
            animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both',
          }}>
            — así de fácil
          </p>

          <h2 style={{
            fontSize:'clamp(2rem,2.8vw,3rem)', fontWeight:800, lineHeight:0.96,
            letterSpacing:'-0.045em', color:'rgba(255,255,255,0.92)',
            marginBottom:40,
            animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.62s both',
          }}>
            Empieza en{' '}
            <span style={{ color:'#00d672', textShadow:'0 0 40px rgba(0,214,114,0.45)' }}>
              4 pasos.
            </span>
          </h2>

          {/* Steps */}
          <div style={{ position:'relative' }}>
            {/* Vertical connector line */}
            <div style={{
              position:'absolute', left:17, top:18, width:2,
              height:`calc(100% - 36px)`,
              background:'rgba(255,255,255,0.06)',
              borderRadius:1,
            }} />

            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:20,
                    paddingBottom: i < steps.length - 1 ? 28 : 0,
                    animation:`rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) ${0.72 + i * 0.12}s both`,
                  }}
                >
                  {/* Number circle */}
                  <div style={{
                    width:36, height:36, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: step.active
                      ? 'linear-gradient(135deg,#00d672 0%,#00b85e 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: step.active
                      ? 'none'
                      : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: step.active ? '0 0 20px rgba(0,214,114,0.35)' : 'none',
                    transition:'all 300ms',
                    position:'relative', zIndex:1,
                    animation:`rg-dot-pop 0.4s cubic-bezier(0.16,1,0.3,1) ${0.78 + i * 0.12}s both`,
                  }}>
                    <span style={{
                      fontSize:11, fontWeight:700,
                      fontFamily:"'DM Mono', monospace",
                      color: step.active ? '#052e1c' : 'rgba(255,255,255,0.25)',
                      letterSpacing:'0.04em',
                    }}>
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div style={{ paddingTop:7 }}>
                    <p style={{
                      fontSize:13.5, fontWeight:700,
                      color: step.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                      letterSpacing:'-0.02em', marginBottom:3,
                      transition:'color 300ms',
                    }}>
                      {step.title}
                    </p>
                    <p style={{
                      fontSize:11.5,
                      color: step.active ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.18)',
                      fontFamily:"'DM Mono', monospace",
                      lineHeight:1.5,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 1.15s both' }}>
        <h3 style={{
          fontSize:'clamp(1.5rem,2vw,2.1rem)', fontWeight:800, lineHeight:0.96,
          letterSpacing:'-0.04em', color:'rgba(255,255,255,0.88)',
          marginBottom:10,
        }}>
          Sin tarjeta<br />
          <span style={{ color:'rgba(255,255,255,0.35)' }}>hasta el día 8.</span>
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

// ─── Page ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  )
}

function RegisterPageInner() {
  const router = useRouter()

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [hasError,    setHasError]    = useState(false)

  function triggerError(msg: string) {
    setError(msg)
    setHasError(true)
    setTimeout(() => setHasError(false), 500)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setHasError(false)

    if (!name.trim())                   return triggerError('El nombre es requerido')
    if (!email.trim())                  return triggerError('El email es requerido')
    if (password.length < 8)            return triggerError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirmPass)       return triggerError('Las contraseñas no coinciden')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) {
        triggerError(data.error ?? 'Error al crear cuenta. Intenta de nuevo.')
        return
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email:    email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (result?.error) {
        triggerError('Cuenta creada pero error al iniciar sesión. Ve a /login')
        return
      }
      router.push('/onboarding')
      router.refresh()
    } catch {
      triggerError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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
          backgroundImage:'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize:'48px 48px',
        }} />

        {/* Green focal glow — left side */}
        <div style={{
          position:'absolute', top:'50%', left:'25%',
          width:600, height:600,
          transform:'translate(-50%,-50%)',
          background:'radial-gradient(circle, rgba(0,214,114,0.12) 0%, transparent 68%)',
          filter:'blur(40px)',
        }} />

        {/* Purple accent — bottom right */}
        <div style={{
          position:'absolute', bottom:'-80px', right:'-60px',
          width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(124,99,248,0.14) 0%, transparent 68%)',
          filter:'blur(70px)',
        }} />

        {/* Ghost SP watermark */}
        <div style={{
          position:'absolute',
          bottom:'-60px', right:'-40px',
          fontSize:'40vw', fontWeight:800,
          fontFamily:"'Syne', system-ui, sans-serif",
          color:'rgba(255,255,255,0.018)',
          lineHeight:1, userSelect:'none',
          letterSpacing:'-0.06em',
          pointerEvents:'none',
        }}>
          SP
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div
        className="rg-page relative min-h-screen flex"
        style={{ zIndex: 1 }}
      >

        {/* ── LEFT: Form column ───────────────────────────────── */}
        <div
          className="flex flex-col justify-center w-full lg:w-[48%] xl:w-[44%]"
          style={{
            padding:'clamp(32px, 6vw, 72px)',
            borderRight:'1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ maxWidth:420, width:'100%', margin:'0 auto' }}>

            {/* Logo + brand */}
            <div
              className="flex items-center gap-3"
              style={{
                marginBottom:'52px',
                animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/smartpost_logo_icon_bg.png"
                alt="SmartPost"
                width={34} height={34}
                style={{ borderRadius:'10px', boxShadow:'0 4px 16px rgba(0,214,114,0.38)' }}
              />
              <span style={{
                color:'rgba(255,255,255,0.75)',
                fontSize:'11px', fontWeight:600,
                letterSpacing:'0.18em',
                textTransform:'uppercase',
                fontFamily:"'DM Mono', monospace",
              }}>
                SmartPost
              </span>
            </div>

            {/* Heading */}
            <div
              style={{
                marginBottom:'36px',
                animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both',
              }}
            >
              <p style={{
                fontSize:'11px', letterSpacing:'0.16em',
                color:'rgba(255,255,255,0.28)', textTransform:'uppercase',
                fontFamily:"'DM Mono', monospace", marginBottom:'10px',
              }}>
                — Registro
              </p>
              <h1 style={{
                fontSize:'clamp(2.1rem, 3.5vw, 2.8rem)',
                fontWeight:800, lineHeight:1.0,
                letterSpacing:'-0.045em',
                color:'rgba(255,255,255,0.95)',
                marginBottom:'10px',
              }}>
                Crea tu cuenta<br />
                <span style={{ color:'#00d672' }}>Empieza gratis.</span>
              </h1>
              <p style={{
                fontSize:'13px',
                color:'rgba(255,255,255,0.35)',
                lineHeight:1.65,
                fontFamily:"'DM Mono', monospace",
              }}>
                7 días de prueba gratuita · Sin tarjeta requerida hasta el día 8
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ gap:0 }}>

              {/* Name */}
              <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both' }}>
                <UnderlineInput
                  id="name" label="Tu nombre" type="text"
                  value={name} onChange={setName}
                  autoComplete="name" autoFocus
                  hasError={hasError && !name.trim()}
                />
              </div>

              {/* Email */}
              <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}>
                <UnderlineInput
                  id="email" label="Email" type="email"
                  value={email} onChange={setEmail}
                  autoComplete="email"
                  hasError={hasError && !email.trim()}
                />
              </div>

              {/* Password */}
              <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.34s both' }}>
                <UnderlineInput
                  id="password" label="Contraseña (mín. 8 caracteres)"
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={setPassword}
                  autoComplete="new-password"
                  hasError={hasError && password.length < 8}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{
                        background:'none', border:'none', cursor:'pointer', padding:'2px',
                        color:'rgba(255,255,255,0.28)', transition:'color 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#00d672')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <IconEye open={showPass} />
                    </button>
                  }
                />
              </div>

              {/* Confirm Password */}
              <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.40s both', marginBottom:28 }}>
                <UnderlineInput
                  id="confirm" label="Confirmar contraseña"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass} onChange={setConfirmPass}
                  autoComplete="new-password"
                  hasError={hasError && password !== confirmPass}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert" aria-live="polite"
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    background:'rgba(239,68,68,0.07)',
                    border:'1px solid rgba(239,68,68,0.18)',
                    borderRadius:10, padding:'10px 14px', marginBottom:18,
                    color:'#f87171', fontSize:12.5,
                    fontFamily:"'DM Mono', monospace",
                    animation:'rg-stagger 0.3s ease both',
                  }}
                >
                  <IconAlert />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <div style={{ animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both', marginBottom:20 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    position:'relative', overflow:'hidden',
                    width:'100%', height:50,
                    background:'linear-gradient(135deg, #00d672 0%, #00b85e 100%)',
                    border:'none', borderRadius:12, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                    transition:'all 200ms',
                    animation: !loading
                      ? 'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both, rg-glow-btn 3s ease-in-out infinite 1.2s'
                      : 'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
                  onMouseUp={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                >
                  {!loading && (
                    <span aria-hidden="true" style={{
                      position:'absolute', top:0, bottom:0, width:'45%',
                      background:'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.24) 50%, transparent 100%)',
                      animation:'rg-shimmer 3s cubic-bezier(0.4,0,0.6,1) infinite 1.5s',
                    }} />
                  )}
                  <span style={{
                    position:'relative', zIndex:1,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    color:'#052e1c', fontSize:15, fontWeight:700, letterSpacing:'-0.01em',
                    fontFamily:"'Syne', system-ui, sans-serif",
                  }}>
                    {loading ? (
                      <>
                        <span style={{
                          width:16, height:16, borderRadius:'50%',
                          border:'2px solid rgba(5,46,28,0.25)',
                          borderTopColor:'#052e1c',
                          animation:'rg-spin 0.7s linear infinite',
                          display:'block',
                        }} />
                        Creando cuenta...
                      </>
                    ) : 'Crear cuenta gratis →'}
                  </span>
                </button>
              </div>

            </form>

            {/* Login link */}
            <p
              style={{
                textAlign:'center',
                fontSize:'12.5px',
                color:'rgba(255,255,255,0.3)',
                fontFamily:"'DM Mono', monospace",
                animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.58s both',
              }}
            >
              ¿Ya tienes cuenta?{' '}
              <a
                href="/login"
                style={{ color:'#00d672', textDecoration:'none', transition:'opacity 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Inicia sesión →
              </a>
            </p>

            {/* Footer */}
            <p
              style={{
                marginTop:'28px',
                fontSize:'10.5px',
                color:'rgba(255,255,255,0.18)',
                fontFamily:"'DM Mono', monospace",
                letterSpacing:'0.03em',
                animation:'rg-stagger 0.5s cubic-bezier(0.16,1,0.3,1) 0.65s both',
              }}
            >
              © SmartPost · {new Date().getFullYear()}
            </p>

          </div>
        </div>

        {/* ── RIGHT: Brand panel ──────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
          style={{ background:'rgba(4,6,10,0.6)' }}
        >
          <OnboardingTimeline />
        </div>

      </div>
    </>
  )
}
