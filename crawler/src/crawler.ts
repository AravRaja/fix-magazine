import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { fetchJson } from "./fetcher.js";
import { parsePost } from "./parsers/post.js";
import { downloadFeaturedImage, downloadContentImages } from "./parsers/media.js";
import type {
  WPPost,
  WPAuthor,
  WPCategory,
  WPTag,
  Article,
  ArticleIndexEntry,
} from "./types.js";

async function ensureOutputDirs(): Promise<void> {
  await fs.mkdir(config.articlesDir, { recursive: true });
  await fs.mkdir(config.imagesDir, { recursive: true });
}

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const url = `${config.apiBase}/${endpoint}?per_page=100&page=1`;
  const { data: firstPage, totalPages } = await fetchJson<T[]>(url);
  const all: T[] = [...firstPage];

  for (let page = 2; page <= totalPages; page++) {
    const pageUrl = `${config.apiBase}/${endpoint}?per_page=100&page=${page}`;
    const { data } = await fetchJson<T[]>(pageUrl);
    all.push(...data);
  }

  return all;
}

async function fetchLookups(): Promise<{
  authorsById: Map<number, WPAuthor>;
  categoriesById: Map<number, WPCategory>;
  tagsById: Map<number, WPTag>;
}> {
  console.log("Fetching authors, categories, and tags...");

  const [authors, categories, tags] = await Promise.all([
    fetchAllPages<WPAuthor>("users"),
    fetchAllPages<WPCategory>("categories"),
    fetchAllPages<WPTag>("tags"),
  ]);

  const authorsById = new Map(authors.map((a) => [a.id, a]));
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const tagsById = new Map(tags.map((t) => [t.id, t]));

  console.log(
    `  Found ${authors.length} authors, ${categories.length} categories, ${tags.length} tags`
  );

  return { authorsById, categoriesById, tagsById };
}

async function fetchAllPosts(): Promise<WPPost[]> {
  console.log("Fetching posts (page 1)...");
  const url = `${config.apiBase}/posts?per_page=${config.postsPerPage}&page=1&_fields=id,slug,date,link,title,content,excerpt,author,featured_media,categories,tags,meta,acf`;
  const { data: firstPage, totalPages } = await fetchJson<WPPost[]>(url);

  console.log(`  Total pages: ${totalPages}`);
  const all: WPPost[] = [...firstPage];

  for (let page = 2; page <= totalPages; page++) {
    console.log(`  Fetching posts page ${page}/${totalPages}...`);
    const pageUrl = `${config.apiBase}/posts?per_page=${config.postsPerPage}&page=${page}&_fields=id,slug,date,link,title,content,excerpt,author,featured_media,categories,tags,meta,acf`;
    const { data } = await fetchJson<WPPost[]>(pageUrl);
    all.push(...data);
  }

  return all;
}

export async function crawl(): Promise<void> {
  await ensureOutputDirs();

  const { authorsById, categoriesById, tagsById } = await fetchLookups();
  const posts = await fetchAllPosts();

  console.log(`\nProcessing ${posts.length} posts...\n`);

  const indexEntries: ArticleIndexEntry[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    process.stdout.write(
      `[${i + 1}/${posts.length}] ${post.slug} ... `
    );

    try {
      const [wpFeaturedImage, contentImages] = await Promise.all([
        downloadFeaturedImage(post.slug, post.featured_media),
        downloadContentImages(post.content.rendered),
      ]);

      // Fall back to first content image if WP featured media not set
      const featuredImage = wpFeaturedImage ?? contentImages[0] ?? null;

      const article: Article = parsePost(
        post,
        authorsById,
        categoriesById,
        tagsById,
        featuredImage,
        contentImages
      );

      // Write individual article file
      const articlePath = path.join(config.articlesDir, `${post.slug}.json`);
      await fs.writeFile(articlePath, JSON.stringify(article, null, 2), "utf8");

      // Add to index (no full content or contentImages)
      const { content: _content, contentImages: _imgs, ...indexEntry } = article;
      indexEntries.push(indexEntry);

      console.log("ok");
      successCount++;
    } catch (err) {
      console.error(`ERROR: ${err}`);
      errorCount++;
    }
  }

  // Write master index
  await fs.writeFile(
    config.indexFile,
    JSON.stringify(indexEntries, null, 2),
    "utf8"
  );

  console.log(`\n--- Crawl complete ---`);
  console.log(`  Articles: ${successCount} succeeded, ${errorCount} failed`);
  console.log(`  Index written to: ${config.indexFile}`);
}
