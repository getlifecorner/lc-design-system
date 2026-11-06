import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { TagInputComponent } from './tag-input.component';

const meta: Meta<TagInputComponent> = {
  title: 'Form/Tag Input',
  component: TagInputComponent,
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'radio',
      options: ['enter', 'comma', 'both'],
      description: 'Key(s) used to confirm a new tag',
      table: { defaultValue: { summary: 'both' } },
    },
    maxTags: { control: 'number', description: 'Maximum number of tags allowed (unlimited by default)', table: { defaultValue: { summary: 'Infinity' } } },
    allowDuplicates: { control: 'boolean', description: 'Allow duplicate tag values', table: { defaultValue: { summary: 'false' } } },
    removable: { control: 'boolean', description: 'Show remove button on each tag', table: { defaultValue: { summary: 'true' } } },
    disabled: { control: 'boolean', description: 'Disable the entire input' },
    placeholder: { control: 'text', description: 'Placeholder text for the input field' },
    label: { control: 'text', description: 'Label shown above the input' },
  },
  parameters: {
    docs: {
      description: {
        component: `
Tag input component for entering and managing multiple tags.

**Key Features:**
- Configurable separators (Enter, comma, or both)
- Duplicate tag prevention (toggleable)
- Maximum tag limit — the input turns read-only once it is reached
- Autocomplete suggestions dropdown (listbox: ArrowUp/ArrowDown to highlight, Enter to pick, Escape to close)
- Remove tags via × button or Backspace
- ControlValueAccessor for Angular reactive forms
- Disabled state support
- Accessible keyboard navigation
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<TagInputComponent>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: 'Basic tag input with default settings. Press Enter to add tags.' } },
  },
  args: {
    placeholder: 'Add a tag…',
    label: 'Tags',
  },
};

export const WithMaxTags: Story = {
  parameters: {
    docs: { description: { story: 'The input turns read-only after reaching the maximum tag limit and says so in its placeholder.' } },
  },
  args: {
    placeholder: 'Max 3 tags…',
    maxTags: 3,
    label: 'Limited Tags',
  },
};

export const WithSuggestions: Story = {
  parameters: {
    docs: { description: { story: 'Autocomplete dropdown filtered by the current input value. Use ArrowUp/ArrowDown and Enter to pick a suggestion.' } },
  },
  args: {
    placeholder: 'Start typing…',
    suggestions: ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple', 'Teal', 'Grey'],
    label: 'Colour',
  },
};

export const AllowDuplicates: Story = {
  parameters: {
    docs: { description: { story: 'Duplicates are permitted — the same tag value can be added multiple times.' } },
  },
  args: {
    placeholder: 'Duplicates allowed…',
    allowDuplicates: true,
  },
};

export const NotRemovable: Story = {
  parameters: {
    docs: { description: { story: 'Tags cannot be removed once added.' } },
  },
  args: {
    removable: false,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: { description: { story: 'Fully disabled state — no interaction possible.' } },
  },
  args: {
    disabled: true,
    label: 'Disabled',
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the story adds the tag "Kostenstellenverantwortung" as typing and Enter would, then focuses its × as Tab would (in the story view). The remove button shows the kit ring at full opacity: 2 px `--color-primary-500`, 2 px outside (3.43:1 light, 6.34:1 dark on the chip), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`). The field keeps its focus border under the pointer too (F-19). The host sets `lang="de"` (3.35, 052-n6), so at 360 px the tag hyphenates: „Kostenstellenverant-/wortung“, a 186 × 45.2 px chip.',
      },
    },
  },
  args: {
    placeholder: 'Schlagwort hinzufügen…',
    label: 'Schlagwörter',
    removeTagAriaLabel: 'Entfernen',
  },
  render: (args) => ({
    moduleMetadata: { imports: [TagInputComponent] },
    props: args,
    template: `<lc-tag-input lang="de" [label]="label" [placeholder]="placeholder" [removeTagAriaLabel]="removeTagAriaLabel"></lc-tag-input>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    const input = canvasElement.querySelector<HTMLInputElement>('.lc-tag-input__input');
    if (!input) return;
    input.focus({ preventScroll: true });
    input.value = 'Kostenstellenverantwortung';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // Let change detection see the typed value first (as between real key presses):
    // otherwise the OnPush `[value]` reset to '' after Enter writes nothing.
    await new Promise((resolve) => setTimeout(resolve));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    input.blur();
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLElement>('.lc-tag-input__tag-remove')?.focus({ preventScroll: true });
  },
};

/** 3.27.1 (request 043, F-22, F-26): the × hit areas with six German tags. */
export const TouchTargets: Story = {
  name: 'Touch Targets (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043): six German tags, three chip rows at 360 px, one row from 1024 px. Each × (16 px) has a 24 × 24 px hit area inside its chip (5 px from its end), without paint: WCAG 2.5.8 is met by size. A 44 px area would cover the next chip row and the text input 13 px after the last ×. The chip text uses `--color-on-primary-subtle` (F-26): 7.18:1 in light on its tint (was 3.43), 6.34:1 in dark (unchanged); the × at rest 3.59:1 / 3.96:1. Since 3.33 (F-32) a tag longer than 150 px wraps instead of ending in "…": „Kostenstellenverantwortung“ is two lines („Kostenstellenverant-/wortung“, 45.2 px), so the field is 118.4 px high at 360 px; the host sets `lang="de"` for the hyphen.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [TagInputComponent, FormsModule] },
    // Not `tags`: Storybook copies every story prop that is not an input onto the
    // story component, so `tags` replaced the component's `tags` signal (review 043 r1 F1).
    props: { seedTags: ['Kostenstellenverantwortung', 'Budget', 'Freigabe', 'Reisekosten', 'Personal', 'Quartal'] },
    template: `<lc-tag-input lang="de" label="Schlagwörter" placeholder="Schlagwort hinzufügen…" removeTagAriaLabel="Entfernen" [ngModel]="seedTags"></lc-tag-input>`,
  }),
};

/** 3.33 (request 052, F-32): long tags wrap and stay readable in full. */
export const LongTags: Story = {
  name: 'Long Tags (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.33 (request 052, F-32): a tag longer than the chip\'s 150 px text width wraps over as many lines as it needs (it ended in "…" with no way to read it). „Leistungsverrechnungsschlüssel Nebenkosten 2026“ is three lines at 360 px, „Kostenstellenverantwortung“ two with a hyphen (the host sets `lang="de"`), „Q3“ stays one line. The × keeps its 24 × 24 px area inside the chip, centred on the chip\'s height; the chip text and the × keep their colours.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [TagInputComponent, FormsModule] },
    props: { seedTags: ['Leistungsverrechnungsschlüssel Nebenkosten 2026', 'Kostenstellenverantwortung', 'Q3'] },
    template: `<lc-tag-input lang="de" label="Schlagwörter" placeholder="Schlagwort hinzufügen…" removeTagAriaLabel="Entfernen" [ngModel]="seedTags"></lc-tag-input>`,
  }),
};
