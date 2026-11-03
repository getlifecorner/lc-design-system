import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { fn, expect, userEvent, within } from 'storybook/test';
import { SelectComponent } from './select.component';

/**
 * The Select component provides dropdown selection with single or multiple options.
 * Supports search, groups, validation, and Angular forms integration.
 */
const meta: Meta<SelectComponent> = {
  title: 'Form/Select',
  component: SelectComponent,
  args: {
    selectionChange: fn(),
    opened: fn(),
  },
  argTypes: {
    selectionChange: { action: 'selectionChange', description: 'Emitted with the selected value(s) when selection changes' },
    opened: { action: 'opened', description: 'Emitted when the dropdown is opened' },
    variant: {
      control: 'select',
      options: ['outline', 'filled'],
      description: 'Visual variant',
      table: { defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Select field size',
      table: { defaultValue: { summary: 'md' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Select component for dropdown option selection.

**Key Features:**
- Single and multiple selection modes
- Searchable/filterable option list
- Option groups with headers
- Loading state indicator
- Variant styles (outline, filled)
- Size presets (xs, sm, md, lg)
- Keyboard navigation support
- CDK overlay positioning
- ControlValueAccessor integration for reactive forms
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
];

export const Default: Story = {
  render: () => ({
    props: { options: countryOptions },
    template: `<lc-select placeholder="Select a country" [options]="options"></lc-select>`,
  }),
};

export const Filled: Story = {
  render: () => ({
    props: { options: countryOptions },
    template: `<lc-select variant="filled" placeholder="Select a country" [options]="options"></lc-select>`,
  }),
};

export const Searchable: Story = {
  render: () => ({
    props: { options: countryOptions },
    template: `<lc-select placeholder="Search countries..." [options]="options" [searchable]="true"></lc-select>`,
  }),
};

export const WithError: Story = {
  name: 'Error State',
  render: () => ({
    props: { options: countryOptions },
    template: `<lc-select placeholder="Select a project" [options]="options" [error]="true" errorMessage="Please select a project to continue"></lc-select>`,
  }),
};

export const WithGroups: Story = {
  name: 'Grouped Options',
  render: () => ({
    props: {
      groupedOptions: [
        { label: 'Fruits', options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'mango', label: 'Mango' },
        ]},
        { label: 'Vegetables', options: [
          { value: 'carrot', label: 'Carrot' },
          { value: 'broccoli', label: 'Broccoli' },
          { value: 'spinach', label: 'Spinach' },
        ]},
        { label: 'Grains', options: [
          { value: 'rice', label: 'Rice' },
          { value: 'quinoa', label: 'Quinoa' },
        ]},
      ],
    },
    template: `<lc-select placeholder="Select a food..." [options]="groupedOptions"></lc-select>`,
  }),
};

export const WithDisabledOptions: Story = {
  name: 'Disabled Options',
  render: () => ({
    props: {
      planOptions: [
        { value: 'free', label: 'Free' },
        { value: 'starter', label: 'Starter - $9/mo' },
        { value: 'pro', label: 'Pro - $29/mo' },
        { value: 'enterprise', label: 'Enterprise (Contact us)', disabled: true },
      ],
    },
    template: `<lc-select placeholder="Choose a plan" [options]="planOptions"></lc-select>`,
  }),
};

export const SelectInForm: Story = {
  name: 'Registration Form (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <lc-input label="Company Name" placeholder="Acme Corp" [required]="true"></lc-input>
        <lc-select
          placeholder="Select your industry"
          [options]="[
            { value: 'tech', label: 'Technology' },
            { value: 'finance', label: 'Finance' },
            { value: 'health', label: 'Healthcare' },
            { value: 'education', label: 'Education' },
            { value: 'retail', label: 'Retail' }
          ]"
        ></lc-select>
        <lc-select
          placeholder="Select company size"
          [options]="[
            { value: '1-10', label: '1\u201310 employees' },
            { value: '11-50', label: '11\u201350 employees' },
            { value: '51-200', label: '51\u2013200 employees' },
            { value: '200+', label: '200+ employees' }
          ]"
        ></lc-select>
        <lc-button variant="primary" [fullWidth]="true">Continue</lc-button>
      </div>`,
  }),
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): a select with a value shows its clear button; the story focuses it as Tab would (in the story view). It shows the kit ring: 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 7.57:1 dark on the field), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`). The field itself keeps its focus border under the pointer too (F-19).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SelectComponent, FormsModule] },
    props: { options: countryOptions },
    template: `<div style="max-width: 320px"><lc-select placeholder="Select a country" ariaLabel="Country" [options]="options" [ngModel]="'de'"></lc-select></div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    // ngModel writes the value after a tick; the clear button follows it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLElement>('.lc-select__clear')?.focus({ preventScroll: true });
  },
};

/** 3.27.1 (request 043, F-22): the clear button is 24 × 24 px in every size. */
export const TouchTargets: Story = {
  name: 'Touch Targets',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043, F-22): every size with a value, so the clear button shows. The button is 24 × 24 px: a 2 px padding that its −2 px margin takes back, so the layout, the 20 px hover fill and the focus ring are as before, and WCAG 2.5.8 (and axe `target-size`) is met by size. A 44 px target would be taller than the md field (40 px), leave the xs and sm fields by 10 and 6 px and cover 8 px of the chevron, which opens the list; at 24 px it stays 2 px clear of the chevron and inside every field.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SelectComponent, FormsModule] },
    props: { options: countryOptions, sizes: ['xs', 'sm', 'md', 'lg'] },
    template: `
      <div style="max-width: 320px; display: flex; flex-direction: column; gap: 16px;">
        @for (size of sizes; track size) {
          <lc-select [size]="size" placeholder="Select a country" [ariaLabel]="'Country (' + size + ')'" [options]="options" [ngModel]="'de'"></lc-select>
        }
      </div>
    `,
  }),
};
