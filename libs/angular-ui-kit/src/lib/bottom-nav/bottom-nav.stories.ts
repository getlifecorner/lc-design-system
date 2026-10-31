import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { BottomNavComponent, BottomNavItem } from './bottom-nav.component';

const twoDestinations: BottomNavItem[] = [
  { id: 'today', label: 'Today', icon: 'sun', route: '/' },
  { id: 'household', label: 'Household', icon: 'home', route: '/household' },
];

const fiveDestinations: BottomNavItem[] = [
  { id: 'today', label: 'Heute', icon: 'sun', route: '/' },
  { id: 'contracts', label: 'Verträge', icon: 'file-text', route: '/contracts' },
  { id: 'finances', label: 'Finanzen', icon: 'wallet', route: '/finances' },
  { id: 'documents', label: 'Dokumente', icon: 'folder', route: '/documents' },
  { id: 'household', label: 'Haushalt', icon: 'home', route: '/household' },
];

const sixDestinations: BottomNavItem[] = [
  ...fiveDestinations.slice(0, 4),
  { id: 'calendar', label: 'Kalender', icon: 'calendar', route: '/calendar' },
  fiveDestinations[4],
];

/** A 360 px phone frame; the bar renders in flow (`fixed=false`) at its bottom. */
const phoneFrame = (bar: string, padding = '0', lang = 'en') => `
  <div lang="${lang}" style="width: 360px; height: 260px; display: flex; flex-direction: column; justify-content: flex-end;
              box-sizing: border-box; padding: ${padding}; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;">
    ${bar}
  </div>`;

const meta: Meta<BottomNavComponent> = {
  title: 'Navigation/Bottom Nav',
  component: BottomNavComponent,
  args: {
    reselect: fn(),
    moreClick: fn(),
    fixed: false,
  },
  argTypes: {
    items: {
      description:
        'Destinations (`BottomNavItem[]`: `id`, `label`, `icon`, `route`; optional `displayOrder`, `badge { value, variant? }`). A `NavigationItem[]` fits as is.',
    },
    activeRoute: {
      description: 'The current URL (e.g. `router.url`); the item matching its first path segment is current, `/` matches only itself',
    },
    ariaLabel: { description: 'Accessible name of the `<nav>` landmark', table: { defaultValue: { summary: 'Main navigation' } } },
    variant: {
      control: 'select',
      options: ['docked', 'floating'],
      description: '`docked` spans the bottom edge with a top border; `floating` is the inset, elevated pill (16 px from the sides and above the safe-area inset, radius 28 px)',
      table: { defaultValue: { summary: 'docked' } },
    },
    fixed: {
      control: 'boolean',
      description: 'Pin the bar to the bottom of the viewport (default `true`). Off renders it in the document flow, as in these previews.',
      table: { defaultValue: { summary: 'true' } },
    },
    maxItems: {
      control: 'number',
      description:
        'Most entries the bar shows, "More" included. With more destinations, or with `showMore`, the first `maxItems − 1` stay and the rest go behind the "More" entry',
      table: { defaultValue: { summary: '5' } },
    },
    showMore: {
      control: 'boolean',
      description:
        'Always end the bar with the "More" entry (`moreLabel`, `moreIcon`, and `moreRoute` or `moreClick`), even when every destination fits: for a bar with fixed slots, such as two destinations plus "More". "More" takes one of the `maxItems` entries, so the first `maxItems − 1` destinations stay and any others move behind it, as on overflow',
      table: { defaultValue: { summary: 'false' } },
    },
    moreLabel: {
      description: 'Label of the "More" entry (on overflow or with `showMore`)',
      table: { defaultValue: { summary: 'More' } },
    },
    moreIcon: {
      description: 'Icon of the "More" entry (on overflow or with `showMore`)',
      table: { defaultValue: { summary: 'dots' } },
    },
    moreRoute: {
      description:
        'Route of the "More" entry (on overflow or with `showMore`): a page listing the rest. Empty renders a button that emits `moreClick`',
      table: { defaultValue: { summary: "''" } },
    },
    badgeAriaLabel: {
      description: 'Text read after a label when the item has a badge; `{value}` is replaced with the badge value',
      table: { defaultValue: { summary: '{value} new' } },
    },
    reselect: { action: 'reselect', description: 'The current item was tapped again (scroll the page to the top)' },
    moreClick: { action: 'moreClick', description: 'The "More" entry was tapped while it has no `moreRoute`' },
  },
  parameters: {
    docs: {
      description: {
        component: `
Bottom navigation bar for phones and tablets: the main destinations as links in the thumb zone. Use it below 1024 px; from 1024 px the side navigation takes over (see App Shell).

**Key Features:**
- Links, not tabs: \`<nav aria-label><ul><li><a routerLink>\` with \`aria-current="page"\` on the current destination
- Items at least 64 × 64 px: a 24 px icon over a 12 px label that is always visible and wraps at large text sizes
- The current item: a 56 × 32 px pill in \`--color-surface-selected\`, a heavier icon and a bold label in \`--color-on-surface-selected\`
- Current by the first path segment (\`/household/members\` keeps Household current); \`/\` only matches itself
- Overflow: from \`maxItems + 1\` destinations, the first \`maxItems − 1\` and a "More" entry (\`moreRoute\` or the \`moreClick\` output)
- \`showMore\`: "More" on request, also when every destination fits (fixed slots such as two destinations plus "More"); it takes one of the \`maxItems\` entries
- \`reselect\` when the current item is tapped again
- \`variant="floating"\`: an inset pill, 16 px from the sides and above the safe-area inset, radius 28 px, elevated
- Fixed to the viewport with the safe-area insets, below menus and dialogs; no hover-only information; reduced motion respected
- Theming hooks: \`--lc-bottom-nav-bg\`, \`-border\`, \`-shadow\`, \`-fg\`, \`-current-bg\`, \`-current-fg\`, \`-hover-bg\`, \`-z\`
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<BottomNavComponent>;

/** Two destinations, docked to the bottom edge. */
export const Default: Story = {
  args: { items: twoDestinations, activeRoute: '/', ariaLabel: 'Main navigation', variant: 'docked' },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [ariaLabel]="ariaLabel" [variant]="variant" [fixed]="fixed" (reselect)="reselect($event)" />`,
    ),
  }),
};

