import { describe, it, expect } from "vitest";
import {
  stripShortcodes,
  decodeHtmlEntities,
  stripHtml,
  extractRating,
  formatDate,
  parsePost,
} from "../../src/parsers/post.js";
import type { WPPost, WPAuthor, WPCategory, WPTag } from "../../src/types.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePost(overrides: Partial<WPPost> = {}): WPPost {
  return {
    id: 1,
    slug: "test-article",
    date: "2026-01-15T10:30:00",
    link: "https://thefixmagazine.com/test-article/",
    title: { rendered: "Test Article" },
    content: { rendered: "<p>Hello world</p>" },
    excerpt: { rendered: "<p>Short summary.</p>" },
    author: 5,
    featured_media: 0,
    categories: [1],
    tags: [10, 20],
    meta: {},
    ...overrides,
  };
}

// ── stripShortcodes ───────────────────────────────────────────────────────────

describe("stripShortcodes", () => {
  it("removes self-closing shortcodes", () => {
    expect(stripShortcodes("[gallery ids='1,2,3']")).toBe("");
  });

  it("removes block shortcodes with content", () => {
    const input = '[caption id="1"]<img src="x.jpg" />[/caption]';
    expect(stripShortcodes(input)).toBe("");
  });

  it("leaves regular HTML intact", () => {
    const html = "<p>Some <strong>bold</strong> text.</p>";
    expect(stripShortcodes(html)).toBe(html);
  });

  it("strips shortcodes but keeps surrounding HTML", () => {
    const input = "<p>Before</p>[gallery ids='1'][/gallery]<p>After</p>";
    expect(stripShortcodes(input)).toBe("<p>Before</p><p>After</p>");
  });
});

// ── decodeHtmlEntities ────────────────────────────────────────────────────────

describe("decodeHtmlEntities", () => {
  it("decodes &amp;", () => {
    expect(decodeHtmlEntities("Rock &amp; Roll")).toBe("Rock & Roll");
  });

  it("decodes typographic quotes", () => {
    expect(decodeHtmlEntities("&#8220;Hello&#8221;")).toBe("\u201cHello\u201d");
  });

  it("decodes em dash", () => {
    expect(decodeHtmlEntities("one&#8212;two")).toBe("one—two");
  });

  it("leaves plain text unchanged", () => {
    expect(decodeHtmlEntities("Nothing special")).toBe("Nothing special");
  });
});

// ── stripHtml ─────────────────────────────────────────────────────────────────

describe("stripHtml", () => {
  it("strips all HTML tags", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world"
    );
  });

  it("trims leading/trailing whitespace", () => {
    expect(stripHtml("  <p>  text  </p>  ")).toBe("text");
  });

  it("returns empty string for tag-only input", () => {
    expect(stripHtml("<br/>")).toBe("");
  });
});

// ── extractRating ─────────────────────────────────────────────────────────────

describe("extractRating", () => {
  it("returns null when no rating present", () => {
    expect(extractRating(makePost())).toBeNull();
  });

  it("reads from acf.rating /5 — doubles to /10", () => {
    const post = makePost({ acf: { rating: 4 } });
    expect(extractRating(post)).toBe(8);
  });

  it("reads from acf.score /10 — kept as-is", () => {
    const post = makePost({ acf: { score: 8 } });
    expect(extractRating(post)).toBe(8);
  });

  it("reads from meta.rating /5 — doubles to /10", () => {
    const post = makePost({ meta: { rating: "3" } });
    expect(extractRating(post)).toBe(6);
  });

  it("parses 'Rating: 4/5' pattern — doubles to /10", () => {
    const post = makePost({
      content: { rendered: "<p>Rating: 4/5</p>" },
    });
    expect(extractRating(post)).toBe(8);
  });

  it("parses 'Score: 8/10' pattern — kept as-is", () => {
    const post = makePost({
      content: { rendered: "<p>Score: 8/10</p>" },
    });
    expect(extractRating(post)).toBe(8);
  });

  it("parses standalone x/5 pattern — doubles to /10", () => {
    const post = makePost({
      content: { rendered: "<p>We give it a 5/5!</p>" },
    });
    expect(extractRating(post)).toBe(10);
  });

  it("parses standalone x/10 pattern — kept as-is", () => {
    const post = makePost({
      content: { rendered: "<p>Dream it while you can. 9/10</p>" },
    });
    expect(extractRating(post)).toBe(9);
  });

  it("parses data-rating /5 attribute — doubles to /10", () => {
    const post = makePost({
      content: { rendered: '<div class="stars" data-rating="3.5"></div>' },
    });
    expect(extractRating(post)).toBe(7);
  });

  it("parses star image filename e.g. 4-stars.jpg — doubles to /10", () => {
    const post = makePost({
      content: { rendered: '<img src="https://thefixmagazine.com/wp-content/uploads/2015/03/4-stars.jpg" />' },
    });
    expect(extractRating(post)).toBe(8);
  });
});

