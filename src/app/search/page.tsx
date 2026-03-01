import { Suspense } from 'react'
import { getAllArticles } from '@/lib/articles'
import SearchResults from '@/components/SearchResults'

export default function SearchPage() {
  const articles = getAllArticles()
  return (
    <Suspense>
      <SearchResults articles={articles} />
    </Suspense>
  )
}
