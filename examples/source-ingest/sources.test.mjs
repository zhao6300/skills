import test from "node:test";
import assert from "node:assert/strict";
import { createSourceRegistry } from "./sources.mjs";

function fakeFetch(routes) {
  return async (url) => {
    const route = routes.get(String(url));
    if (!route) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    return route;
  };
}

test("adapts Hacker News, OpenAlex, and Crossref into one contract", async () => {
  const searchQuery = "edge deployment";
  const routes = new Map([
    [
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(searchQuery)}&tags=story&numericFilters=points%3E0`,
      {
        ok: true,
        json: async () => ({
          hits: [
            {
              objectID: "hn-1",
              title: "Deployment signal",
              author: "ada",
              created_at: "2026-01-01T00:00:00Z",
              url: "https://example.com/deployment",
            },
          ],
        }),
      },
    ],
    [
      `https://api.openalex.org/works?search=${encodeURIComponent(searchQuery)}&per-page=20`,
      {
        ok: true,
        json: async () => ({
          results: [
            {
              id: "https://openalex.org/W-evidence",
              display_name: "Evidence work",
              publication_date: "2026-01-02",
              doi: "10.1000/example",
              authorships: [{ author: { display_name: "Carol" } }],
              abstract_inverted_index: { efficient: [3], deployment: [2], edge: [0] },
              topics: [{ display_name: "Computing systems" }],
              open_access: { is_oa: true },
              primary_location: { source: { url: "https://journals.example.com/evidence" } },
            },
          ],
        }),
      },
    ],
    [
      `https://api.crossref.org/works?query=${encodeURIComponent(searchQuery)}&rows=20&select=${encodeURIComponent("DOI,title,author,abstract,subject,published,created,deposited,license,URL")}`,
      {
        ok: true,
        json: async () => ({
          message: {
            items: [
              {
                DOI: "10.1000/example",
                title: ["Edge inference"],
                author: [{ name: "Grace" }],
                abstract: "Latency study.",
                subject: ["Computer Science"],
                published: { "date-parts": [[2026, 1, 2]] },
                deposited: { "date-time": "2026-09-01T00:00:00Z" },
                URL: "https://crossref.example.com/not-canonical",
              },
            ],
          },
        }),
      },
    ],
  ]);
  const registry = createSourceRegistry({ fetch: fakeFetch(routes) });
  const [news, openAlex, crossref] = await registry.search(searchQuery);

  assert.equal(news.id, "hacker-news:hn-1");
  assert.equal(news.url, "https://example.com/deployment");
  assert.deepEqual(news.topics, ["news"]);

  assert.equal(openAlex.id, "openalex:W-evidence");
  assert.equal(openAlex.url, "https://doi.org/10.1000/example");
  assert.equal(openAlex.summary, "edge deployment efficient");
  assert.deepEqual(openAlex.topics, ["research", "Computing systems"]);

  assert.equal(crossref.id, "crossref:10.1000%2Fexample");
  assert.equal(crossref.url, "https://doi.org/10.1000/example");
  assert.equal(crossref.summary, "Latency study.");
  assert.deepEqual(crossref.topics, ["research", "Computer Science"]);
});

test("rejects an empty query before making requests", async () => {
  let fetchCalls = 0;
  const fetch = async () => { fetchCalls += 1; };
  await assert.rejects(
    () => createSourceRegistry({ fetch }).search("   "),
    TypeError,
  );
  assert.equal(fetchCalls, 0);
});

test("reports the failing source instead of returning partial records", async () => {
  const routes = new Map([
    [
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent("edge deployment")}&tags=story&numericFilters=points%3E0`,
      { ok: true, json: async () => ({ hits: [] }) },
    ],
    [
      `https://api.openalex.org/works?search=${encodeURIComponent("edge deployment")}&per-page=20`,
      { ok: true, json: async () => ({ results: [] }) },
    ],
    [
      `https://api.crossref.org/works?query=${encodeURIComponent("edge deployment")}&rows=20&select=${encodeURIComponent("DOI,title,author,abstract,subject,published,created,deposited,license,URL")}`,
      { ok: false, status: 500, json: async () => ({}) },
    ],
  ]);

  await assert.rejects(
    () => createSourceRegistry({ fetch: fakeFetch(routes) }).search("edge deployment"),
    /crossref fetch failed with status 500/,
  );
});

test("normalizes both source families into the unified contract", async () => {
  const { normalizeRecord } = await import("./sources.mjs");
  const normalized = normalizeRecord(
    {
      id: "123",
      title: "Example",
      url: "https://example.com",
      published_at: "2026-01-03",
      authors: ["Ada"],
      summary: null,
      topics: ["science"],
      license: "open",
    },
    { source: "openalex", sourceType: "paper" },
  );

  assert.equal(normalized.id, "openalex:123");
  assert.equal(normalized.source_type, "paper");
  assert.deepEqual(normalized.topics, ["research", "science"]);
});

test("preserves a missing publication date", async () => {
  const { normalizeRecord } = await import("./sources.mjs");
  const normalized = normalizeRecord(
    {
      id: "no-date",
      publishedAt: null,
      type: "paper",
    },
    { source: "crossref", sourceType: "paper" },
  );

  assert.equal(normalized.published_at, null);
  assert.equal(normalized.title, null);
  assert.equal(normalized.url, null);
  assert.equal(normalized.summary, null);
  assert.deepEqual(normalized.authors, []);
  assert.deepEqual(normalized.topics, ["research"]);
  assert.equal(normalized.license, "provider");
});

test("normalizes DOI forms without discarding DOI information", async () => {
  const { normalizeRecord } = await import("./sources.mjs");
  const normalized = normalizeRecord(
    {
      id: "10.1234/Example-Draft",
      url: "https://doi.org/10.1234/Example-Draft",
      type: "paper",
    },
    { source: "crossref", sourceType: "paper" },
  );

  assert.equal(normalized.id, "crossref:10.1234%2FExample-Draft");
  assert.equal(normalized.url, "https://doi.org/10.1234/Example-Draft");
});
