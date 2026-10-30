import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

/**
 * Empty states inform users that a section has no content yet and guide them
 * toward a next action. Used in lists, tables, search results, and dashboards
 * when there's nothing to display.
 */
const meta: Meta<EmptyStateComponent> = {
  title: 'Feedback/Empty State',
  component: EmptyStateComponent,
  argTypes: {
    heading: { description: 'Primary message (e.g. "No projects yet")' },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
      description: '3.3: heading level of `heading` (`h2`–`h6`). Semantics only, the look stays the same.',
      table: { defaultValue: { summary: '3' } },
    },
    message: { description: 'Supporting text explaining what the user can do' },
    icon: { description: 'Icon name displayed above the heading' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls icon size and text sizing',
    },
    iconTone: {
      control: 'inline-radio',
      options: ['neutral', 'primary'],
      description:
        "3.15: how the icon is drawn. `'neutral'`: the bare icon (40 px, `--color-text-tertiary`). `'primary'`: a 24 px icon in a 48 px circle (`--color-primary-100`, icon `--color-primary-700`; 7.85:1 light, 9.68:1 dark). Decorative in both",
      table: { defaultValue: { summary: "'neutral'" } },
    },
    messageSize: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description:
        "3.15: the text scale, independent of `size` (the padding). `'sm'`: as before (14 px message). `'md'`: the state-page scale: 16/24 message up to 32rem wide, 20 px heading, 16 px below the icon, 24 px before the action",
      table: { defaultValue: { summary: "'sm'" } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Empty state component for "no data" placeholder displays.

**Key Features:**
- Compact (sm) and page-level (md, lg) size modes
- Optional icon from Tabler Icons library
- Heading and description text
- Action slot for projected CTA buttons
- Centered layout with visual hierarchy
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const NoResults: Story = {
  name: 'No Search Results',
  args: { heading: 'No results found', message: 'Try adjusting your search or filter to find what you are looking for.', icon: 'magnifying-glass', size: 'md' },
};

export const NoProjects: Story = {
  name: 'No Projects',
  args: { heading: 'No projects yet', message: 'Create your first project to start organizing your work.', icon: 'folder-plus', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-empty-state [heading]="heading" [message]="message" [icon]="icon" [size]="size">
      <lc-button variant="primary">Create Project</lc-button>
    </lc-empty-state>`,
  }),
};

export const NoNotifications: Story = {
  name: 'No Notifications',
  args: { heading: 'All caught up!', message: 'You have no new notifications. We\'ll let you know when something needs your attention.', icon: 'bell', size: 'md' },
};

export const NoTeamMembers: Story = {
  name: 'No Team Members',
  args: { heading: 'No team members', message: 'Invite colleagues to collaborate on this project.', icon: 'users', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-empty-state [heading]="heading" [message]="message" [icon]="icon" [size]="size">
      <lc-button variant="primary">Invite Members</lc-button>
    </lc-empty-state>`,
  }),
};

export const ErrorState: Story = {
  name: 'Error / Failed to Load',
  args: { heading: 'Something went wrong', message: 'We couldn\'t load your data. Please try again or contact support if the issue persists.', icon: 'exclamation-triangle', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-empty-state [heading]="heading" [message]="message" [icon]="icon" [size]="size">
      <lc-button variant="outlined">Try Again</lc-button>
    </lc-empty-state>`,
  }),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-empty-state heading="Small" message="Compact empty state" icon="inbox" size="sm"></lc-empty-state>
        </div>
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-empty-state heading="Medium" message="Default empty state" icon="inbox" size="md"></lc-empty-state>
        </div>
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-empty-state heading="Large" message="Prominent empty state" icon="inbox" size="lg"></lc-empty-state>
        </div>
      </div>`,
  }),
};

export const InCard: Story = {
  name: 'Inside a Card (Composition)',
  render: () => ({
    template: `
      <div style="max-width: 400px; border: 1px solid #eee; border-radius: 12px; padding: 32px;">
        <lc-empty-state
          heading="No activity yet"
          message="Once your team starts working, activity will appear here."
          icon="clock"
          size="sm"
        ></lc-empty-state>
      </div>`,
  }),
};

/**
 * 3.15 (finance-intelligence app-shell-prove 3): the neutral icon (left)
 * next to the primary circle (right) at every size.
 */
export const PrimaryTone: Story = {
  args: { iconTone: 'primary', messageSize: 'sm' },
  parameters: {
    docs: {
      description: {
        story:
          "`iconTone` `'neutral'` (left, the default) and the control's value (right, `'primary'`: a 24 px icon in a 48 px `--color-primary-100` circle, icon `--color-primary-700`) at `size` sm, md and lg. The circle is `aria-hidden`; the icon is decorative in both tones. `messageSize` applies to the right column.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; max-width: 880px;">
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="sm" /></div>
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="sm" [iconTone]="iconTone" [messageSize]="messageSize" /></div>
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="md" /></div>
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="md" [iconTone]="iconTone" [messageSize]="messageSize" /></div>
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="lg" /></div>
        <div style="border: 1px solid var(--color-border); border-radius: 8px;"><lc-empty-state heading="Keine Belege" message="Hier erscheinen Ihre Belege." icon="inbox" size="lg" [iconTone]="iconTone" [messageSize]="messageSize" /></div>
      </div>`,
  }),
};

/**
 * 3.15 (finance-intelligence app-shell-prove 3–4): the state page's empty
 * state, without a heading (the page's `h1` names it) and with one.
 */
export const StatePage: Story = {
  args: { iconTone: 'primary', messageSize: 'md' },
  parameters: {
    docs: {
      description: {
        story:
          "`iconTone=\"primary\"` with `messageSize=\"md\"`: the message 16/24 (up to 32rem), 16 px between circle and text, 24 px before the action, which is an `lc-button variant=\"outline\" tone=\"primary\" size=\"lg\"`. First without a heading (the page's `h1` names the state), then with the long compound \"Zugriffsberechtigungsverwaltung\" as the heading (20 px). German strings; check them at 360 px.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 32px; max-width: 880px;">
        <lc-empty-state icon="user-x" [iconTone]="iconTone" [messageSize]="messageSize"
                        message="Ihrem Konto ist noch keine Rolle zugeordnet. Bitte wenden Sie sich an die Administration.">
          <lc-button variant="outline" tone="primary" size="lg">
            <lc-icon slot="icon-before" name="logout" size="sm" [decorative]="true" />
            Abmelden
          </lc-button>
        </lc-empty-state>
        <lc-empty-state icon="user-x" [iconTone]="iconTone" [messageSize]="messageSize" heading="Zugriffsberechtigungsverwaltung"
                        message="Ihrem Konto ist noch keine Rolle zugeordnet. Bitte wenden Sie sich an die Administration.">
          <lc-button variant="outline" tone="primary" size="lg">
            <lc-icon slot="icon-before" name="logout" size="sm" [decorative]="true" />
            Abmelden
          </lc-button>
        </lc-empty-state>
      </div>`,
  }),
};
