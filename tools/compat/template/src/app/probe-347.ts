import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NumberInputComponent } from '@lifecorner/angular-ui-kit/number-input';
import { SidenavComponent, SidenavLabelDirective } from '@lifecorner/angular-ui-kit/sidenav';
import { WaterfallChartComponent, type WaterfallItem } from '@lifecorner/angular-ui-kit/waterfall-chart';
import type { NavigationItem, NavigationItemActionEvent } from '@lifecorner/angular-ui-kit/models';

const SHY = '­';

/**
 * 3.47 (request 067), rendered on the server: the waterfall's long German
 * labels wrapped from estimated widths (tspans, a cut label's <title>, the
 * chart one line higher; kosten row 6, AC-W4), a number input without
 * steppers (kosten row 5), and a docked sidenav with the `[sidenav-top]`
 * slot, a brand without link, a five-level tree whose current item's groups
 * and a seeded `expandedGroups` id are open, and `highlight` marks (usm-x
 * rows 38–46, AC-S12). A second, hidden sidenav compiles an `lcSidenavLabel`
 * template under strictTemplates. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-347',
  imports: [NumberInputComponent, SidenavComponent, SidenavLabelDirective, WaterfallChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <div id="compat-waterfall-347"><lc-waterfall-chart [data]="causes" [width]="564" [height]="250" /></div>
      <lc-number-input id="compat-number-347" label="Erklärter Betrag" locale="de-DE" suffix="€" size="lg" [showSteppers]="false" />
      <div id="compat-sidenav-347" style="display: flex; height: 520px;">
        <lc-sidenav mode="docked" [isOpen]="true" width="280px" [mobileBreakpoint]="0" [items]="tree" activeRoute="/compat-347/freigabe"
                    brandName="USM X" [brandLink]="false" ariaLabel="Arbeitsbereich 347" [expandedGroups]="seeded" highlight="rech"
                    (itemActionClick)="onAction($event)">
          <input sidenav-top id="compat-search-347" aria-label="Navigation durchsuchen" />
        </lc-sidenav>
      </div>
      <div hidden>
        <lc-sidenav mode="docked" [isOpen]="true" [mobileBreakpoint]="0" [items]="[]" ariaLabel="Vorlage 347">
          <ng-template lcSidenavLabel let-item let-level="level" let-highlight="highlight">{{ item.label }} {{ level + 1 }} {{ highlight.length }}</ng-template>
        </lc-sidenav>
      </div>
    </div>
  `,
})
export class Probe347 {
  protected readonly causes: WaterfallItem[] = [
    { label: `Periodi${SHY}sierung`, value: 6000 },
    { label: `Verschie${SHY}bung`, value: 1200 },
    { label: `Unge${SHY}plant`, value: 25200 },
    { label: 'Nicht eingetreten', value: -2400 },
    { label: 'Preis', value: 2960 },
    { label: 'Menge', value: 1500 },
    { label: 'Einmalig', value: 3000 },
    { label: 'Nicht erklärt', value: 6370 },
    { label: 'Summe', value: 43830, type: 'total' },
  ];

  protected readonly seeded: readonly string[] = ['compat-out'];

  protected readonly tree: NavigationItem[] = [
    {
      id: 'compat-wf', icon: 'folder', label: 'Workflows', route: '', displayOrder: 1,
      children: [
        {
          id: 'compat-in', icon: 'folder', label: 'Eingangsrechnungen', route: '', displayOrder: 1,
          children: [
            {
              id: 'compat-pr', icon: 'folder', label: 'Prüfung', route: '', displayOrder: 1, action: { icon: 'dots', ariaLabel: 'Aktionen für Prüfung' },
              children: [{ id: 'compat-fr', icon: 'file', label: 'Freigabe', route: '/compat-347/freigabe', displayOrder: 1 }],
            },
          ],
        },
        {
          id: 'compat-out', icon: 'folder', label: 'Ausgangsrechnungen', route: '', displayOrder: 2,
          children: [{ id: 'compat-mahn', icon: 'file', label: 'Mahnungen', route: '/compat-347/mahnungen', displayOrder: 1 }],
        },
      ],
    },
  ];

  protected onAction(event: NavigationItemActionEvent): void {
    event.element.focus();
  }
}
