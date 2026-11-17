/**
 * Default categorical palette for the chart family.
 *
 * Every entry is a theme token whose light *and* dark resolutions sit clearly
 * against `--color-surface`: the 500 brand shades and the status defaults flip
 * to their pastel tints in the dark theme, the 700 shades to their light tints,
 * so consecutive hues stay distinguishable on both themes. (The 300 shades and
 * `-light` status tints some charts used before resolve to dark, low-contrast
 * colours on the dark theme, which is why they are not in this list.)
 *
 * Charts fall back to this list when a series/segment brings no `color` of its
 * own; per-item colours always win.
 *
 * 3.37 (request 057, 056 F-1, WCAG 1.4.11): entries 3 and 4 are the status
 * inks, not the status fills. `--color-success-default` measured 2.47–2.72:1
 * and `--color-warning-default` 2.05–2.26:1 on light pages; the inks reach
 * 5.30 and 6.03:1 there (8.40 and 7.65:1 dark). Every entry keeps 3:1 against
 * `--color-background` and `--color-surface` in both themes.
 *
 * 3.45 (request 065, backlog 057-n2): entry 2 is `--color-secondary-graphic`
 * (light `#5a798c`, dark `#7097af`, the 3.23 bar/ring token). The light
 * `--color-secondary-500` measured 2.98:1 on `--color-surface-2` and 2.83:1 on
 * `--color-surface-sunken`; the graphic token reaches 4.42 and 4.20:1 there
 * (4.60 and 5.80:1 dark).
 */
export const CHART_PALETTE: readonly string[] = [
  'var(--color-primary-500)',
  'var(--color-secondary-graphic)',
  'var(--color-text-success)',
  'var(--color-text-warning)',
  'var(--color-error-default)',
  'var(--color-info-default)',
  'var(--color-primary-700)',
  'var(--color-secondary-700)',
];

/** Palette colour for the series/segment at `index`, wrapping around. */
export function chartColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
