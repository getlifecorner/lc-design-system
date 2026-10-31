import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, isDevMode } from '@angular/core';
import { formatMoney, moneyDirection, type MoneySignDisplay } from './money-format';

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
 * - `locale` empty: the app's `LOCALE_ID` (Angular's default `en-US`), the
 *   same on the server and in the browser.
 * - For table `formatter`s and texts use {@link formatMoney}.
 *
 * Separate a `lc-money` from adjacent text with a space in your template, so
 * the spoken text does not run into the words around it.
 *
 * @example
 * ```html
 * <lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" />
 * ```
 */
@Component({
  selector: 'lc-money',
  standalone: true,
  // No whitespace between the spans: the visible amount and the words are separate texts.
  template:
    '@if (formatted(); as m) {<span class="lc-money__amount" aria-hidden="true" [attr.dir]="dir()">{{ m.text }}</span><span class="lc-money__spoken">{{ m.spoken }}</span>}',
  styleUrl: './money.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'lc-money' },
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

  /** The locale in use: the `locale` input or the app's `LOCALE_ID`. */
  protected readonly effectiveLocale = computed(() => this.locale() || this.appLocale || 'en-US');

  protected readonly formatted = computed(() =>
    formatMoney(this.amountMinor(), this.currency(), {
      locale: this.effectiveLocale(),
      signDisplay: this.signDisplay(),
      minusLabel: this.minusLabel(),
      plusLabel: this.plusLabel(),
    }),
  );

  protected readonly dir = computed(() => moneyDirection(this.effectiveLocale()));

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      if (!Number.isSafeInteger(this.amountMinor())) {
        console.warn('[lc-money] amountMinor must be a safe integer');
      } else if (!this.formatted()) {
        console.warn(`[lc-money] unknown currency "${this.currency()}"`);
      }
    });
  }
}
