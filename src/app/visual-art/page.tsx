import type { Metadata } from 'next'
import { getArticlesBySection } from '@/lib/articles'
import { ArticleBrowser } from '@/components/ArticleBrowser'
import { SectionHeader } from '@/components/SectionHeader'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = { title: 'Visual Art' }

export default function VisualArtPage() {
  const articles = getArticlesBySection('visual-art')

  return (
    <PageTransition section="/visual-art">
      <div className="max-w-6xl mx-auto py-8">
        <SectionHeader title="Visual Art" count={articles.length} />
        <ArticleBrowser articles={articles} columns={2} />
      </div>
    </PageTransition>
  )
}
