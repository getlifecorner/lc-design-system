import { Directive, input, TemplateRef, inject } from '@angular/core';

/**
 * Directive for defining custom cell templates in the Table component.
 *
 * @example
 * ```html
 * <lc-table [columns]="columns" [data]="data">
 *   <ng-template lcTableCell="status" let-row>
 *     <lc-badge [variant]="row.status">{{ row.status }}</lc-badge>
 *   </ng-template>
 * </lc-table>
 * ```
 *
 * In the `footerRow` (3.36) the same template renders with `footer: true` in
 * its context (`let-footer="footer"`), e.g. to leave out a badge in the sum.
 */
@Directive({
  selector: '[lcTableCell]',
  standalone: true,
})
export class TableCellDirective {
  /** The column key this template applies to */
  readonly columnKey = input('', { alias: 'lcTableCell' });

  public template = inject(TemplateRef<{ $implicit: Record<string, unknown> }>);
}
