import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, type ButtonTone } from '@lifecorner/angular-ui-kit/button';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHEVRON_DOWN } from '@lifecorner/angular-ui-kit/icons';
import { MenuComponent, type MenuItem } from '@lifecorner/angular-ui-kit/menu';

/** Look of `lc-split-button`: the `lc-button` variants that make sense for a group with a default action. */
export type SplitButtonVariant = 'primary' | 'secondary' | 'outline';

/** Size of `lc-split-button`: the `lc-button` sizes `sm`, `md` and `lg`. */
export type SplitButtonSize = 'sm' | 'md' | 'lg';

/** Where the menu opens, as `lc-menu`'s `position`. */
export type SplitButtonMenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

/**
 * Split button (3.44, usm-x row 30): a face that runs the default action and
 * a caret that opens a menu of the other actions, in one outline.
 *
 * - Two real buttons in a `role="group"`, two tab stops. The face is an
 *   `lc-button` (its label is the default content, its icon
 *   `[slot='icon-before']`) and emits `clicked`. The caret is named by
 *   `menuAriaLabel`, has `aria-haspopup="menu"` and `aria-expanded` (also in
 *   prerendered HTML) and opens an `lc-menu` of `items`.
 * - Enter, Space, ArrowDown or ArrowUp on the caret open the menu with its
 *   first item focused; Escape and Tab close it; after an item it closes and
 *   the focus returns to the caret.
 * - Targets: the face as `lc-button`; the caret at least 36 × 35.5 (sm),
 *   44 × 42 (md), 48 × 48.5 px (lg), stretched to the face's height. Each part
 *   draws its own focus ring over its neighbour.
 * - `disabled`: both parts natively disabled. `loading`: the face as
 *   `lc-button loading` (spinner, keeps focus); the caret dims, gets
 *   `aria-disabled` and ignores activation. No `items`: the caret is disabled.
 *
 * @example
 * ```html
 * <lc-split-button variant="outline" size="sm" [items]="saveItems"
 *   menuAriaLabel="Weitere Aktionen" (clicked)="save()" (itemClick)="run($event)">
 *   Speichern
 * </lc-split-button>
 * ```
 */
@Component({
  selector: 'lc-split-button',
  standalone: true,
  imports: [ButtonComponent, MenuComponent, IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_CHEVRON_DOWN])],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // styles the lc-button and lc-menu parts
})
export class SplitButtonComponent {
  /**
   * Actions of the menu behind the caret (`lc-menu` items: icons, danger,
   * disabled items, sections). Empty: the caret is disabled.
   * @default []
   */
  readonly items = input<MenuItem[]>([]);

  /**
   * Look of both parts. `outline` is the default: a toolbar group should not
   * compete with the page's primary action.
   * @default 'outline'
   */
  readonly variant = input<SplitButtonVariant>('outline');

  /**
   * Size of both parts (the `lc-button` sizes; the caret is at least 36, 44
   * or 48 px wide).
   * @default 'md'
   */
  readonly size = input<SplitButtonSize>('md');

  /**
   * Both parts natively disabled.
   * @default false
   */
  readonly disabled = input(false);

  /**
   * The default action is running: the face shows `lc-button`'s spinner and
   * keeps focus (`aria-busy`, `aria-disabled`); the caret dims, gets
   * `aria-disabled` and ignores click, Enter and Space (no spinner).
   * @default false
   */
  readonly loading = input(false);

  /**
   * Accessible name of the caret (German: „Weitere Aktionen“). 3.50 (usm-x
   * row 79): it also names the open menu (`aria-label` on its `role="menu"`).
   * @default 'More actions'
   */
  readonly menuAriaLabel = input('More actions');

  /**
   * Where the menu opens. `bottom-right` puts the panel's end edge at the
   * group's end edge.
   * @default 'bottom-right'
   */
  readonly menuPosition = input<SplitButtonMenuPosition>('bottom-right');

  /**
   * 3.48 (usm-x row 63): colour tone of the `outline` look, passed to the face
   * and the caret (`'primary'`: primary text and border, as `lc-button`
   * `tone`). Other variants ignore it.
   * @default 'neutral'
   */
  readonly tone = input<ButtonTone>('neutral');

  /**
   * 3.48 (usm-x row 63): the face's `accesskey` (as `lc-button`
   * `accessKey`); pair it with `ariaKeyShortcuts`. Empty renders none.
   * @default ''
   */
  readonly accessKey = input('');

  /**
   * 3.48 (usm-x row 63): the face's `aria-keyshortcuts` (e.g. `Alt+O`).
   * Empty renders none.
   * @default ''
   */
  readonly ariaKeyShortcuts = input('');

  /**
   * 3.48 (usm-x row 63): `lc-menu` `size` of the menu (sm beside sm menus).
   * @default 'md'
   */
  readonly menuSize = input<SplitButtonSize>('md');

  /**
   * 3.48 (usm-x row 63): `lc-menu` `minWidth` of the menu.
   * @default '220px'
   */
  readonly menuMinWidth = input('220px');

  /**
   * 3.48 (usm-x row 63): `lc-menu` `maxWidth` of the menu; empty leaves it
   * unbounded.
   * @default ''
   */
  readonly menuMaxWidth = input('');

  /**
   * 3.50 (usm-x row 79): `lc-menu` `maxHeight` of the menu: a CSS length, or
   * `'room'` (the room between the group and the viewport edge picks the side
   * and the height). Empty: the menu's CSS hook `--lc-menu-max-height` (set
   * on the split button or an ancestor), else no cap.
   * @default ''
   */
  readonly menuMaxHeight = input('');

  /** The face was activated (click, Enter, Space); not while disabled or loading. */
  readonly clicked = output<void>();

  /** A menu item was activated; the menu then closes and the focus returns to the caret. */
  readonly itemClick = output<MenuItem>();

  /** Whether the menu is open. */
  protected readonly open = signal(false);

  /** The caret can't open: disabled, or no items. */
  protected readonly caretDisabled = computed(() => this.disabled() || this.items().length === 0);

  /** The caret keeps focus but ignores activation while the face is loading. */
  protected readonly caretInert = computed(() => this.loading() && !this.caretDisabled());

  protected readonly classes = computed(
    () =>
      `lc-split-button lc-split-button--${this.variant()} lc-split-button--${this.size()}` +
      (this.variant() === 'outline' ? '' : ' lc-split-button--filled'),
  );

  /** The chevron: 16 px at sm and md, 20 px at lg. */
  protected readonly chevronSize = computed(() => (this.size() === 'lg' ? 'sm' : 'xs'));

  protected onCaretClick(event: MouseEvent): void {
    if (this.caretInert()) {
      event.preventDefault();
      return;
    }
    this.open.set(!this.open());
  }

  protected onCaretKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter' && event.key !== ' ') return;
    if (this.caretInert()) {
      event.preventDefault();
      return;
    }
    // Enter and Space reach the native click; the arrows open the menu too.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
    }
  }

  protected onItemClick(item: MenuItem): void {
    this.itemClick.emit(item);
    this.open.set(false);
  }

  protected onFaceClick(): void {
    this.clicked.emit();
  }
}
