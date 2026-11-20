import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@lifecorner/angular-ui-kit/card';
import { MenuComponent, MenuControlDirective, type MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { SidenavComponent } from '@lifecorner/angular-ui-kit/sidenav';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/**
 * 3.50 (request 071), rendered on the server: a collapsed docked rail with
 * the `[sidenav-rail-top]` slot and `railItems` (usm-x row 74), a card head
 * that may wrap its action (usm-x row 86) and an inline menu with a control
 * row (usm-x row 77), all final before JavaScript. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-350',
  imports: [CardComponent, MenuComponent, MenuControlDirective, SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <div id="compat-sidenav-350" style="display: flex; height: 280px;">
        <lc-sidenav mode="docked" [isOpen]="true" [collapsed]="true" width="240px" [mobileBreakpoint]="0" [items]="items" [railItems]="rail" brandName="USM X" brandLetter="X" ariaLabel="Navigation 350">
          <button sidenav-rail-top type="button" id="compat-rail-top-350" aria-label="Bereich wählen">B</button>
        </lc-sidenav>
      </div>
      <div id="compat-card-350" style="max-width: 358px;">
        <lc-card title="Objekttypen" badge="128" [headerActionWrap]="true">
          <input card-header-action type="search" aria-label="Suchen" placeholder="Suchen …" style="width: 220px;" />
          <p>Inhalt</p>
        </lc-card>
      </div>
      <div id="compat-menu-350" style="max-width: 328px;">
        <lc-menu [inline]="true" [items]="menu" ariaLabel="Konto 350">
          <ng-template lcMenuControl="density" let-labelId="labelId">
            <button type="button" id="compat-density-350" [attr.aria-labelledby]="labelId">Kompakt</button>
          </ng-template>
        </lc-menu>
      </div>
    </div>
  `,
})
export class Probe350 {
  protected readonly items: NavigationItem[] = [
    { id: 'compat-350-start', icon: 'home', label: 'Übersicht', route: '/compat-350/start', displayOrder: 1 },
  ];
  protected readonly rail: NavigationItem[] = [
    { id: 'compat-350-r-start', icon: 'home', label: 'Übersicht', route: '/compat-350/start', displayOrder: 1 },
    { id: 'compat-350-r-stamm', icon: 'folder', label: 'Stammdaten', route: '', kind: 'action', hasPopup: 'menu', displayOrder: 2 },
  ];
  protected readonly menu: MenuItem[] = [
    { id: 'profil', label: 'Profil', current: true },
    { id: 'density', label: 'Dichte', control: 'density' },
    { id: 'logout', label: 'Abmelden' },
  ];
}
