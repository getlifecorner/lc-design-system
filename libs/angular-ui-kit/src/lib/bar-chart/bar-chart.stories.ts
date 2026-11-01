import type { Meta, StoryObj } from '@storybook/angular';
import { BarChartComponent, BarChartItem, BarChartValueFormatter } from './bar-chart.component';
import { CardComponent } from '../card/card.component';

const meta: Meta<BarChartComponent> = {
  title: 'Charts/Bar Chart',
  component: BarChartComponent,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description:
        'The bars: `{ value, label?, color?, valueText? }`. `valueText` is shown as the bar\'s value and read in the generated aria label instead of the formatted value, as given (the kit never computes it); an empty string shows no value',
      table: { defaultValue: { summary: 'required' } },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Bar orientation',
      table: { defaultValue: { summary: "'vertical'" } },
    },
    labelLayout: {
      control: 'select',
      options: ['axis', 'wrap'],
      description:
        "How the category labels are set. `'axis'`: one line of SVG text on the category axis (a fixed 40 px band left of a horizontal bar). `'wrap'`: HTML text that wraps and follows the text size; a horizontal chart becomes rows (label and value on a line, the bar below across the full width; `height`, `barGap` and `showGrid` don't apply), a vertical chart wraps each label within its column",
      table: { defaultValue: { summary: "'axis'" } },
    },
    formatValue: {
      control: false,
      description:
        "Formats the value labels and the axis ticks: `(value, item?) => string`. A bar passes its item, an axis tick passes none (`item` is `undefined`); an item's `valueText` wins",
      table: { defaultValue: { summary: 'float-safe String(value)' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Bar chart component for comparing categorical data.

**Key Features:**
- Vertical and horizontal orientation
- Per-bar or uniform color support
- Optional value labels on bars
- Configurable grid and axis labels
- Adjustable bar gap spacing
- Responsive SVG rendering
- \`labelLayout="wrap"\`: labels that wrap instead of running out of the chart, at any width and text size, also before JavaScript runs (a horizontal chart becomes a ranking: label and value on a line, the bar below)
- Per-bar text: \`valueText\` on an item, or a \`formatValue(value, item)\` that reads the item ("313.000,00 · 54,8 %" with the share from the data); the generated aria label reads the same text

**CSS hooks** (horizontal \`'wrap'\` rows): \`--lc-bar-chart-bar-size\` (bar thickness, default \`0.75rem\`), \`--lc-bar-chart-row-gap\` (space between rows, default \`var(--spacing-4)\`).
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<BarChartComponent>;

export const Default: Story = {
  args: {
    data: [
      { value: 45, label: 'Jan' },
      { value: 72, label: 'Feb' },
      { value: 58, label: 'Mar' },
      { value: 90, label: 'Apr' },
      { value: 65, label: 'May' },
      { value: 82, label: 'Jun' },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    data: [
      { value: 120, label: 'Series A' },
      { value: 95, label: 'Series B' },
      { value: 78, label: 'Series C' },
      { value: 45, label: 'Series D' },
      { value: 30, label: 'Series E' },
    ],
    orientation: 'horizontal',
    height: 250,
  },
};

export const SingleColor: Story = {
  args: {
    data: [
      { value: 30, label: 'Mon' },
      { value: 65, label: 'Tue' },
      { value: 42, label: 'Wed' },
      { value: 78, label: 'Thu' },
      { value: 55, label: 'Fri' },
    ],
    color: 'var(--color-primary-500)',
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { value: 85, label: 'Q1', color: 'var(--color-success-default)' },
      { value: 60, label: 'Q2', color: 'var(--color-warning-default)' },
      { value: 95, label: 'Q3', color: 'var(--color-info-default)' },
      { value: 45, label: 'Q4', color: 'var(--color-error-default)' },
    ],
    width: 300,
    height: 180,
  },
};

export const NegativeValues: Story = {
  parameters: {
    docs: { description: { story: 'Negative values hang below the zero baseline; the grid extends to cover them.' } },
  },
  args: {
    data: [
      { value: 42, label: 'Q1' },
      { value: -18, label: 'Q2' },
      { value: 25, label: 'Q3' },
      { value: -30, label: 'Q4' },
      { value: 12, label: 'Q5' },
    ],
    height: 220,
  },
};

export const CustomFormat: Story = {
  parameters: {
    docs: { description: { story: '`formatValue` formats both the value labels and the axis ticks.' } },
  },
  args: {
    data: [
      { value: 0.42, label: 'A' },
      { value: 0.8, label: 'B' },
      { value: 0.15, label: 'C' },
      { value: 1, label: 'D' },
    ],
    formatValue: (v: number) => `${Math.round(v * 100)}%`,
    height: 200,
  },
};

export const NoGrid: Story = {
  args: {
    data: [
      { value: 45, label: 'A' },
      { value: 72, label: 'B' },
      { value: 58, label: 'C' },
    ],
    showGrid: false,
    width: 250,
    height: 150,
  },
};

export const Wide: Story = {
  args: {
    data: [
      { value: 20, label: 'Jan' },
      { value: 35, label: 'Feb' },
      { value: 28, label: 'Mar' },
      { value: 42, label: 'Apr' },
      { value: 55, label: 'May' },
      { value: 48, label: 'Jun' },
      { value: 62, label: 'Jul' },
      { value: 70, label: 'Aug' },
      { value: 58, label: 'Sep' },
      { value: 75, label: 'Oct' },
      { value: 68, label: 'Nov' },
      { value: 80, label: 'Dec' },
    ],
    width: 600,
    height: 250,
    color: 'var(--color-info-default)',
  },
};

// ---------------------------------------------------------------------------
// labelLayout="wrap", valueText and formatValue(value, item) (3.21, request 028:
// finance-intelligence cockpit, card "Teuerste Services"). Each chart sits in
// an outlined lc-card with padding md, as on the cockpit page; `lang` on the
// card lets long German words hyphenate.
// ---------------------------------------------------------------------------

/** An outlined card (padding md, at most 46rem) with a title and subtitle around a chart. */
const card = (lang: string, title: string, subtitle: string, chart: string) => `
  <lc-card variant="outlined" padding="md" lang="${lang}" title="${title}" subtitle="${subtitle}" style="max-width: 46rem">
    ${chart}
  </lc-card>`;

const NBSP = ' ';
const MINUS = '−';

const RANKING_DE: BarChartItem[] = [
  { value: 313000, label: 'Demo Applikation', valueText: `313.000,00 · 54,8${NBSP}%` },
  { value: 180000, label: 'Demo Arbeitsplatz', valueText: `180.000,00 · 31,5${NBSP}%` },
  { value: 78000, label: 'Demo Netz', valueText: `78.000,00 · 13,7${NBSP}%` },
];

/** An item that carries its share from the API; the page never computes it. */
interface ShareItem extends BarChartItem {
  share: number;
}

const RANKING_EN: ShareItem[] = [
  { value: 313000, label: 'Demo application', share: 0.548 },
  { value: 180000, label: 'Demo workplace', share: 0.315 },
  { value: 78000, label: 'Demo network', share: 0.137 },
];

const EN_AMOUNT = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const EN_SHARE = new Intl.NumberFormat('en-GB', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Amount and share for a bar ("313,000.00 · 54.8%"), the amount alone for an axis tick (no item). */
const amountAndShare: BarChartValueFormatter = (value, item) =>
  item ? `${EN_AMOUNT.format(value)} · ${EN_SHARE.format((item as ShareItem).share)}` : EN_AMOUNT.format(value);

export const RankingInACard: Story = {
  name: 'Ranking In A Card',
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal chart with `labelLayout="wrap"` in an outlined card: per bar the label and its value on one line, the bar below across the full width. The value is the item\'s `valueText` ("313.000,00 · 54,8 %", the share comes from the data), and the German `ariaLabel` reads the same text. At 360 px every label shows in full inside the card, also at 200 % text, without scrolling.',
      },
    },
  },
  args: {
    data: RANKING_DE,
    orientation: 'horizontal',
    labelLayout: 'wrap',
    color: 'var(--color-primary-500)',
    ariaLabel: `Teuerste Services: ${RANKING_DE.map((i) => `${i.label} ${i.valueText}`).join(', ')}`,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BarChartComponent, CardComponent] },
    template: card(
      'de',
      'Teuerste Services',
      'Plan 2026 in €',
      `<lc-bar-chart [data]="data" [orientation]="orientation" [labelLayout]="labelLayout" [color]="color" [ariaLabel]="ariaLabel" />`
    ),
  }),
};

export const RankingInACardEnglish: Story = {
  name: 'Ranking In A Card English',
  parameters: {
    docs: {
      description: {
        story:
          'The same ranking in English, with `formatValue(value, item)` instead of `valueText`: a bar passes its item, so the formatter adds the share the item carries ("313,000.00 · 54.8%"); an axis tick passes no item. The generated aria label reads the same text per bar.',
      },
    },
  },
  args: {
    data: RANKING_EN,
    orientation: 'horizontal',
    labelLayout: 'wrap',
    color: 'var(--color-primary-500)',
    formatValue: amountAndShare,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BarChartComponent, CardComponent] },
    template: card(
      'en',
      'Most expensive services',
      'Plan 2026 in €',
      `<lc-bar-chart [data]="data" [orientation]="orientation" [labelLayout]="labelLayout" [color]="color" [formatValue]="formatValue" />`
    ),
  }),
};

export const RankingLongLabels: Story = {
  name: 'Ranking Long Labels',
  parameters: {
    docs: {
      description: {
        story:
          'Long German labels in `labelLayout="wrap"` rows: when the label and the value don\'t fit on one line, the value moves under the label, right-aligned; a long compound hyphenates (needs `lang`). Nothing leaves the card at 360 px or at 200 % text.',
      },
    },
  },
  args: {
    data: [
      { value: 1234567.89, label: 'Betriebsmittelverwaltung Standort Nord', valueText: `1.234.567,89 · 61,2${NBSP}%` },
      { value: 512000, label: 'Rechenzentrumsinfrastruktur Süd', valueText: `512.000,00 · 25,4${NBSP}%` },
      { value: 271000, label: 'Demo Netz', valueText: `271.000,00 · 13,4${NBSP}%` },
    ],
    orientation: 'horizontal',
    labelLayout: 'wrap',
    color: 'var(--color-primary-500)',
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BarChartComponent, CardComponent] },
    template: card(
      'de',
      'Teuerste Services',
      'Plan 2026 in €',
      `<lc-bar-chart [data]="data" [orientation]="orientation" [labelLayout]="labelLayout" [color]="color" />`
    ),
  }),
};

export const RankingNegativeValues: Story = {
  name: 'Ranking Negative Values',
  parameters: {
    docs: {
      description: {
        story:
          'Negative values in `labelLayout="wrap"` rows: a zero line runs through every track and negative bars grow left from it. The sign is in the text (`valueText` with U+2212).',
      },
    },
  },
  args: {
    data: [
      { value: 120000, label: 'Demo Applikation', valueText: '120.000,00' },
      { value: -45000, label: 'Demo Arbeitsplatz', valueText: `${MINUS}45.000,00` },
      { value: 30000, label: 'Demo Netz', valueText: '30.000,00' },
    ],
    orientation: 'horizontal',
    labelLayout: 'wrap',
    color: 'var(--color-primary-500)',
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BarChartComponent, CardComponent] },
    template: card(
      'de',
      'Ergebnis je Service',
      'Plan 2026 in €',
      `<lc-bar-chart [data]="data" [orientation]="orientation" [labelLayout]="labelLayout" [color]="color" />`
    ),
  }),
};

export const WrappedColumnLabels: Story = {
  name: 'Wrapped Column Labels',
  parameters: {
    docs: {
      description: {
        story:
          'A vertical chart with `labelLayout="wrap"`: the plot stays SVG, and each category label wraps within its column under the chart, so neighbouring labels never overlap at 360 px. With `\'axis\'` (the default) short labels such as "Q1" render as before.',
      },
    },
  },
  args: {
    data: [
      { value: 313, label: 'Demo Applikation' },
      { value: 180, label: 'Demo Arbeitsplatz' },
      { value: 78, label: 'Demo Netz' },
    ],
    orientation: 'vertical',
    labelLayout: 'wrap',
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BarChartComponent, CardComponent] },
    template: card(
      'de',
      'Teuerste Services',
      'Plan 2026 in Tsd. €',
      `<lc-bar-chart [data]="data" [orientation]="orientation" [labelLayout]="labelLayout" />`
    ),
  }),
};
