import React, { useEffect, useRef, useState } from 'react'
import { formatMessageTime, formatDate } from '../utils/time'

const STATUS_COLOR = { open: '#00d672', closed: '#374151', pending: '#f6ad55' }
const STATUS_LABEL = { open: 'Abierta', closed: 'Cerrada', pending: 'Pendiente' }

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

function StatusIcon({ status }) {
  const color = status === 'read' ? '#00d672' : '#4b5563'
  if (status === 'sent') return (
    <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
      <path d="M1 5l4 4 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  return (
    <svg width="16" height="10" viewBox="0 0 18 11" fill="none">
      <path d="M1 5l4 4 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5l4 4 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MessageBubble({ msg }) {
  const isOut = msg.direction === 'outbound'
  return (
    <div style={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
      <div style={{ ...s.bubble, ...(isOut ? s.bubbleOut : s.bubbleIn) }}>
        <p style={s.bubbleText}>{msg.content}</p>
        <div style={s.bubbleMeta}>
          <span style={s.bubbleTime}>{formatMessageTime(msg.sent_at)}</span>
          {isOut && <StatusIcon status={msg.status} />}
        </div>
      </div>
    </div>
  )
}

function DateSeparator({ date }) {
  return (
    <div style={s.dateSep}>
      <div style={s.dateLine} />
      <span style={s.dateLabel}>{date}</span>
      <div style={s.dateLine} />
    </div>
  )
}

function groupByDate(messages) {
  const groups = []
  let lastDate = null
  for (const msg of messages) {
    const d = formatDate(msg.sent_at)
    if (d !== lastDate) { groups.push({ type: 'date', label: d }); lastDate = d }
    groups.push({ type: 'msg', msg })
  }
  return groups
}

function ContactPanel({ conversation, messages }) {
  const totalMsgs = messages.length
  const inbound   = messages.filter(m => m.direction === 'inbound').length
  const outbound  = messages.filter(m => m.direction === 'outbound').length
  const status    = conversation.status

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>Información</div>

      {/* Avatar + nombre */}
      <div style={s.panelProfile}>
        <Avatar name={conversation.contact_name} size={56} />
        <div style={s.panelName}>{conversation.contact_name}</div>
        <div style={s.panelPhone}>{conversation.contact_phone}</div>
        {conversation.is_business && (
          <span style={s.bizTag}>Empresa</span>
        )}
        <span style={{ ...s.statusTag, background: `${STATUS_COLOR[status]}15`, color: STATUS_COLOR[status], borderColor: `${STATUS_COLOR[status]}30` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status], display: 'inline-block' }} />
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div style={s.divider} />

      {/* Stats de mensajes */}
      <div style={s.panelSection}>
        <div style={s.panelSectionTitle}>Actividad</div>
        <div style={s.panelStats}>
          <div style={s.panelStat}>
            <div style={{ ...s.panelStatVal, color: '#7c63f8' }}>{totalMsgs}</div>
            <div style={s.panelStatLabel}>Mensajes</div>
          </div>
          <div style={s.panelStat}>
            <div style={{ ...s.panelStatVal, color: '#63b3ed' }}>{inbound}</div>
            <div style={s.panelStatLabel}>Recibidos</div>
          </div>
          <div style={s.panelStat}>
            <div style={{ ...s.panelStatVal, color: '#b794f4' }}>{outbound}</div>
            <div style={s.panelStatLabel}>Enviados</div>
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* Detalles */}
      <div style={s.panelSection}>
        <div style={s.panelSectionTitle}>Detalles</div>
        <div style={s.panelDetail}>
          <span style={s.panelDetailLabel}>Mensajes sin leer</span>
          <span style={s.panelDetailVal}>{conversation.unread_count || 0}</span>
        </div>
        <div style={s.panelDetail}>
          <span style={s.panelDetailLabel}>ID conversación</span>
          <span style={s.panelDetailVal}>#{conversation.id}</span>
        </div>
      </div>
    </div>
  )
}

