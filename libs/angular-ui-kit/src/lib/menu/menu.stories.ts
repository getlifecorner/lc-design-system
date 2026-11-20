import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  signal,
  viewChild,
  type OnDestroy,
} from '@angular/core';
import { MenuComponent, type MenuAnchor, type MenuItem, type MenuItemToggleEvent } from './menu.component';
import { MenuControlDirective } from './menu-control.directive';
import { ToggleGroupComponent } from '../toggle-group/toggle-group.component';
import { SwitchComponent } from '../switch/switch.component';

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
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right', 'right-start', 'left-start'],
      description:
        'Anchor position relative to the trigger element (`MenuPosition`). 3.51 (request 072, backlog 071-n3): `right-start` / `left-start` open the panel beside the anchor or trigger, 8 px apart, top edges aligned; `right` and `left` are physical in LTR and RTL. With an element `anchor` the panel flips to the other side when there is no room and shifts inside the 8 px viewport margin; with `maxHeight="room"` it is the viewport less 32 px high',
      table: { defaultValue: { summary: "'bottom-right'" } },
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
        '`MenuItem[]`. 3.43 (usm-x row 12): an item with `children` is a section: its `label` is a heading (not focusable, not an action) and the children are its items, in a `role="group"` named by the heading; one level. `indentChildren: true` indents them one step (md 16, sm 12, lg 20 px); `dividerAfter` on a section follows the whole group. The arrow keys, Home and End run over the items of every section. 3.45 (usm-x row 31): `type: \'checkbox\' | \'radio\'` with `checked` (controlled), `radioGroup` (the exclusive set) and `closeOnSelect` (`true`: the menu emits `closed` after the item acts). 3.48 (usm-x rows 56, 57, 68): `tooltip` (kit tooltip on hover and focus), `disabledReason` (a `disabled` item with a reason stays in the arrow order as `aria-disabled` and shows the reason), `emphasis` (bold label, visual only), `swatch` (a colour sample or two halves before the label, decorative); `dividerAfter` on a member draws between members of a section. 3.50 (usm-x rows 77, 78, 80): `current` (`aria-current`, a 3 px bar, semibold), `busy` (spinner, `aria-busy`, not activatable), `badgeVariant` (the badge as an `lc-badge` variant), `attrs` (`id` and `data-*` only), `control` (inline control rows); a member with `children` is a section again, to any depth. 3.51 (request 072, backlog 071-n7): `partLabel` on the first entry of a `role="menu"` part after a control row names that part',
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
        '3.48 (usm-x row 54): caps the panel height (CSS length, e.g. `min(56vh, 420px)`); the items scroll inside, header and footer stay, the keyboard-focused item is scrolled into view. Empty: no cap (overlay: the viewport less 16 px). 3.49 (usm-x row 73): `room` sizes the panel to the room between its origin and the viewport edge on the side it opens to (8 px gap, 8 px margin), at least 3 items plus header and footer; `position`\'s side is kept while its room holds min(240 px, the whole panel), else the side with more room opens',
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
    inline: {
      control: 'boolean',
      description:
        '3.50 (usm-x row 77): the menu in the page (an account panel): the panel always renders (also prerendered), no trigger slot, no overlay, no frame, the container\'s width; `isOpen`, `position`, `anchor`, `maxHeight`, `minWidth`, `maxWidth` and `closeOnSelect` are ignored and nothing closes it (`closed` is not emitted). `role="menu"`, roving tabindex and Arrow/Home/End stay. Top-level entries with `control` become control rows (`ng-template[lcMenuControl]`) between the menu parts, one Tab stop per part',
      table: { defaultValue: { summary: 'false' } },
    },
    busyLabel: {
      control: 'text',
      description: '3.50: hidden text read after the label of a `busy` item. German: „Wird geladen“',
      table: { defaultValue: { summary: "'Loading'" } },
    },
    returnFocusTo: {
      control: false,
      description:
        '3.50 (backlog 068-n3): `HTMLElement | null`, the element that gets the focus when the menu closes from inside (Escape, Tab, an item), before the trigger, the anchor element and the element focused at open. Use it with a point `anchor` when nothing was focused, or for a menu beside a rail item. `null`: as before',
      table: { defaultValue: { summary: 'null' } },
    },
    popupControls: {
      control: 'boolean',
      description:
        '3.51 (request 072, backlog 071-n4): a popup menu draws `control` entries as control rows (as `inline`), split into `role="menu"` parts. The arrows stay inside a part; Tab and Shift+Tab walk the parts, the controls and header/footer controls, and Tab past the last stop (Shift+Tab before the first) closes the menu as Tab does without control rows. A click in a control keeps it open; Escape closes and returns the focus. Inline: ignored. `false`: a `control` entry is a plain item in a popup, as before',
      table: { defaultValue: { summary: 'false' } },
    },
    partAriaLabel: {
      control: 'text',
      description:
        '3.51 (request 072, backlog 071-n7): the name of a later `role="menu"` part without `partLabel` that does not start with a section, while `ariaLabel` is set: `{label}` is `ariaLabel`, `{n}` the part\'s number (2, 3 …). German „{label}, Teil {n}“. `\'\'`: such a part stays unnamed, as in 3.50',
      table: { defaultValue: { summary: "'{label}, part {n}'" } },
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

/**
 * 3.49 (request 069, usm-x row 73): the 26 entries at an anchor button whose
 * top sits at `top` of the viewport height (less the 16 px canvas padding).
 * The menu opens once the canvas has its padding (the room is measured on
 * open, as when a user clicks „Weitere“); the button toggles it.
 */
@Component({
  selector: 'lc-menu-room-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" [style.padding-top]="'calc(' + top() + ' - 16px)'">
      <button #t type="button" aria-haspopup="menu" [attr.aria-expanded]="open()" style="${TOKEN_TRIGGER}" (click)="open.set(!open())">Weitere ▾</button>
      <lc-menu [items]="items" [isOpen]="open()" [anchor]="t" [position]="position()" size="sm" [maxHeight]="maxHeight()" (itemClick)="open.set(false)" (closed)="open.set(false)" />
    </div>
  `,
})
class MenuRoomDemoComponent {
  readonly top = input('33vh');
  readonly position = input<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'>('bottom-left');
  readonly maxHeight = input('room');
  protected readonly items = LONG_MENU;
  protected readonly open = signal(false);

  constructor() {
    afterNextRender(() => setTimeout(() => this.open.set(true), 100));
  }
}

export const LongMenuRoom: Story = {
  name: 'Long Menu Room',
  args: { position: 'bottom-left', maxHeight: 'room' },
  parameters: {
    controls: { include: ['position', 'maxHeight'] },
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 73, the catalog row menu): `maxHeight="room"` sizes the panel to the room between the anchor and the viewport edge on the side it opens to, less the 8 px gap and the viewport margin (16 px at the bottom of an overlay, 8 px elsewhere). The „Weitere“ button sits at a third of the viewport; at 1280 × 1150 the 26 entries (`size="sm"`) get 702 px, 20 visible instead of 10 behind a 420 px cap, and the rest scroll inside (`overscroll-behavior: contain`, the focused item is scrolled into view). At least 3 items plus header and footer, so a short window scrolls. Measured on open, on resize and when the items change. The button toggles the menu.',
      },
    },
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [MenuRoomDemoComponent] },
    template: `<lc-menu-room-demo top="33vh" [position]="position" [maxHeight]="maxHeight" />`,
  }),
};

export const LongMenuRoomFlipsUp: Story = {
  name: 'Long Menu Room Flips Up',
  args: { position: 'bottom-left', maxHeight: 'room' },
  parameters: {
    controls: { include: ['position', 'maxHeight'] },
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 73): the room also picks the side. `position="bottom-left"` asks for below; the button sits at three quarters of the viewport, so at 1280 × 1150 the room below is 219.5 px, under min(240 px, the whole panel), and the panel opens above with the larger room (846 px, 24 of 26 entries visible), its bottom 8 px over the button. While the preferred side holds 240 px (or the whole panel) it is kept.',
      },
    },
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [MenuRoomDemoComponent] },
    template: `<lc-menu-room-demo top="75vh" [position]="position" [maxHeight]="maxHeight" />`,
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

/** A panel box for the inline stories: the page's surface, a hairline, rounded. */
const PANEL_BOX =
  'box-sizing: border-box; width: min(100%, 20.5rem); padding: 8px 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-lg); color: var(--color-text-primary);';

const INLINE_ITEMS: MenuItem[] = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'cog-6-tooth', dividerAfter: true },
  {
    id: 'workspace',
    label: 'Workspace',
    dividerAfter: true,
    children: [
      { id: 'members', label: 'Members' },
      { id: 'billing', label: 'Billing', metadata: { badge: '2' } },
    ],
  },
  { id: 'logout', label: 'Sign out', icon: 'arrow-right-on-rectangle', variant: 'danger' },
];

/** 3.50 (request 071, usm-x row 77): the menu in the page. */
export const Inline: Story = {
  name: 'Inline',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 77): `inline` renders the menu in the page, here in a panel box: no trigger slot, no overlay, no border, shadow or slide-in of its own, the container\'s width. It is always rendered (also in prerendered HTML) and never closes: Tab moves on, Escape is left to the page, outside clicks and scrolling do nothing (`closed` is not emitted). `role="menu"` stays, named by `ariaLabel`; one Tab stop (the first item until the arrows move it), Arrow/Home/End wrap, Enter and Space activate. Items, the section and the divider look as in a popup.',
      },
    },
  },
  render: () => ({
    props: { items: INLINE_ITEMS },
    template: `
      <div lang="en" style="${PANEL_BOX}">
        <lc-menu [inline]="true" [items]="items" ariaLabel="Account" />
      </div>`,
  }),
};

/** The account panel's entries (usm-x row 77): two parts around three control rows. */
const ACCOUNT_PANEL: MenuItem[] = [
  { id: 'light', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true, swatch: '#ffffff' },
  { id: 'dark', label: 'Dunkel', type: 'radio', radioGroup: 'theme', swatch: '#111827' },
  { id: 'density', label: 'Dichte', control: 'density' },
  { id: 'sounds', label: 'Töne', control: 'sounds' },
  { id: 'shortcuts', label: 'Tastenkürzel anzeigen', control: 'shortcuts' },
  // 3.51 (backlog 071-n7): the second part is named „Konto“
  { id: 'profile', label: 'Profil', current: true, partLabel: 'Konto' },
  { id: 'logout', label: 'Abmelden', variant: 'danger' },
];

@Component({
  selector: 'lc-menu-account-panel-demo',
  standalone: true,
  imports: [MenuComponent, MenuControlDirective, ToggleGroupComponent, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="${PANEL_BOX}">
      <lc-menu [inline]="true" [items]="items()" ariaLabel="Darstellung" (itemToggle)="items.set(apply(items(), $event))">
        <div header style="padding: 4px 16px 12px; border-bottom: 1px solid var(--color-divider); margin-bottom: 8px;">
          <div style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">Erika Mustermann</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">erika.mustermann&#64;example.de</div>
        </div>
        <ng-template lcMenuControl="density" let-labelId="labelId">
          <lc-toggle-group [options]="densities" [(selected)]="density" size="sm" [touchTarget]="true" [ariaLabelledBy]="labelId" />
        </ng-template>
        <ng-template lcMenuControl="sounds">
          <lc-switch ariaLabel="Töne" [checked]="sounds()" (checkedChange)="sounds.set($event)" />
        </ng-template>
        <ng-template lcMenuControl="shortcuts">
          <lc-switch ariaLabel="Tastenkürzel anzeigen" [checked]="shortcuts()" (checkedChange)="shortcuts.set($event)" />
        </ng-template>
      </lc-menu>
    </div>
  `,
})
class MenuAccountPanelDemoComponent {
  protected readonly items = signal<MenuItem[]>(ACCOUNT_PANEL);
  protected readonly apply = applyToggle;
  protected readonly densities = [
    { value: 'compact', label: 'Kompakt' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Weit' },
  ];
  protected readonly density = signal('normal');
  protected readonly sounds = signal(true);
  protected readonly shortcuts = signal(false);
}

/** 3.50 (request 071, usm-x row 77): an account panel: identity, theme radios, control rows, links. */
export const AccountPanel: Story = {
  name: 'Account Panel',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 77): the account panel as one inline menu. The identity is the `[header]`; „Hell“ and „Dunkel“ are radio items with a swatch (a `role="menu"` named „Darstellung“); „Dichte“, „Töne“ and „Tastenkürzel anzeigen“ are control rows (`MenuItem.control` + `ng-template[lcMenuControl]`): an `lc-toggle-group` with `touchTarget` and two `lc-switch`, outside `role="menu"`, at least 44 px high, the label before the control (the toggle group is named by the row label through `labelId`); „Profil“ (`current`: bar and semibold) and „Abmelden“ are the second menu part, named „Konto“ by `partLabel` on „Profil“ (3.51, backlog 071-n7). Tab: radio part → toggle group → switch → switch → second part (one stop per part); the arrows stay inside a part. At 360 px the toggle group fits beside „Dichte“; a longer label would put it on the next line (8 px below).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuAccountPanelDemoComponent] },
    template: `<lc-menu-account-panel-demo />`,
  }),
};

