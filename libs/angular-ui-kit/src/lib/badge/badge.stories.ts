import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Data Display/Badge',
  component: BadgeComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Badge component displays short status labels, counts, or tags.
Use it for statuses, categories, notifications, and metadata.

**Key Features:**
- 6 semantic variants
- 4 sizes (xs, sm, md, lg)
- Rounded pill mode
- Optional wrapping for long, sentence-like labels (\`wrap\`, 3.11)
- Content projection for custom content

**Contrast:** the ink of every variant reaches 4.5:1 on its own fill in both palettes, on the
page and on a card (\`badge-contrast.spec.ts\`). The tinted variants take their ink from
\`--color-on-*-subtle\`; since 3.3 the light warning and the dark success inks are darker /
lighter so they pass (HS-5). Apps can still restyle a badge through \`--lc-badge-bg\`,
\`--lc-badge-fg\` and \`--lc-badge-border\`.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
      description: 'Color variant',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Badge size',
      table: { defaultValue: { summary: 'md' } },
    },
    rounded: { control: 'boolean', description: 'Pill-shaped badge' },
    dot: { control: 'boolean', description: 'Show a leading status dot in the variant color' },
    wrap: {
      control: 'boolean',
      description: 'Wrap a long label onto centred lines (min-height instead of height; with rounded, a fixed radius)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {
  args: { variant: 'default', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [size]="size">Draft</lc-badge>`,
  }),
};

export const Primary: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [size]="size">New</lc-badge>`,
  }),
};

export const Success: Story = {
  args: { variant: 'success', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [size]="size">Active</lc-badge>`,
  }),
};

export const Warning: Story = {
  args: { variant: 'warning', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [size]="size">Pending</lc-badge>`,
  }),
};

export const ErrorBadge: Story = {
  name: 'Error',
  args: { variant: 'error', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [size]="size">Failed</lc-badge>`,
  }),
};

export const Pill: Story = {
  parameters: {
    docs: { description: { story: 'Rounded pill badges work well for counts and notification indicators.' } },
  },
  args: { variant: 'primary', rounded: true },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [rounded]="rounded">12</lc-badge>`,
  }),
};

export const WithDot: Story = {
  name: 'With status dot',
  parameters: {
    docs: { description: { story: 'Set `[dot]` to prefix the label with a small dot filled in the variant color — a scannable "● label" status pattern.' } },
  },
  args: { variant: 'success', rounded: true, dot: true },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [rounded]="rounded" [dot]="dot">Ready</lc-badge>`,
  }),
};

