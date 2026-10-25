import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'Form/Input',
  component: InputComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Input component handles text-based form data entry with comprehensive
validation, accessibility, and customization features.

**Key Features:**
- Multiple input types (text, email, password, number, tel, url)
- 4 sizes (xs, sm, md, lg)
- Validation with error messages
- Helper text for guidance
- Leading/trailing icons
- Character count display (spoken by screen readers only near the limit)
- Input purpose and keyboard hints for autofill and on-screen keyboards:
  \`autocomplete\`, \`name\`, \`autocapitalize\`, \`spellcheck\`, \`enterkeyhint\`
- Read-only values that wrap instead of being clipped (\`readonlyWrap\`)
- \`required\` without the asterisk (\`requiredIndicator\`); the \`*\` is decorative, the native required state is announced
- 3.12: a stable id (\`controlId\`) for error-summary links and identical prerendered builds, and errors without
  \`role="alert"\` under an \`lc-alert\` summary (\`announceError\`)
- ControlValueAccessor for Angular forms integration

**Autofill (WCAG 1.3.5 Identify Input Purpose):** set \`autocomplete\` on every field that
collects data about the person — \`name\`, \`email\`, \`username\`, \`tel\` … On a sign-in
form \`username webauthn\` lets the browser offer passkeys in the email field.
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
      table: { defaultValue: { summary: 'text' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Input field size',
      table: { defaultValue: { summary: 'md' } },
    },
    label: { control: 'text', description: 'Label displayed above the input' },
    value: { control: 'text', description: 'Current value (two-way bindable via [(value)])' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper text below the input' },
    error: { control: 'text', description: 'Error message (activates error state)' },
    disabled: { control: 'boolean', description: 'Disables the input' },
    readonly: { control: 'boolean', description: 'Makes the input read-only' },
    required: { control: 'boolean', description: 'Marks as required' },
    requiredIndicator: {
      control: 'boolean',
      description: 'Shows the `*` after the label of a required field; `false` keeps `required` / `aria-required` without it',
      table: { defaultValue: { summary: 'true' } },
    },
    readonlyWrap: {
      control: 'boolean',
      description:
        'While `readonly`: the value wraps onto more lines instead of being clipped (a read-only textbox named by the label; a hidden native input keeps value, name and autocomplete)',
      table: { defaultValue: { summary: 'false' } },
    },
    autocomplete: {
      control: 'text',
      description:
        'Native `autocomplete` (input purpose, WCAG 1.3.5): `name`, `email`, `username`, `username webauthn`, `current-password`, `new-password`, `one-time-code`, `tel`, `off` … Unset = no attribute',
    },
    name: { control: 'text', description: 'Native `name` of the inner input. Unset = no attribute' },
    autocapitalize: {
      control: 'select',
      options: [undefined, 'off', 'none', 'on', 'sentences', 'words', 'characters'],
      description: 'Native `autocapitalize` for on-screen keyboards (`off` for addresses and codes, `words` for names). Unset = no attribute',
    },
    spellcheck: {
      control: 'select',
      options: [undefined, true, false],
      description: 'Native `spellcheck` (`false` for names, addresses and codes). Unset = no attribute',
    },
    enterkeyhint: {
      control: 'select',
      options: [undefined, 'enter', 'done', 'go', 'next', 'previous', 'search', 'send'],
      description: 'Native `enterkeyhint`: the label of the on-screen keyboard’s Enter key. Unset = no attribute',
    },
    maxLength: { control: 'number', description: 'Maximum number of characters (native `maxlength`)' },
    showCharCount: { control: 'boolean', description: 'Shows the visible count `n / max` (needs `maxLength`)' },
    charCountRemainingLabel: {
      control: 'text',
      description: 'Screen-reader announcement near the limit; `{remaining}` is replaced',
      table: { defaultValue: { summary: 'Characters remaining: {remaining}' } },
    },
    charCountAnnounceThreshold: {
      control: 'number',
      description: 'Remaining characters from which the count is announced. Unset = the last 10 % of `maxLength` (at least 1)',
    },
    requiredAriaLabel: {
      control: 'text',
      description:
        'Deprecated, no effect (3.12): the `*` is decorative and hidden from assistive technology; the native `required` state is announced, in the screen reader’s language (a name on the `*` said "required" twice, G-CF6)',
      table: { defaultValue: { summary: 'required' } },
    },
    controlId: {
      control: 'text',
      description:
        '3.12: id of the native input; the label `for`, `<id>-error`, `<id>-helper`, `<id>-label` and `aria-describedby` derive from it, so an error summary can link to the field and prerendered HTML is the same in every build (G-CF4). Unset = a generated `lc-input-<n>` in creation order',
      table: { defaultValue: { summary: 'generated (lc-input-<n>)' } },
    },
    announceError: {
      control: 'boolean',
      description:
        '3.12: announce the error the moment it appears (`role="alert"`). `false` under an `lc-alert` error summary, so errors aren’t read twice; the message stays visible and in `aria-describedby`, the control keeps `aria-invalid` (G-CF7)',
      table: { defaultValue: { summary: 'true' } },
    },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: { label: 'Full Name', placeholder: 'Enter your full name', size: 'md' },
};

export const WithHelper: Story = {
  parameters: {
    docs: { description: { story: 'Helper text provides additional guidance below the input.' } },
  },
  args: { label: 'Username', placeholder: 'your-username', helperText: 'Must be 3–20 characters. Only letters, numbers, and hyphens.' },
};

export const WithError: Story = {
  parameters: {
    docs: { description: { story: 'Error messages appear when validation fails. The input border turns red.' } },
  },
  args: { label: 'Email Address', placeholder: 'you@example.com', type: 'email', error: 'Please enter a valid email address' },
};

export const WithIcon: Story = {
  parameters: {
    docs: { description: { story: 'Icons provide visual context about the input purpose.' } },
  },
  args: { label: 'Search', placeholder: 'Search users, projects...', iconBefore: 'magnifying-glass' },
};

export const WithCharCount: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Character count helps users stay within limits. Shows current/max. Screen readers hear the remaining characters only near the limit (by default the last 10 %), not on every keystroke.',
      },
    },
  },
  args: { label: 'Bio', placeholder: 'Tell us about yourself...', maxLength: 150, showCharCount: true, helperText: 'A short description for your profile.' },
};

export const Required: Story = {
  args: { label: 'Company Name', placeholder: 'Acme Inc.', required: true },
};

export const Disabled: Story = {
  args: { label: 'Account ID', placeholder: 'Auto-generated', disabled: true },
};

export const Readonly: Story = {
  args: { label: 'API Key', readonly: true },
};

export const Sizes: Story = {
  parameters: {
    docs: { description: { story: 'All available input sizes. Use `sm` for compact forms, `lg` for hero inputs.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-input size="xs" label="Extra Small" placeholder="xs size"></lc-input>
        <lc-input size="sm" label="Small" placeholder="sm size"></lc-input>
        <lc-input size="md" label="Medium (default)" placeholder="md size"></lc-input>
        <lc-input size="lg" label="Large" placeholder="lg size"></lc-input>
      </div>`,
  }),
};

