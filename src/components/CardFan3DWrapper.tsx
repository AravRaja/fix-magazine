'use client'

import dynamic from 'next/dynamic'
import type { ArticleIndexEntry } from '@/lib/types'

const CardFan3D = dynamic(() => import('./CardFan3D'), { ssr: false })

export function CardFan3DWrapper({ articles }: { articles: ArticleIndexEntry[] }) {
  return <CardFan3D articles={articles} />
}
