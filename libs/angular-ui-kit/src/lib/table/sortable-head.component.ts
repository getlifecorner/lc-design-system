import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ariaSortOf, nextSortDirection } from './sort-state';
import type { SortEvent, TableColumnAlign, TableSize, TableSortDirection } from './table.component';

/**
 * A header cell outside `lc-table` with its look, arrow, `aria-sort` and keys
 * (3.45, usm-x row 33): for a table the app draws itself. Put it on a `<th>`;
 * the cell's content is the label.
 *
 * The app owns the state: bind `sortDirection` of this column (`null` when
 * another column is sorted). A click, Enter or Space emits `sortChange` with
 * the next direction (`asc`, unless the column is `asc` already), as
 * `lc-table`'s head does. `sortable="false"` gives the look only (no tab stop,
 * no `aria-sort`).
 *
 * Accessibility: a sortable cell is a keyboard stop (`tabindex="0"`) with
 * `aria-sort` while sorted; the arrow is hidden and the state is read as
 * visually hidden text after the label („Name, sorted ascending“), from
 * `sortedAscendingLabel` / `sortedDescendingLabel`.
 *
 * @example
 * ```html
 * <th lcSortableHead="name" scope="col" [sortDirection]="sort().column === 'name' ? sort().direction : null"
 *     (sortChange)="sort.set($event)">Name</th>
 * ```
 */
@Component({
  selector: 'th[lcSortableHead]',
  standalone: true,
  templateUrl: './sortable-head.component.html',
  styleUrl: './sortable-head.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-sortable-head',
    '[class.lc-sortable-head--sortable]': 'sortable()',
    '[class.lc-sortable-head--sorted]': 'sorted()',
    '[class.lc-sortable-head--end]': "align() === 'end'",
    '[class.lc-sortable-head--sm]': "size() === 'sm'",
    '[class.lc-sortable-head--lg]': "size() === 'lg'",
    '[attr.aria-sort]': 'sorted() ? ariaSort() : null',
    '[attr.tabindex]': 'sortable() ? 0 : null',
    '(click)': 'onActivate()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SortableHeadComponent {
  /**
   * The column key, sent back in `sortChange`.
   * @default ''
   */
  readonly lcSortableHead = input<string>('');

  /**
   * This column's sort state; `null` when it is not sorted.
   * @default null
   */
  readonly sortDirection = input<TableSortDirection | null>(null);

  /**
   * `false`: the header look only (no tab stop, no `aria-sort`, no arrow, no event).
   * @default true
   */
  readonly sortable = input<boolean>(true);

  /**
   * `end`: the label at the end edge with tabular figures and the arrow before it, as an `align: 'end'` column of `lc-table`.
   * @default 'start'
   */
  readonly align = input<TableColumnAlign>('start');

  /**
   * Padding and type size of `lc-table`'s sizes.
   * @default 'md'
   */
  readonly size = input<TableSize>('md');

  /**
   * Screen-reader state of the column sorted ascending.
   * @default 'sorted ascending'
   */
  readonly sortedAscendingLabel = input<string>('sorted ascending');

  /**
   * Screen-reader state of the column sorted descending.
   * @default 'sorted descending'
   */
  readonly sortedDescendingLabel = input<string>('sorted descending');

  /** The column key and the next direction, on click, Enter or Space. */
  readonly sortChange = output<SortEvent>();

  /** Whether the arrow and the state show. */
  protected readonly sorted = computed(() => this.sortable() && this.sortDirection() !== null);

  protected readonly ariaSort = computed(() => ariaSortOf(this.sortDirection()));

  /** The hidden state text, led by a space so it reads apart from the label. */
  protected readonly stateText = computed(
    () => ' ' + (this.sortDirection() === 'asc' ? this.sortedAscendingLabel() : this.sortedDescendingLabel()),
  );

  protected onActivate(): void {
    if (!this.sortable()) return;
    this.sortChange.emit({ column: this.lcSortableHead(), direction: nextSortDirection(this.sortDirection()) });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.sortable() || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    this.onActivate();
  }
}
