import fs from 'fs'
import path from 'path'
import type { Article, ArticleIndexEntry, AuthorSummary } from './types'

const OUTPUT_DIR = path.join(process.cwd(), 'output')
const INDEX_PATH = path.join(OUTPUT_DIR, 'index.json')
const ARTICLES_DIR = path.join(OUTPUT_DIR, 'articles')

// Memoize the index in-process (Next.js keeps the server alive between requests in dev)
let _index: ArticleIndexEntry[] | null = null

export function getAllArticles(): ArticleIndexEntry[] {
  if (_index) return _index
  const raw = fs.readFileSync(INDEX_PATH, 'utf-8')
  _index = JSON.parse(raw) as ArticleIndexEntry[]
  return _index
}

export function getArticle(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as Article
}

/** Returns all unique slugs (for generateStaticParams) */
export function getAllSlugs(): string[] {
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
}

/** Top-level section names exactly as they appear in the categories array */
const SECTION_NAME: Record<string, string> = {
  music: 'Music',
  theatre: 'Theatre',
  film: 'Film',
  'visual-art': 'Visual Art',
}

/**
 * Filter articles for a section page.
 * Because every subcategory article also carries its parent section name
 * (e.g. ["Gig Reviews", "Music"]), checking for the top-level name is sufficient
 * and correctly catches all subcategories without special-casing them.
 */
export function getArticlesBySection(section: string): ArticleIndexEntry[] {
  const name = SECTION_NAME[section]
  if (!name) return []
  return getAllArticles().filter((a) => a.categories.includes(name))
}

// Categories that are cross-section and not useful as section identifiers
const NOISE_CATEGORIES = new Set(['Interview', 'Photography', 'Whats On', 'Uncategorized', 'Competitions'])

/** Derive unique authors + stats from index */
export function getAuthors(): AuthorSummary[] {
  const all = getAllArticles()
  const map = new Map<number, AuthorSummary>()

  for (const article of all) {
    const existing = map.get(article.author.id)
    const meaningfulCats = article.categories.filter((c) => !NOISE_CATEGORIES.has(c))
    if (existing) {
      existing.reviewCount++
      for (const cat of meaningfulCats) {
        if (!existing.categories.includes(cat)) existing.categories.push(cat)
      }
    } else {
      map.set(article.author.id, {
        author: article.author,
        reviewCount: 1,
        categories: [...meaningfulCats],
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.reviewCount - a.reviewCount)
}
