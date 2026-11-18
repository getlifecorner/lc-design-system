import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
  type OnDestroy,
} from '@angular/core';
import { MenuComponent, type MenuAnchor, type MenuItem, type MenuItemToggleEvent } from './menu.component';

/**
 * Menus display a list of actions or options in a floating panel.
 * Triggered by a button or icon, they appear in configurable positions.
 * Items can have icons, dividers, danger variants, and disabled states.
 */
const meta: Meta<MenuComponent> = {
  title: 'Navigation/Menu',
  component: MenuComponent,
  args: {
    itemClick: fn(),
    closed: fn(),
    itemToggle: fn(),
  },
  argTypes: {
    itemClick: { action: 'itemClick', description: 'Emitted with the MenuItem when an item is clicked' },
    itemToggle: {
      action: 'itemToggle',
      description:
        '3.45: `{ item, checked }` when a `checkbox` / `radio` item is activated (click, Enter, Space); a radio emits only when it becomes checked. `itemClick` is not emitted for these items',
    },
    closed: { action: 'closed', description: 'Emitted when the menu is closed' },
    isOpen: { description: 'Whether the menu is currently visible' },
    position: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      description: 'Anchor position relative to the trigger element',
    },
    minWidth: { description: 'Minimum width of the menu panel (CSS value)' },
    maxWidth: {
      control: 'text',
      description:
        'Maximum width of the menu panel (CSS value, e.g. `min(18rem, calc(100vw - 2rem))`); empty leaves it unbounded. Long labels and header lines wrap within it',
      table: { defaultValue: { summary: "''" } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of menu items — sm is compact, md is default, lg is spacious',
    },
    items: {
      control: 'object',
      description:
        '`MenuItem[]`. 3.43 (usm-x row 12): an item with `children` is a section: its `label` is a heading (not focusable, not an action) and the children are its items, in a `role="group"` named by the heading; one level. `indentChildren: true` indents them one step (md 16, sm 12, lg 20 px); `dividerAfter` on a section follows the whole group. The arrow keys, Home and End run over the items of every section. 3.45 (usm-x row 31): `type: \'checkbox\' | \'radio\'` with `checked` (controlled), `radioGroup` (the exclusive set) and `closeOnSelect` (`true`: the menu emits `closed` after the item acts). 3.48 (usm-x rows 56, 57, 68): `tooltip` (kit tooltip on hover and focus), `disabledReason` (a `disabled` item with a reason stays in the arrow order as `aria-disabled` and shows the reason), `emphasis` (bold label, visual only), `swatch` (a colour sample or two halves before the label, decorative); `dividerAfter` on a member draws between members of a section',
      table: { defaultValue: { summary: '[]' } },
    },
    anchor: {
      control: false,
      description:
        '3.48 (usm-x row 53): `HTMLElement | { x, y }`. Opens the panel in an overlay under `<body>` at an element (below or above it as `position` says, 8 px apart) or at a viewport point (a context menu). It escapes scrolling and `overflow: hidden` containers, flips and shifts to stay 8 px inside the viewport, and closes on Escape, Tab, a click outside the panel and the anchor, and any scroll outside the panel. Focus returns to the trigger, else the anchor element, else the element focused before. `null`: the panel opens at the projected trigger',
      table: { defaultValue: { summary: 'null' } },
    },
    maxHeight: {
      control: 'text',
      description:
        '3.48 (usm-x row 54): caps the panel height (CSS length, e.g. `min(56vh, 420px)`); the items scroll inside, header and footer stay, the keyboard-focused item is scrolled into view. Empty: no cap (overlay: the viewport less 16 px)',
      table: { defaultValue: { summary: "''" } },
    },
    loading: {
      control: 'boolean',
      description:
        '3.48 (usm-x row 55): a busy row after the items (spinner and `loadingLabel`, polite status) and `aria-busy="true"` on the menu. Items that arrive while open take the focus unless it is already inside the panel',
      table: { defaultValue: { summary: 'false' } },
    },
    loadingLabel: {
      control: 'text',
      description: '3.48: text of the busy row. German: „Wird geladen …“',
      table: { defaultValue: { summary: "'Loading…'" } },
    },
    ariaLabel: {
      control: 'text',
      description: '3.48 (usm-x row 58): accessible name of the `role="menu"` element; empty renders none',
      table: { defaultValue: { summary: "''" } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Menu Component - Dropdown menu for navigation and actions

**Key Features:**
- Customizable menu items with icons
- Support for links and buttons
- Dividers between menu sections
- Optional subtitle/metadata for items
- Danger variant for destructive actions
- Click outside to close (top-most overlay only)
- Keyboard navigation: focus moves into the menu on open, Arrow keys / Home / End move between items, Enter / Space activate, Escape closes and returns focus to the trigger
- ARIA menu semantics (\`aria-haspopup\` / \`aria-expanded\` / \`aria-controls\` on the trigger, \`role="menu"\` / \`role="menuitem"\`)
- OnPush change detection for performance
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {
  args: {
    isOpen: true,
    position: 'bottom-left',
    items: [
      { id: 'profile', label: 'Profile', icon: 'user' },
      { id: 'settings', label: 'Settings', icon: 'cog-6-tooth' },
      { id: 'help', label: 'Help & Support', icon: 'help-circle', dividerAfter: true },
      { id: 'logout', label: 'Sign Out', icon: 'arrow-right-on-rectangle', variant: 'danger' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; display: inline-block; padding: 20px; min-height: 280px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position">
          <button trigger style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer;">Account ▾</button>
        </lc-menu>
      </div>`,
  }),
};

export const WithDividers: Story = {
  name: 'With Dividers & Danger',
  args: {
    isOpen: true,
    position: 'bottom-left',
    items: [
      { id: 'edit', label: 'Edit', icon: 'pencil' },
      { id: 'duplicate', label: 'Duplicate', icon: 'document-duplicate' },
      { id: 'move', label: 'Move to…', icon: 'folder', dividerAfter: true },
      { id: 'archive', label: 'Archive', icon: 'archive-box' },
      { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; display: inline-block; padding: 20px; min-height: 300px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position">
          <button trigger style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer;">Actions ▾</button>
        </lc-menu>
      </div>`,
  }),
};

export const WithDisabled: Story = {
  name: 'With Disabled Items',
  args: {
    isOpen: true,
    position: 'bottom-left',
    items: [
      { id: 'view', label: 'View Details', icon: 'eye' },
      { id: 'share', label: 'Share', icon: 'share' },
      { id: 'export', label: 'Export (Pro)', icon: 'arrow-down-tray', disabled: true },
      { id: 'api', label: 'API Access (Pro)', icon: 'code', disabled: true },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; display: inline-block; padding: 20px; min-height: 260px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position">
          <button trigger style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer;">More ▾</button>
        </lc-menu>
      </div>`,
  }),
};

export const FileMenu: Story = {
  name: 'File Context Menu',
  args: {
    isOpen: true,
    position: 'bottom-left',
    items: [
      { id: 'open', label: 'Open', icon: 'folder-open' },
      { id: 'rename', label: 'Rename', icon: 'pencil' },
      { id: 'download', label: 'Download', icon: 'arrow-down-tray', dividerAfter: true },
      { id: 'move', label: 'Move to Trash', icon: 'trash', variant: 'danger' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; display: inline-block; padding: 20px; min-height: 260px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position">
          <button trigger style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 18px;">⋮</button>
        </lc-menu>
      </div>`,
  }),
};

export const CompactSize: Story = {
  name: 'Compact (sm)',
  args: {
    isOpen: true,
    position: 'bottom-left',
    size: 'sm',
    minWidth: '180px',
    items: [
      { id: 'cut', label: 'Cut', icon: 'scissors' },
      { id: 'copy', label: 'Copy', icon: 'document-duplicate' },
      { id: 'paste', label: 'Paste', icon: 'clipboard-document', dividerAfter: true },
      { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; display: inline-block; padding: 20px; min-height: 220px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position" [size]="size" [minWidth]="minWidth">
          <button trigger style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 14px;">Edit ▾</button>
        </lc-menu>
      </div>`,
  }),
};

/** The sections of a view menu in usm-x (request 063, row 12). */
const VIEW_SECTIONS = [
  {
    id: 'view',
    label: 'Diese Ansicht',
    dividerAfter: true,
    children: [
      { id: 'columns', label: 'Spalten anpassen', icon: 'columns' },
      { id: 'reset', label: 'Ansicht zurücksetzen', icon: 'refresh' },
    ],
  },
  {
    id: 'export',
    label: 'Exportieren',
    indentChildren: true,
    children: [
      { id: 'csv', label: 'Als CSV-Datei', icon: 'file-type-csv' },
      { id: 'pdf', label: 'Als PDF-Datei', icon: 'file-type-pdf', disabled: true },
    ],
  },
];

/** A trigger drawn with the kit's tokens, so it follows a theme scope. */
const TOKEN_TRIGGER =
  'min-height: 44px; padding: 8px 12px; border-radius: var(--border-radius-md); border: 1px solid var(--color-field-border); background: var(--color-surface); color: var(--color-text-primary); font: inherit; cursor: pointer;';

export const SectionsDe: Story = {
  name: 'Sections (DE)',
  args: { isOpen: true, position: 'bottom-left', items: VIEW_SECTIONS },
  parameters: {
    docs: {
      description: {
        story:
          '3.43 (request 063, usm-x row 12): `MenuItem.children` makes an item a section. „Diese Ansicht“ and „Exportieren“ are headings (12 px semibold capitals in the secondary ink, 30 px tall at md), not focusable and not actions; each names a `role="group"` around its items. `dividerAfter` on „Diese Ansicht“ draws the divider after the whole group; `indentChildren` on „Exportieren“ indents its items one step (16 px at md). The arrow keys, Home and End run over the items of both sections and skip the headings and the disabled „Als PDF-Datei“. Items keep 44 px; a label wider than the panel wraps.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="position: relative; display: inline-block; padding: 20px; min-height: 320px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position" (itemClick)="itemClick($event)" (closed)="closed()">
          <button trigger type="button" style="${TOKEN_TRIGGER}">Ansicht ▾</button>
        </lc-menu>
      </div>`,
  }),
};

export const LightPanelInDarkScope: Story = {
  name: 'Light Panel In Dark Scope',
  args: {
    isOpen: true,
    position: 'bottom-left',
    items: [
      { id: 'work', label: 'Arbeitsbereich', icon: 'briefcase' },
      { id: 'customizing', label: 'Customizing', icon: 'adjustments', dividerAfter: true },
      { id: 'search', label: 'Bereich suchen …', icon: 'search' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.43 (request 063, usm-x row 19): theme scopes. The rail is `.lc-theme-dark` (in both page themes), the menu is `lc-menu class="lc-theme-light"`, so its panel takes the full light colour set (items `#111827` on `#fff`, as on a light page), and its trigger is `.lc-theme-dark` again, so it matches the rail. Scopes nest; they set the text colour and `color-scheme` but paint no background. In SCSS, `@include light-theme-tokens` / `dark-theme-tokens` give the same on a selector of your own.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" class="lc-theme-dark" style="width: 240px; height: 320px; padding: 16px; border-radius: var(--border-radius-lg); background: var(--color-sidebar);">
        <lc-menu class="lc-theme-light" [items]="items" [isOpen]="isOpen" [position]="position" (itemClick)="itemClick($event)" (closed)="closed()">
          <button trigger type="button" class="lc-theme-dark" style="${TOKEN_TRIGGER}">Bereich ▾</button>
        </lc-menu>
      </div>`,
  }),
};

/** 3.45 (usm-x row 31): the column choice of a table, as checkbox items and a radio set. */
const COLUMN_CHOICE: MenuItem[] = [
  { id: 'name', label: 'Name', type: 'checkbox', checked: true },
  { id: 'status', label: 'Status', type: 'checkbox' },
  { id: 'kostenstelle', label: 'Kostenstelle', type: 'checkbox', checked: true },
  { id: 'verantwortlich', label: 'Verantwortlich', type: 'checkbox', checked: true },
  { id: 'erstellt', label: 'Erstellt am', type: 'checkbox' },
  { id: 'geaendert', label: 'Geändert am', type: 'checkbox', checked: true },
  { id: 'betrag', label: 'Betrag', type: 'checkbox', checked: true },
  { id: 'schluessel', label: 'Leistungsverrechnungsschlüssel', type: 'checkbox', checked: true, dividerAfter: true },
  {
    id: 'zeilenhoehe',
    label: 'Zeilenhöhe',
    children: [
      { id: 'kompakt', label: 'Kompakt', type: 'radio', radioGroup: 'zeilenhoehe' },
      { id: 'standard', label: 'Standard', type: 'radio', radioGroup: 'zeilenhoehe', checked: true },
      { id: 'grosszuegig', label: 'Großzügig', type: 'radio', radioGroup: 'zeilenhoehe' },
    ],
  },
];

/** Applies an `itemToggle` the way an app does: the item takes its state, a radio unchecks its set. */
function applyToggle(items: readonly MenuItem[], { item, checked }: MenuItemToggleEvent): MenuItem[] {
  return items.map((i) => {
    if (i.children) return { ...i, children: applyToggle(i.children, { item, checked }) };
    if (i.id === item.id) return { ...i, checked };
    if (item.type === 'radio' && i.radioGroup && i.radioGroup === item.radioGroup) return { ...i, checked: false };
    return i;
  });
}

@Component({
  selector: 'lc-menu-column-choice-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 600px;">
      <lc-menu
        [items]="items()"
        [isOpen]="open()"
        position="bottom-left"
        maxWidth="min(18rem, calc(100vw - 2rem))"
        (itemToggle)="items.set(apply(items(), $event))"
        (closed)="open.set(false)"
      >
        <button trigger type="button" style="${TOKEN_TRIGGER}" (click)="open.set(!open())">Spalten ein-/ausblenden ▾</button>
      </lc-menu>
    </div>
  `,
})
class MenuColumnChoiceDemoComponent {
  protected readonly open = signal(true);
  protected readonly items = signal<MenuItem[]>(COLUMN_CHOICE);
  protected readonly apply = applyToggle;
}

export const ColumnChoice: Story = {
  name: 'Column Choice',
  parameters: {
    docs: {
      description: {
        story:
          '3.45 (request 065, usm-x row 31): `type: \'checkbox\'` items are `menuitemcheckbox`es with `aria-checked` and a check mark; the „Zeilenhöhe“ section is a radio set (`type: \'radio\'`, `radioGroup`), a `role="group"` named by its heading, with a dot. Click, Enter or Space emits `itemToggle` with the new state (not `itemClick`); the menu stays open and the focus stays on the item. The app owns `checked` (and unchecks the rest of a radio set). Every item gets the 20 px indicator slot, so the labels share an edge; the long German label hyphenates. md rows are 44 px.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuColumnChoiceDemoComponent] },
    template: `<lc-menu-column-choice-demo />`,
  }),
};

// ── 3.48 (request 068, usm-x rows 53–58, 68) ──

const ROW_ACTIONS: MenuItem[] = [
  { id: 'open', label: 'Öffnen', icon: 'external-link' },
  { id: 'copy', label: 'Kopieren', icon: 'document-duplicate' },
  { id: 'move', label: 'Verschieben …', icon: 'arrow-right', dividerAfter: true },
  { id: 'delete', label: 'Löschen', icon: 'trash', variant: 'danger' },
];

const RAIL_ROWS = ['Eingang', 'Entwürfe', 'Gesendet', 'Archiv', 'Rechnungen 2026', 'Verträge', 'Lieferanten', 'Projekte', 'Papierkorb'];

@Component({
  selector: 'lc-menu-anchored-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- the menu inside the lang="de" wrapper: its overlay panel takes the host's lang (review r1, F-3) -->
    <div lang="de">
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;">
        <ul
          #rail
          aria-label="Ordner"
          style="width: 240px; height: 300px; overflow: auto; margin: 0; padding: 4px 0; list-style: none; border: 1px solid var(--color-border-strong); border-radius: var(--border-radius-lg); background: var(--color-surface-2); color: var(--color-text-primary);"
        >
          @for (row of rows; track row) {
            <li
              tabindex="0"
              [attr.data-row]="row"
              style="display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 44px; padding-inline: 12px 0;"
              (contextmenu)="openAtPoint($event, row)"
              (keydown)="onRowKeydown($event, row)"
            >
              <span>{{ row }}</span>
              <button
                type="button"
                [attr.aria-label]="'Aktionen für ' + row"
                aria-haspopup="menu"
                [attr.aria-expanded]="openRow() === row ? 'true' : 'false'"
                style="width: 44px; height: 44px; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer;"
                (click)="openAtElement($event, row)"
              >⋯</button>
            </li>
          }
        </ul>
        <p style="max-width: 32ch; margin: 0; color: var(--color-text-secondary);">
          „⋯“ öffnet das Menü an der Schaltfläche, ein Rechtsklick (oder Umschalt+F10) auf eine Zeile an der Zeile.
        </p>
      </div>
      <lc-menu
        [items]="items"
        [isOpen]="!!anchor()"
        [anchor]="anchor()"
        [ariaLabel]="'Aktionen für ' + openRow()"
        (itemClick)="close()"
        (closed)="close()"
      />
    </div>
  `,
})
class MenuAnchoredDemoComponent {
  protected readonly rows = RAIL_ROWS;
  protected readonly items = ROW_ACTIONS;
  protected readonly anchor = signal<MenuAnchor | null>(null);
  protected readonly openRow = signal('');
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');

  constructor() {
    // The shot: the rail scrolled by 3 rows, then the menu open at the 5th
    // row's „⋯“. It opens after the rail's scroll event, which would close it.
    afterNextRender(() => {
      const rail = this.rail()?.nativeElement;
      if (!rail) return;
      const open = () => {
        const button = rail.querySelector<HTMLElement>('[data-row="Rechnungen 2026"] button');
        if (button) this.open(button, 'Rechnungen 2026');
      };
      rail.addEventListener('scroll', () => setTimeout(open, 50), { once: true });
      rail.scrollTop = 132;
    });
  }

  protected openAtElement(event: MouseEvent, row: string): void {
    this.open(event.currentTarget as HTMLElement, row);
  }

  protected openAtPoint(event: MouseEvent, row: string): void {
    event.preventDefault();
    this.open({ x: event.clientX, y: event.clientY }, row);
  }

  /** Shift+F10 or the Menu key: the menu opens at the focused row. */
  protected onRowKeydown(event: KeyboardEvent, row: string): void {
    if (event.target !== event.currentTarget) return;
    if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
      event.preventDefault();
      this.open(event.currentTarget as HTMLElement, row);
    }
  }

  protected close(): void {
    this.anchor.set(null);
    this.openRow.set('');
  }

  private open(anchor: MenuAnchor, row: string): void {
    this.anchor.set(anchor);
    this.openRow.set(row);
  }
}

export const AnchoredOverlay: Story = {
  name: 'Anchored Overlay',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 53): `[anchor]` opens the panel in an overlay under `<body>`, so the 240 × 300 scrolling rail does not clip it. The rail is scrolled and the menu is open at the „⋯“ of „Rechnungen 2026“ (an element anchor: below it, 8 px apart, flipped above near the bottom). A right-click on a row opens it at the pointer (`{ x: clientX, y: clientY }`: below and after the point, flipped to stay 8 px inside the viewport); Shift+F10 or the Menu key on a focused row opens it at the row. The app owns `isOpen` and the anchor\'s `aria-expanded`; scrolling the rail, Escape or a click outside closes the menu, and the focus returns to the „⋯“ button (or the row). Tab closes it too and moves on from the „⋯“ button (or the row); Shift+Tab goes before it.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuAnchoredDemoComponent] },
    template: `<lc-menu-anchored-demo />`,
  }),
};

const LONG_MENU: MenuItem[] = [
  'Bearbeiten',
  'Kopieren',
  'Verschieben',
  'Umbenennen',
  'Zuweisen',
  'Weiterleiten',
  'Eskalieren',
  'Priorität ändern',
  'Status ändern',
  'Kategorie ändern',
  'Fälligkeit setzen',
  'Beobachten',
  'Verknüpfen',
  'Duplizieren',
  'Zusammenführen',
  'Aufteilen',
  'Kommentar hinzufügen',
  'Anhang hinzufügen',
  'Zeit erfassen',
  'Drucken',
  'Als PDF exportieren',
  'Per E-Mail senden',
  'Link kopieren',
  'Verlauf anzeigen',
  'Archivieren',
  'Löschen',
].map((label, i) => ({ id: `long-${i + 1}`, label, ...(label === 'Löschen' ? { variant: 'danger' as const } : {}) }));

export const LongMenuCapped: Story = {
  name: 'Long Menu Capped',
  args: { isOpen: true, position: 'bottom-left', maxHeight: 'min(56vh, 420px)', items: LONG_MENU },
  parameters: {
    controls: { include: ['isOpen', 'position', 'maxHeight', 'size', 'items'] },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 54): „Weitere“ on a ticket has 26 entries. `maxHeight="min(56vh, 420px)"` caps the panel (358.4 px at 360 × 640) and its items scroll inside (`overscroll-behavior: contain`); the arrow keys scroll the focused item fully into view, its 2 px ring stays inside the list. No cap by default.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 460px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position" [size]="size || 'md'" [maxHeight]="maxHeight" (itemClick)="itemClick($event)" (closed)="closed()">
          <button trigger type="button" style="${TOKEN_TRIGGER}">Weitere ▾</button>
        </lc-menu>
      </div>`,
  }),
};

const LOADED_ACTIONS: MenuItem[] = [
  { id: 'assign', label: 'Mir zuweisen' },
  { id: 'close', label: 'Schließen' },
  { id: 'rich', label: 'Im Rich Client öffnen', disabled: true, disabledReason: 'Öffnet … im Rich Client' },
];

@Component({
  selector: 'lc-menu-loading-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 300px;">
      <lc-menu
        [items]="items()"
        [isOpen]="open()"
        [loading]="loading()"
        loadingLabel="Wird geladen …"
        ariaLabel="Aktionen des Tickets"
        position="bottom-left"
        (itemClick)="open.set(false)"
        (closed)="open.set(false)"
      >
        <button trigger type="button" style="${TOKEN_TRIGGER}" (click)="toggle()">Aktionen ▾</button>
        <div footer style="padding: 4px 16px 0; border-top: 1px solid var(--color-divider);">
          <button type="button" style="${TOKEN_TRIGGER} margin-top: 4px;" (click)="load()">Erneut laden</button>
        </div>
      </lc-menu>
    </div>
  `,
})
class MenuLoadingDemoComponent implements OnDestroy {
  protected readonly open = signal(true);
  protected readonly loading = signal(false);
  protected readonly items = signal<MenuItem[]>([]);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  protected toggle(): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    this.open.set(true);
    this.load();
  }

  /** The actions are asked from the server: 1.5 s later they arrive and take the focus. */
  protected load(): void {
    clearTimeout(this.timer);
    this.items.set([]);
    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.items.set(LOADED_ACTIONS);
      this.loading.set(false);
    }, 1500);
  }
}

export const LoadingItems: Story = {
  name: 'Loading Items',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 55): a row\'s actions are asked from the server. `[loading]` shows a busy row after the items (spinner and „Wird geladen …“ in a polite status, set one frame after the row so it is announced) and `aria-busy="true"` on the menu. 1.5 s later the items arrive and the first enabled one takes the focus, unless the focus is already inside the panel („Erneut laden“ keeps it). The shot shows the busy state.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuLoadingDemoComponent] },
    template: `<lc-menu-loading-demo />`,
  }),
};

const REASONS: MenuItem[] = [
  { id: 'open', label: 'Öffnen', emphasis: true },
  { id: 'edit', label: 'Bearbeiten', tooltip: 'Öffnet das Formular in diesem Fenster' },
  { id: 'rich', label: 'Im Rich Client bearbeiten', disabled: true, disabledReason: 'Öffnet … im Rich Client' },
  {
    id: 'status',
    label: 'Status setzen',
    dividerAfter: true,
    children: [
      { id: 'neu', label: 'Neu' },
      { id: 'in-arbeit', label: 'In Arbeit', emphasis: true, dividerAfter: true },
      { id: 'erledigt', label: 'Erledigt' },
      { id: 'abgebrochen', label: 'Abgebrochen' },
    ],
  },
  { id: 'export', label: 'Exportieren', disabled: true },
];

export const ReasonsAndEmphasisDe: Story = {
  name: 'Reasons And Emphasis (DE)',
  args: { isOpen: true, position: 'bottom-left', ariaLabel: 'Was diese Liste anbietet', items: REASONS },
  parameters: {
    controls: { include: ['isOpen', 'position', 'ariaLabel', 'size', 'items'] },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x rows 56–58): `ariaLabel` names the `role="menu"` („Was diese Liste anbietet“). „Öffnen“ and „In Arbeit“ have `emphasis` (bold: the default member; visual only, the label carries the meaning). „Bearbeiten“ has a `tooltip`; „Im Rich Client bearbeiten“ is `disabled` with a `disabledReason`: it stays in the arrow order (`aria-disabled`), its content is dimmed (the focus ring is not), and the reason shows on hover and keyboard focus (`aria-describedby`); activating it does nothing. „Exportieren“ is disabled without a reason and is skipped, as before. `dividerAfter` on „In Arbeit“ draws the break inside the „Status setzen“ section.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 440px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position" [size]="size || 'md'" [ariaLabel]="ariaLabel" (itemClick)="itemClick($event)" (closed)="closed()">
          <button trigger type="button" style="${TOKEN_TRIGGER}">Liste ▾</button>
        </lc-menu>
      </div>`,
  }),
};

/** The account menu's fixture (usm-x row 68): theme radios with swatches, density radios, switches. */
const ACCOUNT: MenuItem[] = [
  {
    id: 'theme',
    label: 'Darstellung',
    dividerAfter: true,
    children: [
      { id: 'system', label: 'Wie das System', type: 'radio', radioGroup: 'theme', checked: true, swatch: ['#ffffff', '#111827'] },
      { id: 'light', label: 'Hell', type: 'radio', radioGroup: 'theme', swatch: '#ffffff' },
      { id: 'dark', label: 'Dunkel', type: 'radio', radioGroup: 'theme', swatch: '#111827' },
    ],
  },
  {
    id: 'density',
    label: 'Dichte',
    dividerAfter: true,
    children: [
      { id: 'compact', label: 'Kompakt', type: 'radio', radioGroup: 'density' },
      { id: 'standard', label: 'Standard', type: 'radio', radioGroup: 'density', checked: true },
      { id: 'comfortable', label: 'Großzügig', type: 'radio', radioGroup: 'density' },
    ],
  },
  { id: 'sounds', label: 'Töne', type: 'checkbox', checked: true },
  { id: 'shortcuts', label: 'Tastenkürzel anzeigen', type: 'checkbox' },
];

@Component({
  selector: 'lc-menu-account-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 620px;">
      <lc-menu
        [items]="items()"
        [isOpen]="open()"
        position="bottom-left"
        ariaLabel="Konto"
        maxWidth="min(18rem, calc(100vw - 2rem))"
        (itemToggle)="items.set(apply(items(), $event))"
        (closed)="open.set(false)"
      >
        <button trigger type="button" style="${TOKEN_TRIGGER}" (click)="open.set(!open())">Erika Mustermann ▾</button>
        <div header style="padding: 4px 16px 12px; border-bottom: 1px solid var(--color-divider); margin-bottom: 8px;">
          <div style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">Erika Mustermann</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">erika.mustermann&#64;example.de</div>
        </div>
      </lc-menu>
    </div>
  `,
})
class MenuAccountDemoComponent {
  protected readonly open = signal(true);
  protected readonly items = signal<MenuItem[]>(ACCOUNT);
  protected readonly apply = applyToggle;
}

export const AccountMenuSwatches: Story = {
  name: 'Account Menu Swatches',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 68): the account menu in `lc-menu`. The identity is the `[header]`; „Darstellung“ is a radio section whose items lead with a `swatch` (20 px, a 1 px rim; two colours draw the halves of „Wie das System“), after the radio dot; „Dichte“ is a radio section of three (the segmented look stays out: a toolbar inside `role="menu"` would break its arrow keys); „Töne“ and „Tastenkürzel anzeigen“ are checkbox items. Swatches are decorative (`aria-hidden`), the labels name the choice, and forced colours draw them as given with a CanvasText rim.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuAccountDemoComponent] },
    template: `<lc-menu-account-demo />`,
  }),
};
