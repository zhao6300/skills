import test from "node:test";
import assert from "node:assert/strict";
import { createSourceRegistry } from "./sources.mjs";

function fakeFetch(routes) {
  return async (url) => {
    const route = routes.get(String(url));
    if (!route) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    return typeof route === "function" ? route(url) : route;
  };
}

test("adapts technology and research sources into one contract", async () => {
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
      `https://dev.to/api/articles?tag=${encodeURIComponent(searchQuery)}&per_page=20`,
      {
        ok: true,
        json: async () => [
          {
            id: 101,
            title: "Edge deployment",
            url: "https://dev.to/example/deployment",
            published_at: "2026-01-02T00:00:00Z",
            user: { name: "Grace" },
            description: "Operational practice",
            tag_list: ["engineering"],
            license: "MIT",
            created_at: "2026-01-02T01:00:00Z",
          },
        ],
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
    [
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchQuery)}&limit=20&fields=${encodeURIComponent("paperId,title,abstract,authors,year,url,externalIds,publicationDate,openAccessPdf")}`,
      {
        ok: true,
        json: async () => ({
          data: [
            {
              paperId: "s2-1",
              title: "Edge evidence",
              abstract: "Latency evidence.",
              authors: [{ name: "Alan" }],
              publicationDate: "2026-01-02",
              externalIds: { DOI: "10.1000/example" },
              openAccessPdf: { url: "https://example.com/edge.pdf" },
              url: "https://semanticscholar.org/s2-1",
            },
          ],
          granted_at: "2026-09-01T00:00:00Z",
        }),
      },
    ],
    [
      `https://api.github.com/search/repositories?query=${encodeURIComponent(searchQuery)}&per_page=20`,
      {
        ok: true,
        json: async () => ({
          items: [
            {
              id: 301,
              full_name: "example/edge-runtime",
              html_url: "https://github.com/example/edge-runtime",
              description: "Edge runtime",
              topics: ["runtime"],
              owner: { login: "example" },
              updated_at: "2026-01-02T00:00:00Z",
              license: { spdx_id: "MIT" },
            },
          ],
        }),
      },
    ],
    [
      `https://huggingface.co/api/models?search=${encodeURIComponent(searchQuery)}&limit=20&sort=downloads&direction=-1`,
      {
        ok: true,
        json: async () => [
          {
            modelId: "example/edge-model",
            description: "Edge model",
            tags: ["license:mit", "edge"],
            createdAt: "2026-01-02T00:00:00.000Z",
            author: "example",
            lastModified: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    ],
  ]);
  const registry = createSourceRegistry({ fetch: fakeFetch(routes) });
  const records = await registry.search(searchQuery);
  const bySource = Object.fromEntries(records.map((record) => [record.source, record]));

  assert.equal(records.length, 7);
  assert.equal(bySource["hacker-news"].id, "hacker-news:hn-1");
  assert.equal(bySource["hacker-news"].url, "https://example.com/deployment");
  assert.deepEqual(bySource["hacker-news"].topics, ["news"]);

  assert.equal(bySource["dev-community"].id, "dev-community:101");
  assert.equal(bySource["dev-community"].source_type, "news");

  assert.equal(bySource["openalex"].id, "openalex:W-evidence");
  assert.equal(bySource["openalex"].url, "https://doi.org/10.1000/example");
  assert.equal(bySource["openalex"].summary, "edge deployment efficient");
  assert.deepEqual(bySource["openalex"].topics, ["research", "Computing systems"]);

  assert.equal(bySource["crossref"].id, "crossref:10.1000%2Fexample");
  assert.equal(bySource["crossref"].url, "https://doi.org/10.1000/example");
  assert.equal(bySource["crossref"].summary, "Latency study.");
  assert.deepEqual(bySource["crossref"].topics, ["research", "Computer Science"]);

  assert.equal(bySource["semantic-scholar"].summary, "Latency evidence.");
  assert.equal(bySource["github"].source_type, "code");
  assert.equal(bySource["hugging-face"].source_type, "model");
  assert.equal(bySource["hugging-face"].license, "open");
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

test("passes credentials in headers and not in endpoint URLs", async () => {
  const registry = createSourceRegistry({
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    authTokens: {
      githubToken: "github-secret",
      huggingFaceToken: "hf-secret",
    },
  });

  for (const source of Object.values(registry.sources)) {
    const url = source.endpoint("edge deployment");
    assert.equal(url.includes("github-secret"), false);
    assert.equal(url.includes("hf-secret"), false);
  }

  assert.equal(
    registry.sources.github.authHeaders({ githubToken: "github-secret" }).authorization,
    "Bearer github-secret",
  );
  assert.equal(
    registry.sources["hugging-face"].authHeaders({ huggingFaceToken: "hf-secret" }).authorization,
    "Bearer hf-secret",
  );
});

test("reports the failing source instead of returning partial records", async () => {
  const routes = new Map([
    [
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent("edge deployment")}&tags=story&numericFilters=points%3E0`,
      { ok: true, json: async () => ({ hits: [] }) },
    ],
    [
      `https://dev.to/api/articles?tag=${encodeURIComponent("edge deployment")}&per_page=20`,
      { ok: true, json: async () => [] },
    ],
    [
      `https://api.openalex.org/works?search=${encodeURIComponent("edge deployment")}&per-page=20`,
      { ok: true, json: async () => ({ results: [] }) },
    ],
    [
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent("edge deployment")}&limit=20&fields=${encodeURIComponent("paperId,title,abstract,authors,year,url,externalIds,publicationDate,openAccessPdf")}`,
      { ok: true, json: async () => ({ data: [] }) },
    ],
    [
      `https://api.crossref.org/works?query=${encodeURIComponent("edge deployment")}&rows=20&select=${encodeURIComponent("DOI,title,author,abstract,subject,published,created,deposited,license,URL")}`,
      { ok: false, status: 500, json: async () => ({}) },
    ],
    [
      `https://api.github.com/search/repositories?query=${encodeURIComponent("edge deployment")}&per_page=20`,
      { ok: true, json: async () => ({ items: [] }) },
    ],
    [
      `https://huggingface.co/api/models?search=${encodeURIComponent("edge deployment")}&limit=20&sort=downloads&direction=-1`,
      { ok: true, json: async () => [] },
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

test("reuses the same normalized record identity on refetch", async () => {
  const { normalizeRecord } = await import("./sources.mjs");
  const source = {
    id: "hn-1",
    title: "Deployment signal",
    publishedAt: "2026-01-01",
    type: "news",
  };
  const first = normalizeRecord(source, {
    source: "hacker-news",
    sourceType: "news",
    fetchedAt: "2026-09-01T00:00:00Z",
  });

  source.summary = "Updated after refetch";
  const second = normalizeRecord(source, {
    source: "hacker-news",
    sourceType: "news",
    fetchedAt: "2026-09-02T00:00:00Z",
  });

  assert.equal(second.id, first.id);
  assert.equal(second.title, first.title);
  assert.equal(second.summary, "Updated after refetch");
  assert.equal(second.fetched_at, "2026-09-02T00:00:00Z");
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

test("rejects a normalized record outside the required source-type vocabulary", async () => {
  const { normalizeRecord } = await import("./sources.mjs");
  assert.throws(
    () => normalizeRecord({ id: "unsupported", type: "unsupported" }, { source: "crossref" }),
    /Unsupported source type: unsupported/,
  );
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
