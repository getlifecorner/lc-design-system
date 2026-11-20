import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { userEvent } from 'storybook/test';
import type { MenuItem } from '../menu/menu.component';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { SplitButtonComponent } from './split-button.component';

const ITEMS_EN: MenuItem[] = [
  { id: 'save-as', label: 'Save as …' },
  { id: 'template', label: 'Save as template' },
  { id: 'discard', label: 'Discard', variant: 'danger' },
];

const ITEMS_DE: MenuItem[] = [
  { id: 'save-as', label: 'Speichern unter …' },
  { id: 'template', label: 'Als Vorlage speichern' },
  { id: 'discard', label: 'Verwerfen', variant: 'danger' },
];

const meta: Meta<SplitButtonComponent> = {
  title: 'Components/Split Button',
  component: SplitButtonComponent,
  decorators: [moduleMetadata({ imports: [SplitButtonComponent, IconComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
A face that runs the default action and a caret that opens a menu of the other actions, in one outline (3.44, usm-x row 30).

**Key Features:**
- Two real buttons in a \`role="group"\` (two tab stops): the face is an \`lc-button\` (label = default content, icon = \`[slot='icon-before']\`) and emits \`clicked\`; the caret opens an \`lc-menu\` of \`items\` and emits \`itemClick\`
- The caret is named by \`menuAriaLabel\` (default "More actions", German „Weitere Aktionen“) and carries \`aria-haspopup="menu"\` and \`aria-expanded\`, also in prerendered HTML
- Enter, Space, ArrowDown or ArrowUp on the caret open the menu with its first item focused; Escape and Tab close it; after an item the focus returns to the caret
- \`variant\` primary, secondary or outline (default: a toolbar group should not compete with the page's primary action); \`size\` sm, md, lg. The caret is at least 36, 44 or 48 px wide and takes the face's height
- \`disabled\` disables both parts; \`loading\` shows the face's spinner and dims the caret (\`aria-disabled\`, no activation)
        `,
      },
    },
  },
  argTypes: {
    items: { control: 'object', description: 'Actions of the menu behind the caret (`lc-menu` items). Empty: the caret is disabled', table: { defaultValue: { summary: '[]' } } },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'outline'],
      description: 'Look of both parts',
      table: { defaultValue: { summary: 'outline' } },
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Size of both parts', table: { defaultValue: { summary: 'md' } } },
    disabled: { control: 'boolean', description: 'Both parts natively disabled', table: { defaultValue: { summary: 'false' } } },
    loading: {
      control: 'boolean',
      description: 'The face shows the spinner and keeps focus; the caret dims, gets `aria-disabled` and ignores activation',
      table: { defaultValue: { summary: 'false' } },
    },
    menuAriaLabel: {
      control: 'text',
      description: 'Accessible name of the caret; 3.50 (usm-x row 79): it also names the open menu (`aria-label` on its `role="menu"`)',
      table: { defaultValue: { summary: 'More actions' } },
    },
    menuPosition: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      description: 'Where the menu opens; `bottom-right` puts its end edge at the group’s end edge',
      table: { defaultValue: { summary: 'bottom-right' } },
    },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'primary'],
      description: '3.48 (usm-x row 63): colour tone of the `outline` look, on the face and the caret (`primary`: primary text and border, as `lc-button` `tone`)',
      table: { defaultValue: { summary: 'neutral' } },
    },
    accessKey: {
      control: 'text',
      description: '3.48 (usm-x row 63): the face’s `accesskey`; pair it with `ariaKeyShortcuts`. Empty renders none',
      table: { defaultValue: { summary: "''" } },
    },
    ariaKeyShortcuts: {
      control: 'text',
      description: '3.48 (usm-x row 63): the face’s `aria-keyshortcuts` (e.g. `Alt+O`). Empty renders none',
      table: { defaultValue: { summary: "''" } },
    },
    menuSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '3.48 (usm-x row 63): `lc-menu` `size` of the menu',
      table: { defaultValue: { summary: 'md' } },
    },
    menuMinWidth: { control: 'text', description: '3.48: `lc-menu` `minWidth` of the menu', table: { defaultValue: { summary: '220px' } } },
    menuMaxWidth: {
      control: 'text',
      description: '3.48: `lc-menu` `maxWidth` of the menu; empty leaves it unbounded',
      table: { defaultValue: { summary: "''" } },
    },
    menuMaxHeight: {
      control: 'text',
      description:
        "3.50 (usm-x row 79): `lc-menu` `maxHeight` of the menu: a CSS length or `'room'` (the room to the viewport edge picks side and height). Empty: the CSS hook `--lc-menu-max-height` on the split button or an ancestor, else no cap",
      table: { defaultValue: { summary: "''" } },
    },
    clicked: { action: 'clicked', description: 'The face was activated' },
    itemClick: { action: 'itemClick', description: 'A menu item was activated (the menu closes, focus returns to the caret)' },
  },
};

