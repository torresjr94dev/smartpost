'use client'

import { useState, useEffect } from 'react'
import TopBar from '@/components/layout/TopBar'
import { FadeContent } from '@/components/animations/CountUp'
import { useI18n } from '@/lib/i18n'

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

// ─── Pricing config ───────────────────────────────────────────────
const PLANS = {
  basic: {
    label:    'Basic',
    subtitle: 'Para solopreneurs y freelancers',
    monthly:  29,
    annual:   19,
    color:    'text-[var(--text-secondary)]',
    badge:    null as string | null,
    cta:      'Empezar Basic',
    features: [
      { text: '1 número de WhatsApp',             included: true  },
      { text: 'Facebook + Instagram',             included: true  },
      { text: 'LinkedIn',                         included: false },
      { text: '30 posts por mes',                 included: true  },
      { text: 'Programación de posts',            included: true  },
      { text: 'Historial 30 días',                included: true  },
      { text: 'Analytics básico',                 included: true  },
      { text: 'Analytics avanzado con métricas',  included: false },
      { text: 'Soporte email (48h)',               included: true  },
      { text: 'Soporte prioritario (24h)',         included: false },
    ],
  },
  pro: {
    label:    'Pro',
    subtitle: 'Para PYMES y emprendedores activos',
    monthly:  69,
    annual:   49,
    color:    'text-brand-green',
    badge:    'Más popular' as string | null,
    cta:      'Empezar Pro',
    features: [
      { text: '1 número de WhatsApp',             included: true  },
      { text: 'Facebook + Instagram',             included: true  },
      { text: 'LinkedIn',                         included: true  },
      { text: 'Posts ilimitados',                 included: true  },
      { text: 'Programación de posts',            included: true  },
      { text: 'Historial completo',               included: true  },
      { text: 'Analytics básico',                 included: true  },
      { text: 'Analytics avanzado con métricas',  included: true  },
      { text: 'Soporte email (48h)',               included: true  },
      { text: 'Soporte prioritario (24h)',         included: true  },
    ],
  },
} as const

type PlanKey = keyof typeof PLANS

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-brand-green/15 text-brand-green',
  trialing: 'bg-brand-purple/15 text-brand-purple',
  past_due: 'bg-amber-500/15 text-amber-400',
  canceled: 'bg-red-500/15 text-red-400',
  inactive: 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
}

// ─── Icons ────────────────────────────────────────────────────────
function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
         strokeLinecap="round" className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)] opacity-40">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ─── Billing Toggle ───────────────────────────────────────────────
