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
    clearable: {
      control: 'boolean',
      description:
        'Whether a selected value shows the clear (×) button (3.39). `false` for selects that always have a value (sort, level, page size): no button is rendered, the value text gets its room and the tab order loses that stop',
      table: { defaultValue: { summary: 'true' } },
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
- 3.39: \`clearable="false"\` leaves out the clear button for selects that always have a value; xs, sm and md
  reserve the button's room only while it is shown (see *Without Clear Button*)
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
          '3.27.1 (request 043, F-22): every size with a value, so the clear button shows. The button is 24 × 24 px: a 2 px padding that its −2 px margin takes back, so the layout, the 20 px hover fill and the focus ring are as before, and WCAG 2.5.8 (and axe `target-size`) is met by size. A 44 px target would be taller than the md field (40 px), leave the xs and sm fields by 10 and 6 px and cover 8 px of the chevron, which opens the list; at 24 px it stays 2 px clear of the chevron and inside every field. 3.37 (request 057): at `lg` (a 44 px field) the button takes taps on a 44 × 44 px area; the 24 px button sits 8 px further from the chevron, so the area ends at the chevron\'s left edge, and the text ends where the area starts (see *Clear Tap Area*). xs, sm and md are unchanged.',
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

const sourceOptions = [
  { value: 'ist', label: 'SAP-Ist' },
  { value: 'ist-lang', label: 'SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000)' },
  { value: 'plan', label: 'SAP-Plan' },
  { value: 'usm', label: 'USM-Leistungsverrechnung' },
];

/** 3.37 (request 057, services row 1): the lg clear button takes taps on 44 × 44 px. */
export const ClearTapArea: Story = {
  name: 'Clear Tap Area',
  parameters: {
    docs: {
      description: {
        story:
          '3.37 (request 057, finance-intelligence services row 1, WCAG 2.5.8 and the 44 px phone rule): `size="lg"` with a value. The clear button takes taps on a 44 × 44 px area centred on its 24 px box (an unpainted `::before`, the field\'s full height). The box sits 8 px further from the chevron (right margin 6 px instead of −2 px), so the area ends exactly at the chevron\'s left edge: a tap on the chevron still opens the list. The value text ends where the area starts (76 px before the field\'s right edge), also a long German value, with an ellipsis. The box, its 20 px hover fill and its focus ring are unchanged, and axe `target-size` reads the 24 px box. xs, sm, md and a select without a value are as before.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SelectComponent, FormsModule] },
    props: { options: sourceOptions },
    template: `
      <div lang="de" style="max-width: 320px; display: flex; flex-direction: column; gap: 16px;">
        <lc-select size="lg" placeholder="Quelle wählen" ariaLabel="Quelle" clearAriaLabel="Auswahl löschen" [options]="options" [ngModel]="'ist'"></lc-select>
        <lc-select size="lg" placeholder="Quelle wählen" ariaLabel="Quelle (lang)" clearAriaLabel="Auswahl löschen" [options]="options" [ngModel]="'ist-lang'"></lc-select>
      </div>
    `,
  }),
};

/** 3.37 (request 057, services row 2): a tap on an option hands the focus back to the trigger. */
export const FocusAfterTap: Story = {
  name: 'Focus After Tap',
  parameters: {
    docs: {
      description: {
        story:
          '3.37 (request 057, finance-intelligence services row 2): options have no `tabindex`, so a tap or click on one moves the focus to `<body>` before the choice. A single select now hands the focus back to the trigger after a choice, and `Escape` does so too when the focus is on `<body>`; keyboard choice and the search field behave as before. A click on the backdrop outside closes without moving the focus, and a multi-select keeps its panel open and the focus where it is. The play test (in the story view) opens the list, clicks an option without focusing it (as a WebKit tap does), and expects the trigger to have the focus; then it reopens, moves the focus to `<body>` and presses `Escape`.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SelectComponent, FormsModule] },
    props: {
      options: [
        { value: 'name', label: 'Name' },
        { value: 'level', label: 'Stufe' },
        { value: 'cost', label: 'Kosten' },
      ],
    },
    template: `
      <div lang="de" style="max-width: 320px;">
        <lc-select size="lg" placeholder="Sortieren nach" ariaLabel="Sortieren nach" clearAriaLabel="Auswahl löschen" [options]="options" [ngModel]="'name'"></lc-select>
      </div>
    `,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    const trigger = canvasElement.querySelector<HTMLElement>('[role="combobox"]') as HTMLElement;
    const pause = () => new Promise((resolve) => setTimeout(resolve, 300));
    trigger.click();
    await pause();
    const option = document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="option"]')[1];
    (document.activeElement as HTMLElement | null)?.blur();
    option.click();
    await pause();
    await expect(document.activeElement).toBe(trigger);
    await expect(trigger.textContent?.trim()).toBe('Stufe');

    trigger.click();
    await pause();
    trigger.blur();
    await expect(document.activeElement).toBe(document.body);
    await userEvent.keyboard('{Escape}');
    await pause();
    await expect(document.querySelector('.cdk-overlay-container [role="listbox"]')).toBeNull();
    await expect(document.activeElement).toBe(trigger);
  },
};

/** 3.27.2 (request 044, F-31): the filled field's boundary in every size and state, in German. */
export const FilledStates: Story = {
  name: 'Filled States (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.2 (request 044, F-31): `variant="filled"` in every size, with an error and disabled. The filled field now draws the field boundary of the outline variant (its border was transparent at rest and `--color-border` under the pointer, 1.23:1 light, 1.29:1 dark): `--color-field-border` at rest, 4.83:1 light and 7.31:1 dark on the page, 4.39:1 / 7.02:1 on its own sunken fill; `--color-text-secondary` on hover, 6.86:1 light and at least 8.17:1 dark on the hover fill (WCAG 1.4.11). The border was already 1 px, so the heights (xs to lg 24/32/40/44) do not change. Error keeps `--color-error-600` (also under the pointer), disabled keeps its muted look, and forced colours draw the border in the system colour.',
      },
    },
  },
  render: () => ({
    props: {
      options: [
        { value: 'de', label: 'Deutschland' },
        { value: 'at', label: 'Österreich' },
        { value: 'ch', label: 'Schweiz' },
        { value: 'fr', label: 'Frankreich' },
        { value: 'it', label: 'Italien' },
        { value: 'es', label: 'Spanien' },
      ],
      sizes: ['xs', 'sm', 'md', 'lg'],
    },
    template: `
      <div style="max-width: 320px; display: flex; flex-direction: column; gap: 16px;">
        @for (size of sizes; track size) {
          <lc-select variant="filled" [size]="size" placeholder="Land wählen" [ariaLabel]="'Land (' + size + ')'" [options]="options"></lc-select>
        }
        <lc-select variant="filled" placeholder="Land wählen" ariaLabel="Land (Fehler)" [options]="options" [error]="true" errorMessage="Bitte ein Land wählen"></lc-select>
        <lc-select variant="filled" placeholder="Land wählen" ariaLabel="Land (deaktiviert)" [options]="options" [disabled]="true"></lc-select>
      </div>
    `,
  }),
};

/** 3.31 (request 050, 049-f1): the dropdown takes the host's language. */
export const PanelLanguage: Story = {
  name: 'Panel Language',
  parameters: {
    docs: {
      description: {
        story:
          '3.31 (request 050, follow-up 049-f1, WCAG 3.1.2): the dropdown opens in an overlay under `<body>`, outside the field\'s `lang`, so it takes the `lang` of the field\'s closest `[lang]` at every opening: the German field inside `<div lang="de">` opens a panel with `lang="de"`, so screen readers read „Österreich“, the search field and „Keine Treffer“ as German. The English field opens with the page\'s `lang`. Without any `lang` above the field, the panel gets none. The story opens the German field (in the story view).',
      },
    },
  },
  render: () => ({
    props: {
      options: countryOptions,
      germanOptions: [
        { value: 'de', label: 'Deutschland' },
        { value: 'at', label: 'Österreich' },
        { value: 'ch', label: 'Schweiz' },
        { value: 'fr', label: 'Frankreich' },
        { value: 'it', label: 'Italien' },
        { value: 'es', label: 'Spanien' },
      ],
    },
    template: `
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <lc-select placeholder="Select a country" ariaLabel="Country" [options]="options"></lc-select>
        <div lang="de">
          <lc-select
            placeholder="Land wählen"
            ariaLabel="Land"
            searchPlaceholder="Land suchen …"
            searchAriaLabel="Land suchen"
            noOptionsLabel="Keine Treffer"
            clearAriaLabel="Auswahl löschen"
            [searchable]="true"
            [options]="germanOptions"
          ></lc-select>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLElement>('[lang="de"] lc-select [role="combobox"]')?.click();
  },
};

