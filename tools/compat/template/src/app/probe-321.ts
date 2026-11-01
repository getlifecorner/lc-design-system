import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BarChartComponent,
  type BarChartItem,
  type BarChartValueFormatter,
} from '@lifecorner/angular-ui-kit/bar-chart';

/** An item that carries its share from the API (the page never computes it). */
interface ShareItem extends BarChartItem {
  share: number;
}

/**
 * 3.21 (request 028, finance-intelligence cockpit-2026-11-01 row 1), rendered
 * on the server: `labelLayout="wrap"`. The horizontal ranking's rows (label,
 * `valueText`, a bar in % of the track) and the vertical chart's label row are
 * HTML before JS. strictTemplates: a one-argument and a two-argument
 * `formatValue` both type-check. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-321',
  imports: [BarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-bar-chart id="compat-bar-321" lang="de" orientation="horizontal" labelLayout="wrap" color="var(--color-primary-500)" [data]="ranking" />
    <lc-bar-chart id="compat-bar-321-columns" lang="de" labelLayout="wrap" [data]="ranking" [formatValue]="thousands" />
    <lc-bar-chart id="compat-bar-321-share" orientation="horizontal" labelLayout="wrap" [data]="shares" [formatValue]="amountAndShare" />
  `,
})
export class Probe321 {
  protected readonly ranking: BarChartItem[] = [
    { value: 313000, label: 'Demo Applikation', valueText: '313.000,00 · 54,8 %' },
    { value: 180000, label: 'Demo Arbeitsplatz', valueText: '180.000,00 · 31,5 %' },
    { value: 78000, label: 'Demo Netz', valueText: '78.000,00 · 13,7 %' },
  ];
  protected readonly shares: ShareItem[] = [
    { value: 313000, label: 'Demo application', share: 54.8 },
    { value: 180000, label: 'Demo workplace', share: 31.5 },
  ];
  /** One argument, as before 3.21. */
  protected readonly thousands = (value: number) => `${value / 1000}k`;
  /** Two arguments: the bar's item, `undefined` for a tick. */
  protected readonly amountAndShare: BarChartValueFormatter = (value, item) =>
    item ? `${value} · ${(item as ShareItem).share}%` : `${value}`;
}
