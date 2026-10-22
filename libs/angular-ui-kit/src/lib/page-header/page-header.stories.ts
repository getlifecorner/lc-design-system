import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';
import { ButtonComponent } from '../button/button.component';
import { ChipComponent } from '../chip/chip.component';
import { TabsComponent, TabComponent } from '../tabs/tabs.component';

const meta: Meta<PageHeaderComponent> = {
  title: 'Layout/Page Header',
  component: PageHeaderComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PageHeaderComponent,
        ButtonComponent,
        ChipComponent,
        TabsComponent,
        TabComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Page Header** is the top-of-page title block that introduces a route. It combines
breadcrumbs, a title, a subtitle, an optional badge, a primary actions area, secondary
metadata and a free-form body region — all wired up with density-aware spacing so every
page in the app gets the same vertical rhythm out of the box.

It is **not** the global application header (use \`lc-header\` for that, which provides
chrome like logo, user menu, theme toggle). The page header lives **inside** the routing
outlet, the application header lives **outside** of it.

---

#### Slot structure

| Slot | Purpose | Position |
|------|---------|----------|
| \`[slot="breadcrumbs"]\` | Trail navigation (\`<lc-breadcrumbs>\`) | above the title row |
| \`[slot="actions"]\` | Primary page actions (buttons, menus) | right of the title row |
| \`[slot="meta"]\` | Secondary metadata (chips, tags, timestamps) | below the title row |
| default | Long-form description text or a short sub-nav line | bottom of the header |

> **Note:** the default slot is for short header-internal content (descriptions, an
> inline sub-nav). Full-blown navigation primitives like \`lc-tabs\` — which render
> both the tab strip **and** their panels — belong **below** the page header, not
> inside it. See the *Followed by tabs* story for the correct pattern.

Empty slots collapse automatically — they do not produce phantom gaps.

---

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| \`title\` | \`string\` | — | Main heading text |
| \`subtitle\` | \`string\` | — | Short supporting line below the title |
| \`overline\` | \`string\` | — | 3.3: short uppercase label **above** the title, **after** it in the DOM (a date, a section) |
| \`level\` | \`1 \\| 2 \\| 3\` | \`1\` | Semantic heading level (\`h1\`/\`h2\`/\`h3\`) |
| \`size\` | \`'compact' \\| 'secondary' \\| 'default' \\| 'comfortable' \\| 'title' \\| 'display' \\| 'auth'\` | \`'default'\` | Visual scale of the whole block |
| \`badge\` | \`string\` | — | Pill rendered next to the title (e.g. \`Beta\`, \`New\`) |
| \`showDivider\` | \`boolean\` | \`false\` | Render a border-bottom divider below the header |

---

#### Size variants

| Size | Typical use | Title size |
|------|-------------|------------|
| \`compact\` | Side panels, data-dense tools, modals | \`--font-size-lg\` |
| \`secondary\` (3.9) | A second title under the page's main one, e.g. the other language of a bilingual page | \`--font-size-xl\`: 20 px, the \`compact\` spacing |
| \`default\` | Standard application pages | \`--font-size-2xl\` |
| \`comfortable\` | Landing / welcome / onboarding pages | \`--font-size-3xl\` |
| \`title\` (3.3) | Page titles in the "Weite" look | \`--font-size-title\`: 32 px, 40 / 44 / 48 px from 1024 / 1440 / 1920 px |
| \`display\` (3.3) | The one display greeting (a daily view) | \`--font-size-display\`: 40 px, 52 / 56 / 60 / 72 px from 1024 / 1280 / 1440 / 1920 px |
| \`auth\` (3.3) | The sign-in and registration \`<h1>\` | \`--font-size-auth-title\`: 30 px, 34 px from 1024 px |

The size also influences gap and padding locally, so a compact header is tighter and a
comfortable header breathes more — without changing your template.

---

#### Density-awareness

The header consumes \`--lc-density-gap-*\` and \`--lc-density-padding-*\` like every other
layout primitive. Wrap any ancestor with \`data-density\` to rescale, or use the \`size\`
input for a header-specific override.

---

#### Accessibility

- Renders the title as a real \`<h1>\`, \`<h2>\` or \`<h3>\` so screen readers get a correct document outline
- Use \`level="1"\` for the top-level page heading; nest \`level="2"\` headers below if needed
- The badge is purely decorative — if it conveys state, also expose it through accessible text
- Keep the actions slot to ≤ 3 primary buttons; overflow into a dropdown for the rest

---

#### When to use what

| Need | Component |
|------|-----------|
| App-wide chrome (logo, user menu, theme toggle) | \`lc-header\` |
| The title of the **current page** | \`lc-page-header\` |
| A reusable row of controls anywhere on a page | \`lc-toolbar\` |

---

#### Typical page layout

\`\`\`html
<lc-header />                          <!-- global, outside <router-outlet> -->
<router-outlet />                      <!-- route below -->
  └─ <lc-page-header title="…">        <!-- one per route -->
      └─ <lc-breadcrumbs slot="breadcrumbs" />
      └─ <lc-button slot="actions" />
  <lc-toolbar>…</lc-toolbar>           <!-- 0..n per page -->
  <lc-card>…</lc-card>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'Main heading text.' },
    subtitle: { control: 'text', description: 'Short supporting line below the title.' },
    overline: {
      control: 'text',
      description:
        '3.3: short label shown above the title (a date, a section) — uppercase through CSS (write it in sentence case), bold, letter spacing 0.12 em, `--color-overline`, 13–16 px. Rendered right after the heading in the DOM, so the heading is read first.',
    },
    level: {
      control: 'inline-radio',
      options: [1, 2, 3],
      description: 'Semantic heading level (does not affect size — use `size` for that).',
      table: { defaultValue: { summary: '1' } },
    },
    size: {
      control: 'inline-radio',
      options: ['compact', 'secondary', 'default', 'comfortable', 'title', 'display', 'auth'],
      description:
        'Visual scale of the whole header block. 3.3: `title` (32–48 px page title), `display` (40–72 px greeting, weight 700), `auth` (30 / 34 px sign-in heading) — responsive, from the type-scale tokens. 3.9: `secondary` (20 px, the `compact` spacing) for a second title under the main one.',
      table: { defaultValue: { summary: 'default' } },
    },
    showDivider: {
      control: 'boolean',
      description: 'Render a divider line below the header.',
      table: { defaultValue: { summary: 'false' } },
    },
    badge: { control: 'text', description: 'Optional pill next to the title (e.g. `Beta`).' },
    icon: { control: 'text', description: 'Optional leading icon (Tabler name) shown as a tile before the title.' },
    iconVariant: {
      control: 'inline-radio',
      options: ['brand', 'subtle'],
      description: 'Visual treatment of the leading icon tile.',
      table: { defaultValue: { summary: 'brand' } },
    },
    iconSize: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Size of the leading icon tile.',
      table: { defaultValue: { summary: 'md' } },
    },
  },
};
export default meta;
type Story = StoryObj<PageHeaderComponent>;

// ─── Stories ───────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default — title + subtitle + actions',
  args: {
    title: 'Reports',
    subtitle: 'Compare period-over-period metrics across all your projects.',
    level: 1,
    size: 'default',
    showDivider: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The canonical page header: title, supporting subtitle, primary actions on the ' +
          'right, and a divider separating the header from the page content below.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header
        [title]="title"
        [subtitle]="subtitle"
        [level]="level"
        [size]="size"
        [showDivider]="showDivider"
        [badge]="badge"
      >
        <lc-button slot="actions" variant="secondary">Export</lc-button>
        <lc-button slot="actions" variant="primary">New report</lc-button>
      </lc-page-header>
    `,
  }),
};

