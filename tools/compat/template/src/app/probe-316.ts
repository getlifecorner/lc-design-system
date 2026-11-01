import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyComponent } from '@lifecorner/angular-ui-kit/money';

/**
 * 3.16 (request 022, BA-4), rendered on the server: `lc-money` with a fixed
 * `de-DE` locale and one on the app's `LOCALE_ID` (not provided here, so
 * Angular's `en-US`). The visible amount and the spoken text are both in the
 * HTML before JS. Secondary entry only. 3.20 (request 027): one without the
 * symbol (`showCurrency=false`), its spoken text still with the currency.
 */
@Component({
  selector: 'lc-compat-316',
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Saldo <lc-money id="compat-money-de" [amountMinor]="-4217" currency="EUR" locale="de-DE" /> heute</p>
    <p>Balance <lc-money id="compat-money-app" [amountMinor]="-4217" currency="USD" /> today</p>
    <p>Kosten <lc-money id="compat-money-bare" [amountMinor]="-4217" currency="EUR" locale="de-DE" [showCurrency]="false" /> in €</p>
  `,
})
export class Probe316 {}
