import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Horizontal padding of `lc-app-page` (3.15).
 * - `default`: 24 · 32 · 48 · 56 · 72 · 96 px from 0 · 640 · 1024 · 1280 · 1440 · 1920 px.
 * - `header`: `lc-header`'s padding (16 px up to 768 px, 24 px above), so the
 *   content lines up with the header title and the user menu.
 */
export type AppPagePaddingX = 'default' | 'header';

/**
 * Space above `lc-app-page`'s content (3.15).
 * - `default`: 24 · 32 · 48 · 56 · 72 · 112 px by width.
 * - `none` 0, `sm` 8 px, `md` 16 px at every width.
 */
export type AppPagePaddingTop = 'default' | 'none' | 'sm' | 'md';

/**
 * Width of `lc-app-page`'s content from 1280 px (3.28, AS-36).
 * - `default`: the content column, centred, capped at `contentMaxWidth`.
 * - `wide`: the standard column of a page with a right column, the right
 *   column left empty, and `[page-wide]` children running over it, up to
 *   928 px. Below 1280 px, and next to a named right column, as `default`.
 */
export type AppPageContentWidth = 'default' | 'wide';

/**
 * A page inside `lc-app-shell`: the `<main>` landmark with the page's content
 * centred at a reading width, and an optional right column docked to the
 * window's right edge (LK-6).
 *
 * - `<main [id]="mainId">` holds the default slot as a column (24 px apart,
 *   40 px from 1024 px), centred and capped at `contentMaxWidth` (880 px of
 *   content). Side padding 24 · 32 · 48 · 56 · 72 · 96 px at 360 · 640 ·
 *   1024 · 1280 · 1440 · 1920 px.
 * - `[page-aside]` is the right column: an `<aside>` AFTER `<main>` in the DOM,
 *   shown from 1280 px at 360 px (400 from 1440, 460 from 1920; override
 *   with `--lc-app-page-aside-width`), with a tint and a hairline that fade
 *   downwards; inside `lc-app-shell` they start at the top of the window,
 *   behind a transparent header. Below 1280 px it is hidden: show the page's narrow equivalent
 *   inside main instead (e.g. a member row). It renders only with an
 *   accessible name — `asideLabelledby` (the id of its heading) or
 *   `asideAriaLabel`.
 * - `reserveAside` keeps that column from 1280 px — width, tint and hairline —
 *   with no content and no landmark (`aria-hidden="true"`), so a page without
 *   right-column content keeps the same column as a page with one (3.28,
 *   AS-35). A named aside wins.
 * - `contentWidth="wide"` (3.28, AS-36) lays the page out like a page with a
 *   right column, leaves the column empty and untinted, and lets children
 *   marked `[page-wide]` (e.g. a table's wrapper) run over it, up to 928 px;
 *   the other children (the page header, the next-step card) keep the
 *   standard column, so the title doesn't move between pages. Next to a named
 *   aside, and below 1280 px, it renders like `'default'`.
 * - `busy` marks the page as loading: `aria-busy="true"` on `<main>` while a
 *   skeleton stands in for the content (AS-12). No visual change.
 * - `paddingX="header"` lines the content up with `lc-header` (3.15): its
 *   title and its user menu. Combine it with `contentMaxWidth="none"` (or a
 *   page narrower than the cap); centred content doesn't align.
 *   `paddingTop` sets the space above the content (`none`, `sm` 8 px, `md`
 *   16 px), e.g. `md` with `lc-page-header paddingTop="none"` puts the `h1`
 *   16 px below the header.
 *
 * CSS hooks (set them on `lc-app-page` or any ancestor; each wins over the
 * inputs and holds one value at every width):
 * - `--lc-app-page-padding-x`: the side padding (default: `paddingX`).
 *   Per breakpoint, set it inside your own media query:
 *   `lc-app-page { --lc-app-page-padding-x: 16px }` and
 *   `@media (min-width: 1024px) { lc-app-page { --lc-app-page-padding-x: 32px } }`.
 * - `--lc-app-page-padding-top`: the space above the content (default: `paddingTop`).
 * - `--lc-app-page-gap`: the space between the content's children (24 px, 40 px from 1024 px).
 * - `--lc-app-page-aside-width`: the right column (360 px, 400 from 1440, 460 from 1920).
 *
 * @example
 * ```html
 * <lc-app-page asideLabelledby="members-title">
 *   <lc-page-header … />
 *   <lc-next-step-card … />
 *   <section page-aside>
 *     <h2 id="members-title">Mitglieder</h2>
 *     <lc-list [items]="members" />
 *   </section>
 * </lc-app-page>
 * ```
 */
