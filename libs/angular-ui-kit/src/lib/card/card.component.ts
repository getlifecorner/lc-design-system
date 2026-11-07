import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  HostListener,
  computed,
  effect,
  isDevMode,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, type Params } from '@angular/router';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHEVRON_DOWN } from '@lifecorner/angular-ui-kit/icons';

/** Visual variant of `lc-card`. */
export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'raised' | 'dashed';

/** Heading level of `lc-card`'s built-in title. */
export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;

/** Layout of `lc-card`'s `[card-footer]` slot: `default` (a flex row, end-aligned) or `equal` (children at equal width). */
export type CardFooterLayout = 'default' | 'equal';

/** Counter for generated ids (3.36): creation order, so prerendered HTML is the same in every build. */
let nextCardId = 0;

/** Whether a `route` value is a link: `''`, `null` and `undefined` are not. */
function hasRoute(route: string | readonly unknown[] | null | undefined): boolean {
  return route !== '' && route !== null && route !== undefined;
}

/**
 * Card component for content grouping and visual hierarchy.
 *
 * Features:
 * - Variant styles (elevated, outlined, flat, raised, dashed)
 * - Configurable padding (none, xs, sm, md, lg)
 * - Border radius options (none, sm, md, lg, xl, full)
 * - Optional title display, with an optional leading icon tile
 * - Content projection for flexible body content
 * - Link mode (3.24): `href` or `route` make the whole card a real link,
 *   the title stays a heading
 * - Equal footer (3.29): `footerLayout="equal"` gives two answers of equal
 *   weight in the `[card-footer]` slot the same width
 * - Collapsible (3.36): `collapsible` with `[(expanded)]` turns the head into
 *   one toggle that opens and closes the body and footer
 *
 * @example
 * ```html
 * <lc-card title="Card Title" variant="elevated" padding="md">
 *   <p>Card body content</p>
 * </lc-card>
 *
 * <!-- With a leading brand-tile icon in the header -->
 * <lc-card title="Repository" subtitle="Checkout &amp; profile" icon="git-branch">
 *   ...
 * </lc-card>
 *
 * <!-- An overview card that opens a page: heading h2 with a link inside -->
 * <lc-card title="SAP-Ist" variant="outlined" [headingLevel]="2"
 *          [route]="['/quellen', 'sap-ist']" [queryParams]="{ ansicht: 'laeufe' }">
 *   ...
 * </lc-card>
 *
 * <!-- Two answers of equal weight (3.29): primary answer first -->
 * <lc-card title="Netflix" variant="outlined" footerLayout="equal">
 *   ...
 *   <div card-footer>
 *     <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
 *     <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
 *   </div>
 * </lc-card>
 * ```
 */
@Component({
  selector: 'lc-card',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, RouterLink],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.lc-card--footer-equal]': "footerLayout() === 'equal'",
    '[class.lc-card--collapsed]': 'isCollapsible() && !expanded()',
  },
  viewProviders: [ɵprovideKitIcons([ICON_CHEVRON_DOWN])],
})
export class CardComponent {
  /**
   * Optional title rendered as a styled header.
   * For complex headers (e.g. title + action button), use content projection instead.
   */
  title = input<string | undefined>(undefined);

  /**
   * Optional subtitle rendered below the title.
   */
  subtitle = input<string | undefined>(undefined);

  /**
   * Optional leading icon (Tabler icon name) rendered as a teal brand tile to
   * the left of the title. Only shown when `title` is set.
   */
  icon = input<string | undefined>(undefined);

  /**
   * Visual treatment of the leading icon tile.
   * - brand: gradient teal tile with light ink (default)
   * - subtle: translucent surface tile with brand-teal ink
   * @default 'brand'
   */
  iconVariant = input<'brand' | 'subtle'>('brand');

  /**
   * Size of the leading icon tile.
   * - md: 2.25rem tile (default)
   * - sm: compact ~1.75rem chip for dense card headers
   * @default 'md'
   */
  iconSize = input<'sm' | 'md'>('md');

  /**
   * Optional badge text/count shown next to the title (e.g. item count).
   * For a richer status badge (e.g. a leading status dot), project an
   * `lc-badge` into the `card-badge` slot instead — the slot takes precedence.
   */
  badge = input<string | undefined>(undefined);

  /**
   * Badge color variant.
   * @default 'default'
   */
  badgeVariant = input<'default' | 'primary' | 'success' | 'warning' | 'error'>('default');

