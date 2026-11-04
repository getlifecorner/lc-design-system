import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, isDevMode } from '@angular/core';
import { MONEY_RANGE_GLUE, formatMoney, moneyDirection, moneyRangeParts, type MoneySignDisplay } from './money-format';

/**
 * Displays an amount of money (3.16, BA-4): locale, currency, sign, tabular
 * figures and a spoken text. Display only, no input parsing or conversion.
 *
 * - `amountMinor` is an integer in the currency's minor units (cents, yen,
 *   fils), formatted exactly through a decimal string, never a float. Minor
 *   units follow ISO 4217: 2, except 0 (BIF CLP DJF GNF ISK JPY KMF KRW PYG
 *   RWF UGX UYI VND VUV XAF XOF XPF), 3 (BHD IQD JOD KWD LYD OMR TND) and 4
 *   (CLF UYW).
 * - The visible amount („−42,17 €“, U+2212 minus, a no-break space from
 *   `Intl`) is `aria-hidden`; a visually hidden span holds the words
 *   („minus 42,17 Euro“), so a screen reader reads the amount once.
 * - Tabular figures, no wrapping inside the amount; the amount is a `dir`
 *   isolate (`ltr`, or `rtl` for an RTL locale), safe inside RTL text.
 * - Font and colour come from the context; colour never carries the sign.
 * - `showCurrency=false`: no symbol in the visible amount (a column headed
 *   „Kosten in €“); the spoken text keeps the currency.
 * - `locale` empty: the app's `LOCALE_ID` (Angular's default `en-US`), the
 *   same on the server and in the browser.
 * - A range (3.29, CC-1): `rangeToMinor` adds an upper amount, „9,99 € bis
 *   12,99 €“, read once („9,99 Euro bis 12,99 Euro“). It may wrap before the
 *   joining word, never inside an amount.
 * - For table `formatter`s and texts use {@link formatMoney} and
 *   {@link formatMoneyRange}.
 *
 * Separate a `lc-money` from adjacent text with a space in your template, so
 * the spoken text does not run into the words around it.
 *
 * @example
 * ```html
 * <lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" />
 * <lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="EUR" locale="de-DE" />
 * ```
 */
@Component({
  selector: 'lc-money',
  standalone: true,
  // No whitespace between the spans: the visible amount and the words are separate texts.
  // A range: one aria-hidden `dir` span with both amounts (each a `dir` isolate) and the joining word.
  template:
    '@if (range(); as r) {<span class="lc-money__range" aria-hidden="true" [attr.dir]="dir()"><span class="lc-money__amount" [attr.dir]="dir()">{{ r.from.text }}</span>{{ r.joint }}<span class="lc-money__amount" [attr.dir]="dir()">{{ r.to.text }}</span></span><span class="lc-money__spoken">{{ r.spoken }}</span>} @else if (formatted(); as m) {<span class="lc-money__amount" aria-hidden="true" [attr.dir]="dir()">{{ m.text }}</span><span class="lc-money__spoken">{{ m.spoken }}</span>}',
  styleUrl: './money.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'lc-money', '[class.lc-money--range]': 'range() !== null' },
})
export class MoneyComponent {
  private readonly appLocale = inject(LOCALE_ID);

  /**
   * Amount in minor units of `currency` (cents, yen, fils): a safe integer
   * (±9,007,199,254,740,991), formatted exactly. Anything else renders
   * nothing (a dev warning).
   */
  readonly amountMinor = input.required<number>();

  /**
   * ISO 4217 currency code (`EUR`, `USD`, `JPY`, `KWD`). It sets the minor
   * units and the symbol. Not a three-letter code: renders nothing (a dev
   * warning).
   */
  readonly currency = input.required<string>();

  /**
   * BCP 47 locale of the amount (`de-DE`, `en-GB`). Empty: the app's
   * `LOCALE_ID` (Angular's default `en-US`). An invalid locale falls back to
   * `en-US`.
   * @default ''
   */
  readonly locale = input<string>('');

