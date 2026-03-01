import fs from "node:fs/promises";
import path from "node:path";
import { fetchBinary } from "../fetcher.js";
import { fetchJson } from "../fetcher.js";
import { config } from "../config.js";
import type { WPMedia, FeaturedImage } from "../types.js";

/**
 * Extract { src, alt } for every <img> in an HTML string.
 * Skips data URIs.
 */
function extractImgTags(html: string): Array<{ src: string; alt: string }> {
  const results: Array<{ src: string; alt: string }> = [];
  const tagRegex = /<img[^>]+>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const tag = tagMatch[0];
    const srcMatch = /\bsrc="([^"]+)"/i.exec(tag);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (src.startsWith("data:")) continue;
    const altMatch = /\balt="([^"]*)"/i.exec(tag);
    results.push({ src, alt: altMatch?.[1] ?? "" });
  }
  return results;
}

/**
 * Download a single image URL to the images dir, using its original basename
 * as the local filename. Resume-safe: skips if already present.
 * Returns the FeaturedImage record, or null on failure.
 */
async function downloadImage(
  remoteUrl: string,
  alt: string
): Promise<FeaturedImage | null> {
  let filename: string;
  try {
    filename = path.basename(new URL(remoteUrl).pathname);
  } catch {
    return null;
  }
  if (!filename) return null;

  const localAbsPath = path.join(config.imagesDir, filename);
  const localRelPath = path.join("images", filename);

  try {
    await fs.access(localAbsPath);
    return { remoteUrl, localPath: localRelPath, alt };
  } catch {
    // not cached yet
  }

  try {
    const buffer = await fetchBinary(remoteUrl);
    await fs.writeFile(localAbsPath, buffer);
  } catch (err) {
    console.warn(`  [warn] Could not download image ${remoteUrl}: ${err}`);
    // Return the record anyway so the URL is preserved
    return { remoteUrl, localPath: localRelPath, alt };
  }

  return { remoteUrl, localPath: localRelPath, alt };
}

/**
 * Download all <img> images found in article HTML content.
 * Returns one FeaturedImage record per image, preserving order.
 */
export async function downloadContentImages(
  html: string
): Promise<FeaturedImage[]> {
  const imgs = extractImgTags(html);
  const results: FeaturedImage[] = [];
  for (const { src, alt } of imgs) {
    // Resolve relative URLs (e.g. /wp-content/...) and validate the host
    let resolvedUrl: string;
    try {
      const parsed = new URL(src, config.baseUrl);
      // Only download images hosted on thefixmagazine.com — skips malformed
      // URLs (e.g. "thefixmagazine.comwp-content/...") and external embeds
      if (!parsed.hostname.endsWith("thefixmagazine.com")) continue;
      resolvedUrl = parsed.href;
    } catch {
      continue;
    }
    const img = await downloadImage(resolvedUrl, alt);
    if (img) results.push(img);
  }
  return results;
}

/**
 * Derive a safe local filename from a URL and slug.
 * e.g. slug="mogwai-at-the-beacon", url ends in "photo.jpg" → "mogwai-at-the-beacon-featured.jpg"
 */
function localFilename(slug: string, remoteUrl: string): string {
  const ext = path.extname(new URL(remoteUrl).pathname) || ".jpg";
  return `${slug}-featured${ext}`;
}

/**
 * Fetch WP media metadata then download the image.
 * Returns a FeaturedImage record, or null if mediaId is 0 / fetch fails.
 */
export async function downloadFeaturedImage(
  slug: string,
  mediaId: number
): Promise<FeaturedImage | null> {
  if (!mediaId) return null;

  let media: WPMedia;
  try {
    const result = await fetchJson<WPMedia>(
      `${config.apiBase}/media/${mediaId}`
    );
    media = result.data;
  } catch (err) {
    console.warn(`  [warn] Could not fetch media ${mediaId} for ${slug}: ${err}`);
    return null;
  }

  const remoteUrl = media.source_url;
  const filename = localFilename(slug, remoteUrl);
  const localPath = path.join(config.imagesDir, filename);

  // Skip download if file already exists (resume-safe)
  try {
    await fs.access(localPath);
    return {
      remoteUrl,
      localPath: path.join("images", filename),
      alt: media.alt_text,
    };
  } catch {
    // File doesn't exist yet — download it
  }

  try {
    const buffer = await fetchBinary(remoteUrl);
    await fs.writeFile(localPath, buffer);
  } catch (err) {
    console.warn(`  [warn] Could not download image ${remoteUrl}: ${err}`);
    return {
      remoteUrl,
      localPath: path.join("images", filename),
      alt: media.alt_text,
    };
  }

  return {
    remoteUrl,
    localPath: path.join("images", filename),
    alt: media.alt_text,
  };
}
