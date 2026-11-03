import type { Meta, StoryObj } from '@storybook/angular';
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
