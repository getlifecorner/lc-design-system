import { ChangeDetectionStrategy, Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { MoneyComponent } from './money.component';
import { formatMoney, moneyDirection, moneyMinorUnits, type MoneySignDisplay } from './money-format';
import { computedName } from '../../testing/axe-jsdom';

/** 3.16 (BA-4, request 022): `lc-money` and `formatMoney`. Node runs the server's `Intl`. */
const MINUS = '−';
const NBSP = ' ';

describe('formatMoney (3.16, BA-4)', () => {
  const text = (minor: number, currency: string, locale: string, signDisplay?: MoneySignDisplay) =>
    formatMoney(minor, currency, { locale, signDisplay })?.text;
  const spoken = (minor: number, currency: string, locale: string, signDisplay?: MoneySignDisplay) =>
    formatMoney(minor, currency, { locale, signDisplay })?.spoken;

  it('formats EUR in de-DE with U+2212 and a no-break space (AC-10)', () => {
    expect(text(-4217, 'EUR', 'de-DE')).toBe(`${MINUS}42,17${NBSP}€`);
    expect(text(4217, 'EUR', 'de-DE')).toBe(`42,17${NBSP}€`);
  });

  it('formats EUR and USD in en-GB and en-US as Intl does (AC-10)', () => {
    expect(text(-4217, 'EUR', 'en-GB')).toBe(`${MINUS}€42.17`);
    expect(text(-4217, 'USD', 'en-US')).toBe(`${MINUS}$42.17`);
    expect(text(4217, 'USD', 'en-GB')).toBe('US$42.17');
  });

  it('follows the ISO 4217 minor units, not a fixed 100 (AC-9)', () => {
    expect(moneyMinorUnits('EUR')).toBe(2);
    expect(moneyMinorUnits('jpy')).toBe(0);
    expect(moneyMinorUnits('KWD')).toBe(3);
    expect(moneyMinorUnits('CLF')).toBe(4);
    // CLDR gives 0 digits for these; ISO 4217 does not.
    expect(moneyMinorUnits('HUF')).toBe(2);
    expect(moneyMinorUnits('IDR')).toBe(2);
    expect(moneyMinorUnits('IQD')).toBe(3);
    expect(text(-4217, 'JPY', 'de-DE')).toBe(`${MINUS}4.217${NBSP}¥`);
    expect(text(-4217, 'JPY', 'en-US')).toBe(`${MINUS}¥4,217`);
    expect(text(-4217, 'KWD', 'de-DE')).toBe(`${MINUS}4,217${NBSP}KWD`);
    expect(text(4217, 'KWD', 'en-US')).toBe(`KWD${NBSP}4.217`);
    expect(text(12345, 'HUF', 'en-US')).toBe(`HUF${NBSP}123.45`);
  });

  it('formats zero and small amounts with the padded minor units', () => {
    expect(text(0, 'EUR', 'de-DE')).toBe(`0,00${NBSP}€`);
    expect(text(-0, 'EUR', 'de-DE')).toBe(`0,00${NBSP}€`);
    expect(text(1, 'EUR', 'de-DE')).toBe(`0,01${NBSP}€`);
    expect(text(-5, 'KWD', 'en-US')).toBe(`${MINUS}KWD${NBSP}0.005`);
  });

  it('groups large values by the locale and stays exact up to the safe-integer limit (AC-10)', () => {
    expect(text(123456789, 'EUR', 'de-DE')).toBe(`1.234.567,89${NBSP}€`);
    expect(text(123456789, 'EUR', 'en-GB')).toBe('€1,234,567.89');
    expect(text(99999999999999, 'EUR', 'de-DE')).toBe(`999.999.999.999,99${NBSP}€`);
    expect(text(9007199254740991, 'EUR', 'de-DE')).toBe(`90.071.992.547.409,91${NBSP}€`);
    expect(text(-9007199254740991, 'EUR', 'de-DE')).toBe(`${MINUS}90.071.992.547.409,91${NBSP}€`);
  });

  it('returns null beyond the safe-integer limit, for fractions and non-numbers (documented limit)', () => {
    expect(formatMoney(9007199254740992, 'EUR')).toBeNull();
    expect(formatMoney(42.17, 'EUR')).toBeNull();
    expect(formatMoney(Number.NaN, 'EUR')).toBeNull();
    expect(formatMoney('4217' as unknown as number, 'EUR')).toBeNull();
  });

  it('returns null for a currency that is not a three-letter code', () => {
    expect(formatMoney(4217, '€')).toBeNull();
    expect(formatMoney(4217, 'EURO')).toBeNull();
    expect(formatMoney(4217, '')).toBeNull();
  });

  it('falls back to en-US for an invalid locale, and defaults to en-US', () => {
    expect(text(-4217, 'USD', 'not a locale!')).toBe(`${MINUS}$42.17`);
    expect(formatMoney(-4217, 'USD')?.text).toBe(`${MINUS}$42.17`);
  });

  it('speaks the amount in words (AC-11)', () => {
    expect(spoken(-4217, 'EUR', 'de-DE')).toBe('minus 42,17 Euro');
    expect(spoken(-4217, 'EUR', 'en-GB')).toBe('minus 42.17 euros');
    expect(spoken(-4217, 'USD', 'en-US')).toBe('minus 42.17 US dollars');
    expect(spoken(123456789, 'EUR', 'de-DE')).toBe('1.234.567,89 Euro');
  });

  it.each([
    ['auto', ['minus 42,17 Euro', '0,00 Euro', '42,17 Euro'], [`${MINUS}42,17${NBSP}€`, `0,00${NBSP}€`, `42,17${NBSP}€`]],
    ['always', ['minus 42,17 Euro', 'plus 0,00 Euro', 'plus 42,17 Euro'], [`${MINUS}42,17${NBSP}€`, `+0,00${NBSP}€`, `+42,17${NBSP}€`]],
    ['exceptZero', ['minus 42,17 Euro', '0,00 Euro', 'plus 42,17 Euro'], [`${MINUS}42,17${NBSP}€`, `0,00${NBSP}€`, `+42,17${NBSP}€`]],
    ['never', ['42,17 Euro', '0,00 Euro', '42,17 Euro'], [`42,17${NBSP}€`, `0,00${NBSP}€`, `42,17${NBSP}€`]],
  ] as const)('signDisplay "%s": the sign word whenever the sign shows (AC-9, AC-11)', (mode, words, visible) => {
    expect([-4217, 0, 4217].map((n) => spoken(n, 'EUR', 'de-DE', mode))).toEqual(words);
    expect([-4217, 0, 4217].map((n) => text(n, 'EUR', 'de-DE', mode))).toEqual(visible);
  });

  it('takes the spoken sign words from the options', () => {
    expect(formatMoney(-100, 'EUR', { locale: 'de-DE', minusLabel: 'weniger' })?.spoken).toBe('weniger 1,00 Euro');
    expect(formatMoney(100, 'EUR', { locale: 'de-DE', signDisplay: 'always', plusLabel: 'mehr' })?.spoken).toBe('mehr 1,00 Euro');
  });

  it('sets ltr for LTR locales and rtl for the RTL primary subtags (AC-12)', () => {
    expect(moneyDirection('de-DE')).toBe('ltr');
    expect(moneyDirection('en')).toBe('ltr');
    expect(moneyDirection('he-IL')).toBe('rtl');
    expect(moneyDirection('ar_EG')).toBe('rtl');
    expect(moneyDirection('FA')).toBe('rtl');
  });
});

@Component({
  standalone: true,
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p>Saldo <lc-money [amountMinor]="amount" [currency]="currency" [locale]="locale" [signDisplay]="sign" /> heute</p>`,
})
class MoneyHostComponent {
  amount = -4217;
  currency = 'EUR';
  locale = 'de-DE';
  sign: MoneySignDisplay = 'auto';
}

describe('MoneyComponent (3.16, BA-4)', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const render = (patch: Partial<MoneyHostComponent> = {}, providers: unknown[] = []) => {
    TestBed.configureTestingModule({ imports: [MoneyHostComponent], providers: providers as never[] });
    const fixture = TestBed.createComponent(MoneyHostComponent);
    Object.assign(fixture.componentInstance, patch);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { el, host: el.querySelector('lc-money') as HTMLElement };
  };

  it('renders the visible amount aria-hidden in a dir isolate and the words in a hidden span (AC-11, AC-12)', () => {
    const { host } = render();
    expect(host.className).toBe('lc-money');
    const [amount, words] = [...host.children] as HTMLElement[];
    expect(host.children).toHaveLength(2);
    expect(amount.className).toBe('lc-money__amount');
    expect(amount.getAttribute('aria-hidden')).toBe('true');
    expect(amount.getAttribute('dir')).toBe('ltr');
    expect(amount.textContent).toBe(`${MINUS}42,17${NBSP}€`);
    expect(words.className).toBe('lc-money__spoken');
    expect(words.textContent).toBe('minus 42,17 Euro');
    expect(words.hasAttribute('aria-hidden')).toBe(false);
    // No role and no aria-label on the host (prohibited on a generic element).
    expect(host.getAttributeNames().filter((n) => n.startsWith('aria') || n === 'role')).toEqual([]);
  });

  it('reads once, in words, inside a sentence (AC-11)', () => {
    const { el } = render();
    expect(computedName(el, el.querySelector('p') as HTMLElement).replace(/\s+/g, ' ')).toBe('Saldo minus 42,17 Euro heute');
  });

  it('formats en-US with the English words (AC-11)', () => {
    const { host } = render({ locale: 'en-US', currency: 'USD' });
    expect(host.querySelector('.lc-money__amount')?.textContent).toBe(`${MINUS}$42.17`);
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('minus 42.17 US dollars');
  });

  it('uses the app LOCALE_ID when locale is empty (default en-US)', () => {
    expect(render({ locale: '' }).host.querySelector('.lc-money__amount')?.textContent).toBe(`${MINUS}€42.17`);
  });

  it('uses a de-DE LOCALE_ID when locale is empty', () => {
    const { host } = render({ locale: '' }, [{ provide: LOCALE_ID, useValue: 'de-DE' }]);
    expect(host.querySelector('.lc-money__amount')?.textContent).toBe(`${MINUS}42,17${NBSP}€`);
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('minus 42,17 Euro');
  });

  it('marks an RTL locale rtl', () => {
    expect(render({ locale: 'he-IL' }).host.querySelector('.lc-money__amount')?.getAttribute('dir')).toBe('rtl');
  });

  it('renders nothing and warns for an amount that is not a safe integer', () => {
    const { host } = render({ amount: 42.17 });
    expect(host.children).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith('[lc-money] amountMinor must be a safe integer');
  });

  it('renders nothing and warns for an unknown currency', () => {
    const { host } = render({ currency: 'EURO' });
    expect(host.children).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith('[lc-money] unknown currency "EURO"');
  });

  it('does not warn for a valid amount', () => {
    render();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('MoneyComponent styles (3.16, AC-12, AC-13)', () => {
  const css = compile(resolve(__dirname, 'money.component.scss')).css;

  it('uses tabular figures, never wraps and sets no colour or font (inherits)', () => {
    const host = css.slice(0, css.indexOf('}'));
    expect(host).toContain('font-variant-numeric: tabular-nums');
    expect(host).toContain('white-space: nowrap');
    expect(host).toContain('display: inline');
    expect(css).not.toMatch(/\bcolor:|font-size:|font-family:/);
  });

  it('is the containing block of the hidden words, so they stay in a scrolling parent', () => {
    expect(css.slice(0, css.indexOf('}'))).toContain('position: relative');
  });

  it('hides the spoken text with the clip pattern and keeps it out of a copy', () => {
    const at = css.indexOf('\n.lc-money__spoken {');
    const rule = css.slice(at, css.indexOf('}', at));
    expect(rule).toContain('clip: rect(0, 0, 0, 0)');
    expect(rule).toContain('user-select: none');
  });
});
