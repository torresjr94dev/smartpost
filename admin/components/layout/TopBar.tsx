interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-dark-border bg-dark-card/50 backdrop-blur-sm flex-shrink-0">
      <div>
        <h1 className="text-[20px] font-bold text-ink-primary tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-ink-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </header>
  )
}