export default meta;
type Story = StoryObj<SplitButtonComponent>;

export const Default: Story = {
  args: { items: ITEMS_EN, variant: 'outline', size: 'md', disabled: false, loading: false, menuAriaLabel: 'More actions', menuPosition: 'bottom-right' },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: flex-start; min-height: 200px;">
        <lc-split-button [items]="items" [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading"
          [menuAriaLabel]="menuAriaLabel" [menuPosition]="menuPosition" (clicked)="clicked()" (itemClick)="itemClick($event)">
          <lc-icon slot="icon-before" name="file" size="sm" [decorative]="true" />Save
        </lc-split-button>
      </div>`,
  }),
};

export const VariantsAndSizes: Story = {
  name: 'Variants And Sizes',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Rows: `outline` (default; the face’s end border is the divider), `primary` and `secondary` (filled: a 1 px gap between the parts). Columns: `sm` (35.5 px high, caret ≥ 36 px), `md` (42, ≥ 44), `lg` (48.5, ≥ 48). Full radius outside, none inside.',
      },
    },
  },
  render: () => ({
    props: { items: ITEMS_EN, variants: ['outline', 'primary', 'secondary'], sizes: ['sm', 'md', 'lg'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        @for (v of variants; track v) {
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
            @for (s of sizes; track s) {
              <lc-split-button [items]="items" [variant]="v" [size]="s">Save</lc-split-button>
            }
          </div>
        }
      </div>`,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Disabled (both parts natively disabled), loading (the face’s spinner; the caret dims, keeps focus, gets `aria-disabled` and ignores activation), no items (the caret is disabled), and a menu with a disabled item (`lc-menu` skips it).',
      },
    },
  },
  render: () => ({
    props: {
      items: ITEMS_EN,
      withDisabled: [ITEMS_EN[0], { ...ITEMS_EN[1], disabled: true }, ITEMS_EN[2]],
      none: [],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-height: 200px; align-content: flex-start;">
        <lc-split-button [items]="items" [disabled]="true">Disabled</lc-split-button>
        <lc-split-button [items]="items" [loading]="true">Loading</lc-split-button>
        <lc-split-button [items]="none">No items</lc-split-button>
        <lc-split-button [items]="withDisabled" class="story-split-disabled-item">Disabled item</lc-split-button>
      </div>`,
  }),
};

export const German: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'German strings: face „Speichern“, caret „Weitere Aktionen“, items „Speichern unter …“, „Als Vorlage speichern“, „Verwerfen“. Second: a long face label wraps inside a narrow column and the caret stretches to the face’s height.',
      },
    },
  },
  render: () => ({
    props: { items: ITEMS_DE },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;">
        <lc-split-button [items]="items" size="sm" menuAriaLabel="Weitere Aktionen">
          <lc-icon slot="icon-before" name="file" size="xs" [decorative]="true" />Speichern
        </lc-split-button>
        <div style="max-width: 220px;">
          <lc-split-button [items]="items" variant="primary" menuAriaLabel="Weitere Aktionen">Änderungen speichern und veröffentlichen</lc-split-button>
        </div>
      </div>`,
  }),
};

