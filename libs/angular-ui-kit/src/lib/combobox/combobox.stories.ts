import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { ComboboxComponent, ComboboxOption } from './combobox.component';

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
