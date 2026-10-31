/**
 * How the sign of an amount shows, as `Intl.NumberFormat`'s `signDisplay`:
 * - `auto`: negative amounts only (−42,17 €)
 * - `always`: plus and minus, also on zero (+0,00 €)
 * - `exceptZero`: plus and minus, no sign on zero
 * - `never`: no sign
 */
export type MoneySignDisplay = 'auto' | 'always' | 'exceptZero' | 'never';

/** Options of {@link formatMoney}. */
export interface MoneyFormatOptions {
  /** BCP 47 locale. An invalid one falls back to `en-US`. @default 'en-US' */
  locale?: string;
  /** As `Intl.NumberFormat`'s `signDisplay`. @default 'auto' */
  signDisplay?: MoneySignDisplay;
  /** Spoken word for the minus sign. @default 'minus' */
  minusLabel?: string;
  /** Spoken word for the plus sign. @default 'plus' */
  plusLabel?: string;
}

/** A formatted amount: the visible text and the words a screen reader speaks. */
export interface MoneyText {
  /** Visible text, e.g. „−42,17 €“ (U+2212 minus, U+00A0 from `Intl`). */
  text: string;
  /** Spoken text, e.g. „minus 42,17 Euro“. */
  spoken: string;
}

/**
 * Minor-unit exponents per ISO 4217 that are not 2. Not `Intl`'s digits:
 * CLDR gives 0 for HUF, IDR, RSD and IQD, which ISO 4217 does not.
 */
const MINOR_UNITS: Readonly<Record<string, number>> = {
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0, PYG: 0,
  RWF: 0, UGX: 0, UYI: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
  CLF: 4, UYW: 4,
};

/** The ISO 4217 minor-unit exponent of `currency` (2 unless listed). */
export function moneyMinorUnits(currency: string): number {
  return MINOR_UNITS[currency.toUpperCase()] ?? 2;
}

/** Primary language subtags written right to left (a fixed list: the same on server and browser). */
const RTL_LANGUAGES = new Set(['ar', 'ckb', 'dv', 'fa', 'he', 'iw', 'ks', 'ps', 'sd', 'ug', 'ur', 'yi']);

/** Text direction of an amount formatted for `locale`. */
export function moneyDirection(locale: string): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.has(locale.split(/[-_]/)[0].toLowerCase()) ? 'rtl' : 'ltr';
}

/** The exact decimal string of an integer amount in minor units: 4217, 2 → "42.17". */
function decimalString(amountMinor: number, digits: number): string {
  const abs = String(Math.abs(amountMinor)).padStart(digits + 1, '0');
  const value = digits === 0 ? abs : `${abs.slice(0, -digits)}.${abs.slice(-digits)}`;
  return amountMinor < 0 ? `-${value}` : value; // −0 has no sign
}

/** `Intl.NumberFormat` for `locale`, or for `en-US` when the locale is invalid. */
function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    return new Intl.NumberFormat('en-US', options);
  }
}

/**
 * Formats an amount of money given in integer minor units (cents, yen, fils)
 * exactly, never through a float: the decimal string goes into `Intl`.
 * Returns `null` for an amount that is not a safe integer or a currency that
 * is not a three-letter code. This is the formatter of `lc-money`, for table
 * `formatter`s and texts.
 *
 * @example
 * ```ts
 * formatMoney(-4217, 'EUR', { locale: 'de-DE' });
 * // { text: '−42,17 €', spoken: 'minus 42,17 Euro' }
 * ```
 */
export function formatMoney(amountMinor: number, currency: string, options: MoneyFormatOptions = {}): MoneyText | null {
  if (!Number.isSafeInteger(amountMinor) || !/^[A-Za-z]{3}$/.test(currency ?? '')) return null;
  const { locale = 'en-US', signDisplay = 'auto', minusLabel = 'minus', plusLabel = 'plus' } = options;
  const digits = moneyMinorUnits(currency);
  const value = decimalString(amountMinor, digits) as unknown as number; // exact decimal string (Intl.NumberFormat v3)
  const base: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency.toUpperCase(),
    signDisplay,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  };
  let visible: Intl.NumberFormatPart[];
  let named: Intl.NumberFormatPart[];
  try {
    visible = numberFormat(locale || 'en-US', base).formatToParts(value);
    named = numberFormat(locale || 'en-US', { ...base, currencyDisplay: 'name' }).formatToParts(value);
  } catch {
    return null;
  }
  const text = visible.map((p) => (p.type === 'minusSign' ? p.value.replace(/-/g, '−') : p.value)).join('');
  const spoken = named
    .map((p) => (p.type === 'minusSign' ? `${minusLabel} ` : p.type === 'plusSign' ? `${plusLabel} ` : p.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return { text, spoken };
}
