import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter, withHashLocation } from '@angular/router';
import { CardComponent } from './card.component';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';
import { DescriptionListComponent } from '../description-list/description-list.component';
import { ButtonComponent } from '../button/button.component';
import { SearchInputComponent } from '../search-input/search-input.component';

// `lc-button` and `a[lcButton]` come from the preview's global imports.
const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  decorators: [moduleMetadata({ imports: [IconComponent, BadgeComponent, DescriptionListComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
The Card component groups related content with visual hierarchy.
Use it for content sections, dashboard widgets, and list items.

**Key Features:**
- 5 variants (elevated, outlined, flat; 3.3: raised — the sign-in card with the long
  auth shadow — and dashed — the muted "coming soon" tile, never clickable)
- 3.3: \`borderRadius="xl"\` (24 px) — with \`outlined\` the content card on the "Weite" sky
- 3.3: \`headingLevel\` (2–6) for the built-in title
- Configurable padding and border radius
- Structured header: title + badge + right-side action slot
- Subtitle/description below title
- Clickable mode with hover effects
- Content projection for headers, body, and footers
- Link mode (3.24): \`href\` (plain URL) or \`route\` (+ \`queryParams\`, through the
  Angular router) make the whole card a real link — click, Enter, middle click,
  "open in new tab", "copy link". The built-in title becomes \`<a>\` inside its
  heading (\`headingLevel\`), so screen readers list the heading and the link.
  Look, hover, press, focus ring and \`selected\` are those of \`clickable\`;
  \`cardClick\` is not emitted (the link navigates once, by itself). Controls
  projected into a link card stay clickable above the link. \`dashed\` never links.

**Header Structure:**
- \`title\` — Main heading
- \`badge\` + \`badgeVariant\` — Count/label pill next to title  
- \`[card-header-action]\` — Projected content on the right (buttons, links)
- \`subtitle\` — Description text below title
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat', 'raised', 'dashed'],
      description:
        'Visual style of the card. 3.3: `raised` — plain surface, hairline, the long soft `--shadow-auth-card`, no accent line (the sign-in card); `dashed` — the muted "coming soon" tile (`--color-muted-tile`, dashed `--color-muted-tile-border`, secondary ink), never clickable: `clickable` and `selected` are ignored.',
      table: { defaultValue: { summary: 'elevated' } },
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
      description: 'Internal padding',
      table: { defaultValue: { summary: 'md' } },
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Corner rounding. 3.3: `xl` = 24 px (the "Weite" content card, with `variant="outlined"`).',
      table: { defaultValue: { summary: 'md' } },
    },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
      description: '3.3: heading level of the built-in `title` (`h2`–`h6`). Semantics only, the look stays the same.',
      table: { defaultValue: { summary: '3' } },
    },
    clickable: {
      control: 'boolean',
      description: 'Adds hover effects and pointer cursor (ignored by `dashed`; no effect on a link card, `href`/`route`)',
      table: { defaultValue: { summary: 'false' } },
    },
    selected: { control: 'boolean', description: 'Highlight as selected (when clickable)' },
    badge: { description: 'Badge text/count shown next to the title' },
    badgeVariant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error'],
      description: 'Color variant of the badge',
    },
    icon: { description: 'Optional leading icon (Tabler name) shown as a tile before the title' },
    iconVariant: {
      control: 'select',
      options: ['brand', 'subtle'],
      description: 'Visual treatment of the leading icon tile',
      table: { defaultValue: { summary: 'brand' } },
    },
    iconSize: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Size of the leading icon tile',
      table: { defaultValue: { summary: 'md' } },
    },
    href: {
      control: 'text',
      description:
        '3.24: URL the card links to. The card becomes a real link: the built-in `title` is an `<a href>` inside its heading, and the link covers the whole card. No router needed; works in prerendered HTML. Wins over `route`; ignored by `dashed`. `clickable` has no effect and `cardClick` is not emitted.',
      table: { defaultValue: { summary: 'undefined' } },
    },
    route: {
      control: 'text',
      description:
        "3.24: in-app route through the Angular router (`RouterLink` commands: `'/quellen/usm'` or `['/quellen', id]`), relative to the consumer's route, rendered as a real `<a href>`. Needs the app's router (`provideRouter`); without one, use `href`. `''` and `null` mean no link.",
      table: { defaultValue: { summary: 'undefined' } },
    },
    queryParams: {
      control: 'object',
      description: "3.24: query parameters of `route`, as `RouterLink`'s `queryParams` (`{ ansicht: 'laeufe' }`). Ignored with `href`.",
      table: { defaultValue: { summary: 'undefined' } },
    },
    footerLayout: {
      control: 'inline-radio',
      options: ['default', 'equal'],
      description:
        '3.29: layout of the `[card-footer]` slot. `equal`: its children share the row at equal width once the card is at least 480 px (30rem) wide, and stack full width, 8 px apart, below that (the card\'s own width, at any viewport). Put `<lc-button variant="outline" size="lg" [fullWidth]="true">` in it, primary answer first; the card adds layout only. The card becomes a size container and takes its parent\'s full width.',
      table: { defaultValue: { summary: 'default' } },
    },
    collapsible: {
      control: 'boolean',
      description:
        '3.36: the head (icon, title, subtitle) becomes one toggle, a button inside the heading with `aria-expanded` and `aria-controls`, its hit area the whole head (at least 44 px); body and footer hide when closed. `[card-header-action]` stays its own control. Needs `title`; wins over `clickable`, `href` and `route`; ignored on `dashed`',
      table: { defaultValue: { summary: 'false' } },
    },
    expanded: {
      control: 'boolean',
      description: '3.36: open state of a `collapsible` card, two-way (`[(expanded)]`, `expandedChange`). Closed: only the head shows',
      table: { defaultValue: { summary: 'true' } },
    },
    clickTarget: {
      control: 'inline-radio',
      options: ['card', 'heading'],
      description:
        '3.44 (usm-x row 24): where the button role of a `clickable` card with a `title` sits. `heading`: a `<button>` inside the heading, stretched over the card; the heading stays in the page outline, the card is one tab stop, click/Enter/Space emit `cardClick` once. `ariaLabel` then names the button (must contain the title)',
      table: { defaultValue: { summary: 'card' } },
    },
    truncateTitle: {
      control: 'boolean',
      description: '3.44 (usm-x row 24): the title on one line with "…"; the full title is the heading\'s `title` attribute. A badge beside it never shrinks',
      table: { defaultValue: { summary: 'false' } },
    },
    headerSize: {
      control: 'inline-radio',
      options: ['md', 'sm'],
      description:
        '3.44 (usm-x row 17): spacing of the built-in head. `sm`: padding-bottom 8 px, margin-bottom 12 px (md 12 / 16); a collapsible head is at least 32 px high and its toggle\'s hit area stays 44 px',
      table: { defaultValue: { summary: 'md' } },
    },
    headerActionWrap: {
      control: 'boolean',
      description:
        '3.50 (usm-x row 86): the head may wrap: when the title would get less than `--lc-card-header-title-min` (default `12rem`), `[card-header-action]` takes a line of its own under the title at full width (12 px below). Wide cards look as before. CSS only (prerendered HTML holds)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

/** The scoped accent of design 064 §5 (a subtree that re-points the scale and re-declares the derived tokens). */
const STORY_ACCENT = [
  '--color-primary-300: color-mix(in srgb, var(--color-accent-violet) 45%, white)',
  '--color-primary-400: color-mix(in srgb, var(--color-accent-violet) 65%, white)',
  '--color-primary-500: color-mix(in srgb, var(--color-accent-violet) 85%, white)',
  '--color-primary-600: color-mix(in srgb, var(--color-accent-violet) 100%, white)',
  '--color-primary-wash: color-mix(in srgb, var(--color-primary-400) 6%, transparent)',
  '--color-brand-tile-subtle: color-mix(in srgb, var(--color-primary-500) 14%, transparent)',
  '--gradient-brand-tile: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))',
  '--shadow-brand-glow: 0 0 0 1px color-mix(in srgb, var(--color-primary-500) 18%, transparent)',
].join('; ');

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: { title: 'Project Overview', subtitle: 'Last updated 2 hours ago', variant: 'elevated', padding: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <lc-card [title]="title" [subtitle]="subtitle" [variant]="variant" [padding]="padding">
        <p style="margin: 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.5;">
          Your project is on track. 12 of 15 tasks completed this sprint.
          The team velocity has increased by 20% compared to last month.
        </p>
      </lc-card>`,
  }),
};

export const WithIcon: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Supporting description text',
    icon: 'settings',
    iconVariant: 'brand',
    variant: 'elevated',
    padding: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-card [title]="title" [subtitle]="subtitle" [icon]="icon" [iconVariant]="iconVariant"
               [variant]="variant" [padding]="padding" [badge]="badge" [badgeVariant]="badgeVariant">
        <p style="margin: 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.5;">
          A leading icon tile pairs with the title to give each card a clear, scannable identity.
        </p>
      </lc-card>`,
  }),
};

export const CompactIcon: Story = {
  name: 'Compact icon (iconSize="sm")',
  parameters: {
    docs: { description: { story: 'Use `iconSize="sm"` for dense card headers where the default tile feels too large. Pairs with either `iconVariant`.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 640px;">
        <lc-card variant="outlined" title="Default tile" subtitle="iconSize=&quot;md&quot;" icon="settings" iconVariant="subtle" padding="md">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Standard leading tile.</p>
        </lc-card>
        <lc-card variant="outlined" title="Compact tile" subtitle="iconSize=&quot;sm&quot;" icon="settings" iconVariant="subtle" iconSize="sm" padding="md">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Smaller chip for dense layouts.</p>
        </lc-card>
      </div>`,
  }),
};

