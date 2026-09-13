# Voyage Atlas editorial story site

This is a self-contained, semantically structured editorial website for the
aesthetic skill. It uses a warm heritage axis without borrowing a real brand's
logo or asset.

## Design decision

| Route / component | Primary decision | State | Brand axis | Visual constraint |
| --- | --- | --- | --- | --- |
| Story site | Move the reader into Chapter I, then continue through shared article rhythm, a closing panel, and a familiar site footer | Default | Heritage → modern editorial | Warm paper palette, serif voice, one brass accent, quiet nav / pill CTA, no brand copying |

## Standard site structure

- Fixed-width `.shell` container shared by the masthead, hero, chapters, closing
  panel, and footer.
- Semantic `header > nav`, `main > section`, and `footer` landmarks.
- A two-column hero pairing the primary headline with a compact table of
  contents.
- Three continuous chapters separated by hairline rules, with an article-width
  reading measure.
- A centered read-again panel and a conventional three-item footer.

## Open locally

```bash
python3 -m http.server 8000 --directory examples/story-lv
```

Then visit <http://localhost:8000>.

- Static HTML/CSS only.
- Header nav, hero, three story chapters, read-again panel, and footer.
- No JavaScript, no network assets, and no accumulated state.

## Verification

| Check | Viewport | Result |
| --- | --- | --- |
| Anchor and landmark integrity | No viewport | Pass |
| Full-page masthead, hero, chapters, panel, footer | `1440 × 3400` | Pass against headless Chrome screenshot |
| Article rhythm and reading measure | `1200 × 1200` | Pass against headless Chrome screenshot |
| Mobile nav, typography, and site shell | `390 × 2400` | Pass against headless Chrome screenshot |
