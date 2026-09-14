import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServiceServer } from "./server.mjs";

const executablePath = "/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell";
const publicRoot = fileURLToPath(new URL("./web-ui", import.meta.url));
const sourceIngest = {
  search: async () => [
    {
      id: "hacker-news:1",
      source: "hacker-news",
      source_type: "news",
      title: "Edge deployment",
      url: "https://example.com/edge",
      published_at: "2026-01-01",
      authors: ["Ada"],
      summary: "Deployment evidence.",
      topics: ["edge"],
      license: "provider",
      fetched_at: "2026-09-01T00:00:00Z",
    },
  ],
};

test("source UI renders data and keeps mobile/desktop layouts usable", async () => {
  const server = createServiceServer({ sourceIngest, publicRoot });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = new URL(`http://127.0.0.1:${server.address().port}/`);
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-gpu", "--headless"],
  });
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 2400 }]) {
      const page = await browser.newPage({ viewport });
      const consoleErrors = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(base.href, { waitUntil: "networkidle" });
      await page.locator("#query").fill("edge deployment");
      await page.click("#search-form button");
      await page.waitForSelector("#records article");
      assert.equal(await page.locator(".record").count(), 1);
      assert.match(await page.locator(".record h2").textContent(), /Edge deployment/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
      assert.deepEqual(consoleErrors, []);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