export const StatusBadgeSlot: Story = {
  name: 'Status badge slot (card-badge)',
  parameters: {
    docs: { description: { story: 'Project a full `lc-badge` into the `card-badge` slot for a rich status pill (e.g. with a leading `[dot]`) — takes visual precedence over the plain `badge` string input.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 640px;">
        <lc-card variant="outlined" title="Configuration" icon="adjustments" iconVariant="subtle" iconSize="sm" padding="md">
          <lc-badge card-badge variant="success" [rounded]="true" [dot]="true">Complete</lc-badge>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">All required fields are set.</p>
        </lc-card>
        <lc-card variant="outlined" title="Data source" icon="database" iconVariant="subtle" iconSize="sm" padding="md">
          <lc-badge card-badge variant="warning" [rounded]="true" [dot]="true">Out of date</lc-badge>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Last synced a while ago.</p>
        </lc-card>
      </div>`,
  }),
};

export const Outlined: Story = {
  args: { title: 'Team Members', variant: 'outlined', padding: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <lc-card [title]="title" [variant]="variant" [padding]="padding">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <lc-avatar name="Alice Johnson" size="sm"></lc-avatar>
            <div>
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Alice Johnson</p>
              <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Product Designer</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <lc-avatar name="Bob Smith" size="sm"></lc-avatar>
            <div>
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Bob Smith</p>
              <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Frontend Developer</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <lc-avatar name="Carol White" size="sm"></lc-avatar>
            <div>
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Carol White</p>
              <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Backend Engineer</p>
            </div>
          </div>
        </div>
      </lc-card>`,
  }),
};

export const Flat: Story = {
  args: { title: 'Quick Stats', variant: 'flat', padding: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <lc-card [title]="title" [variant]="variant" [padding]="padding" style="background: #f9fafb;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
          <div>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: var(--color-text-primary);">128</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--color-text-secondary);">Active Users</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: var(--color-text-primary);">94%</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--color-text-secondary);">Uptime</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: var(--color-text-primary);">3.2s</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--color-text-secondary);">Avg Response</p>
          </div>
        </div>
      </lc-card>`,
  }),
};

export const Clickable: Story = {
  parameters: {
    docs: { description: { story: 'Clickable cards show hover effects and emit `cardClick` events. Use for selectable items.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 600px;">
        <lc-card variant="outlined" [clickable]="true" title="Starter" padding="md">
          <p style="margin: 0 0 8px; font-size: 24px; font-weight: 700;">$9<span style="font-size: 14px; color: var(--color-text-secondary);">/mo</span></p>
          <p style="margin: 0; font-size: 13px; color: var(--color-text-secondary);">5 projects, 1 user</p>
        </lc-card>
        <lc-card variant="outlined" [clickable]="true" [selected]="true" title="Pro" padding="md">
          <p style="margin: 0 0 8px; font-size: 24px; font-weight: 700;">$29<span style="font-size: 14px; color: var(--color-text-secondary);">/mo</span></p>
          <p style="margin: 0; font-size: 13px; color: var(--color-text-secondary);">Unlimited projects</p>
        </lc-card>
        <lc-card variant="outlined" [clickable]="true" title="Enterprise" padding="md">
          <p style="margin: 0 0 8px; font-size: 24px; font-weight: 700;">Custom</p>
          <p style="margin: 0; font-size: 13px; color: var(--color-text-secondary);">Dedicated support</p>
        </lc-card>
      </div>`,
  }),
};

