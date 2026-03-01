import type { Metadata } from 'next'
import Image from 'next/image'
import { getAuthors } from '@/lib/articles'
import { AUTHOR_AVATAR, AUTHOR_BIO } from '@/lib/authors'
import { SectionHeader } from '@/components/SectionHeader'
import { PageTransition } from '@/components/PageTransition'
import type { AuthorSummary } from '@/lib/types'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  const authors = getAuthors()

  return (
    <PageTransition section="/about">
      <div className="max-w-6xl mx-auto py-8">
      <SectionHeader title="About" />

      <div className="max-w-2xl mb-12">
        <p
          className="font-body leading-relaxed mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          So, you&apos;re interested in knowing a little bit more about The Fix, eh? Well… we are
          a Bristol-based online magazine running previews, reviews, interviews and worldviews
          about cultural happenings in the South West.
        </p>
        <p className="font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          We have link-ups to the Old Vic, Thekla, O2 Academy and Tobacco Factory — covering
          music, film, theatre, and art.
        </p>
      </div>

      <h2
        className="font-display text-2xl font-bold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        The Team
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {authors.map((summary) => (
          <ReviewerCard key={summary.author.id} summary={summary} />
        ))}
      </div>
      </div>
    </PageTransition>
  )
}

function ReviewerCard({ summary }: { summary: AuthorSummary }) {
  const { author, reviewCount, categories } = summary
  const avatar = AUTHOR_AVATAR[author.slug]
  const bio = AUTHOR_BIO[author.slug]
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-sm border"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={author.name}
            width={64}
            height={64}
            className="rounded-full object-cover shrink-0"
            style={{ border: '2px solid var(--border)' }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-bold shrink-0"
            style={{
              backgroundColor: 'var(--section-accent, var(--accent))',
              color: 'var(--bg)',
            }}
          >
            {initials}
          </div>
        )}
        <div>
          <h3
            className="font-display text-lg font-bold leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {author.name}
          </h3>
          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {bio && (
        <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {bio}
        </p>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
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
