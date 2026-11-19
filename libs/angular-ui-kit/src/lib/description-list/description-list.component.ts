import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
} from '@angular/core';
import { BadgeComponent, type BadgeVariant } from '@lifecorner/angular-ui-kit/badge';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_EXTERNAL_LINK } from '@lifecorner/angular-ui-kit/icons';

/**
 * Emphasis treatment applied to a row's value.
 * - `mono` renders the value in the monospace font (paths, URLs, hashes).
 */
export type DescriptionListEmphasis =
  | 'default'
  | 'strong'
  | 'muted'
  | 'primary'
  | 'mono';

export interface DescriptionListItem {
  /** Label shown on the term side of the row. */
  term: string;
  /** Value shown on the description side of the row. */
  value: string;
  /**
   * Optional qualifying suffix appended after the value on the same line and
   * rendered muted (e.g. a rating grade or "last checked" hint). Wraps if the
   * combined value + suffix exceed the available width.
   */
  valueSuffix?: string;
  /** Optional link — renders the value as an anchor. */
  href?: string;
  /**
   * Opens `href` in a new tab (3.49, finance-intelligence vertraege row 1):
   * `target="_blank"`, `rel="noopener noreferrer"`, a decorative
   * `external-link` icon 4 px after the value's last word (1em, the link's
   * colour, registered by the kit, never alone on a line) and the list's
   * `externalLinkHint` read after the value. Ignored without `href`. In a
   * `clickable` row the row button's name (term and value) includes the hint
   * too.
   * @default false
   */
  external?: boolean;
  /**
   * Machine-readable date or time of the value (ISO 8601, e.g.
   * `2026-10-12T18:05:00+02:00`): renders the value inside
   * `<time datetime>`, so assistive tech and parsers get the exact moment
   * behind „heute 18:05“. Ignored together with `href`.
   */
  datetime?: string;
  /** Optional visual emphasis for the value. @default 'default' */
  emphasis?: DescriptionListEmphasis;
  /**
   * Shows the value as an `lc-badge` (3.36, quellen row 2): rounded, `sm` in
   * an md list, `xs` in an sm list. A `value` that is empty or the same word
   * (trimmed, any case) is not shown; another value stays as text before the
   * badge („1“ [Freigegeben]), and `href` or `datetime` wrap that text only.
   * Term and value stay one `dt`/`dd` pair, read as „term, badge“.
   */
  badge?: string;
  /** Variant of the `badge`, as `lc-badge`. @default 'default' */
  badgeVariant?: BadgeVariant;
  /**
   * Kit icon name (`lc-icon`'s `name`), drawn before the value on its first
   * line, in the value's colour and at the size of its text (1em) (3.46,
   * finance-intelligence kosten row 3). Always decorative (`aria-hidden`), so
   * the value's text must say what the icon shows („6,7 % über Budget“ with
   * `arrow-up`). It is not part of a link and comes before a badge. Register
   * it as for any `lc-icon`.
   * @default undefined
   */
  icon?: string;
  /**
   * The sum item (3.36, app-shell row 2): a rule above and a double rule
   * below (`--color-field-border`), term and value semibold with tabular
   * figures; its `emphasis` is ignored. `totalAriaLabel` is read before its
   * term. Usually the last item.
   * @default false
   */
  total?: boolean;
  /** Optional opaque payload echoed back in `itemClick`. */
  id?: string;
}

export type DescriptionListLayout = 'rows' | 'stacked';
export type DescriptionListSize = 'sm' | 'md';

/**
 * Per-row separator style (applies to the `rows` layout).
 * - `line`    solid hairline under each row (default — unchanged look)
 * - `divider` subtle dashed line, for the dense card look
 * - `none`    no row separator
 *
 * Orthogonal to `leaders`, which draws dotted leaders *between* term and value.
 */
export type DescriptionListSeparator = 'line' | 'divider' | 'none';

/** Counter for generated ids: they follow creation order, so prerendered HTML is the same in every build. */
let nextUniqueId = 0;

/**
 * Description list for key/value metadata (a styled `<dl>`).
 *
 * Features:
 * - `rows` layout: term on the left, value on the right, with an optional
 *   dotted leader line connecting them (the DS2.0 "spec sheet" look).
 * - `rows`: a row that is too narrow is shared — term and value each keep
 *   their width up to half of the free width (row − 32 px); the longer one
 *   wraps in the rest: the term at spaces, the value at spaces or inside an
 *   unbroken string (3.26).
 * - `rows` (3.39): when term and value can't each keep `min(100%, 6em)` (or
 *   their whole text) side by side, the value moves onto its own line,
 *   right-aligned, so an amount like „214.300,00 €“ doesn't break inside.
 *   Terms hyphenate compounds of 12 letters or more (set `lang`).
 * - `stacked` layout: term above value, for narrow columns.
 * - Per-row value emphasis and optional links.
 * - Semantic markup (`<dl>`/`<dt>`/`<dd>`) for accessibility; `clickable`
 *   rows hold a native button (named by term and value) that the keyboard
 *   reaches, and the `dl` keeps its term and value pairs.
 * - 3.36: an item's value as a badge (`badge`, `badgeVariant`), and a sum
 *   item (`total`) with ledger rules, announced with `totalAriaLabel`.
 * - 3.46: a decorative kit icon before an item's value (`icon`), in the
 *   value's colour and size.
 * - 3.49: links that open in a new tab (`external`), with an icon and the
 *   hidden `externalLinkHint`.
 *
 * @example
 * ```html
 * <lc-description-list
 *   [items]="[
 *     { term: 'Repository', value: 'example/project', href: '#', emphasis: 'primary' },
 *     { term: 'Access', value: 'Token stored · read only' },
 *     { term: 'Status', value: 'Maintained', emphasis: 'strong' }
 *   ]"
 *   [leaders]="true" />
 * ```
 */
