import { config } from "./config.js";

let lastRequestTime = 0;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < config.rateLimitMs) {
    await new Promise((resolve) =>
      setTimeout(resolve, config.rateLimitMs - elapsed)
    );
  }
  lastRequestTime = Date.now();
}

export async function fetchJson<T>(
  url: string,
  attempt = 1
): Promise<{ data: T; totalPages: number }> {
  await rateLimit();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "FixMagazineCrawler/1.0",
        Accept: "application/json",
      },
    });
  } catch (err) {
    if (attempt <= config.maxRetries) {
      const delay = config.retryBaseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Network error fetching ${url} (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchJson<T>(url, attempt + 1);
    }
    throw new Error(`Failed to fetch ${url} after ${config.maxRetries} attempts: ${err}`);
  }

  if (!response.ok) {
    if (attempt <= config.maxRetries && response.status >= 500) {
      const delay = config.retryBaseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `HTTP ${response.status} fetching ${url} (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchJson<T>(url, attempt + 1);
    }
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") ?? "1",
    10
  );
  const data = (await response.json()) as T;
  return { data, totalPages };
}

export async function fetchBinary(url: string, attempt = 1): Promise<Buffer> {
  await rateLimit();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": "FixMagazineCrawler/1.0" },
    });
  } catch (err) {
    if (attempt <= config.maxRetries) {
      const delay = config.retryBaseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchBinary(url, attempt + 1);
    }
    throw new Error(`Failed to fetch binary ${url}: ${err}`);
  }

  if (!response.ok) {
    if (attempt <= config.maxRetries && response.status >= 500) {
      const delay = config.retryBaseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchBinary(url, attempt + 1);
    }
    throw new Error(`HTTP ${response.status} fetching binary ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
