import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const executablePath = "/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell";
const rootDir = fileURLToPath(new URL(".", import.meta.url));
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

test("browser can move and show AI suggestion", async () => {
  const server = createServer(async (request, response) => {
    const path = request.url === "/" ? "/index.html" : request.url ?? "/index.html";
    try {
      response.setHeader("Content-Type", types[extname(path)] ?? "application/octet-stream");
      response.end(await readFile(join(rootDir, path)));
    } catch {
      response.statusCode = 404;
      response.end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--disable-gpu", "--headless"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(await page.locator("[data-role=board] .cell").count(), 90);
  assert.equal(await page.locator('[data-role=status]').textContent(), "Ready");
  assert.equal(await page.locator('.token').count(), 90);
  assert.equal(await page.locator('[data-side="red"].cell').count(), 16);
  assert.equal(await page.locator('[data-side="black"].cell').count(), 16);
  await page.click('[data-x="0"][data-y="9"]');
  await page.waitForFunction(() => document.querySelector('[data-role=status]')?.textContent === "Selected");
  await page.click('[data-x="0"][data-y="8"]');
  await page.waitForFunction(() => document.querySelector('[data-role=turn]')?.textContent === "Black");
  assert.equal(await page.locator('[data-role=status]').textContent(), "Moved");
    assert.equal(Boolean(await page.locator('[data-role="apply suggestion"]').isDisabled()), false);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
