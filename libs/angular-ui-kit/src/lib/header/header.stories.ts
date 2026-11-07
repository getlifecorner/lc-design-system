import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fn, expect, userEvent, within } from 'storybook/test';
import { HeaderComponent } from './header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

/**
 * The application header provides top-level navigation, branding, user info,
 * and quick actions. Typically placed at the very top of the page layout.
 * Supports hamburger menu, theme toggle, and user profile dropdown.
 */
const meta: Meta<HeaderComponent> = {
  title: 'Navigation/Header',
  component: HeaderComponent,
  args: {
    hamburgerClick: fn(),
    themeToggleClick: fn(),
    logoutClick: fn(),
    profileClick: fn(),
  },
  argTypes: {
    hamburgerClick: {
      action: 'hamburgerClick',
      description:
        'Emitted when the hamburger menu is clicked. 3.36: carries the hamburger\'s native `<button>`, e.g. for `lc-sidenav [returnFocusTo]="$event"`; handlers without `$event` work as before',
    },
    themeToggleClick: { action: 'themeToggleClick', description: 'Emitted when the theme toggle is clicked' },
    logoutClick: { action: 'logoutClick', description: 'Emitted when logout is clicked' },
    profileClick: { action: 'profileClick', description: 'Emitted when the profile item is clicked' },
    title: { description: 'Application or page title' },
    subtitle: {
      description:
        'Secondary text below the title (e.g. a household name), shown as typed: one line, cut with "…" when it does not fit; the full text is its `title` attribute and stays readable for screen readers. `--lc-header-subtitle-max-width` caps it',
    },
    variant: {
      control: 'select',
      options: ['default', 'transparent'],
      description:
        '`default`: the bar on `--color-surface` with a bottom border. `transparent`: no background, no border — the header sits on the page; pair it with `[sticky]="false"`',
      table: { defaultValue: { summary: 'default' } },
    },
    userMenuTrigger: {
      control: 'select',
      options: ['icon', 'avatar'],
      description:
        'What the account button shows: `icon` (user icon and chevron, at least 44 px high) or `avatar` (the initials of `userName` in a 48 px round button; the avatar is decorative, the button is named `userMenuAriaLabel`, a comma and the initials, e.g. "Menü für Johanna Müller, JM")',
      table: { defaultValue: { summary: 'icon' } },
    },
    userAvatarSrc: {
      description: 'Photo for the account avatar (trigger and menu header); the initials show when empty or broken',
      table: { defaultValue: { summary: "''" } },
    },
    userAvatarColor: {
      control: 'select',
      options: ['default', 'member-1', 'member-2', 'member-3', 'member-4', 'member-5', 'member-6'],
      description: 'Colour of the account avatar: `default` or a member colour `member-1` … `member-6` (white initials)',
      table: { defaultValue: { summary: 'default' } },
    },
    userAvatarFallback: {
      control: 'inline-radio',
      options: ['initials', 'person'],
      description:
        "3.15: what the account avatars (the trigger and the menu header) show without a photo and without `userName`. `'initials'`: \"?\" (as before). `'person'`: a neutral person glyph. The trigger's accessible name stays `userMenuAriaLabel`",
      table: { defaultValue: { summary: "'initials'" } },
    },
    logo: { description: 'URL to a logo image' },
    logoSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description:
        'Size of the brand logo. The header grows automatically when set to `lg` (80px) or `xl` (112px) so the logo is never clipped.',
      table: { defaultValue: { summary: 'md' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description:
        'Overall header height — useful to align the header with a sidebar brand block (`sm` 56px, `md` 64px, `lg` 80px, `xl` 112px).',
      table: { defaultValue: { summary: 'md' } },
    },
    userName: { description: 'Displayed user name (menu header; initials of the avatar trigger). Wraps in the menu, never cut' },
    userEmail: { description: 'User email shown in the profile dropdown. Wraps anywhere, never cut; the menu is at most `min(18rem, 100vw − 2rem)` wide' },
    showHamburger: { description: 'Shows a hamburger menu button (for mobile/sidebar toggle)' },
    sidenavOpen: {
      control: 'boolean',
      description:
        'Open state of the sidenav the hamburger controls — reflected as `aria-expanded` on the toggle. Leave unset when the header does not know it.',
    },
    sidenavId: { description: 'DOM id of the controlled sidenav (`aria-controls` on the hamburger)' },
    showThemeButton: { description: 'Shows a dark/light theme toggle button' },
    autoToggleTheme: {
      control: 'boolean',
      description:
        'Whether the theme button toggles the ThemeService itself before emitting `themeToggleClick`. Set to `false` when the app toggles in the handler.',
      table: { defaultValue: { summary: 'true' } },
    },
    showProfileMenuItem: { description: 'Whether to show a "Profile" item in the user menu' },
    contextName: { description: 'Contextual name displayed in the header (e.g. tenant, organization, project)' },
    contextLabel: { description: 'Label displayed above the context name (e.g. "Tenant", "Organization", "Project")' },
    contextPlacement: {
      control: 'inline-radio',
      options: ['inline', 'below'],
      description:
        '3.33 (app-shell row 1): where the context button sits up to 640 px. `inline`: in the end group, hidden up to 640 px (as before). `below`: up to 640 px a row of its own under the title, as wide as the header and at least 44 px high; title, `end` slot and account menu stay in the first row. From 641 px both render the button inline. No second row without `contextName`',
      table: { defaultValue: { summary: 'inline' } },
    },
    contextBadge: {
      control: 'object',
      description:
        '3.36 (app-shell row 1): `{ label, variant? }`, the state of the context as an `lc-badge` (`sm`, rounded) inside the context button after `contextName`. Its label ends the button\'s accessible name unless `contextAriaLabel` holds it; the button may grow to 340 px, a long name ends with "…" and the badge stays whole',
      table: { defaultValue: { summary: 'undefined' } },
    },
    theme: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description: 'Theme variant — sets internal tokens (--lc-header-bg, --lc-header-fg, etc.)',
    },
    menuSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the profile dropdown menu',
      table: { defaultValue: { summary: 'sm' } },
    },
    showUserMenu: {
      control: 'boolean',
      description: 'Render the account menu (avatar trigger with Profile / Logout)',
      table: { defaultValue: { summary: 'true' } },
    },
    homeHref: {
      description:
        'Plain URL for the brand link. When set the brand is a native `<a href>` (no router needed); empty keeps `routerLink="/"`',
      table: { defaultValue: { summary: "''" } },
    },
    navItems: {
      control: 'object',
      description:
        'Main navigation `{ label, href, current? }[]` → `<nav aria-label><ul><li><a href>`; `current` sets `aria-current="page"`. Below 1024 px the nav takes a second, wrapping row',
    },
    navAriaLabel: { description: 'Accessible name of the `<nav>`', table: { defaultValue: { summary: 'Main navigation' } } },
    titleTag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'p', 'span', 'div'],
      description: 'Element for the title — use `span` when the page has its own `<h1>`',
      table: { defaultValue: { summary: 'h1' } },
    },
    sticky: {
      control: 'boolean',
      description: 'Keep the header at the top while scrolling',
      table: { defaultValue: { summary: 'true' } },
    },
    homeAriaLabel: { description: 'Accessible name of the brand link', table: { defaultValue: { summary: 'Go to home' } } },
    hamburgerAriaLabel: { description: 'Accessible name of the hamburger', table: { defaultValue: { summary: 'Toggle sidebar menu' } } },
    userMenuAriaLabel: {
      description:
        'Accessible name of the account menu trigger. With `userMenuTrigger="avatar"` the button is named this text, a comma and the initials it shows ("Menü für Johanna Müller, JM"), so a voice-control user can say what they see (WCAG 2.5.3). Nothing is added when `userName` gives no initials or the text already holds them as a word; a photo does not change the name',
      table: { defaultValue: { summary: 'Open user menu' } },
    },
    themeToDarkAriaLabel: { description: 'Theme button label in the light theme', table: { defaultValue: { summary: 'Switch to dark mode' } } },
    themeToLightAriaLabel: { description: 'Theme button label in the dark theme', table: { defaultValue: { summary: 'Switch to light mode' } } },
    contextAriaLabel: { description: 'Start of the context button\'s accessible name; the visible `contextLabel` and `contextName` follow it unless contained', table:{ defaultValue: { summary: 'Context info' } } },
    profileLabel: { description: 'Label of the Profile menu entry', table: { defaultValue: { summary: 'Profile' } } },
    logoutLabel: { description: 'Label of the Logout menu entry', table: { defaultValue: { summary: 'Logout' } } },
  },

  parameters: {
    docs: {
      description: {
        component: `
AppHeaderComponent - Global application header for the LifeCorner shell

**Key Features:**
- Clickable logo for home navigation
- Configurable brand logo size via \`logoSize\` (\`xs | sm | md | lg | xl\`);
  the header grows automatically for \`lg\` / \`xl\` so the logo isn't clipped.
  Set \`[showLogo]="false"\` when the brand lives in the sidenav (sidebar-first layout).
- Overall header height via \`size\` (\`sm | md | lg | xl\`) — use this to align the header
  with a sidenav brand block (same height scale as \`lc-sidenav\` logo area).
- Optional title and subtitle display
- User profile dropdown with avatar, name, email, optional Profile link, and Logout
- Optional theme toggle button in header
- Hamburger menu toggle for the sidebar — rendered in a fixed-width slot flush
  with the header's left edge so the icon centers on the sidenav icon column
  (28px) in both the expanded and the collapsed state. The slot is constant,
  so nothing shifts when the sidenav toggles; override
  \`--lc-header-hamburger-slot\` only to match a custom \`--lc-sidenav-rail-width\`
- \`theme\` input (\`auto\` | \`light\` | \`dark\`) with internal CSS tokens
- Logo auto-adapts color to the header's theme
- OnPush change detection for performance

**Public, prerendered sites** (see the *Public Site* stories):
- \`homeHref\` — the brand becomes a plain \`<a href>\`; no router and no JavaScript needed.
- \`navItems\` (\`{ label, href, current? }[]\`) — rendered as
  \`<nav aria-label="…"><ul><li><a href aria-current="page">\`; the current page is
  marked by an underline as well as by color. From 1024 px the nav sits in the bar;
  below it takes a second row and wraps, links are 44 px high. Label: \`navAriaLabel\`.
- \`[slot='end']\` — content at the end of the first row, e.g. a language link
  (\`<a slot="end" lcButton variant="ghost" hreflang="en" lang="en">\`). DOM and focus
  order: brand → nav → end slot.
- \`showUserMenu\` (default \`true\`) hides the account menu, \`titleTag\` renders the
  title as \`h1 | h2 | h3 | p | span | div\` (default \`h1\`), \`sticky\` (default
  \`true\`) can be switched off.
- The \`ThemeService\` — which reads and writes the theme class and \`localStorage\` —
  is only created when \`showThemeButton\` is on.

**App shell ("Weite", 3.3)** (see the *App Shell* stories):
- \`variant="transparent"\` — no background and no border; use it with \`[sticky]="false"\`.
- \`userMenuTrigger="avatar"\` — the account button is the person's initials avatar
  (\`userAvatarColor\`, \`userAvatarSrc\`) in a 48 px round button; the icon trigger is
  44 px high in every density. The avatar button is named \`userMenuAriaLabel\`, a comma
  and the initials it shows ("Menü für Johanna Müller, JM", WCAG 2.5.3); see
  *Avatar Trigger Names*.
- The subtitle is one line with "…", its full text in \`title\`, shown as typed.
- The account menu is at most \`min(18rem, 100vw − 2rem)\` wide; name and email wrap.
- 3.34: \`focusContext()\` moves the focus to the context button after the next render, e.g. after a
  choice in the sheet it opened; it does nothing while the button is not shown (see *Focus Context*).
- 3.36: \`contextBadge\` shows the context's state as a badge inside the context button, part of its name (see
  *Context Badge*); \`hamburgerClick\` emits the hamburger's \`<button>\` for \`lc-sidenav [returnFocusTo]\` (see
  *Hamburger Focus Return*).

**Labels** (English defaults, one input each): \`homeAriaLabel\`, \`hamburgerAriaLabel\`,
\`userMenuAriaLabel\`, \`navAriaLabel\`, \`themeToDarkAriaLabel\`, \`themeToLightAriaLabel\`,
\`contextAriaLabel\`, \`profileLabel\`, \`logoutLabel\`.

**Theming Tokens:** \`--lc-header-bg\`, \`--lc-header-fg\`, \`--lc-header-fg-secondary\`, \`--lc-header-border\`, \`--lc-header-hover-bg\`, \`--lc-header-trigger-border\`, \`--lc-header-trigger-fg\`
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const Default: Story = {
  args: { title: 'LifeCorner', subtitle: 'Design System', userName: 'Sarah Connor', userEmail: 'sarah@example.com' },
};

export const WithHamburger: Story = {
  name: 'With Hamburger Menu',
  args: { title: 'LifeCorner', subtitle: 'Dashboard', userName: 'Sarah Connor', userEmail: 'sarah@example.com', showHamburger: true },
};

export const AboveSidenav: Story = {
  name: 'Above a Sidenav (Aligned Hamburger)',
  parameters: {
    docs: {
      description: {
        story:
          'Header spanning above a docked sidenav. The hamburger sits in a fixed slot at the header\'s left edge, centered on the sidenav icon column (28px) — the same column in both the expanded nav and the collapsed rail. Toggle it: the sidenav changes width, but the hamburger, the header content beside it and the nav icons all stay exactly where they are.',
      },
    },
  },
  decorators: [moduleMetadata({ imports: [SidenavComponent] })],
  render: () => ({
    props: {
      collapsed: true,
      items: [
        { id: '1', icon: 'chart-bar', label: 'Dashboard', route: '/dashboard', displayOrder: 1 },
        { id: '2', icon: 'home', label: 'Projects', route: '/projects', displayOrder: 2 },
        { id: '3', icon: 'bell', label: 'Benachrichtigungen', route: '/notifications', displayOrder: 3 },
        { id: '4', icon: 'currency-dollar', label: 'Kosten', route: '/costs', displayOrder: 4 },
      ],
    },
    template: `
      <div style="display: flex; flex-direction: column; height: 480px; border: 1px solid var(--color-border);">
        <lc-header
          title="LifeCorner"
          [showHamburger]="true"
          [sidenavOpen]="!collapsed"
          sidenavId="story-sidenav"
          userName="Sarah Connor"
          (hamburgerClick)="collapsed = !collapsed"
        ></lc-header>
        <div style="display: flex; flex: 1; min-height: 0;">
          <lc-sidenav
            id="story-sidenav"
            mode="docked"
            [isOpen]="true"
            [collapsed]="collapsed"
            (collapsedChange)="collapsed = $event"
            [items]="items"
            activeRoute="/projects"
            width="280px"
          ></lc-sidenav>
          <div style="flex: 1; background: var(--color-background);"></div>
        </div>
      </div>`,
  }),
};

export const WithThemeToggle: Story = {
  name: 'With Theme Toggle',
  args: { title: 'LifeCorner', userName: 'Sarah Connor', userEmail: 'sarah@example.com', showThemeButton: true },
};

export const FullFeatured: Story = {
  name: 'All Options Enabled',
  args: { title: 'LifeCorner', subtitle: 'Project Dashboard', userName: 'Sarah Connor', userEmail: 'sarah@example.com', showHamburger: true, showThemeButton: true, showProfileMenuItem: true, contextName: 'Acme Corp', contextLabel: 'Tenant' },
};

export const Minimal: Story = {
  name: 'Minimal (Title Only)',
  args: { title: 'My App' },
};

export const WithLongTitle: Story = {
  name: 'Long Title & Subtitle',
  args: { title: 'Enterprise Resource Management Platform', subtitle: 'Human Resources Department', userName: 'Administrator', userEmail: 'admin@company.com' },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    title: 'LifeCorner',
    subtitle: 'Design System',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    showThemeButton: true,
    theme: 'dark',
  },
};

export const LightThemeExplicit: Story = {
  name: 'Light Theme (Explicit)',
  args: {
    title: 'LifeCorner',
    subtitle: 'Dashboard',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    theme: 'light',
  },
};

/** 3.27.1 (request 043, F-25): a themed header keeps its palette inside a page of the other theme. */
export const ThemeScope: Story = {
  name: 'Theme Scope',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043, F-25): a header with `theme="light"` and one with `theme="dark"`, each with three slot controls and the theme toggle. The header re-declares every colour token of its theme, so its slot content resolves the header palette, not the page one. In a dark page the light header now matches a light page (primary 6.21:1, outline 17.12:1, link 6.21:1; the outline and link text were 1.05:1 and 1.59:1); in a light page the dark header matches a dark page (6.21 / 16.32 / 12.13:1, were 1.00 and 3.12:1; header ring 10.25:1). A root-level token override does not reach inside a themed header.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        @for (theme of themes; track theme) {
          <lc-header title="LifeCorner" [theme]="theme" [sticky]="false" [showUserMenu]="false" [showThemeButton]="true">
            <lc-button slot="end" variant="primary">Anmelden</lc-button>
            <lc-button slot="end" variant="outline">Registrieren</lc-button>
            <a slot="end" lcButton variant="link" href="#hilfe">Hilfe</a>
          </lc-header>
        }
      </div>
    `,
    props: { themes: ['light', 'dark'] },
  }),
};

