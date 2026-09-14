import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSourceRegistry } from "./sources.mjs";

const maxQueryLength = 160;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}

function staticAsset(pathname) {
  if (pathname === "/") {
    return "/index.html";
  }

  return ["/styles.css", "/app.js"].includes(pathname) ? pathname : null;
}

function normalizeSearchQuery(value) {
  const query = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!query) {
    return null;
  }

  if (query.length > maxQueryLength) {
    return null;
  }

  return query;
}

export function createServiceServer({
  sourceIngest = createSourceRegistry(),
  publicRoot = fileURLToPath(new URL("./web-ui", import.meta.url)),
} = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    if (pathname === "/api/sources") {
      if (request.method !== "GET") {
        sendText(response, 405, "Method Not Allowed");
        return;
      }

      const query = normalizeSearchQuery(url.searchParams.get("query"));
      if (!query) {
        sendJson(response, 400, { message: "A non-empty query of 160 characters or fewer is required." });
        return;
      }

      try {
        const records = await sourceIngest.search(query);
        sendJson(response, 200, { query, records });
      } catch {
        sendJson(response, 500, { message: "Source search failed." });
      }
      return;
    }

    const asset = staticAsset(pathname);
    if (!asset || request.method !== "GET") {
      sendText(response, asset === null ? 404 : 405, asset === null ? "Not Found" : "Method Not Allowed");
      return;
    }

    try {
      const source = await readFile(join(publicRoot, asset));
      response.writeHead(200, {
        "content-type": contentTypes[extname(asset)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(source);
    } catch {
      sendText(response, 404, "Not Found");
    }
  });
}
