import React, { useEffect, useState, useCallback } from 'react'
import { fetchBotSessions, fetchBotSession, logout } from '../utils/api'
import { toast } from '../utils/toast'

/* ── helpers ───────────────────────────────────────────────────── */
function formatSessionId(raw) {
  const clean = raw.replace(/^=/, '')
  if (/^\d{10,15}$/.test(clean)) {
    return '+' + clean.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  }
  if (clean.startsWith('wamid.')) return 'wamid:' + clean.slice(6, 18) + '…'
  return clean
}

function sessionInitials(raw) {
  const clean = raw.replace(/^=/, '')
  if (/^\d{10,15}$/.test(clean)) return clean.slice(-2)
  return 'WA'
}

function parseContent(raw) {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function formatBotText(text) {
  if (!text) return ''
  return text
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
}

/* ── sub-components ─────────────────────────────────────────────── */
function ActionBadge({ action }) {
  const map = {
    ask_info:     { color: '#63b3ed', label: 'Preguntando' },
    execute_post: { color: '#00d672', label: 'Post ejecutado' },
    confirm:      { color: '#f6ad55', label: 'Confirmando' },
  }
  const cfg = map[action] || { color: '#6b7280', label: action }
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: 'Inter, sans-serif',
      textTransform: 'uppercase', letterSpacing: '0.6px',
      padding: '2px 7px', borderRadius: 6,
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.label}
    </span>
  )
}

function BotBubble({ msg }) {
  const content = parseContent(msg.raw_content)
  const response = msg.conversational_response || content?.conversational_response

  if (msg.type === 'human') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <div style={s.humanBubble}>
          <div style={s.humanIcon}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <span style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: 12, fontStyle: 'italic' }}>
            Mensaje del usuario
          </span>
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8, gap: 8 }}>
      {/* Bot avatar */}
      <div style={s.botAvatar}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.99 5.99 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
        </svg>
      </div>

      <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#00d672' }}>SmartPost Bot</span>
          {msg.action && <ActionBadge action={msg.action} />}
        </div>

        {/* Bubble */}
        <div style={s.botBubble}>
          {response ? (
            <p
              style={s.botText}
              dangerouslySetInnerHTML={{ __html: formatBotText(response) }}
            />
          ) : (
            <p style={{ ...s.botText, color: '#4b5563', fontStyle: 'italic' }}>
              [respuesta sin formato legible]
            </p>
          )}

          {/* Execute post details */}
          {msg.action === 'execute_post' && content && (
            <div style={s.postDetails}>
              {content.image_source  && <div style={s.postRow}><span style={s.postKey}>Imagen</span><span style={s.postVal}>{content.image_source}</span></div>}
              {content.text_source   && <div style={s.postRow}><span style={s.postKey}>Texto</span><span style={s.postVal}>{content.text_source}</span></div>}
              {content.schedule      && <div style={s.postRow}><span style={s.postKey}>Programación</span><span style={s.postVal}>{content.schedule}</span></div>}
            </div>
          )}

          {/* Whatsapp message type */}
          {msg.whatsapp_message_type && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#63b3ed', display: 'inline-block' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#4b5563' }}>
                {msg.whatsapp_message_type.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#374151' }}>#{msg.id}</div>
      </div>
    </div>
  )
}

function SessionItem({ session, selected, onClick }) {
  const label = formatSessionId(session.session_id)
  const initials = sessionInitials(session.session_id)
  const hasExecuted = parseInt(session.posts_ejecutados) > 0

  return (
    <button onClick={onClick} style={{ ...s.sessionItem, ...(selected ? s.sessionItemActive : {}) }}>
      <div style={{ ...s.sessionAvatar, ...(hasExecuted ? { boxShadow: '0 0 10px rgba(0,214,114,0.3)' } : {}) }}>
        {initials}
      </div>
      <div style={s.sessionInfo}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={s.sessionLabel}>{label}</span>
          {hasExecuted && (
            <span style={s.executedBadge}>{session.posts_ejecutados} post{session.posts_ejecutados > 1 ? 's' : ''}</span>
          )}
        </div>
        <div style={s.sessionPreview}>
          {session.last_ai_response
            ? session.last_ai_response.replace(/<[^>]+>/g, '').substring(0, 60) + '…'
            : `${session.ai_msgs} respuestas del bot`
          }
        </div>
        <div style={s.sessionMeta}>
          <span>{session.ai_msgs} bot</span>
          <span>·</span>
          <span>{session.human_msgs} usuario</span>
        </div>
      </div>
    </button>
  )
}

