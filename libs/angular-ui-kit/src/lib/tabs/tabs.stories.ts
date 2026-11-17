import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, provideRouter, withHashLocation } from '@angular/router';
import { fn, expect, userEvent, within } from 'storybook/test';
import { TabComponent, TabsComponent } from './tabs.component';

// `selectedIndex` is a model(); its `selectedIndexChange` output binding exists on
// the component but not as a class property, so Storybook's inferred arg type has
// to be widened for the action.
type TabsArgs = TabsComponent & { selectedIndexChange: (index: number) => void };

const meta: Meta<TabsArgs> = {
  title: 'Navigation/Tabs',
  component: TabsComponent,
  args: {
    selectedIndexChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: `
The Tabs component organizes content into switchable panels.
Use it for settings pages, multi-section views, and content categorization.

**Key Features:**
- Horizontal and vertical orientation
- Icon support per tab
- Badge support per tab (counts or status labels)
- Disabled tabs
- Lazy content rendering
- Two-way selection binding via \`[(selectedIndex)]\`
- Keyboard navigation (arrow keys, Home, End) moves focus and selection together
- Tabs added or removed at runtime (e.g. via \`@for\`) are picked up automatically
- 3.44: a horizontal tab list that doesn't fit scrolls on its own (WCAG 1.4.10) and keeps the selected tab in view
- 3.44: \`mode="links"\`: a tab list of links (\`route\` + \`queryParams\`, or \`href\`) for a router outlet; the app marks the \`current\` tab
- 3.45: \`showIcons\` renders the tabs' icons; an overflowing horizontal list fades out at the side(s) that hide tabs; vertical tabs stack (list above the panel) in a container narrower than 31rem
        `,
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tab bar direction',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    mode: {
      control: 'inline-radio',
      options: ['panels', 'links'],
      description:
        '3.44 (usm-x row 11): `links` renders a tab list of links for content shown elsewhere (a router outlet), no panels. The `lc-tab` with `current` is `aria-selected`; clicks only navigate; arrows move the focus, Enter/Space follow the link. `lc-tab` inputs: `route`, `queryParams`, `queryParamsHandling`, `href`, `current`, `tabId`',
      table: { defaultValue: { summary: 'panels' } },
    },
    showIcons: {
      control: 'boolean',
      description:
        '3.45 (backlog 064-n3): renders each `lc-tab` `icon` (16 px, decorative) before its label; a tab grows by 24 px. Off: the `icon` input is not rendered (as before), so existing layouts don\'t move',
      table: { defaultValue: { summary: 'false' } },
    },
    panelId: {
      control: 'text',
      description: '3.44: `mode="links"`: `aria-controls` of every tab, the id of the element that shows the content. Empty renders none',
      table: { defaultValue: { summary: "''" } },
    },
    selectedIndex: {
      control: 'number',
      description: 'Selected tab index (two-way bindable)',
      table: { defaultValue: { summary: '0' } },
    },
    selectedIndexChange: { action: 'selectedIndexChange', description: 'Emitted when a tab is selected (index)' },
  },
};

