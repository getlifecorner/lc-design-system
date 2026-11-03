import type { Meta, StoryObj } from '@storybook/angular';
import { NotificationCenterComponent, Notification } from './notification-center.component';

const now = new Date();
const ago = (mins: number) => new Date(now.getTime() - mins * 60000);

const sampleNotifications: Notification[] = [
  {
    id: '1', title: 'Deployment successful', message: 'v2.3.1 has been deployed to production.',
    type: 'success', priority: 'normal', timestamp: ago(3), read: false, category: 'CI/CD',
  },
  {
    id: '2', title: 'Build failed', message: 'Pipeline #1847 failed at test stage. 3 tests failed.',
    type: 'error', priority: 'urgent', timestamp: ago(12), read: false, category: 'CI/CD',
    actionLabel: 'View logs',
  },
  {
    id: '3', title: 'New comment on PR #142',
    message: 'Alice: "Looks good, just one small suggestion on the validation logic."',
    type: 'info', priority: 'normal', timestamp: ago(45), read: false, category: 'Code Review',
    actionLabel: 'Reply',
  },
  {
    id: '4', title: 'Disk usage warning',
    message: 'Server db-primary is using 87% of disk space.',
    type: 'warning', priority: 'high', timestamp: ago(120), read: true, category: 'Infrastructure',
    actionLabel: 'Check',
  },
  {
    id: '5', title: 'Security scan complete',
    message: 'No vulnerabilities found in the latest scan.',
    type: 'success', priority: 'low', timestamp: ago(240), read: true, category: 'Security',
  },
  {
    id: '6', title: 'New team member joined',
    message: 'Bob has been added to the development team.',
    type: 'info', priority: 'low', timestamp: ago(1440), read: true, category: 'Team',
  },
  {
    id: '7', title: 'Scheduled maintenance',
    message: 'Database maintenance window: Saturday 02:00-04:00 UTC.',
    type: 'warning', priority: 'normal', timestamp: ago(2880), read: true, category: 'Infrastructure',
  },
];

const meta: Meta<NotificationCenterComponent> = {
  title: 'Feedback/Notification Center',
  component: NotificationCenterComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Notification center for displaying and managing a list of notifications.

**Key Features:**
- Type filters (info, success, warning, error) with count badges
- Full-text search across title, message, and category
- Priority sorting (urgent > high > normal > low, then by timestamp)
- Unread badge with count indicator
- Category grouping (optional)
- Relative timestamps (e.g. "5m ago", "2h ago")
- Per-notification action buttons
- Dismiss individual or clear all notifications
- Mark all as read
- \`lc-icon\` type indicators with semantic colours
- Compact mode with configurable max height
- Dark mode compatible
        `,
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'Header title text', table: { defaultValue: { summary: 'Notifications' } } },
    showFilter: { control: 'boolean', description: 'Show type filter pills', table: { defaultValue: { summary: 'true' } } },
    showTimestamp: { control: 'boolean', description: 'Show relative timestamp on each notification', table: { defaultValue: { summary: 'true' } } },
    showPriority: { control: 'boolean', description: 'Show priority badge on non-normal notifications', table: { defaultValue: { summary: 'false' } } },
    groupByCategory: { control: 'boolean', description: 'Group notifications under category headers', table: { defaultValue: { summary: 'false' } } },
    emptyMessage: { control: 'text', description: 'Message shown when there are no notifications', table: { defaultValue: { summary: 'No notifications' } } },
    maxHeight: { control: 'text', description: 'Max height of the notification list (CSS value)', table: { defaultValue: { summary: '480px' } } },
  },
};
export default meta;
type Story = StoryObj<NotificationCenterComponent>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: 'Mixed notifications sorted by priority and timestamp, with unread badge and action buttons.' } },
  },
  args: {
    notifications: sampleNotifications,
    title: 'Notifications',
  },
};

export const WithPriority: Story = {
  parameters: {
    docs: { description: { story: 'Priority badges (Urgent, High, Low) displayed next to notification titles.' } },
  },
  args: {
    notifications: sampleNotifications,
    showPriority: true,
  },
};

export const GroupedByCategory: Story = {
  parameters: {
    docs: { description: { story: 'Notifications grouped under category headers (CI/CD, Code Review, Infrastructure, etc.).' } },
  },
  args: {
    notifications: sampleNotifications,
    groupByCategory: true,
  },
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Empty state with a bell icon and custom message when no notifications exist.' } },
  },
  args: {
    notifications: [],
    emptyMessage: 'You\'re all caught up!',
  },
};

export const AllRead: Story = {
  parameters: {
    docs: { description: { story: 'All notifications are read — no unread badge and no “Mark all read” button.' } },
  },
  args: {
    notifications: sampleNotifications.map(n => ({ ...n, read: true })),
  },
};

