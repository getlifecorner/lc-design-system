import type { Meta, StoryObj } from '@storybook/angular';
import { StackedBarChartComponent } from './stacked-bar-chart.component';

const meta: Meta<StackedBarChartComponent> = {
  title: 'Charts/Stacked Bar Chart',
  component: StackedBarChartComponent,
  tags: ['autodocs'],

  parameters: {
    docs: {
      description: {
        component: `
Stacked bar chart component for comparing category compositions.

**Key Features:**
- Multiple stacked value segments per category
- Vertical and horizontal orientation
- Optional legend, grid, value labels, and axis labels
- Configurable bar gap spacing
- Color-coded segments with legend mapping
- Responsive SVG rendering
- 3.36: \`variant="band"\`, one horizontal distribution bar edge to edge without axes, grid or paddings (see *Band*)
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['chart', 'band'],
      description:
        '3.36: `chart` (axes, grid, labels, paddings, as before) or `band`: one horizontal bar edge to edge, `height` px thick, scaled 0 … sum, parts split by a 2 px surface gap. One category only (else `chart`); `orientation` is ignored',
      table: { defaultValue: { summary: 'chart' } },
    },
  },
};
export default meta;
type Story = StoryObj<StackedBarChartComponent>;

export const Default: Story = {
  args: {
    categories: [
      { label: 'Q1', values: [30, 20, 10] },
      { label: 'Q2', values: [25, 35, 15] },
      { label: 'Q3', values: [40, 25, 20] },
      { label: 'Q4', values: [35, 30, 25] },
    ],
    legends: [{ label: 'Product A' }, { label: 'Product B' }, { label: 'Product C' }],
  },
};

export const Horizontal: Story = {
  args: {
    categories: [
      { label: 'Team 1', values: [60, 30] },
      { label: 'Team 2', values: [45, 55] },
      { label: 'Team 3', values: [70, 20] },
    ],
    legends: [{ label: 'Completed' }, { label: 'In Progress' }],
    orientation: 'horizontal',
    height: 200,
  },
};

export const TwoSeries: Story = {
  args: {
    categories: [
      { label: 'Jan', values: [40, 20] },
      { label: 'Feb', values: [35, 30] },
      { label: 'Mar', values: [50, 15] },
      { label: 'Apr', values: [45, 25] },
      { label: 'May', values: [55, 20] },
      { label: 'Jun', values: [60, 30] },
    ],
    legends: [{ label: 'Revenue' }, { label: 'Cost' }],
    width: 500,
  },
};

export const WithValues: Story = {
  parameters: {
    docs: { description: { story: '`showValues` prints each segment value (when it fits) and the stack total.' } },
  },
  args: {
    categories: [
      { label: 'Q1', values: [30, 20, 10] },
      { label: 'Q2', values: [25, 35, 15] },
      { label: 'Q3', values: [40, 25, 20] },
    ],
    legends: [{ label: 'Series A' }, { label: 'Series B' }, { label: 'Series C' }],
    showValues: true,
    height: 240,
  },
};

export const NegativeValues: Story = {
  parameters: {
    docs: { description: { story: 'Negative values stack downward from the zero baseline.' } },
  },
  args: {
    categories: [
      { label: 'Jan', values: [40, -15] },
      { label: 'Feb', values: [35, -30] },
      { label: 'Mar', values: [50, -10] },
      { label: 'Apr', values: [20, -45] },
    ],
    legends: [{ label: 'Inflow' }, { label: 'Outflow' }],
    showValues: true,
    height: 240,
  },
};

/** The five parts of the *Band* story, in token colours that keep 3:1 on the surface (design 056 §5). */
const BAND_CATEGORIES = [{ label: 'Verteilung', values: [412, 230, 180, 110, 68] }];
const BAND_LEGENDS = [
  { label: 'Personal', color: 'var(--color-primary-700)' },
  { label: 'Sachkosten', color: 'var(--color-primary-500)' },
  { label: 'IT-Leistungen', color: 'var(--color-info-default)' },
  { label: 'Gebäude', color: 'var(--color-secondary-700)' },
  { label: 'Sonstiges', color: 'var(--color-neutral-500)' },
];

/** 3.36 (request 056, cockpit row 2): „where the money goes“, one band of five parts. */
export const Band: Story = {
  name: 'Band',
  parameters: {
    controls: { include: ['variant', 'height', 'showLegend', 'ariaLabel'] },
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence cockpit row 2): `variant="band"` with one category. The parts fill the host\'s width edge to edge (0 px left and right) at `height` (24 px here), in proportion to their values, scaled from 0 to their sum; no axes, grid, labels or paddings. A 2 px gap in the surface colour splits the parts (`--lc-stacked-bar-chart-band-gap`, `--lc-stacked-bar-chart-band-gap-color`). The part widths are percentages, so the band is exact in prerendered HTML. `ariaLabel` names it; the legend sits below as in `chart`, and the rows below the band in the page carry names and amounts. The five parts use token colours that keep 3:1 against the surface in both themes (`--color-primary-700`, `--color-primary-500`, `--color-info-default`, `--color-secondary-700`, `--color-neutral-500`). First full width, then in a 928 px wrapper.',
      },
    },
  },
  args: {
    variant: 'band',
    height: 24,
    showLegend: true,
    ariaLabel: 'Verteilung der Gesamtkosten: Personal 41 %, Sachkosten 23 %, IT-Leistungen 18 %, Gebäude 11 %, Sonstiges 7 %',
  },
  render: (args) => ({
    // The data as story constants: args left out of `controls.include` reached the template undefined.
    props: { ...args, categories: BAND_CATEGORIES, legends: BAND_LEGENDS },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 32px;">
        <lc-stacked-bar-chart [variant]="variant" [height]="height" [showLegend]="showLegend"
                              [categories]="categories" [legends]="legends" [ariaLabel]="ariaLabel" />
        <div style="max-width: 928px;">
          <lc-stacked-bar-chart [variant]="variant" [height]="height" [showLegend]="showLegend"
                                [categories]="categories" [legends]="legends" [ariaLabel]="ariaLabel" />
        </div>
      </div>`,
  }),
};
