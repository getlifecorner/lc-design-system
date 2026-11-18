import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fn } from 'storybook/test';
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { ButtonComponent } from '@lifecorner/angular-ui-kit/button';
import {
  COMMAND_PALETTE_LABELS_DE,
  CommandPaletteComponent,
  CommandPaletteGroup,
} from './command-palette.component';

const PAGES: CommandPaletteGroup = {
  id: 'pages',
  heading: 'Pages',
  items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', hint: 'Overview' },
    { id: 'cost-centres', label: 'Cost centres', icon: 'banknotes', hint: 'Master data', description: 'Manage cost centres and their allocation keys' },
    { id: 'reports', label: 'Reports', icon: 'chart-bar', hint: 'Analysis' },
    { id: 'users', label: 'Users and roles', icon: 'users', disabled: true, disabledReason: 'Admins only' },
  ],
};

const ACTIONS: CommandPaletteGroup = {
  id: 'actions',
  heading: 'Actions',
  items: [
    { id: 'new-booking', label: 'New booking', icon: 'plus', shortcut: '⌘N' },
    { id: 'theme', label: 'Switch theme', icon: 'moon', shortcut: '⌘⇧L', keepOpen: true },
  ],
};

const RECENT: CommandPaletteGroup = {
  id: 'recent',
  heading: 'Recent',
  items: [
    { id: 'inv-2026-114', label: 'Invoice 2026-114', icon: 'clock', hint: 'Yesterday' },
    { id: 'cc-4711', label: 'Cost centre 4711 Facility management', icon: 'clock', hint: '3 days ago' },
  ],
};

/** Filters the groups by the query, as an app would on `queryChange`. */
function filterGroups(groups: readonly CommandPaletteGroup[], query: string): CommandPaletteGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...groups];
  return groups.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }));
}

