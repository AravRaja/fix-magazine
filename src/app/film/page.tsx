import type { Metadata } from 'next'
import { getArticlesBySection } from '@/lib/articles'
import { ArticleBrowser } from '@/components/ArticleBrowser'
import { SectionHeader } from '@/components/SectionHeader'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = { title: 'Film' }

export default function FilmPage() {
  const articles = getArticlesBySection('film')

  return (
    <PageTransition section="/film">
      <div className="max-w-6xl mx-auto py-8">
        <SectionHeader title="Film" count={articles.length} />
        <ArticleBrowser articles={articles} cardVariant="wide" />
      </div>
    </PageTransition>
  )
}
