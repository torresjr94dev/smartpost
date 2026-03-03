'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import TopBar from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────
interface SubscriptionData {
  plan:               string
  subscriptionStatus: string
  subscriptionId:     string | null
  currentPeriodEnd:   string | null
  cancelAtPeriodEnd:  boolean
  amount:             number | null
  currency:           string | null
  interval:           string | null
}

// ─── Pricing config ──────────────────────────────────────────────
// Precios en USD. Cambia a MXN si vendes en pesos.
const PLANS = {
  basic: {
    label:     'Basic',
    subtitle:  'Para solopreneurs y freelancers',
    monthly:   29,
    annual:    19,         // billed $228/year
    color:     'text-ink-secondary',
    borderActive: 'border-dark-border',
    badge:     null,
    cta:       'Empezar Basic',
    features: [
      { text: '1 número de WhatsApp',              included: true  },
      { text: 'Facebook + Instagram',              included: true  },
      { text: 'LinkedIn',                          included: false },
      { text: '30 posts por mes',                  included: true  },
      { text: 'Programación de posts',             included: true  },
      { text: 'Historial 30 días',                 included: true  },
      { text: 'Analytics básico',                  included: true  },
      { text: 'Analytics avanzado con métricas',   included: false },
      { text: 'Soporte email (48h)',                included: true  },
      { text: 'Soporte prioritario (24h)',          included: false },
    ],
  },
  pro: {
    label:     'Pro',
    subtitle:  'Para PYMES y emprendedores activos',
    monthly:   69,
    annual:    49,         // billed $588/year
    color:     'text-brand-green',
    borderActive: 'border-brand-green/40',
    badge:     'Más popular',
    cta:       'Empezar Pro',
    features: [
      { text: '1 número de WhatsApp',              included: true  },
      { text: 'Facebook + Instagram',              included: true  },
      { text: 'LinkedIn',                          included: true  },
      { text: 'Posts ilimitados',                  included: true  },
      { text: 'Programación de posts',             included: true  },
      { text: 'Historial completo',                included: true  },
      { text: 'Analytics básico',                  included: true  },
      { text: 'Analytics avanzado con métricas',   included: true  },
      { text: 'Soporte email (48h)',                included: true  },
      { text: 'Soporte prioritario (24h)',          included: true  },
    ],
  },
} as const

type PlanKey = keyof typeof PLANS

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:   { label: 'Activa',    color: 'bg-brand-green/15 text-brand-green'   },
  trialing: { label: 'Trial',     color: 'bg-brand-purple/15 text-brand-purple' },
  past_due: { label: 'Vencida',   color: 'bg-amber-500/15 text-amber-400'       },
  canceled: { label: 'Cancelada', color: 'bg-red-500/15 text-red-400'           },
  inactive: { label: 'Inactiva',  color: 'bg-white/10 text-ink-muted'           },
}

