import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonLinkComponent } from '@lifecorner/angular-ui-kit/button';
import { CardComponent } from '@lifecorner/angular-ui-kit/card';
import { DescriptionListComponent, type DescriptionListItem } from '@lifecorner/angular-ui-kit/description-list';
import { HeaderComponent, type HeaderContextBadge } from '@lifecorner/angular-ui-kit/header';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';
import { ListComponent, type ListItem } from '@lifecorner/angular-ui-kit/list';
import { StackedBarChartComponent } from '@lifecorner/angular-ui-kit/stacked-bar-chart';
import { StateStripComponent, type StateStripLabels, type StateStripSegment } from '@lifecorner/angular-ui-kit/state-strip';
import { TableComponent, type TableColumn } from '@lifecorner/angular-ui-kit/table';

/**
 * 3.36 (request 056), rendered on the server: the state strip's grid and its
 * ten cells (AC-5), a closed collapsible card (AC-24), the band's parts as
 * percentages (AC-15), the table's footer row (AC-17), the header's context
 * badge (AC-9), the hero title as `h2` (AC-13), the description list's badge
 * and total (AC-7, AC-11), the list chevron (AC-8) and an inverse-outline link
 * (AC-27). `hamburgerClick` is bound with and without `$event` under
 * strictTemplates (AC-31). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-336',
  imports: [
    ButtonLinkComponent, CardComponent, DescriptionListComponent, HeaderComponent, HeroComponent,
    ListComponent, StackedBarChartComponent, StateStripComponent, TableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" id="compat-336">
      <lc-state-strip id="compat-strip-336" ariaLabel="Letzte 10 Ladeläufe" [stateLabels]="german" [segments]="runs" />
      <lc-card id="compat-card-336" variant="outlined" title="Direkte Zuordnung" subtitle="4 Regeln"
        [collapsible]="true" [(expanded)]="open">
        <p>Regel 1</p>
      </lc-card>
      <lc-stacked-bar-chart id="compat-band-336" variant="band" [height]="24" ariaLabel="Verteilung der Gesamtkosten"
        [categories]="[{ label: 'Verteilung', values: [412, 230, 180, 110, 68] }]" [showLegend]="false" />
      <lc-table id="compat-table-336" [columns]="columns" [data]="rows" [footerRow]="footer" />
      <lc-header id="compat-header-336" size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
        title="Finance Intelligence" titleTag="span" contextPlacement="below" contextLabel="Monatsstand"
        contextName="Oktober 2026 · Fassung 1" contextAriaLabel="Monatsstand wählen" [contextBadge]="badge"
        [showUserMenu]="false" [showHamburger]="true" (hamburgerClick)="toggled.set(toggled() + 1)" />
      <lc-header id="compat-header-336b" [sticky]="false" title="Finance Intelligence" titleTag="span"
        [showUserMenu]="false" [showHamburger]="true" (hamburgerClick)="setTrigger($event)" />
      <lc-hero id="compat-hero-336" label="Gesamtkosten Ist" title="522.530,00 €" [headingLevel]="2">
        <a lcButton id="compat-inverse-outline-336" variant="inverse-outline" size="lg" href="#herkunft">Herkunft</a>
      </lc-hero>
      <lc-description-list id="compat-dl-336" [items]="facts" totalAriaLabel="Summe" />
      <lc-list id="compat-list-336" [items]="sources" [clickable]="true" [showChevron]="true" />
    </div>
  `,
})
export class Probe336 {
  protected readonly german: StateStripLabels = { success: 'geladen', warning: 'teilweise geladen', error: 'fehlgeschlagen', neutral: 'ausstehend' };
  protected readonly runs: StateStripSegment[] = Array.from({ length: 10 }, (_, i) => ({
    state: i === 8 ? 'error' : 'success',
    label: `${String(i + 1).padStart(2, '0')}.10., 06:00`,
  }));
  protected open = false;
  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Service' },
    { key: 'actual', label: 'Ist', align: 'end' },
  ];
  protected readonly rows = [
    { name: 'Demo Netz', actual: 390000 },
    { name: 'Keinem Service zugeordnet', actual: 132530 },
  ];
  protected readonly footer = { name: 'Gesamtkosten Ist', actual: 522530 };
  protected readonly badge: HeaderContextBadge = { label: 'Freigegeben', variant: 'success' };
  protected readonly toggled = signal(0);
  protected trigger: HTMLElement | null = null;
  protected readonly facts: DescriptionListItem[] = [
    { term: 'Zustand', value: 'Freigegeben', badge: 'Freigegeben', badgeVariant: 'success' },
    { term: 'Gesamtkosten Ist', value: '522.530,00 €', total: true },
  ];
  protected readonly sources: ListItem[] = [{ id: 'sap', label: 'SAP-Ist' }];

  /** Typed: `$event` is the hamburger's `<button>` (strictTemplates). */
  protected setTrigger(button: HTMLElement): void {
    this.trigger = button;
  }
}