export const PrimaryBadgeStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`badgeVariant="primary"` on an outlined, a selected and an elevated card. Since 3.22.4 the chip is the lc-badge primary pair (`--color-primary-subtle` / `--color-on-primary-subtle`) with a `--color-primary-500` border: the text reads 8.48:1 in light also on a selected card (was 3.12), and the border 3:1 against every card fill.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <lc-card variant="outlined" title="Members" badge="1" badgeVariant="primary" padding="md"></lc-card>
        <lc-card variant="outlined" [clickable]="true" [selected]="true" title="Projects" badge="2" badgeVariant="primary" padding="md"></lc-card>
        <lc-card variant="elevated" title="Teams" badge="3" badgeVariant="primary" padding="md"></lc-card>
      </div>`,
  }),
};

export const WithFooter: Story = {
  parameters: {
    docs: { description: { story: 'Cards can contain multiple projected sections for header, body, and footer areas.' } },
  },
  render: () => ({
    template: `
      <lc-card variant="elevated" padding="md" style="max-width: 400px;">
        <div style="margin-bottom: 12px;">
          <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600;">Subscription Renewal</h3>
          <p style="margin: 0; font-size: 13px; color: var(--color-text-secondary);">Your current plan expires on June 1, 2026</p>
        </div>
        <p style="margin: 0 0 16px; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5;">
          Renew now to keep access to all premium features including advanced analytics, priority support, and unlimited exports.
        </p>
        <div style="display: flex; gap: 8px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <lc-button variant="ghost" size="sm">Remind Later</lc-button>
          <lc-button variant="primary" size="sm">Renew Now</lc-button>
        </div>
      </lc-card>`,
  }),
};

export const FooterSlot: Story = {
  name: 'Footer slot (card-footer)',
  parameters: {
    docs: { description: { story: 'Project content into the `card-footer` slot to get a standardized footer with a divider and consistent padding — no manual `border-top` needed. Layout inside the footer is up to you (e.g. an action left, a link right).' } },
  },
  render: () => ({
    template: `
      <lc-card variant="elevated" title="Component" subtitle="Overview" icon="package" iconVariant="subtle" iconSize="sm" padding="md" style="max-width: 400px;">
        <lc-badge card-badge variant="primary" [rounded]="true" [dot]="true">Ready</lc-badge>
        <lc-description-list
          [items]="[
            { term: 'Type', value: 'Container' },
            { term: 'Version', value: '1.4.0', emphasis: 'mono' },
            { term: 'Status', value: 'Maintained', emphasis: 'strong' }
          ]" />
        <div card-footer style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
          <lc-button variant="ghost" size="sm">Edit</lc-button>
          <a lcButton variant="link" size="sm" [flush]="true" href="#" style="--lc-btn-flush-align: end">Details ›</a>
        </div>
      </lc-card>`,
  }),
};

export const Variants: Story = {
  parameters: {
    docs: { description: { story: 'All card variants side by side.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <lc-card variant="elevated" title="Elevated" padding="md">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Box shadow for depth</p>
        </lc-card>
        <lc-card variant="outlined" title="Outlined" padding="md">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Border only, no shadow</p>
        </lc-card>
        <lc-card variant="flat" title="Flat" padding="md">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">No shadow or border</p>
        </lc-card>
      </div>`,
  }),
};