@Component({
  selector: 'lc-app-page',
  standalone: true,
  templateUrl: './app-page.component.html',
  styleUrl: './app-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPageComponent {
  /** Id of the `<main>` element (the skip link's target). */
  readonly mainId = input('main');

  /**
   * Widest the page content gets (CSS length; `none` for no cap). The default
   * keeps lines readable on wide screens: the page gains air, not line length.
   */
  readonly contentMaxWidth = input('880px');

  /** Id of the heading that names the right column (`aria-labelledby`). */
  readonly asideLabelledby = input('');

  /** Accessible name of the right column when it has no visible heading. */
  readonly asideAriaLabel = input('');

  /**
   * Marks the page as loading: `aria-busy="true"` on its `<main>` while
   * `true`, no attribute while `false`. Set it while a skeleton stands in for
   * the content. Screen readers may hold back changes inside a busy region
   * until it clears, so a loading message that must be heard belongs outside
   * `<main>` (for example a `.sr-only` `role="status"` next to the page) or is
   * static text. No visual change.
   * @default false
   */
  readonly busy = input(false);

  /**
   * Horizontal page padding. `'default'`: 24/32/48/56/72/96 px from
   * 0/640/1024/1280/1440/1920 px. `'header'`: the same padding as `lc-header`
   * (16 px up to 768 px, 24 px above, from `--lc-density-padding-md`/`-lg`),
   * so the content lines up with the header title and the user menu. Combine
   * it with `contentMaxWidth="none"` (or a page narrower than the cap).
   * `--lc-app-page-padding-x` wins over both.
   * @default 'default'
   */
  readonly paddingX = input<AppPagePaddingX>('default');

  /**
   * Space above the page content. `'default'`: 24/32/48/56/72/112 px by
   * width. `'none'` 0, `'sm'` 8 px, `'md'` 16 px at every width.
   * `--lc-app-page-padding-top` wins.
   * @default 'default'
   */
  readonly paddingTop = input<AppPagePaddingTop>('default');

  /**
   * Keeps the right column from 1280 px (360 · 400 · 460 px,
   * `--lc-app-page-aside-width`) with its tint and hairline but no content
   * and no landmark (`aria-hidden="true"`, no role), so pages without
   * right-column content share one column with pages that have one. A named
   * aside (`asideLabelledby` / `asideAriaLabel`) wins; `contentWidth="wide"`
   * leaves the column empty and untinted. Below 1280 px nothing shows.
   * @default false
   */
  readonly reserveAside = input(false);

  /**
   * `'wide'`, from 1280 px: the page keeps the standard column of a page with
   * a right column, the column stays empty and untinted, and `[page-wide]`
   * children run over it, up to 928 px (or `contentMaxWidth` when it is not
   * `880px`; `none` means the whole column). The other children keep the
   * standard column. With a named aside, `'wide'` has no effect. Below
   * 1280 px `'wide'` renders like `'default'`.
   * @default 'default'
   */
  readonly contentWidth = input<AppPageContentWidth>('default');

  /** The right column renders only when it has an accessible name. */
  protected readonly hasAside = computed(() => !!(this.asideLabelledby() || this.asideAriaLabel()));

  /** `contentWidth="wide"` takes effect only without a named aside, which it yields to. */
  protected readonly wide = computed(() => this.contentWidth() === 'wide' && !this.hasAside());

  /** The empty, unnamed column (`reserveAside`), unless a named aside or `wide` takes the space. */
  protected readonly reserved = computed(() => this.reserveAside() && !this.hasAside() && !this.wide());

  /**
   * The cap of `[page-wide]` children: `null` keeps the CSS's 928 px (also
   * for the default `contentMaxWidth`), `none` means the whole column.
   */
  protected readonly wideMax = computed(() => {
    if (!this.wide()) return null;
    const max = this.contentMaxWidth();
    if (max === '880px') return null;
    return max === 'none' ? '100vw' : max;
  });

  protected readonly pageClasses = computed(() => {
    const classes = ['lc-app-page'];
    if (this.hasAside() || this.reserveAside() || this.wide()) classes.push('lc-app-page--aside');
    if (this.wide()) classes.push('lc-app-page--wide');
    if (this.paddingX() === 'header') classes.push('lc-app-page--pad-x-header');
    if (this.paddingTop() !== 'default') classes.push(`lc-app-page--pad-top-${this.paddingTop()}`);
    return classes.join(' ');
  });
}
