import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { ListComponent, type ListLinkClickEvent } from './list.component';
import { ListItemTemplateDirective } from './list-item-template.directive';
import { AvatarComponent } from '../avatar/avatar.component';
import { MoneyComponent } from '../money/money.component';

/**
 * Lists display structured item collections with rich content support.
 * Each item can have an avatar or icon, label with subtitle and description,
 * trailing badges, metadata, and action buttons. Supports card and default
 * variants, size options, selected state and optional dividers.
 */
const meta: Meta<ListComponent> = {
  title: 'Data Display/List',
  component: ListComponent,
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of list items',
    },
    variant: {
      control: 'select',
      options: ['default', 'card'],
      description: 'Visual style — default is flat, card adds background and shadow',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of list items — sm is compact, lg is spacious',
    },
    showDividers: { description: 'Show separator lines between items' },
    clickable: {
      control: 'boolean',
      description:
        'Render rows as focusable buttons (Enter / Space emit itemClick). Set this whenever itemClick is handled. 3.3: only clickable rows get the pointer cursor and the hover background.',
    },
    clampDescription: {
      control: 'boolean',
      description: '3.3: clamp each description to two lines (3.2). `false` shows reading text in full.',
      table: { defaultValue: { summary: 'true' } },
    },
    actionVariant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'warning', 'info'],
      description: '3.3: variant of the built-in row action (`ListItem.action`).',
      table: { defaultValue: { summary: 'ghost' } },
    },
    actionSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: '3.3: size of the built-in row action — `xs` (3.2, about 25 px) … `lg` (48.5 px, the 44 px touch target).',
      table: { defaultValue: { summary: 'xs' } },
    },
    linkClick: {
      description:
        '3.16: a plain left click on an `href` row ({ item, event }). Call `event.preventDefault()` and navigate with the router for in-app links; modified and middle clicks do not emit.',
      table: { defaultValue: { summary: '—' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
List component for displaying structured item collections.

**Key Features:**
- Vertical and horizontal layout orientations
- Variant styles (default, card)
- Three sizes (sm, md, lg)
- Optional dividers between items
- Avatar support (image URL or initials)
- Subtitle and description lines
- Trailing badges with color variants
- Metadata text (dates, sizes, counts)
- Action buttons with click events; 3.3: \`actionVariant\`, \`actionSize\` and a per-row
  \`ListItem.actionAriaLabel\` when the visible label repeats on every row
- Long unbroken texts wrap (3.3); pointer and hover only on \`clickable\` rows (3.3)
- Selected/highlighted state
- Accessible with ARIA list role; \`clickable\` rows are keyboard-operable
- Link rows (3.16): \`ListItem.href\` renders the row as a real \`<a href>\` (middle click, context menu, at least 44 px);
  \`linkClick\` reports plain clicks for router navigation. A disabled item stays a plain row, and an \`href\` row
  renders no \`action\` (nothing interactive inside a link, also not in an \`lcListItem\` template)
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ListComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Dashboard', icon: 'home' },
      { label: 'Projects', icon: 'folder' },
      { label: 'Team Members', icon: 'users' },
      { label: 'Settings', icon: 'cog-6-tooth' },
    ],
    variant: 'default',
    showDividers: true,
  },
};

export const CardVariant: Story = {
  name: 'Card Variant',
  args: {
    items: [
      { label: 'Quarterly Report', icon: 'document' },
      { label: 'Team Meeting Notes', icon: 'document' },
      { label: 'Product Roadmap', icon: 'document' },
    ],
    variant: 'card',
    showDividers: true,
  },
};

export const WithActions: Story = {
  name: 'With Action Buttons',
  args: {
    items: [
      { label: 'main-branch.yml', icon: 'document', action: 'View' },
      { label: 'deploy-staging.yml', icon: 'document', action: 'View' },
      { label: 'nightly-tests.yml', icon: 'document', action: 'View' },
    ],
    variant: 'default',
    showDividers: true,
  },
};

export const Horizontal: Story = {
  args: {
    items: [
      { label: 'Overview', icon: 'home' },
      { label: 'Analytics', icon: 'chart-bar' },
      { label: 'Reports', icon: 'document' },
      { label: 'Settings', icon: 'cog-6-tooth' },
    ],
    orientation: 'horizontal',
    variant: 'default',
  },
};

export const WithDisabled: Story = {
  name: 'With Disabled Items',
  args: {
    items: [
      { label: 'Active Feature', icon: 'check-circle' },
      { label: 'Beta Feature', icon: 'flask' },
      { label: 'Coming Soon', icon: 'lock-closed', disabled: true },
      { label: 'Deprecated', icon: 'x-circle', disabled: true },
    ],
    variant: 'default',
    showDividers: true,
  },
};

export const SettingsMenu: Story = {
  name: 'Settings Menu (Composition)',
  args: {
    items: [
      { label: 'General', icon: 'cog-6-tooth', action: '›' },
      { label: 'Notifications', icon: 'bell', action: '›' },
      { label: 'Privacy & Security', icon: 'shield-check', action: '›' },
      { label: 'Billing', icon: 'credit-card', action: '›' },
      { label: 'Integrations', icon: 'puzzle-piece', action: '›' },
      { label: 'Delete Account', icon: 'trash' },
    ],
    variant: 'card',
    showDividers: true,
  },
};

export const WithSubtitles: Story = {
  name: 'With Subtitles',
  args: {
    items: [
      { label: 'Dashboard', subtitle: 'Overview of your projects', icon: 'home' },
      { label: 'Analytics', subtitle: 'Performance metrics & insights', icon: 'chart-bar' },
      { label: 'Team', subtitle: '12 members', icon: 'users' },
      { label: 'Settings', subtitle: 'Preferences & configuration', icon: 'cog-6-tooth' },
    ],
    showDividers: true,
  },
};

export const WithAvatars: Story = {
  name: 'With Avatars',
  args: {
    items: [
      { label: 'Anna Schmidt', subtitle: 'Product Designer', avatar: 'AS' },
      { label: 'Ben Weber', subtitle: 'Frontend Engineer', avatar: 'BW' },
      { label: 'Clara Müller', subtitle: 'Project Manager', avatar: 'CM' },
      { label: 'David Klein', subtitle: 'Backend Engineer', avatar: 'DK' },
    ],
    showDividers: true,
  },
};

export const WithBadges: Story = {
  name: 'With Badges',
  args: {
    items: [
      { label: 'Inbox', icon: 'inbox', badge: '24', badgeVariant: 'primary' },
      { label: 'Drafts', icon: 'document', badge: '3', badgeVariant: 'default' },
      { label: 'Sent', icon: 'paper-airplane', badge: '142', badgeVariant: 'success' },
      { label: 'Spam', icon: 'shield-exclamation', badge: '7', badgeVariant: 'error' },
    ],
    showDividers: true,
  },
};

export const WithMetadata: Story = {
  name: 'With Metadata',
  args: {
    items: [
      { label: 'quarterly-report.pdf', icon: 'document', metadata: '2.4 MB · Mar 15' },
      { label: 'team-photo.jpg', icon: 'photo', metadata: '4.1 MB · Mar 12' },
      { label: 'presentation.pptx', icon: 'presentation-chart-bar', metadata: '8.7 MB · Mar 10' },
      { label: 'notes.md', icon: 'document-text', metadata: '12 KB · Mar 8' },
    ],
    showDividers: true,
  },
};

export const RichItems: Story = {
  name: 'Rich Items',
  args: {
    items: [
      {
        label: 'Design System v2.0',
        subtitle: 'Component library refresh',
        description: 'Update all components to the new design tokens and add dark mode support.',
        avatar: 'DS',
        badge: 'In Progress',
        badgeVariant: 'warning' as const,
        metadata: 'Due Apr 30',
      },
      {
        label: 'API Integration',
        subtitle: 'Backend connectivity',
        description: 'Connect the frontend to the new REST API endpoints with proper error handling.',
        avatar: 'AI',
        badge: 'Done',
        badgeVariant: 'success' as const,
        metadata: 'Completed',
      },
      {
        label: 'User Testing',
        subtitle: 'UX validation',
        description: 'Conduct usability tests with 10 participants across three user personas.',
        avatar: 'UT',
        badge: 'Planned',
        badgeVariant: 'primary' as const,
        metadata: 'May 15',
      },
    ],
    showDividers: true,
    size: 'lg',
  },
};

export const ContactList: Story = {
  name: 'Contact List',
  args: {
    items: [
      {
        label: 'Emma Johnson',
        subtitle: 'emma.johnson@example.com',
        avatar: 'EJ',
        metadata: 'Online',
        action: 'Message',
      },
      {
        label: 'Liam Brown',
        subtitle: 'liam.brown@example.com',
        avatar: 'LB',
        metadata: 'Away',
        action: 'Message',
      },
      {
        label: 'Sophie Davis',
        subtitle: 'sophie.davis@example.com',
        avatar: 'SD',
        metadata: 'Offline',
        action: 'Message',
      },
    ],
    showDividers: true,
  },
};

export const NotificationList: Story = {
  name: 'Notification List',
  args: {
    items: [
      {
        label: 'New comment on your post',
        subtitle: 'Anna replied to your design review',
        icon: 'chat-bubble-left',
        badge: 'New',
        badgeVariant: 'primary' as const,
        metadata: '2 min ago',
        selected: true,
      },
      {
        label: 'Build succeeded',
        subtitle: 'Pipeline #1247 completed successfully',
        icon: 'check-circle',
        badge: 'Success',
        badgeVariant: 'success' as const,
        metadata: '15 min ago',
      },
      {
        label: 'Deployment failed',
        subtitle: 'Staging environment deployment error',
        icon: 'exclamation-triangle',
        badge: 'Error',
        badgeVariant: 'error' as const,
        metadata: '1 hour ago',
      },
    ],
    showDividers: true,
  },
};

export const SmallSize: Story = {
  name: 'Small Size',
  args: {
    items: [
      { label: 'Option A', subtitle: 'First option', icon: 'check' },
      { label: 'Option B', subtitle: 'Second option', icon: 'check' },
      { label: 'Option C', subtitle: 'Third option', icon: 'check', selected: true },
    ],
    size: 'sm',
    showDividers: true,
  },
};

export const LargeSize: Story = {
  name: 'Large Size',
  args: {
    items: [
      { label: 'Premium Plan', subtitle: '$29/month', description: 'Unlimited projects, priority support, and advanced analytics.', icon: 'star', badge: 'Popular', badgeVariant: 'primary' as const },
      { label: 'Business Plan', subtitle: '$79/month', description: 'Everything in Premium plus SSO, audit logs, and SLA.', icon: 'building-office', badge: 'Best Value', badgeVariant: 'success' as const },
      { label: 'Enterprise', subtitle: 'Custom pricing', description: 'Dedicated infrastructure, custom integrations, and 24/7 support.', icon: 'globe-alt', action: 'Contact Sales' },
    ],
    size: 'lg',
    showDividers: true,
  },
};

/**
 * Members with their member colour (LK-7): `avatarColor` (`member-1` … `member-6`)
 * gives the initials avatar the person's colour with white initials, as `lc-avatar`'s `color`.
 */
export const MemberAvatars: Story = {
  name: 'Member Avatars (avatarColor)',
  args: {
    items: [
      {
        label: 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
        subtitle: 'Mitglied seit 12. Okt. 2026',
        avatar: 'JA',
        avatarColor: 'member-1' as const,
        badge: 'Du',
        badgeVariant: 'primary' as const,
      },
      { label: 'Tom Ek', subtitle: 'Mitglied seit 12. Okt. 2026', avatar: 'TE', avatarColor: 'member-2' as const },
      { label: 'Lena Morgen', subtitle: 'Wartet auf Bestätigung', avatar: 'LM', avatarColor: 'member-3' as const },
    ],
    size: 'lg',
    showDividers: true,
  },
};

/** 3.3 (AC-1): 48.5 px outline actions with a name per row („iPhone · Safari entfernen“). */
export const RowActionsWithNames: Story = {
  name: 'Row actions with names (3.3)',
  args: {
    items: [
      { id: 'a', label: 'iPhone · Safari', subtitle: 'Zuletzt heute, 20:05', icon: 'device-mobile', action: 'Entfernen', actionAriaLabel: 'iPhone · Safari entfernen' },
      { id: 'b', label: 'Windows · Edge', subtitle: 'Zuletzt gestern', icon: 'device-desktop', action: 'Entfernen', actionAriaLabel: 'Windows · Edge entfernen' },
    ],
    actionVariant: 'outline',
    actionSize: 'lg',
    showDividers: true,
  },
};

// 3.16 (TD-4, request 022): link rows.
const accountItems = [
  { id: 'giro', label: 'Girokonto', subtitle: 'Sparkasse München · DE12 •••• 4711', bank: 'Sparkasse München', balance: 245017, href: '/finanzen/konten/giro' },
  { id: 'joint', label: 'Gemeinschaftskonto Haushalt', subtitle: 'ING · DE89 •••• 0815', bank: 'ING Bank', balance: -4217, href: '/finanzen/konten/haushalt' },
  {
    id: 'savings',
    label: 'Tagesgeld',
    subtitle: 'DKB · Verbindung abgelaufen',
    bank: 'Deutsche Kreditbank',
    balance: 1000000,
    href: '/finanzen/konten/tagesgeld',
    disabled: true,
  },
];

export const LinkRows: Story = {
  name: 'Link Rows',
  decorators: [moduleMetadata({ imports: [ListItemTemplateDirective, AvatarComponent, MoneyComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          'Accounts as link rows: each row is an `<a href>` with an `lcListItem` template (avatar, name, `lc-money`). ' +
          'The disabled account (expired connection) stays a plain row without a link.',
      },
    },
  },
  args: { items: accountItems, showDividers: true, linkClick: fn() },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="max-width: 480px;">
        <lc-list [items]="items" [showDividers]="showDividers" (linkClick)="linkClick($event)">
          <ng-template lcListItem let-item>
            <lc-avatar [name]="item.bank" size="sm" [decorative]="true" />
            <span style="display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; overflow-wrap: anywhere;">
              <span style="font-weight: var(--font-weight-medium); color: var(--color-text-primary);">{{ item.label }}</span>
              <span style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">{{ item.subtitle }}</span>
            </span>
            <span style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">
              <lc-money [amountMinor]="item.balance" currency="EUR" locale="de-DE" />
            </span>
          </ng-template>
        </lc-list>
      </div>`,
  }),
};