export const WithOrgInfo: Story = {
  name: 'With Context Info (Organization)',
  args: {
    title: 'LifeCorner',
    subtitle: 'Dashboard',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    contextName: 'Acme Corporation',
    contextLabel: 'Organization',
  },
};

export const WithTenantInfo: Story = {
  name: 'With Context Info (Tenant)',
  args: {
    title: 'LifeCorner',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    contextName: 'Production',
    contextLabel: 'Tenant',
    showThemeButton: true,
  },
};

export const WithOrgNameOnly: Story = {
  name: 'Context Name Without Label',
  args: {
    title: 'LifeCorner',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    contextName: 'Acme Corp',
  },
};

export const LogoSizes: Story = {
  name: 'Logo Sizes',
  parameters: {
    docs: {
      description: {
        story:
          'The brand logo size can be controlled via the `logoSize` input (`xs | sm | md | lg | xl`). The header grows automatically for `lg` and `xl` so the logo never gets clipped.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        @for (size of sizes; track size) {
          <div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin: 0 24px 4px;">logoSize="{{ size }}"</div>
            <lc-header
              title="LifeCorner"
              subtitle="Design System"
              [logoSize]="size"
              userName="Sarah Connor"
              userEmail="sarah@example.com"
            ></lc-header>
          </div>
        }
      </div>`,
    props: { sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const },
  }),
};

const publicNav = [
  { label: 'Sicherheit', href: '#sicherheit', current: true },
  { label: 'So bauen wir', href: '#so-bauen-wir' },
  { label: 'Roadmap', href: '#roadmap' },
];

export const PublicSite: Story = {
  name: 'Public Site (no router, labelled nav, end slot)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Frame of a static, prerendered website: plain home link (`homeHref`), labelled main navigation with the current page marked, a language link in `[slot=\'end\']`, no account menu, no sticky position and no `<h1>` in the header. Nothing here needs JavaScript. Resize below 1024 px to see the nav move to its own wrapping row.',
      },
    },
  },
  render: () => ({
    props: { navItems: publicNav },
    template: `
      <lc-header
        size="sm"
        [sticky]="false"
        [showUserMenu]="false"
        homeHref="#start"
        homeAriaLabel="Produkt – Startseite"
        navAriaLabel="Hauptnavigation"
        [navItems]="navItems"
      >
        <a slot="end" lcButton variant="ghost" href="#en" hreflang="en" lang="en"
           aria-label="Open this page in English">English</a>
      </lc-header>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(within(nav).getByRole('link', { name: 'Sicherheit' }).getAttribute('aria-current')).toBe('page');
    await expect(canvas.getByRole('link', { name: 'Produkt – Startseite' }).getAttribute('href')).toBe('#start');
    await expect(canvasElement.querySelector('h1')).toBeNull();
  },
};

export const PublicSitePhone: Story = {
  name: 'Public Site on a Phone (two rows)',
  // The breakpoint is the viewport (1024 px), so this story opens in the mobile
  // viewport; in the docs page it renders at the page width.
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Below a 1024 px viewport the navigation takes a second row under brand and language link and wraps when the labels do not fit. Open the story in the canvas (mobile viewport) to see it.',
      },
    },
  },
  render: () => ({
    props: { navItems: [...publicNav, { label: 'Neuigkeiten', href: '#neuigkeiten' }] },
    template: `
      <lc-header size="sm" [sticky]="false" [showUserMenu]="false" homeHref="#start"
                 homeAriaLabel="Produkt – Startseite" navAriaLabel="Hauptnavigation" [navItems]="navItems">
        <a slot="end" lcButton variant="ghost" href="#en" hreflang="en" lang="en">English</a>
      </lc-header>`,
  }),
};

export const TranslatedLabels: Story = {
  name: 'Translated Labels',
  parameters: {
    docs: {
      description: {
        story: 'Every built-in label is an input; the defaults stay English.',
      },
    },
  },
  args: {
    title: 'LifeCorner',
    titleTag: 'span',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    showHamburger: true,
    showThemeButton: true,
    homeAriaLabel: 'Zur Startseite',
    hamburgerAriaLabel: 'Seitenleiste ein- oder ausblenden',
    userMenuAriaLabel: 'Benutzermenü öffnen',
    themeToDarkAriaLabel: 'Zum dunklen Design wechseln',
    themeToLightAriaLabel: 'Zum hellen Design wechseln',
    profileLabel: 'Profil',
    logoutLabel: 'Abmelden',
  },
};

/** Household frame on a phone ("Weite"): transparent header, long household name, the member's initials avatar. */
export const AppShellPhone: Story = {
  name: 'App Shell on a Phone (transparent, avatar)',
  parameters: {
    docs: {
      description: {
        story:
          'The header on the page: no surface, no border, not sticky. The household name ends with "…" (hover shows it in full); the account button is the initials avatar in the member colour, named "Menü für …, JA" (the initials it shows). Open the menu: the 49-character name and the 42-character email wrap in a menu that stays inside the 360 px screen.',
      },
    },
  },
  args: {
    title: 'Produkt',
    titleTag: 'span',
    subtitle: 'Familie Apfelbaum-Kieselbacher-Morgentau',
    size: 'sm',
    logoSize: 'sm',
    variant: 'transparent',
    sticky: false,
    userMenuTrigger: 'avatar',
    userAvatarColor: 'member-1',
    userName: 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
    userEmail: 'johanna.apfelbaum-kieselbacher@example.org',
    userMenuAriaLabel: 'Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
    menuSize: 'md',
    profileLabel: 'Einstellungen',
    logoutLabel: 'Abmelden',
    homeAriaLabel: 'Produkt – Startseite',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 360px; height: 420px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px;">
        <lc-header
          [title]="title" [titleTag]="titleTag" [subtitle]="subtitle" [size]="size" [logoSize]="logoSize"
          [variant]="variant" [sticky]="sticky" [userMenuTrigger]="userMenuTrigger" [userAvatarColor]="userAvatarColor"
          [userName]="userName" [userEmail]="userEmail" [userMenuAriaLabel]="userMenuAriaLabel" [menuSize]="menuSize"
          [profileLabel]="profileLabel" [logoutLabel]="logoutLabel" [homeAriaLabel]="homeAriaLabel"
          (profileClick)="profileClick()" (logoutClick)="logoutClick()" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /^Menü für/ });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('menu')).toBeTruthy();
    const name = canvasElement.querySelector('.lc-header__menu-user-name') as HTMLElement;
    await expect(name.textContent?.trim()).toBe('Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau');
  },
};

/**
 * 3.33 (request 052, finance-intelligence app-shell row 1): the context
 * button in a row of its own under the title up to 640 px.
 */
export const ContextBelow: Story = {
  name: 'Context Below',
  args: { contextClick: fn() },
  argTypes: { contextClick: { action: 'contextClick', description: 'Emitted when the context button is clicked' } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '3.33 (request 052, finance-intelligence app-shell row 1): `contextPlacement="below"`. Up to 640 px the context button is not hidden but takes a row of its own under the title, as wide as the header (its text lines up with the title, as the nav row does) and at least 44 px high: „Monatsstand“ over „September 2026 · Fassung 1“, named „Monatsstand wählen, Monatsstand September 2026 · Fassung 1“, emitting `contextClick`. Title and account menu stay in the first row; the DOM and focus order are unchanged (one button). A long name ends with "…" (its full text is the `title`), as inline. From 641 px both headers render exactly as `inline`: the button sits in the end group. Without `contextName` there is no second row. First the requester\'s header (`size="sm"`, transparent, no logo, avatar), then the default bar with a 60-character name.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; padding-bottom: 24px; background: var(--color-background);">
        <lc-header lang="de" size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
                   title="Finance Intelligence" titleTag="span" contextPlacement="below"
                   contextLabel="Monatsstand" contextName="September 2026 · Fassung 1" contextAriaLabel="Monatsstand wählen"
                   userMenuTrigger="avatar" userAvatarFallback="person" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="contextClick()" />
        <lc-header [sticky]="false" title="LifeCorner" titleTag="span" contextPlacement="below"
                   contextLabel="Tenant" contextName="Acme Corporation Europe · Shared Services Centre, Fiscal 2026"
                   userName="Sarah Connor" userEmail="sarah@example.com" (contextClick)="contextClick()" />
      </div>`,
  }),
};

