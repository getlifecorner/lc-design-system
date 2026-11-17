import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { userEvent } from 'storybook/test';
import type { MenuItem } from '../menu/menu.component';
import { IconComponent } from '../icon/icon.component';
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
    menuAriaLabel: { control: 'text', description: 'Accessible name of the caret', table: { defaultValue: { summary: 'More actions' } } },
    menuPosition: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      description: 'Where the menu opens; `bottom-right` puts its end edge at the group’s end edge',
      table: { defaultValue: { summary: 'bottom-right' } },
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
