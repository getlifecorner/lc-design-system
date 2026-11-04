import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { NumberInputComponent, type NumberInputSize } from './number-input.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.29 (request 046, regeln rows 3 and 4): `lc-number-input` `locale`,
 * `suffix`, `suffixAriaLabel` and `size` (design 046 D-3 … D-5, AC-13 … AC-18).
 */
@Component({
  standalone: true,
  imports: [NumberInputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-number-input
      label="Anteil"
      [locale]="locale()"
      [suffix]="suffix()"
      [suffixAriaLabel]="suffixAriaLabel()"
      [size]="size()"
      [step]="step()"
      [min]="0"
      [max]="100"
      [helperText]="helperText()"
      [formControl]="control"
    />
  `,
})
class HostComponent {
  readonly locale = signal('de-DE');
  readonly suffix = signal('');
  readonly suffixAriaLabel = signal('');
  readonly size = signal<NumberInputSize>('md');
  readonly step = signal(0.5);
  readonly helperText = signal<string | undefined>(undefined);
  readonly control = new FormControl<number | null>(null);
}

describe('lc-number-input locale, suffix and size (3.29)', () => {
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

  const create = (patch: Partial<{ locale: string; suffix: string; suffixAriaLabel: string; size: NumberInputSize; step: number; helperText: string }> = {}) => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    for (const [key, value] of Object.entries(patch)) {
      (host[key as keyof typeof patch] as unknown as { set(v: unknown): void }).set(value);
    }
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  describe('locale (AC-13, AC-14, AC-17)', () => {
    it('de-DE: typing "7,5" gives 7.5 and shows "7,5" while typing, after blur and after stepping', () => {
      create();
      type('7,5');
      expect(field().value).toBe('7,5');
      expect(host.control.value).toBe(7.5);
      blur();
      expect(field().value).toBe('7,5');
      click('increment');
      expect(host.control.value).toBe(8);
      expect(field().value).toBe('8');
      click('decrement');
      expect(field().value).toBe('7,5');
    });

    it('de-DE: a typed point is taken as the decimal separator and shown as a comma', () => {
      create();
      type('7.5');
      expect(field().value).toBe('7,5');
      expect(host.control.value).toBe(7.5);
    });

    it('en-US: "7,5" and "7.5" both give 7.5 and show "7.5"', () => {
      create({ locale: 'en-US' });
      type('7,5');
      expect(field().value).toBe('7.5');
      expect(host.control.value).toBe(7.5);
      blur();
      expect(field().value).toBe('7.5');
    });

    it("'' (the default) and a locale with another separator show a point, as before", () => {
      create({ locale: '' });
      type('1,5');
      expect(field().value).toBe('1.5');
      fixture.destroy();
      TestBed.resetTestingModule();
      create({ locale: 'ar-EG' });
      type('1,5');
      expect(field().value).toBe('1.5');
      fixture.destroy();
      TestBed.resetTestingModule();
      create({ locale: 'not a locale!' });
      type('1,5');
      expect(field().value).toBe('1.5');
    });

    it('writeValue(7.5) shows "7,5"; the model stays a number; no grouping (AC-14)', () => {
      create();
      host.control.setValue(7.5);
      fixture.detectChanges();
      expect(field().value).toBe('7,5');
      host.control.setValue(1234.5);
      fixture.detectChanges();
      expect(field().value).toBe('1234,5');
      expect(typeof host.control.value).toBe('number');
    });

    it('keeps negative values and the step precision (AC-14)', () => {
      create({ step: 0.1 });
      type('-0,5');
      expect(field().value).toBe('-0,5');
      // Clamped to min 0 only on blur, as before.
      expect(host.control.value).toBe(-0.5);
      host.control.setValue(0.2);
      fixture.detectChanges();
      click('increment');
      expect(host.control.value).toBe(0.3);
      expect(field().value).toBe('0,3');
    });

    it('keeps an in-progress "7," until blur and clamps to max on blur', () => {
      create();
      type('7,');
      expect(field().value).toBe('7,');
      expect(host.control.value).toBe(7);
      blur();
      expect(field().value).toBe('7');
      type('250,5');
      blur();
      expect(host.control.value).toBe(100);
      expect(field().value).toBe('100');
    });
  });

  describe('suffix (AC-15)', () => {
    it('shows the unit after the value, aria-hidden, outside the model', () => {
      create({ suffix: '%', suffixAriaLabel: 'Prozent' });
      host.control.setValue(7.5);
      fixture.detectChanges();
      const control = el().querySelector('.number-input__control') as HTMLElement;
      expect([...control.children].map((c) => c.className.split(' ')[0])).toEqual([
        'number-input__button',
        'number-input__input',
        'number-input__suffix',
        'number-input__button',
      ]);
      const suffix = el().querySelector('.number-input__suffix') as HTMLElement;
      expect(suffix.textContent).toBe('%');
      expect(suffix.getAttribute('aria-hidden')).toBe('true');
      expect(`${field().value} ${suffix.textContent}`).toBe('7,5 %');
      expect(host.control.value).toBe(7.5);
    });

    it('reads the value, the name and the unit once: the unit is the first description (before the helper)', () => {
      create({ suffix: '%', suffixAriaLabel: 'Prozent', helperText: 'Zwischen 0 und 100' });
      const id = field().id;
      expect(field().getAttribute('aria-describedby')).toBe(`${id}-suffix ${id}-helper`);
      const spoken = el().querySelector(`#${id}-suffix`) as HTMLElement;
      expect(spoken.hidden).toBe(true);
      expect(spoken.textContent).toBe('Prozent');
      expect(computedName(el(), field())).toBe('Anteil');
      expect(el().querySelectorAll('[id$="-suffix"]')).toHaveLength(1);
    });

    it('speaks the suffix itself when suffixAriaLabel is empty', () => {
      create({ suffix: 'kg' });
      expect(el().querySelector(`#${field().id}-suffix`)?.textContent).toBe('kg');
    });

    it('focuses the field on a press on the unit', () => {
      create({ suffix: '%' });
      const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      el().querySelector('.number-input__suffix')?.dispatchEvent(press);
      expect(press.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(field());
    });

    it('renders no unit and no description without a suffix', () => {
      create();
      expect(el().querySelector('.number-input__suffix')).toBeNull();
      expect(el().querySelector('[hidden]')).toBeNull();
      expect(field().getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('size (AC-16)', () => {
    it.each([
      ['xs', 'number-input number-input--xs', 'icon-xs'],
      ['sm', 'number-input number-input--sm', 'icon-xs'],
      ['md', 'number-input', 'icon-sm'],
      ['lg', 'number-input number-input--lg', 'icon-sm'],
    ] as const)('%s: container class "%s", stepper icons %s', (size, classes, icon) => {
      create({ size });
      expect(el().querySelector('.number-input')?.className).toBe(classes);
      const icons = [...el().querySelectorAll('.number-input__button .icon-container')];
      expect(icons).toHaveLength(2);
      expect(icons.every((i) => i.classList.contains(icon))).toBe(true);
    });
  });
});

describe('lc-number-input size and suffix styles (3.29, AC-16)', () => {
  const css = compile(resolve(__dirname, 'number-input.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it.each([
    ['xs', 'xs', '3rem'],
    ['sm', 'sm', '3.5rem'],
    ['lg', 'lg', '4.5rem'],
  ])('%s: square steppers of the field height, the field %s wide', (size, token, width) => {
    expect(rule(`.number-input--${size} .number-input__button`)).toMatch(
      new RegExp(`width: var\\(--size-interactive-${token}-height\\);\\n\\s*height: var\\(--size-interactive-${token}-height\\);`),
    );
    expect(rule(`.number-input--${size} .number-input__input`)).toContain(`width: ${width}`);
    expect(css).toMatch(
      new RegExp(`\\n\\.number-input--${size} \\.number-input__input,\\s*\\.number-input--${size} \\.number-input__suffix \\{\\n\\s*font-size: var\\(--size-interactive-${token}-font-size\\);`),
    );
  });

  it('md keeps the 3.28 rules: 2.5rem steppers, a 4rem field, no size class rule', () => {
    expect(rule('.number-input__button')).toMatch(/width: 2\.5rem;\n\s*height: 2\.5rem;/);
    expect(rule('.number-input__input')).toMatch(/width: 4rem;\n\s*text-align: center;/);
    expect(css).not.toContain('.number-input--md');
  });

  it('stretches the sized field to the stepper height, without block padding', () => {
    expect(css).toMatch(
      /\n\.number-input--xs \.number-input__input,\s*\.number-input--xs \.number-input__suffix,\s*\.number-input--sm \.number-input__input,\s*\.number-input--sm \.number-input__suffix,\s*\.number-input--lg \.number-input__input,\s*\.number-input--lg \.number-input__suffix \{\n\s*align-self: stretch;/,
    );
    expect(css).toMatch(/\.number-input--lg \.number-input__input \{\n\s*padding-block: 0;\n\}/);
  });

  it('puts the value at the end next to a unit in the secondary text colour', () => {
    expect(rule('.number-input__suffix')).toMatch(/flex-shrink: 0;\n\s*padding-inline: 0\.25em var\(--spacing-2\);/);
    expect(rule('.number-input__suffix')).toContain('color: var(--color-text-secondary)');
    expect(rule('.number-input__control:has(.number-input__suffix) .number-input__input')).toMatch(
      /text-align: end;\n\s*padding-inline-end: 0;/,
    );
  });

  it('keeps the control content-wide under a long label (D-5)', () => {
    expect(rule('.number-input__control')).toContain('align-self: flex-start');
  });
});
