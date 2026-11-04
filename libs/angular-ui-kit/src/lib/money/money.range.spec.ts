import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { MoneyComponent } from './money.component';
import { formatMoney, formatMoneyRange } from './money-format';
import { formatMoneyRange as publicFormatMoneyRange } from './index';
import { computedName } from '../../testing/axe-jsdom';

/** 3.29 (request 046, life-os CC-1): `lc-money` `rangeToMinor` and `formatMoneyRange`. */
const MINUS = '−';
const NBSP = ' ';

describe('formatMoneyRange (3.29, CC-1)', () => {
  it('joins two amounts with the German word, glued to the second amount (AC-19, AC-21)', () => {
    expect(formatMoneyRange(999, 1299, 'EUR', { locale: 'de-DE' })).toEqual({
      text: `9,99${NBSP}€ bis${NBSP}12,99${NBSP}€`,
      spoken: '9,99 Euro bis 12,99 Euro',
    });
  });

  it('uses "to" for English and for every other locale, and en-US by default (AC-19, AC-21)', () => {
    expect(formatMoneyRange(999, 1299, 'EUR', { locale: 'en-US' })?.text).toBe(`€9.99 to${NBSP}€12.99`);
    expect(formatMoneyRange(999, 1299, 'EUR', { locale: 'fr-FR' })?.text).toMatch(new RegExp(`^9,99\\s€ to${NBSP}12,99\\s€$`));
    expect(formatMoneyRange(999, 1299, 'EUR', { locale: 'de-AT' })?.spoken).toContain(' bis ');
    expect(formatMoneyRange(999, 1299, 'USD')?.text).toBe(`$9.99 to${NBSP}$12.99`);
  });

  it('takes the word from separatorLabel, shown and spoken (AC-21)', () => {
    expect(formatMoneyRange(999, 1299, 'EUR', { locale: 'de-DE', separatorLabel: 'zwischen' })).toEqual({
      text: `9,99${NBSP}€ zwischen${NBSP}12,99${NBSP}€`,
      spoken: '9,99 Euro zwischen 12,99 Euro',
    });
  });

  it('applies the single-amount options to both amounts', () => {
    const range = formatMoneyRange(-1299, -999, 'EUR', { locale: 'de-DE', showCurrency: false, minusLabel: 'weniger' });
    expect(range?.text).toBe(`${MINUS}12,99 bis${NBSP}${MINUS}9,99`);
    expect(range?.spoken).toBe('weniger 12,99 Euro bis weniger 9,99 Euro');
  });

  it('keeps the amounts as given: no sorting, equal amounts give a range (AC-23, A-6)', () => {
    expect(formatMoneyRange(1299, 999, 'EUR', { locale: 'de-DE' })?.spoken).toBe('12,99 Euro bis 9,99 Euro');
    expect(formatMoneyRange(999, 999, 'EUR', { locale: 'de-DE' })?.spoken).toBe('9,99 Euro bis 9,99 Euro');
  });

  it('returns null when either amount fails formatMoney', () => {
    expect(formatMoneyRange(999, 12.5, 'EUR')).toBeNull();
    expect(formatMoneyRange(Number.NaN, 1299, 'EUR')).toBeNull();
    expect(formatMoneyRange(999, 1299, 'EURO')).toBeNull();
  });

  it('is exported from the entry, and formatMoney is unchanged (AC-24)', () => {
    expect(publicFormatMoneyRange).toBe(formatMoneyRange);
    expect(formatMoney(-4217, 'EUR', { locale: 'de-DE' })).toEqual({ text: `${MINUS}42,17${NBSP}€`, spoken: 'minus 42,17 Euro' });
  });
});

