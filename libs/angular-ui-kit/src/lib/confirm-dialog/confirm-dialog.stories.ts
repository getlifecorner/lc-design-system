import type { Meta, StoryObj } from '@storybook/angular';
import { ConfirmDialogComponent } from './confirm-dialog.component';

const meta: Meta<ConfirmDialogComponent> = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialogComponent,
  parameters: {
    docs: {
      description: {
        component: `
The ConfirmDialog provides a standardized confirmation pattern
built on top of \`<lc-modal>\`. Supports default, destructive, and
warning variants, plus optional text-matching confirmation.

Also available as an imperative service: \`ConfirmService.confirm()\`.

**3.3:** the dialog is named by its title; \`closeAriaLabel\` translates the close button;
\`[slot='preview']\` shows what the action affects; \`confirmLoading\` keeps the dialog open with a
busy confirm button; \`buttonSize="lg"\` gives 48.5 px buttons; \`placement="auto"\` makes it a
bottom sheet below 640 px.

**3.34:** \`returnFocusTo\` (and \`ConfirmOptions.returnFocusTo\`) gives the focus back to the trigger after
confirm, cancel, Escape and ×, also in WebKit, where a tap does not focus a button.
        `,
      },
      story: { inline: false, height: '120px' },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'warning'],
    },
    closeAriaLabel: {
      control: 'text',
      description: '3.3: accessible name of the close button in the header.',
      table: { defaultValue: { summary: 'Close modal' } },
    },
    confirmLoading: {
      control: 'boolean',
      description: '3.3: spinner on the confirm button; a second confirm is ignored while the action runs.',
      table: { defaultValue: { summary: 'false' } },
    },
    buttonSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '3.3: size of both buttons — `lg` (48.5 px) meets the 44 px touch target.',
      table: { defaultValue: { summary: 'md' } },
    },
    placement: {
      control: 'inline-radio',
      options: ['center', 'auto', 'sheet'],
      description: '3.3: passed to `lc-modal` — `auto` is a bottom sheet below 640 px, centred above.',
      table: { defaultValue: { summary: 'center' } },
    },
    returnFocusTo: {
      control: false,
      description:
        '3.34: passed to `lc-modal` — the element that gets the focus back after confirm, cancel, Escape and ×. Set it to the trigger (WebKit does not focus a tapped button). `ConfirmService.confirm()` takes the same option. `null` keeps the 3.33 behaviour.',
      table: { defaultValue: { summary: 'null' } },
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

export const Default: Story = {
  args: { open: false, title: 'Confirm Action', message: 'Are you sure you want to proceed?', variant: 'default' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="primary" (click)="isOpen = true">Open Confirm</lc-button>
      <lc-confirm-dialog
        [open]="isOpen"
        [variant]="variant"
        [title]="title"
        [message]="message"
        (confirmed)="isOpen = false"
        (cancelled)="isOpen = false"
      />`,
  }),
};

export const Destructive: Story = {
  args: { open: false, title: 'Delete Project?', message: 'This will permanently delete the project and all associated data. This action cannot be undone.', variant: 'destructive' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="danger" (click)="isOpen = true">Delete Project...</lc-button>
      <lc-confirm-dialog
        [open]="isOpen"
        variant="destructive"
        [title]="title"
        [message]="message"
        confirmLabel="Delete Forever"
        (confirmed)="isOpen = false"
        (cancelled)="isOpen = false"
      />`,
  }),
  parameters: {
    docs: { description: { story: 'Destructive variant with red confirm button and warning icon.' } },
  },
};