export const WithBadge: Story = {
  name: 'With Badge',
  parameters: {
    docs: { description: { story: 'Title with a badge/count pill. Use `badge` input for counts or status labels.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 700px;">
        <lc-card variant="outlined" title="Members" badge="3" subtitle="People with access to this organization." padding="lg">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <lc-avatar name="Jane Doe" size="sm"></lc-avatar>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 500; font-size: 14px;">Jane Doe</p>
                <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">jane@example.com</p>
              </div>
              <lc-chip variant="success" size="sm">owner</lc-chip>
            </div>
          </div>
        </lc-card>
        <lc-card variant="outlined" title="Notifications" badge="12" badgeVariant="error" subtitle="Unread alerts and updates." padding="lg">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">You have 12 unread notifications.</p>
        </lc-card>
      </div>`,
  }),
};

export const WithHeaderAction: Story = {
  name: 'With Header Action',
  parameters: {
    docs: { description: { story: 'Use `[card-header-action]` slot to project buttons or links on the right side of the header.' } },
  },
  render: () => ({
    template: `
      <lc-card variant="outlined" title="Projects" subtitle="Each project maps to a Git repository." padding="lg" style="max-width: 600px;">
        <lc-button card-header-action variant="primary" size="sm" iconLeft="plus">New project</lc-button>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between;">
            <div>
              <p style="margin: 0; font-weight: 600; font-size: 15px;">Sample Project</p>
              <p style="margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary);">Spec driven project</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <lc-button variant="ghost" size="xs" iconLeft="pencil">Edit</lc-button>
              <lc-button variant="ghost" size="xs" iconLeft="trash">Delete</lc-button>
            </div>
          </div>
        </div>
      </lc-card>`,
  }),
};

export const SectionCards: Story = {
  name: 'Section Cards (Dashboard Pattern)',
  parameters: {
    docs: { description: { story: 'Common dashboard pattern: outlined cards as content sections with structured headers, badges, and actions.' } },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 900px;">
        <lc-card variant="outlined" title="Members" badge="1" badgeVariant="primary" subtitle="People with access to this organization." padding="lg">
          <lc-button card-header-action variant="ghost" size="sm" iconLeft="plus">Invite</lc-button>
          <div style="display: flex; align-items: center; gap: 12px;">
            <lc-avatar name="Jane Doe" size="sm"></lc-avatar>
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Jane Doe</p>
              <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">jane@example.com</p>
            </div>
            <lc-chip variant="success" size="sm">owner</lc-chip>
          </div>
        </lc-card>
        <lc-card variant="outlined" title="Projects" badge="2" badgeVariant="primary" subtitle="Each project maps to a Git repository." padding="lg">
          <lc-button card-header-action variant="primary" size="sm" iconLeft="plus">New project</lc-button>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Sample Project</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: var(--color-text-secondary);">Spec driven project</p>
            </div>
            <div style="padding: 10px 0;">
              <p style="margin: 0; font-weight: 500; font-size: 14px;">Design System</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: var(--color-text-secondary);">UI component library</p>
            </div>
          </div>
        </lc-card>
      </div>`,
  }),
};

// ── 3.3 ────────────────────────────────────────────────────────────────────

/** The content card on the "Weite" sky: outlined, hairline, radius 24, no shadow. */
export const WeiteContentCard: Story = {
  name: 'Weite content card (3.3)',
  args: { title: 'Mitglieder', headingLevel: 2, variant: 'outlined', borderRadius: 'xl', padding: 'lg' },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 420px;">
        <lc-card [title]="title" [headingLevel]="headingLevel" [variant]="variant" [borderRadius]="borderRadius" [padding]="padding">
          <p style="margin: 0;">Lena Brandt · Tom Ek</p>
        </lc-card>
      </div>
    `,
  }),
};

/** The sign-in card: plain surface, hairline and the long, soft auth shadow. */
export const RaisedAuthCard: Story = {
  name: 'Raised – sign-in card (3.3)',
  render: () => ({
    template: `
      <div style="max-width: 440px; padding: 2rem 0 4rem;">
        <lc-card variant="raised" borderRadius="xl" padding="lg">
          <p style="margin: 0;">Formular</p>
        </lc-card>
      </div>
    `,
  }),
};

/** Muted "coming soon" tiles: never clickable, no focus, icons decorative. */
export const DashedComingSoon: Story = {
  name: 'Dashed – coming soon tiles (3.3)',
  render: () => ({
    template: `
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; gap: 0.5rem; max-width: 360px;">
        <li style="flex: 1; min-width: 0;">
          <lc-card variant="dashed" padding="sm" borderRadius="lg">
            <span style="display: flex; align-items: center; justify-content: space-between; gap: 0.25rem;">
              <lc-icon name="building-library" size="sm" [decorative]="true" />
              <lc-badge size="sm" [rounded]="true">Bald</lc-badge>
            </span>
            <span style="font-size: 0.875rem; font-weight: 600;">Bankkonten</span>
          </lc-card>
        </li>
        <li style="flex: 1; min-width: 0;">
          <lc-card variant="dashed" padding="sm" borderRadius="lg" [clickable]="true">
            <span style="display: flex; align-items: center; justify-content: space-between; gap: 0.25rem;">
              <lc-icon name="document-text" size="sm" [decorative]="true" />
              <lc-badge size="sm" [rounded]="true">Bald</lc-badge>
            </span>
            <span style="font-size: 0.875rem; font-weight: 600;">Verträge</span>
          </lc-card>
        </li>
      </ul>
    `,
  }),
};

// ── 3.24: link mode (request 037) ──────────────────────────────────────────

/** Three overview cards as links in a grid: 1 column at 360 px, 3 from 1024 px. */
export const LinkCards: Story = {
  name: 'Link Cards',
  parameters: {
    docs: {
      description: {
        story:
          '3.24: `href` makes each card a real link. The title is an `<a>` inside an `h2` (`headingLevel`), so a screen reader lists "Actuals" as a heading and as a link; the link covers the whole card (click, Enter, middle click, "open in new tab", "copy link"). Hover, press and focus ring are those of `clickable`; `cardClick` is not emitted. The grid gives one column on a phone and three from 1024 px; the cards of a row stretch to equal height.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--spacing-4);">
        <lc-card variant="outlined" [headingLevel]="2" icon="chart-bar" title="Service management" subtitle="USU Service Management" href="#/sources/usm">
          <lc-badge variant="success" size="sm" [dot]="true">Loaded</lc-badge>
          <lc-description-list [items]="[{ term: 'Last loaded', value: '02/11/2026, 09:14' }]" style="margin-top: var(--spacing-3);" />
        </lc-card>
        <lc-card variant="outlined" [headingLevel]="2" icon="banknotes" title="Actuals" subtitle="Ledger actuals from SAP" href="#/sources/sap-actuals">
          <lc-badge variant="success" size="sm" [dot]="true">Loaded</lc-badge>
          <lc-description-list [items]="[{ term: 'Last loaded', value: '02/11/2026, 08:52' }]" style="margin-top: var(--spacing-3);" />
        </lc-card>
        <lc-card variant="outlined" [headingLevel]="2" icon="building-library" title="Cost centres" subtitle="Allocation keys from SAP CO" href="#/sources/allocation-keys">
          <lc-badge variant="primary" size="sm" [dot]="true">Running</lc-badge>
          <lc-description-list [items]="[{ term: 'Last loaded', value: '01/11/2026, 18:30' }]" style="margin-top: var(--spacing-3);" />
        </lc-card>
      </div>`,
  }),
};

