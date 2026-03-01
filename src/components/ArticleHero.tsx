'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { CategoryTag } from './CategoryTag'
import { StarRating } from './StarRating'
import { featuredImageUrl, PLACEHOLDER_IMAGE, formatDate, decodeExcerpt, sectionHref } from '@/lib/utils'
import type { ArticleIndexEntry } from '@/lib/types'

export function ArticleHero({ article }: { article: ArticleIndexEntry }) {
  const imgUrl = featuredImageUrl(article.featuredImage) ?? PLACEHOLDER_IMAGE
  const excerpt = decodeExcerpt(article.excerpt)
  const label = article.categories[0]
  const href = sectionHref(article.categories)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-sm"
      style={{ minHeight: '480px', borderColor: 'var(--border)', border: '1px solid' }}
    >
      {/* Parallax image */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <Image
          src={imgUrl}
          alt={article.featuredImage?.alt || article.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, var(--overlay) 0%, rgba(0,0,0,0) 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10" style={{ minHeight: '480px' }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {label && <CategoryTag label={label} href={href} />}
        </div>

        <Link href={`/${article.slug}`}>
          <h1
            className="font-display text-3xl md:text-5xl leading-tight font-bold mb-3 transition-opacity hover:opacity-80"
            style={{ color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            dangerouslySetInnerHTML={{ __html: article.title }}
          />
        </Link>

        {excerpt && (
          <p
            className="text-base md:text-lg leading-relaxed line-clamp-2 mb-4 max-w-2xl"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {article.author.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <time
            dateTime={article.date}
            className="font-mono text-sm"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {formatDate(article.date)}
          </time>
          <StarRating rating={article.rating} />
        </div>
      </div>
    </div>
  )
}
