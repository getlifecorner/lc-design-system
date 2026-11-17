import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { SearchInputComponent } from './search-input.component';

const PALETTE_COMMANDS = ['Open invoices', 'Open cost centres', 'New booking', 'Settings', 'Sign out'];

/**
 * Request 064 (usm-x row 21): the field of a command palette. The page owns the
 * listbox and the keys; lc-search-input forwards the combobox attributes to its
 * inner input. ArrowDown/ArrowUp move `aria-activedescendant`, Enter picks.
 */
@Component({
  selector: 'lc-search-input-combobox-demo',
  standalone: true,
  imports: [SearchInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- keydown bubbles from the combobox field inside -->
    <div style="max-width: 360px; display: flex; flex-direction: column; gap: 4px;" (keydown)="onKey($event)">
      <lc-search-input
        placeholder="Type a command…"
        ariaLabel="Command"
        inputRole="combobox"
        ariaAutocomplete="list"
        ariaControls="palette-list"
        [debounceMs]="0"
        [ariaExpanded]="open()"
        [ariaActiveDescendant]="active() >= 0 ? 'palette-opt-' + active() : ''"
        [(value)]="query"
        (searchSubmit)="pick()"
      ></lc-search-input>
      <ul
        id="palette-list"
        role="listbox"
        aria-label="Commands"
        [hidden]="!open()"
        style="list-style: none; margin: 0; padding: 4px; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); background: var(--color-surface);"
      >
        @for (c of matches(); track c; let i = $index) {
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -- options of an aria-activedescendant listbox are not focusable; the keys are on the field -->
          <li
            role="option"
            [id]="'palette-opt-' + i"
            [attr.aria-selected]="i === active()"
            [style.background]="i === active() ? 'var(--color-primary-fill-subtle, var(--color-surface-hover))' : null"
            style="padding: 8px 12px; border-radius: var(--border-radius-sm); color: var(--color-text-primary);"
            (mousedown)="$event.preventDefault()"
            (click)="active.set(i); pick()"
          >
            {{ c }}
          </li>
        }
      </ul>
      <p role="status" style="margin: 0; font-size: var(--typography-font-size-sm); color: var(--color-text-secondary);">{{ status() }}</p>
    </div>
  `,
})
class SearchInputComboboxDemoComponent {
  protected readonly query = signal('');
  protected readonly active = signal(0);
  protected readonly status = signal('');
  protected readonly matches = computed(() =>
    PALETTE_COMMANDS.filter((c) => c.toLowerCase().includes(this.query().toLowerCase())),
  );
  protected readonly open = computed(() => this.matches().length > 0);

  protected onKey(event: KeyboardEvent): void {
    const n = this.matches().length;
    if (!n) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.active.set((Math.max(this.active(), 0) + step + n) % n);
    }
  }

  protected pick(): void {
    const c = this.matches()[this.active()];
    if (c) this.status.set(`Picked: ${c}`);
  }
}

const meta: Meta<SearchInputComponent> = {
  title: 'Form/Search Input',
  component: SearchInputComponent,
  parameters: {
    docs: {
      description: {
        component: `
Specialized search input with built-in magnifying glass icon, clear button, and debounced output.

**Key Features:**
- Search icon prefix
- Clear button appears when input has a value
- Debounced \`searchChange\` output (default 300ms)
- \`searchSubmit\` output on Enter key
- Two-way bindable \`value\` (preset / reset from the parent)
- 3 size variants (sm, md, lg)
- Disabled state
        `,
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    debounceMs: { control: { type: 'number', min: 0, max: 1000 } },
    disabled: { control: 'boolean' },
    value: { control: 'text', description: 'Current query (two-way bindable via [(value)])' },
    ariaLabel: { control: 'text', description: 'Accessible name (default "Search")' },
    inputRole: {
      control: 'select',
      options: [null, 'combobox'],
      description: '3.44: `role` on the inner input (`combobox` for a palette or an autocomplete). Unset renders none.',
      table: { defaultValue: { summary: 'null' } },
    },
    ariaExpanded: {
      control: 'select',
      options: [null, true, false],
      description: '3.44: `aria-expanded` on the inner input. Unset renders none.',
      table: { defaultValue: { summary: 'null' } },
    },
    ariaControls: {
      control: 'text',
      description: '3.44: `aria-controls` on the inner input (id of the listbox). Empty renders none.',
      table: { defaultValue: { summary: "''" } },
    },
    ariaActiveDescendant: {
      control: 'text',
      description: '3.44: `aria-activedescendant` on the inner input (id of the active option). Empty renders none.',
      table: { defaultValue: { summary: "''" } },
    },
    ariaAutocomplete: {
      control: 'select',
      options: [null, 'list', 'inline', 'both', 'none'],
      description: '3.44: `aria-autocomplete` on the inner input. Unset renders none.',
      table: { defaultValue: { summary: 'null' } },
    },
    ariaHasPopup: {
      control: 'select',
      options: [null, 'listbox', 'grid', 'tree', 'dialog'],
      description: '3.44: `aria-haspopup` on the inner input. Unset renders none.',
      table: { defaultValue: { summary: 'null' } },
    },
    clearOnEscape: {
      control: 'boolean',
      description:
        '3.45: Escape with text clears the field (one `""` emission, focus stays, the key is consumed); on an empty field Escape passes on, so a dialog around it closes. `false`: as before 3.45.',
      table: { defaultValue: { summary: 'true' } },
    },
    description: {
      control: 'text',
      description: '3.45: what the field searches; visually hidden text linked by `aria-describedby`. Empty renders nothing.',
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Default: Story = {
  args: { placeholder: 'Search…', size: 'md', debounceMs: 300 },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
        <lc-search-input size="sm" placeholder="Small search"></lc-search-input>
        <lc-search-input size="md" placeholder="Medium search"></lc-search-input>
        <lc-search-input size="lg" placeholder="Large search"></lc-search-input>
      </div>`,
  }),
};

export const Disabled: Story = {
  args: { placeholder: 'Search disabled', disabled: true, size: 'md' },
};

export const WithPresetValue: Story = {
  parameters: {
    docs: { description: { story: 'A parent can preset or reset the query via `[value]`; external writes do not emit `searchChange`.' } },
  },
  args: { placeholder: 'Search…', value: 'preset query', size: 'md', debounceMs: 300 },
};

/**
 * 3.22 (BA-6): an app that registers no icons and sets
 * `unregistered: 'placeholder'` (life-os) still gets the magnifier and the
 * clear icon, because lc-search-input registers both itself.
 */
export const AppRegistersNoIcons: Story = {
  name: 'App Registers No Icons',
  decorators: [applicationConfig({ providers: [provideLcIcons([], { unregistered: 'placeholder' })] })],
  parameters: {
    docs: {
      description: {
        story:
          "`provideLcIcons([], { unregistered: 'placeholder' })`: the app registers nothing. lc-search-input registers `ICON_SEARCH` (drawn as `magnifying-glass`) and `ICON_X_MARK` itself, so neither shows the placeholder (before 3.22 the magnifier did). English, German, and German with a value and its clear button.",
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-search-input placeholder="Search banks…" ariaLabel="Search banks"></lc-search-input>
        <lc-search-input lang="de" placeholder="Bank, BIC oder Ort suchen …" ariaLabel="Banken durchsuchen"></lc-search-input>
        <lc-search-input lang="de" placeholder="Bank, BIC oder Ort suchen …" ariaLabel="Banken durchsuchen" value="Sparkasse" clearAriaLabel="Suche leeren"></lc-search-input>
      </div>`,
  }),
};

/**
 * 3.44 (request 064, usm-x row 21): the field of a command palette. The page
 * owns the listbox and the keys; `inputRole`, `ariaExpanded`, `ariaControls`,
 * `ariaActiveDescendant` and `ariaAutocomplete` land on the inner input.
 */
export const Combobox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A command-palette field: `inputRole="combobox"`, `ariaAutocomplete="list"`, `ariaControls` = the listbox id, `[ariaExpanded]` and `[ariaActiveDescendant]` from the page. ArrowDown/ArrowUp move the active option (the page listens to the host’s bubbling `keydown`), Enter picks it. Unset, none of these attributes renders.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SearchInputComboboxDemoComponent] },
    template: `<lc-search-input-combobox-demo />`,
  }),
};

/**
 * 3.45 (request 065, usm-x row 32): `description` tells screen-reader users
 * what the field searches; Escape clears a field with text and passes on when
 * it is empty.
 */
export const Description: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`description` is read with the field (`aria-describedby` → a visually hidden text), not only shown as a `title`. Press Escape in a field with text: it clears (one `""` on `searchChange`, the focus stays); in an empty field Escape passes on, so a modal or command palette around it closes. English and German, each with a preset value.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <lc-search-input
          placeholder="Search records…"
          ariaLabel="Search records"
          description="Searches names, numbers and cost centres."
          value="Kosten"
        ></lc-search-input>
        <lc-search-input
          lang="de"
          placeholder="Datensätze durchsuchen …"
          ariaLabel="Datensätze durchsuchen"
          clearAriaLabel="Suche leeren"
          description="Durchsucht Namen, Nummern und Kostenstellen."
          value="Leistungsverrechnung"
        ></lc-search-input>
      </div>`,
  }),
};
