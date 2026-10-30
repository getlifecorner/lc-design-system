import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

/**
 * Private custom property the shell writes on `.lc-app-shell` in the browser:
 * the bar's content height. Its CSS fallback is 72 px (4 + 64 + 4 at 100 % text).
 */
const BAR_VAR = '--_lc-app-shell-bar';

/**
 * Where the side navigation sits from 1024 px: `'below-header'` (the header
 * spans the full width, the nav starts below it) or `'full-height'` (the nav
 * runs from the top to the bottom of the viewport, the header beside it).
 */
export type AppShellNavPlacement = 'below-header' | 'full-height';

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
 *   reserves its real height at the end of the page: at least 112 px (16 + 72
 *   + 24) plus the safe-area inset, more when the bar grows with the text size
 *   (measured in the browser; `--lc-app-shell-bottom-clearance` overrides it),
 *   so it never covers content. With the horizon, the bar rests on the land
 *   instead, and the land grows with a taller bar (3.10.1, AS-31).
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
 * `navPlacement="full-height"` (3.14) runs the nav column from the top to the
 * bottom of the viewport (sticky, 100dvh) with the header beside it, from
 * 1024 px; below 1024 px it renders like the default. The DOM and tab order
 * stay header → nav → page → footer, so in full-height the header's controls
 * come before a brand at the top of the nav (banner, then navigation, then
 * content). The land and the footer run under the nav; the footer's content
 * starts at the nav width.
 *
 * CSS hooks (set them on `lc-app-shell` or any ancestor):
 * - `--lc-app-shell-nav-width` — the nav column from 1024 px. Default
 *   `240px` (`248px` from 1440, `280px` from 1920).
 * - `--lc-app-shell-bottom-clearance` — the space kept free for the bottom
 *   bar below 1024 px. Default: the bar's height + 40 px + the inset, at
 *   least `112px` + the inset.
 * - `--lc-app-shell-bg` — the page colour behind everything (the sky).
 *   Default `var(--color-background)`.
 * - `--lc-app-shell-bg-image` — a layer over the page colour. Default
 *   `var(--app-background-image, none)`. A tint, for example:
 *   `linear-gradient(to bottom, var(--color-land-1), var(--color-land-2), var(--color-land-3))`.
 *   The horizon's land still paints over it.
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

  /**
   * Where the side navigation sits from 1024 px. `'below-header'`: the header
   * spans the full width and the nav starts below it. `'full-height'`: the nav
   * runs from the top to the bottom of the viewport, with the header beside
   * it. Below 1024 px both render the same. The DOM and tab order don't change
   * (header, nav, page). CSS only, so it holds before JavaScript runs.
   * `'full-height'` expects a brand block at the top of the rail
   * (`lc-sidenav brandName` or `showLogo`, with a `logoSize` that matches the
   * header's `size`, e.g. both `md`: 64 px) and the header's `showLogo` off.
   * @default 'below-header'
   */
  readonly navPlacement = input<AppShellNavPlacement>('below-header');

  protected readonly shellClasses = computed(() => {
    const classes = ['lc-app-shell'];
    if (this.horizon()) classes.push('lc-app-shell--horizon');
    if (this.navPlacement() === 'full-height') classes.push('lc-app-shell--nav-full-height');
    return classes.join(' ');
  });

  private readonly shell = viewChild.required<ElementRef<HTMLElement>>('shell');
  private readonly barSlot = viewChild.required<ElementRef<HTMLElement>>('barSlot');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Browser only (afterNextRender never runs on the server): follow the
    // bar's content height, so the clearance and the land grow with a bar
    // that grows with the text size (AS-31). Without ResizeObserver, and
    // before this runs, the CSS fallback (72 px → 112 px clearance) holds.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const shell = this.shell().nativeElement;
      const slot = this.barSlot().nativeElement;
      const clear = () => shell.style.removeProperty(BAR_VAR);
      const sizes = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        const height = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        // 0 when the bar is hidden (from 1024 px).
        if (height > 0) shell.style.setProperty(BAR_VAR, `${height}px`);
        else clear();
      });
      let bar: Element | null = null;
      // The bar may come later (`@if (items())` around it) or go again.
      const pick = () => {
        const next = slot.querySelector('.lc-bottom-nav') ?? slot.firstElementChild;
        if (next === bar) return;
        if (bar) sizes.unobserve(bar);
        bar = next;
        if (bar) sizes.observe(bar);
        else clear();
      };
      pick();
      const changes = typeof MutationObserver === 'undefined' ? null : new MutationObserver(pick);
      changes?.observe(slot, { childList: true, subtree: true });
      destroyRef.onDestroy(() => {
        sizes.disconnect();
        changes?.disconnect();
      });
    });
  }
}
