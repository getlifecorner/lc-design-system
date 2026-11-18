import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { NumberInputComponent, type NumberInputSize } from './number-input.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.47 (request 067, kosten row 5, AC-N1 … N3): `showSteppers`. Without
 * steppers the field holds only the value box (and the unit); typing,
 * locale, unit, clamping, errors, forms and the arrow keys behave as with
 * steppers.
 */
@Component({
  standalone: true,
  imports: [NumberInputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-number-input
      label="Erklärter Betrag"
      locale="de-DE"
      suffix="€"
      suffixAriaLabel="Euro"
      [showSteppers]="showSteppers()"
      [size]="size()"
      [step]="0.01"
      [min]="0"
      [max]="2960"
      [helperText]="helperText()"
      [error]="error()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [formControl]="control"
    />
  `,
})
class HostComponent {
  readonly showSteppers = signal(false);
  readonly size = signal<NumberInputSize>('lg');
  readonly helperText = signal<string | undefined>('Höchstens 2960,00 €');
  readonly error = signal<string | undefined>(undefined);
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly control = new FormControl<number | null>(2960);
}

describe('lc-number-input without steppers (3.47, request 067)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const field = () => el().querySelector('input') as HTMLInputElement;
  const container = () => el().querySelector('.number-input') as HTMLElement;
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const key = (k: string) => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('AC-N1: the default draws both steppers, as before', () => {
    it('renders the − and + buttons and no no-steppers class with showSteppers true', () => {
      host.showSteppers.set(true);
      fixture.detectChanges();
      expect(el().querySelectorAll('.number-input__button')).toHaveLength(2);
      expect(container().className).toBe('number-input number-input--lg');
    });

    it('defaults showSteppers to true', () => {
      const plain = TestBed.createComponent(NumberInputComponent);
      plain.detectChanges();
      expect(plain.componentInstance.showSteppers()).toBe(true);
      expect((plain.nativeElement as HTMLElement).querySelectorAll('button')).toHaveLength(2);
      expect((plain.nativeElement as HTMLElement).querySelector('.number-input')?.className).toBe('number-input');
    });
  });

  describe('AC-N2: only the value box, behaviour unchanged', () => {
    it('renders no button; the field is the only control, with the unit after it', () => {
      expect(el().querySelectorAll('button')).toHaveLength(0);
      expect(container().className).toBe('number-input number-input--lg number-input--no-steppers');
      const control = el().querySelector('.number-input__control') as HTMLElement;
      expect([...control.children].map((c) => c.className)).toEqual(['number-input__input', 'number-input__suffix']);
      expect(field().value).toBe('2960');
    });

    it('shows the German separator, keeps the model a number and clamps on blur', () => {
      type('1250,5');
      expect(field().value).toBe('1250,5');
      expect(host.control.value).toBe(1250.5);
      type('5000');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(host.control.value).toBe(2960);
      expect(field().value).toBe('2960');
      expect(host.control.touched).toBe(true);
    });

    it('still steps with ArrowUp and ArrowDown by step', () => {
      host.control.setValue(10);
      fixture.detectChanges();
      key('ArrowUp');
      expect(host.control.value).toBe(10.01);
      key('ArrowDown');
      key('ArrowDown');
      expect(host.control.value).toBe(9.99);
    });

    it('describes the field by the unit and the helper, then the error, and marks it invalid', () => {
      const id = field().id;
      expect(field().getAttribute('inputmode')).toBe('decimal');
      expect(field().getAttribute('aria-describedby')).toBe(`${id}-suffix ${id}-helper`);
      host.error.set('Höchstens 2960,00 €');
      fixture.detectChanges();
      expect(field().getAttribute('aria-describedby')).toBe(`${id}-suffix ${id}-error`);
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(container().classList).toContain('number-input--error');
      host.error.set(undefined);
      host.invalid.set(true);
      fixture.detectChanges();
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('disables through the input and the form control', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      expect(field().disabled).toBe(true);
      expect(container().classList).toContain('number-input--disabled');
      host.disabled.set(false);
      host.control.disable();
      fixture.detectChanges();
      expect(field().disabled).toBe(true);
    });

    it('passes axe (jsdom rules)', async () => {
      const results = await audit(el());
      expect(violations(results)).toEqual([]);
    });
  });
});

describe('lc-number-input without steppers: styles (3.47, AC-N3)', () => {
  const css = compile(resolve(__dirname, 'number-input.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('gives the value box the steppers’ height: md 2.5rem, no block padding', () => {
    expect(rule('.number-input--no-steppers .number-input__input')).toMatch(/height: 2\.5rem;\n\s*padding-block: 0;/);
  });

  it.each(['xs', 'sm', 'lg'])('%s: the size’s interactive height', (size) => {
    expect(rule(`.number-input--no-steppers.number-input--${size} .number-input__input`)).toContain(
      `height: var(--size-interactive-${size}-height);`,
    );
  });

  it('keeps the field border and the value-width hook (no new width)', () => {
    expect(css.match(/var\(--lc-number-input-value-width, /g)).toHaveLength(4);
    expect(rule('.number-input__control')).toContain('border: 1px solid var(--color-field-border)');
  });
});
