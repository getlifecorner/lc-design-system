import type { Meta, StoryObj } from '@storybook/angular';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';
import { ChipComponent } from './chip.component';

/**
 * Chips are compact elements representing tags, filters, selections, or status labels.
 * They can be static labels or interactive (removable). Use them in filter bars,
 * tag inputs, and status indicators.
 */
const meta: Meta<ChipComponent> = {
  title: 'Data Display/Chip',
  component: ChipComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info', 'emphasis', 'quiet'],
      description:
        "Color variant that communicates the chip's semantic meaning. 3.40: `emphasis` (solid primary fill, white ink; in `lc-hero` the band's dark stop) and `quiet` (transparent fill, thin border, secondary ink; in `lc-hero` the band's ink). In `lc-hero` the other variants take the light palette with opaque fills, in both themes",
      table: { defaultValue: { summary: "'default'" } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls chip height and text size',
      table: { defaultValue: { summary: "'md'" } },
    },
    icon: { description: 'Icon name displayed before the label (from lc-icon set)', table: { defaultValue: { summary: 'undefined' } } },
    removable: { description: 'Shows a close button to allow the user to dismiss the chip', table: { defaultValue: { summary: 'false' } } },
    clickable: { description: 'Renders the chip as a button that emits chipClick on activation', table: { defaultValue: { summary: 'false' } } },
    disabled: { description: 'Visually dims the chip and prevents interaction', table: { defaultValue: { summary: 'false' } } },
    wrap: {
      control: 'boolean',
      description:
        '3.40: a long label wraps onto centred lines instead of running out of its container (WCAG 1.4.10). The fixed height becomes a minimum height; the icon and the remove button stay on the first line. A label that fits looks as without `wrap`',
      table: { defaultValue: { summary: 'false' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Chip component for displaying tags, filters, or selections.

**Key Features:**
- Color variants (primary, secondary, success, warning, error, info, neutral)
- Multiple size options (sm, md, lg)
- Optional leading icon
- Removable with close button and remove event
- Disabled state support
- 3.40: \`wrap\` for long labels; \`emphasis\` and \`quiet\` variants; an on-band palette in \`lc-hero\`; the hooks \`--lc-chip-bg\`, \`--lc-chip-fg\`, \`--lc-chip-border\` and \`--lc-chip-gap\` win from the chip or any ancestor
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ChipComponent>;

export const Default: Story = {
  args: { variant: 'default', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-chip [variant]="variant" [size]="size">Design System</lc-chip>`,
  }),
};

export const WithIcon: Story = {
  args: { variant: 'primary', icon: 'tag', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-chip [variant]="variant" [icon]="icon" [size]="size">Frontend</lc-chip>`,
  }),
};

export const Removable: Story = {
  args: { variant: 'info', removable: true, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-chip [variant]="variant" [removable]="removable" [size]="size">filter: active</lc-chip>`,
  }),
};

export const Clickable: Story = {
  args: { variant: 'default', clickable: true, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-chip [variant]="variant" [clickable]="clickable" [size]="size">Related item</lc-chip>`,
  }),
};

export const ClickableRemovable: Story = {
  name: 'Clickable + Removable',
  parameters: {
    docs: { description: { story: 'Two sibling buttons inside the pill — activate (chipClick) and remove — so no control is nested in another and both are reachable with Tab.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <lc-chip variant="primary" [clickable]="true" [removable]="true">Item A</lc-chip>
        <lc-chip variant="default" [clickable]="true" [removable]="true">Item B</lc-chip>
        <lc-chip variant="default" [clickable]="true" [disabled]="true">Item C (disabled)</lc-chip>
      </div>`,
  }),
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-chip [variant]="variant" [disabled]="disabled" [size]="size">Archived</lc-chip>`,
  }),
};

export const AllVariants: Story = {
  name: 'All Color Variants',
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <lc-chip variant="default">Default</lc-chip>
        <lc-chip variant="primary">Primary</lc-chip>
        <lc-chip variant="success">Success</lc-chip>
        <lc-chip variant="warning">Warning</lc-chip>
        <lc-chip variant="error">Error</lc-chip>
        <lc-chip variant="info">Info</lc-chip>
      </div>`,
  }),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <lc-chip variant="primary" size="sm">Small</lc-chip>
        <lc-chip variant="primary" size="md">Medium</lc-chip>
        <lc-chip variant="primary" size="lg">Large</lc-chip>
      </div>`,
  }),
};

export const StatusLabels: Story = {
  name: 'Status Labels (Use Case)',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
          <span>Deploy to staging</span>
          <lc-chip variant="success" size="sm">Completed</lc-chip>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
          <span>Code review</span>
          <lc-chip variant="warning" size="sm">In Progress</lc-chip>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
          <span>Database migration</span>
          <lc-chip variant="error" size="sm">Failed</lc-chip>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
          <span>Unit tests</span>
          <lc-chip variant="info" size="sm">Pending</lc-chip>
        </div>
      </div>`,
  }),
};

