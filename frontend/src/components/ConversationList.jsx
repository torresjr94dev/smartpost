import React, { useState } from 'react'
import { timeAgo } from '../utils/time'

const STATUS_FILTERS = [
  { id: 'all',     label: 'Todas'     },
  { id: 'open',    label: 'Abiertas'  },
  { id: 'pending', label: 'Pendientes'},
  { id: 'closed',  label: 'Cerradas'  },
]

const STATUS_COLOR = {
  open:    '#00d672',
  closed:  '#374151',
  pending: '#f6ad55',
}

function Avatar({ name, isBusiness }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const palette  = ['#00d672','#7c63f8','#f6ad55','#63b3ed','#b794f4','#fc8181','#00bcd4']
  const color    = palette[(name?.charCodeAt(0) ?? 0) % palette.length]
  return (
    <div style={{ ...s.avatar, background: `${color}18`, border: `1.5px solid ${color}40` }}>
      <span style={{ ...s.avatarText, color }}>{initials}</span>
      {isBusiness && <div style={s.bizBadge}>B</div>}
    </div>
  )
}

export default function ConversationList({ conversations, selectedId, onSelect, loading }) {
  const [search,      setSearch]      = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = conversations.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchSearch = !search || c.contact_name?.toLowerCase().includes(search.toLowerCase()) || c.contact_phone?.includes(search)
    return matchStatus && matchSearch
  })

  const countByStatus = (st) => conversations.filter(c => c.status === st).length

  return (
    <div style={s.container}>
      {/* Search */}
      <div style={s.searchArea}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={2.5} strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            style={s.searchInput}
            placeholder="Buscar contacto o número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={s.clearBtn}>×</button>
          )}
        </div>
      </div>

      {/* Status filters */}
      <div style={s.filters}>
        {STATUS_FILTERS.map(f => {
          const active = statusFilter === f.id
          const count  = f.id === 'all' ? conversations.length : countByStatus(f.id)
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{ ...s.filterBtn, ...(active ? s.filterBtnActive : {}) }}
            >
              {f.label}
              {count > 0 && (
                <span style={{
                  ...s.filterCount,
                  background: active ? 'rgba(0,214,114,0.25)' : 'rgba(255,255,255,0.06)',
                  color: active ? '#00d672' : '#4b5563',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div style={s.list}>
        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={s.skeletonItem}>
              <div style={s.skeletonAvatar} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ ...s.skeletonLine, width: '60%' }} />
                <div style={{ ...s.skeletonLine, width: '85%', height: 10 }} />
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div style={s.empty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Sin resultados</span>
          </div>
        )}
        {!loading && filtered.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            style={{ ...s.item, ...(selectedId === conv.id ? s.itemActive : {}) }}
          >
            <div style={s.itemRow}>
              <Avatar name={conv.contact_name} isBusiness={conv.is_business} />
              <div style={s.itemInfo}>
                <div style={s.itemHeader}>
                  <span style={s.itemName}>{conv.contact_name}</span>
                  <span style={s.itemTime}>{timeAgo(conv.last_message_at)}</span>
                </div>
                <div style={s.itemFooter}>
                  <span style={s.itemPreview}>{conv.last_message}</span>
                  {conv.unread_count > 0 && (
                    <span style={s.unreadBadge}>{conv.unread_count}</span>
                  )}
                </div>
                <div style={{ ...s.statusPill, background: `${STATUS_COLOR[conv.status]}15`, color: STATUS_COLOR[conv.status] }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[conv.status] }} />
                  {{ open: 'Abierta', closed: 'Cerrada', pending: 'Pendiente' }[conv.status]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: {
    width: 290,
    minWidth: 290,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(9,11,19,0.6)',
  },
  searchArea: {
    padding: '14px 12px 8px',
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
    width: '100%',
    padding: '9px 32px 9px 34px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
    color: '#c9d1de',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12.5,
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 2,
  },
  filters: {
    display: 'flex',
    gap: 4,
    padding: '4px 12px 10px',
    overflowX: 'auto',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'transparent',
    color: '#6b7280',
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'rgba(0,214,114,0.08)',
    borderColor: 'rgba(0,214,114,0.25)',
    color: '#00d672',
  },
  filterCount: {
    borderRadius: 6,
    padding: '1px 5px',
    fontSize: 9,
    fontWeight: 700,
    transition: 'all 0.15s',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px 8px',
  },
  empty: {
    padding: '48px 20px',
    textAlign: 'center',
    color: '#374151',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  item: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    padding: '2px 0',
    transition: 'background 0.15s',
    marginBottom: 2,
    textAlign: 'left',
  },
  itemActive: {
    background: 'rgba(0,214,114,0.06)',
  },
  itemRow: {
    display: 'flex',
    gap: 10,
    padding: '10px 10px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 700,
  },
  bizBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: '50%',
    background: '#00d672',
    color: '#000',
    fontSize: 7,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    border: '1.5px solid #07090f',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
    gap: 4,
  },
  itemName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: '#d1d9e6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  itemTime: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    gap: 4,
  },
  itemPreview: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11.5,
    color: '#4b5563',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  unreadBadge: {
    background: '#00d672',
    color: '#003d1f',
    borderRadius: 10,
    padding: '1px 6px',
    fontSize: 9,
    fontWeight: 800,
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 7px',
    borderRadius: 6,
    fontSize: 9.5,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  skeletonItem: {
    display: 'flex',
    gap: 10,
    padding: '10px 10px',
    alignItems: 'center',
    marginBottom: 4,
  },
  skeletonAvatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.05)',
  },
}