/** The same grid in German, linked through the router (`route` + `queryParams`). */
export const LinkCardsGerman: Story = {
  name: 'Link Cards (German, router)',
  decorators: [applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.24: `route` links through the Angular router (`RouterLink`), with `queryParams`: *SAP-Ist* has `[route]="[\'/datenbasis/quellen\', \'sap-ist\']" [queryParams]="{ ansicht: \'laeufe\' }"` and renders `href="#/datenbasis/quellen/sap-ist?ansicht=laeufe"` (this story uses hash routing). A plain click or Enter navigates in the app; Ctrl/Cmd, Shift and middle clicks stay with the browser. With `lang="de"` the long title "Leistungsverrechnungsschlüssel" hyphenates inside the card instead of running past it.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--spacing-4);">
        <lc-card variant="outlined" [headingLevel]="2" icon="chart-bar" title="USM" subtitle="USU Service Management" route="/datenbasis/quellen/usm">
          <lc-badge variant="success" size="sm" [dot]="true">Geladen</lc-badge>
          <lc-description-list [items]="[{ term: 'Zuletzt geladen', value: '31.10.2026, 14:35' }]" style="margin-top: var(--spacing-3);" />
        </lc-card>
        <lc-card variant="outlined" [headingLevel]="2" icon="banknotes" title="SAP-Ist" subtitle="Ist aus dem SAP-Hauptbuch"
                 [route]="['/datenbasis/quellen', 'sap-ist']" [queryParams]="{ ansicht: 'laeufe' }">
          <lc-badge variant="success" size="sm" [dot]="true">Geladen</lc-badge>
          <lc-description-list
            [items]="[{ term: 'Zuletzt geladen', value: '31.10.2026, 14:35' }, { term: 'Abdeckung bis Oktober 2026', value: '99,4 %' }]"
            style="margin-top: var(--spacing-3);"
          />
        </lc-card>
        <lc-card variant="outlined" [headingLevel]="2" icon="building-library" title="Leistungsverrechnungsschlüssel" subtitle="Schlüssel aus SAP CO"
                 route="/datenbasis/quellen/leistungsverrechnung">
          <lc-badge variant="primary" size="sm" [dot]="true">Läuft</lc-badge>
          <lc-description-list [items]="[{ term: 'Zuletzt geladen', value: '31.10.2026, 14:35' }]" style="margin-top: var(--spacing-3);" />
        </lc-card>
      </div>`,
  }),
};

/** A clickable card next to a link card: the same look, hover, press, ring and selected state. */
export const LinkAndClickable: Story = {
  name: 'Link and Clickable',
  parameters: {
    docs: {
      description: {
        story:
          '3.24: left `[clickable]="true"` (a button card), right `href` (a link card). Rest, hover, press, focus ring (2 px `--color-primary-500`, offset 2, drawn on the card when its link has focus) and `selected` are the same; only the semantics differ. Row 1 outlined, row 2 elevated and selected.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">
        <lc-card variant="outlined" [clickable]="true" title="Clickable">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Opens the details.</p>
        </lc-card>
        <lc-card variant="outlined" href="#/parity" title="Link">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Opens the details.</p>
        </lc-card>
        <lc-card variant="elevated" [clickable]="true" [selected]="true" title="Clickable">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Opens the details.</p>
        </lc-card>
        <lc-card variant="elevated" [selected]="true" href="#/parity" title="Link">
          <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Opens the details.</p>
        </lc-card>
      </div>`,
  }),
};

// ── 3.29: equal footer (request 046, life-os CC-2) ─────────────────────────

