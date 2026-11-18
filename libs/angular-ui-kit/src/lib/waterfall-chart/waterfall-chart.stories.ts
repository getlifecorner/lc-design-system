import type { Meta, StoryObj } from '@storybook/angular';
import { WaterfallChartComponent } from './waterfall-chart.component';

const meta: Meta<WaterfallChartComponent> = {
  title: 'Charts/Waterfall Chart',
  component: WaterfallChartComponent,
  tags: ['autodocs'],
  argTypes: {
    wrapLabels: {
      control: 'boolean',
      description:
        '3.47 (kosten row 6): a category label that would run into a neighbour wraps onto a second line at a space, after a hyphen or at a soft hyphen (U+00AD in the label, drawn as „-“); a line still too wide, or a single word, ends in „…“ with the full label as SVG `<title>` (a tooltip on hover). The chart grows by one line (14 px at 11 px text) only when a label wraps; labels that fit draw as before. Prerendered with estimated widths, measured in the browser. `false`: one line each, as before 3.47',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Waterfall chart component for visualizing cumulative value changes.

**Key Features:**
- Increase, decrease, and total bar types
- Connector lines between bars
- Configurable colors for increase, decrease, and total
- Optional value labels and grid
- Adjustable bar gap spacing
- Responsive SVG rendering
- 3.47: long category labels wrap onto two lines or end in „…“ with a \`<title>\` (\`wrapLabels\`); give long single words a soft hyphen (U+00AD) where they may break
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<WaterfallChartComponent>;

export const Default: Story = {
  args: {
    data: [
      { label: 'Revenue', value: 420, type: 'total' },
      { label: 'COGS', value: -150 },
      { label: 'Gross', value: 270, type: 'total' },
      { label: 'Opex', value: -80 },
      { label: 'Tax', value: -40 },
      { label: 'Net', value: 150, type: 'total' },
    ],
  },
};

export const Simple: Story = {
  args: {
    data: [
      { label: 'Start', value: 100, type: 'total' },
      { label: 'Sales', value: 50 },
      { label: 'Returns', value: -15 },
      { label: 'Discounts', value: -10 },
      { label: 'End', value: 125, type: 'total' },
    ],
    width: 400,
    height: 200,
  },
};

export const MonthlyPL: Story = {
  args: {
    data: [
      { label: 'Jan', value: 200, type: 'total' },
      { label: 'Feb', value: 30 },
      { label: 'Mar', value: -20 },
      { label: 'Apr', value: 45 },
      { label: 'May', value: -35 },
      { label: 'Jun', value: 60 },
      { label: 'Jul', value: -15 },
      { label: 'Total', value: 265, type: 'total' },
    ],
    width: 600,
    height: 280,
  },
};

/** U+00AD: where a long single word may break (drawn as „-“ there only). */
const SHY = '­';

/** 3.47 (request 067, kosten row 6): nine German cause names at 564 px. */
export const GermanCauseNames: Story = {
  name: 'German Cause Names',
  parameters: {
    docs: {
      description: {
        story:
          '3.47 (request 067, kosten row 6, AC-W1 … W5): the variance causes of the finance-intelligence cost page, nine bars at 564 px (each bar 56 px of room). Labels that would run into a neighbour wrap: „Periodi-/sierung“, „Verschie-/bung“ and „Unge-/plant“ break at their soft hyphen (U+00AD in the data), „Nicht/erklärt“ at the space; „Nicht/eingetr…“ still does not fit and shows the full label as a tooltip (SVG `<title>`). „Preis“, „Menge“, „Einmalig“ and „Summe“ fit and draw as before. The chart grows by one line (264 instead of 250 px). The name of the chart (`role="img"`) lists the full labels. At 360 px every label is cut to its 26 px. Switch `wrapLabels` off for the one-line drawing of 3.46.',
      },
    },
  },
  args: {
    width: 564,
    height: 250,
    wrapLabels: true,
    data: [
      { label: `Periodi${SHY}sierung`, value: 6000 },
      { label: `Verschie${SHY}bung`, value: 1200 },
      { label: `Unge${SHY}plant`, value: 25200 },
      { label: 'Nicht eingetreten', value: -2400 },
      { label: 'Preis', value: 2960 },
      { label: 'Menge', value: 1500 },
      { label: 'Einmalig', value: 3000 },
      { label: 'Nicht erklärt', value: 6370 },
      { label: 'Summe', value: 43830, type: 'total' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<div lang="de"><lc-waterfall-chart [data]="data" [width]="width" [height]="height" [wrapLabels]="wrapLabels" /></div>`,
  }),
};

/** 3.47 (request 067, AC-W4): five causes, fluid. */
export const FiveCauses: Story = {
  name: 'Five Causes',
  parameters: {
    docs: {
      description: {
        story:
          '3.47 (request 067, AC-W4): five causes in a fluid chart. At 360 px (328 px wide) „Periodi-/sierung“ and „Nicht/erklärt“ wrap and „Nicht/eingetr…“ is cut with its `<title>`; from 1024 px every label fits on one line and the chart keeps its 250 px.',
      },
    },
  },
  args: {
    wrapLabels: true,
    data: [
      { label: `Periodi${SHY}sierung`, value: 6000 },
      { label: 'Nicht eingetreten', value: -2400 },
      { label: 'Preis', value: 2960 },
      { label: 'Nicht erklärt', value: 6370 },
      { label: 'Summe', value: 12930, type: 'total' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<div lang="de"><lc-waterfall-chart [data]="data" [wrapLabels]="wrapLabels" /></div>`,
  }),
};