export default meta;
type Story = StoryObj<TabsArgs>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <lc-tabs (selectedIndexChange)="selectedIndexChange($event)">
        <lc-tab label="Overview">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">Project Overview</h3>
            <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
              This project is currently in the development phase. The team has completed 12 of 15 tasks
              for this sprint. Overall progress is at 75% with an expected completion date of May 15, 2026.
            </p>
          </div>
        </lc-tab>
        <lc-tab label="Activity">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Recent Activity</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
              <div style="display: flex; gap: 8px; color: var(--color-text-secondary);">
                <span style="color: var(--color-text-tertiary); min-width: 60px;">2h ago</span>
                <span>Alice pushed 3 commits to <strong>feature/auth</strong></span>
              </div>
              <div style="display: flex; gap: 8px; color: var(--color-text-secondary);">
                <span style="color: var(--color-text-tertiary); min-width: 60px;">5h ago</span>
                <span>Bob closed issue <strong>#142</strong></span>
              </div>
              <div style="display: flex; gap: 8px; color: var(--color-text-secondary);">
                <span style="color: var(--color-text-tertiary); min-width: 60px;">1d ago</span>
                <span>Carol merged PR <strong>#89</strong></span>
              </div>
            </div>
          </div>
        </lc-tab>
        <lc-tab label="Settings" icon="cog-6-tooth">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Project Settings</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
              <lc-input label="Project Name" placeholder="My Project"></lc-input>
              <lc-select label="Visibility" placeholder="Select..." [options]="[{value: 'public', label: 'Public'}, {value: 'private', label: 'Private'}]"></lc-select>
            </div>
          </div>
        </lc-tab>
      </lc-tabs>`,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activityTab = canvas.getByRole('tab', { name: /activity/i });
    await userEvent.click(activityTab);
    await expect(args['selectedIndexChange']).toHaveBeenCalledWith(1);
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tabs with leading icons for visual context. 3.45 (backlog 064-n3): icons render only with `[showIcons]="true"` on `lc-tabs` (16 px, +24 px per tab); without it the `icon` inputs stay unrendered, as before.',
      },
    },
  },
  render: () => ({
    template: `
      <lc-tabs [showIcons]="true">
        <lc-tab label="Dashboard" icon="home">
          <div style="padding: 16px;">
            <p style="margin: 0; color: var(--color-text-secondary);">Dashboard content with analytics and metrics.</p>
          </div>
        </lc-tab>
        <lc-tab label="Users" icon="users">
          <div style="padding: 16px;">
            <p style="margin: 0; color: var(--color-text-secondary);">User management and team members.</p>
          </div>
        </lc-tab>
        <lc-tab label="Settings" icon="cog-6-tooth">
          <div style="padding: 16px;">
            <p style="margin: 0; color: var(--color-text-secondary);">Application configuration.</p>
          </div>
        </lc-tab>
      </lc-tabs>`,
  }),
};

export const WithBadges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tabs with badges for counts or status. Set content via `badge` and the color via `badgeVariant` (`default`, `primary`, `success`, `warning`, `error`, `info`).',
      },
    },
  },
  render: () => ({
    template: `
      <lc-tabs>
        <lc-tab label="Inbox" [badge]="12" badgeVariant="primary">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">12 unread messages.</p>
        </lc-tab>
        <lc-tab label="Drafts" [badge]="3">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">3 drafts pending.</p>
        </lc-tab>
        <lc-tab label="Errors" [badge]="2" badgeVariant="error">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">2 failed deliveries.</p>
        </lc-tab>
        <lc-tab label="Updates" badge="New" badgeVariant="success">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">Fresh product updates.</p>
        </lc-tab>
        <lc-tab label="Archive">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">Archived conversations.</p>
        </lc-tab>
      </lc-tabs>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inboxTab = canvas.getByRole('tab', { name: /inbox/i });
    await expect(inboxTab).toHaveTextContent('12');
  },
};

