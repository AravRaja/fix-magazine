import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * Integration test for the crawler.
 *
 * Strategy:
 * - Mock global fetch to return fixture data for each WP API endpoint.
 * - Point config output dirs at a temp directory.
 * - Run crawl() and verify the output files.
 */

// ── Fixtures ──────────────────────────────────────────────────────────────────

const AUTHOR = { id: 5, name: "Scott Hammond", slug: "scott-hammond" };
const CATEGORY = { id: 1, name: "Music", slug: "music", parent: 0 };
const TAG_1 = { id: 10, name: "mogwai", slug: "mogwai" };
const TAG_2 = { id: 20, name: "bristol", slug: "bristol" };

const MOCK_POST = {
  id: 42,
  slug: "mogwai-at-the-beacon",
  date: "2026-01-15T10:30:00",
  link: "https://thefixmagazine.com/mogwai-at-the-beacon/",
  title: { rendered: "Mogwai at The Beacon" },
  content: { rendered: "<p>Incredible show. Rating: 5/5</p>" },
  excerpt: { rendered: "<p>A brilliant night.</p>" },
  author: 5,
  featured_media: 0,
  categories: [1],
  tags: [10, 20],
  meta: {},
};

const MOCK_MEDIA = {
  id: 99,
  source_url: "https://thefixmagazine.com/wp-content/uploads/mogwai.jpg",
  alt_text: "Mogwai on stage",
  media_details: { width: 1200, height: 800 },
};

// Helper to build a mock Response-like object
function mockResponse(body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
    json: async () => body,
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("crawler integration", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "fix-crawler-test-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("writes article JSON and index for a single post", async () => {
    // Mock fetch to return appropriate data per URL
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/users")) {
          return Promise.resolve(
            mockResponse([AUTHOR], { "X-WP-TotalPages": "1" })
          );
        }
        if (url.includes("/categories")) {
          return Promise.resolve(
            mockResponse([CATEGORY], { "X-WP-TotalPages": "1" })
          );
        }
        if (url.includes("/tags")) {
          return Promise.resolve(
            mockResponse([TAG_1, TAG_2], { "X-WP-TotalPages": "1" })
          );
        }
        if (url.includes("/posts")) {
          return Promise.resolve(
            mockResponse([MOCK_POST], { "X-WP-TotalPages": "1" })
          );
        }
        if (url.includes("/media/")) {
          return Promise.resolve(mockResponse(MOCK_MEDIA));
        }
        return Promise.resolve(mockResponse({}));
      })
    );

    // Override config paths to use temp dir
    const configModule = await import("../src/config.js");
    const origConfig = configModule.config;

    // Monkey-patch config for this test
    const articlesDir = path.join(tmpDir, "articles");
    const imagesDir = path.join(tmpDir, "images");
    const indexFile = path.join(tmpDir, "index.json");

    vi.spyOn(configModule, "config", "get").mockReturnValue({
      ...origConfig,
      outputDir: tmpDir,
      articlesDir,
      imagesDir,
      indexFile,
    });

    await fs.mkdir(articlesDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });

    const { crawl } = await import("../src/crawler.js");
    await crawl();

    // Verify article file
    const articlePath = path.join(articlesDir, "mogwai-at-the-beacon.json");
    const articleRaw = await fs.readFile(articlePath, "utf8");
    const article = JSON.parse(articleRaw);

    expect(article.id).toBe(42);
    expect(article.slug).toBe("mogwai-at-the-beacon");
    expect(article.title).toBe("Mogwai at The Beacon");
    expect(article.content).toBe("<p>Incredible show. Rating: 5/5</p>");
    expect(article.excerpt).toBe("A brilliant night.");
    expect(article.date).toBe("2026-01-15");
    expect(article.author).toEqual(AUTHOR);
    expect(article.categories).toEqual(["Music"]);
    expect(article.tags).toEqual(["mogwai", "bristol"]);
    expect(article.rating).toBe(10);
    expect(article.sourceUrl).toBe(
      "https://thefixmagazine.com/mogwai-at-the-beacon/"
    );

    // Verify index file
    const indexRaw = await fs.readFile(indexFile, "utf8");
    const index = JSON.parse(indexRaw);

    expect(index).toHaveLength(1);
    expect(index[0].slug).toBe("mogwai-at-the-beacon");
    // Index must not contain full content
    expect(index[0].content).toBeUndefined();
  });
});
