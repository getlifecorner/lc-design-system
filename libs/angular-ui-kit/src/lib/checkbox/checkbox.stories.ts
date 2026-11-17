import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxGroupComponent } from './checkbox-group.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Form/Checkbox',
  component: CheckboxComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Checkbox component handles boolean toggle inputs with labels.
Supports validation, help text, and indeterminate state.

**Key Features:**
- Label with optional help text
- Error state with message
- Required field marker
- ControlValueAccessor for Angular forms
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Checkbox size',
      table: { defaultValue: { summary: 'md' } },
    },
    label: { control: 'text', description: 'Checkbox label' },
    helpText: { control: 'text', description: 'Helper text shown below the label' },
    checked: { control: 'boolean', description: 'Checked state (two-way bindable via [(checked)])' },
    indeterminate: { control: 'boolean', description: 'Partially-checked state, cleared on the next toggle' },
    disabled: { control: 'boolean', description: 'Disables the checkbox' },
    readonly: {
      control: 'boolean',
      description:
        'Read-only (3.42): the value at full contrast, focusable, `aria-readonly="true"`; click and Space change nothing. `disabled` wins',
      table: { defaultValue: { summary: 'false' } },
    },
    required: { control: 'boolean', description: 'Marks as required' },
    value: {
      control: 'text',
      description: 'The value this checkbox adds to its `lc-checkbox-group`’s value while checked; no effect without a group',
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  args: { label: 'I agree to the terms and conditions' },
};

export const WithHelpText: Story = {
  args: { label: 'Subscribe to newsletter', helpText: 'Get weekly updates about new features and design tips.' },
};

export const WithError: Story = {
  parameters: {
    docs: { description: { story: 'Error state when the checkbox is required but not checked.' } },
  },
  args: { label: 'I agree to the privacy policy', error: true, errorMessage: 'You must accept the privacy policy to continue.' },
};

export const Required: Story = {
  args: { label: 'Terms of Service', required: true, helpText: 'Required to create an account.' },
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <lc-checkbox label="This option is currently unavailable" [disabled]="true"></lc-checkbox>
        <lc-checkbox label="Locked in the on state" [disabled]="true" [checked]="true"></lc-checkbox>
      </div>`,
  }),
};

export const Readonly: Story = {
  name: 'Read-only',
  parameters: {
    docs: {
      description: {
        story:
          'A value the person may see but not change (3.42, usm-x row 10): the box keeps full contrast (muted box, field border 4.63:1, check in the text colour), stays in the tab order and has `aria-readonly="true"`; click and Space change nothing.',
      },
    },
  },
  args: { label: 'Approval required', readonly: true, checked: true },
};

export const ReadonlyAndDisabled: Story = {
  name: 'Read-only and Disabled (DE)',
  parameters: {
    controls: { include: ['size'] },
    docs: {
      description: {
        story:
          'Editable, read-only and disabled side by side, each off, on and partially checked (3.42). A disabled checked box keeps its fill (061-s1: the check is 3.63:1 in light, was 1.02:1); read-only is not dimmed.',
      },
    },
  },
  args: { size: 'md' },
  render: (args) => ({
    moduleMetadata: { imports: [CheckboxGroupComponent, CheckboxComponent] },
    props: { size: args.size ?? 'md' },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-checkbox-group legend="Bearbeitbar" orientation="horizontal" [size]="size">
          <lc-checkbox label="aus"></lc-checkbox>
          <lc-checkbox label="an" [checked]="true"></lc-checkbox>
          <lc-checkbox label="teilweise" [indeterminate]="true"></lc-checkbox>
        </lc-checkbox-group>
        <lc-checkbox-group legend="Schreibgeschützt" orientation="horizontal" [size]="size">
          <lc-checkbox label="aus" [readonly]="true"></lc-checkbox>
          <lc-checkbox label="an" [readonly]="true" [checked]="true"></lc-checkbox>
          <lc-checkbox label="teilweise" [readonly]="true" [indeterminate]="true"></lc-checkbox>
        </lc-checkbox-group>
        <lc-checkbox-group legend="Deaktiviert" orientation="horizontal" [size]="size">
          <lc-checkbox label="aus" [disabled]="true"></lc-checkbox>
          <lc-checkbox label="an" [disabled]="true" [checked]="true"></lc-checkbox>
          <lc-checkbox label="teilweise" [disabled]="true" [indeterminate]="true"></lc-checkbox>
        </lc-checkbox-group>
      </div>`,
  }),
};

export const SizesWithHelpText: Story = {
  name: 'Sizes with Help Text',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Help and error text start under the label text in every size (3.42, 061-n1: x = box + gap, 24 / 26 / 28 / 32 px). An `lg` row is a 44 px touch target, alone as in a group (061-n2); xs, sm and md are dense rows.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-checkbox size="xs" label="Extra small" helpText="Help text under the label"></lc-checkbox>
        <lc-checkbox size="sm" label="Small" helpText="Help text under the label"></lc-checkbox>
        <lc-checkbox size="md" label="Medium" helpText="Help text under the label"></lc-checkbox>
        <lc-checkbox size="lg" label="Large" helpText="Help text under the label"></lc-checkbox>
        <lc-checkbox size="md" label="Medium with error" [error]="true" errorMessage="This box must be checked."></lc-checkbox>
      </div>`,
  }),
};

export const Indeterminate: Story = {
  parameters: {
    docs: { description: { story: 'Partially selected parent checkbox; the state clears on the next user toggle.' } },
  },
  args: { label: 'Select all', indeterminate: true },
};

export const CheckboxGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Multiple checkboxes for a multi-select, in an `lc-checkbox-group` (3.41): a `<fieldset>` named by its legend. Each checkbox keeps its own help text. See Form/Checkbox Group for errors, `required`, sizes and the array value.',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [CheckboxGroupComponent, CheckboxComponent] },
    template: `
      <lc-checkbox-group legend="Notification preferences">
        <lc-checkbox label="Email notifications" helpText="Receive updates via email"></lc-checkbox>
        <lc-checkbox label="Push notifications" helpText="Browser push notifications"></lc-checkbox>
        <lc-checkbox label="SMS alerts" helpText="Text messages for urgent items"></lc-checkbox>
        <lc-checkbox label="Weekly digest" helpText="Summary of activity every Monday"></lc-checkbox>
      </lc-checkbox-group>`,
  }),
};

export const ConsentForm: Story = {
  parameters: {
    docs: { description: { story: 'Real-world pattern: consent checkboxes in a signup flow.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <lc-input label="Email" type="email" placeholder="you@example.com" [required]="true"></lc-input>
        <lc-input label="Password" type="password" placeholder="••••••••" [required]="true"></lc-input>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
          <lc-checkbox label="I agree to the Terms of Service" [required]="true"></lc-checkbox>
          <lc-checkbox label="I want to receive product updates" helpText="Optional. You can unsubscribe anytime."></lc-checkbox>
        </div>
        <lc-button variant="primary" [fullWidth]="true">Create Account</lc-button>
      </div>`,
  }),
};