/** The item states of 3.50 (usm-x rows 78, 80): current, busy, the six badge variants, attrs. */
const STATES: MenuItem[] = [
  { id: 'objekttypen', label: 'Objekttypen', current: true, attrs: { id: 'menu-objekttypen', 'data-testid': 'objekttypen' } },
  { id: 'zaehler', label: 'Zähler', busy: true, metadata: { badge: '4' } },
  { id: 'pruefungen', label: 'Prüfungen', badgeVariant: 'warning', metadata: { badge: '12' }, dividerAfter: true },
  { id: 'default', label: 'Entwürfe', badgeVariant: 'default', metadata: { badge: '3' } },
  { id: 'primary', label: 'Neu', badgeVariant: 'primary', metadata: { badge: '5' } },
  { id: 'success', label: 'Freigegeben', badgeVariant: 'success', metadata: { badge: '28' } },
  { id: 'error', label: 'Fehlerhafte Zuordnungen', badgeVariant: 'error', metadata: { badge: '1' } },
  { id: 'info', label: 'Hinweise', badgeVariant: 'info', metadata: { badge: '7' } },
  { id: 'plain', label: 'Ohne Variante', metadata: { badge: '9' } },
];

/** 3.50 (request 071, usm-x rows 78, 80): current, busy and coloured badges in an open menu. */
export const CurrentBusyAndBadges: Story = {
  name: 'Current, Busy And Badges',
  args: { isOpen: true, position: 'bottom-left', ariaLabel: 'Stammdaten', items: STATES, busyLabel: 'Wird geladen' },
  parameters: {
    controls: { include: ['isOpen', 'position', 'ariaLabel', 'size', 'items', 'busyLabel'] },
    docs: {
      description: {
        story:
          '3.50 (usm-x rows 78, 80): „Objekttypen“ is `current`: `aria-current="true"`, a 3 px primary bar at its start, the selected fill (also on hover) and a semibold label, so the state never rests on colour alone (bar 3.75:1 light, 5.77:1 dark on the fill). „Zähler“ is `busy`: a 16 px spinner in the badge\'s place, `aria-busy`, `aria-disabled` and „Wird geladen“ (`busyLabel`) read after the label; it stays in the arrow order, a click, Enter or Space do nothing. The badges use `badgeVariant` (`lc-badge` xs, rounded, 20 px high: default, primary, success, warning, error, info; text 4.6:1 or more on the panel); „Ohne Variante“ keeps the old badge. `attrs` puts `id="menu-objekttypen"` and `data-testid` on the first item (`id` and `data-*` only).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 560px;">
        <lc-menu [items]="items" [isOpen]="isOpen" [position]="position" [size]="size || 'md'" [ariaLabel]="ariaLabel" [busyLabel]="busyLabel" (itemClick)="itemClick($event)" (closed)="closed()">
          <button trigger type="button" style="${TOKEN_TRIGGER}">Stammdaten ▾</button>
        </lc-menu>
      </div>`,
  }),
};

/** Sections to any depth (usm-x row 78): three levels. */
const NESTED: MenuItem[] = [
  {
    id: 'stamm',
    label: 'Stammdaten',
    dividerAfter: true,
    children: [
      {
        id: 'objekte',
        label: 'Objekte',
        children: [
          { id: 'objekttypen', label: 'Objekttypen', current: true },
          {
            id: 'felder',
            label: 'Felder',
            children: [
              { id: 'feldgruppen', label: 'Feldgruppen' },
              { id: 'feldtypen', label: 'Feldtypen' },
            ],
          },
        ],
      },
      { id: 'zaehler', label: 'Zähler' },
      { id: 'pruefungen', label: 'Prüfungen', badgeVariant: 'warning', metadata: { badge: '12' } },
    ],
  },
  { id: 'export', label: 'Exportieren' },
];

/** 3.50 (request 071, usm-x row 78): sections nested three levels, in sm, md and lg. */
export const NestedSections: Story = {
  name: 'Nested Sections',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 78): a member with `children` is a section again, to any depth: a `role="group"` named by its heading, inside the parent\'s group. „Stammdaten“ is level 1 (12 px semibold capitals, as before); „Objekte“ (level 2) and „Felder“ (level 3) are 12 px semibold without capitals, and heading and items move one step per level: items at 16 / 32 / 48 px in md, 12 / 24 / 36 in sm, 20 / 40 / 60 in lg. The arrow keys run over the items of every level in visual order. Shown as inline menus in panel boxes (sm, md, lg) so they sit side by side; a popup draws the same.',
      },
    },
  },
  render: () => ({
    props: { items: NESTED, sizes: ['sm', 'md', 'lg'] },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;">
        @for (size of sizes; track size) {
          <div style="${PANEL_BOX}">
            <lc-menu [inline]="true" [items]="items" [size]="size" [ariaLabel]="'Bereiche (' + size + ')'" />
          </div>
        }
      </div>`,
  }),
};

/** Three entries of the side-position menus. */
const SIDE_ITEMS: MenuItem[] = [
  { id: 'open', label: 'Öffnen' },
  { id: 'copy', label: 'Kopieren' },
  { id: 'move', label: 'Verschieben' },
];

/**
 * 3.51 (request 072, backlog 071-n3): three overlay menus beside their
 * anchors, opened once the canvas has its padding. They stay open (the
 * demo ignores `closed`).
 */
@Component({
  selector: 'lc-menu-side-positions-demo',
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="display: flex; flex-direction: column; gap: 152px; padding-bottom: 152px;">
      <div style="display: flex;">
        <button #a type="button" style="${TOKEN_TRIGGER}">right-start</button>
        <lc-menu [items]="items" [isOpen]="open()" [anchor]="a" position="right-start" ariaLabel="Aktionen (right-start)" />
      </div>
      <div style="display: flex; justify-content: center;">
        <button #b type="button" style="${TOKEN_TRIGGER}">left-start</button>
        <lc-menu [items]="items" [isOpen]="open()" [anchor]="b" position="left-start" ariaLabel="Aktionen (left-start)" />
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button #c type="button" style="${TOKEN_TRIGGER}">right-start am Rand</button>
        <lc-menu [items]="items" [isOpen]="open()" [anchor]="c" position="right-start" ariaLabel="Aktionen (am Rand)" />
      </div>
    </div>
  `,
})
class MenuSidePositionsDemoComponent {
  protected readonly items = SIDE_ITEMS;
  protected readonly open = signal(false);

  constructor() {
    afterNextRender(() => setTimeout(() => this.open.set(true), 100));
  }
}

/** 3.51 (request 072, backlog 071-n3): `right-start` and `left-start`. */
export const SidePositions: Story = {
  name: 'Side Positions',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n3): `position="right-start"` opens the panel beside its anchor on the right, `left-start` on the left: 8 px apart (the panel\'s inline margin, so a flipped panel keeps it), top edges aligned. `right` and `left` are physical, also in RTL. The third anchor sits at the right edge: there is no room on the right, so its panel flips to the left. A panel taller than the room below shifts up inside the 8 px viewport margin. At a point `anchor` the point\'s positions apply. Three menus are open at once here (the demo keeps them open).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuSidePositionsDemoComponent] },
    template: `<lc-menu-side-positions-demo />`,
  }),
};

/** The popup with control rows (3.51, backlog 071-n4): radios, two control rows, a named second part. */
const POPUP_CONTROLS: MenuItem[] = [
  { id: 'light', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true, swatch: '#ffffff' },
  { id: 'dark', label: 'Dunkel', type: 'radio', radioGroup: 'theme', swatch: '#111827' },
  { id: 'density', label: 'Dichte', control: 'density' },
  { id: 'sounds', label: 'Töne', control: 'sounds' },
  { id: 'profile', label: 'Profil', current: true, partLabel: 'Konto' },
  { id: 'logout', label: 'Abmelden' },
];

@Component({
  selector: 'lc-menu-popup-controls-demo',
  standalone: true,
  imports: [MenuComponent, MenuControlDirective, ToggleGroupComponent, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="position: relative; display: inline-block; padding: 16px 0; min-height: 440px;">
      <lc-menu
        [items]="items()"
        [isOpen]="open()"
        [popupControls]="true"
        position="bottom-left"
        ariaLabel="Darstellung"
        minWidth="280px"
        maxWidth="min(20rem, calc(100vw - 2rem))"
        (itemToggle)="items.set(apply(items(), $event))"
        (itemClick)="open.set(false)"
        (closed)="open.set(false)"
      >
        <button trigger type="button" style="${TOKEN_TRIGGER}" (click)="open.set(!open())">Ansicht ▾</button>
        <ng-template lcMenuControl="density" let-labelId="labelId">
          <lc-toggle-group [options]="densities" [(selected)]="density" size="sm" [touchTarget]="true" [ariaLabelledBy]="labelId" />
        </ng-template>
        <ng-template lcMenuControl="sounds">
          <lc-switch ariaLabel="Töne" [checked]="sounds()" (checkedChange)="sounds.set($event)" />
        </ng-template>
      </lc-menu>
    </div>
  `,
})
class MenuPopupControlsDemoComponent {
  protected readonly open = signal(true);
  protected readonly items = signal<MenuItem[]>(POPUP_CONTROLS);
  protected readonly apply = applyToggle;
  protected readonly densities = [
    { value: 'compact', label: 'Kompakt' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Weit' },
  ];
  protected readonly density = signal('normal');
  protected readonly sounds = signal(true);
}

/** 3.51 (request 072, backlog 071-n4): control rows in a popup menu. */
export const PopupControlRows: Story = {
  name: 'Popup Control Rows',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n4): `popupControls` draws the `control` entries of a popup menu as control rows, as `inline` does: „Dichte“ (an `lc-toggle-group` sm with `touchTarget`, named by the row label) and „Töne“ (an `lc-switch`) sit between two `role="menu"` parts, outside them, at least 44 px high. The first part („Hell“, „Dunkel“, named „Darstellung“ by `ariaLabel`) keeps the radio slot; the second („Profil“, „Abmelden“) is named „Konto“ by `partLabel`. Keyboard: the arrows stay inside a part; Tab walks radio part → toggle group → switch → second part, and Tab on „Profil“ (Shift+Tab on the first part) closes the menu as Tab always did. A click in a control keeps the menu open; Escape closes it and returns the focus to „Ansicht“. `minWidth="280px"`; at 360 px the panel (at most 320 px) holds „Dichte“ and the 172 px toggle group on one line.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [MenuPopupControlsDemoComponent] },
    template: `<lc-menu-popup-controls-demo />`,
  }),
};

