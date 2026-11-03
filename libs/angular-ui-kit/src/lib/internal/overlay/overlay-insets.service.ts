import { Injectable, signal } from '@angular/core';

/**
 * The space a fixed overlay keeps free at the top and the bottom of the
 * viewport, as CSS lengths (3.28, AS-34). `lc-app-shell` writes them in the
 * browser: `top` is its header's bottom edge, `bottom` the shown bottom bar's
 * top edge, measured from the viewport's bottom (or the safe-area insets when
 * there is no header or no bar). `lc-toast-outlet` reads them, so its stacks
 * clear the header and the bar even when the app renders the outlet outside
 * the shell (no custom property can inherit there).
 *
 * `null` means "no shell": on the server, before the shell has measured,
 * without ResizeObserver and after the shell is destroyed. Internal to the
 * library; not part of the public API and without a semver guarantee.
 */
@Injectable({ providedIn: 'root' })
export class OverlayInsetsService {
  /** CSS length kept free above top-edge overlays, e.g. `'56px'`. */
  readonly top = signal<string | null>(null);

  /** CSS length kept free below bottom-edge overlays, e.g. `'102px'`. */
  readonly bottom = signal<string | null>(null);
}