export const ErrorsOnly: Story = {
  parameters: {
    docs: { description: { story: 'Only error-type notifications — useful for alerting dashboards.' } },
  },
  args: {
    notifications: [
      {
        id: '1', title: 'Build failed', message: 'Pipeline error in test stage.',
        type: 'error', priority: 'urgent', timestamp: ago(5), read: false,
        actionLabel: 'View logs',
      },
      {
        id: '2', title: 'API timeout', message: 'Payment service is not responding.',
        type: 'error', priority: 'high', timestamp: ago(15), read: false,
        actionLabel: 'Check status',
      },
    ],
  },
};

export const PriorityOnUnreadRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Priority and category chips on unread rows, with German labels. Since 3.22.4 a chip on an unread row paints its tint over an opaque `--color-surface`, so the teal row does not show through: the "Hoch" chip reads 5.55:1 in dark (was 3.67) and 5.52:1 in light, the same on every row of the panel gradient. Since 3.23.1 (F-8) the message and time of an unread row use `--color-text-secondary`: 7.05:1 in dark (was 4.23 with the tertiary ink) and 6.49:1 in light. Every built-in text is German.',
      },
    },
  },
  args: {
    notifications: [
      {
        id: 'p1', title: 'Deployment fehlgeschlagen', message: 'Pipeline #2210 ist in der Teststufe abgebrochen.',
        type: 'error', priority: 'urgent', timestamp: ago(5), read: false, category: 'CI/CD',
      },
      {
        id: 'p2', title: 'Speicherplatz knapp', message: 'Server db-primary nutzt 91 % des Speichers.',
        type: 'warning', priority: 'high', timestamp: ago(20), read: false, category: 'Infrastruktur',
      },
      {
        id: 'p3', title: 'Zertifikat läuft bald ab', message: 'Das TLS-Zertifikat für api.example.com läuft in 7 Tagen ab.',
        type: 'warning', priority: 'high', timestamp: ago(50), read: false, category: 'Sicherheit',
      },
      {
        id: 'p4', title: 'Rechnung überfällig', message: 'Die Rechnung RE-1042 ist seit 3 Tagen fällig.',
        type: 'warning', priority: 'high', timestamp: ago(180), read: true, category: 'Abrechnung',
      },
      {
        id: 'p5', title: 'Neuer Kommentar zu PR #142', message: 'Alice: „Sieht gut aus, nur ein kleiner Vorschlag zur Validierung.“',
        type: 'info', priority: 'normal', timestamp: ago(300), read: true, category: 'Code-Review',
      },
      {
        id: 'p6', title: 'Neues Teammitglied', message: 'Bob wurde dem Entwicklungsteam hinzugefügt.',
        type: 'info', priority: 'low', timestamp: ago(1500), read: false, category: 'Team',
      },
    ],
    showPriority: true,
    title: 'Benachrichtigungen',
    highPriorityLabel: 'Hoch',
    urgentPriorityLabel: 'Dringend',
    lowPriorityLabel: 'Niedrig',
    markAllReadLabel: 'Alle als gelesen markieren',
    clearAllLabel: 'Alle löschen',
    searchPlaceholder: 'Benachrichtigungen durchsuchen…',
    filterAllLabel: 'Alle',
    filterErrorLabel: 'Fehler',
    filterWarningLabel: 'Warnung',
    filterSuccessLabel: 'Erfolg',
    filterInfoLabel: 'Info',
    dismissAriaLabel: 'Benachrichtigung schließen:',
    otherCategoryLabel: 'Sonstige',
    justNowLabel: 'Gerade eben',
    emptyMessage: 'Keine Benachrichtigungen',
    minutesAgoLabel: 'vor {n} Min.',
    hoursAgoLabel: 'vor {n} Std.',
    daysAgoLabel: 'vor {n} T.',
  },
};

export const Compact: Story = {
  parameters: {
    docs: { description: { story: 'Compact mode with limited height and no filter pills — ideal for sidebar widgets.' } },
  },
  args: {
    notifications: sampleNotifications.slice(0, 3),
    showFilter: false,
    maxHeight: '300px',
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the second filter chip is focused as Tab would focus it (in the story view). Filter chips and the header actions ("Mark all read") show the kit ring: 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 7.57:1 dark on the panel), `Highlight` in forced colours; the pressed chip keeps its forced-colours outline unless focused. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  args: {
    notifications: sampleNotifications,
    title: 'Notifications',
    maxHeight: '360px',
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelectorAll<HTMLElement>('.lc-nc__filter')[1]?.focus({ preventScroll: true });
  },
};
