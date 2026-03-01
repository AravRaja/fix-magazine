import Link from 'next/link'

interface CategoryTagProps {
  label: string
  href?: string
  className?: string
}

const base =
  'inline-block px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity hover:opacity-80'

const style = {
  backgroundColor: '#ebff00',
  color: '#000',
}

export function CategoryTag({ label, href, className = '' }: CategoryTagProps) {
  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`} style={style}>
        {label}
      </Link>
    )
  }

  return (
    <span className={`${base} ${className}`} style={style}>
      {label}
    </span>
  )
}
