import React, { useState } from 'react'
import { login } from '../utils/api'
import { toast } from '../utils/toast'

export default function LoginPage({ onLogin }) {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.warning('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Bienvenido al panel')
      onLogin()
    } catch {
      toast.error('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Orbs de fondo */}
      <div style={{ ...s.orb, width: 600, height: 600, top: -200, left: -200, background: 'radial-gradient(circle, rgba(0,214,114,0.07) 0%, transparent 65%)' }} />
      <div style={{ ...s.orb, width: 500, height: 500, bottom: -100, right: -100, background: 'radial-gradient(circle, rgba(124,99,248,0.08) 0%, transparent 65%)' }} />
      <div style={{ ...s.orb, width: 300, height: 300, top: '60%', left: '55%', background: 'radial-gradient(circle, rgba(0,214,114,0.04) 0%, transparent 70%)' }} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
            </svg>
          </div>
          <div>
            <div style={s.logoTitle}>SmartPost</div>
            <div style={s.logoSub}>WhatsApp Dashboard</div>
          </div>
        </div>

        <h1 style={s.heading}>Iniciar sesión</h1>
        <p style={s.subheading}>Accede a tu panel de administración</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Usuario</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                style={s.input}
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input
                style={s.input}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>
                {showPass
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading
              ? <span style={s.spinner} />
              : 'Entrar al panel'
            }
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#07090f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    width: 420,
    background: 'rgba(11, 15, 24, 0.92)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: '40px 40px 44px',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 36,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #00d672, #00a857)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 24px rgba(0,214,114,0.35)',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.4px',
  },
  logoSub: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.5px',
    margin: '0 0 6px',
  },
  subheading: {
    fontSize: 13,
    color: '#6b7280',
    margin: '0 0 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 42px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e6edf3',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #00d672 0%, #00b85e 100%)',
    color: '#003d1f',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    boxShadow: '0 4px 20px rgba(0,214,114,0.3)',
    transition: 'opacity 0.2s',
    letterSpacing: '0.2px',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 17,
    height: 17,
    borderRadius: '50%',
    border: '2.5px solid rgba(0,50,20,0.3)',
    borderTopColor: '#003d1f',
    animation: 'sp-spin 0.75s linear infinite',
  },
}
