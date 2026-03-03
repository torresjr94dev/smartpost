import React, { useEffect, useState } from 'react'
import { fetchStats, logout } from '../utils/api'
import { toast } from '../utils/toast'

const CARDS = [
  { key: 'total_conversations',   label: 'Total Conversaciones',  color: '#7c63f8', desc: 'Todas las conversaciones' },
  { key: 'open_conversations',    label: 'Abiertas',              color: '#00d672', desc: 'Conversaciones activas'  },
  { key: 'pending_conversations', label: 'Pendientes',            color: '#f6ad55', desc: 'Sin atender'             },
  { key: 'closed_conversations',  label: 'Cerradas',              color: '#4b5563', desc: 'Resueltas'               },
  { key: 'total_inbound',         label: 'Mensajes recibidos',    color: '#63b3ed', desc: 'De clientes'             },
  { key: 'total_outbound',        label: 'Mensajes enviados',     color: '#b794f4', desc: 'Respuestas del bot'      },
]

function StatCard({ card, value }) {
  return (
    <div style={{ ...s.card, borderColor: `${card.color}20` }}>
      <div style={s.cardTop}>
        <div style={{ ...s.cardDot, background: `${card.color}20`, boxShadow: `0 0 10px ${card.color}30` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: card.color }} />
        </div>
        <span style={s.cardDesc}>{card.desc}</span>
      </div>
      <div style={{ ...s.cardValue, color: card.color }}>{value ?? '—'}</div>
      <div style={s.cardLabel}>{card.label}</div>
      <div style={{ ...s.cardBar, background: `${card.color}12` }}>
        <div style={{ height: '100%', width: '70%', background: `linear-gradient(90deg, ${card.color}70, transparent)`, borderRadius: 4 }} />
      </div>
    </div>
  )
}

function BarChart({ inbound, outbound }) {
  const total = (inbound || 0) + (outbound || 0)
  if (total === 0) return <div style={s.noData}>Sin datos</div>
  const inPct  = Math.round((inbound / total) * 100)
  const outPct = 100 - inPct

  return (
    <div style={s.chartArea}>
      <div style={s.chartRow}>
        <div style={s.chartLabel}>
          <span style={{ ...s.chartDot, background: '#63b3ed' }} />
          <span style={s.chartLabelText}>Recibidos</span>
        </div>
        <div style={s.chartTrack}>
          <div style={{ ...s.chartFill, width: `${inPct}%`, background: 'linear-gradient(90deg, #63b3ed, #7c63f8)' }} />
        </div>
        <div style={s.chartPct}>{inPct}%</div>
        <div style={s.chartNum}>{inbound}</div>
      </div>
      <div style={s.chartRow}>
        <div style={s.chartLabel}>
          <span style={{ ...s.chartDot, background: '#b794f4' }} />
          <span style={s.chartLabelText}>Enviados</span>
        </div>
        <div style={s.chartTrack}>
          <div style={{ ...s.chartFill, width: `${outPct}%`, background: 'linear-gradient(90deg, #b794f4, #fc8181)' }} />
        </div>
        <div style={s.chartPct}>{outPct}%</div>
        <div style={s.chartNum}>{outbound}</div>
      </div>
    </div>
  )
}

