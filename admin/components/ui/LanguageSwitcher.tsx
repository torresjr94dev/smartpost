'use client'

import { useI18n, type Locale } from '@/lib/i18n'

const LOCALES: { code: Locale; label: string; region: string }[] = [
  { code: 'es', label: 'ES', region: 'MX' },
  { code: 'en', label: 'EN', region: 'US' },
]

// Flag SVG via unicode regional indicators (renders as emoji on most platforms)
// Per skill checklist: emojis are OK for non-icon decorative use (flag as data)
function FlagIcon({ region }: { region: string }) {
  const points = [...region].map(
    (c) => String.fromCodePoint(c.codePointAt(0)! + 127397)
  )
  return (
    <span aria-hidden="true" style={{ fontSize: '14px', lineHeight: 1 }}>
      {points.join('')}
    </span>
  )
}

interface LanguageSwitcherProps {
  className?: string
  /** 'pill' = segmented control (default), 'dropdown' = compact single button */
  variant?: 'pill' | 'icon-only'
}

export function LanguageSwitcher({
  className = '',
  variant = 'pill',
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n()

  if (variant === 'icon-only') {
    const next = LOCALES.find((l) => l.code !== locale)!
    return (
      <button
        onClick={() => setLocale(next.code)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    cursor-pointer transition-all duration-200 ${className}`}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        aria-label={`Switch language to ${next.label}`}
      >
        <FlagIcon region={next.region} />
        <span>{next.label}</span>
      </button>
    )
  }

  return (
    <div
      className={`flex items-center gap-0.5 p-0.5 rounded-lg ${className}`}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((l) => {
        const isActive = locale === l.code
        return (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                       cursor-pointer transition-all duration-150 select-none"
            style={{
              background: isActive ? 'rgba(22,199,132,0.12)' : 'transparent',
              color: isActive ? '#16C784' : 'var(--text-subtle)',
              fontWeight: isActive ? 600 : 400,
            }}
            aria-pressed={isActive}
            aria-label={`${l.label} language`}
          >
            <FlagIcon region={l.region} />
            <span>{l.label}</span>
          </button>
        )
      })}
    </div>
  )
}