/** 3.39 (request 059, finance-intelligence services-prove row 1): selects that always have a value. */
export const WithoutClearButton: Story = {
  name: 'Without Clear Button',
  args: { clearable: false },
  parameters: {
    controls: { include: ['clearable'] },
    docs: {
      description: {
        story:
          '3.39 (request 059, finance-intelligence services-prove row 1): `clearable` (default `true`). In each pair the first select keeps the default, the second takes the control (`false`): no clear button is rendered, so the value text runs to the chevron and the tab order loses that stop. In the 280 px `lg` field „Mit enthaltenen Services“ is whole instead of „Mit enthaltenen Se…“; in the 192 px `sm` field „Sortierung: Kosten“ no longer runs under the ×. The last three (xs, sm, md, 320 px, default) show the 057-n1 fix: with the × shown the text ends 4 px before it, with an ellipsis; without a value the field keeps its 3.36 padding. Escape and the name are unchanged.',
      },
    },
  },
  render: (args) => ({
    moduleMetadata: { imports: [SelectComponent, FormsModule] },
    props: {
      clearable: args.clearable,
      levels: [
        { value: 'own', label: 'Nur eigene Kosten' },
        { value: 'services', label: 'Mit enthaltenen Services' },
      ],
      sorts: [
        { value: 'cost', label: 'Sortierung: Kosten' },
        { value: 'name', label: 'Sortierung: Name' },
      ],
      centres: [
        { value: '4711', label: 'Kostenstelle 4711 Rechenzentrum' },
        { value: '4712', label: 'Kostenstelle 4712 Arbeitsplatz' },
      ],
      sizes: ['xs', 'sm', 'md'],
    },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="max-width: 280px; display: flex; flex-direction: column; gap: 8px;">
          <lc-select size="lg" ariaLabel="Ebene" clearAriaLabel="Auswahl löschen" [options]="levels" [ngModel]="'services'"></lc-select>
          <lc-select size="lg" ariaLabel="Ebene" clearAriaLabel="Auswahl löschen" [clearable]="clearable" [options]="levels" [ngModel]="'services'"></lc-select>
        </div>
        <div style="max-width: 192px; display: flex; flex-direction: column; gap: 8px;">
          <lc-select size="sm" ariaLabel="Sortierung" clearAriaLabel="Auswahl löschen" [options]="sorts" [ngModel]="'cost'"></lc-select>
          <lc-select size="sm" ariaLabel="Sortierung" clearAriaLabel="Auswahl löschen" [clearable]="clearable" [options]="sorts" [ngModel]="'cost'"></lc-select>
        </div>
        <div style="max-width: 320px; display: flex; flex-direction: column; gap: 8px;">
          @for (size of sizes; track size) {
            <lc-select [size]="size" [ariaLabel]="'Kostenstelle (' + size + ')'" clearAriaLabel="Auswahl löschen" [options]="centres" [ngModel]="'4711'"></lc-select>
          }
        </div>
      </div>
    `,
  }),
};
