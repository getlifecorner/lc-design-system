import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ToastOutletComponent } from './toast-outlet.component';
import { ToastService, type ToastPosition, type ToastVariant } from './toast.service';
import { ButtonComponent } from '../button/button.component';

const MESSAGES: Record<ToastVariant, string> = {
  success: 'Changes saved successfully.',
  info: 'A new version is available.',
  warning: 'Your session expires in 5 minutes.',
  error: 'Something went wrong. Please try again.',
};

/** Demo host: a few buttons that call `ToastService.show()` and one outlet. */
@Component({
  selector: 'lc-toast-outlet-demo',
  standalone: true,
  imports: [ToastOutletComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
      <lc-button variant="primary" (clicked)="show('success')">Success</lc-button>
      <lc-button variant="outline" (clicked)="show('info')">Info</lc-button>
      <lc-button variant="warning" (clicked)="show('warning')">Warning</lc-button>
      <lc-button variant="danger" (clicked)="show('error')">Error</lc-button>
      <lc-button variant="ghost" (clicked)="showMany()">Show 7 (max 5 stack)</lc-button>
      <lc-button variant="ghost" (clicked)="closeAll()">Close all</lc-button>
    </div>
    <lc-toast-outlet />
  `,
})
class ToastOutletDemoComponent {
  readonly position = input<ToastPosition>('top-right');
  readonly duration = input<number>(4000);

  private readonly toastService = inject(ToastService);
  private counter = 0;

  show(variant: ToastVariant): void {
    this.toastService.show({
      message: MESSAGES[variant],
      variant,
      position: this.position(),
      duration: this.duration(),
      action: variant === 'success' ? { label: 'Undo', onClick: () => undefined } : undefined,
    });
  }

  showMany(): void {
    for (let i = 1; i <= 7; i++) {
      this.toastService.show({
        message: `Notification ${++this.counter}`,
        variant: 'info',
        position: this.position(),
        duration: 0,
      });
    }
  }

  closeAll(): void {
    this.toastService.closeAll();
  }
}

/** 3.17 (request 021): the calls a page makes, German labels, one outlet with a German close label. */
@Component({
  selector: 'lc-toast-service-call-demo',
  standalone: true,
  imports: [ToastOutletComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
      <lc-button variant="primary" (clicked)="saved()">Speichern</lc-button>
      <lc-button variant="danger" (clicked)="failed()">Laden fehlgeschlagen</lc-button>
      <lc-button variant="outline" (clicked)="archived()">Mit Rückgängig</lc-button>
    </div>
    <lc-toast-outlet closeAriaLabel="Benachrichtigung schließen" />
  `,
})
class ToastServiceCallDemoComponent {
  private readonly toasts = inject(ToastService);

  saved(): void {
    this.toasts.show({ message: 'Änderungen gespeichert.', variant: 'success', duration: 3000 });
  }

  failed(): void {
    this.toasts.show({ message: 'USM konnte nicht geladen werden.', variant: 'error', duration: 0 });
  }

  archived(): void {
    this.toasts.show({
      message: 'Quelle archiviert.',
      variant: 'info',
      duration: 0,
      action: { label: 'Rückgängig', onClick: () => undefined },
    });
  }
}

const SERVICE_CALL_SNIPPET = `// app.component.html (the shell): once
<lc-toast-outlet closeAriaLabel="Benachrichtigung schließen" />

// a page
import { Component, inject } from '@angular/core';
import { ToastService } from '@lifecorner/angular-ui-kit/toast';

export class SourcesPage {
  private readonly toasts = inject(ToastService);

  saved(): void {
    this.toasts.show({ message: 'Änderungen gespeichert.', variant: 'success' });
  }

  failed(): void {
    // Errors stay until closed (WCAG 2.2.1).
    this.toasts.show({ message: 'USM konnte nicht geladen werden.', variant: 'error', duration: 0 });
  }

  archived(): void {
    const id = this.toasts.show({
      message: 'Quelle archiviert.',
      duration: 0,
      action: { label: 'Rückgängig', onClick: () => this.restore() },
    });
    // this.toasts.close(id) closes it from code; closeAll() closes every toast.
  }
}`;

interface DemoArgs {
  position: ToastPosition;
  duration: number;
}

/**
 * `<lc-toast-outlet />` renders the toasts of `ToastService`. Place it once in
 * the application shell; without it `ToastService.show()` shows nothing.
 * Toasts are stacked per position (at most 5 at a time — the oldest is dropped)
 * and announced from persistent live regions (polite, or assertive for
 * error/warning toasts).
 */
const meta: Meta<DemoArgs> = {
  title: 'Feedback/Toast Outlet',
  component: ToastOutletComponent,
  decorators: [moduleMetadata({ imports: [ToastOutletDemoComponent, ToastServiceCallDemoComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
How a page shows a toast (3.17). Checked against \`toast.service.ts\`, \`toast-outlet.component.*\` and \`toast.component.*\`.

**1. Setup.** Place \`<lc-toast-outlet />\` once in the application shell (import \`ToastOutletComponent\` from \`@lifecorner/angular-ui-kit/toast\`). Without it \`show()\` shows nothing. Its \`closeAriaLabel\` (default \`'Close notification'\`) names every close button; set it in German for a German app.

**2. Call.** \`inject(ToastService).show({ … })\` shows a toast and returns its id. \`close(id)\` closes one toast, \`closeAll()\` all of them. See the *Service Call* story for a page's code.

**3. Options (\`ToastConfig\`).**

| Option | Type | Default | Meaning |
|---|---|---|---|
| \`message\` | \`string\` | required | Plain text, the whole announcement |
| \`variant\` | \`'success' \\| 'error' \\| 'warning' \\| 'info'\` | \`'info'\` | Colour, icon and the live region's politeness |
| \`position\` | \`'top-left' \\| 'top-center' \\| 'top-right' \\| 'bottom-left' \\| 'bottom-center' \\| 'bottom-right'\` | \`'top-right'\` | Which stack it joins |
| \`duration\` | \`number\` (ms) | \`3000\` | Closes itself after this time; \`0\` stays until closed |
| \`showCloseButton\` | \`boolean\` | \`true\` | A close button named by the outlet's \`closeAriaLabel\` |
| \`action\` | \`{ label: string; onClick: () => void }\` | none | One text button; \`onClick\` runs, then the toast closes |

**4. Behaviour.** At most 5 toasts are shown in total; a sixth removes the oldest. The timers run only in the browser (none on the server). A toast never takes focus.

**5. Announcement.** Each position has two live regions that exist from the start, before any toast: \`aria-live="polite"\` for success and info, \`aria-live="assertive"\` for warning and error, both \`aria-atomic="false"\`. A new toast is read **once**, when it is inserted: its message, then the action label and the close button's name (the icons are hidden). Closing a toast is not announced, and a new toast doesn't repeat the older ones. A standalone \`<lc-toast>\` (\`announce\` true, outside the outlet) is its own \`role="status"\` (success, info) or \`role="alert"\` (warning, error).

**6. Guidance.** Use \`duration: 0\` for errors and for toasts with an action (WCAG 2.2.1: 3 s is too short to read and act). Keyboard users reach an action only by tabbing to the outlet, so offer the same action elsewhere on the page too. A lasting state (a failed load the user must fix) belongs in an \`lc-alert\` on the page, not in a toast.
        `,
      },
    },
  },
  args: { position: 'top-right', duration: 4000 },
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
      description: 'Position of the toasts shown by the demo buttons',
    },
    duration: { control: 'number', description: 'Auto-dismiss duration in ms (0 = sticky)' },
  },
  render: (args) => ({
    props: args,
    template: `<lc-toast-outlet-demo [position]="position" [duration]="duration" />`,
  }),
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Default: Story = {};

export const BottomCenter: Story = {
  args: { position: 'bottom-center' },
  parameters: {
    docs: { description: { story: 'Bottom stacks grow upwards — the newest toast sits nearest the edge.' } },
  },
};

export const Sticky: Story = {
  args: { duration: 0 },
  parameters: {
    docs: { description: { story: 'With `duration: 0` toasts stay until dismissed via the close button or action.' } },
  },
};

export const ServiceCall: Story = {
  name: 'Service Call',
  parameters: {
    docs: {
      description: {
        story:
          'What a page calls (3.17): „Speichern“ shows a success toast for the default 3000 ms (read politely), ' +
          '„Laden fehlgeschlagen“ an error that stays (`duration: 0`, read assertively), and „Mit Rückgängig“ an info toast with an action that stays. ' +
          'The outlet names every close button „Benachrichtigung schließen“. The code shows the shell and a page.',
      },
      source: { code: SERVICE_CALL_SNIPPET, language: 'typescript' },
    },
  },
  render: () => ({
    template: `<lc-toast-service-call-demo />`,
  }),
};
