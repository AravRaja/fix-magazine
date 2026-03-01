import type { Metadata } from 'next'
import { getArticlesBySection } from '@/lib/articles'
import { ArticleBrowser } from '@/components/ArticleBrowser'
import { SectionHeader } from '@/components/SectionHeader'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = { title: 'Theatre' }

export default function TheatrePage() {
  const articles = getArticlesBySection('theatre')

  return (
    <PageTransition section="/theatre">
      <div className="max-w-6xl mx-auto py-8">
        <SectionHeader title="Theatre" count={articles.length} />
        <ArticleBrowser articles={articles} />
      </div>
    </PageTransition>
  )
}
