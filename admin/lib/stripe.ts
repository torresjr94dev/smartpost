import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Price IDs por plan e intervalo.
 * Crea en Stripe: Producto "SmartPost Basic" con 2 precios (monthly $29, annual $228)
 *                 Producto "SmartPost Pro"   con 2 precios (monthly $69, annual $588)
 *
 * Precios en USD. Si facturas en MXN, ajusta en tu cuenta de Stripe.
 */
export const PLAN_PRICES: Record<string, Record<'month' | 'year', string>> = {
  basic: {
    month: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY  ?? '',
    year:  process.env.STRIPE_PRICE_ID_BASIC_ANNUAL   ?? '',
  },
  pro: {
    month: process.env.STRIPE_PRICE_ID_PRO_MONTHLY    ?? '',
    year:  process.env.STRIPE_PRICE_ID_PRO_ANNUAL     ?? '',
  },
}

/** Helper: obtiene el priceId según plan e intervalo */
export function getPriceId(plan: string, interval: 'month' | 'year'): string {
  return PLAN_PRICES[plan]?.[interval] ?? ''
}

export const PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro:   'Pro',
}

// Precios de referencia (USD) — solo para mostrar en UI si Stripe no responde
export const PLAN_AMOUNTS: Record<string, Record<'month' | 'year', number>> = {
  basic: { month: 29, year: 19 },
  pro:   { month: 69, year: 49 },
}
