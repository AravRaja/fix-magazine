import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  baseUrl: "https://thefixmagazine.com",
  apiBase: "https://thefixmagazine.com/wp-json/wp/v2",

  // Rate limiting: ms to wait between HTTP requests
  rateLimitMs: 300,

  // Retry settings
  maxRetries: 3,
  retryBaseDelayMs: 500,

  // Posts per page (WP API max is 100)
  postsPerPage: 100,

  // Output directories
  outputDir: path.resolve(__dirname, "..", "output"),
  articlesDir: path.resolve(__dirname, "..", "output", "articles"),
  imagesDir: path.resolve(__dirname, "..", "output", "images"),
  indexFile: path.resolve(__dirname, "..", "output", "index.json"),
} as const;