@Component({
  selector: 'lc-description-list',
  standalone: true,
  imports: [BadgeComponent, IconComponent],
  // 3.49: the external link's glyph renders without the app registering it.
  viewProviders: [ɵprovideKitIcons([ICON_EXTERNAL_LINK])],
  templateUrl: './description-list.component.html',
  styleUrls: ['./description-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionListComponent {
  /** Rows to render. */
  readonly items = input.required<readonly DescriptionListItem[]>();

  /**
   * Row layout.
   * - rows: term left / value right (default)
   * - stacked: term above value
   * @default 'rows'
   */
  readonly layout = input<DescriptionListLayout>('rows');

  /**
   * Draw a dotted leader line between term and value. Only applies to the
   * `rows` layout.
   * @default false
   */
  readonly leaders = input<boolean>(false);

  /** Density of the rows. @default 'md' */
  readonly size = input<DescriptionListSize>('md');

  /**
   * Per-row separator style for the `rows` layout. Defaults to `line`, which is
   * identical to the previous behavior. Orthogonal to `leaders`.
   * @default 'line'
   */
  readonly separator = input<DescriptionListSeparator>('line');

  /**
   * Whether rows are interactive. When set, each row holds a native button,
   * named by its term and value, that Tab reaches; Enter, Space and a click
   * anywhere on the row emit `itemClick`. The `dl` keeps its term and value
   * pairs. Set this whenever you handle `itemClick`.
   * @default false
   */
  readonly clickable = input<boolean>(false);

  /**
   * Read before the term of a `total` item and not shown (3.36, app-shell
   * row 2): „Summe“ makes a screen reader read „Summe, Gesamtkosten Ist,
   * 522.530,00 €“. Empty adds nothing.
   * @default ''
   */
  readonly totalAriaLabel = input<string>('');

  /**
   * Visually hidden text read after the value of an `external` link (3.49,
   * as `lc-footer`): „Rahmenvertrag 2026 (öffnet in neuem Tab)“. German:
   * „(öffnet in neuem Tab)“. Empty adds none.
   * @default '(opens in a new tab)'
   */
  readonly externalLinkHint = input<string>('(opens in a new tab)');

  /** Emitted when a row is clicked (or activated via keyboard when `clickable`). */
  readonly itemClick = output<DescriptionListItem>();

  /**
   * The visually hidden start of a total's term: „Summe,“ (3.36). The space
   * after it is the template's (3.39, AC-17: one space, not two).
   */
  protected readonly totalPrefix = computed(() => {
    const label = this.totalAriaLabel().trim();
    return label ? `${label},` : '';
  });

  /**
   * A plain value's text (3.39, AC-17): with no space at the dd's edges, and
   * one before a suffix (the space the suffix always had).
   */
  protected plainValue(item: DescriptionListItem): string {
    const value = item.value ?? '';
    return item.valueSuffix ? `${value} ` : value;
  }

  /**
   * Whether a badge item also shows its `value` as text (3.36, D-2): not when
   * it is empty or the badge's word.
   */
  protected badgeShowsValue(item: DescriptionListItem): boolean {
    const value = (item.value ?? '').trim();
    return value !== '' && value.toLowerCase() !== (item.badge ?? '').trim().toLowerCase();
  }

  /** Generated id prefix, taken once per instance, so later ids don't shift. */
  private readonly uid = `lc-dl-${nextUniqueId++}`;

  /** Id of row `index`'s term (only rendered when `clickable`). */
  protected termId(index: number): string {
    return `${this.uid}-t${index}`;
  }

  /** Id of row `index`'s value (only rendered when `clickable`). */
  protected valueId(index: number): string {
    return `${this.uid}-v${index}`;
  }

  protected readonly hostClasses = computed(() =>
    [
      'lc-dl',
      `lc-dl--${this.layout()}`,
      `lc-dl--${this.size()}`,
      `lc-dl--sep-${this.separator()}`,
      this.leaders() && this.layout() === 'rows' ? 'lc-dl--leaders' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected valueClass(item: DescriptionListItem): string {
    // A total is always strong (3.36): its `emphasis` is ignored. 3.46 (D-7):
    // an icon widens the value's `rows` basis; without one the string is as
    // before. 3.49 (D-3): so does an external link's icon.
    const base = `lc-dl__value lc-dl__value--${item.total ? 'strong' : (item.emphasis ?? 'default')}`;
    const icon = item.icon ? `${base} lc-dl__value--icon` : base;
    return this.isExternal(item) ? `${icon} lc-dl__value--external` : icon;
  }

  /** 3.49: an `external` item with an `href` (without one, `external` is ignored). */
  protected isExternal(item: DescriptionListItem): boolean {
    return !!item.external && !!item.href;
  }

  /**
   * Keydown dispatched on the row itself (a consumer's test, a script). Keys
   * from the row's button or a nested link are theirs: the button's native
   * activation clicks it, and the click bubbles to the row.
   */
  protected onRowKeydown(event: KeyboardEvent, item: DescriptionListItem): void {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.itemClick.emit(item);
    }
  }
}
