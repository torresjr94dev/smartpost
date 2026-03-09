'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import esMessages from '@/messages/es.json'
import enMessages from '@/messages/en.json'

// ─── Types ────────────────────────────────────────────────────────
export type Locale = 'es' | 'en'
type MessageTree = typeof esMessages

const MESSAGES: Record<Locale, MessageTree> = {
  es: esMessages,
  en: enMessages,
}

interface I18nCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  /** Translate a dot-separated key, with optional interpolation vars */
  t: (key: string, vars?: Record<string, string | number>) => string
  /** Intl.NumberFormat shorthand using current locale */
  fmt: (n: number, opts?: Intl.NumberFormatOptions) => string
  /** Intl.DateTimeFormat shorthand using current locale */
  fmtDate: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string
  /** Relative time string (e.g. "hace 3 días") */
  fmtRelative: (d: Date | string) => string
}

// ─── Context ──────────────────────────────────────────────────────
const Ctx = createContext<I18nCtx>({
  locale: 'es',
  setLocale: () => {},
  t: (k) => k,
  fmt: (n) => String(n),
  fmtDate: (d) => String(d),
  fmtRelative: (d) => String(d),
})

// ─── Helpers ──────────────────────────────────────────────────────
function getNestedValue(obj: unknown, path: string): string {
  const result = path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
  return typeof result === 'string' ? result : path
}

function interpolate(str: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    str
  )
}

// ─── Provider ─────────────────────────────────────────────────────
export function I18nProvider({
  children,
  defaultLocale = 'es',
}: {
  children: ReactNode
  defaultLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  // Restore locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sp-locale') as Locale | null
    if (saved && saved in MESSAGES) setLocaleState(saved)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('sp-locale', l)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = getNestedValue(MESSAGES[locale], key)
      return vars ? interpolate(raw, vars) : raw
    },
    [locale]
  )

  const fmt = useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, opts).format(n),
    [locale]
  )

  const fmtDate = useCallback(
    (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...opts,
      }).format(new Date(d)),
    [locale]
  )

  const fmtRelative = useCallback(
    (d: Date | string) => {
      const diff = Math.round((new Date(d).getTime() - Date.now()) / 1000)
      const abs  = Math.abs(diff)
      const rtf  = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

      if (abs < 60)   return rtf.format(Math.round(diff), 'second')
      if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
      if (abs < 86400)return rtf.format(Math.round(diff / 3600), 'hour')
      return rtf.format(Math.round(diff / 86400), 'day')
    },
    [locale]
  )

  return (
    <Ctx.Provider value={{ locale, setLocale, t, fmt, fmtDate, fmtRelative }}>
      {children}
    </Ctx.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useI18n() {
  return useContext(Ctx)
}
