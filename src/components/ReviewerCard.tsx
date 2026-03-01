import type { AuthorSummary } from '@/lib/types'

export function ReviewerCard({ summary }: { summary: AuthorSummary }) {
  const { author, reviewCount, categories } = summary
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-sm border"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold shrink-0"
          style={{
            backgroundColor: 'var(--section-accent, var(--accent))',
            color: 'var(--bg)',
          }}
        >
          {initials}
        </div>
        <div>
          <h3
            className="font-display text-lg font-bold leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {author.name}
          </h3>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 text-xs font-mono rounded-sm border"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
