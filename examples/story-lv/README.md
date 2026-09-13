# LV-inspired story specimen

This is a self-contained editorial page for the aesthetic skill, using a warm
heritage axis without borrowing a real brand's logo or asset.

## Design decision

| Route / component | Primary decision | State | Brand axis | Visual constraint |
| --- | --- | --- | --- | --- |
| Story page | Move the reader into Chapter I, then hold one shared editorial grid across the hero and every chapter | Default | Heritage → modern editorial | Warm paper palette, serif voice, one brass accent, quiet nav / pill CTA, no brand copying |

## Open locally

```bash
python3 -m http.server 8000 --directory examples/story-lv
```

Then visit <http://localhost:8000>.

## Scope

- Static HTML/CSS only.
- Top story wayfinding, hero, three story chapters, one footer.
- No JavaScript, no network assets, and no accumulated state.
