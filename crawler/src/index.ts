import { crawl } from "./crawler.js";

console.log("Fix Magazine Crawler");
console.log("====================");
console.log(`Target: https://thefixmagazine.com`);
console.log(`Started: ${new Date().toISOString()}\n`);

const start = Date.now();

crawl()
  .then(() => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\nFinished in ${elapsed}s`);
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error("\nCrawl failed:", err);
    process.exit(1);
  });
