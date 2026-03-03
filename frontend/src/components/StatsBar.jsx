import React from 'react'

const CARDS = [
  { key: 'total_conversations',   label: 'Total',      color: '#7c63f8', icon: 'all'  },
  { key: 'open_conversations',    label: 'Abiertas',   color: '#00d672', icon: 'open' },
  { key: 'pending_conversations', label: 'Pendientes', color: '#f6ad55', icon: 'pend' },
  { key: 'total_inbound',         label: 'Recibidos',  color: '#63b3ed', icon: 'in'   },
  { key: 'total_contacts',        label: 'Contactos',  color: '#b794f4', icon: 'usr'  },
]

function StatIcon({ type, color }) {
  const p = { width: 14, height: 14, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'all') return <svg viewBox="0 0 24 24" {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  if (type === 'open') return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  if (type === 'pend') return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  if (type === 'in')   return <svg viewBox="0 0 24 24" {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  return <svg viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}

export default function StatsBar({ stats }) {
  if (!stats) return (
    <div style={s.bar}>
      {CARDS.map(c => (
        <div key={c.key} style={s.card}>
          <div style={{ ...s.skeleton, width: 40, height: 28, marginBottom: 6 }} />
          <div style={{ ...s.skeleton, width: 60, height: 10 }} />
        </div>
      ))}
    </div>
  )

  return (
    <div style={s.bar}>
      {CARDS.map(c => (
        <div key={c.key} style={{ ...s.card, borderColor: `${c.color}20` }}>
          <div style={s.cardTop}>
            <div style={{ ...s.iconBox, background: `${c.color}14`, color: c.color }}>
              <StatIcon type={c.icon} color={c.color} />
            </div>
            <div style={{ ...s.value, color: c.color }}>
              {stats[c.key] ?? '—'}
            </div>
          </div>
          <div style={s.label}>{c.label}</div>
          <div style={{ ...s.bar2, background: `${c.color}15` }}>
            <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${c.color}60, transparent)`, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  bar: {
    display: 'flex',
    gap: 10,
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(9,11,19,0.7)',
    backdropFilter: 'blur(10px)',
  },
  card: {
    flex: 1,
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'border-color 0.2s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1,
  },
  label: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: 600,
  },
  bar2: {
    height: 3,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  skeleton: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}
