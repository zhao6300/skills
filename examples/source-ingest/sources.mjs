const defaultFetch = globalThis.fetch ?? undefined;

function extractOpenAlexSummary(abstractInvertedIndex) {
  if (!abstractInvertedIndex) {
    return null;
  }

  return Object.entries(abstractInvertedIndex)
    .flatMap(([word, positions]) => positions.map((position) => [position, word]))
    .sort(([left], [right]) => left - right)
    .map(([, word]) => word)
    .join(" ");
}

function normalizeDoi(doi) {
  const value = String(doi ?? "").trim();
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return normalizeDoi(value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, ""));
  }

  return /^10\.\d{4,9}\//.test(value) ? `https://doi.org/${value}` : null;
}

function huggingFaceLicense(model) {
  const tags = model.cardData?.tags ?? model.license_tag ?? model.tags ?? [];
  return tags.some((tag) => String(tag).startsWith("license:")) ? "open" : "provider";
}

const sources = {
  "hacker-news": {
    endpoint: (query) =>
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=points%3E0`,
    adapt: (data) =>
      data.hits.map((hit) => ({
        id: hit.objectID,
        title: hit.title ?? hit.story_title ?? "Untitled post",
        url: hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        publishedAt: hit.created_at,
        authors: hit.author ? [hit.author] : [],
        summary: hit.story_text ?? null,
        topics: [],
        type: "news",
        licenseName: "provider",
        sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        retrievedAt: hit.created_at,
      })),
  },
  "dev-community": {
    endpoint: (query) =>
      `https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=20`,
    adapt: (data) =>
      data.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        publishedAt: item.published_at,
        authors: item.user?.name ? [item.user.name] : [],
        summary: item.description,
        topics: item.tag_list,
        type: "news",
        licenseName: item.license ? item.license : "open",
        sourceUrl: item.url,
        retrievedAt: item.created_at,
      })),
  },
  "openalex": {
    endpoint: (query) =>
      `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=20`,
    adapt: (data) =>
      data.results.map((result) => ({
        id: result.id,
        title: result.display_name,
        url: normalizeDoi(result.doi) ?? result.primary_location?.source?.url ?? result.primary_location?.landing_page_url ?? result.id,
        publishedAt: result.publication_date ?? result.publication_year,
        authors: result.authorships?.map((authorship) => authorship.author.display_name) ?? [],
        summary: extractOpenAlexSummary(result.abstract_inverted_index),
        topics: result.topics?.map((topic) => topic.display_name).filter(Boolean) ?? [],
        type: "paper",
        licenseName: result.open_access?.is_oa ? "open" : "provider",
        sourceUrl: normalizeDoi(result.doi) ?? result.id,
        retrievedAt: result.updated,
      })),
  },
  "crossref": {
    endpoint: (query) =>
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=20&select=${encodeURIComponent("DOI,title,author,abstract,subject,published,created,deposited,license,URL")}`,
    adapt: (data) =>
      data.message?.items?.map((item) => ({
        id: item.DOI,
        title: item.title?.[0] ?? item["container-title"]?.[0],
        url: normalizeDoi(item.DOI) ?? (item.URL && /^https?:\/\//.test(item.URL) ? item.URL : null),
        publishedAt: item.published?.["date-parts"]?.flat().join("-") ?? item.created?.["date-time"],
        authors: item.author?.map((author) => author.name).filter(Boolean) ?? [],
        summary: item.abstract ?? null,
        topics: item.subject ?? [],
        type: "paper",
        licenseName: item.license ? "open" : "provider",
        sourceUrl: normalizeDoi(item.DOI) ?? item.URL,
        retrievedAt: item.deposited?.["date-time"],
      })) ?? [],
  },
  "semantic-scholar": {
    endpoint: (query) =>
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=20&fields=${encodeURIComponent("paperId,title,abstract,authors,year,url,externalIds,publicationDate,openAccessPdf")}`,
    adapt: (data) =>
      data.data?.map((paper) => ({
        id: paper.paperId,
        title: paper.title,
        url: normalizeDoi(paper.externalIds?.DOI) ?? paper.url,
        publishedAt: paper.publicationDate ?? paper.year,
        authors: paper.authors?.map((author) => author.name) ?? [],
        summary: paper.abstract,
        topics: [],
        type: "paper",
        licenseName: paper.openAccessPdf ? "open" : "provider",
        sourceUrl: normalizeDoi(paper.externalIds?.DOI) ?? paper.url,
        retrievedAt: data.granted_at,
      })),
  },
  "github": {
    endpoint: (query) =>
      `https://api.github.com/search/repositories?query=${encodeURIComponent(query)}&per_page=20`,
    authHeaders: ({ githubToken }) =>
      githubToken ? { authorization: `Bearer ${githubToken}` } : {},
    adapt: (data) =>
      data.items?.map((repo) => ({
        id: repo.id,
        title: repo.full_name,
        url: repo.html_url,
        publishedAt: repo.updated_at,
        authors: repo.owner?.login ? [repo.owner.login] : [],
        summary: repo.description,
        topics: repo.topics,
        type: "code",
        licenseName: repo.license?.spdx_id,
        sourceUrl: repo.html_url,
        retrievedAt: repo.updated_at,
      })),
  },
  "hugging-face": {
    endpoint: (query) =>
      `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=20&sort=downloads&direction=-1`,
    authHeaders: ({ huggingFaceToken }) =>
      huggingFaceToken ? { authorization: `Bearer ${huggingFaceToken}` } : {},
    adapt: (data) =>
      data.map((model) => ({
        id: model.modelId,
        title: model.modelId,
        url: `https://huggingface.co/${model.modelId}`,
        publishedAt: model.createdAt ? model.createdAt.slice(0, 10) : null,
        authors: model.author ? [model.author] : [],
        summary: model.description,
        topics: model.tags,
        type: "model",
        licenseName: huggingFaceLicense(model),
        sourceUrl: model.modelId,
        retrievedAt: model.lastModified,
      })),
  },
};

export function normalizeRecord(record, options = {}) {
  if (!record?.id) {
    throw new TypeError("A source record must have an id");
  }

  const { source = record.source, sourceType = record.type ?? "source", fetchedAt = record.retrievedAt } = options;
  const allowedTypes = ["news", "paper", "code", "model", "dataset", "grant", "patent"];
  if (!allowedTypes.includes(sourceType)) {
    throw new TypeError(`Unsupported source type: ${sourceType}`);
  }
  const sourceTypeValue = sourceType;
  const sourceValue = String(source ?? "unknown");
  const identity = externalIdentity(record.id);
  const typeTag = sourceTypeValue === "paper" ? "research" : sourceTypeValue;

  return {
    id: `${sourceValue}:${identity}`,
    source: sourceValue,
    source_type: sourceTypeValue,
    title: coalescePresent(record.title),
    url: coalescePresent(record.url),
    published_at: present(record.publishedAt),
    authors: uniqueStrings(record.authors),
    summary: coalescePresent(record.summary),
    topics: normaliseTopics(record.topics, typeTag),
    license: record.licenseName ?? "provider",
    fetched_at: fetchedAt ?? new Date().toISOString(),
  };
}

function externalIdentity(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new TypeError("A source record must have a non-empty id");
  }

  if (/^https?:\/\//i.test(text)) {
    const url = new URL(text);
    return url.pathname.split("/").filter(Boolean).at(-1) ?? url.searchParams.get("id");
  }

  return text.includes("/") ? encodeURIComponent(text) : text;
}

