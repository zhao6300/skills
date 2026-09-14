# Source ingest contract example

This example demonstrates the normalized ingestion contract from
[`skills/modules/sources/SKILL.md`](../../skills/modules/sources/SKILL.md). The
Hacker News, DEV, OpenAlex, Semantic Scholar, Crossref, GitHub, and Hugging Face
adapters read official JSON APIs and turn each response into the common record
shape without losing the source-specific intermediate payload.

## Source policy

| Source | Access | Identifier | Canonical URL |
| --- | --- | --- | --- |
| Hacker News | HN Algolia JSON API | object ID | discussion URL fallback |
| DEV | Official articles JSON API | article ID | article URL |
| OpenAlex | Official JSON API | OpenAlex work ID | DOI URL when available |
| Semantic Scholar | Graph paper-search JSON API | paper ID | DOI URL when available |
| Crossref | Official DOI metadata API | DOI | DOI URL |
| GitHub Search | Official GitHub REST API | repository ID | repository URL |
| Hugging Face Hub | Official models API | model ID | Hub URL |

Publication date is nullable, and the normalized contract has exactly one
publication date instead of exposing every source-specific date field.

## Focused verification

```bash
node --test examples/source-ingest/sources.test.mjs
```

## Browser UI

Start the local server:

```bash
node examples/source-ingest/server.mjs
```

Then visit <http://127.0.0.1:8787/> and submit a query. The UI reads the same
normalized records with:

```bash
curl "http://127.0.0.1:8787/api/sources?query=edge%20deployment"
```

The search boundary is intentionally simple:

1. Only `GET` is allowed.
2. Only 160-character queries are accepted.
3. No records are stored on the server; live requests are not cached.
4. External source errors fail the whole response rather than returning a
   silent partial list.

## Covered behavior

1. Hacker News, OpenAlex, and Crossref produce the same contract.
2. OpenAlex inverted abstract tokens are restored to publication order.
3. Empty queries reject before any network request.
4. A source HTTP failure rejects the entire request instead of silently returning partial data.
5. Missing publication dates are accepted and represented as `null`.
6. DOI values, including URL forms, normalize to one canonical URL.
7. Unsupported normalized source types are rejected rather than silently mapped to a generic type.
8. Authenticated source tokens go in request headers, never in endpoint URLs.
9. Refetches keep the normalized record identity stable and update `fetched_at`.
10. The web UI fetches `/api/sources`, filters by `source_type`, and keeps a
    visible error state when an external source is unavailable.
