'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CategoryTag } from './CategoryTag'
import { StarRating } from './StarRating'
import { featuredImageUrl, PLACEHOLDER_IMAGE, formatDate, decodeExcerpt, sectionHref } from '@/lib/utils'
import { AUTHOR_AVATAR } from '@/lib/authors'
import type { ArticleIndexEntry } from '@/lib/types'

interface ArticleCardProps {
  article: ArticleIndexEntry
  variant?: 'default' | 'wide'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const imgUrl = featuredImageUrl(article.featuredImage) ?? PLACEHOLDER_IMAGE
  const excerpt = decodeExcerpt(article.excerpt)
  const avatar = AUTHOR_AVATAR[article.author.slug]
  // Most specific subcategory label; fall back to section name if array has only one entry
  const label = article.categories[0]
  const href = sectionHref(article.categories)

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`group flex flex-col overflow-hidden rounded-sm border ${variant === 'wide' ? 'md:flex-row' : ''}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <Link
        href={`/${article.slug}`}
        className={`relative block overflow-hidden ${variant === 'wide' ? 'md:w-2/5 aspect-video md:aspect-auto' : 'aspect-video'}`}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={imgUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--overlay)' }} />
        </motion.div>
      </Link>

      <div className="flex flex-col gap-2 p-4 flex-1">
        {label && <CategoryTag label={label} href={href} />}

        <Link href={`/${article.slug}`} className="group/title">
          <h2
            className="font-display text-lg leading-snug font-bold transition-opacity group-hover/title:opacity-70"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: article.title }}
          />
        </Link>

        {excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-3 font-body"
            style={{ color: 'var(--text-secondary)' }}
          >
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {avatar ? (
              <Image
                src={avatar}
                alt={article.author.name}
                width={22}
                height={22}
                className="rounded-full object-cover"
                style={{ border: '1px solid var(--border)' }}
              />
            ) : null}
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              {article.author.name}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <time
              dateTime={article.date}
              className="font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDate(article.date)}
            </time>
          </div>
          <StarRating rating={article.rating} />
        </div>
      </div>
    </motion.article>
  )
}