function coalescePresent(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) {
        return text;
      }
    }
  }

  return null;
}

function present(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function uniqueStrings(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  for (const value of values) {
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) {
        seen.add(text);
      }
    }
  }

  return [...seen];
}

function normaliseTopics(values, typeTag) {
  const topics = uniqueStrings(values);
  return [...new Set([typeTag, ...topics])];
}

export function createSourceRegistry({ fetch = globalThis.fetch ?? undefined, authTokens = {} } = {}) {
  const fetchImpl = fetch ?? defaultFetch;
  if (!fetchImpl) {
    throw new TypeError("createSourceRegistry requires a fetch implementation");
  }

  return {
    sources,
    async search(query) {
      const text = String(query ?? "").trim();
      if (!text) {
        throw new TypeError("A non-empty search query is required");
      }

      const sourceResults = await Promise.all(
        Object.entries(sources).map(async ([source, sourceDefinition]) => {
          const response = await fetchImpl(
            sourceDefinition.endpoint(text),
            sourceDefinition.authHeaders?.(authTokens) ?? {},
          );
          if (!response.ok) {
            throw new Error(`${source} fetch failed with status ${response.status}`);
          }

          const externalRecords = sourceDefinition.adapt(await response.json());
          return externalRecords.map((record) =>
            normalizeRecord(record, {
              source,
              sourceType: record.type,
              fetchedAt: record.retrievedAt,
            }),
          );
        }),
      );

      return sourceResults.flat();
    },
  };
}