export const FilterBar: Story = {
  name: 'Active Filters (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 500px;">
        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Active filters:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <lc-chip variant="primary" icon="user" [removable]="true">Assigned to me</lc-chip>
          <lc-chip variant="default" [removable]="true">Priority: High</lc-chip>
          <lc-chip variant="success" [removable]="true">Status: Open</lc-chip>
          <lc-chip variant="info" icon="calendar" [removable]="true">Due this week</lc-chip>
        </div>
      </div>`,
  }),
};

export const TagInput: Story = {
  name: 'Tag Input (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 400px;">
        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px;">Tags</label>
        <div style="border: 1px solid #ddd; border-radius: 6px; padding: 8px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <lc-chip variant="default" size="sm" [removable]="true">Angular</lc-chip>
          <lc-chip variant="default" size="sm" [removable]="true">TypeScript</lc-chip>
          <lc-chip variant="default" size="sm" [removable]="true">Storybook</lc-chip>
          <span style="font-size: 13px; color: #999; padding: 2px 4px;">Add tag...</span>
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">Press Enter to add a tag</div>
      </div>`,
  }),
};

/** One 10rem (160 px) column of wrapping chips in one size and language. */
const wrapColumn = (lang: string, size: string, long: string, short: string, remove: string) => `
  <div lang="${lang}" style="width: 10rem; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
    <div style="font: 11px monospace; color: var(--color-text-tertiary);">${size} · ${lang}</div>
    <lc-chip variant="info" size="${size}" icon="heart" [wrap]="true">${long}</lc-chip>
    <lc-chip variant="info" size="${size}" [removable]="true" removeAriaLabel="${remove}" [wrap]="true">${long}</lc-chip>
    <lc-chip variant="info" size="${size}" icon="heart" [clickable]="true" [wrap]="true">${long}</lc-chip>
    <lc-chip variant="info" size="${size}" icon="heart" [clickable]="true" [removable]="true" removeAriaLabel="${remove}" [wrap]="true">${long}</lc-chip>
    <lc-chip variant="info" size="${size}" icon="heart" [wrap]="true">${short}</lc-chip>
  </div>`;

/**
 * 3.40 (request 060, life-os G-HV3, AC-11): `wrap` in 160 px columns, the
 * chip driven by the controls first, then every size and shell in English
 * and German.
 */
