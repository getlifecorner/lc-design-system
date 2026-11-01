import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MoneyComponent } from './money.component';
import { formatMoney, type MoneyFormatOptions, type MoneySignDisplay } from './money-format';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.20 (request 027, finance-intelligence services page, gap row 1):
 * `showCurrency` on `formatMoney` and `lc-money`. Node runs the server's `Intl`.
 */
const MINUS = '−';
const NBSP = ' ';
const NNBSP = ' ';

const fmt = (minor: number, currency: string, options: MoneyFormatOptions) => formatMoney(minor, currency, options);

describe('formatMoney showCurrency (3.20, request 027)', () => {
  it('AC-1: −42,17 and the spoken Euro for de-DE, no trailing space', () => {
    expect(fmt(-4217, 'EUR', { locale: 'de-DE', showCurrency: false })).toEqual({ text: '−42,17', spoken: 'minus 42,17 Euro' });
  });

  /** Design 027 §2: [amount, signDisplay] per column of the AC-2 table. */
  const cases: [number, MoneySignDisplay][] = [
    [-4217, 'auto'],
    [0, 'auto'],
    [4217, 'always'],
    [0, 'always'],
    [0, 'exceptZero'],
    [-4217, 'never'],
  ];
  const comma = [`${MINUS}42,17`, '0,00', '+42,17', '+0,00', '0,00', '42,17'];
  const dot = [`${MINUS}42.17`, '0.00', '+42.17', '+0.00', '0.00', '42.17'];

  it.each([
    ['de-DE', 'EUR', comma],
    ['fr-FR', 'EUR', comma],
    ['en-US', 'USD', dot],
    ['en-GB', 'GBP', dot],
    ['nl-NL', 'EUR', comma],
    ['de-CH', 'CHF', dot],
  ] as const)('AC-2: %s %s leaves no symbol and no dangling space, for every sign', (locale, currency, expected) => {
    const texts = cases.map(([minor, signDisplay]) => fmt(minor, currency, { locale, signDisplay, showCurrency: false })?.text);
    expect(texts).toEqual(expected);
    for (const t of texts) {
      expect(t).not.toMatch(/^\s|\s$/);
      expect(t).not.toMatch(/[€$£]|EUR|CHF|GBP|USD/);
    }
    // The same cases with the symbol really carry one (the table removes something).
    for (const [minor, signDisplay] of cases) {
      expect(fmt(minor, currency, { locale, signDisplay })?.text).toMatch(/[€$£]|CHF/);
    }
  });

  it('AC-2: symbol-before locales put the sign directly before the digits', () => {
    expect(fmt(-4217, 'USD', { locale: 'en-US' })?.text).toBe(`${MINUS}$42.17`);
    expect(fmt(-4217, 'EUR', { locale: 'nl-NL' })?.text).toBe(`€${NBSP}${MINUS}42,17`);
    expect(fmt(-4217, 'CHF', { locale: 'de-CH' })?.text).toBe(`CHF${MINUS}42.17`);
    expect(fmt(-4217, 'EUR', { locale: 'nl-NL', showCurrency: false })?.text).toBe(`${MINUS}42,17`);
    expect(fmt(-4217, 'CHF', { locale: 'de-CH', showCurrency: false })?.text).toBe(`${MINUS}42.17`);
  });

  it('never trims the grouping space: fr-FR keeps its U+202F, only the space before € goes', () => {
    expect(fmt(111111, 'EUR', { locale: 'fr-FR' })?.text).toBe(`1${NNBSP}111,11${NBSP}€`);
    expect(fmt(111111, 'EUR', { locale: 'fr-FR', showCurrency: false })?.text).toBe(`1${NNBSP}111,11`);
  });

  it('keeps the bidi marks of an RTL locale and drops only the symbol and its space', () => {
    for (const locale of ['he-IL', 'ar-EG', 'fa-IR']) {
      const withSymbol = fmt(-4217, 'EUR', { locale })?.text ?? '';
      const without = fmt(-4217, 'EUR', { locale, showCurrency: false })?.text ?? '';
      expect(without).not.toMatch(/€|EUR|^\s|\s$/);
      // Every bidi mark of the full text survives.
      const marks = (s: string) => s.replace(/[^‎‏؜]/g, '');
      expect(marks(without)).toBe(marks(withSymbol));
    }
  });

  /** text(true) minus the symbol and the whitespace right next to it. */
  const strip = (text: string, symbol: string) => text.replace(new RegExp(`\\s*${symbol.replace(/[$]/g, '\\$&')}\\s*`), '');

  it.each([
    [123456, 'JPY', 'de-DE', '¥', '123.456'],
    [123456, 'KWD', 'de-DE', 'KWD', '123,456'],
    [123456, 'EUR', 'de-DE', '€', '1.234,56'],
    [111111, 'EUR', 'de-DE', '€', '1.111,11'],
    [888888, 'EUR', 'de-DE', '€', '8.888,88'],
    [Number.MAX_SAFE_INTEGER, 'EUR', 'de-DE', '€', '90.071.992.547.409,91'],
    [-Number.MAX_SAFE_INTEGER, 'EUR', 'de-DE', '€', `${MINUS}90.071.992.547.409,91`],
    [123456, 'JPY', 'en-US', '¥', '123,456'],
    [-5, 'KWD', 'en-US', 'KWD', `${MINUS}0.005`],
  ] as const)('AC-3: %s %s in %s keeps digits, grouping and minor units', (minor, currency, locale, symbol, expected) => {
    const withSymbol = fmt(minor, currency, { locale })?.text ?? '';
    const without = fmt(minor, currency, { locale, showCurrency: false })?.text;
    expect(without).toBe(expected);
    expect(without).toBe(strip(withSymbol, symbol));
  });

  it('AC-4: the spoken text is the same with and without the symbol, also with custom sign words', () => {
    const grid: [number, string, string, MoneySignDisplay][] = [];
    for (const [locale, currency] of [['de-DE', 'EUR'], ['fr-FR', 'EUR'], ['en-US', 'USD'], ['en-GB', 'GBP'], ['nl-NL', 'EUR'], ['de-CH', 'CHF']]) {
      for (const [minor, signDisplay] of cases) grid.push([minor, currency, locale, signDisplay]);
    }
    grid.push([123456, 'JPY', 'de-DE', 'auto'], [123456, 'KWD', 'de-DE', 'auto'], [Number.MAX_SAFE_INTEGER, 'EUR', 'de-DE', 'auto']);
    for (const labels of [{}, { minusLabel: 'Soll', plusLabel: 'Haben' }]) {
      for (const [minor, currency, locale, signDisplay] of grid) {
        const options = { locale, signDisplay, ...labels };
        const spoken = fmt(minor, currency, options)?.spoken;
        expect(spoken).toBeTruthy();
        expect(fmt(minor, currency, { ...options, showCurrency: false })?.spoken).toBe(spoken);
      }
    }
    expect(fmt(-4217, 'EUR', { locale: 'de-DE', minusLabel: 'Soll', showCurrency: false })?.spoken).toBe('Soll 42,17 Euro');
    expect(fmt(4217, 'EUR', { locale: 'de-DE', signDisplay: 'always', plusLabel: 'Haben', showCurrency: false })?.spoken).toBe('Haben 42,17 Euro');
  });

  it('AC-5: without the option and with true the result is the one of 3.19.2', () => {
    for (const [minor, currency, locale] of [[-4217, 'EUR', 'de-DE'], [4217, 'USD', 'en-US'], [-4217, 'EUR', 'nl-NL'], [111111, 'EUR', 'fr-FR']] as const) {
      expect(fmt(minor, currency, { locale, showCurrency: true })).toEqual(fmt(minor, currency, { locale }));
    }
    expect(fmt(-4217, 'EUR', { locale: 'de-DE', showCurrency: true })).toEqual({ text: `${MINUS}42,17${NBSP}€`, spoken: 'minus 42,17 Euro' });
  });

  it('AC-7: an invalid amount or currency still returns null', () => {
    expect(fmt(42.17, 'EUR', { showCurrency: false })).toBeNull();
    expect(fmt(9007199254740992, 'EUR', { showCurrency: false })).toBeNull();
    expect(fmt(4217, 'EURO', { showCurrency: false })).toBeNull();
    expect(fmt(4217, '€', { showCurrency: false })).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <p id="bare">Kosten <lc-money [amountMinor]="amount" [currency]="currency" locale="de-DE" [showCurrency]="false" /> in €</p>
    <p id="unset">Saldo <lc-money [amountMinor]="amount" [currency]="currency" locale="de-DE" /> heute</p>
    <p id="true">Saldo <lc-money [amountMinor]="amount" [currency]="currency" locale="de-DE" [showCurrency]="true" /> heute</p>
  `,
})
class ShowCurrencyHostComponent {
  amount = -4217;
  currency = 'EUR';
}

describe('MoneyComponent showCurrency (3.20, request 027)', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const render = (patch: Partial<ShowCurrencyHostComponent> = {}) => {
    TestBed.configureTestingModule({ imports: [ShowCurrencyHostComponent] });
    const fixture = TestBed.createComponent(ShowCurrencyHostComponent);
    Object.assign(fixture.componentInstance, patch);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const host = (id: string) => el.querySelector(`#${id} lc-money`) as HTMLElement;
    return { el, host };
  };

  it('AC-6: −42,17 in the aria-hidden ltr amount, the full words once in the hidden span', () => {
    const { el, host } = render();
    const bare = host('bare');
    expect(bare.className).toBe('lc-money');
    expect(bare.children).toHaveLength(2);
    const [amount, words] = [...bare.children] as HTMLElement[];
    expect(amount.className).toBe('lc-money__amount');
    expect(amount.textContent).toBe(`${MINUS}42,17`);
    expect(amount.getAttribute('aria-hidden')).toBe('true');
    expect(amount.getAttribute('dir')).toBe('ltr');
    expect(words.className).toBe('lc-money__spoken');
    expect(words.textContent).toBe('minus 42,17 Euro');
    expect(bare.querySelectorAll('.lc-money__spoken')).toHaveLength(1);
    expect(bare.getAttributeNames().filter((n) => n.startsWith('aria') || n === 'role')).toEqual([]);
    expect(computedName(el, el.querySelector('#bare') as HTMLElement).replace(/\s+/g, ' ')).toBe('Kosten minus 42,17 Euro in €');
  });

  it('AC-5: without the input and with true it renders exactly as 3.19.2', () => {
    const { host } = render();
    expect(host('unset').innerHTML).toBe(host('true').innerHTML);
    expect(host('unset').querySelector('.lc-money__amount')?.textContent).toBe(`${MINUS}42,17${NBSP}€`);
    expect(host('unset').querySelector('.lc-money__spoken')?.textContent).toBe('minus 42,17 Euro');
  });

  it('AC-7: an invalid currency still renders nothing and warns', () => {
    const { host } = render({ currency: 'EURO' });
    expect(host('bare').children).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith('[lc-money] unknown currency "EURO"');
  });

  it('AC-7: an amount that is not a safe integer still renders nothing and warns', () => {
    const { host } = render({ amount: 42.17 });
    expect(host('bare').children).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith('[lc-money] amountMinor must be a safe integer');
  });

  it('AC-7: the input is an optional boolean that defaults to true', () => {
    TestBed.configureTestingModule({ imports: [MoneyComponent] });
    const fixture = TestBed.createComponent(MoneyComponent);
    expect(fixture.componentInstance.showCurrency()).toBe(true);
  });
});