  /**
   * Which signs show, as `Intl.NumberFormat`: `auto` (negative only),
   * `always`, `exceptZero`, `never`. The spoken text says the sign whenever
   * it shows.
   * @default 'auto'
   */
  readonly signDisplay = input<MoneySignDisplay>('auto');

  /**
   * Spoken word for the minus sign („minus 42,17 Euro“; the same in German).
   * @default 'minus'
   */
  readonly minusLabel = input<string>('minus');

  /**
   * Spoken word for the plus sign („plus 42,17 Euro“; the same in German).
   * @default 'plus'
   */
  readonly plusLabel = input<string>('plus');

  /**
   * Shows the currency symbol in the visible amount. `false` leaves out the
   * symbol and its space („−42,17“) for a table column or a title that
   * already names the unit („Kosten in €“). Screen readers still hear the
   * currency („minus 42,17 Euro“), and `currency` still sets the minor units.
   * Use it only where the unit is visible next to the amount.
   * @default true
   */
  readonly showCurrency = input<boolean>(true);

  /**
   * Upper amount of a range, in minor units of the same `currency` (3.29,
   * CC-1). Shows „9,99 € bis 12,99 €“ (`de-DE`) or "€9.99 to €12.99"
   * (`en-US`) with the same `locale`, `signDisplay` and `showCurrency`, read
   * once („9,99 Euro bis 12,99 Euro“). Rendered as given: no sorting, equal
   * amounts show a range. The range may wrap before the joining word, never
   * inside an amount. Not a safe integer: the single amount (a dev warning).
   * `null`/`undefined`: no range.
   * @default undefined
   */
  readonly rangeToMinor = input<number | null | undefined>(undefined);

  /**
   * Word between the amounts of a range, shown and spoken. Empty: from the
   * locale, „bis“ for German (`de`), "to" for every other locale.
   * @default ''
   */
  readonly rangeSeparatorLabel = input<string>('');

  /** The locale in use: the `locale` input or the app's `LOCALE_ID`. */
  protected readonly effectiveLocale = computed(() => this.locale() || this.appLocale || 'en-US');

  protected readonly formatted = computed(() =>
    formatMoney(this.amountMinor(), this.currency(), {
      locale: this.effectiveLocale(),
      signDisplay: this.signDisplay(),
      minusLabel: this.minusLabel(),
      plusLabel: this.plusLabel(),
      showCurrency: this.showCurrency(),
    }),
  );

  /**
   * The range's parts (3.29): both visible amounts, the joining text between
   * them (the word glued to the second amount by U+00A0, so a line breaks
   * only before it) and the one spoken text. `null`: no range.
   */
  protected readonly range = computed(() => {
    const to = this.rangeToMinor();
    if (to === null || to === undefined || !Number.isSafeInteger(to)) return null;
    const parts = moneyRangeParts(this.amountMinor(), to, this.currency(), {
      locale: this.effectiveLocale(),
      signDisplay: this.signDisplay(),
      minusLabel: this.minusLabel(),
      plusLabel: this.plusLabel(),
      showCurrency: this.showCurrency(),
      separatorLabel: this.rangeSeparatorLabel(),
    });
    if (!parts) return null;
    const { from, to: upper, word } = parts;
    return { from, to: upper, joint: ` ${word}${MONEY_RANGE_GLUE}`, spoken: `${from.spoken} ${word} ${upper.spoken}` };
  });

  protected readonly dir = computed(() => moneyDirection(this.effectiveLocale()));

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      if (!Number.isSafeInteger(this.amountMinor())) {
        console.warn('[lc-money] amountMinor must be a safe integer');
      } else if (!this.formatted()) {
        console.warn(`[lc-money] unknown currency "${this.currency()}"`);
      }
      const to = this.rangeToMinor();
      if (to !== null && to !== undefined && !Number.isSafeInteger(to)) {
        console.warn('[lc-money] rangeToMinor must be a safe integer');
      }
    });
  }
}
