/**
 * Language of a part (WCAG 3.1.2, request 049): an overlay panel rendered
 * under `<body>` cannot inherit its host's `lang` through the DOM, so it takes
 * the host's value explicitly.
 */

/**
 * `lang` of the closest `[lang]` element of `el` (itself included), or `null`.
 * The value is taken as is (`lang=""` is the unknown language, as DOM
 * inheritance gives it). `null` without a DOM `closest` (server DOM).
 */
export function closestLang(el: Element | null | undefined): string | null {
  return typeof el?.closest === 'function' ? (el.closest('[lang]')?.getAttribute('lang') ?? null) : null;
}
