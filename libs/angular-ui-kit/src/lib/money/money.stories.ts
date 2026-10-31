import type { Meta, StoryObj } from '@storybook/angular';
import { MoneyComponent } from './money.component';

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
- Put a space between \`lc-money\` and the text around it, so the spoken words don't run together

**Strings for a table \`formatter\` or a text:**

\`\`\`ts
import { formatMoney } from '@lifecorner/angular-ui-kit/money';

formatMoney(-4217, 'EUR', { locale: 'de-DE' });
// { text: '−42,17 €', spoken: 'minus 42,17 Euro' }
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