export const MenuOpen: Story = {
  name: 'Menu Open',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The menu opened from the caret (as with Enter, Space or ArrowDown): `aria-expanded="true"`, `aria-controls` on the caret, the first item focused. `bottom-right`: the panel’s end edge is at the group’s end edge.',
      },
    },
  },
  render: () => ({
    props: { items: ITEMS_DE },
    template: `
      <div lang="de" style="display: flex; justify-content: flex-end; min-height: 220px; align-items: flex-start;">
        <lc-split-button [items]="items" size="sm" menuAriaLabel="Weitere Aktionen">Speichern</lc-split-button>
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    const caret = canvasElement.querySelector<HTMLButtonElement>('.lc-split-button__caret');
    if (caret) await userEvent.click(caret);
  },
};

const OPEN_ITEMS_DE: MenuItem[] = [
  { id: 'open-new', label: 'In neuem Fenster öffnen' },
  { id: 'open-rich', label: 'Im Rich Client öffnen' },
  { id: 'copy-link', label: 'Link kopieren' },
];

export const ToneAndMenuSize: Story = {
  name: 'Tone And Menu Size',
  args: {
    items: OPEN_ITEMS_DE,
    variant: 'outline',
    size: 'sm',
    tone: 'primary',
    accessKey: 'o',
    ariaKeyShortcuts: 'Alt+O',
    menuSize: 'sm',
    menuMinWidth: '220px',
    menuMaxWidth: '',
    menuAriaLabel: 'Weitere Aktionen',
    menuPosition: 'bottom-left',
  },
  parameters: {
    controls: { include: ['tone', 'accessKey', 'ariaKeyShortcuts', 'menuSize', 'menuMinWidth', 'menuMaxWidth', 'size', 'variant'] },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 63): a group beside brand-outline single buttons. `tone="primary"` gives the face and the caret the primary outline (as `lc-button` `tone`); `accessKey="o"` with `ariaKeyShortcuts="Alt+O"` sit on the face; `menuSize="sm"` opens an sm menu beside the page\'s other sm menus (`menuMinWidth`, `menuMaxWidth` pass through too). The menu is open for the shot.',
      },
    },
  },
  // `items` is outside `controls.include` (it would arrive undefined): a prop of its own.
  render: (args) => ({
    props: { ...args, openItems: OPEN_ITEMS_DE },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; min-height: 220px;">
        <lc-split-button [items]="openItems" [variant]="variant" [size]="size" [tone]="tone" [accessKey]="accessKey" [ariaKeyShortcuts]="ariaKeyShortcuts"
          [menuSize]="menuSize" [menuMinWidth]="menuMinWidth" [menuMaxWidth]="menuMaxWidth" menuAriaLabel="Weitere Aktionen" menuPosition="bottom-left">Öffnen</lc-split-button>
        <lc-button variant="outline" tone="primary" size="sm">Bearbeiten</lc-button>
      </div>`,
    moduleMetadata: { imports: [ButtonComponent] },
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    const caret = canvasElement.querySelector<HTMLButtonElement>('.lc-split-button__caret');
    if (caret) await userEvent.click(caret);
  },
};

const LONG_ITEMS_DE: MenuItem[] = [
  'Kopieren',
  'Verschieben',
  'Umbenennen',
  'Duplizieren',
  'Archivieren',
  'Exportieren',
  'Drucken',
  'Teilen',
  'Sperren',
  'Freigeben',
  'Verlauf',
  'Löschen',
].map((label, i): MenuItem => ({ id: `a${i}`, label, variant: label === 'Löschen' ? 'danger' : 'default' }));

/** 3.50 (request 071, usm-x row 79): the menu's height, by input or by the CSS hook. */
export const MenuMaxHeight: Story = {
  name: 'Menu Max Height',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 79): left, `--lc-menu-max-height: 200px` set on the split button (the menu reads the hook when it opens, also for an overlay): the panel is 200 px high and its items scroll. Right, `menuMaxHeight="room"`: the room between the group and the viewport edge picks the side and the height. Both menus are open for the shot. `menuAriaLabel` („Weitere Aktionen“) names the caret and, since 3.50, the open `role="menu"` too.',
      },
    },
  },
  render: () => ({
    props: { items: LONG_ITEMS_DE },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="min-height: 260px;">
          <lc-split-button class="hook" [items]="items" size="sm" menuMinWidth="150px" menuPosition="bottom-left" menuAriaLabel="Weitere Aktionen" style="--lc-menu-max-height: 200px;">Speichern</lc-split-button>
        </div>
        <div style="display: flex; justify-content: flex-end; min-height: 600px;">
          <lc-split-button class="room" [items]="items" size="sm" menuMinWidth="150px" menuPosition="bottom-right" menuMaxHeight="room" menuAriaLabel="Weitere Aktionen">Öffnen</lc-split-button>
        </div>
      </div>`,
  }),
  // ArrowDown opens a menu without a click, so the first menu is not closed as clicked outside.
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    for (const group of ['.hook', '.room']) {
      const caret = canvasElement.querySelector<HTMLButtonElement>(`${group} .lc-split-button__caret`);
      if (!caret) continue;
      caret.focus();
      await userEvent.keyboard('{ArrowDown}');
    }
  },
};
