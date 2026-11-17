import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LineChartComponent } from './line-chart.component';

const meta: Meta<LineChartComponent> = {
  title: 'Charts/Line Chart',
  component: LineChartComponent,
  tags: ['autodocs'],

  parameters: {
    docs: {
      description: {
        component: `
Line chart component for visualizing data trends.

**Key Features:**
- Multiple data series support
- Smooth or linear curve interpolation
- Optional area fill below lines
- Configurable grid, axis labels, dots, and legend
- Responsive SVG rendering with configurable dimensions
- 3.43: gaps (\`null\` in \`LineChartSeries.data\`) and dashed series (\`LineChartSeries.dashed\`), see *Gaps And Forecast*
`,
      },
    },
  },
  argTypes: {
    series: {
      control: 'object',
      description:
        '`LineChartSeries[]`: `{ label, data, color?, dashed?, dotted? }`. 3.43: a `null` in `data` is no value (no point, the line breaks there; a lone value between gaps is a dot; the scale and the summary skip it). `dashed: true` draws the series 3 × / 2 × `strokeWidth` (6/4 px) in its colour, in the plot and the legend swatch. 3.45: `dotted: true` draws round dots `strokeWidth` wide every 2 × `strokeWidth`, also in the legend; it wins over `dashed`',
      table: { defaultValue: { summary: 'required (dashed: false, dotted: false)' } },
    },
    ariaLabel: {
      control: 'text',
      description:
        "Accessible name; empty generates an English summary per series (3.43: '8 points, 4 with no value, 38 to 52'). Pass a German text here",
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<LineChartComponent>;

export const SingleSeries: Story = {
  args: {
    series: [
      { label: 'Revenue', data: [20, 35, 28, 42, 55, 48, 62, 70, 58, 75, 68, 80] },
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    width: 500,
    height: 250,
  },
};

export const MultipleSeries: Story = {
  args: {
    series: [
      { label: 'Revenue', data: [20, 35, 28, 42, 55, 48, 62, 70] },
      { label: 'Costs', data: [15, 20, 22, 25, 28, 30, 35, 32] },
      { label: 'Profit', data: [5, 15, 6, 17, 27, 18, 27, 38] },
    ],
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
    showLegend: true,
    width: 500,
    height: 250,
  },
};

export const Filled: Story = {
  args: {
    series: [
      { label: 'Users', data: [100, 150, 130, 180, 220, 200, 260, 300], color: 'var(--color-primary-500)' },
    ],
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    filled: true,
    width: 500,
    height: 250,
  },
};

export const StraightLines: Story = {
  args: {
    series: [
      { label: 'Temperature', data: [5, 8, 12, 18, 22, 25, 28, 26, 20, 14, 8, 4] },
    ],
    labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    smooth: false,
    width: 500,
    height: 250,
  },
};

export const NoDots: Story = {
  args: {
    series: [
      { label: 'Requests', data: [450, 520, 480, 600, 550, 700, 680, 750, 720, 800] },
    ],
    showDots: false,
    filled: true,
    width: 500,
    height: 200,
  },
};

export const Compact: Story = {
  args: {
    series: [
      { label: 'CPU', data: [30, 45, 60, 42, 55, 70, 50, 65] },
    ],
    width: 250,
    height: 120,
    showGrid: false,
    showXLabels: false,
    showYLabels: false,
    strokeWidth: 1.5,
  },
};

const PLAN = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50];

export const GapsAndForecast: Story = {
  name: 'Gaps And Forecast',
  parameters: {
    docs: {
      description: {
        story:
          '3.43 (request 063, finance-intelligence kosten-2026-11-17 row 2): `null` is no value. *Actual* has gaps in April, June, November and December: the line breaks there, and May, alone between two gaps, is still a dot. *Forecast* is `dashed` (6/4 px, butt caps, in its colour, also in the legend) and starts at October with the last actual value, so it joins the actuals. The scale and the generated summary skip the gaps ("8 points, 4 with no value, 38 to 52"). The legend names every series, so the dash is not the only cue. 3.45 (backlog 063-n1): *Plan* is `dotted` (2 px dots every 4 px, also in the legend), so Plan, Actual and Forecast differ by more than colour: dotted, solid, dashed.',
      },
    },
  },
  args: {
    series: [
      { label: 'Plan', data: PLAN, color: 'var(--color-secondary-500)', dotted: true },
      { label: 'Actual', data: [38, 41, 43, null, 45, null, 44, 49, 50, 52, null, null], color: 'var(--color-primary-500)' },
      {
        label: 'Forecast',
        data: [null, null, null, null, null, null, null, null, null, 52, 54, 55],
        color: 'var(--color-primary-500)',
        dashed: true,
      },
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    showLegend: true,
    width: 500,
    height: 240,
  },
};

export const GapsAndForecastDe: Story = {
  name: 'Gaps And Forecast (DE)',
  decorators: [moduleMetadata({ imports: [LineChartComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.43 (request 063, AC-12): the „Kosten“ chart in German. *Ist* runs through October, *Prognose* is dashed from October to December, *Plan* is dotted all year (3.45, backlog 063-n1: before, solid). The chart has no locale input: the German name comes through `ariaLabel`.',
      },
    },
  },
  args: {
    series: [
      { label: 'Plan', data: PLAN, color: 'var(--color-secondary-500)', dotted: true },
      { label: 'Ist', data: [38, 41, 43, 40, 45, 47, 44, 49, 50, 52, null, null], color: 'var(--color-primary-500)' },
      {
        label: 'Prognose',
        data: [null, null, null, null, null, null, null, null, null, 52, 54, 55],
        color: 'var(--color-primary-500)',
        dashed: true,
      },
    ],
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    showLegend: true,
    width: 500,
    height: 240,
    ariaLabel:
      'Liniendiagramm, Kosten in Tausend Euro: Plan (12 Werte, 40 bis 50), Ist (10 Werte, 2 ohne Wert, 38 bis 52), Prognose (3 Werte, 9 ohne Wert, 52 bis 55)',
  },
  render: (args) => ({
    props: args,
    template: `
      <figure lang="de" style="margin: 0;">
        <figcaption style="margin: 0 0 8px; font-size: var(--typography-font-size-sm); font-weight: var(--typography-font-weight-semibold); color: var(--color-text-primary);">Kosten in Tsd. €</figcaption>
        <lc-line-chart
          [series]="series"
          [labels]="labels"
          [showLegend]="showLegend"
          [width]="width"
          [height]="height"
          [ariaLabel]="ariaLabel"
        />
      </figure>
    `,
  }),
};