/** Two answers of equal weight: stacked on a phone, side by side from a 480 px card. */
export const EqualFooter: Story = {
  name: 'Equal Footer',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046, life-os contract discovery, CC-2): `footerLayout="equal"` gives the two answers in the `[card-footer]` slot the same width: stacked full width, 8 px apart, while the card is narrower than 480 px (30rem; a phone), side by side from 480 px. The card measures its own width (a size container), not the viewport, so it works in a page column, a dialog or a grid. The buttons are the app\'s: `lc-button variant="outline" size="lg" [fullWidth]="true"`, primary answer first, 48 px high; the card adds layout only, with the divider and spacing of the default footer.',
      },
    },
  },
  render: () => ({
    template: `
      <lc-card variant="outlined" borderRadius="xl" title="Streaming subscription" subtitle="Monthly since March 2024" footerLayout="equal">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary);">
          We found 14 monthly payments to the same recipient. Is this a contract?
        </p>
        <div card-footer>
          <lc-button variant="outline" size="lg" [fullWidth]="true">Looks right</lc-button>
          <lc-button variant="outline" size="lg" [fullWidth]="true">Not a contract</lc-button>
        </div>
      </lc-card>`,
  }),
};

/** German answers: the short pair full width, and a long pair in a 480 px card. */
export const EqualFooterGerman: Story = {
  name: 'Equal Footer (German)',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046): the German answers „Stimmt“ / „Kein Vertrag“ in a full-width card (stacked at 360 px, side by side from 480 px), and „Ja, das stimmt“ / „Das ist kein Vertrag für mich“ in a card of exactly 480 px: side by side at equal width (219 px each); the long label wraps inside its button, and both buttons take the row\'s height.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-card variant="outlined" borderRadius="xl" title="Streaming-Abo" subtitle="Monatlich seit März 2024" footerLayout="equal">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary);">
            Wir haben 14 monatliche Zahlungen an denselben Empfänger gefunden. Ist das ein Vertrag?
          </p>
          <div card-footer>
            <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
            <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
          </div>
        </lc-card>
        <div style="max-width: 480px;">
          <lc-card variant="outlined" borderRadius="xl" title="Fitnessstudio" subtitle="Monatlich seit Januar 2025" footerLayout="equal">
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary);">
              Zehn Lastschriften mit wechselnden Beträgen. Ist das ein Vertrag?
            </p>
            <div card-footer>
              <lc-button variant="outline" size="lg" [fullWidth]="true">Ja, das stimmt</lc-button>
              <lc-button variant="outline" size="lg" [fullWidth]="true">Das ist kein Vertrag für mich</lc-button>
            </div>
          </lc-card>
        </div>
      </div>`,
  }),
};

/** The equal footer in a link card: the buttons stay clickable above the card's link. */
export const EqualFooterLinkCard: Story = {
  name: 'Equal Footer (link card)',
  parameters: {
    docs: {
      description: {
        story:
          '3.29 (request 046): an `href` card with `footerLayout="equal"`. The card is a link (the title, and a click anywhere else on it), while the two answers stay buttons above the link: a click on „Stimmt“ answers, it does not open the candidate. Divider and spacing as in the default footer.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de">
        <lc-card variant="outlined" borderRadius="xl" title="Streaming-Abo" subtitle="Monatlich seit März 2024" href="#/vertraege/kandidat-1" footerLayout="equal">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary);">
            Wir haben 14 monatliche Zahlungen an denselben Empfänger gefunden. Ist das ein Vertrag?
          </p>
          <div card-footer>
            <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
            <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
          </div>
        </lc-card>
      </div>`,
  }),
};

/** The rules of the *Collapsible* story (request 056, regeln row 1). */
const allocationRules = [
  { term: 'Verwaltung', value: '38 %' },
  { term: 'Vertrieb', value: '27 %' },
  { term: 'Produktion', value: '35 %' },
];

