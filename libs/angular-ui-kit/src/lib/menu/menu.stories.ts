import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { MenuComponent } from './menu.component';

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
  },
  argTypes: {
    itemClick: { action: 'itemClick', description: 'Emitted with the MenuItem when an item is clicked' },
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
        '`MenuItem[]`. 3.43 (usm-x row 12): an item with `children` is a section: its `label` is a heading (not focusable, not an action) and the children are its items, in a `role="group"` named by the heading; one level. `indentChildren: true` indents them one step (md 16, sm 12, lg 20 px); `dividerAfter` on a section follows the whole group. The arrow keys, Home and End run over the items of every section',
      table: { defaultValue: { summary: '[]' } },
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