/** An inline panel with a control row and an unnamed second part (the fallback name). */
const PART_NAMES_EN: MenuItem[] = [
  { id: 'light', label: 'Light', type: 'radio', radioGroup: 'theme', checked: true },
  { id: 'dark', label: 'Dark', type: 'radio', radioGroup: 'theme' },
  { id: 'sounds', label: 'Sounds', control: 'sounds' },
  { id: 'profile', label: 'Profile', current: true },
  { id: 'logout', label: 'Sign out' },
];

const PART_NAMES_DE: MenuItem[] = [
  { id: 'light', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true },
  { id: 'dark', label: 'Dunkel', type: 'radio', radioGroup: 'theme' },
  { id: 'sounds', label: 'Töne', control: 'sounds' },
  { id: 'profile', label: 'Profil', current: true },
  { id: 'logout', label: 'Abmelden' },
];

/** 3.51 (request 072, backlog 071-n7): every `role="menu"` part has a name. */
export const PartNames: Story = {
  name: 'Part Names',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.51 (request 072, backlog 071-n7): a control row splits an inline menu into `role="menu"` parts. The first part is named by `ariaLabel` („Account“); a later part without `partLabel` that does not start with a section is named by `partAriaLabel` (default „{label}, part {n}“): „Account, part 2“. The German copy sets `partAriaLabel="{label}, Teil {n}"`: „Konto, Teil 2“. `MenuItem.partLabel` on the part\'s first entry names it instead (see *Account Panel*, *Popup Control Rows*); a part that starts with a section keeps the heading as its name, as in 3.50. No pixel changes: the names are for screen readers.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SwitchComponent, MenuControlDirective] },
    props: { en: PART_NAMES_EN, de: PART_NAMES_DE },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;">
        <div lang="en" style="${PANEL_BOX}">
          <lc-menu [inline]="true" [items]="en" ariaLabel="Account">
            <ng-template lcMenuControl="sounds"><lc-switch ariaLabel="Sounds" [checked]="true" /></ng-template>
          </lc-menu>
        </div>
        <div lang="de" style="${PANEL_BOX}">
          <lc-menu [inline]="true" [items]="de" ariaLabel="Konto" partAriaLabel="{label}, Teil {n}">
            <ng-template lcMenuControl="sounds"><lc-switch ariaLabel="Töne" [checked]="true" /></ng-template>
          </lc-menu>
        </div>
      </div>`,
  }),
};
