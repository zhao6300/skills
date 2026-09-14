# Technology and research source catalog

Use this reference to select sources by product need. It is not a substitute for the
adapter contract in [`SKILL.md`](SKILL.md). Confirm access rules per source before
automation.

## Technology news and community

| Source | Primary use | Typical shape |
| --- | --- | --- |
| Hacker News | Engineering signal, discussion, community-ranked items | JSON API |
| DEV Community | Developer practice, tutorials, open-source notes | JSON API |
| TechCrunch | Product launches, funding, startup/company news | RSS |
| The Verge | Consumer tech, product and policy context | RSS |
| Wired | Technology, science, culture, and policy stories | RSS |
| Ars Technica | Engineering, security, science, systems coverage | RSS |
| IEEE Spectrum | Engineering and applied-research context | RSS |

## Research papers and structured knowledge

| Source | Primary use | Typical shape |
| --- | --- | --- |
| arXiv | Current computer science, AI, physics, math, materials preprints | Atom/XML |
| OpenAlex | Author, institution, citation, topic, and publication graph | JSON API |
| Semantic Scholar | Paper summaries, citations, related research | JSON API |
| Crossref | DOI-first publication metadata and bibliographic structure | JSON API |
| Europe PMC | Biomedical, life science, and medicine literature | JSON API |
| DBLP | Computer science bibliography and venue query | JSON/XML |
| DOAJ | Open-access journals and metadata | JSON API |
| OpenAIRE | European research output and project linkage | JSON API |

## Code, models, and datasets

| Source | Primary use | Typical shape |
| --- | --- | --- |
| GitHub Search | Implementation, tool, research code, and release activity | REST |
| Hugging Face Hub | AI models, datasets, apps, model releases | REST |
| Zenodo | Research datasets, software, reproducible artifacts | REST |
| Figshare | Research outputs, datasets, figures, code packages | REST |
| OSF | Open-science project structure and preregistration | REST |

## Funding, projects, and patents

| Source | Primary use | Typical shape |
| --- | --- | --- |
| NSF Award Search | Public research project and award fit | REST/API |
| NIH RePORTER | Biomedical project profile and funding metadata | REST |
| UKRI Gateway to Research | United Kingdom research funding and output links | REST/API |
| CORDIS | European Commission-supported projects | REST/API |
| OpenAIRE | Project and output graph with research linkage | REST/API |
| PatentsView | Patent assignee, inventor, and technology trends | REST |

## Selection rules

1. Choose the source that answers the product question first.
2. Prefer official APIs over scraped pages.
3. Prefer sources with explicit terms, stable IDs, and pagination.
4. Use one deep source before adding several shallow alternatives.
5. Avoid unstable HTML-only sources unless there is a documented fallback.

## Recommended starter mix

For a general technology and research watchlist, start with:

1. Hacker News for community-ranked technology signals.
2. DEV Community for practitioner content.
3. arXiv for current research.
4. OpenAlex for scholarly structure.
5. Semantic Scholar for summaries and citation relationships.
6. GitHub Search for implementation and tooling evidence.
7. Hugging Face Hub for AI models and datasets.
