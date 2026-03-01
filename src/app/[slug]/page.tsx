import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getAllSlugs, getArticle } from '@/lib/articles'
import { featuredImageUrl, PLACEHOLDER_IMAGE, formatDate, decodeExcerpt, sectionHref } from '@/lib/utils'
import { ArticleContent } from '@/components/ArticleContent'
import { StarRating } from '@/components/StarRating'
import { CategoryTag } from '@/components/CategoryTag'
import { PageTransition } from '@/components/PageTransition'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  return {
    title: article.title.replace(/&#\d+;|&[a-z]+;/gi, ''),
    description: decodeExcerpt(article.excerpt).slice(0, 160),
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const imgUrl = featuredImageUrl(article.featuredImage) ?? PLACEHOLDER_IMAGE
  const label = article.categories[0]
  const href = sectionHref(article.categories)

  return (
    <PageTransition section="/">
      <article className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {label && <CategoryTag label={label} href={href} />}
          </div>

          <h1
            className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: article.title }}
          />

          <div
            className="flex items-center gap-3 flex-wrap pb-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              By {article.author.name}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <time
              dateTime={article.date}
              className="font-mono text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDate(article.date)}
            </time>
            {article.rating !== null && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <StarRating rating={article.rating} />
              </>
            )}
          </div>
        </header>

        {/* Featured image */}
        <div className="relative aspect-video mb-8 rounded-sm overflow-hidden">
          <Image
            src={imgUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Content */}
        <ArticleContent
          html={article.content}
          contentImages={article.contentImages}
          featuredImage={article.featuredImage}
        />

        {/* Back link */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <a
            href="/"
            className="font-mono text-sm transition-opacity hover:opacity-70 inline-block px-2 py-0.5"
            style={{ color: '#ebff00', background: '#000' }}
          >
            ← Back to all articles
          </a>
        </div>
      </article>
    </PageTransition>
  )
}
