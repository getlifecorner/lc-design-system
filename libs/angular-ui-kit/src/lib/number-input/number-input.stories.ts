import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from './number-input.component';

const meta: Meta<NumberInputComponent> = {
  title: 'Form/Number Input',
  component: NumberInputComponent,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    invalid: {
      control: 'boolean',
      description:
        '3.42 (usm-x row 9): marks the field invalid without a message (error border, `aria-invalid="true"`, `aria-describedby` unchanged), for a form that lists its errors once in a summary that names the field. A set `error` implies it',
      table: { defaultValue: { summary: 'false' } },
    },
    ariaLabel: { control: 'text' },
    locale: {
      control: 'text',
      description:
        "3.29: BCP 47 locale of the shown number; only the decimal separator follows it (`de-DE` „7,5“), no grouping. `''`: a point, as before. Typing accepts `,` and `.` in every locale; the model stays a `number`; blur clamps to `min`/`max`.",
      table: { defaultValue: { summary: "''" } },
    },
    suffix: {
      control: 'text',
      description: '3.29: unit shown after the value inside the field („7,5 %“); not typed, not in the model. With a suffix the value aligns to the end.',
      table: { defaultValue: { summary: "''" } },
    },
    suffixAriaLabel: {
      control: 'text',
      description: "3.29: spoken unit („Prozent“), read once after the value as the field's description. `''` = `suffix`.",
      table: { defaultValue: { summary: "''" } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description:
        '3.29: height of the field and the steppers: `xs` 24, `sm` 32, `md` 40 (as before), `lg` 44 px (touch targets). The value box is 3 / 3.5 / 4 / 4.5 rem wide; 3.43: the CSS hook `--lc-number-input-value-width` widens it for a longer value.',
      table: { defaultValue: { summary: 'md' } },
    },
    valueType: {
      control: 'inline-radio',
      options: ['number', 'string'],
      description:
        "3.43 (usm-x row 13): `'string'` keeps the typed decimal as text: the model and `stringValueChange` carry a string with `.` as the separator (`\"1.50\"`, a 20-digit id), `null` without a digit; nothing passes through a double. The steppers add `step` in decimal at the larger scale (`\"1.50\"` + 0.5 → `\"2.00\"`); blur clamps only a value out of range, at its scale; `locale` changes only the shown separator; `valueChange` does not emit",
      table: { defaultValue: { summary: "'number'" } },
    },
    showSteppers: {
      control: 'boolean',
      description:
        '3.47 (kosten row 5): draws the − and + buttons. `false`: only the value box (and the `suffix`) in the field, as high as with steppers (xs 24, sm 32, md 40, lg 44 px inside the border), for a typed amount where a step of 1 means nothing. ArrowUp/ArrowDown still step by `step`. Size the box with `--lc-number-input-value-width`',
      table: { defaultValue: { summary: 'true' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Number input component with increment/decrement controls.

**Key Features:**
- Increment and decrement buttons (ArrowUp / ArrowDown on the field do the same)
- Configurable min, max, and step values; stepping is rounded to the step's precision
- Non-numeric characters are rejected while typing; the value is clamped on blur
- Helper text and error message linked via \`aria-describedby\`
- Disabled state support
- ControlValueAccessor integration for reactive forms
- 3.47: \`[showSteppers]="false"\` draws only the value box (a typed amount), same height

**CSS hook (3.43):** \`--lc-number-input-value-width\`, on the element or any ancestor, sets the width of the value box between the steppers. Default: the size's width (\`xs\` 3rem, \`sm\` 3.5rem, \`md\` 4rem, \`lg\` 4.5rem). Size it for the longest value, e.g. \`calc(7ch + 0.5rem)\` for „1250,00“ or \`calc(20ch + 0.5rem)\` for a 20-digit id (the digits are tabular, so 1ch is one digit).
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<NumberInputComponent>;

export const Default: Story = {
  args: { label: 'Quantity', min: 0, max: 99, step: 1 },
};

export const WithStep: Story = {
  args: { label: 'Guests', min: 0, max: 50, step: 5 },
};

export const InvalidWithoutMessage: Story = {
  name: 'Invalid Without Message',
  parameters: {
    docs: {
      description: {
        story:
          '3.42 (usm-x row 9): `invalid` gives the error border and `aria-invalid="true"` without a message; a summary elsewhere on the form names the field (see Form/Input *Invalid Without Message (DE)*). The minus is inline since 3.42 (usm-x row 2): no request for `minus.svg`.',
      },
    },
  },
  args: { label: 'Quantity', min: 0, max: 99, step: 1, invalid: true },
};

export const Disabled: Story = {
  args: { label: 'Locked', min: 0, max: 10, step: 1, disabled: true },
};

export const NoLimits: Story = {
  args: { label: 'Value', step: 1 },
};

export const DecimalStep: Story = {
  args: { label: 'Weight', min: 0, max: 5, step: 0.1 },
};

export const WithHelperText: Story = {
  args: { label: 'Seats', min: 1, max: 8, step: 1, helperText: 'Between 1 and 8' },
};

export const WithError: Story = {
  args: { label: 'Seats', min: 1, max: 8, step: 1, error: 'Please enter a value' },
};

export const NoLabel: Story = {
  args: { min: 1, max: 10, step: 1, ariaLabel: 'Amount' },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  args: { label: 'Quantity', min: 0, max: 99, step: 1 },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the increment button is focused as Tab would focus it (in the story view). The steppers show the kit ring inside their edge, because the field clips: 2 px `--color-primary-500`, 2 px inset (4.17:1 light, 7.57:1 dark on the field), so it is clear which control has focus; the field keeps its own focus border. `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.number-input__button--increment')?.focus({ preventScroll: true });
  },
};

/** 3.29 (request 046, regeln rows 3 and 4): German decimal comma, a unit, 44 px targets. */
export const LocaleDeWithSuffix: Story = {
  name: 'Locale DE with suffix %',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046, finance-intelligence rules page): `locale="de-DE" suffix="%" suffixAriaLabel="Prozent" size="lg" [step]="0.5"`. The field shows „7,5 %“: the value in the German format, the unit after it (not typed, not in the model, which stays the number 7.5). Typing „7,5“ or „7.5“ both give 7.5 and show „7,5“; stepping and blur keep the comma; blur clamps to `min`/`max`. A screen reader reads the value and the unit once („7,5, Anteil, Prozent“: the unit is the field\'s description). `size="lg"`: the field and both steppers are 44 px high (WCAG 2.5.8, the app\'s 44 px rule). The second field shows that a long label wraps above the control, which stays as wide as its content.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { share: 7.5, shareOfTotal: 12.5 },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-number-input label="Anteil" locale="de-DE" suffix="%" suffixAriaLabel="Prozent" size="lg"
          [step]="0.5" [min]="0" [max]="100" decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen"
          [(ngModel)]="share" />
        <lc-number-input label="Anteil an den Gesamtkosten in Prozent" locale="de-DE" suffix="%" suffixAriaLabel="Prozent" size="lg"
          [step]="0.5" [min]="0" [max]="100" decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen"
          [(ngModel)]="shareOfTotal" />
      </div>`,
  }),
};

/** 3.29 (request 046, regeln row 4): the four sizes, in English and German. */
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046): `size` sets the height of the field and the steppers as in `lc-input`: `xs` 24, `sm` 32, `md` 40 (the default, unchanged), `lg` 44 px, the touch size (field and both steppers at least 44 × 44 px). Row 1 English with a point, row 2 German (`locale="de-DE"`) with a comma.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div lang="en" style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px;">
          @for (s of sizes; track s) {
            <lc-number-input [size]="s" [label]="'Share (' + s + ')'" [step]="0.5" [ngModel]="7.5" />
          }
        </div>
        <div lang="de" style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px;">
          @for (s of sizes; track s) {
            <lc-number-input [size]="s" [label]="'Anteil (' + s + ')'" locale="de-DE" [step]="0.5" [ngModel]="7.5"
              decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen" />
          }
        </div>
      </div>`,
  }),
};

/** The model as the page would send it: a quoted string or `null`. */
const showModel = (value: unknown) => JSON.stringify(value ?? null);
const MODEL_STYLE = 'font-size: var(--typography-font-size-sm); color: var(--color-text-secondary); margin: 4px 0 0;';

/** 3.43 (request 063, usm-x row 13): the typed decimal as a string. */
export const StringMode: Story = {
  name: 'String Mode',
  parameters: {
    controls: { include: ['valueType'] },
    docs: {
      description: {
        story:
          '3.43 (request 063, usm-x row 13): `valueType="string"` keeps what was typed, for a backend that validates the text itself. The model (forms, `[(ngModel)]`) and `stringValueChange` carry a string with `.` as the separator: "Amount" stays `"1.50"` (not 1.5), and "Case number" holds a 20-digit id that a double would round (`12345678901234567890` is `12345678901234567000` as a number). Nothing passes through a double: the steppers add `step` in decimal and keep the larger scale (`"1.50"` + 0.5 → `"2.00"`, the id + 1 → `…891`), and blur only rewrites a value outside `min`/`max` (to the bound, at the value\'s scale). `valueChange` (number) does not emit in this mode. Below each field, the model. The case number sets `--lc-number-input-value-width: calc(20ch + 0.5rem)`, so all 20 digits show (the default box is 4 rem).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { amount: '1.50', caseNumber: '12345678901234567890', showModel },
    template: `
      <div lang="en" style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
        <div>
          <lc-number-input label="Amount" valueType="string" [step]="0.5" [min]="0" [max]="1000" [(ngModel)]="amount" />
          <p style="${MODEL_STYLE}">Model: <output>{{ showModel(amount) }}</output></p>
        </div>
        <div>
          <lc-number-input label="Case number" valueType="string" [step]="1" [(ngModel)]="caseNumber"
            style="--lc-number-input-value-width: calc(20ch + 0.5rem)" />
          <p style="${MODEL_STYLE}">Model: <output>{{ showModel(caseNumber) }}</output></p>
        </div>
      </div>`,
  }),
};

/** 3.43 (request 063, usm-x row 13): German decimals in string mode, invalid and disabled. */
export const StringModeDe: Story = {
  name: 'String Mode (DE)',
  parameters: {
    controls: { include: ['valueType'] },
    docs: {
      description: {
        story:
          '3.43 (request 063, AC-22, AC-23): `valueType="string" locale="de-DE"`. The field shows „1,50“ and the model stays `"1.50"`: `locale` only changes the shown separator; typing „1,5“ gives `"1.5"`. The second field is invalid with its message, the third disabled. The wrapper sets `--lc-number-input-value-width: calc(7ch + 0.5rem)` for all three, so „1250,00“ fits.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { amount: '1.50', wrong: '1250.00', locked: '19.90', showModel },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 360px; --lc-number-input-value-width: calc(7ch + 0.5rem);">
        <div>
          <lc-number-input label="Betrag" valueType="string" locale="de-DE" [step]="0.5" [min]="0" [max]="1000"
            decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen" [(ngModel)]="amount" />
          <p style="${MODEL_STYLE}">Modell: <output>{{ showModel(amount) }}</output></p>
        </div>
        <lc-number-input label="Betrag (ungültig)" valueType="string" locale="de-DE" [step]="0.5"
          error="Bitte einen Betrag von 0 bis 1.000 eingeben." decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen"
          [(ngModel)]="wrong" />
        <lc-number-input label="Betrag (gesperrt)" valueType="string" locale="de-DE" [step]="0.5" [disabled]="true"
          decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen" [(ngModel)]="locked" />
      </div>`,
  }),
};

/** 3.47 (request 067, kosten row 5): a typed euro amount without steppers. */
export const AmountWithoutSteppers: Story = {
  name: 'Betrag ohne Schrittknöpfe',
  parameters: {
    controls: { include: ['showSteppers'] },
    docs: {
      description: {
        story:
          '3.47 (request 067, kosten row 5): an amount the user types, up to the remaining amount, in a bottom sheet at 360 px. `[showSteppers]="false"`: no − and + (a step of 1 means nothing for euros), the field is the value box and the unit, 44 px high inside its border (`size="lg"`). `locale="de-DE"`, `suffix="€"` (read „Euro“), `valueType="string"` (`"2960.00"` stays exact), `min` 0, `max` 2960 (blur clamps), `step` 0.01 (decimal keyboard; ArrowUp/ArrowDown still step by it). The wrapper sets `--lc-number-input-value-width: calc(7ch + 0.5rem)`, so „2960,00“ fits. The field shows no digit grouping (since 3.29): „2960,00“, not „2.960,00“.',
      },
    },
  },
  args: { showSteppers: false },
  render: (args) => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { ...args, amount: '2960.00' },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 360px; --lc-number-input-value-width: calc(7ch + 0.5rem);">
        <lc-number-input label="Erklärter Betrag" locale="de-DE" suffix="€" suffixAriaLabel="Euro" size="lg"
          [showSteppers]="showSteppers" valueType="string" [min]="0" [max]="2960" [step]="0.01"
          helperText="Höchstens 2960,00 € (Restbetrag)" decrementAriaLabel="Wert verringern" incrementAriaLabel="Wert erhöhen"
          [(ngModel)]="amount" />
      </div>`,
  }),
};

/** 3.47 (request 067, AC-N3): the four sizes without steppers. */
export const SizesWithoutSteppers: Story = {
  name: 'Sizes Without Steppers',
  parameters: {
    docs: {
      description: {
        story:
          '3.47 (request 067, AC-N3): `[showSteppers]="false"` in every size. The field keeps the height it has with steppers: `xs` 24, `sm` 32, `md` 40, `lg` 44 px inside the 1 px border (26, 34, 42, 46 outside); the value box keeps its width (3, 3.5, 4, 4.5 rem, or the hook).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [NumberInputComponent, FormsModule] },
    props: { sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px;">
        @for (s of sizes; track s) {
          <lc-number-input [size]="s" [label]="'Menge (' + s + ')'" locale="de-DE" [showSteppers]="false" [ngModel]="12" />
        }
      </div>`,
  }),
};