export const Vertical: Story = {
  parameters: {
    docs: { description: { story: 'Vertical tabs work well for settings pages with many sections.' } },
  },
  render: () => ({
    template: `
      <lc-tabs orientation="vertical">
        <lc-tab label="General" icon="identification">
          <div style="padding: 16px; max-width: 400px;">
            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">General Settings</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <lc-input label="Display Name" placeholder="John Doe"></lc-input>
              <lc-input label="Email" type="email" placeholder="john@example.com"></lc-input>
            </div>
          </div>
        </lc-tab>
        <lc-tab label="Security" icon="shield-check">
          <div style="padding: 16px; max-width: 400px;">
            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">Security</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <lc-input label="Current Password" type="password" placeholder="••••••••"></lc-input>
              <lc-input label="New Password" type="password" placeholder="••••••••"></lc-input>
            </div>
          </div>
        </lc-tab>
        <lc-tab label="Notifications" icon="bell">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">Notifications</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <lc-checkbox label="Email notifications"></lc-checkbox>
              <lc-checkbox label="Push notifications"></lc-checkbox>
              <lc-checkbox label="Weekly digest"></lc-checkbox>
            </div>
          </div>
        </lc-tab>
        <lc-tab label="Billing" icon="credit-card">
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">Billing</h3>
            <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">Current plan: Pro ($29/month)</p>
          </div>
        </lc-tab>
      </lc-tabs>`,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    template: `
      <lc-tabs>
        <lc-tab label="Published">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">Published content visible to everyone.</p>
        </lc-tab>
        <lc-tab label="Drafts">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">Your unpublished drafts.</p>
        </lc-tab>
        <lc-tab label="Analytics" [disabled]="true">
          <p style="padding: 16px; margin: 0; color: var(--color-text-secondary);">Upgrade to Pro for analytics.</p>
        </lc-tab>
      </lc-tabs>`,
  }),
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the active panel is a tab stop (`tabindex="0"`, after the tab list) and is focused here as Tab would focus it (in the story view). It shows the kit ring inside its edge, because panels often sit flush in a card: 2 px `--color-primary-500`, 2 px inset (4.36:1 light, 9.95:1 dark on the page), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  render: () => ({
    template: `
      <lc-tabs>
        <lc-tab label="Overview">
          <p style="margin: 0; color: var(--color-text-secondary);">This project is in the development phase: 12 of 15 tasks of this sprint are done.</p>
        </lc-tab>
        <lc-tab label="Activity">
          <p style="margin: 0; color: var(--color-text-secondary);">Alice pushed 3 commits to feature/auth.</p>
        </lc-tab>
      </lc-tabs>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.lc-tabs__panel--active')?.focus({ preventScroll: true });
  },
};

/** The tabs of the router-links stories (3.44, request 064, usm-x row 11). */
const LINK_TABS = {
  en: [
    { key: 'overview', label: 'Overview' },
    { key: 'cost-centres', label: 'Cost centres' },
    { key: 'allocation', label: 'Allocation' },
    { key: 'history', label: 'History' },
  ],
  de: [
    { key: 'uebersicht', label: 'Übersicht' },
    { key: 'kostenstellen', label: 'Kostenstellen' },
    { key: 'leistungsverrechnung', label: 'Leistungsverrechnung' },
    { key: 'aenderungsverlauf', label: 'Änderungsverlauf' },
    { key: 'anhaenge', label: 'Anhänge' },
  ],
};

/** An empty routed page for the stories' own router. */
@Component({ standalone: true, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class TabsRoutePageComponent {}

/**
 * The app side of `mode="links"`: the open tab is `?tab=` in the URL (a
 * reload or a shared link lands on it); the outlet sits in the tabpanel.
 */
@Component({
  selector: 'lc-tabs-router-links-demo',
  standalone: true,
  imports: [TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [attr.lang]="lang()">
      <lc-tabs mode="links" panelId="demo-tab-panel">
        @for (t of tabs(); track t.key) {
          <lc-tab
            [label]="t.label"
            [tabId]="'demo-tab-' + t.key"
            route="."
            [queryParams]="{ tab: t.key }"
            queryParamsHandling="merge"
            [current]="t.key === currentKey()"
          ></lc-tab>
        }
      </lc-tabs>
      <div role="tabpanel" id="demo-tab-panel" [attr.aria-labelledby]="'demo-tab-' + currentKey()" style="padding: 16px; color: var(--color-text-secondary);">
        {{ lang() === 'de' ? 'Inhalt' : 'Content' }}: {{ currentLabel() }}
      </div>
    </div>
  `,
})
class TabsRouterLinksDemoComponent {
  /** Language of the tabs. */
  readonly lang = input<'en' | 'de'>('en');
  /** The tab shown when the URL has no `?tab=`. */
  readonly defaultKey = input('');
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);
  protected readonly tabs = computed(() => LINK_TABS[this.lang()]);
  protected readonly currentKey = computed(() => {
    const key = this.query()?.get('tab');
    const keys = this.tabs().map((t) => t.key);
    return key && keys.includes(key) ? key : this.defaultKey() || keys[0];
  });
  protected readonly currentLabel = computed(() => this.tabs().find((t) => t.key === this.currentKey())?.label ?? '');
}

const routerLinksDecorators = [
  applicationConfig({ providers: [provideRouter([{ path: '**', component: TabsRoutePageComponent }], withHashLocation())] }),
  moduleMetadata({ imports: [TabsRouterLinksDemoComponent] }),
];

/** 3.44 (request 064, usm-x row 11): the tab strip is the navigation for a router outlet. */
export const RouterLinks: Story = {
  name: 'Router Links',
  decorators: routerLinksDecorators,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44 (usm-x row 11): `mode="links"`. Each `lc-tab` is a link (`route="."`, `[queryParams]="{ tab: key }"`, `queryParamsHandling="merge"`), so the open tab lives in the URL (`?tab=`): a reload or a shared link shows the same tab, also in prerendered HTML (`aria-selected` and `href` are in it). The app reads `?tab=` and sets `current`; a click only navigates. The tab list is `role="tablist"` with `role="tab"` links; ←/→, Home and End move the focus, Enter or Space follow the link. The app’s outlet is `<div role="tabpanel" id="demo-tab-panel">`, the `panelId` of the tabs, labelled by the current tab’s `tabId`. The story has its own router on the hash.',
      },
    },
  },
  render: () => ({ template: `<lc-tabs-router-links-demo lang="en" />` }),
};

/** 3.44 (request 064, usm-x row 11, §1): German labels; the list scrolls at 360 px and keeps the current tab in view. */
export const RouterLinksGerman: Story = {
  name: 'Router Links (German)',
  decorators: routerLinksDecorators,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.44: five German tabs; the current tab without `?tab=` is „Änderungsverlauf“. At 360 px the tabs don’t fit: the tab list scrolls on its own (the page doesn’t, WCAG 1.4.10), and the current tab is scrolled fully into view after the first render (`scrollLeft` only, no smooth scrolling). The focus ring is drawn inside the tab, so the scroller does not clip it.',
      },
    },
  },
  render: () => ({ template: `<lc-tabs-router-links-demo lang="de" defaultKey="aenderungsverlauf" />` }),
};
