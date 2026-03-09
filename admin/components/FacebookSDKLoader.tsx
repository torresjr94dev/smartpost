'use client'

/**
 * FacebookSDKLoader
 * Loads the Facebook JavaScript SDK asynchronously and initializes it.
 * Add <FacebookSDKLoader /> to your providers/layout once.
 * App ID is read from NEXT_PUBLIC_META_APP_ID.
 */

import { useEffect } from 'react'

// ─── Global FB SDK types ──────────────────────────────────────────
declare global {
  interface Window {
    FB: FacebookSDK
    fbAsyncInit: () => void
  }
}

export interface FacebookSDK {
  init: (params: {
    appId:   string
    cookie:  boolean
    xfbml:   boolean
    version: string
  }) => void
  login: (
    callback: (response: FBLoginResponse) => void,
    options?:  { scope: string; return_scopes?: boolean }
  ) => void
  getLoginStatus: (callback: (response: FBLoginResponse) => void) => void
  AppEvents: { logPageView: () => void }
}

export interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown'
  authResponse: {
    accessToken:   string
    expiresIn:     number
    signedRequest: string
    userID:        string
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Returns a promise that resolves with `window.FB` once the SDK is ready.
 * Polls every 100 ms for up to `timeoutMs` (default 8 s).
 * Rejects if the SDK never loads (e.g. blocked by ad-blocker or env var missing).
 */
export function waitForFB(timeoutMs = 8000): Promise<FacebookSDK> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('No browser environment'))
      return
    }
    if (window.FB) {
      resolve(window.FB)
      return
    }
    const start    = Date.now()
    const interval = setInterval(() => {
      if (window.FB) {
        clearInterval(interval)
        resolve(window.FB)
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        reject(new Error('Facebook SDK no cargó. Revisa tu conexión o desactiva el bloqueador de anuncios.'))
      }
    }, 100)
  })
}

// ─── Component ────────────────────────────────────────────────────
/**
 * appId is passed as a prop from layout.tsx (Server Component) so it is
 * read at runtime from META_APP_ID — no NEXT_PUBLIC_ build-time baking needed.
 */
export function FacebookSDKLoader({ appId }: { appId: string }) {
  useEffect(() => {
    if (!appId) return

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie:  true,
        xfbml:   true,
        version: 'v20.0',
      })
      window.FB.AppEvents.logPageView()
    }

    // Don't inject the script twice
    if (document.getElementById('facebook-jssdk')) return

    const js  = document.createElement('script')
    js.id     = 'facebook-jssdk'
    js.src    = 'https://connect.facebook.net/en_US/sdk.js'
    js.async  = true
    js.defer  = true

    const fjs = document.getElementsByTagName('script')[0]
    fjs.parentNode?.insertBefore(js, fjs)
  }, [appId])

  return null
}
