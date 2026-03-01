interface SectionHeaderProps {
  title: string
  count?: number
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div
      className="border-b pb-4 mb-8"
      style={{ borderColor: 'var(--section-accent, var(--accent))' }}
    >
      <div className="flex items-end justify-between gap-4">
        <h1
          className="font-display text-4xl md:text-5xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {count !== undefined && (
          <span className="font-mono text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {count} article{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
