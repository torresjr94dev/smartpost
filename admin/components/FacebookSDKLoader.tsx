'use client'

import Script from 'next/script'

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
    options?:  { scope?: string; return_scopes?: boolean; config_id?: string }
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
 * NEXT_PUBLIC_META_APP_ID is baked into the bundle at build time via Dockerfile ARG.
 * Uses next/script (strategy="lazyOnload") — more reliable than manual DOM injection.
 */
export function FacebookSDKLoader() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID

  if (!appId) return null

  return (
    <Script
      id="facebook-jssdk"
      src="https://connect.facebook.net/en_US/sdk.js"
      strategy="lazyOnload"
      onLoad={() => {
        window.FB.init({
          appId,
          cookie:  true,
          xfbml:   true,
          version: 'v20.0',
        })
        console.log('[FacebookSDK] Ready ✓')
      }}
      onError={() => {
        console.error('[FacebookSDK] ✗ Script blocked — check ad-blocker or network')
      }}
    />
  )
}