/** Story 5: a trigger button and the global shortcut; focus returns to the trigger. */
@Component({
  selector: 'lc-command-palette-trigger-demo',
  standalone: true,
  imports: [CommandPaletteComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
      <lc-button variant="outline" ariaKeyShortcuts="Control+K Meta+K" (click)="open.set(true)">Search ⌘K</lc-button>
      <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
        Press ⌘K (Ctrl+K) anywhere on the page, or the button. Last choice: {{ last() || '—' }}
      </p>
    </div>
    <lc-command-palette
      [(open)]="open"
      [(query)]="query"
      shortcut="mod+k"
      [groups]="groups()"
      [returnFocusTo]="trigger()?.nativeElement ?? null"
      (itemSelect)="last.set($event.item.label)"
    />
  `,
})
class CommandPaletteTriggerDemoComponent {
  protected readonly trigger = viewChild(ButtonComponent, { read: ElementRef });
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly last = signal('');
  protected readonly groups = computed(() => filterGroups([PAGES, ACTIONS, RECENT], this.query()));
}

/** Story 2: a local group, a server group still loading, a failed one and an empty one. */
@Component({
  selector: 'lc-command-palette-async-demo',
  standalone: true,
  imports: [CommandPaletteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-command-palette
      [open]="true"
      [(query)]="query"
      [groups]="groups()"
      (groupRetry)="retries.set(retries() + 1)"
    />
  `,
})
class CommandPaletteAsyncDemoComponent {
  protected readonly query = signal('inc');
  protected readonly retries = signal(0);
  protected readonly groups = computed<CommandPaletteGroup[]>(() => [
    {
      id: 'local',
      heading: 'Pages',
      items: [{ id: 'incoming', label: 'Incoming invoices', icon: 'document-text', hint: 'Accounting' }],
    },
    { id: 'records', heading: 'Records', items: [], loading: true },
    { id: 'documents', heading: 'Documents', items: [], error: this.retries() ? 'Still unavailable (server 503).' : true },
    { id: 'people', heading: 'People', items: [], emptyText: 'No people match “inc”.' },
  ]);
}

const meta: Meta<CommandPaletteComponent> = {
  title: 'Navigation/Command Palette',
  component: CommandPaletteComponent,
  args: {
    itemSelect: fn(),
    groupRetry: fn(),
    searchChange: fn(),
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the palette is open (two-way `[(open)]`). Escape on an empty field, the backdrop, Cancel and a selection set it to false.',
      table: { defaultValue: { summary: 'false' } },
    },
    groups: {
      control: 'object',
      description:
        '`CommandPaletteGroup[]` in display order: `{ id, heading, items, loading?, error?, emptyText? }`; items `{ id, label, description?, icon?, hint?, shortcut?, disabled?, disabledReason?, keepOpen?, data? }`. A group with no items that is not loading and has no error is hidden unless it has `emptyText`.',
      table: { defaultValue: { summary: '[]' } },
    },
    query: {
      control: 'text',
      description: 'The field text (two-way `[(query)]`); `queryChange` on every keystroke for local filtering.',
      table: { defaultValue: { summary: "''" } },
    },
    debounceMs: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Delay of `searchChange` and of the status announcement (0 = none).',
      table: { defaultValue: { summary: '300' } },
    },
    shortcut: {
      control: 'text',
      description: "Global key that toggles the palette, e.g. `'mod+k'` (`mod` = ⌘ on Apple, Ctrl elsewhere). `null`: the app opens it.",
      table: { defaultValue: { summary: 'null' } },
    },
    labels: {
      control: 'object',
      description: 'Built-in texts merged over the English defaults; `COMMAND_PALETTE_LABELS_DE` has the German ones.',
      table: { defaultValue: { summary: 'English' } },
    },
    highlightMatches: {
      control: 'boolean',
      description: 'Marks the trimmed query in the labels (`<mark>`, case-insensitive).',
      table: { defaultValue: { summary: 'true' } },
    },
    returnFocusTo: {
      control: false,
      description: 'Element that gets the focus after closing (set the trigger: WebKit doesn’t focus tapped buttons).',
      table: { defaultValue: { summary: 'null' } },
    },
    activeId: {
      control: 'text',
      description:
        '3.48 (usm-x row 47): id of the item under the cursor (two-way). Setting it moves the cursor to the first enabled option with that id (`aria-activedescendant`, scrolled into view); an unknown or disabled id falls back to the first enabled option and writes its id back. The palette writes it on every cursor move. `CommandPaletteItem.badge` (3.48, usm-x row 48): a count at the line’s end („56/60“, `lc-badge` xs, `badgeVariant`), never shrinks, part of the name.',
      table: { defaultValue: { summary: 'null' } },
    },
    itemSelect: { action: 'itemSelect', description: '`{ item, group }` on Enter or click. Closes unless the item has `keepOpen`.' },
    groupRetry: { action: 'groupRetry', description: 'The group whose „Try again“ option was chosen.' },
    searchChange: { action: 'searchChange', description: 'The query after `debounceMs` (server search).' },
  },
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['open', 'groups', 'query', 'debounceMs', 'shortcut', 'labels', 'highlightMatches', 'activeId', 'itemSelect', 'groupRetry', 'searchChange'] },
    docs: {
      description: {
        component: `
A command palette (3.45, usm-x row 34): a search field over grouped results in a top-anchored dialog. It shows what the app passes and fetches nothing: filter local groups on \`queryChange\`, start a server search on the debounced \`searchChange\`, and pass a group with \`loading\`, \`error\` or \`emptyText\` meanwhile.

- Below 640 px a sheet from the top edge with a Cancel button; from 640 px a centred panel (\`--lc-command-palette-width\`, default \`40rem\`; \`--lc-command-palette-max-height\`, default \`32rem\`).
- Keys: ArrowUp/Down over every group (disabled options skipped, wrapping), Home/End, PageUp/Down, Enter selects, Escape clears the query first and then closes. The listbox scrolls: the cursor stays on its option (and in place) while results arrive; a group's first option brings its heading into view; the pointer only highlights.
- An APG combobox with a grouped listbox (\`role="group"\` named by the heading); each option is named by all its visible text (label, description, hint or reason, shortcut); one polite status says „Searching…“ or the number of results.
- Closed, it renders nothing.
`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-command-palette
        [open]="open"
        [groups]="groups"
        [query]="query"
        [debounceMs]="debounceMs"
        [shortcut]="shortcut"
        [labels]="labels"
        [highlightMatches]="highlightMatches"
        [activeId]="activeId"
        (itemSelect)="itemSelect($event)"
        (groupRetry)="groupRetry($event)"
        (searchChange)="searchChange($event)"
      />`,
  }),
};

export default meta;
type Story = StoryObj<CommandPaletteComponent>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Open, three groups: pages with hints, one with a description and one disabled with its reason; actions with shortcut keys (one `keepOpen`); recent items. The first option is active; ArrowDown skips the disabled one.',
      },
    },
  },
  args: {
    open: true,
    groups: [PAGES, ACTIONS, RECENT],
    query: '',
    debounceMs: 300,
    shortcut: null,
    labels: {},
    highlightMatches: true,
  },
};

export const AsyncGroups: Story = {
  name: 'Async Groups',
  parameters: {
    docs: {
      description: {
        story:
          'Query „inc“: a local group with its match marked, a server group still loading (`aria-busy`, a busy row, status „Searching…“), a failed group with a „Try again“ option (`groupRetry`; the message is its description) and a group with `emptyText`. Results arriving below keep the cursor on its option.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [CommandPaletteAsyncDemoComponent] },
    template: `<lc-command-palette-async-demo />`,
  }),
};

export const German: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`[labels]="COMMAND_PALETTE_LABELS_DE"` inside `lang="de"`: long compounds wrap hyphenated; a hint shows whole up to a third of the row, then ellipsises (full text in its `title` and the option’s name); the disabled reason wraps; the placeholder reads „Suchen …“ and the Cancel button „Abbrechen“ below 640 px.',
      },
    },
  },
  args: {
    open: true,
    query: '',
    debounceMs: 300,
    shortcut: null,
    highlightMatches: true,
    labels: COMMAND_PALETTE_LABELS_DE,
    groups: [
      {
        id: 'seiten',
        heading: 'Seiten',
        items: [
          { id: 'kst', label: 'Kostenstellen', icon: 'banknotes', hint: 'Stammdaten', description: 'Leistungsverrechnung und Umlageschlüssel verwalten' },
          { id: 'lv', label: 'Leistungsverrechnungsvereinbarungen', icon: 'document-text', hint: 'Vertragsverwaltung und Abrechnung' },
          { id: 'ber', label: 'Berichte', icon: 'chart-bar', hint: 'Auswertung' },
          { id: 'rollen', label: 'Benutzer und Rollen', icon: 'users', disabled: true, disabledReason: 'Nur für Administratoren' },
        ],
      },
      {
        id: 'aktionen',
        heading: 'Aktionen',
        items: [
          { id: 'buchung', label: 'Neue Buchung anlegen', icon: 'plus', shortcut: '⌘N' },
          { id: 'theme', label: 'Farbschema wechseln', icon: 'moon', shortcut: '⌘⇧L', keepOpen: true },
        ],
      },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de">
        <lc-command-palette
          [open]="open"
          [groups]="groups"
          [query]="query"
          [debounceMs]="debounceMs"
          [shortcut]="shortcut"
          [labels]="labels"
          [highlightMatches]="highlightMatches"
          (itemSelect)="itemSelect($event)"
          (groupRetry)="groupRetry($event)"
          (searchChange)="searchChange($event)"
        />
      </div>`,
  }),
};

