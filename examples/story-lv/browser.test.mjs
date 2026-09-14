import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const executablePath =
  "/root/.cache/browser/chrome-headless-shell-126/chrome-headless-shell-linux64/chrome-headless-shell";
const rootDir = fileURLToPath(new URL(".", import.meta.url));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

function createSiteServer() {
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
  return server;
}

async function openPage({ browser, server, viewport }) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("pageerror", (error) => {
    consoleErrors.push(`${error.name}: ${error.message}`);
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  return { page, consoleErrors };
}

async function expectViewportRendered({ page }) {
  await assert.deepEqual(await page.locator("header.site-header").count(), 1);
  await assert.deepEqual(await page.locator("main#main").count(), 1);
  await assert.deepEqual(await page.locator("footer.site-footer").count(), 1);
  await assert.deepEqual(await page.locator(".chapter").count(), 3);
  await assert.deepEqual(await page.locator(".chapter-figure").count(), 3);

  for (const locator of [".brand", ".site-nav", ".hero-grid", ".primary-cta", ".site-footer"]) {
    assert.equal(await page.locator(locator).isVisible(), true, `${locator} must be visible`);
  }

  const layout = await page.evaluate(() => {
    const shell = document.querySelector(".shell");
    const primaryCta = document.querySelector(".primary-cta");
    const nav = document.querySelector(".site-nav");
    return {
      documentScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      shellLeft: shell.getBoundingClientRect().left,
      shellRight: shell.getBoundingClientRect().right,
      primaryCtaWidth: Math.round(primaryCta.getBoundingClientRect().width),
      primaryCtaHeight: Math.round(primaryCta.getBoundingClientRect().height),
      primaryCtaBackground: getComputedStyle(primaryCta).backgroundColor,
      navHeight: Math.round(nav.getBoundingClientRect().height),
      navColumns: getComputedStyle(nav).display,
      mobile: matchMedia("(max-width: 800px)").matches,
    };
  });

  assert.equal(layout.documentScrollWidth, layout.innerWidth);
  assert.equal(layout.shellLeft >= 0, true);
  assert.equal(layout.shellRight <= layout.innerWidth, true);
  assert.equal(layout.primaryCtaWidth > 120, true);
  assert.equal(layout.primaryCtaHeight > 36, true);
  assert.equal(layout.primaryCtaBackground, "rgb(255, 253, 248)");
  assert.equal(["flex", "inline-flex"].includes(layout.navColumns), true);

  await page.click('.site-nav a[href^="#chapter-i"]');
  await page.waitForURL(/#chapter-i$/);
  await page.waitForFunction(() => {
    const heading = document.querySelector("#chapter-i-title");
    const box = heading.getBoundingClientRect();
    return box.top >= 0 && box.top < window.innerHeight * 0.65;
  });
};

test("desktop and mobile story renders stay usable in a real browser", async () => {
  const server = createSiteServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-gpu", "--headless"],
  });

  try {
    const desktop = await openPage({ browser, server });
    await desktop.page.setViewportSize({ width: 1440, height: 1000 });
    await expectViewportRendered({
      page: desktop.page,
    });
    assert.deepEqual(desktop.consoleErrors, []);

    const mobile = await openPage({ browser, server });
    await mobile.page.setViewportSize({ width: 390, height: 2400 });
    await expectViewportRendered({
      page: mobile.page,
    });
    assert.deepEqual(mobile.consoleErrors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
