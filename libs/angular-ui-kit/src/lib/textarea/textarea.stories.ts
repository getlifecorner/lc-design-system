import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { TextareaComponent } from './textarea.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

/**
 * 3.35 (request 055, monatsstand-prove row 1): "Oktober 2026 freigeben" opens
 * a form with the focus in its note; a release without a note puts the focus
 * back into it.
 */
@Component({
  selector: 'lc-textarea-focus-on-open-demo',
  standalone: true,
  imports: [TextareaComponent, ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-button variant="primary" (click)="openForm($any($event.currentTarget))">Oktober 2026 freigeben</lc-button>
      <lc-modal
        [open]="open()"
        (openChange)="open.set($event)"
        placement="auto"
        size="md"
        [returnFocusTo]="trigger()"
        [closeOnBackdropClick]="false"
        ariaLabelledBy="release-title"
        closeAriaLabel="Schließen"
      >
        <div slot="header"><h2 id="release-title">Oktober 2026 freigeben</h2></div>
        <div slot="body" style="display: flex; flex-direction: column; gap: 16px;">
          <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">1 Warnung: Kostenstelle 4711 hat keinen Plan.</p>
          <lc-textarea
            label="Vermerk"
            helperText="Begründet die Warnung, höchstens 500 Zeichen."
            [required]="true"
            requiredAriaLabel="Pflichtfeld"
            [rows]="4"
            [maxLength]="500"
            [showCharacterCount]="true"
            [announceError]="false"
            [error]="error()"
            errorMessage="Bitte schreiben Sie einen Vermerk."
            [(value)]="note"
          />
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="ghost" (click)="open.set(false)">Abbrechen</lc-button>
          <lc-button variant="primary" (click)="release()">Freigeben</lc-button>
        </div>
      </lc-modal>
    </div>
  `,
})
class TextareaFocusOnOpenDemoComponent {
  private readonly injector = inject(Injector);
  private readonly field = viewChild.required(TextareaComponent);
  protected readonly open = signal(false);
  protected readonly trigger = signal<HTMLElement | null>(null);
  protected readonly note = signal('');
  protected readonly error = signal(false);

  protected openForm(trigger: HTMLElement): void {
    this.trigger.set(trigger);
    this.note.set('');
    this.error.set(false);
    this.open.set(true);
    this.focusField();
  }

  protected release(): void {
    if (this.note().trim()) {
      this.open.set(false);
      return;
    }
    this.error.set(true);
    this.focusField();
  }

  /** After the render: the dialog exists and has moved the focus to its first control. */
  private focusField(): void {
    afterNextRender(() => this.field().focus(), { injector: this.injector });
  }
}

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
        'Deprecated, no effect (3.12; it never had one here): the `*` is decorative and hidden from assistive technology; the native `required` state is announced, in the screen reader’s language (a name on the `*` would say "required" twice, G-CF3)',
      table: { defaultValue: { summary: 'required' } },
    },
    controlId: {
      control: 'text',
      description:
        '3.12: id of the native textarea; the label `for`, `<id>-error`, `<id>-helper` and `aria-describedby` derive from it, so an error summary can link to the field and prerendered HTML is the same in every build (G-CF4). Unset = a generated `lc-textarea-<n>` in creation order',
      table: { defaultValue: { summary: 'generated (lc-textarea-<n>)' } },
    },
    announceError: {
      control: 'boolean',
      description:
        '3.12: announce the error the moment it appears (`role="alert"`). `false` under an `lc-alert` error summary, so errors aren’t read twice; the message stays visible and in `aria-describedby`, the control keeps `aria-invalid` (G-CF7)',
      table: { defaultValue: { summary: 'true' } },
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
- 3.12: a stable id (\`controlId\`) for error-summary links and identical prerendered builds, and an error without
  \`role="alert"\` under an \`lc-alert\` summary (\`announceError\`)
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

/**
 * 3.12 (G-CF4, G-CF7): the message field of a 422 page whose `lc-alert`
 * summary already announced the errors. The error has no `role="alert"`, but
 * stays visible, keeps its id (`contact-message-error`) in `aria-describedby`,
 * and the textarea keeps `aria-invalid`.
 */
export const ErrorWithoutAlertRole: Story = {
  name: 'Error without Alert Role (G-CF7)',
  args: {
    label: 'Nachricht',
    controlId: 'contact-message',
    required: true,
    error: true,
    errorMessage: 'Schreiben Sie uns mindestens 20 Zeichen',
    announceError: false,
    rows: 4,
  },
};

/** 3.27.2 (request 044, F-31): the filled field's boundary in every size and state, in German. */
export const FilledStates: Story = {
  name: 'Filled States (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.2 (request 044, F-31): `variant="filled"` in every size (2 rows), with an error, disabled and read-only. The filled field now draws the field boundary of the outline variant (its border was transparent at rest and under the pointer): `--color-field-border` at rest, 4.83:1 light and 7.31:1 dark on the page, 4.39:1 / 7.02:1 on its own sunken fill; `--color-text-secondary` on hover, 6.86:1 light and at least 8.17:1 dark on the hover fill (WCAG 1.4.11). The border was already 1 px, so the heights do not change. Read-only keeps the boundary (it is focusable) with no hover change; disabled shows it under its 0.6 opacity; error keeps `--color-error-600`, also under the pointer.',
      },
    },
  },
  render: () => ({
    props: {
      sizes: ['xs', 'sm', 'md', 'lg'],
      readonlyText: 'Die Reisekosten wurden am 3. November geprüft und freigegeben.',
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        @for (size of sizes; track size) {
          <lc-textarea variant="filled" [size]="size" [rows]="2" [label]="'Kommentar (' + size + ')'" placeholder="Kommentar schreiben …"></lc-textarea>
        }
        <lc-textarea variant="filled" [rows]="2" label="Kommentar (Fehler)" placeholder="Kommentar schreiben …" [error]="true" errorMessage="Bitte mindestens 20 Zeichen schreiben"></lc-textarea>
        <lc-textarea variant="filled" [rows]="2" label="Kommentar (deaktiviert)" placeholder="Kommentar schreiben …" [disabled]="true"></lc-textarea>
        <lc-textarea variant="filled" [rows]="2" label="Kommentar (schreibgeschützt)" [readonly]="true" [value]="readonlyText"></lc-textarea>
      </div>`,
  }),
};

/** 3.35 (request 055, monatsstand-prove row 1): a form that opens with the focus in its note. */
export const FocusOnOpen: Story = {
  name: 'Focus on Open (3.35)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.35 (request 055, finance-intelligence „Freigeben“): `focus()` moves the focus into the native `<textarea>`. „Oktober 2026 freigeben“ opens an `lc-modal` (`placement="auto"`: a bottom sheet below 640 px) and the page calls `afterNextRender(() => this.note().focus(), { injector })` with `note = viewChild.required(TextareaComponent)` and its own `injector = inject(Injector)`; that runs after the dialog moved the focus to its first control, so the focus is in „Vermerk“. „Freigeben“ without a note sets the error and puts the focus back into the field (WCAG 2.4.3); the error is read once through `aria-describedby` (`[announceError]="false"`). The field shows the same 2 px ring as after Tab. `returnFocusTo` gives the focus back to the trigger on close. In the story view the trigger is clicked on load without focusing it, as a WebKit tap.',
      },
      story: { inline: false, height: '520px' },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [TextareaFocusOnOpenDemoComponent] },
    template: `<lc-textarea-focus-on-open-demo />`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector<HTMLButtonElement>('lc-textarea-focus-on-open-demo lc-button button')?.click();
  },
};
