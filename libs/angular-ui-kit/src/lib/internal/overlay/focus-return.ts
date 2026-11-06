/**
 * What a custom-element `returnFocusTo` host (`<lc-button>`) hands the focus
 * to when it can't take it itself.
 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Gives the focus to an overlay's `returnFocusTo` element (3.34 in
 * `lc-modal`, shared since 3.35 with `lc-drawer` and `lc-sidenav`). A
 * custom-element host that can't take focus (`<lc-button>`) hands it to its
 * first focusable descendant. An element that can't take focus at all leaves
 * the focus where it is.
 */
export function focusReturnTarget(target: HTMLElement): void {
  target.focus();
  if (target.ownerDocument.activeElement !== target && target.localName.includes('-')) {
    target.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }
}
