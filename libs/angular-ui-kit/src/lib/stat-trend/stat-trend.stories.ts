import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { StatTrendComponent, StatTrendLabels } from './stat-trend.component';
import { SparklineComponent } from '../sparkline/sparkline.component';
import { CardComponent } from '../card/card.component';

const meta: Meta<StatTrendComponent> = {
  title: 'Charts/Stat Trend',
  component: StatTrendComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SparklineComponent],
    }),
  ],
  argTypes: {
    direction: {
      control: 'select',
      options: [undefined, 'up', 'down', 'neutral'],
      description: 'Trend direction (arrow and, without `sentiment`, the colour). Auto-detected from `change` if not set.',
      table: { defaultValue: { summary: 'undefined' } },
    },
    sentiment: {
      control: 'select',
      options: [undefined, 'positive', 'negative', 'neutral'],
      description:
        'Whether the change is good or bad, independent of its direction (a rise in costs is negative). Colours the change and the default sparkline; the arrow keeps the direction. Adds a screen-reader text ", up, unfavourable".',
      table: { defaultValue: { summary: 'undefined' } },
    },
    labels: {
      control: 'object',
      description:
        'Words of the screen-reader text when `sentiment` is set: `up`, `down`, `unchanged`, `positive`, `negative`, `neutral`. Missing keys fall back to English (up, down, unchanged, favourable, unfavourable, neutral).',
      table: { defaultValue: { summary: '{}' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Stat trend component for displaying KPI values with change indicators.

**Key Features:**
- Value display with label and optional icon
- Change percentage with auto-detected trend direction (up/down/neutral)
- Color-coded trend indicator (green for up, red for down)
- \`sentiment\` colours by good or bad instead (costs rising = negative); the arrow keeps the direction and a screen-reader text names both
- Optional embedded sparkline chart
- Configurable sparkline color theme
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StatTrendComponent>;

export const UpTrend: Story = {
  args: {
    label: 'Revenue',
    value: '$42,350',
    change: '+12.5%',
    sparklineData: [20, 25, 22, 30, 28, 35, 32, 40, 38, 42],
  },
};

export const DownTrend: Story = {
  args: {
    label: 'Churn Rate',
    value: '3.2%',
    change: '-0.8%',
    sparklineData: [8, 7, 7.5, 6, 5.5, 5, 4.5, 4, 3.5, 3.2],
  },
};

export const Neutral: Story = {
  args: {
    label: 'Users Online',
    value: '1,234',
    change: '0%',
    sparklineData: [120, 125, 118, 122, 120, 123, 119, 121, 124, 123],
  },
};

export const NoSparkline: Story = {
  args: {
    label: 'Total Orders',
    value: '8,421',
    change: '+3.1%',
  },
};

export const ValueOnly: Story = {
  args: {
    value: '99.9%',
    label: 'Uptime',
  },
};

export const DashboardRow: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <lc-stat-trend
          label="Revenue"
          value="$42,350"
          change="+12.5%"
          [sparklineData]="revenueData"
        ></lc-stat-trend>

        <lc-stat-trend
          label="Users"
          value="12,842"
          change="+5.2%"
          [sparklineData]="usersData"
        ></lc-stat-trend>

        <lc-stat-trend
          label="Bounce Rate"
          value="24.3%"
          change="-2.1%"
          [sparklineData]="bounceData"
        ></lc-stat-trend>

        <lc-stat-trend
          label="Avg Session"
          value="4m 32s"
          change="0%"
          [sparklineData]="sessionData"
        ></lc-stat-trend>
      </div>
    `,
    props: {
      revenueData: [20, 25, 22, 30, 28, 35, 32, 40, 38, 42],
      usersData: [100, 110, 105, 115, 120, 118, 125, 128, 130, 128],
      bounceData: [35, 32, 30, 28, 27, 26, 25, 24, 25, 24],
      sessionData: [4.2, 4.5, 4.3, 4.6, 4.4, 4.5, 4.3, 4.5, 4.6, 4.5],
    },
    moduleMetadata: {
      imports: [StatTrendComponent],
    },
  }),
};

export const WithIcon: Story = {
  args: {
    label: 'Portfolio Equity',
    value: '$125,430',
    change: '+2.4%',
    icon: 'arrow-trending-up',
    sparklineData: [100, 105, 102, 110, 115, 112, 120, 118, 125],
  },
};

export const CardWrapped: Story = {
  render: () => ({
    template: `
      <lc-card variant="outlined" padding="md" borderRadius="md">
        <lc-stat-trend
          label="Revenue"
          value="$42,350"
          change="+12.5%"
          icon="currency-dollar"
          [sparklineData]="data"
        ></lc-stat-trend>
      </lc-card>
    `,
    props: {
      data: [20, 25, 22, 30, 28, 35, 32, 40, 38, 42],
    },
    moduleMetadata: {
      imports: [StatTrendComponent, CardComponent],
    },
  }),
};

export const CardDashboard: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Revenue"
            value="$42,350"
            change="+12.5%"
            icon="currency-dollar"
            [sparklineData]="revenueData"
          ></lc-stat-trend>
        </lc-card>

        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Users"
            value="12,842"
            change="+5.2%"
            icon="users"
            [sparklineData]="usersData"
          ></lc-stat-trend>
        </lc-card>

        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Bounce Rate"
            value="24.3%"
            change="-2.1%"
            icon="arrow-trending-down"
            [sparklineData]="bounceData"
          ></lc-stat-trend>
        </lc-card>

        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Avg Session"
            value="4m 32s"
            change="0%"
            icon="clock"
            [sparklineData]="sessionData"
          ></lc-stat-trend>
        </lc-card>
      </div>
    `,
    props: {
      revenueData: [20, 25, 22, 30, 28, 35, 32, 40, 38, 42],
      usersData: [100, 110, 105, 115, 120, 118, 125, 128, 130, 128],
      bounceData: [35, 32, 30, 28, 27, 26, 25, 24, 25, 24],
      sessionData: [4.2, 4.5, 4.3, 4.6, 4.4, 4.5, 4.3, 4.5, 4.6, 4.5],
    },
    moduleMetadata: {
      imports: [StatTrendComponent, CardComponent],
    },
  }),
};

/** German words of the screen-reader text (design 019 §7). */
const DE_LABELS: StatTrendLabels = {
  up: 'gestiegen',
  down: 'gesunken',
  unchanged: 'unverändert',
  positive: 'günstig',
  negative: 'ungünstig',
  neutral: 'neutral',
};

/**
 * Costs (request 019, G4): a rise in costs is bad, so `sentiment="negative"`
 * colours "+3,1 %" in the error colours while the arrow still points up. A
 * screen reader hears "+3,1 %, gestiegen, ungünstig" (German `labels`).
 */
export const Costs: Story = {
  args: {
    label: 'Kosten (Monat)',
    value: '48,2 Mio. €',
    change: '+3,1 %',
    sentiment: 'negative',
    labels: DE_LABELS,
    sparklineData: [44.1, 44.8, 45.2, 45.0, 45.9, 46.4, 46.1, 47.0, 47.6, 48.2],
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de">
        <lc-card variant="outlined" padding="md" borderRadius="md" style="display: inline-block;">
          <lc-stat-trend
            [label]="label"
            [value]="value"
            [change]="change"
            [sentiment]="sentiment"
            [labels]="labels"
            [sparklineData]="sparklineData"
          ></lc-stat-trend>
        </lc-card>
      </div>
    `,
    moduleMetadata: {
      imports: [StatTrendComponent, CardComponent],
    },
  }),
};

