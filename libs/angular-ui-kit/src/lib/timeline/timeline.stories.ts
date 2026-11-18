import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TimelineComponent } from './timeline.component';
import {
  TimelineContentDirective,
  TimelineMetaDirective,
} from './timeline-templates.directive';
import { CodeBlockComponent } from '../code-block/code-block.component';

const meta: Meta<TimelineComponent> = {
  title: 'Data Display/Timeline',
  component: TimelineComponent,
  decorators: [
    moduleMetadata({
      imports: [TimelineContentDirective, TimelineMetaDirective, CodeBlockComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Chronological event display for activity feeds, changelogs, and process tracking.

**Key Features:**
- Vertical and horizontal orientations
- Color-coded dots or icons per event
- Entry states (\`success | running | failed | pending\`) — marker colors from the
  semantic tokens; \`running\` pulses (respects \`prefers-reduced-motion\`)
- Composable header line: title + mono suffix (\`titleMono\`) + badge
  (\`badge\`/\`badgeVariant\`) + right-aligned meta (\`meta\`, or the \`lcTimelineMeta\`
  template for live values the app ticks itself)
- Free content per entry below the header via \`lcTimelineContent\`
  (code blocks, prose, collapsible text, diffs)
- Optional description and timestamp
- Compact mode for dense layouts
- 3.46 (066): a horizontal timeline that is wider than its box (and not \`selectable\`) becomes a tab stop
  named \`scrollLabel\` that the arrow keys scroll, with the kit's focus ring; titles centre over their
  markers (see *Horizontal, German*)
        `,
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    compact: { control: 'boolean' },
    headingLevel: {
      control: 'select',
      options: [undefined, 2, 3, 4, 5, 6],
      description:
        '3.3: heading level of the item titles (`h2`–`h6`) for heading navigation; unset = paragraph (3.2). The timeline is an `<ol>`; an item’s `datetime` (ISO 8601) goes on its `<time datetime>`.',
    },
    selectable: {
      control: 'boolean',
      description:
        '3.45 (usm-x row 36): items become buttons over the whole entry. One tab stop (the selected item, else the first); the arrow keys, Home and End move, Enter, Space or a click emit `itemClick` and set `selectedId` (`aria-current="true"`). An item with `title: \'\'` renders no title element; name it with `ariaLabel`. Off: the DOM is as before.',
      table: { defaultValue: { summary: 'false' } },
    },
    selectedId: {
      control: 'text',
      description: '3.45: `id` of the selected item in a `selectable` timeline (two-way); `null` = none.',
      table: { defaultValue: { summary: 'null' } },
    },
    itemClick: {
      action: 'itemClick',
      description: '3.45: `{ item, index }` when an item of a `selectable` timeline is activated.',
      table: { defaultValue: { summary: '—' } },
    },
    scrollLabel: {
      control: 'text',
      description:
        '3.46 (065-s1, WCAG 2.1.1): accessible name of the list while a horizontal timeline without `selectable` is wider than its box. The list then becomes a tab stop with this name, the arrow keys scroll it, and it shows the kit\'s focus ring. Set a short, localised name that is unique on the page („Zeitleiste“). `\'\'` omits the name. Not used otherwise.',
      table: { defaultValue: { summary: "'Timeline'" } },
    },
  },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

const sampleItems = [
  { title: 'Projekt erstellt', description: 'Repository initialisiert und CI/CD eingerichtet.', timestamp: '1. Mai 2026', color: 'primary' as const },
  { title: 'Design System v1.0', description: '25 Komponenten released.', timestamp: '3. Mai 2026', color: 'success' as const, icon: 'check' },
  { title: 'Beta-Feedback', description: 'Nutzertests abgeschlossen, 12 Issues gemeldet.', timestamp: '4. Mai 2026', color: 'warning' as const, icon: 'exclamation-triangle' },
  { title: 'Hotfix deployed', timestamp: '5. Mai 2026', color: 'error' as const },
  { title: 'v1.1 Release', description: '5 neue Komponenten, alle Fixes integriert.', timestamp: '6. Mai 2026', color: 'success' as const, icon: 'rocket-launch' },
];

export const Default: Story = {
  args: { items: sampleItems, orientation: 'vertical', compact: false },
};

export const Compact: Story = {
  args: { items: sampleItems, orientation: 'vertical', compact: true },
};

export const Horizontal: Story = {
  args: {
    items: [
      { title: 'Step 1', description: 'Kickoff', color: 'success' as const },
      { title: 'Step 2', description: 'Development', color: 'success' as const },
      { title: 'Step 3', description: 'Testing', color: 'primary' as const },
      { title: 'Step 4', description: 'Release', color: 'neutral' as const },
    ],
    orientation: 'horizontal',
  },
};

export const MinimalItems: Story = {
  args: {
    items: [
      { title: 'Login', timestamp: '09:15' },
      { title: 'File uploaded', timestamp: '09:22' },
      { title: 'Logout', timestamp: '10:01' },
    ],
  },
};

export const EntryStates: Story = {
  name: 'Entry States',
  args: {
    items: [
      { title: 'Vorbereitung', state: 'success' as const, icon: 'check', meta: '1,2 s' },
      { title: 'Verarbeitung', state: 'success' as const, icon: 'check', meta: '8 s' },
      { title: 'Prüfung', state: 'running' as const, meta: 'läuft' },
      { title: 'Zusammenfassung', state: 'pending' as const },
      { title: 'Veröffentlichung', state: 'failed' as const, icon: 'x-mark', badge: 'Fehlgeschlagen', badgeVariant: 'error' as const },
    ],
  },
};

/**
 * Step transcript of an automated run: composable header line (title + mono
 * tool id + badge + right-aligned meta), a failed step with its command line
 * as free content, and a running step with a live meta slot.
 */
export const Transcript: Story = {
  render: () => ({
    props: {
      items: [
        {
          id: 'step-1',
          title: 'Abhängigkeiten installieren',
          titleMono: 'setup_env',
          state: 'success' as const,
          icon: 'check',
          meta: '14 s',
          description: 'Alle Pakete aus dem Lockfile aufgelöst.',
        },
        {
          id: 'step-2',
          title: 'Tests ausführen',
          titleMono: 'gate_test',
          state: 'failed' as const,
          icon: 'x-mark',
          badge: 'Fehlgeschlagen',
          badgeVariant: 'error' as const,
          meta: '41 s',
          description: '2 von 118 Tests schlagen fehl.',
          command: 'npm test -- --ci --runInBand',
        },
        {
          id: 'step-3',
          title: 'Bericht erstellen',
          titleMono: 'build_report',
          state: 'running' as const,
        },
        {
          id: 'step-4',
          title: 'Ergebnis veröffentlichen',
          titleMono: 'publish',
          state: 'pending' as const,
        },
      ],
    },
    template: `
      <lc-timeline [items]="items" [compact]="true">
        <ng-template lcTimelineMeta let-item>
          @if (item.state === 'running') {
            läuft seit 42 s
          } @else if (item.meta) {
            {{ item.meta }}
          }
        </ng-template>
        <ng-template lcTimelineContent let-item>
          @if (item.command) {
            <lc-code-block [code]="item.command" language="bash" [showLineNumbers]="false" />
          }
        </ng-template>
      </lc-timeline>
    `,
  }),
};

/** 3.3 (G-11): an ordered list with headed events and machine-readable times. */
export const HeadingsAndTimes: Story = {
  name: 'Headings and times (3.3)',
  args: {
    headingLevel: 3,
    items: [
      { title: 'Lena Brandt ist beigetreten', timestamp: 'heute 18:05', datetime: '2026-10-12T18:05:00+02:00', color: 'success' as const },
      { title: 'Einladung verschickt', timestamp: 'gestern, 20:30', datetime: '2026-10-11T20:30:00+02:00', color: 'primary' as const },
    ],
  },
};

/**
 * 3.45 (usm-x row 36): a history the user picks entries from. German, with a
 * long compound title and one untitled entry named by `ariaLabel`.
 */
export const Selectable: Story = {
  args: {
    selectable: true,
    selectedId: 'h-2',
    orientation: 'vertical',
    compact: false,
    headingLevel: 3,
    items: [
      { id: 'h-1', title: 'Antrag eingereicht', description: 'Von Lena Brandt über das Kundenportal.', timestamp: '09:12', datetime: '2026-11-17T09:12:00+01:00', color: 'primary' as const },
      { id: 'h-2', title: 'Leistungsverrechnungsschlüssel geändert', description: 'Kostenstelle 4711 von 30 % auf 45 % angehoben.', timestamp: '10:40', datetime: '2026-11-17T10:40:00+01:00', color: 'success' as const, icon: 'check' },
      { id: 'h-3', title: '', ariaLabel: 'Automatische Prüfung', description: 'Keine Auffälligkeiten gefunden.', timestamp: '11:05', datetime: '2026-11-17T11:05:00+01:00', color: 'neutral' as const },
      { id: 'h-4', title: 'Freigabe angefordert', timestamp: '14:30', datetime: '2026-11-17T14:30:00+01:00', color: 'warning' as const },
    ],
  },
};

const selectableItemsEn = [
  { id: 's-1', title: 'Request submitted', description: 'By Lena Brandt via the portal.', timestamp: '09:12' },
  { id: 's-2', title: 'Allocation key changed', description: 'Cost centre 4711 from 30 % to 45 %.', timestamp: '10:40', color: 'success' as const },
  { id: 's-3', title: 'Approval requested', timestamp: '14:30', color: 'warning' as const },
];

/** 3.45: a compact selectable timeline (gap 12, the box still ≥ 44 px). */
export const SelectableCompact: Story = {
  name: 'Selectable Compact',
  args: { selectable: true, selectedId: 's-2', orientation: 'vertical', compact: true, items: selectableItemsEn },
};

/** 3.45: a horizontal selectable timeline; the selected bar sits at the block end. */
export const SelectableHorizontal: Story = {
  name: 'Selectable Horizontal',
  args: { selectable: true, selectedId: 's-2', orientation: 'horizontal', compact: false, items: selectableItemsEn },
};

/**
 * 3.46 (request 066, 065-s1, WCAG 2.1.1): a German horizontal timeline. At
 * 360 px it overflows and is a named tab stop (focused here); from 1024 px it
 * fits and adds nothing.
 */
export const HorizontalGerman: Story = {
  name: 'Horizontal, German',
  args: {
    orientation: 'horizontal',
    scrollLabel: 'Zeitleiste',
    items: [
      { title: 'Antrag', description: 'Eingereicht', color: 'success' as const },
      { title: 'Prüfung', description: 'Fachbereich', color: 'success' as const },
      { title: 'Freigabe', description: 'Controlling', color: 'primary' as const },
      { title: 'Auszahlung', description: 'Buchhaltung', color: 'neutral' as const },
    ],
  },
  parameters: {
    // Only what the render binds (review 066 F-5).
    controls: { include: ['items', 'orientation', 'scrollLabel'] },
    docs: {
      description: {
        story:
          '3.46 (request 066, follow-up 065-s1, WCAG 2.1.1): four items of at least 128 px need 512 px. At 360 px the list is 328 px wide, so it scrolls: it becomes a tab stop named „Zeitleiste“ (`scrollLabel`), keeps its list role („Zeitleiste, Liste, 4 Einträge“), the arrow keys scroll it, and it shows a 2 px focus ring 2 px outside (Highlight in forced colours). The story focuses it. From 1024 px the items fit: no tab stop, no name, no ring. A ResizeObserver keeps this live when the box or the items change size; prerendered HTML has neither. Titles centre over their markers (backlog 065-n1).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de">
        <lc-timeline [items]="items" [orientation]="orientation" [scrollLabel]="scrollLabel" />
      </div>
    `,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    // The overflow is measured after the first render: wait up to 1 s for the tab stop.
    for (let waited = 0; waited < 1000; waited += 50) {
      const list = canvasElement.querySelector<HTMLElement>('ol[tabindex="0"]');
      if (list) {
        list.focus({ preventScroll: true });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  },
};

