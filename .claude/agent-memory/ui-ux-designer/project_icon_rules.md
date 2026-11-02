---
name: project-icon-rules
description: Rules and measured values for lc-icon inline set, ICON_* constants, kit registration and search-input (request 030)
metadata:
  type: project
---

- An `ICON_*` constant exists only for an inline glyph key; there are no alias-named constants (`magnifying-glass` → `ICON_SEARCH`). `icons.spec.ts` pins the counts (137 at 3.21.1).
- Adding a key to the inline set (`INLINE_TABLER_NAMES` in scripts/generate-icon-names.mjs) means: every kit component drawing it must add it to `ɵprovideKitIcons` (the kit-icons.spec static scan fails otherwise). Apps on `unregistered: 'placeholder'` that draw it themselves must register it, because it was fetched before. The generator adds the filled glyph whenever Tabler has one.
- Under `'placeholder'`, names outside the inline set are still fetched; life-os sees "?" because it serves no Tabler assets.
- Fetched Tabler svgs carry an empty background path, inline ones don't: same pixels, different child count (`ppp` vs `pp`).
- `--icon-size` in component SCSS is dead; lc-icon sizes only via `size`. search-input md: wrapper 42 px high, padding 8/12, gap 8, magnifier 24×24 at +13/+9, field at +45. Magnifier contrast 5.58 (light) / 5.56 (dark).

**Why:** these facts took a full code read in request 030.
**How to apply:** use them for icon requests; re-measure before you rely on the px values.
