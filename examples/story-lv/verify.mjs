import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL(".", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const css = readFileSync(new URL("styles.css", root), "utf8");

assert.match(html, /<header class="site-header">/);
assert.match(html, /<main id="main">/);
assert.match(html, /<footer class="site-footer">/);
assert.match(html, /href="#main"/);
assert.match(html, /id="top"/);
assert.match(css, /--paper:\s*#f6f2ea;/);
assert.match(css, /--serif:\s*"Songti SC"/);

const chapterIds = ["chapter-i", "chapter-ii", "chapter-iii"];
for (const chapterId of chapterIds) {
  assert.match(html, new RegExp(String.raw`<section id="${chapterId}" class="chapter" aria-labelledby="`));
}

assert.equal((html.match(/class="chapter-figure" aria-hidden="true"/g) ?? []).length, 3);
for (const figureObject of ["suitcase", "letter", "arch"]) {
  assert.equal((html.match(new RegExp(`class="figure-object ${figureObject}"`, "g")) ?? []).length, 1);
}
assert.match(css, /\.chapter-figure \{[^}]*overflow: hidden;/s);
assert.match(css, /\.figure-object \{/);
assert.equal((html.match(/class="primary-cta"/g) ?? []).length, 1);
assert.equal((html.match(/class="secondary-cta"/g) ?? []).length, 1);
assert.doesNotMatch(html, /(?:https?:)?\/\/[^"']+\.css/);
assert.doesNotMatch(html, /(?:https?:\/\/|"|')https?:\/\/[^"']+\.(?:js|mjs)/i);
assert.doesNotMatch(html, /<script\b/i);

console.log("story-lv static structure and hierarchy: pass");
