import { resolve } from 'path';
import { compile } from 'sass';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { audit, violations } from '../../testing/axe-jsdom';
import { NumberInputComponent, type NumberInputValueType } from './number-input.component';

/**
 * Request 063 (usm-x row 13, design §2/§4/§9): `valueType="string"` keeps the
 * typed decimal as text; the steppers and the clamp work in decimal.
 */
@Component({
  standalone: true,
  imports: [NumberInputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-number-input
      label="Betrag"
      [valueType]="valueType()"
      [locale]="locale()"
      [step]="step()"
      [min]="min()"
      [max]="max()"
      [formControl]="control"
      (valueChange)="numbers.push($event)"
      (stringValueChange)="strings.push($event)"
    />
  `,
})
class HostComponent {
  readonly valueType = signal<NumberInputValueType>('string');
  readonly locale = signal('');
  readonly step = signal(0.5);
  readonly min = signal<number | undefined>(undefined);
  readonly max = signal<number | undefined>(undefined);
  readonly control = new FormControl<string | number | null>(null);
  readonly numbers: number[] = [];
  readonly strings: (string | null)[] = [];
}

describe('lc-number-input string mode (3.43, request 063)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const field = () => el().querySelector('input') as HTMLInputElement;
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const blur = () => {
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const click = (which: 'increment' | 'decrement') => {
    (el().querySelector(`.number-input__button--${which}`) as HTMLButtonElement).click();
    fixture.detectChanges();
  };
  const write = (value: string | number | null) => {
    host.control.setValue(value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults to number mode', () => {
    const single = TestBed.createComponent(NumberInputComponent);
    expect(single.componentInstance.valueType()).toBe('number');
  });

  describe('AC-21: the typed text is the model', () => {
    it('keeps "1.50" as "1.50" and emits strings only', () => {
      type('1.50');
      blur();
      expect(host.control.value).toBe('1.50');
      expect(field().value).toBe('1.50');
      expect(host.strings).toEqual(['1.50']);
      expect(host.numbers).toEqual([]);
    });

    it('a 20-digit id round-trips and steps without rounding', () => {
      host.step.set(1);
      fixture.detectChanges();
      write('12345678901234567890');
      expect(field().value).toBe('12345678901234567890');
      click('increment');
      expect(host.control.value).toBe('12345678901234567891');
      expect(field().value).toBe('12345678901234567891');
      click('decrement');
      click('decrement');
      expect(host.control.value).toBe('12345678901234567889');
    });

    it('"1.50" + step 0.5 gives "2.00"; minus keeps the scale too', () => {
      write('1.50');
      click('increment');
      expect(host.control.value).toBe('2.00');
      click('decrement');
      click('decrement');
      click('decrement');
      click('decrement');
      expect(host.control.value).toBe('0.00');
      click('decrement');
      expect(host.control.value).toBe('-0.50');
    });

    it('the step’s scale wins when it is larger; an empty field steps from 0', () => {
      host.step.set(0.25);
      fixture.detectChanges();
      write('3');
      click('increment');
      expect(host.control.value).toBe('3.25');
      write(null);
      expect(field().value).toBe('');
      click('increment');
      expect(host.control.value).toBe('0.25');
    });

    it('ArrowUp and ArrowDown step like the buttons', () => {
      write('1.50');
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
      fixture.detectChanges();
      expect(host.control.value).toBe('2.00');
    });

    it('clamps on blur at the value’s scale and never rewrites a value in range', () => {
      host.min.set(0);
      host.max.set(10);
      fixture.detectChanges();
      type('007');
      blur();
      expect([host.control.value, field().value]).toEqual(['007', '007']);
      type('12.50');
      blur();
      expect([host.control.value, field().value]).toEqual(['10.00', '10.00']);
      type('-3');
      blur();
      expect(host.control.value).toBe('0');
    });

    it('min and max compare in decimal, also beyond a double', () => {
      // As a double, 99999999999999999999 is 1e20; the decimal text is below it.
      host.max.set(1e20);
      fixture.detectChanges();
      write('99999999999999999999');
      expect((el().querySelector('.number-input__button--increment') as HTMLButtonElement).disabled).toBe(false);
      host.max.set(5);
      fixture.detectChanges();
      write('5.00');
      expect((el().querySelector('.number-input__button--increment') as HTMLButtonElement).disabled).toBe(true);
      expect((el().querySelector('.number-input__button--decrement') as HTMLButtonElement).disabled).toBe(false);
    });

    it('a number written in string mode is taken at its own decimals', () => {
      write(1.5);
      expect(field().value).toBe('1.5');
      click('increment');
      expect(host.control.value).toBe('2.0');
    });
  });

  describe('AC-22: locale and partial entries', () => {
    it('DE: „1,5“ is shown, the model is "1.5"; written "1.50" shows „1,50“', () => {
      host.locale.set('de-DE');
      fixture.detectChanges();
      type('1,5');
      expect([field().value, host.control.value]).toEqual(['1,5', '1.5']);
      write('1.50');
      expect(field().value).toBe('1,50');
      click('increment');
      expect([field().value, host.control.value]).toEqual(['2,00', '2.00']);
    });

    it('"-" or "," alone is no value; the text stays as typed', () => {
      type('-');
      expect(host.control.value).toBeNull();
      type(',');
      expect(host.control.value).toBeNull();
      blur();
      expect(field().value).toBe('.');
      expect(host.strings).toEqual([]);
    });

    it('number mode is unchanged: numbers, valueChange, canonical text on blur', () => {
      host.valueType.set('number');
      fixture.detectChanges();
      type('1.50');
      blur();
      expect([host.control.value, field().value]).toEqual([1.5, '1.5']);
      expect(host.numbers).toEqual([1.5]);
      expect(host.strings).toEqual([]);
    });
  });

  it('AC-23: axe passes in string mode', async () => {
    host.locale.set('de-DE');
    fixture.detectChanges();
    write('1.50');
    expect(violations(await audit(el()))).toEqual([]);
  });
});

/**
 * Review 063 F3 (design §2 r1): the value box width is the public hook
 * `--lc-number-input-value-width`; the kit never declares it, so a value on
 * the element or an ancestor wins, and without it every size keeps its width.
 */
describe('lc-number-input value-width hook (3.43, review 063 F3)', () => {
  const css = compile(resolve(__dirname, 'number-input.component.scss')).css;

  it.each([
    ['md', '.number-input__input', '4rem'],
    ['xs', '.number-input--xs .number-input__input', '3rem'],
    ['sm', '.number-input--sm .number-input__input', '3.5rem'],
    ['lg', '.number-input--lg .number-input__input', '4.5rem'],
  ])('%s: the value box reads the hook (%s), falling back to %s', (_size, selector, width) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    expect(css.slice(at, css.indexOf('}', at))).toContain(`width: var(--lc-number-input-value-width, ${width});`);
  });

  it('is the only width of the value box, and the kit never sets the hook', () => {
    expect(css.match(/var\(--lc-number-input-value-width, /g)).toHaveLength(4);
    expect(css).not.toMatch(/--lc-number-input-value-width\s*:/);
  });
});
