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
  reading measure and one hidden narrative object per chapter.
- A centered read-again panel and a conventional three-item footer.

## Specialized rule alignment

| Skill | Rule | Applied decision |
| --- | --- | --- |
| [`skills/modules/frontend/SKILL.md`](../../skills/modules/frontend/SKILL.md) | One primary action per core screen | The hero CTA stays primary; the "Return to Top" action uses a subtler secondary button |
| [`skills/modules/architecture/SKILL.md`](../../skills/modules/architecture/SKILL.md) | Keep each reusable decision scoped to one boundary | A ghost CTA is added only to the closing boundary, not globally reused |
| [`skills/modules/aesthetic/SKILL.md`](../../skills/modules/aesthetic/SKILL.md) | Show craft evidence instead of claiming luxury | Each chapter pairs its headline with a quiet CSS-only object rather than borrowed brand assets |

## Open locally

```bash
python3 -m http.server 8000 --directory examples/story-lv
```

Then visit <http://localhost:8000>.

- Static HTML/CSS only.
- Header nav, hero, three story chapters, read-again panel, and footer.
- No JavaScript, no network assets, and no accumulated state.

## Narrow verification

```bash
node examples/story-lv/verify.mjs
```

Full-render check:

```bash
node --test examples/story-lv/browser.test.mjs
```

This checks the invariant structure (header, main, footer, named chapters),
three chapter visual anchors, one primary CTA, the intentionally quiet closing
CTA, shared paper / brass design tokens, and absence of remote script or styles.
It does not replace a browser review for color, layout, or focus.

## Verification

| Check | Viewport | Result |
| --- | --- | --- |
| Anchor and landmark integrity | No viewport | Pass |
| Full-render desktop and mobile usability, CTA visibility, article navigation, and overflow | `1440 × 1000` and `390 × 2400` | `node --test examples/story-lv/browser.test.mjs` |
| Static structure, hierarchy, tokens, and remote-script/style absence | No viewport | `node examples/story-lv/verify.mjs` |
