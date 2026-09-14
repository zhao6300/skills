# Source ingest contract example

This example demonstrates the normalized ingestion contract from
[`skills/modules/sources/SKILL.md`](../../skills/modules/sources/SKILL.md). The
Hacker News, OpenAlex, and Crossref adapters read official JSON APIs and turn
each response into the common record shape without losing the source-specific
intermediate payload.

## Source policy

| Source | Access | Identity | Canonical URL |
| --- | --- | --- | --- |
| Hacker News | HN Algolia JSON API | `hn-{objectID}` | Discussion URL when no story URL exists |
| OpenAlex | Official JSON API | OpenAlex work ID | DOI URL when available |
| Crossref | Official DOI metadata API | DOI | DOI URL |

Publication date is nullable, and the normalized contract has exactly one
publication date instead of exposing every source-specific date field.

## Focused verification

```bash
node --test examples/source-ingest/sources.test.mjs
```

## Covered behavior

1. Hacker News, OpenAlex, and Crossref produce the same contract.
2. OpenAlex inverted abstract tokens are restored to publication order.
3. Empty queries reject before any network request.
4. A source HTTP failure rejects the entire request instead of silently returning partial data.
5. Missing publication dates are accepted and represented as `null`.
6. DOI values, including URL forms, normalize to one canonical URL.