  /**
   * Visual variant of the card
   * - elevated: Box shadow (default)
   * - outlined: Border only (the hairline `--color-border`, no shadow) — the
   *   content card on the "Weite" sky with `borderRadius="xl"`
   * - flat: No shadow or border
   * - raised: plain surface, hairline border and the long, soft
   *   `--shadow-auth-card`, no accent line — the sign-in card
   * - dashed: the muted "coming soon" tile — `--color-muted-tile` fill, 1 px
   *   dashed `--color-muted-tile-border`, secondary ink, icons in
   *   `--color-muted-tile-icon`. Never clickable: `clickable` is ignored;
   *   `href` and `route` are ignored too
   * @default 'elevated'
   */
  variant = input<CardVariant>('elevated');

  /**
   * Padding inside the card
   * @default 'md'
   */
  padding = input<'none' | 'xs' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Whether the card is clickable (hover effects, cursor pointer). Has no
   * effect on a link card (`href`/`route`).
   * @default false
   */
  clickable = input<boolean>(false);

  /**
   * Whether the card is selected (if clickable)
   * @default false
   */
  selected = input<boolean>(false);

  /**
   * Border radius size: `none`, `sm`, `md`, `lg` (18 px), `xl` (24 px, the
   * "Weite" content card) or `full`.
   * @default 'md'
   */
  borderRadius = input<'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  /**
   * Heading level of the built-in `title` (`h2`–`h6`), so the card fits the
   * page's outline. Semantics only, the look stays the same.
   * @default 3
   */
  headingLevel = input<CardHeadingLevel>(3);

  /**
   * Accessible name. On a link card (`href`/`route`) it names the link
   * instead of the card; it must contain the visible title (WCAG 2.5.3) and
   * the heading reads it too, so keep it short. Without it the link is named
   * by the title, and the card's content (badge, list) is read as normal
   * content. On other cards it labels the card.
   * @default undefined
   */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * URL the card links to (3.24, quellen row 1). The card becomes a real
   * link: the built-in `title` is an `<a href>` inside its heading, and the
   * link covers the whole card (click, Enter, middle click, "open in new
   * tab", "copy link"). No router needed; works in prerendered HTML. Wins
   * over `route`. Ignored by `dashed`. On a link card `clickable` has no
   * effect and `cardClick` is not emitted.
   * @default undefined
   */
  href = input<string | undefined>(undefined);

  /**
   * In-app route the card links to through the Angular router (`RouterLink`
   * commands: `'/quellen/usm'` or `['/quellen', id]`), relative to the
   * consumer's route, rendered as a real `<a href>` like `href`. Needs the
   * app's router (`provideRouter`); without one, use `href`. `''` and `null`
   * mean no link.
   * @default undefined
   */
  route = input<string | readonly unknown[] | null | undefined>(undefined);

  /**
   * Query parameters of `route`, as `RouterLink`'s `queryParams`
   * (`{ ansicht: 'laeufe' }`). Ignored with `href` (write the query into the
   * URL).
   * @default undefined
   */
  queryParams = input<Params | null | undefined>(undefined);

  /**
   * Layout of the `[card-footer]` slot (3.29, CC-2). `equal`: its children
   * share the row at equal width once the card is at least 480 px (30rem)
   * wide, and stack full width, 8 px apart, below that (the card's own width,
   * at any viewport; long labels wrap inside the buttons, which get the
   * row's height). For two answers of equal weight, put
   * `<lc-button variant="outline" size="lg" [fullWidth]="true">` in it,
   * primary answer first; the card adds layout only (gap, divider and
   * spacing as `default`) and never restyles the buttons. The card becomes a
   * size container and takes its parent's full width. Keep the default
   * `padding` (with `none` the buttons' focus ring is clipped). Works in link
   * cards (the buttons stay clickable above the link) and in prerendered
   * HTML (CSS only).
   * @default 'default'
   */
  footerLayout = input<CardFooterLayout>('default');

  /**
   * The card can close (3.36, regeln row 1): the head (icon, title, subtitle)
   * becomes one toggle, a button inside the title's heading with
   * `aria-expanded` and `aria-controls`, whose hit area is the whole head (at
   * least 44 px high); Enter, Space or a click open and close the body and the
   * `[card-footer]`. A chevron at the end of the head shows the state.
   * `[card-header-action]` stays a separate control beside it. Needs the
   * built-in `title` (otherwise ignored); wins over `clickable`, `href` and
   * `route`, which are then ignored; ignored on `dashed`. Bind `[(expanded)]`.
   * @default false
   */
  collapsible = input<boolean>(false);

  /**
   * Open state of a `collapsible` card (3.36), two-way: `[(expanded)]`. Open
   * by default, so a plain `collapsible` hides nothing; set `false` for a card
   * that starts closed (also in prerendered HTML). Closed, only the head
   * shows: the body is `hidden` and the footer is not displayed.
   * @default true
   */
  readonly expanded = model<boolean>(true);

  /**
   * Emitted when a `clickable` card is clicked or activated with Enter or
   * Space. Not emitted on a link card (`href`/`route`): the link navigates by
   * itself (one navigation); bind the native `(click)` for analytics.
   */
  readonly cardClick = output<MouseEvent>();

  /** Generated id prefix (3.36): creation order, so prerendered HTML is the same in every build. */
  private readonly uid = `lc-card-${nextCardId++}`;

  /** Id of the body a collapsible card's toggle controls. */
  protected readonly bodyId = `${this.uid}-body`;

  /** Id of the subtitle that describes a collapsible card's toggle. */
  protected readonly subtitleId = `${this.uid}-subtitle`;

  /**
   * Whether the card collapses (3.36): `collapsible` with a built-in title,
   * except for the dashed tile.
   */
  protected readonly isCollapsible = computed(
    () => this.collapsible() && !!this.title() && this.variant() !== 'dashed',
  );

  /**
   * How the card links (3.24): `href` wins over `route`; `''`/`null` routes
   * are no link, and the dashed "coming soon" tile never links. A
   * collapsible card (3.36) never links.
   */
  protected readonly linkMode = computed<'href' | 'route' | null>(() => {
    if (this.variant() === 'dashed' || this.isCollapsible()) return null;
    if (this.href()) return 'href';
    return hasRoute(this.route()) ? 'route' : null;
  });

  /**
   * Whether the card acts as a button: `clickable`, except for the dashed
   * "coming soon" tile, which is never interactive, a link card, whose
   * anchor is the only interactive element, and a collapsible card (3.36),
   * whose toggle is.
   */
  protected isClickable = computed(
    () => this.clickable() && this.variant() !== 'dashed' && !this.linkMode() && !this.isCollapsible(),
  );

  /** Opens or closes a collapsible card; `expandedChange` emits the new state. */
  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }

  /** `ariaLabel` on the card; on a link card it names the anchor instead. */
  protected readonly cardAriaLabel = computed(() => (this.linkMode() ? undefined : this.ariaLabel()));

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (!this.collapsible() || this.variant() === 'dashed') return;
        if (!this.title()) {
          console.warn('[lc-card] collapsible needs the built-in title: ignored');
        } else if (this.clickable() || this.href() || hasRoute(this.route())) {
          console.warn('[lc-card] collapsible wins over clickable, href and route: they are ignored');
        }
      });
      effect(() => {
        if (!this.linkMode()) return;
        if (this.href() && hasRoute(this.route())) {
          console.warn('[lc-card] href and route are both set: href wins');
        }
        if (!this.title() && !this.ariaLabel()) {
          console.warn('[lc-card] a link card without title needs an ariaLabel to name its link');
        }
      });
    }
  }

  /**
   * Compute card CSS classes based on inputs
   */
  protected cardClasses = computed(() => {
    const classes = [
      'card',
      `card-${this.variant()}`,
      `card-padding-${this.padding()}`,
      `card-radius-${this.borderRadius()}`,
    ];

    if (this.isClickable()) {
      classes.push('card-clickable');
    }

    // A link card looks and reacts like a clickable one (3.24).
    if (this.linkMode()) {
      classes.push('card-linked');
    }

    // The dashed tile is never interactive, so it is never selected either.
    if (this.selected() && this.variant() !== 'dashed') {
      classes.push('card-selected');
    }

    // A collapsible card (3.36), and its closed state.
    if (this.isCollapsible()) {
      classes.push('card-collapsible');
      if (!this.expanded()) classes.push('card-collapsed');
    }

    return classes.join(' ');
  });

  /**
   * Compute ARIA role based on clickable state
   */
  protected role = computed(() => (this.isClickable() ? 'button' : 'article'));

  /**
   * Handle card click events
   */
  protected handleClick(event: MouseEvent): void {
    if (this.isClickable()) {
      this.cardClick.emit(event);
    }
  }

  /**
   * Handle keyboard events for accessibility
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    if (this.isClickable() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      this.cardClick.emit(mouseEvent);
    }
  }
}