/**
 * 3.36 (request 056, finance-intelligence app-shell row 1): the state of the
 * chosen snapshot as a badge inside the context button.
 */
export const ContextBadge: Story = {
  name: 'Context Badge',
  args: { contextClick: fn() },
  argTypes: { contextClick: { action: 'contextClick', description: 'Emitted when the context button is clicked' } },
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['contextClick'] },
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence app-shell row 1): `contextBadge` puts the state of the context into the context button, as an `lc-badge` (`sm`, rounded) after `contextName`. Its word ends the button\'s accessible name: „Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1, Freigegeben“, so the visible text is part of the name (WCAG 2.5.3). One button, one tab stop, at least 44 px; `contextClick` and `focusContext()` as before. With a badge the button may grow to 340 px; a long name ends with "…" (full text in its `title`) and the badge stays whole. First the requester\'s header (`contextPlacement="below"`, `success`), then the default bar (`inline`, shown from 641 px, `default`), then a long German name (`below`, `warning`).',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      released: { label: 'Freigegeben', variant: 'success' },
      replaced: { label: 'Ersetzt' },
      draft: { label: 'Entwurf', variant: 'warning' },
    },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 24px; padding-bottom: 24px; background: var(--color-background);">
        <lc-header size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
                   title="Finance Intelligence" titleTag="span" contextPlacement="below"
                   contextLabel="Monatsstand" contextName="Oktober 2026 · Fassung 1" contextAriaLabel="Monatsstand wählen"
                   [contextBadge]="released"
                   userMenuTrigger="avatar" userAvatarFallback="person" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="contextClick()" />
        <lc-header [sticky]="false" title="Finance Intelligence" titleTag="span"
                   contextLabel="Monatsstand" contextName="September 2026 · Fassung 1" contextAriaLabel="Monatsstand wählen"
                   [contextBadge]="replaced"
                   userName="Johanna Müller" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="contextClick()" />
        <lc-header size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
                   title="Finance Intelligence" titleTag="span" contextPlacement="below"
                   contextLabel="Monatsstand" contextName="Oktober 2026 · Fassung 2 · Kostenstellenrechnung Verwaltung" contextAriaLabel="Monatsstand wählen"
                   [contextBadge]="draft"
                   userMenuTrigger="avatar" userAvatarFallback="person" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="contextClick()" />
      </div>`,
  }),
};

/**
 * 3.36 (request 056, 055-n3): `hamburgerClick` carries the hamburger's
 * `<button>`, so the drawer hands the focus back to it.
 */
export const HamburgerFocusReturn: Story = {
  name: 'Hamburger Focus Return',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.36 (request 056, 055-n3): `hamburgerClick` emits the hamburger\'s native `<button>`, the element that has the focus. The page passes it to `lc-sidenav` as `returnFocusTo`: `(hamburgerClick)="navTrigger = $event; navOpen = true"` and `[returnFocusTo]="navTrigger"`. After „Navigation schließen“, Escape or the backdrop the focus is on the hamburger again, also in WebKit, where a tap doesn\'t focus a button. Handlers without `$event` work as before.',
      },
      source: {
        code: `<lc-header title="Finance Intelligence" [showHamburger]="true" hamburgerAriaLabel="Navigation öffnen"
           [sidenavOpen]="navOpen" sidenavId="app-nav"
           (hamburgerClick)="navTrigger = $event; navOpen = true" />