export const WithIcon: Story = {
  name: 'With leading icon tile',
  args: {
    title: 'Repository',
    subtitle: 'Checkout & profile',
    icon: 'git-branch',
    iconVariant: 'subtle',
    showDivider: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `icon` to render a leading brand tile beside the title, mirroring `lc-card`. ' +
          'Combine with `iconVariant` (`brand`/`subtle`) and `iconSize` (`sm`/`md`), and pair ' +
          'with a status badge in the `title-suffix` slot.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header
        [title]="title"
        [subtitle]="subtitle"
        [icon]="icon"
        [iconVariant]="iconVariant"
        [showDivider]="showDivider"
      >
        <lc-chip slot="title-suffix" size="sm" variant="success">Ready</lc-chip>
        <lc-button slot="actions" variant="primary">Open</lc-button>
      </lc-page-header>
    `,
  }),
};

export const WithBreadcrumbs: Story = {
  name: 'With breadcrumbs',
  args: {
    title: 'Workspace settings',
    subtitle: 'Configure billing, members and integrations.',
    showDivider: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumbs sit above the title row in their own slot. Pair with `<lc-breadcrumbs>` ' +
          'in production — a plain `<nav>` is shown here to keep the story self-contained.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [showDivider]="showDivider">
        <nav slot="breadcrumbs" style="font-size:.875rem;color:#666">
          Home · Workspace · <span style="color:#111;font-weight:500">Settings</span>
        </nav>
        <lc-button slot="actions" variant="primary">Save changes</lc-button>
      </lc-page-header>
    `,
  }),
};

