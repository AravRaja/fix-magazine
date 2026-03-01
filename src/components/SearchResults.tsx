'use client'

import { useSearchParams } from 'next/navigation'
import { ArticleCard } from './ArticleCard'
import type { ArticleIndexEntry } from '@/lib/types'

interface Props {
  articles: ArticleIndexEntry[]
}

export default function SearchResults({ articles }: Props) {
  const params = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const ql = q.toLowerCase()

  const results =
    ql.length < 2
      ? []
      : articles.filter(
          (a) =>
            a.title.toLowerCase().includes(ql) ||
            a.author.name.toLowerCase().includes(ql) ||
            a.categories.some((c) => c.toLowerCase().includes(ql)) ||
            (a.excerpt ?? '').toLowerCase().includes(ql),
        )

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1
        className="font-mono text-2xl font-bold mb-2"
        style={{ color: '#000' }}
      >
        {q ? `"${q}"` : 'Search'}
      </h1>
      <p className="font-mono text-sm mb-8" style={{ color: '#333' }}>
        {ql.length < 2
          ? 'Type at least 2 characters to search.'
          : `${results.length} result${results.length !== 1 ? 's' : ''} across all articles`}
      </p>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {ql.length >= 2 && results.length === 0 && (
        <p className="font-mono text-sm" style={{ color: '#555' }}>
          No articles found for <strong>"{q}"</strong>.
        </p>
      )}
    </div>
  )
}
