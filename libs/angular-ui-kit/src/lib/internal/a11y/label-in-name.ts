/**
 * Accessible names that contain the visible text (WCAG 2.5.3 Label in Name,
 * AS-33). The containment test follows axe-core 4.14's
 * `label-content-name-mismatch`: both strings are compatibility-decomposed,
 * parentheticals are dropped, the rest is lower-cased and split into words of
 * letters and digits, and the visible text's words must occur as one
 * contiguous run in the name's words.
 */

/**
 * The words of `s` as axe-core 4.14 compares them for Label in Name.
 * `toLowerCase`, not `toLocaleLowerCase`: server and browser must agree.
 */
export function labelWords(s: string): string[] {
  return s
    .normalize('NFKD')
    .replace(/\([^()]*\)/g, ' ')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Whether `needle` occurs in `haystack` as one contiguous run of words. */
export function containsWords(haystack: readonly string[], needle: readonly string[]): boolean {
  return needle.length > 0 && haystack.some((_, i) => needle.every((word, k) => haystack[i + k] === word));
}

/**
 * Accessible name that contains the visible `text` (WCAG 2.5.3): `label`,
 * then `, text`, unless one already contains the other.
 *
 * - Text without letters or digits, or one non-digit character (a symbol or
 *   an icon glyph, which axe reports as "incomplete"): `label`.
 * - The label already contains the text: `label`, unchanged.
 * - An empty label: `text`.
 * - The text contains the label: `text`, so nothing is read twice.
 * - Otherwise `label, text`.
 */
export function nameWithText(label: string, text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  const l = label.trim();
  if (!/[\p{L}\p{N}]/u.test(t) || (Array.from(t).length === 1 && !/\p{N}/u.test(t))) return l;
  const labelW = labelWords(l);
  const textW = labelWords(t);
  if (containsWords(labelW, textW)) return l;
  if (l === '') return t;
  if (containsWords(textW, labelW)) return t;
  return `${l}, ${t}`;
}
