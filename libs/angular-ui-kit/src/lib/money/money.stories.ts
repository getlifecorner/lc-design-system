import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MoneyComponent } from './money.component';
import { TableComponent } from '../table/table.component';
import { TableCellDirective } from '../table/table-cell.directive';

const meta: Meta<MoneyComponent> = {
  title: 'Data Display/Money',
  component: MoneyComponent,
  parameters: {
    docs: {
      description: {
        component: `
Displays an amount of money (3.16, BA-4). Display only: no input parsing and
no currency conversion.

**Key Features:**
- \`amountMinor\` is an integer in the currency's minor units (cents, yen, fils), formatted exactly up to ±9,007,199,254,740,991 (\`Number.MAX_SAFE_INTEGER\`); anything else renders nothing and warns in dev mode
- Minor units follow ISO 4217: 2, except **0** (BIF CLP DJF GNF ISK JPY KMF KRW PYG RWF UGX UYI VND VUV XAF XOF XPF), **3** (BHD IQD JOD KWD LYD OMR TND) and **4** (CLF UYW)
- \`locale\` empty: the app's \`LOCALE_ID\` (Angular's default \`en-US\`), the same on the server and in the browser
- The visible amount uses U+2212 for minus and the locale's no-break space; it is \`aria-hidden\`, and a visually hidden span holds the words („minus 42,17 Euro“), so a screen reader reads it once
- \`signDisplay\` as \`Intl.NumberFormat\`; the spoken text says „minus“/„plus“ whenever the sign shows (\`minusLabel\`, \`plusLabel\`)
- Tabular figures, no wrapping; the amount is a \`dir\` isolate, safe inside RTL text
- Font and colour come from the context; colour never carries the sign
- \`showCurrency=false\` leaves the symbol and its space out of the visible amount („−42,17“) for a column or title that already names the unit („Kosten in €“); the spoken text keeps the currency
- Put a space between \`lc-money\` and the text around it, so the spoken words don't run together

**Strings for a table \`formatter\` or a text:**

\`\`\`ts
import { formatMoney } from '@lifecorner/angular-ui-kit/money';

formatMoney(-4217, 'EUR', { locale: 'de-DE' });
// { text: '−42,17 €', spoken: 'minus 42,17 Euro' }
formatMoney(-4217, 'EUR', { locale: 'de-DE', showCurrency: false });
// { text: '−42,17', spoken: 'minus 42,17 Euro' }
formatMoneyRange(999, 1299, 'EUR', { locale: 'de-DE' }); // 3.29
// { text: '9,99 € bis 12,99 €', spoken: '9,99 Euro bis 12,99 Euro' }
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    amountMinor: {
      control: 'number',
      description: 'Amount in minor units of the currency (cents, yen, fils); a safe integer',
      table: { defaultValue: { summary: 'required' } },
    },
    currency: {
      control: 'text',
      description: 'ISO 4217 code (EUR, USD, JPY, KWD); sets the minor units and the symbol',
      table: { defaultValue: { summary: 'required' } },
    },
    locale: {
      control: 'text',
      description: "BCP 47 locale; empty uses the app's LOCALE_ID (default en-US)",
      table: { defaultValue: { summary: "''" } },
    },
    signDisplay: {
      control: 'select',
      options: ['auto', 'always', 'exceptZero', 'never'],
      description: 'Which signs show, as Intl.NumberFormat; the spoken text follows',
      table: { defaultValue: { summary: 'auto' } },
    },
    minusLabel: {
      control: 'text',
      description: 'Spoken word for the minus sign',
      table: { defaultValue: { summary: 'minus' } },
    },
    plusLabel: {
      control: 'text',
      description: 'Spoken word for the plus sign',
      table: { defaultValue: { summary: 'plus' } },
    },
    showCurrency: {
      control: 'boolean',
      description: 'Show the currency symbol; false leaves it out (the spoken text keeps the currency)',
      table: { defaultValue: { summary: 'true' } },
    },
    rangeToMinor: {
      control: 'number',
      description:
        '3.29: upper amount of a range in minor units of the same currency, with the same locale, signDisplay and showCurrency: „9,99 € bis 12,99 €“, read once. Rendered as given (no sorting); not a safe integer: the single amount and a dev warning',
      table: { defaultValue: { summary: 'undefined' } },
    },
    rangeSeparatorLabel: {
      control: 'text',
      description: "3.29: word between the amounts of a range, shown and spoken; empty: „bis“ for German (de), 'to' for every other locale",
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<MoneyComponent>;

export const Default: Story = {
  args: {
    amountMinor: -4217,
    currency: 'EUR',
    locale: 'de-DE',
    signDisplay: 'auto',
    minusLabel: 'minus',
    plusLabel: 'plus',
    showCurrency: true,
  },
};

const LOCALES = ['de-DE', 'en-GB', 'en-US'];
const CURRENCIES = ['EUR', 'USD', 'JPY', 'KWD'];
const AMOUNTS = [-4217, 0, 123456789, 9007199254740991];

export const LocalesAndCurrencies: Story = {
  name: 'Locales and Currencies',
  parameters: {
    docs: {
      description: {
        story:
          'EUR and USD have 2 minor units, JPY 0 and KWD 3, so the same `amountMinor` is a different amount. The last column is the largest exact value.',
      },
    },
  },
  render: () => ({
    props: { locales: LOCALES, currencies: CURRENCIES, amounts: AMOUNTS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; font-size: 14px; color: var(--color-text-primary);">
        @for (locale of locales; track locale) {
          <div style="overflow-x: auto;" tabindex="0" role="region" [attr.aria-label]="'Amounts in ' + locale">
            <table style="border-collapse: collapse;" [attr.lang]="locale">
              <caption style="text-align: start; font-weight: 600; padding-bottom: 8px;">{{ locale }}</caption>
              <tbody>
                @for (currency of currencies; track currency) {
                  <tr>
                    <th scope="row" style="text-align: start; padding: 4px 16px 4px 0; font-weight: 500;">{{ currency }}</th>
                    @for (amount of amounts; track amount) {
                      <td style="text-align: end; padding: 4px 0 4px 24px;">
                        <lc-money [amountMinor]="amount" [currency]="currency" [locale]="locale" />
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>`,
  }),
};

const SIGN_MODES = ['auto', 'always', 'exceptZero', 'never'];

export const SignDisplay: Story = {
  name: 'Sign Display',
  parameters: {
    docs: {
      description: {
        story:
          'The four `signDisplay` values for −42,17 €, 0,00 € and 42,17 €. The spoken text says „minus“ or „plus“ exactly when the sign shows.',
      },
    },
  },
  render: () => ({
    props: { modes: SIGN_MODES, amounts: [-4217, 0, 4217] },
    template: `
      <table lang="de" style="border-collapse: collapse; font-size: 14px; color: var(--color-text-primary);">
        <tbody>
          @for (mode of modes; track mode) {
            <tr>
              <th scope="row" style="text-align: start; padding: 4px 24px 4px 0; font-weight: 500;"><code>{{ mode }}</code></th>
              @for (amount of amounts; track amount) {
                <td style="text-align: end; padding: 4px 0 4px 24px;">
                  <lc-money [amountMinor]="amount" currency="EUR" locale="de-DE" [signDisplay]="mode" />
                </td>
              }
            </tr>
          }
        </tbody>
      </table>`,
  }),
};

export const TabularFigures: Story = {
  name: 'Tabular Figures',
  parameters: {
    docs: {
      description: {
        story: 'Tabular figures keep the digits of an end-aligned column under each other: 1.111,11 € is as wide as 8.888,88 €.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: inline-flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 16px; color: var(--color-text-primary);">
        <lc-money [amountMinor]="111111" currency="EUR" locale="de-DE" />
        <lc-money [amountMinor]="888888" currency="EUR" locale="de-DE" />
        <lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" />
        <lc-money [amountMinor]="4217" currency="EUR" locale="de-DE" signDisplay="exceptZero" />
      </div>`,
  }),
};

export const InTextAndRtl: Story = {
  name: 'In Text and RTL',
  parameters: {
    docs: {
      description: {
        story:
          'Inside a sentence the amount takes the font and colour of the text and never wraps. In right-to-left text it stays one left-to-right unit (`dir` isolate).',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 328px; font-size: 16px; line-height: 1.5; color: var(--color-text-primary);">
        <p lang="de" style="margin: 0;">
          Der Kontostand der Familienkasse liegt heute bei <lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" />, nach der Abbuchung der Stromrechnung über <lc-money [amountMinor]="123456" currency="EUR" locale="de-DE" />.
        </p>
        <p lang="en" style="margin: 0; color: var(--color-text-secondary); font-size: 14px;">
          Your balance today is <lc-money [amountMinor]="-4217" currency="EUR" locale="en-GB" /> after the electricity bill of <lc-money [amountMinor]="123456" currency="EUR" locale="en-GB" />.
        </p>
        <p dir="rtl" lang="he" style="margin: 0;">
          היתרה היום היא <lc-money [amountMinor]="-4217" currency="EUR" locale="de-DE" /> לאחר חשבון החשמל.
        </p>
      </div>`,
  }),
};

/** 3.29 (request 046, life-os CC-1): an amount range in one element, read once. */
export const Range: Story = {
  name: 'Range',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046, life-os contract candidates, CC-1): `rangeToMinor` adds the upper amount of a varying series amount, with the same currency, locale, `signDisplay` and `showCurrency`. One element, one spoken reading („9,99 Euro bis 12,99 Euro“; the visible text stays `aria-hidden`), tabular figures on both amounts. The joining word comes from the locale („bis“ for German, "to" for every other locale, here fr-FR) or from `rangeSeparatorLabel`, the same word shown and spoken. It is glued to the second amount, so a narrow column (the 160 px box) wraps only before it, never inside an amount. In RTL text each amount stays a `dir` isolate. Amounts are shown as given. For a table `formatter` use `formatMoneyRange(999, 1299, \'EUR\', { locale: \'de-DE\' }).text`.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 16px; line-height: 1.5; color: var(--color-text-primary);">
        <p lang="en" style="margin: 0;"><code>en-US</code> <lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="EUR" locale="en-US" /></p>
        <p lang="de" style="margin: 0;"><code>de-DE</code> <lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="EUR" locale="de-DE" /></p>
        <p lang="fr" style="margin: 0;"><code>fr-FR</code> <lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="EUR" locale="fr-FR" /></p>
        <p lang="de" style="margin: 0;"><code>de-DE</code> <lc-money [amountMinor]="-1299" [rangeToMinor]="-999" currency="EUR" locale="de-DE" /></p>
        <p dir="rtl" lang="he" style="margin: 0;"><code>he-IL</code> <lc-money [amountMinor]="999" [rangeToMinor]="1299" currency="ILS" locale="he-IL" /></p>
        <div lang="de" style="width: 160px;">
          <lc-money [amountMinor]="123456" [rangeToMinor]="1234567" currency="EUR" locale="de-DE" />
        </div>
      </div>`,
  }),
};

// 3.20 (request 027, finance-intelligence services page): a number column whose
// header names the unit, so the amounts leave the symbol out.
const COSTS = [111111, 888888, 12345678, 0, -4217];

const costTable = (lang: string, locale: string, caption: string, serviceLabel: string, costLabel: string, services: string[]) => ({
  lang,
  locale,
  caption,
  columns: [
    { key: 'service', label: serviceLabel },
    { key: 'cost', label: costLabel, align: 'end' as const },
  ],
  data: services.map((service, i) => ({ id: `${lang}-${i}`, service, cost: COSTS[i] })),
});

const COST_TABLES = [
  costTable('de', 'de-DE', 'Kosten je Service, Oktober 2026', 'Service', 'Kosten in €', [
    'Arbeitsplatz und Endgeräte',
    'Rechenzentrum und Hosting',
    'Netzwerk und Telefonie',
    'Kollaboration und E-Mail',
    'Gutschrift Lizenzrückgabe',
  ]),
  costTable('en', 'en-US', 'Cost per service, October 2026', 'Service', 'Cost in €', [
    'Workplace and devices',
    'Data centre and hosting',
    'Network and telephony',
    'Collaboration and email',
    'Licence return credit',
  ]),
];

export const NumberColumn: Story = {
  name: 'Number Column',
  decorators: [moduleMetadata({ imports: [TableComponent, TableCellDirective] })],
  parameters: {
    docs: {
      description: {
        story:
          'The column header names the unit („Kosten in €“), so each amount leaves the symbol out (`showCurrency=false`): end-aligned, tabular figures, with a zero and a negative row. ' +
          'Screen readers still hear the currency in every cell („minus 42,17 Euro“, „minus 42.17 euros“). ' +
          "For a table `formatter` use `formatMoney(amountMinor, 'EUR', { locale: 'de-DE', showCurrency: false }).text`." +
          ' That string has no spoken text, so the unit is then only in the column header; prefer `lc-money` in a cell template, as in this story.',
      },
    },
  },
  render: () => ({
    props: { tables: COST_TABLES },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        @for (table of tables; track table.lang) {
          <div [attr.lang]="table.lang">
            <lc-table [columns]="table.columns" [data]="table.data" [caption]="table.caption">
              <ng-template lcTableCell="cost" let-row>
                <lc-money [amountMinor]="row.cost" currency="EUR" [locale]="table.locale" [showCurrency]="false" />
              </ng-template>
            </lc-table>
          </div>
        }
      </div>`,
  }),
};
