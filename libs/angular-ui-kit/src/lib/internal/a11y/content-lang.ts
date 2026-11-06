import { computed, effect, ElementRef, inject, signal, type Signal } from '@angular/core';

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

/**
 * 3.33 (request 052, 049-n3): `closestLang` of the component's host while
 * `open()` is true, `null` while it is false (so the server never reads the
 * DOM). While open, one `MutationObserver` watches every `lang` attribute of
 * the document, so a host language that changes with the panel open shows
 * without reopening; it is disconnected when the panel closes or the
 * component is destroyed. Call it in the component's injection context (it
 * injects the host element and creates an effect).
 */
export function openPanelLang(open: Signal<boolean>): Signal<string | null> {
  const host: Element = inject(ElementRef).nativeElement;
  const changes = signal(0);
  effect((onCleanup) => {
    const root = host.ownerDocument?.documentElement;
    if (!open() || !root || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => changes.update((n) => n + 1));
    observer.observe(root, { attributes: true, attributeFilter: ['lang'], subtree: true });
    onCleanup(() => observer.disconnect());
  });
  return computed(() => {
    changes();
    return open() ? closestLang(host) : null;
  });
}
