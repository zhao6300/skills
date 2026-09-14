import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const executablePath = "/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell";
const rootDir = fileURLToPath(new URL(".", import.meta.url));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

test("real browser snake loop is playable and visible", async () => {
  const server = createServer(async (request, response) => {
    const pathname = request.url === "/" ? "/index.html" : request.url ?? "/index.html";
    try {
      response.setHeader("Content-Type", contentTypes[extname(pathname)] ?? "application/octet-stream");
      response.end(await readFile(join(rootDir, pathname)));
    } catch {
      response.statusCode = 404;
      response.end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { host, port } = new URL(`http://127.0.0.1:${server.address().port}/`);
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-gpu", "--headless"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(host);
    await page.waitForSelector(".cell.head", { state: "attached" });
    assert.equal(await page.locator(".cell").count(), 5);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".cell.head"), "::after").content), "\"\"");
    assert.equal(await page.locator("[data-role=status]").textContent(), "按开始或方向键");

    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => document.querySelector("[data-role=status]")?.textContent === "进行中");
    assert.equal(await page.locator(".cell").count(), 5);
    assert.equal(await page.locator(".cell.head").count(), 1);
    await page.waitForTimeout(500);
    assert.equal(await page.locator("[data-role=status]").textContent(), "进行中");
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".cell.head"), "::after").content), "\"\"");

    await page.click("[data-role=pause]");
    assert.equal(await page.locator("[data-role=status]").textContent(), "已暂停");
    await page.click("[data-role=restart]");
    assert.equal(await page.locator("[data-role=status]").textContent(), "按开始或方向键");
    await page.keyboard.press("ArrowUp");
    await page.waitForFunction(() => document.querySelector("[data-role=status]")?.textContent === "进行中");
  } finally {
    await browser.close();
    server.close();
  }
});
