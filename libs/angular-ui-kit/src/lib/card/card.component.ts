import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  HostListener,
  computed,
  effect,
  isDevMode,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, type Params } from '@angular/router';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

/** Visual variant of `lc-card`. */
export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'raised' | 'dashed';

/** Heading level of `lc-card`'s built-in title. */
export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;

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
 * ```
 */
@Component({
  selector: 'lc-card',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, RouterLink],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
   * Emitted when a `clickable` card is clicked or activated with Enter or
   * Space. Not emitted on a link card (`href`/`route`): the link navigates by
   * itself (one navigation); bind the native `(click)` for analytics.
   */
  readonly cardClick = output<MouseEvent>();

  /**
   * How the card links (3.24): `href` wins over `route`; `''`/`null` routes
   * are no link, and the dashed "coming soon" tile never links.
   */
  protected readonly linkMode = computed<'href' | 'route' | null>(() => {
    if (this.variant() === 'dashed') return null;
    if (this.href()) return 'href';
    return hasRoute(this.route()) ? 'route' : null;
  });

  /**
   * Whether the card acts as a button: `clickable`, except for the dashed
   * "coming soon" tile, which is never interactive, and a link card, whose
   * anchor is the only interactive element.
   */
  protected isClickable = computed(
    () => this.clickable() && this.variant() !== 'dashed' && !this.linkMode(),
  );

  /** `ariaLabel` on the card; on a link card it names the anchor instead. */
  protected readonly cardAriaLabel = computed(() => (this.linkMode() ? undefined : this.ariaLabel()));

  constructor() {
    if (isDevMode()) {
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