export const Warning: Story = {
  args: { open: false, title: 'Unsaved Changes', message: 'You have unsaved changes. Leaving this page will discard them.', variant: 'warning' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="outline" (click)="isOpen = true">Leave Page</lc-button>
      <lc-confirm-dialog
        [open]="isOpen"
        variant="warning"
        [title]="title"
        [message]="message"
        confirmLabel="Discard"
        cancelLabel="Stay"
        (confirmed)="isOpen = false"
        (cancelled)="isOpen = false"
      />`,
  }),
  parameters: {
    docs: { description: { story: 'Warning variant for potentially data-losing actions.' } },
  },
};

export const WithTextConfirmation: Story = {
  args: { open: false, title: 'Delete "my-project"?', message: 'This will permanently delete the project.', variant: 'destructive' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="danger" (click)="isOpen = true">Delete with confirmation...</lc-button>
      <lc-confirm-dialog
        [open]="isOpen"
        variant="destructive"
        [title]="title"
        [message]="message"
        confirmLabel="Delete"
        [requireText]="{ prompt: 'Type the project name to confirm', expected: 'my-project' }"
        (confirmed)="isOpen = false"
        (cancelled)="isOpen = false"
      />`,
  }),
  parameters: {
    docs: { description: { story: 'Double opt-out: confirm button disabled until user types the exact project name.' } },
  },
};

/** 3.3 (AC-5): a preview of what is removed, large buttons, a sheet on phones, a busy confirm. */
export const RealUse: Story = {
  name: 'Preview, large buttons, loading (3.3)',
  args: {
    open: false,
    title: 'Passkey entfernen?',
    message: 'Du meldest dich danach mit einem anderen Passkey an.',
    variant: 'destructive',
    closeAriaLabel: 'Schließen',
    buttonSize: 'lg',
    placement: 'auto',
  },
  render: (args) => ({
    props: { ...args, isOpen: false, busy: false },
    template: `
      <lc-button variant="primary" (click)="isOpen = true; busy = false">Open Confirm</lc-button>
      <lc-confirm-dialog
        [open]="isOpen"
        [variant]="variant"
        [title]="title"
        [message]="message"
        [closeAriaLabel]="closeAriaLabel"
        [buttonSize]="buttonSize"
        [placement]="placement"
        [confirmLoading]="busy"
        confirmLabel="Entfernen"
        cancelLabel="Abbrechen"
        (confirmed)="busy = true"
        (cancelled)="isOpen = false"
      >
        <p slot="preview" style="margin: 0; font-weight: 600;">iPhone · Safari · zuletzt heute 20:05</p>
      </lc-confirm-dialog>`,
  }),
};

/**
 * 3.34 (request 054, finance-intelligence monatsstand row 1): the focus goes
 * back to the trigger after „Löschen“, „Abbrechen“, Escape and ×.
 */
export const ReturnFocusTo: Story = {
  name: 'Focus return (3.34)',
  parameters: {
    docs: {
      description: {
        story:
          '3.34 (request 054, finance-intelligence monatsstand row 1): the trigger is passed as `returnFocusTo`, so after „Löschen“, „Abbrechen“, Escape or Schließen the focus is on „Fassung löschen“ again, also in WebKit, where a tap does not focus a button. The trigger is the `<lc-button>` host (`$event.currentTarget` of its click); the dialog hands the focus to the `<button>` inside it. A bottom sheet below 640 px (`placement="auto"`) with 48.5 px buttons.',
      },
      story: { inline: false, height: '360px' },
    },
  },
  render: () => ({
    props: { deleteOpen: false, deleteTrigger: null },
    template: `
      <lc-button lang="de" variant="danger" (click)="deleteTrigger = $any($event.currentTarget); deleteOpen = true">Fassung löschen</lc-button>
      <lc-confirm-dialog
        lang="de"
        [open]="deleteOpen"
        variant="destructive"
        title="Fassung löschen?"
        message="August 2026 · Fassung 1 wird für alle gelöscht."
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        closeAriaLabel="Schließen"
        buttonSize="lg"
        placement="auto"
        [returnFocusTo]="deleteTrigger"
        (confirmed)="deleteOpen = false"
        (cancelled)="deleteOpen = false"
      />`,
  }),
};

