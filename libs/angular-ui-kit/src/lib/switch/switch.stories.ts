import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn, expect, userEvent, within } from 'storybook/test';
import { SwitchComponent } from './switch.component';

/**
 * Switches toggle a single setting on or off. They provide immediate feedback
 * and are ideal for preferences, feature flags, and settings panels.
 * Supports multiple color variants, sizes, loading state, and label positioning.
 */
const meta: Meta<SwitchComponent> = {
  title: 'Form/Switch',
  component: SwitchComponent,
  args: {
    checkedChange: fn(),
  },
  argTypes: {
    checkedChange: { action: 'checkedChange', description: 'Emitted when the switch is toggled (new value)' },
    label: { description: 'Text label displayed beside the switch' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger'],
      description: 'Color variant when the switch is checked',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the dimensions of the switch track and thumb',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Whether the label appears before or after the switch',
    },
    checked: { description: 'Whether the switch is currently on' },
    disabled: { description: 'Prevents interaction' },
    loading: { description: 'Shows a loading indicator (e.g. while saving)' },
    required: { description: 'Marks the field as required in forms' },
    helpText: {
      control: 'text',
      description:
        'Description below the label, linked to the switch by `aria-describedby` (read after name and state). Wraps; 14 px secondary text; a tap on it toggles too. Empty renders no element.',
      table: { defaultValue: { summary: "''" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Switch component for boolean toggle functionality.

**Key Features:**
- Color variants (primary, secondary, success, warning, danger)
- Size options (sm, md, lg)
- Loading state with spinner
- Configurable label positioning (left/right)
- Help text below the label (\`helpText\`), linked by \`aria-describedby\`
- Rows with a label or help text are at least 44 px high. The CSS hook
  \`--lc-switch-min-height\` (default \`var(--size-min-touch-height)\`, 44 px) is read
  where it is used, so an ancestor can set it; \`0\` restores the 3.15 rows (21/24/28 px).
- Keyboard toggle support
- Disabled and required states
- ControlValueAccessor integration for reactive forms
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
  args: { label: 'Enable notifications', variant: 'primary', size: 'md', checked: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await userEvent.click(switchEl);
    await expect(args['checkedChange']).toHaveBeenCalled();
  },
};

export const Checked: Story = {
  args: { label: 'Dark mode', variant: 'primary', size: 'md', checked: true },
};

export const Loading: Story = {
  name: 'Loading (Saving)',
  args: { label: 'Auto-sync enabled', variant: 'primary', size: 'md', checked: true, loading: true },
};

export const Disabled: Story = {
  args: { label: 'Admin-only feature', variant: 'primary', size: 'md', disabled: true, checked: false },
};

export const LabelLeft: Story = {
  name: 'Label on Left',
  args: { label: 'Receive marketing emails', variant: 'primary', size: 'md', labelPosition: 'left' },
};

export const AllVariants: Story = {
  name: 'Color Variants',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <lc-switch label="Primary (default)" variant="primary" [checked]="true"></lc-switch>
        <lc-switch label="Secondary" variant="secondary" [checked]="true"></lc-switch>
        <lc-switch label="Success — feature active" variant="success" [checked]="true"></lc-switch>
        <lc-switch label="Warning — proceed with caution" variant="warning" [checked]="true"></lc-switch>
        <lc-switch label="Danger — destructive action" variant="danger" [checked]="true"></lc-switch>
      </div>`,
  }),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <lc-switch label="Small" variant="primary" size="sm" [checked]="true"></lc-switch>
        <lc-switch label="Medium (default)" variant="primary" size="md" [checked]="true"></lc-switch>
        <lc-switch label="Large" variant="primary" size="lg" [checked]="true"></lc-switch>
      </div>`,
  }),
};

export const NotificationSettings: Story = {
  name: 'Notification Settings (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 400px;">
        <h4 style="margin: 0 0 16px; font-weight: 600;">Notification Preferences</h4>
        <div style="display: flex; flex-direction: column; gap: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
            <div>
              <div style="font-weight: 500;">Email notifications</div>
              <div style="font-size: 12px; color: #666;">Receive updates about your projects</div>
            </div>
            <lc-switch variant="primary" [checked]="true"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
            <div>
              <div style="font-weight: 500;">Push notifications</div>
              <div style="font-size: 12px; color: #666;">Get notified on your device</div>
            </div>
            <lc-switch variant="primary" [checked]="true"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
            <div>
              <div style="font-weight: 500;">Weekly digest</div>
              <div style="font-size: 12px; color: #666;">Summary of activity every Monday</div>
            </div>
            <lc-switch variant="primary" [checked]="false"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
            <div>
              <div style="font-weight: 500;">Marketing emails</div>
              <div style="font-size: 12px; color: #666;">Product updates and promotions</div>
            </div>
            <lc-switch variant="primary" [checked]="false"></lc-switch>
          </div>
        </div>
      </div>`,
  }),
};

export const FeatureFlags: Story = {
  name: 'Feature Flags (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 500px;">
        <h4 style="margin: 0 0 4px; font-weight: 600;">Feature Flags</h4>
        <p style="margin: 0 0 16px; font-size: 13px; color: #666;">Toggle experimental features for this environment.</p>
        <div style="display: flex; flex-direction: column; gap: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="font-family: monospace; font-size: 13px;">new_dashboard_layout</span>
            <lc-switch variant="success" [checked]="true" size="sm"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="font-family: monospace; font-size: 13px;">ai_suggestions</span>
            <lc-switch variant="success" [checked]="true" size="sm"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="font-family: monospace; font-size: 13px;">beta_export_v2</span>
            <lc-switch variant="warning" [checked]="false" size="sm"></lc-switch>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <span style="font-family: monospace; font-size: 13px;">delete_account_flow</span>
            <lc-switch variant="danger" [checked]="false" size="sm"></lc-switch>
          </div>
        </div>
      </div>`,
  }),
};

const MANAGE_LABEL = 'Andere Erwachsene dürfen verwalten';
const MANAGE_HELP = 'Andere Erwachsene dürfen Verbindungen und Konten verwalten';

/**
 * 3.16 (BA-1): a description under the label, linked to the switch by
 * `aria-describedby`, so a screen reader reads name, state, then the help.
 * The connection page's managing switch in life-os (boards 16, 22).
 */
export const WithHelpText: Story = {
  name: 'With Help Text',
  args: { label: MANAGE_LABEL, helpText: MANAGE_HELP, variant: 'primary', size: 'md', checked: false },
  decorators: [componentWrapperDecorator((story) => `<div lang="de">${story}</div>`)],
};

/** One switch per size and label position, with and without help text. */
const sizeRow = (size: string, position: string, label: string, help: string) => `
  <lc-switch size="${size}" labelPosition="${position}" label="${label}"${help ? ` helpText="${help}"` : ''} />`;

/**
 * 3.16 (BA-2): every row with a label is at least 44 px high, with or without
 * help text, in `sm`, `md` and `lg` and both label positions. The track sits
 * on the label's first line.
 */
export const HelpTextSizesAndPositions: Story = {
  name: 'Help Text Sizes and Positions',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div lang="de" style="display: flex; flex-direction: column; gap: 8px;">
          ${['sm', 'md', 'lg'].map((s) => sizeRow(s, 'left', `${MANAGE_LABEL} (${s}, links)`, MANAGE_HELP)).join('')}
          ${['sm', 'md', 'lg'].map((s) => sizeRow(s, 'right', `${MANAGE_LABEL} (${s}, rechts)`, MANAGE_HELP)).join('')}
        </div>
        <div lang="en" style="display: flex; flex-direction: column; gap: 8px;">
          ${['sm', 'md', 'lg'].map((s) => sizeRow(s, 'right', `Share health bookings (${s})`, 'Your household sees health bookings in the shared overview')).join('')}
          ${sizeRow('sm', 'right', 'Without help text (sm)', '')}
        </div>
      </div>`,
  }),
};

type LargeTextStory = StoryObj<SwitchComponent & { textSize: '200%' | '100%' }>;

/**
 * 3.16 (BA-1): at 200 % text (a phone's large-text setting) the label and the
 * help text wrap beside the switch, with no truncation and no horizontal
 * scroll. The root text size is raised in the canvas only.
 */
export const HelpTextAt200Text: LargeTextStory = {
  name: 'Help Text at 200 % Text',
  args: { textSize: '200%' },
  argTypes: {
    textSize: {
      control: 'inline-radio',
      options: ['200%', '100%'],
      description:
        "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
      table: { defaultValue: { summary: "'200%'" } },
    },
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" style="background: var(--color-background); padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <div lang="de"><lc-switch label="${MANAGE_LABEL}" helpText="${MANAGE_HELP}" /></div>
        <div lang="en"><lc-switch size="lg" label="Share health bookings" helpText="Your household sees health bookings in the shared overview" [checked]="true" /></div>
      </div>
      <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`,
  }),
};
