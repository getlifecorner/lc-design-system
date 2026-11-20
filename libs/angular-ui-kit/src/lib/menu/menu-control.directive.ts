import { Directive, TemplateRef, inject, input } from '@angular/core';
import type { MenuItem } from './menu.component';

/**
 * Context of an `ng-template[lcMenuControl]` (3.50, usm-x row 77): the entry
 * (`let-item`) and the id of the row's label (`let-labelId="labelId"`), for
 * the control's `aria-labelledby`.
 */
export interface MenuControlContext {
  $implicit: MenuItem;
  labelId: string;
}

/**
 * Fills a control row of an `inline` `lc-menu` (3.50, usm-x row 77): put it
 * inside the `lc-menu` and name it like the entry's `MenuItem.control`. The
 * row sits outside `role="menu"` (a radio group, a switch or a toggle group
 * may not be a menu item), with the entry's `label` before the control.
 *
 * @example
 * ```html
 * <lc-menu [inline]="true" [items]="[{ id: 'density', label: 'Dichte', control: 'density' }]">
 *   <ng-template lcMenuControl="density" let-labelId="labelId">
 *     <lc-toggle-group [options]="densities" [(selected)]="density" [ariaLabelledBy]="labelId" [touchTarget]="true" />
 *   </ng-template>
 * </lc-menu>
 * ```
 */
@Directive({
  selector: 'ng-template[lcMenuControl]',
  standalone: true,
})
export class MenuControlDirective {
  /**
   * The `MenuItem.control` name this template fills.
   * @default '' (required)
   */
  readonly lcMenuControl = input.required<string>();

  /** The template the menu renders in the row. */
  readonly template = inject<TemplateRef<MenuControlContext>>(TemplateRef);

  /** Types the template's context (`let-item`, `let-labelId`) in strict templates. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the type predicate is the guard's whole job
  static ngTemplateContextGuard(_directive: MenuControlDirective, context: unknown): context is MenuControlContext {
    return true;
  }
}
