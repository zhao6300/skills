import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServiceServer } from "./server.mjs";

const publicRoot = fileURLToPath(new URL("./web-ui", import.meta.url));
const sourceIngest = {
  search: async (query) => [
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

async function openServer() {
  const server = createServiceServer({ sourceIngest, publicRoot });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, base: new URL(`http://127.0.0.1:${server.address().port}`).origin };
}

test("serves the UI shell and source API through one service boundary", async () => {
  const { server, base } = await openServer();
  try {
    const pageResponse = await fetch(`${base}/`);
    assert.equal(pageResponse.status, 200);
    assert.match(await pageResponse.text(), /id="search-form"/);

    const stylesheetResponse = await fetch(`${base}/styles.css`);
    assert.equal(stylesheetResponse.status, 200);
    assert.equal(stylesheetResponse.headers.get("content-type"), "text/css; charset=utf-8");

    const apiResponse = await fetch(`${base}/api/sources?query=${encodeURIComponent("edge deployment")}`);
    assert.equal(apiResponse.status, 200);
    assert.deepEqual(await apiResponse.json(), {
      query: "edge deployment",
      records: [
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
    });
  } finally {
    server.close();
  }
});

test("rejects malformed source queries without reaching the ingest layer", async () => {
  const searched = [];
  const guardedSource = {
    search: async (query) => {
      searched.push(query);
      return [];
    },
  };
  const { server, base } = await openServer({ sourceIngest: guardedSource, publicRoot });
  try {
    const emptyResponse = await fetch(`${base}/api/sources?query=`);
    assert.equal(emptyResponse.status, 400);

    const longResponse = await fetch(`${base}/api/sources?query=${encodeURIComponent("too long".repeat(80))}`);
    assert.equal(longResponse.status, 400);
    assert.deepEqual(searched, []);

    const methodResponse = await fetch(`${base}/api/sources`, { method: "PUT" });
    assert.equal(methodResponse.status, 405);
  } finally {
    server.close();
  }
});
