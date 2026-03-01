'use client'

import { useState } from 'react'
import { ArticleCard } from './ArticleCard'
import type { ArticleIndexEntry } from '@/lib/types'

interface ArticleBrowserProps {
  articles: ArticleIndexEntry[]
  cardVariant?: 'default' | 'wide'
  columns?: 2 | 3
  pageSize?: number
}

export function ArticleBrowser({
  articles,
  cardVariant = 'default',
  columns = 3,
  pageSize = 12,
}: ArticleBrowserProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(articles.length / pageSize)
  const pageArticles = articles.slice((page - 1) * pageSize, page * pageSize)

  const gridClass =
    columns === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'

  return (
    <div className="flex flex-col gap-6">
      {/* Article grid */}
      {pageArticles.length > 0 && (
        <div className={gridClass}>
          {pageArticles.map(article => (
            <ArticleCard key={article.id} article={article} variant={cardVariant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-mono text-sm px-3 py-1 rounded-sm border transition-opacity disabled:opacity-30"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surface)',
            }}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="font-mono text-sm px-3 py-1 rounded-sm border transition-opacity disabled:opacity-30"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surface)',
            }}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
