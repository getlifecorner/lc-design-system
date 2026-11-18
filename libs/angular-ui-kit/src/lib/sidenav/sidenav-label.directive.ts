import { Directive, TemplateRef, inject } from '@angular/core';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/** Context of an `lcSidenavLabel` template (3.47, usm-x row 46). */
export interface SidenavLabelContext {
  /** The item whose label is drawn. */
  $implicit: NavigationItem;
  /** 1 = a top-level item, +1 per section or group above it. */
  level: number;
  /** The sidenav's `highlight`, trimmed (`''` = none). */
  highlight: string;
}

/**
 * Replaces an `lc-sidenav` item's label text at every level (3.47, usm-x
 * row 46), inside `.lc-sidenav__nav-label` (one line, ellipsis kept). The
 * template must show the label text: it is the link's accessible name. Put
 * nothing interactive in it. The sidenav's `highlight` is not applied; the
 * template gets it in its context.
 *
 * @example
 * ```html
 * <lc-sidenav [items]="items">
 *   <ng-template lcSidenavLabel let-item let-level="level">
 *     <span class="code">{{ item.id }}</span> {{ item.label }}
 *   </ng-template>
 * </lc-sidenav>
 * ```
 */
@Directive({
  selector: 'ng-template[lcSidenavLabel]',
  standalone: true,
})
export class SidenavLabelDirective {
  public readonly template = inject<TemplateRef<SidenavLabelContext>>(TemplateRef);

  /** Types the template's context (`let-item`, `let-level`, `let-highlight`) in strict templates. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the type predicate is the guard's whole job
  static ngTemplateContextGuard(_dir: SidenavLabelDirective, ctx: unknown): ctx is SidenavLabelContext {
    return true;
  }
}