export const LoginForm: Story = {
  parameters: {
    docs: { description: { story: 'Real-world example: a login form using multiple input features.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 360px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin: 0 0 4px; font-size: 20px; font-weight: 600;">Welcome back</h2>
        <p style="margin: 0 0 20px; font-size: 14px; color: var(--color-text-secondary);">Sign in to your account</p>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <lc-input label="Email" type="email" placeholder="you@company.com" iconBefore="envelope" [required]="true"></lc-input>
          <lc-input label="Password" type="password" placeholder="••••••••" [required]="true"></lc-input>
          <lc-button variant="primary" [fullWidth]="true">Sign In</lc-button>
          <lc-button variant="link" size="sm">Forgot your password?</lc-button>
        </div>
      </div>`,
  }),
};

export const ContactForm: Story = {
  parameters: {
    docs: { description: { story: 'Example showing inputs with various validation states.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 480px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <lc-input label="First Name" placeholder="John" [required]="true"></lc-input>
          <lc-input label="Last Name" placeholder="Doe" [required]="true"></lc-input>
        </div>
        <lc-input label="Email" type="email" placeholder="john@example.com" [required]="true" iconBefore="envelope"></lc-input>
        <lc-input label="Phone" type="tel" placeholder="+1 (555) 000-0000" iconBefore="phone" helperText="Optional. For urgent inquiries only."></lc-input>
      </div>`,
  }),
};

/** A person's name: autofill, capital letters for words, no spell check, the keyboard's Enter says "next". */
export const NameWithAutofill: Story = {
  name: 'Name with Autofill (SI-2)',
  args: {
    label: 'Name',
    size: 'lg',
    maxLength: 80,
    autocomplete: 'name',
    name: 'name',
    autocapitalize: 'words',
    spellcheck: false,
    enterkeyhint: 'next',
    value: 'Lena Brandt',
  },
};

/** Read-only values wrap instead of being clipped; the hidden native input still tells password managers the user name. */
export const ReadonlyWrap: Story = {
  name: 'Read-only Value that Wraps (SI-10)',
  render: () => ({
    template: `
      <div style="max-width: 312px">
        <lc-input label="Email address" size="lg" type="email" [readonly]="true" [readonlyWrap]="true"
                  autocomplete="username" name="username"
                  value="johanna-friederike.brandt-oberhausen@example.com"></lc-input>
      </div>`,
  }),
};

/** Every field is required, so none shows the asterisk; an empty submit shows the field's error. */
export const RequiredWithoutIndicator: Story = {
  name: 'Required without Asterisk (SI-9)',
  args: { label: 'Name', required: true, requiredIndicator: false },
};

/**
 * 3.12 (G-CF4, G-CF7): a 422 page. The `lc-alert` summary is the only alert;
 * the field errors are quiet (`announceError=false`) but stay visible and in
 * `aria-describedby`. The summary's links go to the fields by their
 * `controlId` (`#contact-email`, `#contact-message`) and focus them.
 */
export const ErrorSummary: Story = {
  name: 'Error Summary (G-CF4, G-CF7)',
  render: () => ({
    template: `
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 16px;">
        <lc-alert variant="error" title="Bitte prüfen Sie zwei Angaben">
          <ul style="list-style: none; margin: 4px 0 0; padding: 0">
            <li><a lcButton variant="link" size="sm" [flush]="true" href="#contact-email">E-Mail-Adresse</a></li>
            <li><a lcButton variant="link" size="sm" [flush]="true" href="#contact-message">Nachricht</a></li>
          </ul>
        </lc-alert>
        <lc-input label="Name" controlId="contact-name" name="name" autocomplete="name" [required]="true" value="Jana Müller"></lc-input>
        <lc-input label="E-Mail-Adresse" controlId="contact-email" type="email" name="email" autocomplete="email" [required]="true"
                  value="jana.mueller@" error="Geben Sie eine E-Mail-Adresse wie name@beispiel.de ein" [announceError]="false"></lc-input>
        <lc-textarea label="Nachricht" controlId="contact-message" name="message" [required]="true" value="Hallo!"
                     [error]="true" errorMessage="Schreiben Sie uns mindestens 20 Zeichen" [announceError]="false"></lc-textarea>
      </div>`,
  }),
};

/**
 * 3.13 (G-WL3): a field keeps its height when it shows an error. The container's
 * error state is the class `input-invalid`; the message keeps `p.input-error`.
 * Until 3.12 both had `input-error`, so the field grew (lg 44 → 49 px).
 */
export const ErrorKeepsHeight: Story = {
  name: 'Error Keeps the Height (G-WL3)',
  parameters: {
    docs: {
      description: {
        story:
          '3.13 (G-WL3): idle on the left, with an error on the right, in every size. The fields line up because the error state no longer changes the box: xs 24, sm 32, md 40 and lg 44 px in both columns, also when focused. The field container carries `input-invalid` in the error state; the message is `<p class="input-error">` as before. Until 3.12 the container also had `input-error` and took the message\'s `flex: 1`, which grew it to 28, 35, 42 and 49 px.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="max-width: 560px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
        <lc-input data-cell="xs-idle" size="xs" label="E-Mail (xs)" type="email" value="jana.mueller@beispiel.de"></lc-input>
        <lc-input data-cell="xs-error" size="xs" label="E-Mail (xs)" type="email" value="jana.mueller@" error="Bitte gib eine gültige E-Mail-Adresse ein"></lc-input>
        <lc-input data-cell="sm-idle" size="sm" label="E-Mail (sm)" type="email" value="jana.mueller@beispiel.de"></lc-input>
        <lc-input data-cell="sm-error" size="sm" label="E-Mail (sm)" type="email" value="jana.mueller@" error="Bitte gib eine gültige E-Mail-Adresse ein"></lc-input>
        <lc-input data-cell="md-idle" size="md" label="E-Mail (md)" type="email" value="jana.mueller@beispiel.de"></lc-input>
        <lc-input data-cell="md-error" size="md" label="E-Mail (md)" type="email" value="jana.mueller@" error="Bitte gib eine gültige E-Mail-Adresse ein"></lc-input>
        <lc-input data-cell="lg-idle" size="lg" label="E-Mail (lg)" type="email" value="jana.mueller@beispiel.de"></lc-input>
        <lc-input data-cell="lg-error" size="lg" label="E-Mail (lg)" type="email" value="jana.mueller@" error="Bitte gib eine gültige E-Mail-Adresse ein"></lc-input>
      </div>`,
  }),
};

/**
 * 3.12 (G-CF6): the `*` sits 4 px after the label in every size of both
 * fields, is hidden from assistive technology (the native required state says
 * it once) and never wraps onto a line by itself.
 */
export const RequiredAsterisk: Story = {
  name: 'Required Asterisk (G-CF6)',
  render: () => ({
    template: `
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <lc-input size="xs" label="Name" [required]="true"></lc-input>
        <lc-input size="sm" label="E-Mail-Adresse" type="email" [required]="true"></lc-input>
        <lc-input size="md" label="Telefonnummer" type="tel" [required]="true"></lc-input>
        <lc-input size="lg" label="Ihre vollständige Postanschrift für die Rücksendung" [required]="true"></lc-input>
        <lc-textarea size="xs" label="Nachricht (xs)" [required]="true" [rows]="2"></lc-textarea>
        <lc-textarea size="sm" label="Nachricht (sm)" [required]="true" [rows]="2"></lc-textarea>
        <lc-textarea size="md" label="Nachricht (md)" [required]="true" [rows]="2"></lc-textarea>
        <lc-textarea size="lg" label="Nachricht (lg)" [required]="true" [rows]="2"></lc-textarea>
      </div>`,
  }),
};