/**
 * Sentiment (request 019, G4): the same arrows, coloured by what the change
 * means. Costs +3.1% is negative, churn -0.8% positive, a budget variance of
 * +0.4% neutral. Each pill carries a hidden ", up, unfavourable" text.
 */
export const Sentiment: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Costs"
            value="€48.2m"
            change="+3.1%"
            sentiment="negative"
            [sparklineData]="costsData"
          ></lc-stat-trend>
        </lc-card>

        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Churn"
            value="3.2%"
            change="-0.8%"
            sentiment="positive"
            [sparklineData]="churnData"
          ></lc-stat-trend>
        </lc-card>

        <lc-card variant="outlined" padding="md" borderRadius="md">
          <lc-stat-trend
            label="Budget variance"
            value="€0.2m"
            change="+0.4%"
            sentiment="neutral"
            [sparklineData]="varianceData"
          ></lc-stat-trend>
        </lc-card>
      </div>
    `,
    props: {
      costsData: [44.1, 44.8, 45.2, 45.0, 45.9, 46.4, 46.1, 47.0, 47.6, 48.2],
      churnData: [8, 7, 7.5, 6, 5.5, 5, 4.5, 4, 3.5, 3.2],
      varianceData: [0.1, 0.15, 0.12, 0.18, 0.14, 0.16, 0.2, 0.17, 0.19, 0.2],
    },
    moduleMetadata: {
      imports: [StatTrendComponent, CardComponent],
    },
  }),
};