<lc-sidenav id="app-nav" mode="drawer" [isOpen]="navOpen" [items]="items"
            closeAriaLabel="Navigation schließen"
            [returnFocusTo]="navTrigger" (closed)="navOpen = false" />`,
        language: 'html',
      },
      story: { inline: false, height: '480px' },
    },
  },
  decorators: [moduleMetadata({ imports: [SidenavComponent] })],
  render: () => ({
    props: {
      navOpen: false,
      navTrigger: null,
      items: [
        { id: 'cockpit', icon: 'chart-bar', label: 'Cockpit', route: '/cockpit', displayOrder: 1 },
        { id: 'month', icon: 'calendar', label: 'Monatsstand', route: '/monatsstand', displayOrder: 2 },
        { id: 'sources', icon: 'folder', label: 'Quellen', route: '/quellen', displayOrder: 3 },
      ],
    },
    template: `
      <div lang="de" style="min-height: 100vh; background: var(--color-background);">
        <lc-header [sticky]="false" title="Finance Intelligence" titleTag="span" [showUserMenu]="false"
                   [showHamburger]="true" hamburgerAriaLabel="Navigation öffnen"
                   [sidenavOpen]="navOpen" sidenavId="story-drawer-nav"
                   (hamburgerClick)="navTrigger = $event; navOpen = true" />
        <lc-sidenav id="story-drawer-nav" mode="drawer" [isOpen]="navOpen" [items]="items" activeRoute="/monatsstand"
                    ariaLabel="Hauptnavigation" closeAriaLabel="Navigation schließen"
                    [returnFocusTo]="navTrigger" (closed)="navOpen = false" />
      </div>`,
  }),
};

/**
 * The rows of the sheet „Monatsstand wählen“ (as the list's *Current Choice*
 * story): the row of `month` is `selected` and marked „Gewählt“.
 */
const snapshotChoicesFor = (month: string) =>
  [
    { id: '2026-09-1', label: 'September 2026 · Fassung 1' },
    { id: '2026-08-2', label: 'August 2026 · Fassung 2' },
    { id: '2026-07-1', label: 'Juli 2026 · Fassung 1' },
  ].map((row) => (row.label === month ? { ...row, selected: true, badge: 'Gewählt', badgeVariant: 'primary' as const } : row));

/**
 * 3.34 (request 054, finance-intelligence monatsstand row 2): after a choice
 * in the sheet the context button opened, the focus goes back to it, with the
 * new name.
 */
export const FocusContext: Story = {
  name: 'Focus Context (3.34)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '3.34 (request 054, finance-intelligence monatsstand row 2): the context button opens the sheet „Monatsstand wählen“. A row sets the header\'s `contextName` and calls `focusContext()`; closing the sheet with Schließen, Escape or the backdrop calls it too. After the next render the focus is on the context button, and its name already holds the new `contextName`. First the requester\'s header (`contextPlacement="below"`, the button shown at every width), then the default bar (`inline`, the button shown from 641 px; up to 640 px it is hidden and `focusContext()` does nothing).',
      },
    },
  },
  render: () => ({
    props: {
      month: 'September 2026 · Fassung 1',
      sheetOpen: false,
      opener: null,
      snapshotChoices: snapshotChoicesFor('September 2026 · Fassung 1'),
      snapshotChoicesFor,
    },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 24px; padding-bottom: 24px; background: var(--color-background);">
        <lc-header #h1 size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
                   title="Finance Intelligence" titleTag="span" contextPlacement="below"
                   contextLabel="Monatsstand" [contextName]="month" contextAriaLabel="Monatsstand wählen"
                   userMenuTrigger="avatar" userAvatarFallback="person" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="opener = h1; sheetOpen = true" />
        <lc-header #h2 [sticky]="false" title="Finance Intelligence" titleTag="span"
                   contextLabel="Monatsstand" [contextName]="month" contextAriaLabel="Monatsstand wählen"
                   userName="Johanna Müller" userMenuAriaLabel="Menü für Johanna Müller"
                   profileLabel="Einstellungen" logoutLabel="Abmelden" (contextClick)="opener = h2; sheetOpen = true" />
      </div>
      <lc-modal lang="de" [open]="sheetOpen" (openChange)="sheetOpen = $event; $event ? null : opener.focusContext()"
                placement="auto" ariaLabelledBy="focus-context-sheet-title" closeAriaLabel="Schließen">
        <div slot="header"><h2 id="focus-context-sheet-title">Monatsstand wählen</h2></div>
        <div slot="body">
          <lc-list [items]="snapshotChoices" [clickable]="true" [showDividers]="true"
                   (itemClick)="month = $event.label; snapshotChoices = snapshotChoicesFor($event.label); sheetOpen = false; opener.focusContext()" />
        </div>
      </lc-modal>`,
  }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<HeaderComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/**
 * Raises the root text size in the canvas only (`#storybook-root`), so the docs
 * page keeps 100 %. The frame is fluid: the screenshot width is the viewport.
 */
