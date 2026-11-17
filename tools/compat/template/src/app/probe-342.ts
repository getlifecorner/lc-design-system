import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '@lifecorner/angular-ui-kit/checkbox';
import { NumberInputComponent } from '@lifecorner/angular-ui-kit/number-input';
import { SelectComponent, type SelectOptionGroup } from '@lifecorner/angular-ui-kit/select';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';

/**
 * 3.42 (request 062, AC-24), rendered on the server: a grouped lc-select with
 * a value (the panel is an overlay and never prerenders, so the trigger shows
 * the chosen option's label from the groups), lc-number-input's inline minus (usm-x row 2:
 * no request), the inline spinner `xs` (usm-x row 5) and a disabled checked
 * checkbox that keeps its fill and check (061-s1). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-342',
  imports: [ReactiveFormsModule, SelectComponent, NumberInputComponent, SpinnerComponent, CheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="compat-select-342">
      <lc-select ariaLabel="Kunde" placeholder="Kunde wählen" [options]="customers" [formControl]="customer" />
    </div>
    <div id="compat-number-342">
      <lc-number-input label="Menge" [min]="0" [max]="9" />
    </div>
    <div id="compat-spinner-342">
      Synchronisiere Konten <lc-spinner size="xs" loadingLabel="Wird geladen" />
    </div>
    <div id="compat-checkbox-342">
      <lc-checkbox label="Freigegeben" [disabled]="true" [checked]="true" />
    </div>
  `,
})
export class Probe342 {
  protected readonly customer = new FormControl<string | null>('extern');
  protected readonly customers: SelectOptionGroup[] = [
    { label: 'Kundenart', options: [{ value: 'intern', label: 'Intern' }, { value: 'extern', label: 'Extern' }] },
    { label: 'Kunden', options: [{ value: 'ksk', label: 'Kreissparkasse Musterstadt' }] },
  ];
}
