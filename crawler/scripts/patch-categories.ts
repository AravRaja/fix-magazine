/**
 * patch-categories.ts
 *
 * One-off script to backfill parent categories into already-crawled article JSON files.
 * Fetches the WP category hierarchy, then for every article adds any missing ancestor
 * category names (e.g. "Public Talk" → also adds "Visual Art").
 * Rewrites all articles/{slug}.json files and regenerates index.json in place.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "..", "output");
const ARTICLES_DIR = path.join(OUTPUT_DIR, "articles");
const INDEX_FILE = path.join(OUTPUT_DIR, "index.json");
const WP_API = "https://www.thefixmagazine.com/wp-json/wp/v2";

// ── 1. Fetch full category list from WP ───────────────────────────────────────

interface WPCat { id: number; name: string; parent: number; }

async function fetchCategories(): Promise<Map<number, WPCat>> {
  const res = await fetch(`${WP_API}/categories?per_page=100&_fields=id,name,parent`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching categories`);
  const cats = await res.json() as WPCat[];
  return new Map(cats.map(c => [c.id, c]));
}

// ── 2. Resolve a category name to itself + all ancestors ──────────────────────

function withAncestors(name: string, allCatsByName: Map<string, WPCat>, byId: Map<number, WPCat>): string[] {
  // We look up by name since article JSON stores names not IDs
  // Find any category with this name (there may be duplicates; pick the one with a parent)
  const matches = [...byId.values()].filter(c => c.name === name);
  const names = new Set<string>([name]);
  for (const cat of matches) {
    let current = byId.get(cat.parent);
    while (current) {
      names.add(current.name);
      current = current.parent ? byId.get(current.parent) : undefined;
    }
  }
  return [...names];
}

// ── 3. Patch a single article ─────────────────────────────────────────────────

interface Article {
  categories: string[];
  content?: string;
  contentImages?: unknown[];
  [key: string]: unknown;
}

function patchArticle(article: Article, byId: Map<number, WPCat>): { article: Article; changed: boolean } {
  const original = new Set(article.categories);
  const expanded = new Set<string>();
  for (const name of article.categories) {
    for (const ancestor of withAncestors(name, new Map(), byId)) {
      expanded.add(ancestor);
    }
  }
  const changed = [...expanded].some(n => !original.has(n));
  return { article: { ...article, categories: [...expanded] }, changed };
}

// ── 4. Main ───────────────────────────────────────────────────────────────────

const byId = await fetchCategories();
console.log(`Fetched ${byId.size} categories from WP API`);

// Show the hierarchy
const children = [...byId.values()].filter(c => c.parent !== 0);
console.log("\nCategory hierarchy:");
for (const c of children) {
  const parent = byId.get(c.parent);
  console.log(`  ${c.name}  →  ${parent?.name ?? "?"}`);
}
console.log();

const slugs = (await fs.readdir(ARTICLES_DIR))
  .filter(f => f.endsWith(".json"))
  .map(f => f.replace(".json", ""));

let changedCount = 0;

for (const slug of slugs) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  const article = JSON.parse(await fs.readFile(filePath, "utf8")) as Article;
  const { article: patched, changed } = patchArticle(article, byId);
  if (changed) {
    await fs.writeFile(filePath, JSON.stringify(patched, null, 2), "utf8");
    changedCount++;
  }
}

console.log(`Patched ${changedCount} / ${slugs.length} articles`);

// Regenerate index.json (all fields except content + contentImages)
console.log("Regenerating index.json...");
const indexEntries = [];
for (const slug of slugs) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  const article = JSON.parse(await fs.readFile(filePath, "utf8")) as Article;
  const { content: _c, contentImages: _i, ...entry } = article;
  indexEntries.push(entry);
}

// Sort by date descending (same order as crawl)
indexEntries.sort((a, b) => String(b.date).localeCompare(String(a.date)));
await fs.writeFile(INDEX_FILE, JSON.stringify(indexEntries, null, 2), "utf8");
console.log(`index.json updated with ${indexEntries.length} entries`);