/* ── main page ──────────────────────────────────────────────────── */
export default function BotChatsPage() {
  const [sessions,  setSessions]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [messages,  setMessages]  = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingMsgs,     setLoadingMsgs]     = useState(false)

  useEffect(() => {
    fetchBotSessions()
      .then(data => { setSessions(data); toast.success(`${data.length} sesiones del bot cargadas`) })
      .catch(e => {
        if (e.message === '401') { logout(); window.location.reload(); return }
        toast.error('Error cargando sesiones del bot')
      })
      .finally(() => setLoadingSessions(false))
  }, [])

  const handleSelect = useCallback(async (session) => {
    setSelected(session)
    setLoadingMsgs(true)
    try {
      const msgs = await fetchBotSession(session.session_id)
      setMessages(msgs)
    } catch (e) {
      if (e.message === '401') { logout(); window.location.reload(); return }
      toast.error('Error cargando mensajes')
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  const aiMsgs     = messages.filter(m => m.type === 'ai')
  const executed   = aiMsgs.filter(m => m.action === 'execute_post').length

  return (
    <div style={s.page}>
      {/* Session list */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.sidebarTitle}>Historial del Bot</div>
          <span style={s.sidebarCount}>{sessions.length} sesiones</span>
        </div>

        <div style={s.sidebarDesc}>
          Conversaciones del agente WhatsApp → Facebook
        </div>

        <div style={s.sessionList}>
          {loadingSessions && (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={s.skeletonSession}>
                <div style={s.skeletonAvatar} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ ...s.skeletonLine, width: '55%' }} />
                  <div style={{ ...s.skeletonLine, width: '80%', height: 10 }} />
                </div>
              </div>
            ))
          )}
          {!loadingSessions && sessions.map(sess => (
            <SessionItem
              key={sess.session_id}
              session={sess}
              selected={selected?.session_id === sess.session_id}
              onClick={() => handleSelect(sess)}
            />
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div style={s.chatArea}>
        {!selected ? (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(0,214,114,0.15)" strokeWidth={1.2}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.99 5.99 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.562 4.14 1.541 5.876L.057 23.886a.5.5 0 00.613.613l6.01-1.484A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.034-1.387l-.36-.215-3.732.921.938-3.63-.235-.373A9.818 9.818 0 1112 21.818z"/>
              </svg>
            </div>
            <p style={s.emptyText}>Selecciona una sesión</p>
            <p style={s.emptySubText}>Ver conversación del agente de WhatsApp</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={s.chatHeader}>
              <div style={s.chatHeaderLeft}>
                <div style={s.chatHeaderAvatar}>
                  {sessionInitials(selected.session_id)}
                </div>
                <div>
                  <div style={s.chatHeaderTitle}>{formatSessionId(selected.session_id)}</div>
                  <div style={s.chatHeaderSub}>{selected.session_id.replace(/^=/, '')}</div>
                </div>
              </div>
              <div style={s.chatHeaderStats}>
                <div style={s.headerStat}>
                  <div style={{ ...s.headerStatVal, color: '#7c63f8' }}>{messages.length}</div>
                  <div style={s.headerStatLabel}>Mensajes</div>
                </div>
                <div style={s.headerStat}>
                  <div style={{ ...s.headerStatVal, color: '#63b3ed' }}>{aiMsgs.length}</div>
                  <div style={s.headerStatLabel}>Respuestas bot</div>
                </div>
                <div style={s.headerStat}>
                  <div style={{ ...s.headerStatVal, color: '#00d672' }}>{executed}</div>
                  <div style={s.headerStatLabel}>Posts ejecutados</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.feed}>
              {loadingMsgs ? (
                <div style={s.loading}>
                  <div style={s.loadingDot} />
                  Cargando conversación...
                </div>
              ) : (
                messages.map(msg => <BotBubble key={msg.id} msg={msg} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── styles ─────────────────────────────────────────────────────── */
const s = {
  page: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    height: '100vh',
  },

  // Sidebar
  sidebar: {
    width: 300,
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(9,11,19,0.7)',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 16px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  sidebarTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#e6edf3',
  },
  sidebarCount: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#4b5563',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  sidebarDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#374151',
    padding: '8px 16px 12px',
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  sessionItem: {
    width: '100%',
    display: 'flex',
    gap: 10,
    padding: '10px 10px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  sessionItemActive: {
    background: 'rgba(0,214,114,0.06)',
  },
  sessionAvatar: {
    width: 40,
    height: 40,
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
  sessionInfo: { flex: 1, minWidth: 0 },
  sessionLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: '#d1d9e6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sessionPreview: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#4b5563',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: 3,
  },
  sessionMeta: {
    display: 'flex',
    gap: 4,
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
  },
  executedBadge: {
    background: 'rgba(0,214,114,0.12)',
    color: '#00d672',
    borderRadius: 6,
    padding: '1px 6px',
    fontSize: 9,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    border: '1px solid rgba(0,214,114,0.2)',
  },

  // Chat area
  chatArea: {
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
    gap: 10,
  },
  emptyIconWrap: { marginBottom: 4 },
  emptyText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#374151',
    fontWeight: 500,
    margin: 0,
  },
  emptySubText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#1f2937',
    margin: 0,
  },

  // Chat header
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'rgba(9,11,19,0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 12,
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d672, #7c63f8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  chatHeaderTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: '#e6edf3',
  },
  chatHeaderSub: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
    marginTop: 1,
  },
  chatHeaderStats: {
    display: 'flex',
    gap: 20,
  },
  headerStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  headerStatVal: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1,
  },
  headerStatLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 9,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Feed
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    backgroundImage: `radial-gradient(ellipse at top left, rgba(0,214,114,0.025) 0%, transparent 55%),
      radial-gradient(ellipse at bottom right, rgba(124,99,248,0.03) 0%, transparent 55%)`,
  },
  loading: {
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

  // Bubbles
  humanBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    maxWidth: '40%',
  },
  humanIcon: {
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d672, #00a857)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,214,114,0.25)',
    marginTop: 20,
  },
  botBubble: {
    background: 'rgba(0,214,114,0.07)',
    border: '1px solid rgba(0,214,114,0.12)',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: '10px 14px',
  },
  botText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    color: '#d1d9e6',
    lineHeight: 1.6,
    wordBreak: 'break-word',
    margin: 0,
  },
  postDetails: {
    marginTop: 10,
    padding: '8px 10px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  postRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  postKey: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#4b5563',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    width: 80,
    flexShrink: 0,
  },
  postVal: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#d1d9e6',
  },

  // Skeletons
  skeletonSession: {
    display: 'flex',
    gap: 10,
    padding: '10px 10px',
    alignItems: 'center',
    marginBottom: 4,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
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
