import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | SmartPost',
    default: 'SmartPost — WhatsApp Marketing Bot',
  },
  description: 'Gestiona tu bot de WhatsApp y publica contenido en tus redes sociales.',
  robots: 'noindex, nofollow', // Admin privado — no indexar
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Preconnect Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