export const WithBadgeAndMeta: Story = {
  name: 'With badge + meta chips',
  args: {
    title: 'API console',
    subtitle: 'Test endpoints against the staging environment.',
    badge: 'Beta',
    showDivider: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `badge` input is great for surfacing release stage (Beta, Alpha, New). ' +
          'The meta slot below the title row is the right place for secondary metadata ' +
          'like environment chips, owner labels or unsaved-change indicators.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [badge]="badge" [showDivider]="showDivider">
        <lc-button slot="actions" variant="primary">Open docs</lc-button>
        <lc-chip slot="meta" variant="info" size="sm">env: staging</lc-chip>
        <lc-chip slot="meta" variant="warning" size="sm">3 unsaved</lc-chip>
      </lc-page-header>
    `,
  }),
};

export const TitleSuffixBadges: Story = {
  name: 'Multiple badges beside the title (title-suffix slot)',
  args: { title: 'Project Overview', subtitle: 'Migration & modernization', showDivider: false },
  parameters: {
    docs: {
      description: {
        story:
          'When one `badge` is not enough, project the `[slot="title-suffix"]` to place ' +
          'several chips/badges inline next to the title — e.g. an identifier chip plus a ' +
          'status pill. The slot wraps on narrow viewports and collapses when empty.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [showDivider]="showDivider">
        <lc-chip slot="title-suffix" size="sm">identifier</lc-chip>
        <lc-chip slot="title-suffix" size="sm" variant="success">Ready</lc-chip>
        <lc-button slot="actions" variant="primary">New item</lc-button>
      </lc-page-header>
    `,
  }),
};

export const WithBodyContent: Story = {
  name: 'Followed by tabs (tabs live below the header)',
  args: { title: 'Members', subtitle: '24 active across 3 teams', showDivider: false },
  parameters: {
    docs: {
      description: {
        story:
          '`lc-tabs` renders both the tab bar **and** its panel content, so it belongs ' +
          '*below* the page header — not inside it. The header stays focused on page ' +
          'identity (title, actions, meta), while tabs own the actual page content.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [showDivider]="showDivider">
        <lc-button slot="actions" variant="primary">Invite member</lc-button>
      </lc-page-header>

      <lc-tabs>
        <lc-tab label="All">All members</lc-tab>
        <lc-tab label="Owners">Owners</lc-tab>
        <lc-tab label="Admins">Admins</lc-tab>
        <lc-tab label="Pending">Pending invites</lc-tab>
      </lc-tabs>
    `,
  }),
};

export const Compact: Story = {
  name: 'Compact — for side panels / modals',
  args: { title: 'Inbox', subtitle: '42 unread', size: 'compact', showDivider: true },
  parameters: {
    docs: {
      description: {
        story:
          'Use the compact size inside drawers, side panels or modals where vertical real ' +
          'estate is scarce. Title shrinks to `--font-size-lg`, gaps tighten globally.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [size]="size" [showDivider]="showDivider">
        <lc-button slot="actions" variant="secondary" size="sm">Mark all read</lc-button>
      </lc-page-header>
    `,
  }),
};

export const Comfortable: Story = {
  name: 'Comfortable — for landing / onboarding',
  args: {
    title: 'Welcome back, Anna 👋',
    subtitle: 'Here is what changed since you were away.',
    size: 'comfortable',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The comfortable size produces a near-hero feel for welcome and onboarding pages — ' +
          'larger title (`--font-size-3xl`), more breathing room around the block.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [subtitle]="subtitle" [size]="size">
        <lc-button slot="actions" variant="primary" size="lg">Continue setup</lc-button>
      </lc-page-header>
    `,
  }),
};

export const HeadingLevels: Story = {
  name: 'Heading levels',
  parameters: {
    docs: {
      description: {
        story:
          'Use `level` to choose the semantic heading element. The visual size is controlled ' +
          'independently by `size` — so you can render a semantic `<h2>` at default visual size.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <lc-page-header [level]="1" title="level=1 → <h1>" subtitle="Top of page" />
        <lc-page-header [level]="2" title="level=2 → <h2>" subtitle="Section header" />
        <lc-page-header [level]="3" title="level=3 → <h3>" subtitle="Subsection header" />
      </div>
    `,
  }),
};

