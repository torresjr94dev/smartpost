import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16: Turbopack es el bundler estable por defecto en dev
  // Para usarlo explícitamente: npx next dev --turbopack
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      // Wildcards requieren new URL pattern en Next.js 15+
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
    ],
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // Next.js 15/16: experimental.serverActions ya no existe — es estable por defecto
  // Next.js 16: React 19 requerido (ya incluido en package.json)
}

export default nextConfig
