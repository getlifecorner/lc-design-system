import type { Meta, StoryObj } from '@storybook/angular';
import { ToastComponent } from './toast.component';
import type { Toast } from './toast.service';

const meta: Meta<ToastComponent> = {
  title: 'Feedback/Toast',
  component: ToastComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Toast component shows brief, non-blocking notifications.
Toasts auto-dismiss after a duration and can be manually closed.

**Key Features:**
- 4 semantic variants (success, error, warning, info)
- Configurable position and duration
- Optional close button
- Stacks multiple toasts

**Showing a toast from a page:** call \`ToastService.show()\` and place one \`<lc-toast-outlet />\` in the shell; the options, the timing and the announcement are documented under *Feedback/Toast Outlet*.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ToastComponent>;

export const Success: Story = {
  args: {
    toast: { id: '1', message: 'Your changes have been saved successfully.', variant: 'success', position: 'top-right', duration: 5000, showCloseButton: true },
  },
};

export const Error: Story = {
  args: {
    toast: { id: '2', message: 'Failed to upload file. Please check your connection and try again.', variant: 'error', position: 'top-right', duration: 5000, showCloseButton: true },
  },
};

export const Warning: Story = {
  args: {
    toast: { id: '3', message: 'Your session will expire in 5 minutes. Save your work.', variant: 'warning', position: 'top-right', duration: 5000, showCloseButton: true },
  },
};

export const Info: Story = {
  args: {
    toast: { id: '4', message: 'A new version is available. Refresh to update.', variant: 'info', position: 'top-right', duration: 5000, showCloseButton: true },
  },
};

export const WithoutCloseButton: Story = {
  parameters: {
    docs: { description: { story: 'Toasts without close button rely on auto-dismiss.' } },
  },
  args: {
    toast: { id: '5', message: 'Message sent!', variant: 'success', position: 'top-right', duration: 3000, showCloseButton: false },
  },
};

const archived: Toast = {
  id: '6',
  message: 'Source archived.',
  variant: 'info',
  position: 'top-right',
  duration: 5000,
  showCloseButton: true,
  action: { label: 'Undo', onClick: () => undefined },
};

const savedDe: Toast = {
  id: '7',
  message: 'Benachrichtigungseinstellungen gespeichert.',
  variant: 'info',
  position: 'top-right',
  duration: 5000,
  showCloseButton: true,
  action: { label: 'Rückgängig', onClick: () => undefined },
};

export const WithAction: Story = {
  name: 'With Action',
  parameters: {
    docs: {
      description: {
        story:
          'An action and the close button are 44 × 44 px tap targets (3.19); the toast keeps its size, because negative margins ' +
          'take the extra height off the row. A long German compound („Benachrichtigungseinstellungen“) breaks inside the message, ' +
          'never under the action. `closeAriaLabel` translates the close button’s name.',
      },
    },
  },
  render: () => ({
    props: { archived, savedDe },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <lc-toast [toast]="archived"></lc-toast>
        <lc-toast lang="de" [toast]="savedDe" closeAriaLabel="Benachrichtigung schließen"></lc-toast>
      </div>`,
  }),
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: 'All toast variants stacked together for comparison.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; max-width: 380px;">
        <lc-toast [toast]="{ id: '1', message: 'Profile updated successfully.', variant: 'success', position: 'top-right', duration: 5000, showCloseButton: true }"></lc-toast>
        <lc-toast [toast]="{ id: '2', message: 'Unable to connect to server.', variant: 'error', position: 'top-right', duration: 5000, showCloseButton: true }"></lc-toast>
        <lc-toast [toast]="{ id: '3', message: 'Storage quota at 90%.', variant: 'warning', position: 'top-right', duration: 5000, showCloseButton: true }"></lc-toast>
        <lc-toast [toast]="{ id: '4', message: '3 new messages received.', variant: 'info', position: 'top-right', duration: 5000, showCloseButton: true }"></lc-toast>
      </div>`,
  }),
};