export const NoResults: Story = {
  name: 'No Results',
  parameters: {
    docs: {
      description: {
        story: 'Query „xyz“ and every group empty: the global „No results for “xyz”“ row, also read by the status; the field is not expanded.',
      },
    },
  },
  args: {
    open: true,
    query: 'xyz',
    debounceMs: 300,
    shortcut: null,
    labels: {},
    highlightMatches: true,
    groups: [
      { id: 'pages', heading: 'Pages', items: [] },
      { id: 'actions', heading: 'Actions', items: [] },
    ],
  },
};

export const ShortcutAndTrigger: Story = {
  name: 'Shortcut And Trigger',
  decorators: [moduleMetadata({ imports: [CommandPaletteTriggerDemoComponent] })],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Closed at load. `shortcut="mod+k"` toggles it from anywhere (⌘K on Apple systems, Ctrl+K elsewhere); the button opens it too. `returnFocusTo` is the button, so the focus comes back after a tap in Safari. The page filters the groups on `queryChange`.',
      },
    },
  },
  render: () => ({ template: `<lc-command-palette-trigger-demo />` }),
};

/** 3.48 (request 068, usm-x rows 47, 48): the rail's counts and a line that replaces itself. */
const NAV_COUNTS: CommandPaletteGroup = {
  id: 'nav',
  heading: 'Navigation',
  items: [
    { id: 'offene-tickets', label: 'Offene Tickets', icon: 'mail', hint: 'Stammdaten', badge: '56/60' },
    { id: 'meine-tickets', label: 'Meine Tickets', icon: 'user', badge: '12', badgeVariant: 'primary' },
    { id: 'eskalationen', label: 'Eskalationen', icon: 'alert-triangle', hint: 'Servicemanagement', badge: '3', badgeVariant: 'warning' },
    { id: 'archiv', label: 'Archiv', disabled: true, disabledReason: 'Keine Berechtigung', badge: '0' },
  ],
};

