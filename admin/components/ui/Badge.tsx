import clsx from 'clsx'

type BadgeVariant = 'published' | 'scheduled' | 'draft' | 'failed' | 'active' | 'expired' | 'inactive'

const variants: Record<BadgeVariant, string> = {
  published: 'bg-brand-green/15 text-brand-green',
  scheduled: 'bg-brand-purple/15 text-brand-purple',
  draft:     'bg-white/10 text-ink-secondary',
  failed:    'bg-red-500/15 text-red-400',
  active:    'bg-brand-green/15 text-brand-green',
  expired:   'bg-amber-500/15 text-amber-400',
  inactive:  'bg-white/10 text-ink-muted',
}

const labels: Record<BadgeVariant, string> = {
  published: 'Publicado',
  scheduled: 'Programado',
  draft:     'Borrador',
  failed:    'Fallido',
  active:    'Activo',
  expired:   'Expirado',
  inactive:  'Inactivo',
}

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  dot?: boolean
  className?: string
}

export default function Badge({ variant, label, dot = false, className }: BadgeProps) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', variant === 'active' || variant === 'published' ? 'bg-brand-green' : variant === 'expired' ? 'bg-amber-400' : 'bg-current opacity-60')} />}
      {label ?? labels[variant]}
    </span>
  )
}
