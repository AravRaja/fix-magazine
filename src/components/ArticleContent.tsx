'use client'

import { useEffect, useRef } from 'react'
import { isStarImage } from '@/lib/utils'
import type { ImageRef } from '@/lib/types'

interface ArticleContentProps {
  html: string
  contentImages: ImageRef[]
  featuredImage: ImageRef | null
}

/** Strip size suffix from a filename, e.g. "foo-629x450.jpg" → "foo" */
function baseFilename(url: string): string {
  const name = url.split('/').pop() ?? ''
  return name.replace(/-\d+x\d+/, '').replace(/\.[^.]+$/, '')
}

export function ArticleContent({ html, contentImages, featuredImage }: ArticleContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  const featuredBase = featuredImage ? baseFilename(featuredImage.remoteUrl) : null

  // Set of star image src values to remove
  const starSrcs = new Set(
    contentImages
      .filter((img) => isStarImage(img.localPath))
      .flatMap((img) => [img.remoteUrl, `/${img.localPath}`])
  )

  useEffect(() => {
    if (!ref.current) return

    const imgs = Array.from(ref.current.querySelectorAll('img'))

    imgs.forEach((img, idx) => {
      const src = img.getAttribute('src') ?? ''
      const href = img.closest('a')?.getAttribute('href') ?? ''

      // Remove star rating images
      if (isStarImage(src) || starSrcs.has(src)) {
        const wrapper = img.closest('p') ?? img.closest('a') ?? img
        wrapper.remove()
        return
      }

      // Remove the first image if it duplicates the featured image
      if (idx === 0 && featuredBase) {
        const srcBase = baseFilename(src)
        const hrefBase = baseFilename(href)
        if (srcBase === featuredBase || hrefBase === featuredBase) {
          const wrapper = img.closest('p') ?? img.closest('a') ?? img
          wrapper.remove()
          return
        }
      }

      // Fix remote → local image paths
      const match = contentImages.find((ci) => ci.remoteUrl === src)
      if (match) {
        img.setAttribute('src', `/${match.localPath}`)
      }

      img.style.maxWidth = '100%'
      img.style.height = 'auto'
    })

    // Open external links in new tab
    ref.current.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    })
  }, [html, featuredBase, starSrcs, contentImages])

  let safeHtml = html
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const DOMPurify = require('dompurify')
      safeHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      })
    } catch {
      safeHtml = html
    }
  }

  return (
    <div
      ref={ref}
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