export const Wrap: Story = {
  name: 'Wrap (long label)',
  parameters: {
    docs: {
      description: {
        story:
          '3.40 (G-HV3): `[wrap]="true"` (or the bare attribute `wrap`) lets a long label wrap onto centred lines instead of running out of its container, as `lc-badge` `wrap`. The fixed height becomes a minimum height (24 / 32 / 40 px), lines are 1.25 high, and the chip is never wider than its container; long German compounds hyphenate. The icon and the × stay on the first line, the pill radius stays the one-line radius. A label that fits (the last chip of each column) looks exactly as without `wrap`. Each column is 10rem (160 px): static with icon, removable, clickable, clickable + removable.',
      },
    },
  },
  args: { variant: 'primary', size: 'md', icon: 'heart', wrap: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div lang="en" style="width: 10rem;">
          <lc-chip [variant]="variant" [size]="size" [icon]="icon" [wrap]="wrap">Health, fitness, nutrition</lc-chip>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 24px 32px; align-items: flex-start;">
          ${['sm', 'md', 'lg'].map((size) => wrapColumn('en', size, 'Health, fitness, nutrition', 'Accounts', 'Remove')).join('')}
          ${['sm', 'md', 'lg'].map((size) => wrapColumn('de', size, 'Gesundheit, Fitness, Ernährung', 'Konten', 'Entfernen')).join('')}
        </div>
      </div>`,
  }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<ChipComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/** The life areas of the website-home-vision concept, one language. */
const AREAS = {
  de: ['Verträge und Versicherungen', 'Haushaltsbudget', 'Kalender und Erinnerungen', 'Ziele und große Pläne', 'Gesundheit, Fitness, Ernährung', 'Wichtige Menschen'],
  en: ['Contracts and insurance', 'Household budget', 'Calendar and reminders', 'Goals and big plans', 'Health, fitness, nutrition', 'People who matter'],
};

const largeTextColumn = (lang: 'de' | 'en', remove: string) => `
  <div lang="${lang}" style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 100%;">
      ${AREAS[lang].map((label) => `<lc-chip variant="primary" size="sm" icon="heart" [wrap]="true">${label}</lc-chip>`).join('')}
    </div>
    <lc-chip variant="info" size="md" [removable]="true" removeAriaLabel="${remove}" [wrap]="true">${AREAS[lang][0]}</lc-chip>
    <lc-chip variant="default" size="lg" icon="heart" [clickable]="true" [wrap]="true">${AREAS[lang][4]}</lc-chip>
  </div>`;

/**
 * G-HV3 on a phone at 200 % text: the area chips of the website-home-vision
 * concept wrap inside a 288 px column at 320 px. The root text size is raised
 * in the canvas only (`#storybook-root`), so the docs page keeps 100 %.
 */
export const WrapLargeText: LargeTextStory = {
  name: 'Wrap at 200 % Text (phone)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '3.40 (G-HV3): the life-area chips of the website (sm, with icon, `wrap`) and an md removable and lg clickable chip, with the root text at 200 % in a centred column, German then English. No chip runs out of the 288 px column at 320 px (WCAG 1.4.10); "Verträge und Versicherungen" wraps onto centred lines with the icon on the first. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" style="background: var(--color-background); padding: 16px 16px; display: flex; flex-direction: column; gap: 32px;">
        ${largeTextColumn('de', 'Entfernen')}
        ${largeTextColumn('en', 'Remove')}
      </div>
      <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`,
  }),
};

/** One row of a variant: static, clickable, removable, disabled. */
const variantRow = (variant: string, label: string) => `
  <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
    <span style="width: 5rem; font: 12px monospace; color: var(--color-text-secondary);">${variant}</span>
    <lc-chip variant="${variant}" icon="heart">${label}</lc-chip>
    <lc-chip variant="${variant}" icon="heart" [clickable]="true">${label}</lc-chip>
    <lc-chip variant="${variant}" [removable]="true">${label}</lc-chip>
    <lc-chip variant="${variant}" [clickable]="true" [removable]="true">${label}</lc-chip>
    <lc-chip variant="${variant}" [clickable]="true" [disabled]="true">${label}</lc-chip>
  </div>`;

/**
 * 3.40 (request 060, life-os G-HV4, design D-4): the two new variants off the
 * band, in every state.
 */
export const EmphasisAndQuiet: Story = {
  name: 'Emphasis and Quiet',
  parameters: {
    docs: {
      description: {
        story:
          '3.40 (G-HV4): `variant="emphasis"` is a solid primary fill with white ink (6.21:1 in both themes) for the areas that come next; `variant="quiet"` is transparent with a thin border and secondary ink (7.56:1 light, 12.17:1 dark) for the ones further away. A clickable or removable quiet chip draws its boundary in the field border (4.83:1 / 7.31:1, WCAG 1.4.11) and fills on hover. Rows: static with icon, clickable, removable, clickable + removable, disabled.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${variantRow('emphasis', 'Household budget')}
        ${variantRow('quiet', 'Shopping')}
        ${variantRow('default', 'Accounts')}
      </div>`,
  }),
};

/** The chips of one band: emphasis, default, primary, success, quiet, quiet clickable. */
const bandChips = `
  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
    <lc-chip variant="emphasis" size="sm" icon="heart">Emphasis</lc-chip>
    <lc-chip variant="default" size="sm">Default</lc-chip>
    <lc-chip variant="primary" size="sm">Primary</lc-chip>
    <lc-chip variant="success" size="sm">Success</lc-chip>
    <lc-chip variant="quiet" size="sm">Quiet</lc-chip>
    <lc-chip variant="quiet" size="sm" [clickable]="true">Quiet clickable</lc-chip>
  </div>`;

