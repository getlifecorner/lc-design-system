import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Feedback/Spinner',
  component: SpinnerComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Spinner component indicates loading or processing states.
Use it for async operations, page loads, and data fetching.

**Key Features:**
- 4 sizes (sm, md, lg, and since 3.42 the inline \`xs\` for rows, tabs and button-sized slots)
- Optional message text
- Accessible with ARIA attributes
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description:
        'Spinner size. `xs` (3.42, usm-x row 5): 16 px, inline (`inline-flex`, `vertical-align: middle`), no padding, the message beside it; for a 44 px row, a tab or a button-sized slot',
      table: { defaultValue: { summary: 'md' } },
    },
    message: { control: 'text', description: 'Loading message displayed below the spinner' },
  },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  args: { size: 'md' },
};

export const WithMessage: Story = {
  args: { size: 'md', message: 'Loading your dashboard...' },
};

export const Sizes: Story = {
  parameters: {
    docs: { description: { story: 'Use `sm` inline with text, `md` for sections, and `lg` for full-page loading.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 32px;">
        <div style="text-align: center;">
          <lc-spinner size="sm"></lc-spinner>
          <p style="margin: 8px 0 0; font-size: 12px; color: var(--color-text-secondary);">Small</p>
        </div>
        <div style="text-align: center;">
          <lc-spinner size="md"></lc-spinner>
          <p style="margin: 8px 0 0; font-size: 12px; color: var(--color-text-secondary);">Medium</p>
        </div>
        <div style="text-align: center;">
          <lc-spinner size="lg"></lc-spinner>
          <p style="margin: 8px 0 0; font-size: 12px; color: var(--color-text-secondary);">Large</p>
        </div>
      </div>`,
  }),
};

export const InCard: Story = {
  parameters: {
    docs: { description: { story: 'Spinner used as a placeholder while content loads.' } },
  },
  render: () => ({
    template: `
      <lc-card variant="outlined" padding="lg">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
          <lc-spinner size="lg" message="Loading analytics data..."></lc-spinner>
        </div>
      </lc-card>`,
  }),
};

/** 3.42 (usm-x row 5): the inline `xs` spinner. */
export const InlineXs: Story = {
  name: 'Inline (xs, DE)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.42 (usm-x row 5): `size="xs"` is a 16 px spinner with no padding that sits inline (`inline-flex`, `vertical-align: middle`): at the end of a text line (the 14/21 px line keeps its height), at the end of a 44 px list row (the host is a 16 × 16 flex item, no line-box strut), centred in a 40 px slot, and beside a tab label. It keeps `role="status"` with its `loadingLabel` („Wird geladen“); reduced motion stops it as a static arc, forced colours draw the arc in `CanvasText` on a `GrayText` track (every size).',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 480px; font-size: 14px; line-height: 21px; color: var(--color-text-primary);">
        <div>Synchronisiere Konten <lc-spinner size="xs" loadingLabel="Wird geladen"></lc-spinner></div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px;">
          <span>Belege werden geladen …</span>
          <lc-spinner size="xs" loadingLabel="Wird geladen"></lc-spinner>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 1px solid var(--color-border); border-radius: 8px;">
          <lc-spinner size="xs" loadingLabel="Wird geladen"></lc-spinner>
        </div>
        <div style="display: flex; border-bottom: 1px solid var(--color-border);">
          <span style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 4px; border-bottom: 2px solid var(--color-primary-600); margin-bottom: -1px; font-weight: 600;">
            Buchungen <lc-spinner size="xs" loadingLabel="Wird geladen"></lc-spinner>
          </span>
        </div>
      </div>`,
  }),
};

export const InlineWithButton: Story = {
  parameters: {
    docs: { description: { story: 'Small spinner used inline next to form elements during submission.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <lc-button variant="primary" [disabled]="true">Submitting...</lc-button>
        <lc-spinner size="sm"></lc-spinner>
        <span style="font-size: 14px; color: var(--color-text-secondary);">Please wait</span>
      </div>`,
  }),
};
