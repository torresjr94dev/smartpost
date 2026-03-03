import React from 'react'

const NAV = [
  { id: 'conversations', icon: ChatIcon,  label: 'Conversaciones' },
  { id: 'contacts',      icon: UsersIcon, label: 'Contactos'      },
  { id: 'analytics',     icon: ChartIcon, label: 'Analíticas'     },
  { id: 'bot',           icon: BotIcon,   label: 'Bot IA'         },
]

function ChatIcon({ active }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
    </svg>
  )
}
function UsersIcon({ active }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  )
}
function BotIcon({ active }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
}
function ChartIcon({ active }) {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  )
}

export default function Sidebar({ activeSection, onNavigate, user, onLogout }) {
  const initials = user?.name?.charAt(0).toUpperCase() || 'A'

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logoArea}>
        <div style={s.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
          </svg>
        </div>
        <div>
          <div style={s.logoTitle}>SmartPost</div>
          <div style={s.logoSub}>Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navSection}>MENÚ</div>
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
            >
              <span style={{ color: active ? '#00d672' : '#374151', transition: 'color 0.15s', display: 'flex' }}>
                <Icon active={active} />
              </span>
              <span style={{ ...s.navLabel, color: active ? '#e6edf3' : '#6b7280' }}>
                {label}
              </span>
              {active && <div style={s.activeDot} />}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div style={s.footer}>
        <div style={s.statusRow}>
          <div style={s.statusDot} />
          <span style={s.statusText}>Conectado</span>
        </div>
        <div style={s.userRow}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name || 'Admin'}</div>
            <div style={s.userRole}>Administrador</div>
          </div>
          <button onClick={onLogout} style={s.logoutBtn} title="Cerrar sesión">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

const s = {
  sidebar: {
    width: 210,
    minWidth: 210,
    height: '100vh',
    background: 'rgba(9, 11, 19, 0.98)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '24px 18px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: 'linear-gradient(135deg, #00d672, #00a857)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,214,114,0.3)',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.3px',
    fontFamily: 'Inter, sans-serif',
  },
  logoSub: {
    fontSize: 10,
    color: '#374151',
    marginTop: 1,
    fontFamily: 'Inter, sans-serif',
  },
  nav: {
    flex: 1,
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navSection: {
    fontSize: 9,
    fontWeight: 700,
    color: '#374151',
    letterSpacing: '1.2px',
    padding: '4px 10px 10px',
    fontFamily: 'Inter, sans-serif',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.15s',
    position: 'relative',
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(0,214,114,0.08)',
  },
  navLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 500,
    flex: 1,
    transition: 'color 0.15s',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#00d672',
    boxShadow: '0 0 6px rgba(0,214,114,0.8)',
    flexShrink: 0,
  },
  footer: {
    padding: '12px 14px 18px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00d672',
    boxShadow: '0 0 5px rgba(0,214,114,0.7)',
  },
  statusText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: '8px 10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d672, #7c63f8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#d1d9e6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
    marginTop: 1,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    padding: 3,
    borderRadius: 6,
    transition: 'color 0.15s',
    flexShrink: 0,
  },
}
