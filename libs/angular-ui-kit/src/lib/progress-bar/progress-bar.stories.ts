import type { Meta, StoryObj } from '@storybook/angular';
import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'Feedback/Progress Bar',
  component: ProgressBarComponent,
  parameters: {
    docs: {
      description: {
        component: `
Progress bar for displaying completion status.

**Key Features:**
- Linear and circular variants
- 6 color themes
- 4 size options (xs, sm, md, lg)
- Optional percentage label
- Indeterminate mode with animation; a static striped bar or dashed ring under reduced motion (3.17)
- System colours under \`forced-colors: active\` (3.17)
- Full ARIA support

The bar is a visual aid: the text next to it carries the meaning. Write the status as text („USM wird geladen …“) and announce changes from a live region (\`role="status"\`); screen readers don't announce a progress bar's changes by themselves. Give \`ariaLabel\` the same words as the status.
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Progress 0–100',
      table: { defaultValue: { summary: '0' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'Colour of the fill',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Height of the linear bar, size of the circle',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: ['linear', 'circular'],
      description: 'Linear bar or circle',
      table: { defaultValue: { summary: 'linear' } },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the percentage (not while indeterminate)',
      table: { defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description:
        'Progress of unknown length: no value, no label. Moves a 40 % segment (linear) or spins (circle); under `prefers-reduced-motion: reduce` a full-width striped fill or a dashed ring that stays still (3.17)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {
  args: { value: 65, color: 'primary', size: 'md', showLabel: true },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-progress-bar [value]="60" size="xs" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="60" size="sm" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="60" size="md" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="60" size="lg" [showLabel]="true"></lc-progress-bar>
      </div>`,
  }),
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
        <lc-progress-bar [value]="70" color="primary" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="70" color="secondary" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="70" color="success" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="70" color="warning" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="70" color="error" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="70" color="info" [showLabel]="true"></lc-progress-bar>
      </div>`,
  }),
};

export const InlineInListRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`inline` lets the bar flow with a list row at a fixed width (`--lc-progress-bar-inline-width`); `--lc-progress-bar-height` sets the exact track height, e.g. the 6px rollup bar.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; max-width: 420px; font-size: 13px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--color-divider);">
          <span style="flex: 1;">Wave 1 — Fundament</span>
          <lc-progress-bar [value]="100" size="sm" color="success" [inline]="true" style="--lc-progress-bar-height: 6px;"></lc-progress-bar>
          <span style="color: var(--color-text-tertiary); min-width: 3ch; text-align: right;">8/8</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--color-divider);">
          <span style="flex: 1;">Wave 2 — Billing</span>
          <lc-progress-bar [value]="45" size="sm" [inline]="true" style="--lc-progress-bar-height: 6px;"></lc-progress-bar>
          <span style="color: var(--color-text-tertiary); min-width: 3ch; text-align: right;">5/11</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
          <span style="flex: 1;">Wave 3 — Rollout</span>
          <lc-progress-bar [value]="10" size="sm" [inline]="true" style="--lc-progress-bar-height: 6px;"></lc-progress-bar>
          <span style="color: var(--color-text-tertiary); min-width: 3ch; text-align: right;">1/9</span>
        </div>
      </div>`,
  }),
};

export const Indeterminate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With motion, a 40 % segment moves across the track (the circle spins). ' +
          'Under `prefers-reduced-motion: reduce` nothing moves (3.17): the fill spans the whole track in 45° stripes, so it reads as busy, not as a value; ' +
          'the circle shows a ring of 12 dashes. Under `forced-colors: active` the fill is `Highlight`, the track has a 1 px `CanvasText` outline ' +
          '(the circle\'s track is `GrayText`), and the stripes stay. Role and `aria-*` are the same in every case: no `aria-valuenow`.',
      },
    },
  },
  args: { indeterminate: true, color: 'primary', size: 'md' },
};

/** 3.17 (request 021): every size of both variants, indeterminate (static under reduced motion). */
export const IndeterminateSizes: Story = {
  name: 'Indeterminate Sizes',
  parameters: {
    docs: {
      description: {
        story:
          'Linear xs, sm, md, lg and circular xs, sm, md, lg, all `[indeterminate]="true"`. Under reduced motion (as in these screenshots) the stripes stay at sm, md and lg; at xs (2 px) they read as a dashed line. ' +
          'Under forced colours every bar keeps a visible track and a `Highlight` fill.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <lc-progress-bar [indeterminate]="true" size="xs" ariaLabel="Lädt (xs)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" size="sm" ariaLabel="Lädt (sm)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" size="md" ariaLabel="Lädt (md)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" size="lg" ariaLabel="Lädt (lg)"></lc-progress-bar>
        </div>
        <div style="display: flex; gap: 24px; align-items: center;">
          <lc-progress-bar [indeterminate]="true" variant="circular" size="xs" ariaLabel="Lädt (xs)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" variant="circular" size="sm" ariaLabel="Lädt (sm)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" variant="circular" size="md" ariaLabel="Lädt (md)"></lc-progress-bar>
          <lc-progress-bar [indeterminate]="true" variant="circular" size="lg" ariaLabel="Lädt (lg)"></lc-progress-bar>
        </div>
      </div>`,
  }),
};

export const Circular: Story = {
  args: { value: 72, variant: 'circular', color: 'primary', size: 'md', showLabel: true },
};

export const CircularSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; align-items: center;">
        <lc-progress-bar [value]="75" variant="circular" size="xs" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="75" variant="circular" size="sm" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="75" variant="circular" size="md" [showLabel]="true"></lc-progress-bar>
        <lc-progress-bar [value]="75" variant="circular" size="lg" [showLabel]="true"></lc-progress-bar>
      </div>`,
  }),
};
