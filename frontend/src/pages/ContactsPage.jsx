import React, { useEffect, useState } from 'react'
import { fetchContacts, logout } from '../utils/api'
import { toast } from '../utils/toast'
import { timeAgo } from '../utils/time'

function Avatar({ name, size = 40 }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const palette  = ['#00d672','#7c63f8','#f6ad55','#63b3ed','#b794f4','#fc8181']
  const color    = palette[(name?.charCodeAt(0) ?? 0) % palette.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${color}18`, border: `2px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', fontSize: size * 0.35, fontWeight: 700, color,
    }}>
      {initials}
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [view,     setView]     = useState('grid')

  useEffect(() => {
    fetchContacts()
      .then(data => { setContacts(data); toast.success(`${data.length} contactos cargados`) })
      .catch(e => {
        if (e.message === '401') { logout(); window.location.reload(); return }
        toast.error('Error cargando contactos')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = contacts.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Contactos</h1>
          <p style={s.subtitle}>{contacts.length} contactos registrados</p>
        </div>
        <div style={s.headerActions}>
          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              style={s.searchInput}
              placeholder="Buscar contacto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* View toggle */}
          <div style={s.viewToggle}>
            <button onClick={() => setView('grid')} style={{ ...s.viewBtn, ...(view === 'grid' ? s.viewBtnActive : {}) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button onClick={() => setView('list')} style={{ ...s.viewBtn, ...(view === 'list' ? s.viewBtnActive : {}) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={s.loading}>
          <div style={s.loadingSpinner} />
          Cargando contactos...
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>Sin resultados para "{search}"</div>
      ) : view === 'grid' ? (
        <div style={s.grid}>
          {filtered.map(c => (
            <div key={c.id} style={s.card}>
              <Avatar name={c.name} size={52} />
              <div style={s.cardName}>{c.name}</div>
              <div style={s.cardPhone}>{c.phone}</div>
              <div style={s.cardMeta}>
                {c.is_business && <span style={s.bizTag}>Empresa</span>}
                <span style={s.convCount}>{c.conversation_count || 0} conv.</span>
              </div>
              {c.last_seen && (
                <div style={s.cardSeen}>Activo {timeAgo(c.last_seen)}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={s.listView}>
          <div style={s.listHeader}>
            <span style={s.listHeaderCell}>Contacto</span>
            <span style={s.listHeaderCell}>Teléfono</span>
            <span style={s.listHeaderCell}>Tipo</span>
            <span style={s.listHeaderCell}>Conversaciones</span>
            <span style={s.listHeaderCell}>Última actividad</span>
          </div>
          {filtered.map(c => (
            <div key={c.id} style={s.listRow}>
              <div style={s.listCell}>
                <Avatar name={c.name} size={32} />
                <span style={s.listName}>{c.name}</span>
              </div>
              <span style={s.listCellText}>{c.phone}</span>
              <span style={s.listCellText}>
                {c.is_business ? <span style={s.bizTag}>Empresa</span> : <span style={s.personalTag}>Personal</span>}
              </span>
              <span style={s.listCellText}>{c.conversation_count || 0}</span>
              <span style={s.listCellText}>{c.last_seen ? timeAgo(c.last_seen) : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  page: {
    flex: 1,
    padding: '28px 32px',
    overflowY: 'auto',
    background: '#07090f',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#4b5563',
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '9px 14px 9px 34px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
    color: '#c9d1de',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12.5,
    outline: 'none',
    width: 220,
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 9,
    overflow: 'hidden',
  },
  viewBtn: {
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    color: '#4b5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  },
  viewBtnActive: {
    background: 'rgba(0,214,114,0.1)',
    color: '#00d672',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    color: '#4b5563',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    flex: 1,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid rgba(0,214,114,0.2)',
    borderTopColor: '#00d672',
    animation: 'sp-spin 0.75s linear infinite',
  },
  empty: {
    color: '#4b5563',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    textAlign: 'center',
    padding: 60,
  },

  // Grid view
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 14,
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '22px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7,
    transition: 'border-color 0.15s, background 0.15s',
  },
  cardName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: '#d1d9e6',
    textAlign: 'center',
  },
  cardPhone: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#4b5563',
  },
  cardMeta: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardSeen: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
    marginTop: 2,
  },

  // List view
  listView: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  listHeaderCell: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  listRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    alignItems: 'center',
    transition: 'background 0.15s',
  },
  listCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  listName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: '#d1d9e6',
  },
  listCellText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#4b5563',
  },
  bizTag: {
    background: 'rgba(0,214,114,0.1)',
    color: '#00d672',
    borderRadius: 6,
    padding: '2px 7px',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    border: '1px solid rgba(0,214,114,0.2)',
  },
  personalTag: {
    background: 'rgba(124,99,248,0.1)',
    color: '#7c63f8',
    borderRadius: 6,
    padding: '2px 7px',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    border: '1px solid rgba(124,99,248,0.2)',
  },
  convCount: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#4b5563',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: '2px 7px',
  },
}