// ─── Check icon ───────────────────────────────────────────────────
function Check({ color = 'text-brand-green' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
         strokeLinecap="round" strokeLinejoin="round"
         className={`w-4 h-4 flex-shrink-0 ${color}`}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function X() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-4 h-4 flex-shrink-0 text-ink-muted opacity-40">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ─── Current Plan Card ────────────────────────────────────────────
function CurrentPlanCard({
  sub,
  plan,
  onOpenPortal,
  loading,
}: {
  sub:          SubscriptionData | null
  plan:         string
  onOpenPortal: () => void
  loading:      boolean
}) {
  const planData   = PLANS[plan as PlanKey] ?? PLANS.basic
  const statusInfo = STATUS_LABELS[sub?.subscriptionStatus ?? 'inactive']
  const isActive   = ['active', 'trialing'].includes(sub?.subscriptionStatus ?? '')

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px] mb-2">
            Tu plan actual
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-[30px] font-bold tracking-tight ${planData.color}`}>
              {planData.label}
            </h2>
            {sub?.amount != null && (
              <span className="text-[16px] text-ink-secondary font-medium">
                ${(sub.amount / 100).toFixed(0)}/{sub.interval === 'year' ? 'año' : 'mes'}
              </span>
            )}
          </div>
          <p className="text-[13px] text-ink-secondary mt-0.5">{planData.subtitle}</p>
        </div>
        {statusInfo && (
          <span className={`badge text-[12px] ${statusInfo.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusInfo.label}
          </span>
        )}
      </div>

      {/* Billing info */}
      {sub && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
            <p className="text-[11px] text-ink-muted uppercase tracking-[0.5px] mb-1">Próxima renovación</p>
            <p className="text-[14px] font-semibold text-ink-primary">
              {sub.currentPeriodEnd
                ? format(new Date(sub.currentPeriodEnd), "d MMM yyyy", { locale: es })
                : '—'}
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
            <p className="text-[11px] text-ink-muted uppercase tracking-[0.5px] mb-1">Facturación</p>
            <p className="text-[14px] font-semibold text-ink-primary capitalize">
              {sub.interval === 'year' ? 'Anual' : sub.interval === 'month' ? 'Mensual' : '—'}
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-dark-border">
            <p className="text-[11px] text-ink-muted uppercase tracking-[0.5px] mb-1">Estado</p>
            <p className="text-[14px] font-semibold text-ink-primary">
              {sub.cancelAtPeriodEnd ? 'Cancela al vencer' : isActive ? 'Al día ✓' : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Manage button */}
      {isActive && (
        <button onClick={onOpenPortal} disabled={loading} className="btn-secondary">
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white sp" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                   strokeLinecap="round" className="w-4 h-4">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Gestionar facturación
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────
function PlanCard({
  planKey,
  annual,
  isCurrent,
  onSelect,
  loading,
}: {
  planKey:   PlanKey
  annual:    boolean
  isCurrent: boolean
  onSelect:  () => void
  loading:   boolean
}) {
  const plan  = PLANS[planKey]
  const price = annual ? plan.annual : plan.monthly
  const annualSavingPct = Math.round((1 - plan.annual / plan.monthly) * 100)
  const isPro = planKey === 'pro'

  return (
    <div className={`
      relative glass-card p-7 flex flex-col gap-5 transition-all duration-200
      ${isPro ? 'border-brand-green/40 shadow-green-glow' : ''}
      ${isCurrent ? 'ring-2 ring-brand-green/30' : ''}
    `}>
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-green text-[#003d1f] shadow-green-glow whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <p className={`text-[14px] font-bold uppercase tracking-wider mb-1 ${plan.color}`}>
          {plan.label}
        </p>
        <p className="text-[13px] text-ink-secondary">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] text-ink-secondary">$</span>
          <span className="text-[48px] font-black tracking-tight text-ink-primary leading-none">
            {price}
          </span>
          <span className="text-[14px] text-ink-secondary">/mes</span>
        </div>
        {annual ? (
          <p className="text-[12px] text-ink-muted mt-1.5">
            Billed ${price * 12}/año
            {' · '}
            <span className="text-brand-green font-semibold">Ahorra {annualSavingPct}%</span>
          </p>
        ) : (
          <p className="text-[12px] text-ink-muted mt-1.5">
            O <span className="text-brand-green font-semibold">${plan.annual}/mes</span> con plan anual
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        disabled={isCurrent || loading}
        className={isCurrent
          ? 'btn-secondary opacity-60 cursor-default w-full'
          : isPro
          ? 'btn-primary w-full text-[14px] py-3'
          : 'btn-secondary w-full text-[14px] py-3'}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-[#003d1f]/30 border-t-[#003d1f] sp" />
        ) : isCurrent ? (
          '✓ Plan actual'
        ) : (
          plan.cta
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-dark-border" />

      {/* Features */}
      <ul className="flex flex-col gap-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5">
            {f.included ? <Check /> : <X />}
            <span className={`text-[13px] ${f.included ? 'text-ink-secondary' : 'text-ink-muted line-through'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── ROI Banner ───────────────────────────────────────────────────
function RoiBanner() {
  return (
    <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-brand-purple/20">
      <div className="w-10 h-10 rounded-xl bg-brand-purple/15 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
             strokeLinecap="round" className="w-5 h-5 text-brand-purple">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-semibold text-ink-primary">
          ROI promedio de <span className="text-brand-green">10x</span> vs contratar un community manager
        </p>
        <p className="text-[12px] text-ink-secondary mt-0.5">
          Un CM en LATAM cuesta $400–800/mes. SmartPost Pro hace el trabajo por $49/mes con plan anual.
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function SuscripcionPage() {
  const { data: session }           = useSession()
  const [sub, setSub]               = useState<SubscriptionData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [portalLoading, setPortalLoading]       = useState(false)
  const [checkoutLoading, setCheckoutLoading]   = useState<string | null>(null)
  const [annual, setAnnual]         = useState(true) // Annual by default — maximize LTV
  const [error, setError]           = useState('')

  useEffect(() => {
    fetch('/api/stripe/subscription')
      .then(r => r.json())
      .then((data: SubscriptionData) => {
        setSub(data)
        // Detect if current subscription is annual
        if (data.interval === 'year') setAnnual(true)
        else if (data.interval === 'month') setAnnual(false)
      })
      .catch(() => setError('Error al cargar los datos de suscripción'))
      .finally(() => setLoadingData(false))
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al abrir portal')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
      setPortalLoading(false)
    }
  }

  async function startCheckout(planKey: PlanKey) {
    setCheckoutLoading(planKey)
    setError('')
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planKey, interval: annual ? 'year' : 'month' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al crear sesión')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
      setCheckoutLoading(null)
    }
  }

  const currentPlan    = sub?.plan ?? session?.user.plan ?? 'basic'
  const isActive       = ['active', 'trialing'].includes(sub?.subscriptionStatus ?? '')
  const showPlanPicker = !isActive || true // Always show — allows upgrades

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Suscripción"
        subtitle="Gestiona tu plan y facturación"
      />

      <div className="flex-1 p-8 flex flex-col gap-8 animate-fade-in max-w-4xl">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* Current plan (only when active) */}
        {!loadingData && isActive && (
          <CurrentPlanCard
            sub={sub}
            plan={currentPlan}
            onOpenPortal={openPortal}
            loading={portalLoading}
          />
        )}

        {/* Trial notice */}
        {sub?.subscriptionStatus === 'trialing' && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-brand-purple flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[13px] text-ink-secondary">
              Estás en período de prueba.{' '}
              {sub.currentPeriodEnd && (
                <>Vence el <strong className="text-ink-primary">
                  {format(new Date(sub.currentPeriodEnd), "d 'de' MMMM", { locale: es })}
                </strong>. </>
              )}
              Elige un plan para no perder el acceso.
            </p>
          </div>
        )}

        {/* Plan picker */}
        {showPlanPicker && (
          <div className="flex flex-col gap-6">
            {/* Section title */}
            <div>
              <h3 className="text-[18px] font-bold text-ink-primary">
                {isActive && currentPlan !== 'basic' ? 'Tu plan' : isActive ? 'Actualiza tu plan' : 'Elige tu plan'}
              </h3>
              <p className="text-[13px] text-ink-secondary mt-1">
                Sin permanencia. Cancela cuando quieras desde el portal de facturación.
              </p>
            </div>

            {/* Monthly / Annual toggle */}
            <div className="flex items-center gap-4">
              <span className={`text-[13px] font-medium transition-colors ${!annual ? 'text-ink-primary' : 'text-ink-muted'}`}>
                Mensual
              </span>
              <button
                onClick={() => setAnnual(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${annual ? 'bg-brand-green' : 'bg-dark-surface border border-dark-border'}`}
                aria-checked={annual}
                role="switch"
                aria-label="Facturación anual"
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-medium transition-colors ${annual ? 'text-ink-primary' : 'text-ink-muted'}`}>
                  Anual
                </span>
                {annual && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-green/15 text-brand-green">
                    Ahorra hasta 35%
                  </span>
                )}
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {(Object.keys(PLANS) as PlanKey[]).map(key => (
                <PlanCard
                  key={key}
                  planKey={key}
                  annual={annual}
                  isCurrent={isActive && currentPlan === key}
                  onSelect={() => startCheckout(key)}
                  loading={checkoutLoading === key}
                />
              ))}
            </div>

            {/* ROI banner */}
            <RoiBanner />

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-ink-muted pt-2">
              {[
                '✓ Sin contratos de permanencia',
                '✓ Cancela en cualquier momento',
                '✓ Pago seguro con Stripe',
                '✓ Soporte en español',
              ].map(item => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingData && (
          <div className="glass-card p-6 flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 rounded-lg bg-white/[0.06] animate-pulse" style={{ width: `${[80, 60, 70][i]}%` }} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