const largeText = (content = '', lang = 'en') => `
  <div lang="${lang}" [attr.data-lc-story-text]="textSize" style="background: var(--color-background); padding-bottom: 1rem;">
    ${content}
  </div>
  <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`;

/** The signed-in frame of life-os (AS-31) on a phone at 200 % text: brand on the first row, the avatar at the end of the second. */
export const SignedInLargeText: LargeTextStory = {
  name: 'Signed In at 200 % Text (phone)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'AS-31: the header as life-os renders it signed in (`size="sm"`, transparent, avatar trigger) with the root text at 200 %. When brand and account button do not fit side by side, the header wraps: the brand keeps the first row and the avatar goes to the end of a second row, so the two never overlap and nothing scrolls sideways. At 100 % (`textSize`) it is one 56 px row, as before. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: largeText(`
      <lc-header size="sm" logoSize="sm" variant="transparent" [sticky]="false" title="LifeCorner" titleTag="span"
                 subtitle="The Miller household" userMenuTrigger="avatar" userAvatarColor="member-1"
                 userName="Sarah Miller" userEmail="sarah.miller@example.com" userMenuAriaLabel="Menu for Sarah Miller" />`),
  }),
};

/** The same in German, with a long household name: the subtitle ends with "…", the brand stays whole. */
export const SignedInLargeTextGerman: LargeTextStory = {
  name: 'Signed In at 200 % Text, German (phone)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'AS-31 in German: the household name is longer than the row, so it ends with "…" (its full text is the `title` attribute); the wordmark is never cut or covered. The avatar sits at the end of the second row.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: largeText(
      `
      <lc-header size="sm" logoSize="sm" variant="transparent" [sticky]="false" title="LifeCorner" titleTag="span"
                 subtitle="Familie Apfelbaum-Kieselbacher-Morgentau" homeAriaLabel="LifeCorner – Startseite"
                 userMenuTrigger="avatar" userAvatarColor="member-1" userName="Johanna Apfelbaum"
                 userEmail="johanna.apfelbaum@example.org" userMenuAriaLabel="Menü für Johanna Apfelbaum"
                 menuSize="md" profileLabel="Einstellungen" logoutLabel="Abmelden" />`,
      'de',
    ),
  }),
};

