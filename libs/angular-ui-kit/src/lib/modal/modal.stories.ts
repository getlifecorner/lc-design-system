import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal.component';

const meta: Meta<ModalComponent> = {
  title: 'Feedback/Modal',
  component: ModalComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Modal component displays content in a focused overlay dialog.
Use it for confirmations, forms, and important user interactions that require attention.

**Key Features:**
- 5 sizes (sm, md, lg, xl, full)
- Header, body, and footer slots
- Backdrop click to close
- Keyboard escape support
- Focus trapping for accessibility
- 3.3: \`placement="auto"\` — a bottom sheet below 640 px (full width, top corners rounded,
  clear of the safe area, at most 90 dvh), centred above; \`placement="sheet"\` always a sheet.
  Header and footer stay visible while the body scrolls; the close button is a 44 px target.
- 3.34: \`returnFocusTo\` names the element that gets the focus back after the dialog closed (the trigger),
  on every close path; WebKit does not focus a tapped button, so without it the focus falls to \`body\`.

Click the **Open Modal** button in each story to see the modal in action.
        `,
      },
      story: { inline: false, height: '120px' },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal width',
      table: { defaultValue: { summary: 'md' } },
    },
    open: { control: 'boolean', description: 'Controls visibility' },
    placement: {
      control: 'inline-radio',
      options: ['center', 'auto', 'sheet'],
      description:
        '3.3: `center` (3.2); `auto` — a bottom sheet below 640 px viewport width, centred above; `sheet` — always a bottom sheet. The sheet spans the width, rounds its top corners, keeps clear of `env(safe-area-inset-bottom)` and is at most 90 dvh high; `full` size ignores it.',
      table: { defaultValue: { summary: 'center' } },
    },
    returnFocusTo: {
      control: false,
      description:
        '3.34: the element that gets the focus back after the dialog closed, instead of the one that had it at open. Set it to the trigger: WebKit (Safari, every iOS browser) does not focus a tapped button, so the captured element is `body`. Applied after the render that removes the dialog, on every close (×, Escape, backdrop, `open` false). An `<lc-button>` host hands the focus to its `<button>`. Ignored when the element is gone; `null` keeps the 3.33 behaviour.',
      table: { defaultValue: { summary: 'null' } },
    },
  },
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  args: { open: false, size: 'md' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="primary" (click)="isOpen = true">Open Modal</lc-button>
      <lc-modal [open]="isOpen" (openChange)="isOpen = $event" [size]="size">
        <div slot="header"><h2>Confirm Action</h2></div>
        <div slot="body">
          <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">
            Are you sure you want to proceed? This action will update your billing settings and cannot be undone.
          </p>
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="outline" (click)="isOpen = false">Cancel</lc-button>
          <lc-button variant="primary" (click)="isOpen = false">Confirm</lc-button>
        </div>
      </lc-modal>`,
  }),
};

export const Small: Story = {
  parameters: {
    docs: { description: { story: 'Small modals for quick confirmations.' } },
  },
  args: { open: false, size: 'sm' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="outline" (click)="isOpen = true">Open Small Modal</lc-button>
      <lc-modal [open]="isOpen" (openChange)="isOpen = $event" [size]="size">
        <div slot="header"><h2>Delete Item?</h2></div>
        <div slot="body">
          <p style="margin: 0; color: var(--color-text-secondary);">This item will be permanently removed.</p>
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="ghost" size="sm" (click)="isOpen = false">Keep</lc-button>
          <lc-button variant="danger" size="sm" (click)="isOpen = false">Delete</lc-button>
        </div>
      </lc-modal>`,
  }),
};

export const Large: Story = {
  parameters: {
    docs: { description: { story: 'Large modals for forms and detailed content.' } },
  },
  args: { open: false, size: 'lg' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="outline" (click)="isOpen = true">Open Large Modal</lc-button>
      <lc-modal [open]="isOpen" (openChange)="isOpen = $event" [size]="size">
        <div slot="header"><h2>Edit Profile</h2></div>
        <div slot="body">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <lc-input label="First Name" placeholder="John"></lc-input>
              <lc-input label="Last Name" placeholder="Doe"></lc-input>
            </div>
            <lc-input label="Email" type="email" placeholder="john@example.com" iconBefore="envelope"></lc-input>
            <lc-input label="Job Title" placeholder="Software Engineer"></lc-input>
          </div>
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="ghost" (click)="isOpen = false">Cancel</lc-button>
          <lc-button variant="primary" (click)="isOpen = false">Save Changes</lc-button>
        </div>
      </lc-modal>`,
  }),
};

export const DestructiveConfirmation: Story = {
  parameters: {
    docs: { description: { story: 'Pattern for confirming destructive actions with a danger button.' } },
  },
  args: { open: false, size: 'sm' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="danger" (click)="isOpen = true">Delete Account...</lc-button>
      <lc-modal [open]="isOpen" (openChange)="isOpen = $event" [size]="size">
        <div slot="header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <lc-icon name="exclamation-triangle" size="md" color="var(--color-error-default)" [decorative]="true"></lc-icon>
            <h2 style="color: #991b1b;">Delete Account</h2>
          </div>
        </div>
        <div slot="body">
          <p style="margin: 0 0 12px; color: var(--color-text-secondary); line-height: 1.5;">
            This will permanently delete your account and all associated data including:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: var(--color-text-secondary); font-size: 14px; line-height: 1.8;">
            <li>All projects and tasks</li>
            <li>Team memberships</li>
            <li>Billing history</li>
          </ul>
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="outline" (click)="isOpen = false">Cancel</lc-button>
          <lc-button variant="danger" (click)="isOpen = false">Delete Forever</lc-button>
        </div>
      </lc-modal>`,
  }),
};