/** 3.36 (request 056, regeln row 1): rule cards whose rules close on a phone. */
export const Collapsible: Story = {
  name: 'Collapsible',
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence regeln row 1): `collapsible` with `[(expanded)]`. The head (icon tile, title, subtitle) is one toggle: a button inside the title\'s heading (`aria-expanded`, `aria-controls` on the body, described by the subtitle) whose hit area is the whole head, at least 44 px high. Enter, Space or a tap open and close the body and the footer and emit `expandedChange`. The chevron at the end turns up while open (no motion with reduced motion). Closed, only the head shows: the body is `hidden`, the footer is not displayed. The `[card-header-action]` „Regel hinzufügen“ (third card) stays its own control beside the toggle. Tab: toggle, header action, then the body. The ring is drawn on the head. Default `expanded` is `true`; here the first card is open and the other two start closed, also in prerendered HTML. Long German titles hyphenate. 3.37 (056-n2): the second card has a `[card-footer]` („Regeln bearbeiten“): hidden while it is closed, shown when it opens.',
      },
    },
  },
  render: () => ({
    props: { rules: allocationRules, first: true, second: false, third: false },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <lc-card variant="outlined" title="Umlageschlüssel nach Kostenstellenverantwortung" subtitle="13 Regeln · Verteilung nach Verantwortung"
                 icon="file-text" iconSize="sm" [headingLevel]="2" [collapsible]="true" [(expanded)]="first">
          <lc-description-list [items]="rules" />
        </lc-card>
        <lc-card variant="outlined" title="Direkte Zuordnung" subtitle="4 Regeln"
                 icon="file-text" iconSize="sm" [headingLevel]="2" [collapsible]="true" [(expanded)]="second">
          <lc-description-list [items]="rules" />
          <div card-footer><lc-button variant="outline" size="sm">Regeln bearbeiten</lc-button></div>
        </lc-card>
        <lc-card variant="outlined" title="Verteilung nach Leistungsverrechnungsschlüssel" subtitle="7 Regeln · Verteilung nach Leistung"
                 icon="file-text" iconSize="sm" [headingLevel]="2" [collapsible]="true" [(expanded)]="third">
          <lc-button card-header-action variant="ghost" [iconOnly]="true" ariaLabel="Regel hinzufügen">
            <lc-icon name="plus" size="sm" [decorative]="true" />
          </lc-button>
          <lc-description-list [items]="rules" />
        </lc-card>
      </div>`,
  }),
};

/** The rule sources of the *Clickable Named by Its Text* story (request 058, regeln row 1). */
const ruleSources = [
  { term: 'aus USM übernommen', value: '1' },
  { term: 'im Modul gepflegt', value: '2' },
];

/** 3.38 (request 058, 057-s1): clickable cards whose `ariaLabel` is their visible text. */
export const ClickableNamedByItsText: Story = {
  name: 'Clickable Named by Its Text',
  parameters: {
    docs: {
      description: {
        story:
          '3.38 (request 058, finance-intelligence regeln row 1, WCAG 2.5.3): the card\'s text has a word break between each of its parts (title, badge, subtitle, header action, body, footer), so a clickable card can be named by exactly what it shows: `ariaLabel` „Regeln 3 aus USM übernommen 1 im Modul gepflegt 2“ contains the visible text, and axe `label-content-name-mismatch` passes (before, title and body ran together, „Regeln3aus USM …“). The breaks are spaces between flex items: nothing moves. The second card has a long German title with a badge, a subtitle, a body and a footer; at 360 px the title wraps and hyphenates.',
      },
    },
  },
  render: () => ({
    props: { rules: ruleSources },
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; max-width: 640px;">
        <lc-card variant="outlined" [clickable]="true" padding="md" title="Regeln" badge="3" badgeVariant="primary"
                 ariaLabel="Regeln 3 aus USM übernommen 1 im Modul gepflegt 2">
          <lc-description-list size="sm" [items]="rules" />
        </lc-card>
        <lc-card variant="outlined" [clickable]="true" padding="md" title="Umlageschlüssel nach Kostenstellenverantwortung"
                 badge="Entwurf" badgeVariant="warning" subtitle="Fassung 1"
                 ariaLabel="Umlageschlüssel nach Kostenstellenverantwortung Entwurf Fassung 1 4 Regeln Stand heute 06:00">
          <p style="margin: 0;">4 Regeln</p>
          <div card-footer><span>Stand heute 06:00</span></div>
        </lc-card>
      </div>`,
  }),
};

/** 3.44 (request 064, usm-x row 17): the icon tiles follow a customer theme or a scoped accent. */
export const ScopedAccentTiles: Story = {
  name: 'Scoped Accent Tiles',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44 (usm-x row 17): the `brand` tile (`--gradient-brand-tile`, `--shadow-brand-glow`) and the `subtle` tile (`--color-brand-tile-subtle`) are theme tokens derived from the `--color-primary-*` scale; by default they render as before (#84c7d4 → #1a6a79, rgba(32, 132, 151, .14)). Row 1: default. Row 2: inside a scoped accent, a wrapper that re-points `--color-primary-300…600` to the violet accent and re-declares the four derived tokens (as usm-x’s customizing area): both tiles turn violet. Re-pointing only the scale on a subtree is not enough: the derived tokens resolve where they are declared.',
      },
    },
  },
  render: () => ({
    props: { accent: STORY_ACCENT },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 640px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          <lc-card variant="outlined" title="Kostenstellen" subtitle="Arbeitsbereich" icon="building-bank"><p style="margin: 0;">12 offen</p></lc-card>
          <lc-card variant="outlined" title="Kostenstellen" subtitle="Arbeitsbereich" icon="building-bank" iconVariant="subtle"><p style="margin: 0;">12 offen</p></lc-card>
        </div>
        <div [attr.style]="accent + '; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;'">
          <lc-card variant="outlined" title="Klassen" subtitle="Customizing" icon="building-bank"><p style="margin: 0;">4 geändert</p></lc-card>
          <lc-card variant="outlined" title="Klassen" subtitle="Customizing" icon="building-bank" iconVariant="subtle"><p style="margin: 0;">4 geändert</p></lc-card>
        </div>
      </div>`,
  }),
};

/** 3.44 (request 064, usm-x row 17): one divider hook; no rule under a head without body. */
export const DividerHookAndNoBody: Story = {
  name: 'Divider Hook And No Body',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44 (usm-x row 17): `--lc-card-divider-color` colours every card rule: the built-in head (default `--color-border`), a projected `[card-header]` and the `[card-footer]` (default `--color-divider`); each default stays as it was. Left: the hook set to `--color-border-strong` on a wrapper. Right: a titled card with neither body nor footer: the head draws no rule and no space below it (CSS `:has`, also in prerendered HTML).',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; max-width: 640px; align-items: start;">
        <div style="--lc-card-divider-color: var(--color-border-strong); display: flex; flex-direction: column; gap: 16px;">
          <lc-card variant="outlined" title="Kostenstellen" subtitle="Stand 17. November">
            <p style="margin: 0;">12 offen</p>
            <div card-footer><span>Zuletzt geändert heute</span></div>
          </lc-card>
          <lc-card variant="outlined">
            <div card-header>Eigener Kopf</div>
            <p style="margin: 0;">12 offen</p>
          </lc-card>
        </div>
        <lc-card variant="outlined" title="Kostenstellen" subtitle="Stand 17. November" icon="building-bank" iconSize="sm"></lc-card>
      </div>`,
  }),
};

