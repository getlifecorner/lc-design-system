import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidenavComponent, SidenavRailDirective } from '@lifecorner/angular-ui-kit/sidenav';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/**
 * 3.51 (request 072), rendered on the server: the app's mark in
 * `[sidenav-brand-mark]` (backlog 071-n2, AC-6) and an `lcSidenavRail`
 * template on the collapsed rail with the server's rail width, 56 (backlog
 * 071-n5), both final before JavaScript. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-351',
  imports: [SidenavComponent, SidenavRailDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <div id="compat-sidenav-351" style="display: flex; height: 240px;">
        <lc-sidenav mode="docked" [isOpen]="true" width="240px" [mobileBreakpoint]="0" [items]="items" brandName="USM X" ariaLabel="Navigation 351">
          <svg sidenav-brand-mark id="compat-mark-351" viewBox="0 0 32 32" width="28" height="28"><rect x="3" y="3" width="26" height="26" rx="7" fill="currentColor" /></svg>
        </lc-sidenav>
      </div>
      <div id="compat-rail-351" style="display: flex; height: 240px;">
        <lc-sidenav mode="docked" [isOpen]="true" [collapsed]="true" width="240px" [mobileBreakpoint]="0" [items]="items" brandName="USM X" brandLetter="X" ariaLabel="Schiene 351">
          <ng-template lcSidenavRail let-entries let-railWidth="railWidth">
            @for (entry of entries; track entry.id) {
              <button type="button" class="lc-sidenav__rail-item" [attr.aria-label]="entry.label" [attr.data-tooltip]="entry.label">{{ entry.label.slice(0, 2) }}</button>
            }
            <span id="compat-rail-width-351">{{ railWidth }}</span>
          </ng-template>
        </lc-sidenav>
      </div>
    </div>
  `,
})
export class Probe351 {
  protected readonly items: NavigationItem[] = [
    { id: 'compat-351-start', icon: 'home', label: 'Übersicht', route: '/compat-351/start', displayOrder: 1 },
    { id: 'compat-351-stamm', icon: 'folder', label: 'Stammdaten', route: '/compat-351/stamm', displayOrder: 2 },
  ];
}