export const StatusDots: Story = {
  name: 'Status dots (all variants)',
  parameters: {
    docs: { description: { story: 'The dot inherits each variant’s text color, so it stays consistent across the whole scale.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <lc-badge variant="default" [rounded]="true" [dot]="true">Idle</lc-badge>
        <lc-badge variant="primary" [rounded]="true" [dot]="true">Assigned</lc-badge>
        <lc-badge variant="info" [rounded]="true" [dot]="true">In progress</lc-badge>
        <lc-badge variant="warning" [rounded]="true" [dot]="true">Needs review</lc-badge>
        <lc-badge variant="success" [rounded]="true" [dot]="true">Complete</lc-badge>
        <lc-badge variant="error" [rounded]="true" [dot]="true">Blocked</lc-badge>
      </div>`,
  }),
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: 'All badge variants at a glance. Use semantic colors for consistent meaning.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #555;">Status Badges</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <lc-badge variant="default">Draft</lc-badge>
            <lc-badge variant="primary">In Review</lc-badge>
            <lc-badge variant="info">In Progress</lc-badge>
            <lc-badge variant="warning">Pending</lc-badge>
            <lc-badge variant="success">Published</lc-badge>
            <lc-badge variant="error">Rejected</lc-badge>
          </div>
        </div>
        <div>
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #555;">Pill Badges (counts)</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <lc-badge variant="primary" [rounded]="true">3</lc-badge>
            <lc-badge variant="error" [rounded]="true">99+</lc-badge>
            <lc-badge variant="success" [rounded]="true">✓</lc-badge>
          </div>
        </div>
        <div>
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #555;">Sizes</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <lc-badge variant="primary" size="xs">XS</lc-badge>
            <lc-badge variant="primary" size="sm">Small</lc-badge>
            <lc-badge variant="primary" size="md">Medium</lc-badge>
            <lc-badge variant="primary" size="lg">Large</lc-badge>
          </div>
        </div>
      </div>`,
  }),
};

export const InContext: Story = {
  parameters: {
    docs: { description: { story: 'Badges used in navigation items and list contexts.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 280px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
          <span style="font-size: 14px;">Inbox</span>
          <lc-badge variant="primary" [rounded]="true">24</lc-badge>
        </div>
        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
          <span style="font-size: 14px;">Tasks</span>
          <lc-badge variant="warning" [rounded]="true">5</lc-badge>
        </div>
        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
          <span style="font-size: 14px;">Notifications</span>
          <lc-badge variant="error" [rounded]="true">3</lc-badge>
        </div>
        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px;">Archive</span>
          <lc-badge variant="default">128</lc-badge>
        </div>
      </div>`,
  }),
};

/**
 * 3.11 (SI-15): `wrap` lets a sentence-like label wrap onto centred lines. At
 * 100 % text in 12rem (192 px) boxes: the badge driven by the controls, then
 * the SI-15 label at every size, wrapped and rounded.
 */
export const Wrap: Story = {
  name: 'Wrap (long label)',
  parameters: {
    docs: {
      description: {
        story:
          '3.11 (SI-15): `[wrap]="true"` lets a long label wrap onto centred lines instead of running out of its container. The fixed height becomes a minimum height, lines are 1.25 high, and the badge is never wider than its container. With `rounded`, the corners keep the one-line pill radius (half the one-line height), so a second line is not clipped by half-circle ends. A label that fits looks exactly like a badge without `wrap`. Each box is 12rem wide; the md badge in German is two lines, 45.5 px high. Use it for status sentences, not for counts.',
      },
    },
  },
  args: { variant: 'info', size: 'md', rounded: true, dot: false, wrap: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;">
        <div lang="en" style="width: 12rem;">
          <lc-badge [variant]="variant" [size]="size" [rounded]="rounded" [dot]="dot" [wrap]="wrap">Closed beta, invitation only</lc-badge>
        </div>
        <div lang="de" style="width: 12rem;">
          <lc-badge variant="info" size="xs" [rounded]="true" [wrap]="true">Geschlossene Beta, nur mit Einladung</lc-badge>
        </div>
        <div lang="de" style="width: 12rem;">
          <lc-badge variant="info" size="sm" [rounded]="true" [wrap]="true">Geschlossene Beta, nur mit Einladung</lc-badge>
        </div>
        <div lang="de" style="width: 12rem;">
          <lc-badge variant="info" size="md" [rounded]="true" [wrap]="true">Geschlossene Beta, nur mit Einladung</lc-badge>
        </div>
        <div lang="de" style="width: 12rem;">
          <lc-badge variant="info" size="lg" [rounded]="true" [wrap]="true">Geschlossene Beta, nur mit Einladung</lc-badge>
        </div>
      </div>`,
  }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<BadgeComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/** One language block of the large-text story: a centred column like the sign-in title of life-os. */
const wrapColumn = (lang = 'en', label = '', short = '', dotLabel = '') => `
  <div lang="${lang}" style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2, 0.5rem); text-align: center;">
    <lc-badge variant="info" size="md" [rounded]="true" [wrap]="true">${label}</lc-badge>
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
      <lc-badge variant="info" size="md" [rounded]="true">${short}</lc-badge>
      <lc-badge variant="info" size="md" [rounded]="true" [wrap]="true">${short}</lc-badge>
    </div>
    <lc-badge variant="warning" size="md" [dot]="true" [wrap]="true">${dotLabel}</lc-badge>
  </div>`;

/**
 * SI-15 on a phone at 200 % text: the closed-beta badge of the life-os sign-in
 * page wraps inside a 288 px column at 320 px. The root text size is raised in
 * the canvas only (`#storybook-root`), so the docs page keeps 100 %.
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
          '3.11 (SI-15): a centred column like the life-os sign-in title, with the root text at 200 %. "Geschlossene Beta, nur mit Einladung" wraps onto two or three centred lines and stays inside the 288 px column at 320 px; with `rounded` its radius is 28 px, not a half circle. "Beta" with and without `wrap` side by side look the same. The dot badge keeps its dot on the first line. German, then English. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" style="background: var(--color-background); padding: 16px 16px; display: flex; flex-direction: column; gap: 32px;">
        ${wrapColumn('de', 'Geschlossene Beta, nur mit Einladung', 'Beta', 'Wartet auf die Freigabe durch den Haushalt')}
        ${wrapColumn('en', 'Closed beta, invitation only', 'Beta', 'Waiting for the household to approve')}
      </div>
      <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`,
  }),
};