@Component({
  standalone: true,
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Monatlich <lc-money [amountMinor]="amount()" [rangeToMinor]="to()" currency="EUR" [locale]="locale()" [rangeSeparatorLabel]="word()" /> pro Monat</p>`,
})
class RangeHostComponent {
  readonly amount = signal(999);
  readonly to = signal<number | null | undefined>(1299);
  readonly locale = signal('de-DE');
  readonly word = signal('');
}

describe('MoneyComponent range (3.29, CC-1)', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const render = (patch: { amount?: number; to?: number | null | undefined; locale?: string; word?: string } = {}) => {
    TestBed.configureTestingModule({ imports: [RangeHostComponent] });
    const fixture = TestBed.createComponent(RangeHostComponent);
    const c = fixture.componentInstance;
    if ('amount' in patch) c.amount.set(patch.amount as number);
    if ('to' in patch) c.to.set(patch.to);
    if (patch.locale !== undefined) c.locale.set(patch.locale);
    if (patch.word !== undefined) c.word.set(patch.word);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, host: el.querySelector('lc-money') as HTMLElement };
  };

  it('shows both amounts in one aria-hidden dir span and reads them once (AC-19, AC-20)', () => {
    const { el, host } = render();
    expect(host.className).toBe('lc-money lc-money--range');
    const [range, words] = [...host.children] as HTMLElement[];
    expect(host.children).toHaveLength(2);
    expect(range.className).toBe('lc-money__range');
    expect(range.getAttribute('aria-hidden')).toBe('true');
    expect(range.getAttribute('dir')).toBe('ltr');
    expect(range.textContent).toBe(`9,99${NBSP}€ bis${NBSP}12,99${NBSP}€`);
    const amounts = [...range.querySelectorAll('.lc-money__amount')];
    expect(amounts.map((a) => a.textContent)).toEqual([`9,99${NBSP}€`, `12,99${NBSP}€`]);
    expect(amounts.map((a) => a.getAttribute('dir'))).toEqual(['ltr', 'ltr']);
    expect(words.className).toBe('lc-money__spoken');
    expect(words.textContent).toBe('9,99 Euro bis 12,99 Euro');
    expect(host.querySelectorAll('.lc-money__spoken')).toHaveLength(1);
    expect(computedName(el, el.querySelector('p') as HTMLElement).replace(/\s+/g, ' ')).toBe(
      'Monatlich 9,99 Euro bis 12,99 Euro pro Monat',
    );
  });

  it('formats en-US with "to" (AC-19, AC-21)', () => {
    const { host } = render({ locale: 'en-US' });
    expect(host.querySelector('.lc-money__range')?.textContent).toBe(`€9.99 to${NBSP}€12.99`);
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('9.99 euros to 12.99 euros');
  });

  it('falls back to "to" for fr-FR and takes rangeSeparatorLabel for both texts (AC-21)', () => {
    expect(render({ locale: 'fr-FR' }).host.querySelector('.lc-money__spoken')?.textContent).toMatch(/^9,99 euros to 12,99 euros$/);
    TestBed.resetTestingModule();
    const { host } = render({ word: 'à' , locale: 'fr-FR' });
    expect(host.querySelector('.lc-money__range')?.textContent).toContain(` à${NBSP}12,99`);
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('9,99 euros à 12,99 euros');
  });

  it('keeps each amount a dir isolate in an RTL locale (AC-23)', () => {
    const { host } = render({ locale: 'he-IL' });
    expect(host.querySelector('.lc-money__range')?.getAttribute('dir')).toBe('rtl');
    expect([...host.querySelectorAll('.lc-money__amount')].map((a) => a.getAttribute('dir'))).toEqual(['rtl', 'rtl']);
  });

  it('renders the single amount and warns for a rangeToMinor that is not a safe integer (AC-23)', () => {
    const { host } = render({ to: 12.5 });
    expect(host.className).toBe('lc-money');
    expect(host.querySelector('.lc-money__range')).toBeNull();
    expect(host.querySelector('.lc-money__amount')?.textContent).toBe(`9,99${NBSP}€`);
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('9,99 Euro');
    expect(warn).toHaveBeenCalledWith('[lc-money] rangeToMinor must be a safe integer');
  });

  it('renders equal amounts as a range, as given (AC-23, A-6)', () => {
    const { host } = render({ to: 999 });
    expect(host.querySelector('.lc-money__spoken')?.textContent).toBe('9,99 Euro bis 9,99 Euro');
    expect(warn).not.toHaveBeenCalled();
  });

  it('goes back to the single amount for null and undefined, without a warning (AC-24)', () => {
    const { fixture, host } = render();
    fixture.componentInstance.to.set(null);
    fixture.detectChanges();
    expect(host.className).toBe('lc-money');
    expect(host.querySelector('.lc-money__range')).toBeNull();
    fixture.componentInstance.to.set(undefined);
    fixture.detectChanges();
    expect(host.querySelector('.lc-money__amount')?.textContent).toBe(`9,99${NBSP}€`);
    expect(warn).not.toHaveBeenCalled();
  });
});

@Component({
  standalone: true,
  imports: [MoneyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" />`,
})
class DefaultHostComponent {}

describe('MoneyComponent without a range: unchanged (3.29, AC-24)', () => {
  it('renders the same elements, attributes and text as 3.28 (only Angular comment anchors added)', () => {
    TestBed.configureTestingModule({ imports: [DefaultHostComponent] });
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector('lc-money') as HTMLElement;
    const html = host.innerHTML.replace(/<!--[^]*?-->/g, '').replace(/ _ngcontent-[\w-]+=""/g, '');
    expect(html).toBe(
      `<span aria-hidden="true" class="lc-money__amount" dir="ltr">${MINUS}42,17&nbsp;€</span><span class="lc-money__spoken">minus 42,17 Euro</span>`,
    );
    // The static inputs stay as host attributes, as before; no range attribute or class.
    expect(host.getAttributeNames().filter((n) => !n.startsWith('_ng'))).toEqual(['currency', 'locale', 'class']);
    expect(host.className).toBe('lc-money');
  });
});

describe('MoneyComponent range styles (3.29, AC-22)', () => {
  const css = compile(resolve(__dirname, 'money.component.scss')).css;

  it('lets a range wrap between its amounts, never inside one', () => {
    expect(css).toMatch(/\n:host\(\.lc-money--range\) \{\n\s*white-space: normal;\n\}/);
    expect(css).toMatch(/\n\.lc-money__amount \{\n\s*white-space: nowrap;\n\}/);
  });

  it('keeps the host block first and unchanged (nowrap, tabular, inline, relative)', () => {
    const host = css.slice(0, css.indexOf('}'));
    expect(host.startsWith(':host {')).toBe(true);
    expect(host).toContain('white-space: nowrap');
    expect(host).toContain('font-variant-numeric: tabular-nums');
  });
});