/** The signed-out bar (AS-30 (1)) at 200 % text: the language link goes to the end of the second row. */
export const SignedOutLargeText: LargeTextStory = {
  name: 'Signed Out at 200 % Text (phone, language link)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          "AS-30 (1): no account menu, a large ghost link in `[slot='end']`. At 200 % text the link does not fit next to the brand, so it takes the end of a second row (no row gap) instead of running past the screen edge.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: largeText(`
      <lc-header size="sm" logoSize="sm" variant="transparent" [sticky]="false" title="LifeCorner" titleTag="span"
                 [showUserMenu]="false" homeHref="#start" homeAriaLabel="LifeCorner – home">
        <a slot="end" lcButton variant="ghost" size="lg" href="#de" hreflang="de" lang="de">Deutsch</a>
      </lc-header>`),
  }),
};

/** The same header from 1024 px: `size="md"`, the subtitle has room. */
export const AppShellDesktop: Story = {
  name: 'App Shell on Desktop (transparent, avatar)',
  args: {
    title: 'Produkt',
    titleTag: 'span',
    subtitle: 'Unser Haushalt',
    size: 'md',
    variant: 'transparent',
    sticky: false,
    userMenuTrigger: 'avatar',
    userAvatarColor: 'member-2',
    userName: 'Tom Ek',
    userEmail: 'tom@example.org',
    userMenuAriaLabel: 'Menü für Tom Ek',
    menuSize: 'md',
    profileLabel: 'Einstellungen',
    logoutLabel: 'Abmelden',
  },
};

/** One row of *Avatar Trigger Names*: the case, the inputs and the name the button gets. */
interface AvatarTriggerNameRow {
  caption: string;
  lang: 'en' | 'de';
  userName: string;
  userMenuAriaLabel: string;
  userAvatarSrc: string;
}

const avatarTriggerNameRows: readonly AvatarTriggerNameRow[] = [
  { caption: 'EN — named "Menu for Johanna Müller, JM"', lang: 'en', userName: 'Johanna Müller', userMenuAriaLabel: 'Menu for Johanna Müller', userAvatarSrc: '' },
  { caption: 'DE — named "Menü für Johanna Müller, JM"', lang: 'de', userName: 'Johanna Müller', userMenuAriaLabel: 'Menü für Johanna Müller', userAvatarSrc: '' },
  {
    caption: 'DE, long name — named "Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau, JA"',
    lang: 'de',
    userName: 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
    userMenuAriaLabel: 'Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
    userAvatarSrc: '',
  },
  { caption: 'One word — named "Menü für Johanna, J"', lang: 'de', userName: 'Johanna', userMenuAriaLabel: 'Menü für Johanna', userAvatarSrc: '' },
  { caption: 'No name (shows "?") — named "Benutzermenü öffnen", nothing added', lang: 'de', userName: '', userMenuAriaLabel: 'Benutzermenü öffnen', userAvatarSrc: '' },
  { caption: 'Photo — named "Menü für Tom Ek, TE"', lang: 'de', userName: 'Tom Ek', userMenuAriaLabel: 'Menü für Tom Ek', userAvatarSrc: '/assets/lifecorner-emblem.svg' },
  { caption: 'Broken photo, initials — named "Menü für Tom Ek, TE"', lang: 'de', userName: 'Tom Ek', userMenuAriaLabel: 'Menü für Tom Ek', userAvatarSrc: '/assets/no-such-photo.jpg' },
];

/** AS-33: the avatar trigger's accessible name holds the initials it shows (WCAG 2.5.3 Label in Name). */
export const AvatarTriggerNames: Story = {
  name: 'Avatar Trigger Names',
  parameters: {
    docs: {
      description: {
        story:
          'AS-33 (WCAG 2.5.3 Label in Name): the avatar button is named `userMenuAriaLabel`, a comma and the initials it shows, so a voice-control user can say "JM" and a screen reader announces the name once ("Menü für Johanna Müller, JM"). Nothing is added for the "?" of a missing name, or when the label already holds the initials as a word. The photo does not change the name: the server cannot know whether it loads, and a broken photo shows the same initials again. The caption above each header gives the case and the name.',
      },
    },
  },
  render: () => ({
    props: { rows: avatarTriggerNameRows },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; background: var(--color-background);">
        @for (row of rows; track row.caption) {
          <div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin: 0 24px 4px;">{{ row.caption }}</div>
            <lc-header
              [attr.lang]="row.lang"
              variant="transparent"
              size="sm"
              [sticky]="false"
              userMenuTrigger="avatar"
              userAvatarColor="member-1"
              [userName]="row.userName"
              [userMenuAriaLabel]="row.userMenuAriaLabel"
              [userAvatarSrc]="row.userAvatarSrc"
            ></lc-header>
          </div>
        }
      </div>`,
  }),
};

