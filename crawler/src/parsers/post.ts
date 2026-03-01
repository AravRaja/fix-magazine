import type {
  WPPost,
  WPAuthor,
  WPCategory,
  WPTag,
  Article,
  FeaturedImage,
} from "../types.js";


/**
 * Strip WordPress shortcodes like [caption id="..."]...[/caption] and [gallery ...].
 * Also decodes common HTML entities left by WP renderer.
 */
export function stripShortcodes(html: string): string {
  // Remove shortcodes with content: [tag attr]...[/tag]
  let result = html.replace(/\[[a-z_]+[^\]]*\][\s\S]*?\[\/[a-z_]+\]/gi, "");
  // Remove self-closing shortcodes: [tag attr]
  result = result.replace(/\[[a-z_]+[^\]]*\]/gi, "");
  return result.trim();
}

/**
 * Decode HTML entities in a string (title, excerpt use .rendered which is HTML-encoded).
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d");
}

/**
 * Strip all HTML tags from a string, used for plain-text excerpt fallback.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * Extract a numeric rating on a scale of 1–10 from:
 * 1. ACF fields in `post.acf`
 * 2. `post.meta` block
 * 3. HTML content patterns (star images, inline text like "9/10" or "Rating: 4/5")
 *
 * All /5 sources are doubled to /10. Returns null if no rating found.
 */
export function extractRating(post: WPPost): number | null {
  // 1. ACF field (common field names used by review plugins)
  if (post.acf) {
    for (const key of ["rating", "score", "review_score", "star_rating", "stars"]) {
      const val = post.acf[key];
      if (val !== undefined && val !== null && val !== "") {
        const n = Number(val);
        if (!isNaN(n) && n >= 1 && n <= 10) {
          // Values <= 5 are assumed /5 — double them to /10
          return n <= 5 ? Math.round(n * 2) : Math.round(n);
        }
      }
    }
  }

  // 2. meta block
  const meta = post.meta as Record<string, unknown>;
  if (meta) {
    for (const key of ["rating", "score", "review_score", "star_rating", "stars"]) {
      const val = meta[key];
      if (val !== undefined && val !== null && val !== "") {
        const n = Number(val);
        if (!isNaN(n) && n >= 1 && n <= 10) {
          return n <= 5 ? Math.round(n * 2) : Math.round(n);
        }
      }
    }
  }

  // 3. HTML content patterns
  const content = post.content.rendered;

  // Pattern: "Rating: 4/5" or "Score: 8/10"
  const ratingMatch = content.match(
    /(?:rating|score|stars?)[:\s]+(\d(?:\.\d)?)\s*\/\s*(\d+)/i
  );
  if (ratingMatch) {
    const val = parseFloat(ratingMatch[1]);
    const outOf = parseInt(ratingMatch[2], 10);
    if (outOf === 10) return Math.round(val);
    if (outOf === 5) return Math.round(val * 2);
  }

  // Pattern: standalone digit followed by /5 e.g. "4/5"
  const fiveMatch = content.match(/\b([1-5])\/5\b/);
  if (fiveMatch) return parseInt(fiveMatch[1], 10) * 2;

  // Pattern: standalone number followed by /10 e.g. "9/10"
  const tenMatch = content.match(/\b(\d(?:\.\d)?)\s*\/\s*10\b/);
  if (tenMatch) return Math.round(parseFloat(tenMatch[1]));

  // Pattern: wp-review or similar plugin data attributes
  const dataMatch = content.match(/data-(?:rating|score)="(\d(?:\.\d)?)"/i);
  if (dataMatch) {
    const n = parseFloat(dataMatch[1]);
    if (n >= 1 && n <= 5) return Math.round(n * 2);
    if (n > 5 && n <= 10) return Math.round(n);
  }

  // Pattern: star image filename e.g. "4-stars.jpg" or "3-star.png" (stars are /5)
  const starImgMatch = content.match(/\/(\d)-stars?\.(?:jpg|jpeg|png|webp|gif)/i);
  if (starImgMatch) {
    const n = parseInt(starImgMatch[1], 10);
    if (n >= 1 && n <= 5) return n * 2;
  }

  return null;
}

/**
 * Format a WP date string to YYYY-MM-DD.
 */
export function formatDate(wpDate: string): string {
  return wpDate.substring(0, 10);
}

/**
 * Map a raw WordPress post + resolved lookups → clean Article shape.
 */
export function parsePost(
  post: WPPost,
  authorsById: Map<number, WPAuthor>,
  categoriesById: Map<number, WPCategory>,
  tagsById: Map<number, WPTag>,
  featuredImage: FeaturedImage | null,
  contentImages: FeaturedImage[] = []
): Article {
  const author = authorsById.get(post.author) ?? {
    id: post.author,
    name: "Unknown",
    slug: "unknown",
  };

  // Include the assigned category and all its ancestors (e.g. "Public Talk" → "Visual Art")
  const categoryNames = new Set<string>();
  for (const id of post.categories) {
    let cat = categoriesById.get(id);
    while (cat) {
      categoryNames.add(cat.name);
      cat = cat.parent ? categoriesById.get(cat.parent) : undefined;
    }
  }
  const categories = [...categoryNames];

  const tags = post.tags
    .map((id) => tagsById.get(id)?.name ?? "")
    .filter(Boolean);

  const rating = extractRating(post);
  if (rating === null) {
    console.warn(`  [warn] No rating found for post: ${post.slug}`);
  }

  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtmlEntities(post.title.rendered),
    content: stripShortcodes(post.content.rendered),
    excerpt: stripHtml(decodeHtmlEntities(post.excerpt.rendered)),
    date: formatDate(post.date),
    author: {
      id: author.id,
      name: author.name,
      slug: author.slug,
    },
    categories,
    tags,
    featuredImage,
    contentImages,
    rating,
    sourceUrl: post.link,
  };
}
