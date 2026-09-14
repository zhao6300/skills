# Source ingestion skill

## Use

Use this skill when a change adds or updates ingestion of public technology,
research, news, code, model, dataset, grant, or patent data.

Do not use it for:

- The public API contract once source data becomes a product surface; use [`modules/api`](../api/SKILL.md).
- General service scheduling, timeouts, and failure handling; use [`modules/backend`](../backend/SKILL.md).
- Storage schema, migration, and rollback rules; use [`modules/data`](../data/SKILL.md).

## Required definition

Before implementation, write one row per source:

| Field | Definition |
| --- | --- |
| Source identity | Stable `source_id` and natural name |
| Product need | The decision, view, or alert it supports |
| Access | Official API, RSS/Atom, export, or bulk download |
| Auth and rate | Required key, quota, pagination, retry policy, and `Retry-After` |
| Normalized shape | The common item contract after the adapter |
| Identity and dedup | `source:external_id`, canonical URL, and fingerprint |
| Update policy | One shot, scheduled, evented, or manual |
| License and terms | What may be stored, displayed, transferred, or summarized |
| Verification | Command, fixture, or live check proving a usable record |

## Normalized record contract

Keep the external shape and product-facing shape separate.

```json
{
  "id": "{source_id}:{external_id}",
  "source": "{source_id}",
  "source_type": "news|paper|code|model|dataset|grant|patent",
  "title": "...",
  "url": "...",
  "published_at": "ISO-8601",
  "authors": [],
  "summary": "...",
  "topics": [],
  "license": "provider|open|attribution|internal-only",
  "fetched_at": "ISO-8601"
}
```

Rules:

1. `id` is stable across refreshes and safe to persist.
2. `title`, `url`, `summary`, `authors`, and `topics` may be `null` only when the source has no such field.
3. Source-specific metadata outside the common shape stays in a typed adapter payload.
4. Canonical links are normalized before the database write.
5. License is recorded at ingestion time, not inferred during presentation.

## Adapter boundary

1. One source has one adapter.
2. Fetching, encoding handling, source validation, normalization, and persistence remain inspectable.
3. Network calls have timeouts and bounded retry.
4. Duplicate fetches are idempotent.
5. Partial failure leaves records tagged stale or missing, not silently incomplete.
6. Source policy questions are resolved before automation, not after.

## Verification

Run at least:

1. One live or fixture-backed success that produces the normalized shape.
2. One rate-limit, missing record, or unauthorized-source failure.
3. One duplicate fetch proving idempotency.
4. One schema/shape check against a realistic source payload.
5. One stale/refetch comparison proving the update path.
