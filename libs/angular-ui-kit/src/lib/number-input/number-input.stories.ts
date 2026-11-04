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
      description: '3.29: height of the field and the steppers: `xs` 24, `sm` 32, `md` 40 (as before), `lg` 44 px (touch targets).',
      table: { defaultValue: { summary: 'md' } },
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
