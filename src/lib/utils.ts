import type { ImageRef } from './types'

/** Convert a localPath like "images/foo.jpg" to a public URL "/images/foo.jpg" */
export function imageUrl(localPath: string): string {
  return `/${localPath}`
}

/** Return public URL for a featured image, or null if missing */
export function featuredImageUrl(image: ImageRef | null): string | null {
  if (!image) return null
  return image.remoteUrl
}

/** Fallback placeholder when no image is available */
export const PLACEHOLDER_IMAGE = '/images/placeholder.jpg'

/** Star rating filename pattern — used to filter out rating images from content */
const STAR_IMAGE_RE = /\d-stars?\.(?:jpg|jpeg|png|webp)$/i

export function isStarImage(localPath: string): boolean {
  return STAR_IMAGE_RE.test(localPath)
}

/** Top-level section names that have nav routes */
export const SECTION_ROUTES: Record<string, string> = {
  'Music': '/music',
  'Theatre': '/theatre',
  'Film': '/film',
  'Visual Art': '/visual-art',
}

/**
 * Given an article's categories array, return the href for the section tag.
 * Looks for the top-level section name in the array (not the subcategory).
 * Photography/Interview/Whats On appear in multiple sections, so we rely on
 * the parent name being present alongside them.
 */
export function sectionHref(categories: string[]): string | undefined {
  const parent = categories.find((c) => c in SECTION_ROUTES)
  return parent ? SECTION_ROUTES[parent] : undefined
}

/** Section label for display in nav / headers */
export const SECTION_LABELS: Record<string, string> = {
  '/': 'Home',
  '/music': 'Music',
  '/theatre': 'Theatre',
  '/film': 'Film',
  '/visual-art': 'Visual Art',
  '/about': 'About',
  '/contact': 'Contact',
}

/** CSS custom property name for section accent colour */
export const SECTION_ACCENT_VAR = '--section-accent'

/** The section accent token (from palette) for each route */
export const SECTION_ACCENT_TOKEN: Record<string, string> = {
  '/': 'var(--accent)',
  '/music': 'var(--warm)',
  '/theatre': 'var(--accent)',
  '/film': 'var(--cool)',
  '/visual-art': 'var(--accent-alt)',
  '/about': 'var(--border)',
  '/contact': 'var(--special)',
}

/** Format ISO date string to human-readable */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Decode HTML entities in excerpt text */
export function decodeExcerpt(html: string): string {
  return html
    .replace(/&hellip;/g, '\u2026')
    .replace(/&rarr;/g, '\u2192')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/<[^>]+>/g, '')
    .replace(/Continue Reading \u2192/g, '')
    .trim()
}