export const FullExample: Story = {
  name: 'Full example — every slot used',
  parameters: {
    docs: {
      description: {
        story:
          'A realistic page header using every slot: breadcrumbs, title, subtitle, badge, ' +
          'actions, meta chips and a tabs row in the body slot.',
      },
    },
  },
  render: () => ({
    template: `
      <lc-page-header
        title="Project Phoenix"
        subtitle="Internal tools for the Q3 rebrand initiative."
        badge="Active"
        [showDivider]="true"
      >
        <nav slot="breadcrumbs" style="font-size:.875rem;color:#666">
          Workspaces · Engineering · <span style="color:#111">Project Phoenix</span>
        </nav>

        <lc-button slot="actions" variant="secondary">Share</lc-button>
        <lc-button slot="actions" variant="secondary">Settings</lc-button>
        <lc-button slot="actions" variant="primary">Deploy</lc-button>

        <lc-chip slot="meta" variant="success" size="sm">on track</lc-chip>
        <lc-chip slot="meta" variant="info" size="sm">12 members</lc-chip>
        <lc-chip slot="meta" variant="warning" size="sm">3 blockers</lc-chip>
      </lc-page-header>

      <lc-tabs>
        <lc-tab label="Overview">Overview content</lc-tab>
        <lc-tab label="Tasks">Tasks content</lc-tab>
        <lc-tab label="Releases">Releases content</lc-tab>
        <lc-tab label="Activity">Activity content</lc-tab>
      </lc-tabs>
    `,
  }),
};

// ─── 3.3 ───────────────────────────────────────────────────────────────────

/** A daily view's greeting: the date as an overline above the display-size h1. */
export const DisplayWithOverline: Story = {
  name: 'Display with overline (3.3)',
  args: {
    title: 'Guten Abend, Lena',
    overline: 'Montag, 12. Oktober',
    level: 1,
    size: 'display',
    noPaddingX: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-page-header [title]="title" [overline]="overline" [level]="level" [size]="size" [noPaddingX]="noPaddingX" />
    `,
  }),
};

/** Every other page title, on the responsive title scale, with an action. */
export const TitleScale: Story = {
  name: 'Title scale (3.3)',
  render: () => ({
    template: `
      <lc-page-header title="Haushalt" overline="Familie Brandt" size="title" [noPaddingX]="true">
        <lc-button slot="actions" variant="outline">Umbenennen</lc-button>
      </lc-page-header>
    `,
  }),
};

/** The sign-in heading: 30 px, 34 px from 1024 px. */
export const AuthTitle: Story = {
  name: 'Auth title (3.3)',
  render: () => ({
    template: `<lc-page-header title="Anmelden" size="auth" [noPaddingX]="true" />`,
  }),
};


/** 3.9 (AS-25): a second title under the page's main one, 20 px with the `compact` spacing. */
export const Secondary: Story = {
  name: 'Secondary (3.9)',
  args: {
    title: 'Household members',
    subtitle: 'Two people share this household',
    level: 2,
    size: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`size="secondary"`: the title at `--font-size-xl` (20 px, line height 25 px, bold), the subtitle at 14 px, with the `compact` gaps and padding. The heading level stays a separate choice (`level`).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<lc-page-header [title]="title" [subtitle]="subtitle" [level]="level" [size]="size" />`,
  }),
};

