import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from '@lifecorner/angular-ui-kit/app-shell';
import { SidenavComponent } from '@lifecorner/angular-ui-kit/sidenav';
import { StatTrendComponent } from '@lifecorner/angular-ui-kit/stat-trend';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/**
 * 3.14 (request 019), rendered on the server: a sidebar-first shell
 * (`navPlacement="full-height"`, G1) whose docked sidenav has a text brand
 * with a plain link (G2), and a cost that rises with the negative colour
 * (G4). The layout is a class and CSS, so it holds before JavaScript.
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-314',
  imports: [AppShellComponent, SidenavComponent, StatTrendComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-shell id="compat-shell-314" navPlacement="full-height">
      <lc-sidenav shell-nav mode="docked" [isOpen]="true" width="100%" [mobileBreakpoint]="0" theme="dark"
                  brandName="Finance Intelligence" brandIcon="presentation-chart-line" brandHref="/"
                  brandAriaLabel="Finance Intelligence – Startseite" ariaLabel="Hauptnavigation (Finanzen)"
                  [items]="nav" activeRoute="/" />
      <lc-stat-trend id="compat-costs" label="Kosten (Monat)" value="48,2 Mio. €" change="+3,1 %" sentiment="negative"
                     [labels]="{ up: 'gestiegen', negative: 'ungünstig' }" />
    </lc-app-shell>
  `,
})
export class Probe314 {
  protected readonly nav: NavigationItem[] = [
    { id: 'overview', icon: 'home', label: 'Übersicht', route: '/', displayOrder: 1 },
    { id: 'costs', icon: 'banknotes', label: 'Kosten', route: '/kosten', displayOrder: 2 },
  ];
}
