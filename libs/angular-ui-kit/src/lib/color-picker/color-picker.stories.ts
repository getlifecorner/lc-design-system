import type { Meta, StoryObj } from '@storybook/angular';
import { ColorPickerComponent } from './color-picker.component';

const meta: Meta<ColorPickerComponent> = {
  title: 'Form/Color Picker',
  component: ColorPickerComponent,
  argTypes: {
    showInput: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },

  parameters: {
    docs: {
      description: {
        component: `
Color picker component for selecting colors from swatches or custom input.

**Key Features:**
- Predefined color swatch palette (a radiogroup — Arrow keys / Home / End move the selection)
- Native browser color picker integration, labelled by \`label\`
- Hex color text input with validation
- Disabled state support
- ControlValueAccessor integration for reactive forms
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ColorPickerComponent>;

export const Default: Story = {
  args: { label: 'Farbe wählen', showInput: true },
};

export const CustomSwatches: Story = {
  args: {
    label: 'Markenfarben',
    swatches: ['#1e40af', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    showInput: true,
  },
};

export const NoInput: Story = {
  args: { label: 'Farbe', showInput: false },
};

export const Disabled: Story = {
  args: { label: 'Gesperrt', disabled: true },
};

export const NoSwatches: Story = {
  args: { label: 'Freie Auswahl', swatches: [], showInput: true },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  args: { label: 'Farbe wählen', showInput: true },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the native colour input is focused as Tab would focus it (in the story view). It shows the kit ring instead of the browser default (2.29:1 in dark): 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 9.95:1 dark on the page), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.color-picker__native')?.focus({ preventScroll: true });
  },
};
