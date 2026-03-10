interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-[72px] flex items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur-sm flex-shrink-0">
      <div>
        <h1 className="text-[20px] font-bold text-[var(--text)] tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </header>
  )
}
