import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * App shell: the frame around every page of an app — header, side navigation,
 * page, bottom navigation bar, footer and the horizon — laid out for phones
 * first, with the DOCUMENT scrolling (not an inner container), so the iOS
 * status-bar tap, address-bar collapse and pull-to-refresh keep working.
 *
 * Slots (content projection by attribute):
 * - `[shell-header]` — the `lc-header`; scrolls away with the page. Gets the
 *   top, left and right safe-area insets.
 * - `[shell-nav]` — the docked side navigation (`lc-sidenav mode="docked"
 *   [isOpen]="true" width="100%" [mobileBreakpoint]="0"`), shown from
 *   1024 px in a column of 240 px (248 from 1440, 280 from 1920; override
 *   with `--lc-app-shell-nav-width`) and sticky once the header has gone.
 *   An empty slot takes no column.
 * - default — the page, usually an `lc-app-page` (or a `<router-outlet>`
 *   whose pages use one). It spans to the window's right edge, so a page's
 *   right column docks there.
 * - `[shell-bottom-nav]` — the `lc-bottom-nav`, shown below 1024 px. The shell
 *   reserves its height at the end of the page (16 + 72 + 24 px plus the
 *   safe-area inset; `--lc-app-shell-bottom-clearance`), so it never covers
 *   content. With the horizon, the bar rests on the land instead.
 * - `[shell-footer]` — e.g. a compact `lc-footer`; after the page, or with
 *   `horizon` in a row of its own below the horizon, painted in the land's
 *   colour (`--color-land-3`): the land grows by the footer's height, so
 *   `--lc-horizon-land` stays the land above the footer and no page overrides
 *   it (3.9, LK-12).
 * - `[shell-horizon-figure]` — Edu (or any decorative figure) on the horizon
 *   line, left of the sun: `lc-character`, `<img>`, `<picture>` or an element
 *   holding an inline `<svg>`. Projected as a direct child of `.lc-horizon`,
 *   sized and placed by the horizon (`--lc-horizon-figure-size` / `-gap`).
 *   Decorative: the horizon is `aria-hidden`, so give an `<img>` `alt=""` and
 *   nothing focusable. Shown only when `horizon` is on (3.9, AS-29).
 *
 * `horizon` closes the page with the "Weite" horizon (`.lc-horizon` from the
 * kit's styles): full-bleed, below the side navigation and the page, filling
 * the rest of the screen — on Today, the sign-in pages and the shell pages.
 *
 * Needs `<meta name="viewport" content="width=device-width, initial-scale=1,
 * viewport-fit=cover">` for the safe-area insets. Breakpoints are fixed
 * (1024 px side navigation, 1440 / 1920 px widths), so the layout works
 * before JavaScript runs (SSR, prerendering).
 *
 * @example
 * ```html
 * <lc-app-shell [horizon]="isToday()">
 *   <lc-header shell-header variant="transparent" [sticky]="false" … />
 *   <lc-sidenav shell-nav mode="docked" [isOpen]="true" width="100%" [mobileBreakpoint]="0"
 *               variant="transparent" [items]="nav" [activeRoute]="url()" />
 *   <router-outlet />
 *   <lc-bottom-nav shell-bottom-nav variant="floating" [items]="nav" [activeRoute]="url()" />
 * </lc-app-shell>
 * ```
 */
@Component({
  selector: 'lc-app-shell',
  standalone: true,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  /**
   * Close the page with the horizon (`.lc-horizon`): full width, below the
   * side navigation and the page, filling the rest of the screen; the footer
   * (in a row of its own, which adds to the land) and the floating bar rest
   * on its land, and `[shell-horizon-figure]` stands on its line.
   * @default false
   */
  readonly horizon = input(false);

  protected readonly shellClasses = computed(() => {
    const classes = ['lc-app-shell'];
    if (this.horizon()) classes.push('lc-app-shell--horizon');
    return classes.join(' ');
  });
}