/**
 * 3.9 (AS-25): the bilingual error page: the German `<h1>` on the title scale
 * and the English `<h2>` under it at 20 px, each with its own `lang`.
 */
export const BilingualPage: Story = {
  name: 'Bilingual page (3.9)',
  parameters: {
    docs: {
      description: {
        story:
          'A static error page in two languages: `size="title"` for the German `<h1>`, `size="secondary"` for the English `<h2>` below it. `lang` on each header, so screen readers switch the voice and hyphenation follows the language. Both `noPaddingX`, in a padded page.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column;">
        <lc-page-header lang="de" [level]="1" size="title" title="LifeCorner ist gerade nicht erreichbar"
                        subtitle="Wir arbeiten daran. Versuch es in ein paar Minuten noch einmal." [noPaddingX]="true" />
        <lc-page-header lang="en" [level]="2" size="secondary" title="Can't reach LifeCorner right now"
                        subtitle="We're working on it. Try again in a few minutes." [noPaddingX]="true" />
      </div>
    `,
  }),
};

/** 3.9 (AS-25): `secondary` at every heading level, with and without a subtitle, in English and German. */
export const SecondaryLevels: Story = {
  name: 'Secondary at every level (3.9)',
  parameters: {
    docs: {
      description: {
        story:
          '`size="secondary"` with `level` 1, 2 and 3 (`<h1>`, `<h2>`, `<h3>`): the same 20 px title. "Haushaltsmitgliederverwaltung" is 296.5 px wide at 20 px and fits a 360 px phone on one line; a longer word hyphenates in the page language.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <lc-page-header lang="en" [level]="1" size="secondary" title="Settings" />
        <lc-page-header lang="de" [level]="2" size="secondary" title="Haushaltsmitgliederverwaltung"
                        subtitle="Wer gehört zu deinem Haushalt?" />
        <lc-page-header lang="en" [level]="3" size="secondary" title="Notifications"
                        subtitle="Choose what we tell you about" />
      </div>
    `,
  }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<PageHeaderComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/** One language block: the life-os greeting, a page title with one action, and the sign-in title. */
const largeTextHeaders = (lang = 'en', greeting = '', title = '', action = '', auth = '') => `
  <div lang="${lang}">
    <lc-page-header [level]="1" size="display" title="${greeting}" />
    <lc-page-header [level]="2" size="title" title="${title}">
      <lc-button slot="actions" variant="secondary" size="sm">${action}</lc-button>
    </lc-page-header>
    <lc-page-header [level]="2" size="auth" title="${auth}" [noPaddingX]="true" />
  </div>`;

/**
 * 3.11 (AS-30): titles with a word wider than the line at 320 px and 200 %
 * text. The root text size is raised in the canvas only (`#storybook-root`),
 * so the docs page keeps 100 %.
 */
export const LargeText: LargeTextStory = {
  name: 'Long Words at 200 % Text (phone)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '3.11 (AS-30): the life-os greeting (`display`, `<h1>`), a page title with one action (`title`, `<h2>`) and the sign-in title (`auth`), with the root text at 200 %. The title uses `overflow-wrap: anywhere`: a word wider than the whole line ("Johanna-Friederike", "Household" at 320 px) breaks inside the word instead of running past the screen edge, after hyphenation was tried. The actions are never wider than the row, so they wrap below the title. At 100 % (`textSize`) nothing changes. German, then English. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" style="background: var(--color-background); padding: 16px 24px; display: flex; flex-direction: column; gap: 32px;">
        ${largeTextHeaders('de', 'Hallo, Johanna-Friederike', 'Haushalt', 'Einladen', 'Bei LifeCorner anmelden')}
        ${largeTextHeaders('en', 'Hello, Johanna-Friederike', 'Household', 'Invite', 'Sign in to LifeCorner')}
      </div>
      <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`,
  }),
};