/** The "Weite" look (LK-5): an inset, elevated pill on the page. */
export const Floating: Story = {
  args: { items: twoDestinations, activeRoute: '/', variant: 'floating' },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [variant]="variant" [fixed]="fixed" (reselect)="reselect($event)" />`,
      '16px',
    ),
  }),
};

/** Five destinations with German labels; "Dokumente" still fits on one line at 360 px. */
export const FiveDestinations: Story = {
  args: { items: fiveDestinations, activeRoute: '/finances/accounts', variant: 'floating', ariaLabel: 'Hauptnavigation' },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [variant]="variant" [ariaLabel]="ariaLabel" [fixed]="fixed" />`,
      '16px',
      'de',
    ),
  }),
};

/** 3.16 (TD-3): Finanzen as the current destination; `wallet` is in the inline set, so it renders without a request. */
export const FinanceDestination: Story = {
  name: 'Finance Destination',
  args: {
    items: [
      { id: 'today', label: 'Heute', icon: 'sun', route: '/' },
      { id: 'finances', label: 'Finanzen', icon: 'wallet', route: '/finances' },
      { id: 'household', label: 'Haushalt', icon: 'home', route: '/household' },
    ],
    activeRoute: '/finances',
    ariaLabel: 'Hauptnavigation',
    variant: 'docked',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [ariaLabel]="ariaLabel" [variant]="variant" [fixed]="fixed" (reselect)="reselect($event)" />`,
      '0',
      'de',
    ),
  }),
};

/** Six destinations: the first four stay and "Mehr" links to a page that lists the rest; a hidden destination makes "Mehr" current. */
export const OverflowMore: Story = {
  args: {
    items: sixDestinations,
    activeRoute: '/household',
    variant: 'floating',
    moreLabel: 'Mehr',
    moreRoute: '/more',
    ariaLabel: 'Hauptnavigation',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [variant]="variant" [ariaLabel]="ariaLabel"
         [moreLabel]="moreLabel" [moreRoute]="moreRoute" [fixed]="fixed" />`,
      '16px',
      'de',
    ),
  }),
};

/** `showMore` (3.18): two destinations plus "More" although both fit; "More" is current on a sub-page of `moreRoute`. */
export const ShowMore: Story = {
  args: {
    items: twoDestinations,
    showMore: true,
    moreRoute: '/more',
    activeRoute: '/more/settings',
    variant: 'docked',
    ariaLabel: 'Main navigation',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [showMore]="showMore" [moreRoute]="moreRoute" [activeRoute]="activeRoute"
         [variant]="variant" [ariaLabel]="ariaLabel" [fixed]="fixed" (reselect)="reselect($event)" />`,
    ),
  }),
};

/** `showMore` (3.18): a bar with fixed slots, two destinations plus "Mehr", floating; "Mehr" is current on its own page. */
export const ShowMoreGerman: Story = {
  name: 'Show More (German, floating)',
  args: {
    items: [
      { id: 'cockpit', label: 'Cockpit', icon: 'presentation-chart-line', route: '/cockpit' },
      { id: 'costs', label: 'Kosten', icon: 'banknotes', route: '/kosten' },
    ],
    showMore: true,
    moreLabel: 'Mehr',
    moreRoute: '/mehr',
    activeRoute: '/mehr',
    variant: 'floating',
    ariaLabel: 'Hauptnavigation',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [showMore]="showMore" [moreLabel]="moreLabel" [moreRoute]="moreRoute"
         [activeRoute]="activeRoute" [variant]="variant" [ariaLabel]="ariaLabel" [fixed]="fixed" (reselect)="reselect($event)" />`,
      '16px',
      'de',
    ),
  }),
};

