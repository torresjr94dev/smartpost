'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

// Metadata se mueve al layout porque esta es una client component
// export const metadata: Metadata = { title: 'Iniciar sesión' }

// ─── SVG Icons ────────────────────────────────────────────────────
function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-ink-muted">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-ink-muted">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Completa todos los campos')
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
        setError('Email o contraseña incorrectos')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs de fondo */}
      <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,214,114,0.07) 0%, transparent 65%)' }} />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(124,99,248,0.08) 0%, transparent 65%)' }} />
      <div className="absolute top-[60%] left-[55%] w-[300px] h-[300px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,214,114,0.04) 0%, transparent 70%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">
        <div className="glass-card p-10">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-9">
            <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-green flex items-center justify-center flex-shrink-0 text-[#003d1f]"
                 style={{ boxShadow: '0 6px 24px rgba(0,214,114,0.35)' }}>
              <IconWhatsApp />
            </div>
            <div>
              <p className="text-[18px] font-bold text-ink-primary tracking-tight">SmartPost</p>
              <p className="text-[11px] text-ink-muted mt-0.5">WhatsApp Dashboard</p>
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-ink-primary tracking-tight mb-1.5">
            Iniciar sesión
          </h1>
          <p className="text-[13px] text-ink-secondary mb-7">
            Accede a tu panel de administración
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.7px]">
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 pointer-events-none">
                  <IconUser />
                </span>
                <input
                  id="email"
                  type="email"
                  className="input-base pl-10"
                  placeholder="tu@empresa.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.7px]">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 pointer-events-none">
                  <IconLock />
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-base pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 text-ink-muted hover:text-ink-secondary transition-colors cursor-pointer p-1"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <IconEye open={showPass} />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1 h-12 text-[14px]"
            >
              {loading ? (
                <span className="w-[18px] h-[18px] rounded-full border-2 border-[#003d1f]/30 border-t-[#003d1f] sp" />
              ) : (
                'Entrar al panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-ink-muted mt-5">
          SmartPost v1.0 — TorresDev © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
