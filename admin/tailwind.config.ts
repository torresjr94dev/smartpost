import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  // Class-based dark mode — ThemeProvider toggles .dark on <html>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Accent (same both themes) ──────────────────────────────
        accent: {
          DEFAULT:    '#16C784',
          dim:        '#0FA366',
          glow:       'rgba(22,199,132,0.3)',
          secondary:  '#6366F1',
          'sec-dim':  '#4F46E5',
          'sec-glow': 'rgba(99,102,241,0.3)',
        },
        // ── Semantic ───────────────────────────────────────────────
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        // ── Legacy brand (backwards compat) ───────────────────────
        brand: {
          green:        '#00d672',
          'green-dim':  '#00a857',
          'green-glow': 'rgba(0,214,114,0.35)',
          purple:       '#7c63f8',
          'purple-dim': '#5e48d6',
          'purple-glow':'rgba(124,99,248,0.35)',
        },
        // ── Dark theme tokens ──────────────────────────────────────
        dark: {
          DEFAULT:       '#0D1117',
          card:          '#0b0f18',    // legacy
          surface:       '#0f1420',    // legacy
          border:        'rgba(255,255,255,0.07)',
          'border-hover':'rgba(255,255,255,0.14)',
        },
        // ── Text hierarchy (legacy) ────────────────────────────────
        ink: {
          primary:   '#e6edf3',
          secondary: '#8b98a9',
          muted:     '#4b5563',
        },
        // ── Status ────────────────────────────────────────────────
        status: {
          published: '#16C784',
          scheduled: '#6366F1',
          draft:     '#94A3B8',
          failed:    '#EF4444',
        },
        // ── Dark Ops (legacy) ──────────────────────────────────────
        ops: {
          base:     '#0A0E17',
          surface:  '#111827',
          elevated: '#1C2333',
          overlay:  '#242D3F',
        },
        neon: {
          green:  '#00FF88',
          cyan:   '#00D4FF',
          warn:   '#F59E0B',
          danger: '#EF4444',
          purple: '#7C3AED',
          muted:  '#6B7280',
        },
      },

      fontFamily: {
        // ── New design system ──────────────────────────────────────
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        // ── Legacy ────────────────────────────────────────────────
        'mono-ops': ['"JetBrains Mono"', 'monospace'],
        'display-legacy': ['"Barlow Condensed"', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],     // 10px
        xs:    ['0.75rem',  { lineHeight: '1rem' }],     // 12px
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base:  ['1rem',     { lineHeight: '1.5rem' }],   // 16px
        lg:    ['1.25rem',  { lineHeight: '1.75rem' }],  // 20px
        xl:    ['1.5rem',   { lineHeight: '2rem' }],     // 24px
        '2xl': ['2rem',     { lineHeight: '2.5rem' }],   // 32px
        '3xl': ['3rem',     { lineHeight: '1.15' }],     // 48px
      },

      backgroundImage: {
        // ── New ───────────────────────────────────────────────────
        'gradient-accent':   'linear-gradient(135deg, #16C784 0%, #0FA366 100%)',
        'gradient-secondary':'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        'mesh-light':        'radial-gradient(ellipse at 20% 50%, rgba(22,199,132,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.07) 0%, transparent 55%)',
        // ── Legacy ────────────────────────────────────────────────
        'gradient-green':  'linear-gradient(135deg, #00d672 0%, #00a857 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c63f8 0%, #5e48d6 100%)',
        'gradient-card':   'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'mesh-dark':       'radial-gradient(ellipse at 20% 50%, rgba(22,199,132,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 50%)',
      },

      boxShadow: {
        // ── New ───────────────────────────────────────────────────
        'accent-glow': '0 4px 24px rgba(22,199,132,0.3)',
        'sec-glow':    '0 4px 24px rgba(99,102,241,0.3)',
        'glass':       '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
        'glass-dark':  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        // ── Legacy ────────────────────────────────────────────────
        'green-glow':   '0 4px 24px rgba(0,214,114,0.3)',
        'purple-glow':  '0 4px 24px rgba(124,99,248,0.3)',
        'card':         '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover':   '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
        'modal':        '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        'ops-panel':    '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
        'ops-green':    '0 0 24px rgba(0,255,136,0.35), 0 0 48px rgba(0,255,136,0.12)',
        'ops-green-sm': '0 0 10px rgba(0,255,136,0.5)',
        'ops-cyan':     '0 0 24px rgba(0,212,255,0.3)',
      },

      animation: {
        'fade-in':       'fadeIn 0.25s ease-out',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'blur-in':       'blurIn 0.5s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':       'shimmer 2.5s linear infinite',
        'pulse-accent':  'pulseAccent 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        // Legacy
        'pulse-green':   'pulseGreen 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      keyframes: {
        fadeIn:      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:     { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        blurIn:      { '0%': { filter: 'blur(10px)', opacity: '0' }, '100%': { filter: 'blur(0)', opacity: '1' } },
        shimmer:     { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        pulseAccent: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        pulseGreen:  { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

export default config