/** 3.15 (finance-intelligence app-shell-prove 5): a signed-in user without a profile name. */
export const AvatarPersonFallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`userName=""` with an email and `userAvatarFallback="person"`: the trigger and the open menu show a person instead of "?", neutral although `userAvatarColor="member-2"` is set. The trigger is named `userMenuAriaLabel` ("Benutzermenü"), nothing added; the menu lists the email.',
      },
    },
  },
  args: {
    title: 'Finance Intelligence',
    titleTag: 'span',
    size: 'md',
    showLogo: false,
    variant: 'transparent',
    sticky: false,
    userMenuTrigger: 'avatar',
    userAvatarColor: 'member-2',
    userAvatarFallback: 'person',
    userName: '',
    userEmail: 'r.berger@example.org',
    userMenuAriaLabel: 'Benutzermenü',
    menuSize: 'md',
    profileLabel: 'Profil',
    logoutLabel: 'Abmelden',
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="max-width: 640px; height: 320px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px;">
        <lc-header
          [title]="title" [titleTag]="titleTag" [size]="size" [showLogo]="showLogo" [variant]="variant" [sticky]="sticky"
          [userMenuTrigger]="userMenuTrigger" [userAvatarColor]="userAvatarColor" [userAvatarFallback]="userAvatarFallback"
          [userName]="userName" [userEmail]="userEmail" [userMenuAriaLabel]="userMenuAriaLabel" [menuSize]="menuSize"
          [profileLabel]="profileLabel" [logoutLabel]="logoutLabel" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Benutzermenü' }));
    await expect(canvas.getByRole('menu')).toBeTruthy();
    await expect(canvasElement.querySelectorAll('.lc-avatar--person').length).toBe(2);
  },
};

