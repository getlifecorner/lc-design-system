import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComboboxComponent } from '@lifecorner/angular-ui-kit/combobox';
import { EmailInputComponent } from '@lifecorner/angular-ui-kit/email-input';
import { NumberInputComponent } from '@lifecorner/angular-ui-kit/number-input';
import { PasswordInputComponent } from '@lifecorner/angular-ui-kit/password-input';
import { VerificationCodeInputComponent } from '@lifecorner/angular-ui-kit/verification-code-input';
import { audit, violations } from '../../testing/axe-jsdom';
import { InputComponent } from './input.component';

/**
 * 3.42 (request 062 AC-16, AC-17, usm-x row 9, design D-8): `invalid` on every
 * field whose `error` is a message string. Error look and `aria-invalid`
 * without a message; the message and `aria-describedby` follow `error` only.
 */
interface Row {
  readonly name: string;
  readonly component: Type<unknown>;
  readonly inputs: Record<string, unknown>;
  /** The element that carries the error class while invalid. */
  readonly invalidLook: string;
  /** The control(s) that carry `aria-invalid`. */
  readonly control: string;
  readonly message: string;
}

const ROWS: Row[] = [
  { name: 'lc-input', component: InputComponent, inputs: { label: 'Kostenstelle' }, invalidLook: '.input-invalid', control: 'input', message: '.input-error' },
  { name: 'lc-email-input', component: EmailInputComponent, inputs: { label: 'E-Mail' }, invalidLook: '.input-invalid', control: 'input', message: '.input-error' },
  { name: 'lc-password-input', component: PasswordInputComponent, inputs: { label: 'Passwort' }, invalidLook: 'input.lc-input-error', control: 'input.lc-input', message: '.lc-error' },
  { name: 'lc-number-input', component: NumberInputComponent, inputs: { label: 'Menge' }, invalidLook: '.number-input--error', control: 'input', message: '.number-input__error' },
  { name: 'lc-combobox', component: ComboboxComponent, inputs: { label: 'Kunde' }, invalidLook: '.lc-combobox--error', control: 'input[role="combobox"]', message: '.lc-combobox__error' },
  { name: 'lc-verification-code-input', component: VerificationCodeInputComponent, inputs: {}, invalidLook: '.lc-digit-input-error', control: 'input', message: '.lc-error' },
];

describe('invalid without a message (3.42, request 062)', () => {
  const render = (row: Row, extra: Record<string, unknown> = {}) => {
    TestBed.configureTestingModule({
      imports: [row.component],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(row.component);
    for (const [key, value] of Object.entries({ ...row.inputs, ...extra })) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const controls = Array.from(el.querySelectorAll(row.control)) as HTMLInputElement[];
    return { fixture, el, controls };
  };

  describe.each(ROWS)('$name', (row) => {
    it('default: no aria-invalid, no error look (unchanged default)', () => {
      const { el, controls } = render(row);
      expect(controls.length).toBeGreaterThan(0);
      expect(controls.every((c) => !c.hasAttribute('aria-invalid'))).toBe(true);
      expect(el.querySelector(row.invalidLook)).toBeNull();
    });

    it('invalid: error look and aria-invalid="true", no message, aria-describedby unchanged', () => {
      const plain = render(row).controls.map((c) => c.getAttribute('aria-describedby'));
      TestBed.resetTestingModule();
      const { el, controls } = render(row, { invalid: true });
      expect(controls.every((c) => c.getAttribute('aria-invalid') === 'true')).toBe(true);
      expect(el.querySelector(row.invalidLook)).not.toBeNull();
      expect(el.querySelector(row.message)).toBeNull();
      expect(controls.map((c) => c.getAttribute('aria-describedby'))).toEqual(plain);
    });

    it('invalid + error: the message shows once', () => {
      const { el, controls } = render(row, { invalid: true, error: 'Pflichtfeld' });
      expect(el.querySelectorAll(row.message)).toHaveLength(1);
      expect(el.querySelector(row.message)?.textContent?.trim()).toBe('Pflichtfeld');
      expect(controls.every((c) => c.getAttribute('aria-invalid') === 'true')).toBe(true);
    });

    it('axe has no violations while invalid', async () => {
      const { el } = render(row, { invalid: true });
      expect(violations(await audit(el))).toEqual([]);
    });
  });
});
