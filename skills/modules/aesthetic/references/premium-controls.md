# Premium interactive controls

Use this reference when buttons, menus, nav links, and control colors need to
carry a premium mood.

**Do not copy an individual brand.** Translate the pattern into reusable tokens
and interactions.

## Interaction grammar

| Element | Craft rule |
| --- | --- |
| Color system | One neutral base, one dark anchor, one brand accent. Avoid using an accent as a structural rule. |
| Surfaces | Keep material effects subtle and device-agnostic; let typography and whitespace define the mood. |
| Buttons | Treat text, spacing, and contrast as the primary styling. Add background/border only after the label reads first. |
| Menus | Use consistent spacing, hairline discipline, and label rhythm over heavy chrome. |
| Motion | Use short, reversible transitions when the change is meaningful. |

## Buttons

1. Maintain a consistent radius across the control family.
2. Keep one border weight for the same control family.
3. Prefer a filled button for the primary action and a bordered or ghost variant
   for secondary actions.
4. On hover and focus-visible, change one attribute at a time: background,
   border, or text color.
5. Use no subtle decorative label unless it is also reachable and visible for
   keyboard and screen-reader users.
6. Avoid gradients that obscure contrast or clarify button intent.
7. Familiar controls should be recognizable from texture and spacing, not from
   a generic border.

## Menus

1. Keep primary sections to 3–5 top-level groups.
2. Use consistent label length and rhythm for adjacent items.
3. Make keyboard focus, hover, and tap use the same system of contrast and line.
4. On collapse, keep one visible order and predictable gap between panels.
5. Do not hide the main nav behind a decorative icon—always give each entry a
   text label or accessible label.
6. Avoid a large dropdown when one or two shallow entries are enough.

## Verification

| Check | Evidence |
| --- | --- |
| Contrast | Focus, hover, and pressed states are testable and not controlled by color alone. |
| Keyboard | Primary action, menu, and skip-back navigation are reachable without a mouse. |
| Visual consistency | Screenshots show a consistent control family and label rhythm. |
| Reduced dependence | All primary actions remain usable without decorative extras. |
| Mobile | Menus, buttons, and links still align when the viewport is narrow. |
