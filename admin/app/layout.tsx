import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | SmartPost',
    default:  'SmartPost — WhatsApp Marketing Bot',
  },
  description: 'Gestiona tu bot de WhatsApp y publica contenido en tus redes sociales.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read server-side env var at runtime — no NEXT_PUBLIC_ baking needed
  const fbAppId = process.env.META_APP_ID ?? ''

  return (
    // suppressHydrationWarning: ThemeScript toggles .dark before hydration to prevent flash
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <Providers fbAppId={fbAppId}>{children}</Providers>
      </body>
    </html>
  )
}