export default function ChatView({ conversation, messages, loading }) {
  const bottomRef    = useRef(null)
  const [showPanel, setShowPanel] = useState(true)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversation) {
    return (
      <div style={s.empty}>
        <div style={s.emptyOrb} />
        <div style={s.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <p style={s.emptyText}>Selecciona una conversación</p>
        <p style={s.emptySubText}>Los mensajes aparecerán aquí</p>
      </div>
    )
  }

  const items = groupByDate(messages)

  return (
    <div style={s.wrapper}>
      {/* Chat */}
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <Avatar name={conversation.contact_name} size={38} />
          <div style={s.headerInfo}>
            <div style={s.headerName}>{conversation.contact_name}</div>
            <div style={s.headerPhone}>{conversation.contact_phone}</div>
          </div>
          <div style={s.headerRight}>
            <span style={{ ...s.statusPill, background: `${STATUS_COLOR[conversation.status]}15`, color: STATUS_COLOR[conversation.status] }}>
              {STATUS_LABEL[conversation.status]}
            </span>
            <span style={s.msgCount}>{messages.length} msgs</span>
            <button
              onClick={() => setShowPanel(v => !v)}
              style={{ ...s.panelToggle, background: showPanel ? 'rgba(0,214,114,0.1)' : 'rgba(255,255,255,0.04)', color: showPanel ? '#00d672' : '#4b5563' }}
              title="Panel de contacto"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.feed}>
          {loading && (
            <div style={s.loadingMsg}>
              <div style={s.loadingDot} />
              Cargando mensajes...
            </div>
          )}
          {!loading && items.map((item, i) =>
            item.type === 'date'
              ? <DateSeparator key={`d-${i}`} date={item.label} />
              : <MessageBubble key={item.msg.id} msg={item.msg} />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Contact panel */}
      {showPanel && (
        <ContactPanel conversation={conversation} messages={messages} />
      )}
    </div>
  )
}

const s = {
  wrapper: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0a0d15',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: '#0a0d15',
    position: 'relative',
    overflow: 'hidden',
  },
  emptyOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,214,114,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  emptyIcon: { opacity: 0.6, zIndex: 1 },
  emptyText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    color: '#374151',
    fontWeight: 500,
    zIndex: 1,
    margin: 0,
  },
  emptySubText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#1f2937',
    zIndex: 1,
    margin: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    background: 'rgba(9,11,19,0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: '#e6edf3',
  },
  headerPhone: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#4b5563',
    marginTop: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  statusPill: {
    padding: '3px 10px',
    borderRadius: 20,
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  msgCount: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#374151',
  },
  panelToggle: {
    border: 'none',
    borderRadius: 8,
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    backgroundImage: `radial-gradient(ellipse at top left, rgba(0,214,114,0.025) 0%, transparent 55%),
      radial-gradient(ellipse at bottom right, rgba(124,99,248,0.03) 0%, transparent 55%)`,
  },
  loadingMsg: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    color: '#374151',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    padding: 48,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00d672',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  bubble: {
    maxWidth: '62%',
    padding: '8px 12px',
    borderRadius: 14,
  },
  bubbleIn: {
    background: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 4,
    border: '1px solid rgba(255,255,255,0.07)',
  },
  bubbleOut: {
    background: 'rgba(0,214,114,0.1)',
    borderTopRightRadius: 4,
    border: '1px solid rgba(0,214,114,0.15)',
  },
  bubbleText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13.5,
    color: '#d1d9e6',
    lineHeight: 1.5,
    wordBreak: 'break-word',
    margin: 0,
  },
  bubbleMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  bubbleTime: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
  },
  dateSep: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '16px 0',
  },
  dateLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' },
  dateLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#4b5563',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    background: 'rgba(255,255,255,0.04)',
    padding: '3px 10px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.06)',
  },

  // Panel de contacto
  panel: {
    width: 240,
    minWidth: 240,
    height: '100%',
    background: 'rgba(9,11,19,0.8)',
    borderLeft: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backdropFilter: 'blur(20px)',
  },
  panelHeader: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  panelProfile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '20px 16px 16px',
  },
  panelName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#e6edf3',
    textAlign: 'center',
  },
  panelPhone: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#4b5563',
  },
  bizTag: {
    background: 'rgba(0,214,114,0.1)',
    color: '#00d672',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid rgba(0,214,114,0.2)',
  },
  statusTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    border: '1px solid',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.05)',
    margin: '0 16px',
  },
  panelSection: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  panelSectionTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 2,
  },
  panelStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 6,
  },
  panelStat: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '10px 6px',
    textAlign: 'center',
  },
  panelStatVal: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1,
    marginBottom: 4,
  },
  panelStatLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 9,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  panelDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelDetailLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#4b5563',
  },
  panelDetailVal: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#d1d9e6',
    fontWeight: 500,
  },
}
