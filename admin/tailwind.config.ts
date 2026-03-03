import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — SmartPost
        brand: {
          green:  '#00d672',
          'green-dim': '#00a857',
          'green-glow': 'rgba(0,214,114,0.35)',
          purple: '#7c63f8',
          'purple-dim': '#5e48d6',
          'purple-glow': 'rgba(124,99,248,0.35)',
        },
        // Dark backgrounds
        dark: {
          DEFAULT: '#07090f',
          card:    '#0b0f18',
          surface: '#0f1420',
          border:  'rgba(255,255,255,0.07)',
          'border-hover': 'rgba(255,255,255,0.14)',
        },
        // Text hierarchy
        ink: {
          primary:   '#e6edf3',
          secondary: '#8b98a9',
          muted:     '#4b5563',
        },
        // Status colors
        status: {
          published: '#00d672',
          scheduled: '#7c63f8',
          draft:     '#8b98a9',
          failed:    '#f87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #00d672 0%, #00a857 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c63f8 0%, #5e48d6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'mesh-dark': 'radial-gradient(ellipse at 20% 50%, rgba(0,214,114,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,99,248,0.06) 0%, transparent 50%)',
      },
      boxShadow: {
        'green-glow': '0 4px 24px rgba(0,214,114,0.3)',
        'purple-glow': '0 4px 24px rgba(124,99,248,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
        'modal': '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGreen: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

export default config
