import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyComponent } from '@lifecorner/angular-ui-kit/money';

/**
 * 3.16 (request 022, BA-4), rendered on the server: `lc-money` with a fixed
 * `de-DE` locale and one on the app's `LOCALE_ID` (not provided here, so
 * Angular's `en-US`). The visible amount and the spoken text are both in the
 * HTML before JS. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-316',
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Saldo <lc-money id="compat-money-de" [amountMinor]="-4217" currency="EUR" locale="de-DE" /> heute</p>
    <p>Balance <lc-money id="compat-money-app" [amountMinor]="-4217" currency="USD" /> today</p>
  `,
})
export class Probe316 {}
