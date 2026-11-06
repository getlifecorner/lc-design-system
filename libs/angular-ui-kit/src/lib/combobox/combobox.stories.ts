import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, input, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { ComboboxComponent, ComboboxOption } from './combobox.component';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

/** The months of the *Focus on Open* stories (request 055). */
const MONTH_OPTIONS: ComboboxOption[] = [
  { value: '2026-10', label: 'Oktober 2026', description: 'Noch nicht eingefroren' },
  { value: '2026-09', label: 'September 2026', description: 'Entwurf vorhanden' },
  { value: '2026-08', label: 'August 2026', description: 'Fassung 1 freigegeben' },
  { value: '2026-07', label: 'Juli 2026', description: 'Fassung 2 freigegeben' },
];

/**
 * 3.35 (request 055, monatsstand-prove row 1): "Monat einfrieren" opens a
 * form with the focus in its month field.
 */
@Component({
  selector: 'lc-combobox-focus-on-open-demo',
  standalone: true,
  imports: [ComboboxComponent, ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-button variant="primary" (click)="openForm($any($event.currentTarget))">Monat einfrieren</lc-button>
      <lc-modal
        [open]="open()"
        (openChange)="open.set($event)"
        placement="auto"
        size="md"
        [returnFocusTo]="trigger()"
        [closeOnBackdropClick]="false"
        ariaLabelledBy="freeze-title"
        closeAriaLabel="Schließen"
      >
        <div slot="header"><h2 id="freeze-title">Monat einfrieren</h2></div>
        <div slot="body">
          <lc-combobox
            [options]="months"
            label="Monat"
            placeholder="Monat suchen …"
            emptyMessage="Keine Treffer"
            clearAriaLabel="Auswahl löschen"
            [openOnFocus]="openOnFocus()"
          />
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="ghost" (click)="open.set(false)">Abbrechen</lc-button>
          <lc-button variant="primary" (click)="open.set(false)">Einfrieren</lc-button>
        </div>
      </lc-modal>
    </div>
  `,
})
class ComboboxFocusOnOpenDemoComponent {
  /** Passed to the field's `openOnFocus`. */
  readonly openOnFocus = input(true);
  private readonly injector = inject(Injector);
  private readonly field = viewChild.required(ComboboxComponent);
  protected readonly months = MONTH_OPTIONS;
  protected readonly open = signal(false);
  protected readonly trigger = signal<HTMLElement | null>(null);

  protected openForm(trigger: HTMLElement): void {
    this.trigger.set(trigger);
    this.open.set(true);
    // After the render: the dialog exists and has moved the focus to its first control.
    afterNextRender(() => this.field().focus(), { injector: this.injector });
  }
}

const meta: Meta<ComboboxComponent> = {
  title: 'Form/Combobox',
  component: ComboboxComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Combobox component combines a free-text input with a dropdown
of suggestions. Supports sync and async option loading, single/multiple
selection, create-new entries, grouped options, and keyboard navigation.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    multiple: { control: 'boolean' },
    allowCreate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    selectedValue: {
      control: 'text',
      description:
        "3.29: the `value` of the selected option, two-way: `[(selectedValue)]=\"month\"`. Shows that option's label (also when `options` arrive later; unknown = empty). Page writes, also back to `null`, select or clear silently; every user choice or clear emits `selectedValueChange`, next to the unchanged `valueChange` (the option object). Single mode only; use it or a forms binding, not both.",
      table: { defaultValue: { summary: 'null' } },
    },
    openOnFocus: {
      control: 'boolean',
      description:
        'Whether the list opens when the field gets focus (3.32, request 051). With `false`, focus alone (`focus()` from the page, Tab) leaves the list closed and `aria-expanded="false"`; a click or tap on the field, typing or ArrowDown opens it. Use it in forms that move focus into the field themselves, on open or to the first invalid field after a rejected save. Escape and choosing an option work as before.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
};

export default meta;
type Story = StoryObj<ComboboxComponent>;

const fruitOptions: ComboboxOption[] = [
  { value: 'apple', label: 'Apple', description: 'A sweet red fruit' },
  { value: 'banana', label: 'Banana', description: 'A curved yellow fruit' },
  { value: 'cherry', label: 'Cherry', description: 'A small red stone fruit' },
  { value: 'date', label: 'Date', description: 'A sweet brown fruit' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

const groupedOptions: ComboboxOption[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
  { value: 'broccoli', label: 'Broccoli', group: 'Vegetables' },
  { value: 'salmon', label: 'Salmon', group: 'Protein' },
  { value: 'chicken', label: 'Chicken', group: 'Protein' },
];

const iconOptions: ComboboxOption[] = [
  { value: 'home', label: 'Dashboard', icon: 'home', description: 'Go to dashboard' },
  { value: 'users', label: 'Team Members', icon: 'users', description: 'Manage team' },
  { value: 'cog', label: 'Settings', icon: 'cog-6-tooth', description: 'App settings' },
  { value: 'doc', label: 'Documents', icon: 'document-text', description: 'View documents' },
];

export const Default: Story = {
  args: {
    options: fruitOptions,
    label: 'Select a fruit',
    placeholder: 'Type to search...',
    helperText: 'Start typing to filter options',
  },
};

export const Multiple: Story = {
  args: {
    options: fruitOptions,
    label: 'Select fruits',
    placeholder: 'Add fruits...',
    multiple: true,
  },
  parameters: {
    docs: { description: { story: 'Multiple selection shows chips for selected items.' } },
  },
};

export const AllowCreate: Story = {
  args: {
    options: fruitOptions,
    label: 'Tags',
    placeholder: 'Add or create tags...',
    multiple: true,
    allowCreate: true,
    emptyMessage: 'No tags found — press Enter to create',
  },
  parameters: {
    docs: { description: { story: 'allowCreate shows a "Create" option when no exact match exists.' } },
  },
};

export const Grouped: Story = {
  args: {
    options: groupedOptions,
    label: 'Pick an ingredient',
    placeholder: 'Search ingredients...',
  },
  parameters: {
    docs: { description: { story: 'Options grouped by category with section headers.' } },
  },
};

export const WithIcons: Story = {
  args: {
    options: iconOptions,
    label: 'Navigate to',
    placeholder: 'Search pages...',
  },
  parameters: {
    docs: { description: { story: 'Options with icons and descriptions.' } },
  },
};

export const WithError: Story = {
  args: {
    options: fruitOptions,
    label: 'Required field',
    error: 'Please select at least one option',
  },
  parameters: {
    docs: { description: { story: 'Error state with validation message.' } },
  },
};

export const Disabled: Story = {
  args: {
    options: fruitOptions,
    label: 'Disabled combobox',
    disabled: true,
    placeholder: 'Cannot interact',
  },
};

export const Sizes: Story = {
  render: () => ({
    props: { options: fruitOptions },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <lc-combobox [options]="options" label="Extra Small" size="xs" placeholder="xs size" />
        <lc-combobox [options]="options" label="Small" size="sm" placeholder="sm size" />
        <lc-combobox [options]="options" label="Medium (default)" size="md" placeholder="md size" />
        <lc-combobox [options]="options" label="Large" size="lg" placeholder="lg size" />
      </div>`,
  }),
  parameters: {
    docs: { description: { story: 'Four size presets.' } },
  },
};

const GERMAN_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** The months of 2026: value „2026-07“, label „Juli 2026“. */
const monthOptions: ComboboxOption[] = GERMAN_MONTHS.map((name, i) => ({
  value: `2026-${String(i + 1).padStart(2, '0')}`,
  label: `${name} 2026`,
}));

/** 3.29 (request 046, regeln row 2): the page sets and resets the choice by value. */
export const StartsWithAChoice: Story = {
  name: 'Starts with a choice',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046, finance-intelligence rules page): `[(selectedValue)]="month"` binds the `value` of the chosen option, so the field starts with „Juli 2026“ for `\'2026-07\'`, also when the options arrive later. The page sets it again (Auf September setzen) or back to `null` (Zurücksetzen) without an event; every choice or clear by the user writes the new value back (the line below follows it), next to the unchanged `valueChange` with the option object.',
      },
    },
  },
  render: () => ({
    props: { monthOptions, month: signal<string | null>('2026-07') },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
        <lc-combobox
          [options]="monthOptions"
          label="Gilt ab"
          placeholder="Monat suchen …"
          emptyMessage="Keine Treffer"
          clearAriaLabel="Auswahl löschen"
          [(selectedValue)]="month"
        />
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <lc-button variant="outline" (click)="month.set(null)">Zurücksetzen</lc-button>
          <lc-button variant="outline" (click)="month.set('2026-09')">Auf September setzen</lc-button>
        </div>
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Wert: {{ month() ?? '–' }}</p>
      </div>`,
  }),
};

/** One option with a long German label (request 047). */
const longKeyOptions: ComboboxOption[] = [
  { value: 'ks-4711', label: 'Leistungsverrechnungsschlüssel Kostenstelle 4711 Verwaltung' },
];

/** 3.30 (request 047, regeln rows 5 and 6): clear targets in every size, the 44 px lg input. */
export const ClearTargetsDe: Story = {
  name: 'Clear Targets (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.30 (request 047, finance-intelligence rules page, rows 5 and 6): the clear button „Auswahl löschen“ is a 24 × 24 px box in every size (it was 20 × 20 and out of the tab order; now Tab reaches it, Enter or Space clears and focus returns to the input). At `size="lg"` a transparent hit area makes it 44 × 44 px, from the end of the input to the inner border edge; the input ends 12 px earlier for it. The lg input is 44 px high inside the unchanged 46 px frame (it was 36), and a click anywhere on the frame of any size focuses the input. Focus ring round the 24 px box: 4.18:1 light, 7.58:1 dark on the field. A long selected value ends before the hit area.',
      },
    },
  },
  render: () => ({
    props: { monthOptions, longKeyOptions, sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        @for (size of sizes; track size) {
          <lc-combobox
            [options]="monthOptions"
            [size]="size"
            [label]="'Gilt ab (' + size + ')'"
            placeholder="Monat suchen …"
            emptyMessage="Keine Treffer"
            clearAriaLabel="Auswahl löschen"
            [selectedValue]="'2026-07'"
          />
        }
        <lc-combobox
          [options]="longKeyOptions"
          size="lg"
          label="Schlüssel (langer Wert)"
          placeholder="Schlüssel suchen …"
          emptyMessage="Keine Treffer"
          clearAriaLabel="Auswahl löschen"
          [selectedValue]="'ks-4711'"
        />
      </div>`,
  }),
};

/** 3.30.2 (request 049, 048-f1): the dropdown takes the host's language context. */
export const PanelLanguage: Story = {
  name: 'Panel Language',
  parameters: {
    docs: {
      description: {
        story:
          '3.30.2 (request 049, 048-f1): the panel renders under `<body>`, outside the page\'s `lang` wrapper; it now takes the host\'s closest `[lang]` (the combobox has no `locale`), so screen readers read the German panel with German rules. Since 3.33 the list is at least as wide as the field (328 px at 360; it was as wide as its longest option) and a `lang` changed while it is open shows at once.',
      },
    },
  },
  render: () => ({
    props: { fruitOptions, monthOptions },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-combobox [options]="fruitOptions" label="Select a fruit" />
        <div lang="de">
          <lc-combobox
            [options]="monthOptions"
            label="Gilt ab"
            placeholder="Monat suchen …"
            emptyMessage="Keine Treffer"
            clearAriaLabel="Auswahl löschen"
          />
        </div>
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLInputElement>('[lang="de"] lc-combobox input')?.focus();
  },
};

/** 3.33 (request 052, 047-n1, 049-n2): a field at the bottom of the viewport opens its list above. */
export const OpensAbove: Story = {
  name: 'Opens Above',
  parameters: {
    docs: {
      description: {
        story:
          '3.33 (request 052): the field sits at the bottom of the viewport, so the list opens above it, 4 px from the field as below (047-n1: it was 0 above, the gap was a margin inside the overlay). The list is at least as wide as the field (049-n2: it was as wide as its longest option) and at most the viewport minus 16 px; wider options still grow it.',
      },
      story: { inline: false, height: '560px' },
    },
  },
  render: () => ({
    props: { fruitOptions },
    template: `
      <div style="display: flex; flex-direction: column; justify-content: flex-end; min-height: calc(100vh - 32px); max-width: 400px;">
        <lc-combobox [options]="fruitOptions" label="Select a fruit" placeholder="Type to search..." />
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLInputElement>('lc-combobox input')?.focus();
  },
};

const costCentreOptions: ComboboxOption[] = [
  { value: '4711', label: '4711 Administration' },
  { value: '4712', label: '4712 Sales' },
  { value: '4713', label: '4713 Production' },
  { value: '4714', label: '4714 Research and development' },
  { value: '4715', label: '4715 Human resources' },
];

const kostenstellenOptions: ComboboxOption[] = [
  { value: '4711', label: '4711 Verwaltung' },
  { value: '4712', label: '4712 Vertrieb' },
  { value: '4713', label: '4713 Produktion' },
  { value: '4714', label: '4714 Forschung und Entwicklung' },
  { value: '4715', label: '4715 Personalabteilung' },
];

/** 3.32 (request 051, stammdaten row 3): the form puts focus into the field, the list stays closed. */
export const OpenOnFocusOff: Story = {
  name: 'Open on focus off',
  parameters: {
    docs: {
      description: {
        story:
          '3.32 (request 051, finance-intelligence master data, row 3): `[openOnFocus]="false"`. The form moves focus into the field itself (on open, or to the first invalid field after a rejected save, here on load), and the list stays closed: `aria-expanded="false"`, no listbox, so the error text below the field stays visible. A click or tap on the field, typing or ArrowDown opens the list; Escape and choosing an option work as before. With the default `true` the list opens on every focus, as before.',
      },
    },
  },
  render: () => ({
    props: { costCentreOptions },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-combobox
          [options]="costCentreOptions"
          label="Cost centre"
          placeholder="Search cost centres…"
          error="Select a cost centre from the list."
          [openOnFocus]="false"
        />
        <div><lc-button>Save</lc-button></div>
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLInputElement>('lc-combobox input')?.focus();
  },
};

/** 3.32 (request 051): the same in German, with `multiple`. */
export const OpenOnFocusOffDe: Story = {
  name: 'Open on focus off (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.32 (request 051): `[openOnFocus]="false"` with `multiple`, in German. Focus from the page leaves the list closed and the error text visible; a click or tap on the field, typing or ArrowDown opens it.',
      },
    },
  },
  render: () => ({
    props: { kostenstellenOptions },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-combobox
          [options]="kostenstellenOptions"
          [multiple]="true"
          label="Kostenstellen"
          placeholder="Kostenstelle suchen …"
          emptyMessage="Keine Treffer"
          clearAriaLabel="Auswahl löschen"
          error="Wählen Sie mindestens eine Kostenstelle aus."
          [openOnFocus]="false"
        />
        <div><lc-button>Speichern</lc-button></div>
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLInputElement>('lc-combobox input')?.focus();
  },
};

/** 3.35 (request 055, monatsstand-prove row 1): a form that opens with the focus in its month field, list closed. */
export const FocusOnOpen: Story = {
  name: 'Focus on Open (3.35)',
  args: { openOnFocus: false },
  parameters: {
    controls: { include: ['openOnFocus'] },
    docs: {
      description: {
        story:
          '3.35 (request 055, finance-intelligence „Monat einfrieren“): `focus()` moves the focus into the field\'s `<input>`. „Monat einfrieren“ opens an `lc-modal` (`placement="auto"`: a bottom sheet below 640 px) and the page calls `afterNextRender(() => this.month().focus(), { injector })` with `month = viewChild.required(ComboboxComponent)` and its own `injector = inject(Injector)`; that runs after the dialog moved the focus to its first control, so the focus is in „Monat“. With `[openOnFocus]="false"` the list stays closed (`aria-expanded="false"`); a click or tap on the field, typing or ArrowDown opens it. The field shows the same 2 px ring as after Tab (3.35; it was a 1 px border and a faint halo). `returnFocusTo` gives the focus back to the trigger on close. In the story view the trigger is clicked on load without focusing it, as a WebKit tap.',
      },
      story: { inline: false, height: '520px' },
    },
  },
  render: (args) => ({
    props: { openOnFocus: args.openOnFocus },
    moduleMetadata: { imports: [ComboboxFocusOnOpenDemoComponent] },
    template: `<lc-combobox-focus-on-open-demo [openOnFocus]="openOnFocus" />`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLButtonElement>('lc-combobox-focus-on-open-demo lc-button button')?.click();
  },
};

/** 3.35 (request 055): the same with `openOnFocus` on, the list opens with the focus. */
export const FocusOnOpenListOpens: Story = {
  name: 'Focus on Open, List Opens (3.35)',
  args: { openOnFocus: true },
  parameters: {
    controls: { include: ['openOnFocus'] },
    docs: {
      description: {
        story:
          '3.35 (request 055): *Focus on Open* with `openOnFocus` on (the default). Like a user\'s focus, `focus()` opens the list (`aria-expanded="true"`) with the four months, above the sheet.',
      },
      story: { inline: false, height: '520px' },
    },
  },
  render: (args) => ({
    props: { openOnFocus: args.openOnFocus },
    moduleMetadata: { imports: [ComboboxFocusOnOpenDemoComponent] },
    template: `<lc-combobox-focus-on-open-demo [openOnFocus]="openOnFocus" />`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLButtonElement>('lc-combobox-focus-on-open-demo lc-button button')?.click();
  },
};
