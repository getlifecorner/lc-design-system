import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { StateStripComponent, type StateStripLabels, type StateStripSegment, type StateStripState } from './state-strip.component';
import { CardComponent } from '../card/card.component';
import { DescriptionListComponent } from '../description-list/description-list.component';

/** The German state words of the requester's source cards. */
const GERMAN: StateStripLabels = { success: 'geladen', warning: 'teilweise geladen', error: 'fehlgeschlagen', neutral: 'ausstehend' };

/** Runs on consecutive days at 06:00, oldest first. */
const runs = (states: StateStripState[], de = false): StateStripSegment[] =>
  states.map((state, i) => ({
    state,
    label: de ? `${String((i % 28) + 1).padStart(2, '0')}.10., 06:00` : `Oct ${(i % 28) + 1}, 6:00`,
  }));

/** Nine loaded runs and one failed one (the ninth). */
const NINE_ONE: StateStripState[] = [...Array(8).fill('success'), 'error', 'success'];

const meta: Meta<StateStripComponent> = {
  title: 'Data Display/State Strip',
  component: StateStripComponent,
  decorators: [moduleMetadata({ imports: [CardComponent, DescriptionListComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
The states of the last runs at a glance (3.36, finance-intelligence quellen row 1): one segment per run, oldest first.

**Key Features:**
- The state is a shape, not only a colour: success a block in the upper half, error one in the lower half,
  warning a centred block, neutral a flat dash, in the kit's state inks (3:1 on every page and surface in both themes)
- An APG single-row grid: one Tab stop (the newest run first), Arrow Left/Right, Home and End move between the runs;
  each run is a grid cell named by its \`label\` and state word
- The strip is named by \`ariaLabel\` and the count per state („Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“);
  the state words come from \`stateLabels\` (English defaults)
- Hover or focus shows the run's name below the strip; Escape hides it
- Ten runs are 240 px wide; more runs share a narrower strip and never overflow. Without segments nothing renders
- The segments are in the prerendered HTML. CSS hooks \`--lc-state-strip-height\` (2rem),
  \`--lc-state-strip-segment-max-width\` (1.5rem)
`,
      },
    },
  },
  argTypes: {
    segments: {
      control: 'object',
      description: 'The runs `{ state, label }[]`, oldest first, one segment each. Empty renders nothing (no box, no accessibility node)',
      table: { defaultValue: { summary: '[]' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Start of the strip\'s accessible name; the count per state follows it („Last 10 load runs, 9 succeeded, 1 failed“)',
      table: { defaultValue: { summary: "''" } },
    },
    stateLabels: {
      control: 'object',
      description:
        'Words of the four states for the counts and the segment names, over the English defaults (succeeded, with warnings, failed, pending)',
      table: { defaultValue: { summary: '{}' } },
    },
  },
};

export default meta;
type Story = StoryObj<StateStripComponent>;

export const Default: Story = {
  args: { segments: runs(NINE_ONE), ariaLabel: 'Last 10 load runs', stateLabels: {} },
  parameters: {
    docs: {
      description: {
        story:
          'Nine succeeded runs and one failed one, oldest first. The strip is named „Last 10 load runs, 9 succeeded, 1 failed“; each run is a grid cell („Oct 9, 6:00, failed“). Ten runs are 240 × 32 px.',
      },
    },
  },
};

export const AllStates: Story = {
  name: 'All States',
  args: {
    segments: runs(['neutral', 'neutral', 'neutral', 'success', 'success', 'success', 'warning', 'warning', 'error', 'error']),
    ariaLabel: 'Last 10 load runs',
    stateLabels: {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'The four states differ in more than hue: pending is a flat dash in the middle, succeeded a block in the upper half, with warnings a taller centred block, failed a block in the lower half. Inks: `--color-text-success`, `--color-text-warning`, `--color-text-error`, `--color-field-border`, each at least 3:1 on the page and the surfaces in both themes. In forced colours the shapes stay (CanvasText, pending GrayText).',
      },
    },
  },
};

export const German: Story = {
  args: { segments: runs(NINE_ONE, true), ariaLabel: 'Letzte 10 Ladeläufe', stateLabels: GERMAN },
  parameters: {
    docs: {
      description: {
        story:
          'In a source card at 360 px (328 px card), with `stateLabels` in German: named „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“, the cells „09.10., 06:00, fehlgeschlagen“. Beside it the fact „Zustand“ as a badge (`lc-description-list`, 3.36).',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      facts: [
        { term: 'Zustand', value: 'Geladen', badge: 'Geladen', badgeVariant: 'success' },
        { term: 'Letzter Lauf', value: 'heute 06:00' },
      ],
    },
    template: `
      <div lang="de" style="max-width: 328px;">
        <lc-card variant="outlined" title="SAP-Ist" subtitle="Kostenstellen-Einzelposten" [headingLevel]="2">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <lc-state-strip [segments]="segments" [ariaLabel]="ariaLabel" [stateLabels]="stateLabels" />
            <lc-description-list [items]="facts" />
          </div>
        </lc-card>
      </div>`,
  }),
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  args: { segments: runs(NINE_ONE, true), ariaLabel: 'Letzte 10 Ladeläufe', stateLabels: GERMAN },
  parameters: {
    docs: {
      description: {
        story:
          'The failed ninth run focused, as after Tab (the newest run) and Arrow Left: a 2 px `--color-primary-500` ring inside the cell (3.97:1 light, 7.58:1 dark) and its name in the caption below the strip, which wraps inside the strip\'s width. Escape hides the caption; Home and End go to the first and last run.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="max-width: 328px; padding-bottom: 64px;">
        <lc-state-strip [segments]="segments" [ariaLabel]="ariaLabel" [stateLabels]="stateLabels" />
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelectorAll<HTMLElement>('[role=gridcell]')[8]?.focus();
  },
};

export const ManySegments: Story = {
  name: 'Many Segments',
  args: { ariaLabel: 'Last runs', stateLabels: {} },
  parameters: {
    controls: { include: ['ariaLabel', 'stateLabels'] },
    docs: {
      description: {
        story:
          'More runs than fit at 24 px share the strip: 30 and 60 runs at 360 px make narrower cells (marks inset by at most a quarter of a cell), and nothing overflows the 328 px column.',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      thirty: runs(Array.from({ length: 30 }, (_, i) => (i % 9 === 4 ? 'error' : i % 7 === 2 ? 'warning' : 'success'))),
      sixty: runs(Array.from({ length: 60 }, (_, i) => (i % 11 === 6 ? 'error' : i % 5 === 1 ? 'warning' : i < 4 ? 'neutral' : 'success'))),
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 328px;">
        <lc-state-strip [segments]="thirty" [ariaLabel]="ariaLabel" [stateLabels]="stateLabels" />
        <lc-state-strip [segments]="sixty" [ariaLabel]="ariaLabel" [stateLabels]="stateLabels" />
      </div>`,
  }),
};

export const Empty: Story = {
  args: { segments: [], ariaLabel: 'Last 10 load runs', stateLabels: {} },
  parameters: {
    docs: {
      description: {
        story: 'Without segments the strip renders nothing: no box and no accessibility node (the host is `display: none`).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <p style="margin: 0 0 8px; color: var(--color-text-secondary);">No runs yet: the strip below renders nothing.</p>
      <lc-state-strip [segments]="segments" [ariaLabel]="ariaLabel" [stateLabels]="stateLabels" />`,
  }),
};