export const LinkRowsSmall: Story = {
  name: 'Link Rows Small',
  parameters: {
    docs: {
      description: {
        story: 'The sources line of the Today page: `sm` link rows with subtitles and a badge, each at least 44 px high.',
      },
    },
  },
  args: {
    items: [
      { id: 'bank', label: 'Banken', subtitle: '2 Verbindungen · vor 5 Min. aktualisiert', icon: 'building-bank', href: '/quellen/banken' },
      {
        id: 'health',
        label: 'Gesundheitsbuchungen',
        subtitle: 'Nicht mit dem Haushalt geteilt',
        icon: 'shield-lock',
        badge: 'nur für dich',
        href: '/quellen/gesundheit',
      },
      { id: 'wallet', label: 'Haushaltskasse', subtitle: 'Manuell gepflegt', icon: 'wallet', href: '/quellen/haushaltskasse' },
    ],
    size: 'sm',
    showDividers: true,
    linkClick: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="max-width: 480px;">
        <lc-list [items]="items" [size]="size" [showDividers]="showDividers" (linkClick)="linkClick($event)" />
      </div>`,
  }),
};

export const LinkRowsWithRouter: Story = {
  name: 'Link Rows with the Router',
  parameters: {
    docs: {
      description: {
        story: `
\`linkClick\` reports a plain left click on a link row; modified and middle clicks open the \`href\` as usual.
For in-app links prevent the browser navigation and use the router:

\`\`\`html
<lc-list [items]="accounts" (linkClick)="openAccount($event)" />
\`\`\`

\`\`\`ts
openAccount({ item, event }: ListLinkClickEvent) {
  event.preventDefault();
  this.router.navigateByUrl(item.href!);
}
\`\`\`

Here the handler logs the link and prevents the navigation.
        `,
      },
    },
  },
  args: {
    items: [
      { id: 'giro', label: 'Girokonto', subtitle: 'Sparkasse München', icon: 'building-bank', href: '/finanzen/konten/giro' },
      { id: 'joint', label: 'Gemeinschaftskonto Haushalt', subtitle: 'ING', icon: 'building-bank', href: '/finanzen/konten/haushalt' },
    ],
    showDividers: true,
    linkClick: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      lastLink: '–',
      openAccount(this: { lastLink: string; linkClick: (e: ListLinkClickEvent) => void }, e: ListLinkClickEvent) {
        e.event.preventDefault();
        this.lastLink = e.item.href ?? '–';
        this.linkClick(e);
      },
    },
    template: `
      <div lang="de" style="max-width: 480px;">
        <lc-list [items]="items" [showDividers]="showDividers" (linkClick)="openAccount($event)" />
        <p style="margin-top: 1rem; font-family: monospace; color: var(--color-text-secondary);">
          Router-Ziel: <strong>{{ lastLink }}</strong>
        </p>
      </div>`,
  }),
};

