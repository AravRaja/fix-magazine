export interface ImageRef {
  remoteUrl: string
  localPath: string
  alt: string
}

export interface Author {
  id: number
  name: string
  slug: string
}

export interface ArticleIndexEntry {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  author: Author
  categories: string[]
  tags: string[]
  featuredImage: ImageRef | null
  rating: number | null
  sourceUrl: string
}

export interface Article extends ArticleIndexEntry {
  content: string
  contentImages: ImageRef[]
}

export interface AuthorSummary {
  author: Author
  reviewCount: number
  categories: string[]
}