const BANDS = ['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet'];

const bandHeroes = (variant: string) =>
  BANDS.map(
    (color) => `<lc-hero color="${color}" variant="${variant}" size="sm" title="${color}" [headingLevel]="2">${bandChips}</lc-hero>`,
  ).join('');

/**
 * 3.40 (request 060, life-os G-HV4, AC-13, AC-14): chips on all nine hero
 * bands. The palette follows the band; it is the same in both themes.
 */
export const OnHeroBands: Story = {
  name: 'On Hero Bands',
  parameters: {
    docs: {
      description: {
        story:
          "3.40 (G-HV4): in `lc-hero` a chip takes an on-band palette, the same in the light and the dark theme. `emphasis` fills with the band's dark stop and white ink (8.10:1 on success to 17.74:1 on neutral); `default` and the status variants take the light palette with opaque fills (4.85:1 to 10.98:1); `quiet` is transparent with white ink (4.58:1 or more on both ends of every band) and a 32 % white border, a clickable one a full white border and a glass fill on hover. The focus ring is the hero's two-tone ring. No hook or class is needed.",
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [HeroComponent] },
    template: `<div style="display: flex; flex-direction: column; gap: 12px;">${bandHeroes('default')}</div>`,
  }),
};

/** 3.40 (G-HV4): on the pastel bands of `variant="light"` the band's ink is neutral 800. */
export const OnLightHero: Story = {
  name: 'On Light Hero',
  parameters: {
    docs: {
      description: {
        story:
          '3.40 (G-HV4): on a light hero (`variant="light"`) the ink is neutral 800: `quiet` reads 10.57:1 or more on every pastel band, its border is neutral 800 at 32 % (clickable: 100 %). `emphasis` keeps the dark stop of the band with white ink; the other variants keep the light palette.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [HeroComponent] },
    template: `<div style="display: flex; flex-direction: column; gap: 12px;">${bandHeroes('light')}</div>`,
  }),
};

/**
 * 3.40 (request 060, AC-15): the hooks set on an ancestor win over the variant
 * and over the on-band palette, as the life-os concept sets them on a group.
 */
export const HooksOnAnAncestor: Story = {
  name: 'Hooks on an Ancestor',
  parameters: {
    docs: {
      description: {
        story:
          '3.40 (AC-15): `--lc-chip-bg`, `--lc-chip-fg`, `--lc-chip-border` and `--lc-chip-gap` set on a wrapper reach every chip inside, and they win over the variant colours, also over the on-band palette in `lc-hero` (the variants now keep their colours in private properties and only read the hooks). Here the wrapper sets the info pair and its border; each row holds an emphasis, a default and a quiet chip. Before 3.40 a chip declared the hooks itself, so only a value on the chip took effect.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [HeroComponent] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="--lc-chip-bg: var(--color-info-subtle); --lc-chip-fg: var(--color-on-info-subtle); --lc-chip-border: var(--color-info-default); --lc-chip-gap: 0.5rem; display: flex; flex-wrap: wrap; gap: 8px;">
          <lc-chip variant="emphasis" icon="heart">Emphasis</lc-chip>
          <lc-chip variant="default" icon="heart">Default</lc-chip>
          <lc-chip variant="quiet" icon="heart" [clickable]="true">Quiet</lc-chip>
        </div>
        <lc-hero size="sm" title="Hooks in a hero" [headingLevel]="2">
          <div style="--lc-chip-bg: var(--color-info-subtle); --lc-chip-fg: var(--color-on-info-subtle); --lc-chip-border: var(--color-info-default); --lc-chip-gap: 0.5rem; display: flex; flex-wrap: wrap; gap: 8px;">
            <lc-chip variant="emphasis" icon="heart">Emphasis</lc-chip>
            <lc-chip variant="default" icon="heart">Default</lc-chip>
            <lc-chip variant="quiet" icon="heart" [clickable]="true">Quiet</lc-chip>
          </div>
        </lc-hero>
      </div>`,
  }),
};
