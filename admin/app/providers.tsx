'use client'

import { useEffect, type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { I18nProvider } from '@/lib/i18n'
import { FacebookSDKLoader } from '@/components/FacebookSDKLoader'

/**
 * ThemeScript — injected into <head> to prevent light/dark flash on load.
 * Reads localStorage 'sp-theme'. Falls back to prefers-color-scheme.
 */
function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('sp-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = stored ? stored === 'dark' : prefersDark;
        document.documentElement.classList.toggle('dark', isDark);
      } catch(e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

/** Syncs OS theme preference changes to the .dark class in real-time */
function ThemeSyncer() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('sp-theme')
      // Only auto-switch if user hasn't set a manual preference
      if (!stored) {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeScript />
      <SessionProvider>
        <I18nProvider defaultLocale="es">
          <ThemeSyncer />
          <FacebookSDKLoader />
          {children}
        </I18nProvider>
      </SessionProvider>
    </>
  )
}
