# Aesthetics skill

## Use

Apply this skill when visual hierarchy, brand voice, typography, color, spacing,
motion, or imagery changes what a user notices first.

Do not use it for engineering-only changes where aesthetics is irrelevant.

## Required definition

Before styling a page or component, record:

```markdown
| Route / component | Primary decision | State | Brand axis | Visual constraint |
| --- | --- | --- | --- | --- |
```

`Primary decision` is what the user should choose or understand next.

`Brand axis` can be:

1. Heritage ↔ modern.
2. Quiet ↔ expressive.
3. Craft ↔ product.
4. Editorial ↔ interface.
5. Warm ↔ cool.

## Craft loop

1. Name the one hierarchy this layout should serve.
2. Assign scale, weight, and color to that hierarchy before adding more decoration.
3. Use whitespace to mark what is meant to be read together.
4. Pick a restrained base palette and one accent color per logical zone.
5. Prefer one neutral typographic voice plus at most one display voice.
6. Keep motion reversible and below 240 ms unless it is a meaningful transition.
7. Product imagery should make surface, material, scale, or ownership legible.
8. If a screen is over-designed, remove the least load-bearing decoration first.

## Quality rules

1. One primary action per core viewport.
2. Do not use decoration to hide unclear content structure.
3. Keep brand accents consistent and recognizable.
4. Keep icons, symbols, and imagery from the same visual system.
5. Test the visual at light, dark, narrow, wide, empty, loading, error, and permission states.
6. Let contrast support hierarchy, not replace it.
7. Avoid generic imagery that would work on almost any brand.
8. If a rule conflicts with usability, usability wins.

## Luxury reference patterns

Use [`references/luxury.md`](references/luxury.md) for valuable patterns from
well-known luxury-brand sites. Use
[`references/premium-china.md`](references/premium-china.md) when heritage,
text density, bilingual typography, or Chinese-market product strategy shapes
the design. Avoid direct copying; summarize the reusable craft decision.

## Verification

Capture before launch:

1. Two viewport widths.
2. One core state with the primary action visible.
3. One contrast check for main text and controls.
4. One visual review of the brand axis and hierarchy.
5. One manual check of content that is not decorative filler.

Do not accept design from inspecting the prompt or code alone.
