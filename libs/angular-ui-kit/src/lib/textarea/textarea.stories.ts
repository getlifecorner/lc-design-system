import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TextareaComponent } from './textarea.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';

/** A visitor's message as the server keeps it on a 422/429/503 page (G-CF1). */
const GERMAN_MESSAGE =
  'Guten Tag,\n\nich möchte die Haushaltsmitgliederverwaltung meiner Datenschutzeinstellungsübersicht auf ein neues ' +
  'Konto übertragen. Geht das auch für „Müller & Söhne“ mit "Zimmer <2>"?\n\nViele Grüße\nJürgen';

/**
 * A multi-line text input for longer form content like descriptions, comments,
 * and messages. Supports character counting, auto-resize, validation states,
 * and two visual variants.
 */
const meta: Meta<TextareaComponent> = {
  title: 'Form/Textarea',
  component: TextareaComponent,
  argTypes: {
    label: { description: 'Label text displayed above the textarea', table: { defaultValue: { summary: "''" } } },
    placeholder: { description: 'Placeholder text shown when empty', table: { defaultValue: { summary: "''" } } },
    variant: {
      control: 'select',
      options: ['outline', 'filled'],
      description: 'Visual style — outline has a border, filled has a background',
      table: { defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Controls padding and font size',
      table: { defaultValue: { summary: 'md' } },
    },
    rows: { description: 'Number of visible text lines (default height)', table: { defaultValue: { summary: '3' } } },
    maxLength: { description: 'Maximum number of characters allowed', table: { defaultValue: { summary: 'undefined' } } },
    showCharacterCount: {
      description: 'Shows remaining/total character count below the field',
      table: { defaultValue: { summary: 'false' } },
    },
    autoResize: { description: 'Automatically grows/shrinks based on content', table: { defaultValue: { summary: 'false' } } },
    minRows: { description: 'Minimum rows when auto-resize is enabled', table: { defaultValue: { summary: '3' } } },
    maxRows: { description: 'Maximum rows when auto-resize is enabled', table: { defaultValue: { summary: 'undefined' } } },
    helperText: { description: 'Helpful hint shown below the textarea', table: { defaultValue: { summary: "''" } } },
    error: { description: 'Shows error styling when true', table: { defaultValue: { summary: 'false' } } },
    errorMessage: { description: 'Error message displayed below the textarea', table: { defaultValue: { summary: "''" } } },
    disabled: { description: 'Prevents editing', table: { defaultValue: { summary: 'false' } } },
    readonly: { description: 'Allows copying but not editing', table: { defaultValue: { summary: 'false' } } },
    name: {
      control: 'text',
      description:
        '3.10: native `name` of the inner textarea, so a form posts the text without JavaScript (G-CF1). Unset = no attribute',
      table: { defaultValue: { summary: 'undefined' } },
    },
    value: {
      control: 'text',
      description:
        '3.10: current text, two-way bindable via `[(value)]`; pre-fills the textarea, in prerendered HTML too (G-CF1)',
      table: { defaultValue: { summary: "''" } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required (`required`, `aria-required`)',
      table: { defaultValue: { summary: 'false' } },
    },
    requiredIndicator: {
      control: 'boolean',
      description:
        '3.10: shows the `*` after the label of a required field; `false` keeps `required` / `aria-required` without it (G-CF3)',
      table: { defaultValue: { summary: 'true' } },
    },
    requiredAriaLabel: {
      control: 'text',
      description:
        '3.10: accessible name of the `*`, for parity with `lc-input`. The `*` stays hidden from assistive technology: the native required state is announced already (G-CF3)',
      table: { defaultValue: { summary: 'required' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Textarea component for multi-line text input.

**Key Features:**
- Variant styles (outline, filled)
- Size presets (xs, sm, md, lg)
- Auto-resize with configurable min/max rows
- Character count display with maxLength
- Validation error message and helper text
- Disabled and readonly states
- ControlValueAccessor integration for reactive forms
- Plain form posts without JavaScript: \`name\`, and a \`value\` that is prerendered into the native textarea (3.10)
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: { label: 'Description', placeholder: 'Enter a description...', variant: 'outline', size: 'md', rows: 3 },
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: { label: 'Bio', placeholder: 'Tell us about yourself...', helperText: 'This will appear on your public profile', variant: 'outline', size: 'md', rows: 3 },
};

export const WithCharacterCount: Story = {
  name: 'With Character Count',
  args: { label: 'Short message', placeholder: 'Write a short message...', maxLength: 280, showCharacterCount: true, variant: 'outline', size: 'md', rows: 3 },
};

export const AutoResize: Story = {
  name: 'Auto-Resize',
  args: { label: 'Notes', placeholder: 'Start typing — the field will grow automatically...', autoResize: true, minRows: 2, maxRows: 10, variant: 'outline', size: 'md' },
};

export const WithError: Story = {
  name: 'Error State',
  args: { label: 'Feedback', placeholder: 'Enter your feedback...', error: true, errorMessage: 'Feedback must be at least 20 characters', variant: 'outline', size: 'md', rows: 3 },
};

export const FilledVariant: Story = {
  name: 'Filled Variant',
  args: { label: 'Comments', placeholder: 'Add a comment...', variant: 'filled', size: 'md', rows: 3 },
};

export const Disabled: Story = {
  args: { label: 'System Note', placeholder: '', variant: 'outline', size: 'md', rows: 2, disabled: true },
};

export const Readonly: Story = {
  args: { label: 'Agreement Terms', variant: 'outline', size: 'md', rows: 4, readonly: true },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <lc-textarea label="Extra Small" placeholder="xs size" size="xs" [rows]="2"></lc-textarea>
        <lc-textarea label="Small" placeholder="sm size" size="sm" [rows]="2"></lc-textarea>
        <lc-textarea label="Medium (default)" placeholder="md size" size="md" [rows]="2"></lc-textarea>
        <lc-textarea label="Large" placeholder="lg size" size="lg" [rows]="2"></lc-textarea>
      </div>`,
  }),
};

export const FeedbackForm: Story = {
  name: 'Feedback Form (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 480px;">
        <h4 style="margin: 0 0 4px; font-weight: 600;">Send Feedback</h4>
        <p style="margin: 0 0 16px; font-size: 13px; color: #666;">Help us improve by sharing your thoughts.</p>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <lc-textarea
            label="What went well?"
            placeholder="Tell us what you enjoyed..."
            [rows]="3"
            [maxLength]="500"
            [showCharacterCount]="true"
          ></lc-textarea>
          <lc-textarea
            label="What could be improved?"
            placeholder="Any suggestions or issues..."
            [rows]="3"
            [maxLength]="500"
            [showCharacterCount]="true"
          ></lc-textarea>
          <lc-textarea
            label="Additional comments (optional)"
            placeholder="Anything else you'd like to add..."
            helperText="Your feedback is anonymous"
            [rows]="2"
            [autoResize]="true"
            [maxRows]="6"
          ></lc-textarea>
        </div>
      </div>`,
  }),
};

/**
 * 3.10 (G-CF1): `name` and a multi-line `value`. The text is in the native
 * textarea from the first paint, also in prerendered HTML, so a form posts it
 * without JavaScript and a server page can keep it.
 */
export const PrefilledValue: Story = {
  name: 'Pre-filled Value (G-CF1)',
  args: {
    label: 'Message',
    name: 'message',
    rows: 6,
    required: true,
    value: 'Hello,\n\nI would like to move my household to a new account.\n\nBest regards\nLena',
  },
};

/**
 * 3.10 (G-CF1, G-CF3): German text with long words and `& < > "`, shown
 * literally. `requiredAriaLabel="Pflichtfeld"` is not announced: the `*` stays
 * hidden, the native required state says it once.
 */
export const PrefilledGerman: Story = {
  name: 'Pre-filled, German (G-CF1, G-CF3)',
  args: {
    label: 'Nachricht',
    name: 'message',
    rows: 6,
    required: true,
    requiredAriaLabel: 'Pflichtfeld',
    value: GERMAN_MESSAGE,
  },
};

/** 3.10 (G-CF3): every field is required, so none shows the asterisk; the field is still `required`. */
export const RequiredWithoutIndicator: Story = {
  name: 'Required without Asterisk (G-CF3)',
  args: { label: 'Message', required: true, requiredIndicator: false, rows: 3, placeholder: 'Your message' },
};

/**
 * 3.10 (G-CF1, G-CF2): the life-os contact form as a plain HTML post. Without
 * JavaScript the browser posts `email` and `message`; the server's 422/429/503
 * pages render the same form with the visitor's values. (Submitting is
 * prevented here.)
 */
export const NoScriptContactForm: Story = {
  name: 'Contact Form without Script (G-CF1, G-CF2)',
  decorators: [moduleMetadata({ imports: [InputComponent, ButtonComponent] })],
  render: () => ({
    props: { message: GERMAN_MESSAGE },
    template: `
      <form method="post" action="/kontakt" (submit)="$event.preventDefault()" style="max-width:560px;display:flex;flex-direction:column;gap:16px">
        <lc-input label="E-Mail" type="email" size="lg" name="email" [required]="true" requiredAriaLabel="Pflichtfeld" value="jana@example.de"></lc-input>
        <lc-textarea label="Nachricht" name="message" [rows]="6" [required]="true" requiredAriaLabel="Pflichtfeld" [value]="message"></lc-textarea>
        <lc-button type="submit" variant="primary" size="lg" [fullWidth]="true">Senden</lc-button>
      </form>`,
  }),
};