function StatusChart({ open, pending, closed }) {
  const total = (open || 0) + (pending || 0) + (closed || 0)
  if (total === 0) return <div style={s.noData}>Sin datos</div>

  const items = [
    { label: 'Abiertas',   val: open,    color: '#00d672' },
    { label: 'Pendientes', val: pending, color: '#f6ad55' },
    { label: 'Cerradas',   val: closed,  color: '#4b5563' },
  ]

  return (
    <div style={s.chartArea}>
      {items.map(it => {
        const pct = total > 0 ? Math.round((it.val / total) * 100) : 0
        return (
          <div key={it.label} style={s.chartRow}>
            <div style={s.chartLabel}>
              <span style={{ ...s.chartDot, background: it.color }} />
              <span style={s.chartLabelText}>{it.label}</span>
            </div>
            <div style={s.chartTrack}>
              <div style={{ ...s.chartFill, width: `${pct}%`, background: it.color, opacity: 0.7 }} />
            </div>
            <div style={s.chartPct}>{pct}%</div>
            <div style={s.chartNum}>{it.val}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
      .then(data => { setStats(data); toast.success('Analíticas actualizadas') })
      .catch(e => {
        if (e.message === '401') { logout(); window.location.reload(); return }
        toast.error('Error cargando analíticas')
      })
      .finally(() => setLoading(false))
  }, [])

  const s2 = stats || {}

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>Analíticas</h1>
          <p style={s.subtitle}>Vista general de actividad del dashboard</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStats().then(d => { setStats(d); setLoading(false); toast.success('Datos actualizados') }).catch(() => setLoading(false)) }}
          style={s.refreshBtn}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Actualizar
        </button>
      </div>

      {loading ? (
        <div style={s.loading}>
          <div style={s.spinner} />
          Cargando analíticas...
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={s.grid}>
            {CARDS.map(c => <StatCard key={c.key} card={c} value={s2[c.key]} />)}
          </div>

          {/* Charts row */}
          <div style={s.chartsRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <span style={s.chartTitleDot} />
                Distribución de Mensajes
              </div>
              <BarChart inbound={parseInt(s2.total_inbound) || 0} outbound={parseInt(s2.total_outbound) || 0} />
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <span style={{ ...s.chartTitleDot, background: '#7c63f8' }} />
                Estado de Conversaciones
              </div>
              <StatusChart
                open={parseInt(s2.open_conversations) || 0}
                pending={parseInt(s2.pending_conversations) || 0}
                closed={parseInt(s2.closed_conversations) || 0}
              />
            </div>
          </div>

          {/* Summary */}
          <div style={s.summaryCard}>
            <div style={s.summaryTitle}>Resumen</div>
            <div style={s.summaryGrid}>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: '#00d672' }}>
                  {s2.total_conversations > 0
                    ? Math.round((parseInt(s2.open_conversations) / parseInt(s2.total_conversations)) * 100)
                    : 0}%
                </div>
                <div style={s.summaryLabel}>Tasa de conversaciones abiertas</div>
              </div>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: '#63b3ed' }}>
                  {parseInt(s2.total_contacts) > 0
                    ? (parseInt(s2.total_conversations) / parseInt(s2.total_contacts)).toFixed(1)
                    : '0'}
                </div>
                <div style={s.summaryLabel}>Conversaciones por contacto</div>
              </div>
              <div style={s.summaryItem}>
                <div style={{ ...s.summaryVal, color: '#b794f4' }}>
                  {(parseInt(s2.total_inbound) || 0) + (parseInt(s2.total_outbound) || 0)}
                </div>
                <div style={s.summaryLabel}>Total de mensajes</div>
              </div>
            </div>
          </div>
        </>
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
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#6b7280',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
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
  spinner: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid rgba(0,214,114,0.2)',
    borderTopColor: '#00d672',
    animation: 'sp-spin 0.75s linear infinite',
  },

  // Stats
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid',
    borderRadius: 16,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'border-color 0.2s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    color: '#374151',
  },
  cardValue: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: '-1px',
    lineHeight: 1,
  },
  cardLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  cardBar: {
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Charts
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  chartCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '20px',
  },
  chartTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: '#d1d9e6',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chartTitleDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#63b3ed',
    boxShadow: '0 0 6px rgba(99,179,237,0.6)',
  },
  chartArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  chartLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    width: 90,
    flexShrink: 0,
  },
  chartDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  chartLabelText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#6b7280',
  },
  chartTrack: {
    flex: 1,
    height: 8,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
  },
  chartPct: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#6b7280',
    width: 34,
    textAlign: 'right',
    flexShrink: 0,
  },
  chartNum: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#d1d9e6',
    width: 32,
    textAlign: 'right',
    fontWeight: 500,
    flexShrink: 0,
  },
  noData: {
    color: '#374151',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },

  // Summary
  summaryCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '20px',
  },
  summaryTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 16,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryVal: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1,
  },
  summaryLabel: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    color: '#4b5563',
  },
}