/** `showMore` with `maxItems` 3: "More" takes one of the three entries, so Finances moves behind it; without `moreRoute` "More" is a button that emits `moreClick`. */
export const ShowMoreFixedSlots: Story = {
  name: 'Show More with Fixed Slots',
  args: {
    items: [...twoDestinations, { id: 'finances', label: 'Finances', icon: 'wallet', route: '/finances' }],
    maxItems: 3,
    showMore: true,
    activeRoute: '/',
    variant: 'docked',
    ariaLabel: 'Main navigation',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [maxItems]="maxItems" [showMore]="showMore" [activeRoute]="activeRoute"
         [variant]="variant" [ariaLabel]="ariaLabel" [fixed]="fixed" (reselect)="reselect($event)" (moreClick)="moreClick($event)" />`,
    ),
  }),
};

/** Badges sit on the icon; screen readers hear the label followed by `badgeAriaLabel`. */
export const WithBadges: Story = {
  args: {
    items: [
      twoDestinations[0],
      { id: 'inbox', label: 'Eingang', icon: 'inbox', route: '/inbox', badge: { value: 3, variant: 'primary' } },
      twoDestinations[1],
    ],
    activeRoute: '/',
    variant: 'floating',
    badgeAriaLabel: '{value} neu',
  },
  render: (args) => ({
    props: args,
    template: phoneFrame(
      `<lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [variant]="variant" [badgeAriaLabel]="badgeAriaLabel" [fixed]="fixed" />`,
      '16px',
    ),
  }),
};

/** Fixed to the viewport (`fixed=true`, the default in apps): open the story on its own to see it at the bottom. */
export const FixedToViewport: Story = {
  args: { items: twoDestinations, activeRoute: '/', variant: 'floating', fixed: true },
  parameters: { docs: { disable: true }, layout: 'fullscreen' },
};

/** The five German destinations of life-os (AS-31). */
const germanDestinations: BottomNavItem[] = [
  { id: 'today', label: 'Heute', icon: 'sun', route: '/' },
  { id: 'household', label: 'Haushalt', icon: 'home', route: '/household' },
  { id: 'documents', label: 'Dokumente', icon: 'folder', route: '/documents' },
  { id: 'finances', label: 'Finanzen', icon: 'wallet', route: '/finances' },
  { id: 'settings', label: 'Einstellungen', icon: 'settings', route: '/settings' },
];

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<BottomNavComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/** Raises the root text size in the canvas only (`#storybook-root`), so the docs page keeps 100 %. */
const largeTextStyle = `<style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`;

/** AS-31: the floating bar fixed to a phone screen at 200 % text, German labels. */
export const FloatingLargeText: LargeTextStory = {
  name: 'Floating at 200 % Text (German, fixed)',
  args: { items: germanDestinations, activeRoute: '/', variant: 'floating', fixed: true, ariaLabel: 'Hauptnavigation', textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    docs: { disable: true },
    layout: 'fullscreen',
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" [attr.data-lc-story-text]="textSize"
           style="min-height: 100vh; box-sizing: border-box; padding: 1rem; background: var(--color-background); color: var(--color-text-primary);">
        <h1 style="margin: 0 0 0.5rem; font-size: 1.5rem; line-height: 1.25;">Heute</h1>
        <p style="margin: 0; font-size: 1rem; line-height: 1.5;">Die Leiste teilt die Breite gleichmäßig auf; ihre Beschriftungen brechen um, statt über den Rand zu laufen.</p>
        <lc-bottom-nav [items]="items" [activeRoute]="activeRoute" [variant]="variant" [fixed]="fixed" [ariaLabel]="ariaLabel" />
      </div>
      ${largeTextStyle}`,
  }),
};

/** AS-31: docked and floating bars with 3, 4 and 5 German destinations at 200 % text, in the flow. */
export const ItemCountsLargeText: LargeTextStory = {
  name: 'Item Counts at 200 % Text (German, docked and floating)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Three, four and five destinations, docked (full width) and floating (16 px from the sides), with the root text at 200 %. The items share the width; a label that does not fit wraps and hyphenates (`lang="de"`) instead of widening the bar. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      three: germanDestinations.slice(0, 3),
      four: germanDestinations.slice(0, 4),
      five: germanDestinations,
    },
    template: `
      <div lang="de" [attr.data-lc-story-text]="textSize"
           style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem 0; background: var(--color-background);">
        <lc-bottom-nav variant="docked" [fixed]="false" [items]="three" activeRoute="/" ariaLabel="Drei Ziele, angedockt" />
        <lc-bottom-nav variant="docked" [fixed]="false" [items]="four" activeRoute="/" ariaLabel="Vier Ziele, angedockt" />
        <lc-bottom-nav variant="docked" [fixed]="false" [items]="five" activeRoute="/" ariaLabel="Fünf Ziele, angedockt" />
        <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 0 16px;">
          <lc-bottom-nav variant="floating" [fixed]="false" [items]="three" activeRoute="/" ariaLabel="Drei Ziele, schwebend" />
          <lc-bottom-nav variant="floating" [fixed]="false" [items]="four" activeRoute="/" ariaLabel="Vier Ziele, schwebend" />
          <lc-bottom-nav variant="floating" [fixed]="false" [items]="five" activeRoute="/" ariaLabel="Fünf Ziele, schwebend" />
        </div>
      </div>
      ${largeTextStyle}`,
  }),
};
