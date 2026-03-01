// Star colour that reads clearly on both white and yellow backgrounds
const STAR_FILLED = '#c8a000'
const STAR_EMPTY  = '#d0d0d0'

interface StarRatingProps {
  rating: number | null
  showLabel?: boolean
}

export function StarRating({ rating, showLabel = true }: StarRatingProps) {
  if (rating === null) return null

  const stars = rating / 2 // 1–10 → 0–5

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 10`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = stars - i
          return <Star key={i} index={i} fill={Math.min(1, Math.max(0, filled))} />
        })}
      </div>
      {showLabel && (
        <span className="font-mono text-sm font-medium tabular-nums" style={{ color: '#000' }}>
          {rating}/10
        </span>
      )}
    </div>
  )
}

function Star({ fill, index }: { fill: number; index: number }) {
  const id = `star-grad-${index}-${Math.round(fill * 100)}`
  const pts = '8,1.5 9.8,6 14.5,6 10.8,9 12.2,14 8,11 3.8,14 5.2,9 1.5,6 6.2,6'

  if (fill >= 1) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <polygon points={pts} fill={STAR_FILLED} />
      </svg>
    )
  }

  if (fill <= 0) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <polygon points={pts} fill={STAR_EMPTY} />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor={STAR_FILLED} />
          <stop offset={`${fill * 100}%`} stopColor={STAR_EMPTY} />
        </linearGradient>
      </defs>
      <polygon points={pts} fill={`url(#${id})`} />
    </svg>
  )
}
