import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComboboxComponent } from '@lifecorner/angular-ui-kit/combobox';
import { DatepickerComponent } from '@lifecorner/angular-ui-kit/datepicker';

/**
 * 3.30 (request 047, finance-intelligence rules page, rows 6 and 7),
 * rendered on the server: the datepicker's visible label is a `<label for>`
 * of its field (no `aria-label`), and the lg combobox frame with its 44 px
 * input rule is in the page before JS. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-330',
  imports: [ComboboxComponent, DatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-datepicker id="compat-dp-330" label="Gilt ab" ariaLabel="Gültig ab" granularity="month" format="YYYY-MM" placeholder="Monat wählen" />
    <lc-combobox id="compat-cb-330" size="lg" label="Konto" placeholder="Konto suchen" />
  `,
})
export class Probe330 {}