function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  const { t } = useI18n()
  return (
    <div className="inline-flex items-center bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1 gap-0.5">
      <button
        onClick={() => onChange(false)}
        className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer select-none ${
          !annual
            ? 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-hover)] shadow-sm'
            : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        {t('subscription.monthly')}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer select-none flex items-center gap-2.5 ${
          annual
            ? 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-hover)] shadow-sm'
            : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        {t('subscription.annual')}
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all duration-200 ${
          annual ? 'bg-brand-green/20 text-brand-green' : 'bg-white/[0.06] text-[var(--text-muted)]'
        }`}>
          −35%
        </span>
      </button>
    </div>
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
  const { t, fmtDate } = useI18n()
  const planData  = PLANS[plan as PlanKey] ?? PLANS.basic
  const statusKey = sub?.subscriptionStatus ?? 'inactive'
  const isActive  = ['active', 'trialing'].includes(sub?.subscriptionStatus ?? '')
  const isPro     = plan === 'pro'

  return (
    <div className={`glass-card p-6 relative overflow-hidden ${isPro ? 'border-brand-green/20' : ''}`}>
      {isPro && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-green rounded-t-2xl opacity-60" />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.7px] mb-2">
            {t('subscription.currentPlan')}
          </p>
          <div className="flex items-baseline gap-3">
            <h2 className={`text-[36px] font-black tracking-tight leading-none ${planData.color}`}>
              {planData.label}
            </h2>
            {sub?.amount != null && (
              <span className="text-[17px] text-[var(--text-secondary)] font-medium">
                ${(sub.amount / 100).toFixed(0)}
                <span className="text-[13px] text-[var(--text-muted)] ml-0.5">
                  /{sub.interval === 'year' ? t('common.year') : t('common.month')}
                </span>
              </span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">{planData.subtitle}</p>
        </div>
        <span className={`badge text-[12px] ${STATUS_STYLES[statusKey] ?? STATUS_STYLES.inactive}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {t(`status.${statusKey}` as Parameters<ReturnType<typeof useI18n>['t']>[0])}
        </span>
      </div>

      {sub && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: t('subscription.nextRenewal'),
              value: sub.currentPeriodEnd
                ? fmtDate(new Date(sub.currentPeriodEnd), { day: 'numeric', month: 'short', year: 'numeric' })
                : '—',
            },
            {
              label: t('subscription.billing'),
              value: sub.interval === 'year' ? t('subscription.annual') : sub.interval === 'month' ? t('subscription.monthly') : '—',
            },
            {
              label: t('subscription.state'),
              value: sub.cancelAtPeriodEnd
                ? t('subscription.cancelAtEnd')
                : isActive ? `${t('subscription.upToDate')} ✓` : '—',
            },
          ].map(item => (
            <div key={item.label} className="px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.5px] mb-1.5">{item.label}</p>
              <p className="text-[14px] font-semibold text-[var(--text)]">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {isActive && (
        <button onClick={onOpenPortal} disabled={loading} className="btn-secondary">
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-[var(--border-hover)] border-t-[var(--text)] sp" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                   strokeLinecap="round" className="w-4 h-4">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {t('subscription.manageBilling')}
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
  delay = 0,
}: {
  planKey:   PlanKey
  annual:    boolean
  isCurrent: boolean
  onSelect:  () => void
  loading:   boolean
  delay?:    number
}) {
  const { t } = useI18n()
  const plan      = PLANS[planKey]
  const price     = annual ? plan.annual : plan.monthly
  const savingPct = Math.round((1 - plan.annual / plan.monthly) * 100)
  const isPro     = planKey === 'pro'

  return (
    <FadeContent delay={delay} className="h-full">
      <div
        className={`
          relative glass-card p-8 flex flex-col gap-6 transition-all duration-200 h-full
          ${isPro ? 'border-brand-green/30' : ''}
          ${isCurrent ? 'ring-2 ring-brand-green/25' : ''}
        `}
        style={isPro ? { boxShadow: '0 0 0 1px rgba(0,214,114,0.12), 0 8px 32px rgba(0,0,0,0.4), 0 0 48px rgba(0,214,114,0.05)' } : undefined}
      >
        {plan.badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-brand-green text-[#003d1f] whitespace-nowrap"
                  style={{ boxShadow: '0 2px 12px rgba(0,214,114,0.4)' }}>
              {plan.badge}
            </span>
          </div>
        )}

        {/* Header */}
        <div>
          <p className={`text-[12px] font-bold uppercase tracking-widest mb-1.5 ${plan.color}`}>
            {plan.label}
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">{plan.subtitle}</p>
        </div>

        {/* Price — key forces re-mount animation on billing toggle */}
        <div key={annual ? 'a' : 'm'} className="animate-fade-in">
          <div className="flex items-start gap-0.5">
            <span className="text-[15px] text-[var(--text-secondary)] mt-3 font-medium">$</span>
            <span className={`text-[56px] font-black tracking-tight leading-none ${isPro ? 'text-brand-green' : 'text-[var(--text)]'}`}>
              {price}
            </span>
            <span className="text-[13px] text-[var(--text-muted)] mt-4 ml-1">/{t('common.month')}</span>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] mt-2">
            {annual ? (
              <>
                <span className="text-[var(--text-secondary)] font-medium">${price * 12}</span>
                {' '}{t('subscription.billedAnnually')} ·{' '}
                <span className="text-brand-green font-semibold">
                  {t('subscription.save', { pct: String(savingPct) })}
                </span>
              </>
            ) : (
              <>
                Plan anual: <span className="text-brand-green font-semibold">${plan.annual}/{t('common.month')}</span>
              </>
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onSelect}
          disabled={isCurrent || loading}
          className={
            isCurrent ? 'btn-secondary opacity-60 cursor-default w-full py-3 text-[14px]' :
            isPro      ? 'btn-primary w-full text-[14px] py-3.5' :
                         'btn-secondary w-full text-[14px] py-3'
          }
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-[#003d1f]/30 border-t-[#003d1f] sp" />
          ) : isCurrent ? (
            <><CheckIcon className="w-4 h-4" /> {t('subscription.currentPlanCta')}</>
          ) : (
            plan.cta
          )}
        </button>

        <div className="border-t border-[var(--border)]" />

        {/* Features */}
        <ul className="flex flex-col gap-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-3">
              {f.included
                ? <span className="w-5 h-5 rounded-full bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-brand-green" />
                  </span>
                : <span className="w-5 h-5 rounded-full bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0">
                    <XIcon />
                  </span>
              }
              <span className={`text-[13px] ${f.included ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] line-through'}`}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </FadeContent>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function SuscripcionPage() {
  const { t } = useI18n()
  const [sub, setSub]                         = useState<SubscriptionData | null>(null)
  const [loadingData, setLoadingData]         = useState(true)
  const [portalLoading, setPortalLoading]     = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [annual, setAnnual]                   = useState(true)
  const [error, setError]                     = useState('')

  useEffect(() => {
    fetch('/api/stripe/subscription')
      .then(r => r.json())
      .then((data: SubscriptionData) => {
        setSub(data)
        if (data.interval === 'year') setAnnual(true)
        else if (data.interval === 'month') setAnnual(false)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoadingData(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? t('common.error'))
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
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
      if (!res.ok || !data.url) throw new Error(data.error ?? t('common.error'))
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
      setCheckoutLoading(null)
    }
  }

  const currentPlan = sub?.plan ?? 'basic'
  const isActive    = ['active', 'trialing'].includes(sub?.subscriptionStatus ?? '')

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title={t('subscription.title')} subtitle={t('subscription.subtitle')} />

      <div className="flex-1 p-8 flex flex-col gap-8 animate-fade-in">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loadingData && (
          <div className="glass-card p-6 flex flex-col gap-3">
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-4 rounded-lg bg-[var(--border)] animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Current plan */}
        {!loadingData && isActive && (
          <FadeContent>
            <CurrentPlanCard
              sub={sub}
              plan={currentPlan}
              onOpenPortal={openPortal}
              loading={portalLoading}
            />
          </FadeContent>
        )}

        {/* Trial notice */}
        {sub?.subscriptionStatus === 'trialing' && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-brand-purple flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Estás en período de prueba.{' '}
              {sub.currentPeriodEnd && (
                <>Vence el <strong className="text-[var(--text)]">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                </strong>. </>
              )}
              Elige un plan para no perder el acceso.
            </p>
          </div>
        )}

        {/* Plan picker */}
        {!loadingData && (
          <div className="flex flex-col gap-7">

            {/* Header + toggle */}
            <FadeContent delay={100}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-[20px] font-bold text-[var(--text)] tracking-tight">
                    {isActive && currentPlan !== 'basic'
                      ? t('subscription.currentPlan')
                      : isActive
                      ? t('subscription.upgrade')
                      : t('subscription.choosePlan')}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                    {t('subscription.noContract')} · {t('subscription.cancelAnytime')}
                  </p>
                </div>
                <BillingToggle annual={annual} onChange={setAnnual} />
              </div>
            </FadeContent>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.keys(PLANS) as PlanKey[]).map((key, i) => (
                <PlanCard
                  key={key}
                  planKey={key}
                  annual={annual}
                  isCurrent={isActive && currentPlan === key}
                  onSelect={() => startCheckout(key)}
                  loading={checkoutLoading === key}
                  delay={i * 120}
                />
              ))}
            </div>

            {/* Trust row */}
            <FadeContent delay={250}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5 flex items-center gap-4 border-brand-purple/15">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/15 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
                         strokeLinecap="round" className="w-5 h-5 text-brand-purple">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)]">
                      ROI promedio de <span className="text-brand-green">10x</span> vs community manager
                    </p>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                      Un CM cuesta $400–800/mes. SmartPost Pro a $49/mes anual.
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  {[
                    t('subscription.noContract'),
                    t('subscription.cancelAnytime'),
                    t('subscription.securePayment'),
                    t('subscription.support'),
                  ].map(item => (
                    <span key={item} className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
                      <CheckIcon className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </FadeContent>

          </div>
        )}

      </div>
    </div>
  )
}