// ── formatDate ────────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("extracts YYYY-MM-DD from WP date string", () => {
    expect(formatDate("2026-01-15T10:30:00")).toBe("2026-01-15");
  });
});

// ── parsePost ─────────────────────────────────────────────────────────────────

describe("parsePost", () => {
  const authorsById = new Map<number, WPAuthor>([
    [5, { id: 5, name: "Scott Hammond", slug: "scott-hammond" }],
  ]);
  const categoriesById = new Map<number, WPCategory>([
    [1, { id: 1, name: "Music", slug: "music", parent: 0 }],
  ]);
  const tagsById = new Map<number, WPTag>([
    [10, { id: 10, name: "mogwai", slug: "mogwai" }],
    [20, { id: 20, name: "bristol", slug: "bristol" }],
  ]);

  it("maps all fields correctly", () => {
    const post = makePost({
      title: { rendered: "Mogwai &#8211; Live" },
      content: { rendered: "<p>Great show. Rating: 4/5</p>" },
      excerpt: { rendered: "<p>Short summary.</p>" },
    });

    const article = parsePost(
      post,
      authorsById,
      categoriesById,
      tagsById,
      null
    );

    expect(article.id).toBe(1);
    expect(article.slug).toBe("test-article");
    expect(article.title).toBe("Mogwai – Live");
    expect(article.content).toBe("<p>Great show. Rating: 4/5</p>");
    expect(article.excerpt).toBe("Short summary.");
    expect(article.date).toBe("2026-01-15");
    expect(article.author).toEqual({
      id: 5,
      name: "Scott Hammond",
      slug: "scott-hammond",
    });
    expect(article.categories).toEqual(["Music"]);
    expect(article.tags).toEqual(["mogwai", "bristol"]);
    expect(article.rating).toBe(8);
    expect(article.featuredImage).toBeNull();
    expect(article.sourceUrl).toBe("https://thefixmagazine.com/test-article/");
  });

  it("includes parent categories (e.g. Public Talk → Visual Art)", () => {
    const cats = new Map<number, WPCategory>([
      [193, { id: 193, name: "Visual Art", slug: "visual-art", parent: 0 }],
      [1719, { id: 1719, name: "Public Talk", slug: "public-talk", parent: 193 }],
    ]);
    const post = makePost({ categories: [1719] });
    const article = parsePost(post, authorsById, cats, tagsById, null);
    expect(article.categories).toContain("Public Talk");
    expect(article.categories).toContain("Visual Art");
  });

  it("falls back to 'Unknown' author when id not in map", () => {
    const post = makePost({ author: 999 });
    const article = parsePost(post, authorsById, categoriesById, tagsById, null);
    expect(article.author.name).toBe("Unknown");
    expect(article.author.slug).toBe("unknown");
  });

  it("includes featuredImage when provided", () => {
    const image = {
      remoteUrl: "https://example.com/img.jpg",
      localPath: "images/test-article-featured.jpg",
      alt: "A photo",
    };
    const post = makePost();
    const article = parsePost(post, authorsById, categoriesById, tagsById, image);
    expect(article.featuredImage).toEqual(image);
  });
});
