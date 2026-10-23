import type { Meta, StoryObj } from '@storybook/angular';
import { StepperComponent } from './stepper.component';

const meta: Meta<StepperComponent> = {
  title: 'Navigation/Stepper',
  component: StepperComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Stepper component guides users through multi-step processes.
Use it for onboarding flows, checkout, wizards, and form sequences.

**Key Features:**
- Horizontal and vertical orientation
- Step labels with optional descriptions
- Active step highlighting
- Optional steps indicator
- Completed/active/upcoming states
        `,
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    activeStep: {
      control: 'number',
      description: 'Zero-based index of the current step',
      table: { defaultValue: { summary: '0' } },
    },
    stepAriaLabel: {
      control: 'text',
      description:
        "Accessible name template of a step button (`{n}`, `{m}`, `{label}`); the step's description and `optionalLabel` follow it. Keep `{label}` last, so the name contains the visible text.",
      table: { defaultValue: { summary: 'Step {n} of {m}: {label}' } },
    },
    optionalLabel: {
      control: 'text',
      description: "Text shown under optional steps; it also ends the step's accessible name.",
      table: { defaultValue: { summary: 'Optional' } },
    },
  },
};

export default meta;
type Story = StoryObj<StepperComponent>;

export const Default: Story = {
  args: {
    steps: [
      { label: 'Account', description: 'Create your account' },
      { label: 'Profile', description: 'Set up your profile' },
      { label: 'Review', description: 'Review and confirm' },
    ],
    activeStep: 1,
    orientation: 'horizontal',
  },
};

export const AtFirstStep: Story = {
  args: {
    steps: [
      { label: 'Select Plan', description: 'Choose your subscription' },
      { label: 'Payment', description: 'Add payment method' },
      { label: 'Confirmation', description: 'Review your order' },
    ],
    activeStep: 0,
  },
};

export const AtLastStep: Story = {
  args: {
    steps: [
      { label: 'Details', description: 'Enter your info' },
      { label: 'Address', description: 'Shipping address' },
      { label: 'Payment', description: 'Payment method' },
      { label: 'Confirm', description: 'Place order' },
    ],
    activeStep: 3,
  },
};

export const Vertical: Story = {
  parameters: {
    docs: { description: { story: 'Vertical orientation for sidebar step indicators or mobile layouts.' } },
  },
  args: {
    steps: [
      { label: 'Personal Info', description: 'Name and contact details' },
      { label: 'Work Experience', description: 'Employment history' },
      { label: 'Education', description: 'Academic background' },
      { label: 'Skills', description: 'Technical skills and certifications' },
      { label: 'Submit', description: 'Review and submit application' },
    ],
    activeStep: 2,
    orientation: 'vertical',
  },
};

export const WithOptionalStep: Story = {
  parameters: {
    docs: { description: { story: 'Optional steps can be skipped by the user.' } },
  },
  args: {
    steps: [
      { label: 'Basic Info' },
      { label: 'Photo Upload', optional: true },
      { label: 'Preferences' },
      { label: 'Done' },
    ],
    activeStep: 1,
  },
};

export const Localized: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'German step names with a long description: the name is the filled `stepAriaLabel`, then the description and `optionalLabel`, so it contains the visible text once.',
      },
    },
  },
  args: {
    steps: [
      { label: 'Konto' },
      { label: 'Persönliche Angaben', description: 'Bitte geben Sie Ihre vollständige Anschrift ein' },
      { label: 'Zahlungsmethode', optional: true },
      { label: 'Bestätigung' },
    ],
    activeStep: 1,
    orientation: 'vertical',
    stepAriaLabel: 'Schritt {n} von {m}: {label}',
  },
};

export const CheckoutFlow: Story = {
  parameters: {
    docs: { description: { story: 'Real-world example: stepper combined with form content for a checkout flow.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 600px;">
        <lc-stepper
          [steps]="[
            { label: 'Cart', description: '3 items' },
            { label: 'Shipping', description: 'Delivery address' },
            { label: 'Payment', description: 'Card details' },
            { label: 'Confirm', description: 'Place order' }
          ]"
          [activeStep]="1"
        ></lc-stepper>
        <div style="margin-top: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">Shipping Address</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <lc-input label="First Name" placeholder="John"></lc-input>
              <lc-input label="Last Name" placeholder="Doe"></lc-input>
            </div>
            <lc-input label="Street Address" placeholder="123 Main St"></lc-input>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <lc-input label="City" placeholder="San Francisco"></lc-input>
              <lc-input label="ZIP" placeholder="94102"></lc-input>
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
            <lc-button variant="outline">Back to Cart</lc-button>
            <lc-button variant="primary">Continue to Payment</lc-button>
          </div>
        </div>
      </div>`,
  }),
};