/** 3.44 (request 064, usm-x row 17): a dense collapsible head with a 44 px hit area. */
export const DenseCollapsibleHead: Story = {
  name: 'Dense Collapsible Head',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44 (usm-x row 17): `headerSize="sm"` on collapsible cards, one open and one closed. The head is at least 32 px high (md: 44 px) with 8 px padding and 12 px margin below it; the toggle’s hit area reaches 6 px above and below the head, so it stays 44 px. Right: the same cards with the default `md` head for comparison.',
      },
    },
  },
  render: () => ({
    props: { open: true, closed: false, openMd: true, closedMd: false },
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; max-width: 640px; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <lc-card variant="outlined" padding="sm" title="Kostenstellen" headerSize="sm" [collapsible]="true" [(expanded)]="open">
            <p style="margin: 0;">12 offen, 3 überfällig</p>
          </lc-card>
          <lc-card variant="outlined" padding="sm" title="Leistungsverrechnung" headerSize="sm" [collapsible]="true" [(expanded)]="closed">
            <p style="margin: 0;">4 Regeln</p>
          </lc-card>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <lc-card variant="outlined" padding="sm" title="Kostenstellen" [collapsible]="true" [(expanded)]="openMd">
            <p style="margin: 0;">12 offen, 3 überfällig</p>
          </lc-card>
          <lc-card variant="outlined" padding="sm" title="Leistungsverrechnung" [collapsible]="true" [(expanded)]="closedMd">
            <p style="margin: 0;">4 Regeln</p>
          </lc-card>
        </div>
      </div>`,
  }),
};

/** 3.44 (request 064, usm-x row 24): the clickable card's heading stays a heading. */
export const ClickableHeading: Story = {
  name: 'Clickable Heading',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44 (usm-x row 24): `clickable` with `clickTarget="heading"` and `truncateTitle`. The button role sits on a `<button>` inside the `h3`, stretched over the card: the page’s heading outline lists „Rechnungsübersicht Januar bis Dezember“, the card is one tab stop, a click anywhere, Enter or Space emit `cardClick` once, and the ring is drawn on the card. The title stays on one line with „…“ and the full title in the heading’s `title`; the badge „Neu“ never shrinks. The second card keeps the default `clickTarget="card"` for comparison.',
      },
    },
  },
  render: () => ({
    props: { clicks: 0 },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <lc-card variant="outlined" [clickable]="true" clickTarget="heading" [truncateTitle]="true"
                 title="Rechnungsübersicht Januar bis Dezember" subtitle="Stand 17. November" icon="file-text" iconSize="sm"
                 badge="Neu" badgeVariant="primary" (cardClick)="clicks = clicks + 1">
          <p style="margin: 0;">48 Rechnungen, 3 offen</p>
        </lc-card>
        <lc-card variant="outlined" [clickable]="true" [truncateTitle]="true"
                 title="Rechnungsübersicht Januar bis Dezember" subtitle="Stand 17. November" icon="file-text" iconSize="sm"
                 badge="Neu" badgeVariant="primary" (cardClick)="clicks = clicks + 1">
          <p style="margin: 0;">48 Rechnungen, 3 offen</p>
        </lc-card>
        <p role="status" style="margin: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Aktiviert: {{ clicks }}</p>
      </div>`,
  }),
};

/** 3.50 (request 071, usm-x row 86): a search in the head takes its own line on a narrow card. */
export const HeaderActionWrap: Story = {
  name: 'Header Action Wrap',
  decorators: [moduleMetadata({ imports: [SearchInputComponent] })],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 86): `headerActionWrap` lets the head wrap. The title column asks for `--lc-card-header-title-min` (12rem); when the 220 px search doesn\'t fit beside that, it takes a line of its own under the title (12 px below, the head\'s full width) instead of pushing the title to about 40 px; on a wide card it stays on the title\'s line. CSS only, so it holds before JavaScript. The collapsible card\'s chevron follows the action onto its line. The last card is the default (no wrap) for comparison. German title with a count badge.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-card variant="outlined" padding="lg" title="Objekttypen" badge="128" [headerActionWrap]="true">
          <lc-search-input card-header-action size="sm" placeholder="Suchen …" ariaLabel="Objekttypen durchsuchen" style="display: block; width: 220px; max-width: 100%;" />
          <p style="margin: 0;">128 Objekttypen in 6 Bereichen.</p>
        </lc-card>
        <lc-card variant="outlined" padding="lg" title="Feldgruppen" badge="42" [headerActionWrap]="true" [collapsible]="true">
          <lc-search-input card-header-action size="sm" placeholder="Suchen …" ariaLabel="Feldgruppen durchsuchen" style="display: block; width: 220px; max-width: 100%;" />
          <p style="margin: 0;">42 Feldgruppen.</p>
        </lc-card>
        <lc-card variant="outlined" padding="lg" title="Objekttypen" badge="128">
          <lc-search-input card-header-action size="sm" placeholder="Suchen …" ariaLabel="Objekttypen durchsuchen (ohne Umbruch)" style="display: block; width: 220px; max-width: 100%;" />
          <p style="margin: 0;">Ohne headerActionWrap (wie bisher).</p>
        </lc-card>
      </div>`,
  }),
};

