import type { Metadata } from 'next'
import { getArticlesBySection } from '@/lib/articles'
import { ArticleBrowser } from '@/components/ArticleBrowser'
import { SectionHeader } from '@/components/SectionHeader'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = { title: 'Music' }

export default function MusicPage() {
  const articles = getArticlesBySection('music')

  return (
    <PageTransition section="/music">
      <div className="max-w-6xl mx-auto py-8">
        <SectionHeader title="Music" count={articles.length} />
        <ArticleBrowser articles={articles} />
      </div>
    </PageTransition>
  )
}