@Component({
  selector: 'lc-command-palette-active-id-demo',
  standalone: true,
  imports: [CommandPaletteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-command-palette
        [open]="true"
        [groups]="groups()"
        [labels]="labels"
        [(activeId)]="activeId"
        (itemSelect)="onSelect($event.item.id)"
      />
    </div>
  `,
})
class CommandPaletteActiveIdDemoComponent {
  protected readonly labels = COMMAND_PALETTE_LABELS_DE;
  protected readonly pinned = signal(false);
  protected readonly activeId = signal<string | null>(null);
  protected readonly groups = computed<CommandPaletteGroup[]>(() => [
    NAV_COUNTS,
    {
      id: 'aktionen',
      heading: 'Aktionen',
      items: [
        this.pinned()
          ? { id: 'loesen', label: 'Ansicht lösen', keepOpen: true }
          : { id: 'anheften', label: 'Ansicht anheften', keepOpen: true },
        { id: 'neu', label: 'Neues Ticket', shortcut: '⌘N' },
      ],
    },
  ]);

  /** A `keepOpen` item replaces its own line: the new line takes the cursor in the same change. */
  protected onSelect(id: string): void {
    if (id !== 'anheften' && id !== 'loesen') return;
    this.pinned.set(id === 'anheften');
    this.activeId.set(id === 'anheften' ? 'loesen' : 'anheften');
  }
}

export const ActiveIdAndCounts: Story = {
  name: 'Active Id And Counts',
  decorators: [moduleMetadata({ imports: [CommandPaletteActiveIdDemoComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x rows 47, 48). Each navigation line ends with its count, as the rail shows it: `badge: \'56/60\'` (an `lc-badge` xs after the hint, before the shortcut; it never shrinks, the hint ellipsises first, and it is part of the option’s name: „Offene Tickets Stammdaten 56/60“). „Ansicht anheften“ is `keepOpen`: choosing it replaces the line with „Ansicht lösen“, and the app sets `[(activeId)]` to the new line’s id in the same change, so the cursor stays on it. An unknown id falls back to the first enabled line.',
      },
    },
  },
  render: () => ({ template: `<lc-command-palette-active-id-demo />` }),
};