/**
 * 3.3 (AC-4): a bottom sheet on phones, centred from 640 px. With a long body
 * the header and the footer stay in place while the body scrolls.
 */
export const BottomSheetOnPhones: Story = {
  name: 'Bottom sheet on phones (3.3)',
  args: { open: false, size: 'sm', placement: 'auto' },
  render: (args) => ({
    props: { ...args, isOpen: false },
    template: `
      <lc-button variant="primary" (click)="isOpen = true">Open Modal</lc-button>
      <lc-modal [open]="isOpen" (openChange)="isOpen = $event" [size]="size" [placement]="placement"
        ariaLabelledBy="sheet-title" closeAriaLabel="Schließen">
        <div slot="header"><h2 id="sheet-title">Passkey entfernen?</h2></div>
        <div slot="body">
          @for (line of [1, 2, 3, 4, 5, 6, 7, 8]; track line) {
            <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">
              Zeile {{ line }}: Danach meldest du dich auf diesem Gerät mit einem anderen Passkey an.
            </p>
          }
        </div>
        <div slot="footer" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <lc-button variant="danger" size="lg" [fullWidth]="true" (click)="isOpen = false">Entfernen</lc-button>
          <lc-button variant="outline" size="lg" [fullWidth]="true" (click)="isOpen = false">Abbrechen</lc-button>
        </div>
      </lc-modal>`,
  }),
};

/**
 * 3.34 (request 054, finance-intelligence monatsstand row 1): the focus goes
 * back to the trigger, also in WebKit, where a tap doesn't focus a button.
 */
export const ReturnFocusTo: Story = {
  name: 'Focus return (3.34)',
  parameters: {
    docs: {
      description: {
        story:
          '3.34 (request 054, finance-intelligence monatsstand row 1): each trigger is passed as `returnFocusTo`, so after Schließen, Escape, the backdrop, „Abbrechen“, „Speichern“ or „Übernehmen“ the focus is on the trigger\'s button again. Without it, a WebKit tap leaves `body` focused at open, and the focus falls to `body` on close. The trigger is the `<lc-button>` host (`$event.currentTarget` of its click); the modal hands the focus to the `<button>` inside it. „Fassung umbenennen“ opens a centred dialog, „Monatsstand wählen“ a bottom sheet below 640 px (`placement="auto"`).',
      },
      story: { inline: false, height: '360px' },
    },
  },
  render: () => ({
    props: { renameOpen: false, chooseOpen: false, renameTrigger: null, chooseTrigger: null },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 8px;">
        <lc-button variant="outline" (click)="renameTrigger = $any($event.currentTarget); renameOpen = true">Fassung umbenennen</lc-button>
        <lc-button variant="primary" (click)="chooseTrigger = $any($event.currentTarget); chooseOpen = true">Monatsstand wählen</lc-button>
      </div>
      <lc-modal lang="de" [open]="renameOpen" (openChange)="renameOpen = $event" size="sm" [returnFocusTo]="renameTrigger"
        ariaLabelledBy="rename-title" closeAriaLabel="Schließen">
        <div slot="header"><h2 id="rename-title">Fassung umbenennen</h2></div>
        <div slot="body">
          <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">August 2026 · Fassung 1</p>
        </div>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <lc-button variant="ghost" (click)="renameOpen = false">Abbrechen</lc-button>
          <lc-button variant="primary" (click)="renameOpen = false">Speichern</lc-button>
        </div>
      </lc-modal>
      <lc-modal lang="de" [open]="chooseOpen" (openChange)="chooseOpen = $event" placement="auto" [returnFocusTo]="chooseTrigger"
        ariaLabelledBy="choose-title" closeAriaLabel="Schließen">
        <div slot="header"><h2 id="choose-title">Monatsstand wählen</h2></div>
        <div slot="body">
          <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">September 2026 · Fassung 1</p>
        </div>
        <div slot="footer" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <lc-button variant="primary" size="lg" [fullWidth]="true" (click)="chooseOpen = false">Übernehmen</lc-button>
          <lc-button variant="outline" size="lg" [fullWidth]="true" (click)="chooseOpen = false">Abbrechen</lc-button>
        </div>
      </lc-modal>`,
  }),
};

