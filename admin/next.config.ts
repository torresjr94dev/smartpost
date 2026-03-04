import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
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
  // Next.js 16: eslint/typescript build options removed (run separately via CLI)
}

export default nextConfig
