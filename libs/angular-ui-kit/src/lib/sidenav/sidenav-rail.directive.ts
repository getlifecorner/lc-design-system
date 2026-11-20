import { Directive, TemplateRef, inject } from '@angular/core';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/** Context of an `lcSidenavRail` template (3.51, request 072, backlog 071-n5). */
export interface SidenavRailContext {
  /** The entries the rail would draw: `railItems`, else `items`, by `displayOrder`. */
  $implicit: readonly NavigationItem[];
  /**
   * The rail's current entry: by the `railItems` rules (the first with
   * `current`, else by route); for `items` the current link at any depth.
   * `null`: none.
   */
  current: NavigationItem | null;
  /** The rail's width in px (the host's `--lc-sidenav-rail-width`; 56 on the server). */
  railWidth: number;
}

/**
 * Draws the docked, collapsed rail's navigation of an `lc-sidenav` (3.51,
 * request 072, backlog 071-n5) instead of `railItems` / `items`, inside the
 * rail's `<nav>` (same name, `ariaLabel`): a column, centred, 2 px apart. The
 * brand, `[sidenav-rail-top]` and the collapse button stay; expanded and in
 * the drawer `items` show as before. Put the class `lc-sidenav__rail-item` on
 * each link or button for the rail's look: 44 × 44 px, centred content, the
 * rail's ink, hover fill, focus ring, the current look on
 * `aria-current="page"` or `"true"`, and the label tooltip from
 * `data-tooltip` (name each control; a name must contain the visible text,
 * WCAG 2.5.3: initials „EM“ → „EM, Einkauf München“). The kit's rules weigh
 * one class plus the state, so an app class wins. Not with `railGroupMenu`
 * (the template wins).
 *
 * @example
 * ```html
 * <lc-sidenav mode="docked" [collapsed]="true" [items]="items">
 *   <ng-template lcSidenavRail let-entries let-current="current">
 *     @for (entry of entries; track entry.id) {
 *       <a class="lc-sidenav__rail-item" [routerLink]="entry.route" [attr.aria-label]="entry.label"
 *          [attr.data-tooltip]="entry.label" [attr.aria-current]="entry === current ? 'page' : null">
 *         <lc-icon [name]="entry.icon" size="sm" [decorative]="true" />
 *       </a>
 *     }
 *   </ng-template>
 * </lc-sidenav>
 * ```
 */
@Directive({
  selector: 'ng-template[lcSidenavRail]',
  standalone: true,
})
export class SidenavRailDirective {
  public readonly template = inject<TemplateRef<SidenavRailContext>>(TemplateRef);

  /** Types the template's context (`let-entries`, `let-current`, `let-railWidth`) in strict templates. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the type predicate is the guard's whole job
  static ngTemplateContextGuard(_dir: SidenavRailDirective, ctx: unknown): ctx is SidenavRailContext {
    return true;
  }
}
