import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, input, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor } from 'storybook/test';
import { HeroComponent, type HeroColor } from './hero.component';
import { ButtonLinkComponent } from '../button/button-link.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { BadgeComponent, type BadgeVariant } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';
import { DescriptionListComponent } from '../description-list/description-list.component';

const meta: Meta<HeroComponent> = {
  title: 'Layout/Hero',
  component: HeroComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Hero component creates a prominent page header with a gradient background.
Use it at the top of pages to introduce content, highlight key information, or set visual context.

**Key Features:**
- 9 gradient color themes (primary, secondary, neutral, success, info, warning, accent-orange, accent-purple, accent-violet)
- 3 visual variants: default (dark gradient), slim (compact banner), light (soft pastel with dark text)
- 3 size variants (sm, md, lg) with mobile-first responsive padding and typography
- Content projection for body text and a footer slot for metadata / stats
- A media slot (\`[hero-media]\`) for a visual: below the text on small screens, beside it from 1024 px
- \`contentWidth="lg"\`: a full-bleed band whose content sits on the 1024 px page column, so its text lines up with the page below
- Configurable border radius
- 3.36: \`headingLevel\` (\`h1\`–\`h6\`, the same look) and \`focusTitle()\`, which moves focus to the title after an action replaced the stage (see *Heading Level*, *Focus Title*); \`inverse-outline\` buttons beside \`inverse\` ones (see *Stage Actions*)
- 3.37: components in the default slot keep full opacity, and badges in a hero take the light palette in both themes (see *Badges in the Body*); \`fill\` takes the height of a stretching grid or flex row (see *Fill*)
- 3.38: label, title and body are white at full strength on every default band, at least 4.58:1 at both ends (WCAG 1.4.3; before 1.93:1 for the label on warning). Five bands are darker at their light end: primary (#1f8092), secondary (secondary-600) and accent-orange (#b06024) by about one shade step; success (#46543b → #697957) and warning (#68481d → warning-dark) at both ends, so they look visibly darker (see *All Colors*). The light variant is unchanged
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Main headline text',
    },
    label: {
      control: 'text',
      description: 'Small uppercase label above the title',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'neutral',
        'success',
        'info',
        'warning',
        'accent-orange',
        'accent-purple',
        'accent-violet',
      ],
      description: 'Gradient color theme',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls padding and font sizes',
      table: { defaultValue: { summary: 'md' } },
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Corner rounding',
      table: { defaultValue: { summary: 'lg' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'slim', 'light'],
      description: 'Visual variant: default (dark gradient), slim (compact), light (pastel)',
      table: { defaultValue: { summary: 'default' } },
    },
    contentWidth: {
      control: 'select',
      options: ['full', 'lg'],
      description:
        'Content box: full (to the hero padding) or lg (from 1024 px on the 1024 px page column, centred; the background stays full-bleed)',
      table: { defaultValue: { summary: 'full' } },
    },
    headingLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description:
        '3.36: element of the title (`h1`–`h6`); the look is the same at every level, size and breakpoint. Use 2 under an `lc-page-header`, which holds the page\'s `h1`',
      table: { defaultValue: { summary: '1' } },
    },
    fill: {
      control: 'boolean',
      description:
        '3.37: fill the height the container gives the hero. In a grid or flex row that stretches its items the band ends at the row\'s bottom edge; the content stays at the top and `[hero-footer]` sits at the bottom. Without it the hero is as tall as its content',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<HeroComponent>;

const footerStatStyle =
  'display: flex; flex-direction: column; gap: 4px;';
// 3.38 (request 058): no `opacity` — stat labels at 60 % fell below 4.5:1 on every band.
const statLabelStyle =
  'font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;';
const statValueStyle = 'font-size: 14px; font-weight: 500;';

export const Default: Story = {
  args: {
    label: 'PROJEKT ALPHA',
    title: 'Ein Hero-Bereich für die wichtigste Aussage der Seite.',
    color: 'primary',
    size: 'md',
    borderRadius: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">
          Ein bis zwei Sätze erläuternder Text unter der Überschrift. Der Hero trägt
          die Kernaussage und eine Handvoll Kennzahlen im Footer-Slot.
        </p>
        <div hero-footer>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">STAND</span>
            <span style="${statValueStyle}">Q2 · Phase zwei</span>
          </div>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">TEAM</span>
            <span style="${statValueStyle}">4 Personen · 2 Standorte</span>
          </div>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">TESTABDECKUNG</span>
            <span style="${statValueStyle}">1.200 Tests grün</span>
          </div>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">STATUS</span>
            <span style="${statValueStyle}">Im Plan · Review offen</span>
          </div>
        </div>
      </lc-hero>`,
  }),
};

export const Minimal: Story = {
  args: {
    title: 'Willkommen',
    color: 'neutral',
    size: 'sm',
    borderRadius: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">Ein einfacher Hero ohne Label und Footer.</p>
      </lc-hero>`,
  }),
};

export const WithLabel: Story = {
  args: {
    label: 'DASHBOARD',
    title: 'Projektübersicht',
    color: 'secondary',
    size: 'md',
    borderRadius: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">Alle wichtigen Metriken und Fortschritte auf einen Blick.</p>
      </lc-hero>`,
  }),
};

export const Large: Story = {
  args: {
    label: 'RELEASE',
    title: 'Version 3.0 ist da.',
    color: 'accent-violet',
    size: 'lg',
    borderRadius: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">
          Highlights: Multi-Tenancy, neues Dashboard, verbesserte Performance und über 50 Bugfixes.
        </p>
        <div hero-footer>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">DATUM</span>
            <span style="${statValueStyle}">6. Mai 2026</span>
          </div>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">NEUE FEATURES</span>
            <span style="${statValueStyle}">12</span>
          </div>
          <div style="${footerStatStyle}">
            <span style="${statLabelStyle}">BREAKING CHANGES</span>
            <span style="${statValueStyle}">0</span>
          </div>
        </div>
      </lc-hero>`,
  }),
};

export const NoRadius: Story = {
  args: {
    title: 'Full-Width Hero',
    color: 'info',
    size: 'md',
    borderRadius: 'none',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">Ohne Radius eignet sich der Hero für Edge-to-Edge Layouts.</p>
      </lc-hero>`,
  }),
};

export const AllColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <lc-hero title="Primary" color="primary" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Secondary" color="secondary" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Neutral" color="neutral" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Success" color="success" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Info" color="info" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Warning" color="warning" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Accent Orange" color="accent-orange" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Accent Purple" color="accent-purple" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
        <lc-hero title="Accent Violet" color="accent-violet" size="sm" borderRadius="md">
          <p style="margin: 0;">Gradient preview</p>
        </lc-hero>
      </div>`,
  }),
};

export const Slim: Story = {
  parameters: {
    docs: { description: { story: 'Slim variant — a compact banner with reduced padding and smaller typography.' } },
  },
  args: {
    label: 'DASHBOARD',
    title: 'Quick Stats',
    color: 'primary',
    size: 'md',
    borderRadius: 'md',
    variant: 'slim',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius" [variant]="variant">
        <p style="margin: 0;">A compact hero for secondary page sections or dashboards.</p>
      </lc-hero>`,
  }),
};

export const Light: Story = {
  parameters: {
    docs: { description: { story: 'Light variant — soft pastel gradient with dark text, ideal for less prominent headers.' } },
  },
  args: {
    label: 'GETTING STARTED',
    title: 'Welcome to your workspace',
    color: 'primary',
    size: 'md',
    borderRadius: 'lg',
    variant: 'light',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius" [variant]="variant">
        <p style="margin: 0;">A softer, lighter hero that blends well with content-heavy pages.</p>
      </lc-hero>`,
  }),
};

export const LightSlim: Story = {
  parameters: {
    docs: { description: { story: 'Combining slim and light for a subtle, compact section header.' } },
  },
  args: {
    title: 'Note',
    color: 'info',
    size: 'sm',
    borderRadius: 'md',
    variant: 'light',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius" variant="slim light">
        <p style="margin: 0;">A very compact, pastel-colored callout-style hero.</p>
      </lc-hero>`,
  }),
};

export const AllLightColors: Story = {
  parameters: {
    docs: { description: { story: 'All light variant color themes side by side.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-hero title="Primary Light" color="primary" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Secondary Light" color="secondary" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Neutral Light" color="neutral" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Success Light" color="success" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Info Light" color="info" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Warning Light" color="warning" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Accent Orange Light" color="accent-orange" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Accent Purple Light" color="accent-purple" size="sm" borderRadius="md" variant="light"></lc-hero>
        <lc-hero title="Accent Violet Light" color="accent-violet" size="sm" borderRadius="md" variant="light"></lc-hero>
      </div>`,
  }),
};

const mediaCardStyle =
  'display: flex; flex-direction: column; gap: 12px; padding: 20px; border-radius: 18px; background: #fff; color: #111827; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);';
const mediaRowStyle = 'height: 12px; border-radius: 6px; background: #e0f1f4;';

export const WithMedia: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A visual in the `[hero-media]` slot: below the text with the footer rule on small screens, beside it from 1024 px. It is outside the body, at full opacity. `--lc-hero-media-width` sets its column (default 23rem).',
      },
    },
  },
  args: {
    label: 'MEDIA SLOT',
    title: 'Text on the left, a visual on the right',
    color: 'primary',
    size: 'md',
    borderRadius: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius">
        <p style="margin: 0;">One or two sentences of supporting text under the headline.</p>
        <div hero-media style="${mediaCardStyle}">
          <div style="${mediaRowStyle} width: 60%;"></div>
          <div style="${mediaRowStyle}"></div>
          <div style="${mediaRowStyle} width: 80%;"></div>
        </div>
      </lc-hero>`,
  }),
};

export const PageBand: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'A full-bleed page band: `borderRadius="none"` and `contentWidth="lg"`. From 1024 px its label, title, body and media sit on the same 1024 px column as the page content below (`lc-container size="lg"`), so the text lines up; below 1024 px the size padding applies as usual.',
      },
    },
  },
  args: {
    label: 'THE COCKPIT FOR FAMILY LIFE',
    title: 'Everything that keeps your family running. Connected and at a glance.',
    color: 'primary',
    size: 'md',
    borderRadius: 'none',
    contentWidth: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius" [contentWidth]="contentWidth">
        <p style="margin: 0;">Shows you every day what matters, and why.</p>
        <div hero-media style="${mediaCardStyle}">
          <div style="${mediaRowStyle} width: 60%;"></div>
          <div style="${mediaRowStyle}"></div>
          <div style="${mediaRowStyle} width: 80%;"></div>
        </div>
      </lc-hero>
      <div style="max-width: 1024px; margin: 0 auto; padding: 32px 48px; box-sizing: border-box;">
        <p style="margin: 0;">Page content on the same column (here a plain 1024 px container with 48 px sides).</p>
      </div>`,
  }),
};

export const BandLink: StoryObj<HeroComponent & { linkLabel: string }> = {
  name: 'Band Link (G-WL1)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '3.13 (G-WL1): one link button in the default body of a page band, as on the life-os home band. `<a lcButton variant="inverse" size="lg">` is a white pill with dark ink whose fill and white focus ring stay at 4.60:1 or more against the teal band (at its light end, #1f8092 since 3.38), with the label at 13.17:1 on the pill. The long German label wraps onto two lines at 360 px and stays on one from 1024 px; the link is 48.5 px high on one line. A flex row with `align-items: flex-start` keeps the link as wide as its label.',
      },
    },
  },
  argTypes: {
    linkLabel: {
      control: 'text',
      description: 'Label of the inverse link button in the band body',
      table: { defaultValue: { summary: 'Trag dich jetzt in die Warteliste ein' } },
    },
  },
  args: {
    ...PageBand.args,
    linkLabel: 'Trag dich jetzt in die Warteliste ein',
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [ButtonLinkComponent] },
    template: `
      <lc-hero [label]="label" [title]="title" [color]="color" [size]="size" [borderRadius]="borderRadius" [contentWidth]="contentWidth">
        <p style="margin: 0;">Shows you every day what matters, and why.</p>
        <div style="display: flex; align-items: flex-start; margin-top: 16px;">
          <a lcButton variant="inverse" size="lg" href="#warteliste">{{ linkLabel }}</a>
        </div>
        <div hero-media style="${mediaCardStyle}">
          <div style="${mediaRowStyle} width: 60%;"></div>
          <div style="${mediaRowStyle}"></div>
          <div style="${mediaRowStyle} width: 80%;"></div>
        </div>
      </lc-hero>
      <div id="warteliste" style="max-width: 1024px; margin: 0 auto; padding: 32px 48px; box-sizing: border-box;">
        <p style="margin: 0;">Die Warteliste: das Ziel des Links.</p>
      </div>`,
  }),
};

/** 3.36 (request 056, cockpit row 1): the stage under a page header, its title an `h2`. */
export const HeadingLevel: Story = {
  name: 'Heading Level',
  args: { headingLevel: 2 },
  parameters: {
    controls: { include: ['headingLevel'] },
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence cockpit row 1): `[headingLevel]="2"`. The page title „Cockpit“ is the `h1` of the `lc-page-header`; the stage\'s title „522.530,00 €“ is an `h2`, so the page has exactly one `h1`. Only the element changes: size, weight, line height and spacing are those of the `h1` title at every level, `size`, `variant` and breakpoint. Default 1 (an `h1`, as before).',
      },
    },
  },
  render: (args) => ({
    props: { headingLevel: args.headingLevel },
    moduleMetadata: { imports: [PageHeaderComponent] },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-page-header title="Cockpit" subtitle="Oktober 2026 · Fassung 1" />
        <lc-hero label="Gesamtkosten Ist" title="522.530,00 €" color="primary" size="sm" [headingLevel]="headingLevel">
          <p style="margin: 0;">Plan 600.000,00 € · 87 % verbraucht</p>
        </lc-hero>
      </div>`,
  }),
};

/**
 * 3.36 (request 056, monatsstand row 1): „Freigeben“ replaces the stage's
 * state and disappears; the page then moves focus to the stage's title.
 */
@Component({
  selector: 'lc-hero-focus-title-demo',
  standalone: true,
  imports: [HeroComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-hero
        [label]="released() ? 'Monatsstand Oktober 2026 · Fassung 1 freigegeben' : 'Monatsstand Oktober 2026 · Entwurf'"
        title="522.530,00 €"
        [color]="color()"
        size="sm"
        [headingLevel]="2"
      >
        <p style="margin: 0;">{{ released() ? 'Freigegeben am 07.11.2026 von Johanna Müller.' : 'Der Entwurf wartet auf die Freigabe.' }}</p>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px;">
          @if (!released()) {
            <lc-button variant="inverse" size="lg" (clicked)="release()">Freigeben</lc-button>
          }
          <lc-button variant="inverse-outline" size="lg">
            <lc-icon slot="icon-before" name="info-circle" size="sm" [decorative]="true" />
            Herkunft
          </lc-button>
        </div>
      </lc-hero>
    </div>
  `,
})
class HeroFocusTitleDemoComponent {
  /** Passed to the hero's `color`. */
  readonly color = input<HeroColor>('primary');
  private readonly injector = inject(Injector);
  private readonly hero = viewChild.required(HeroComponent);
  protected readonly released = signal(false);

  protected release(): void {
    this.released.set(true);
    // After the render: the button that was used is gone, focus goes to the title.
    afterNextRender(() => this.hero().focusTitle(), { injector: this.injector });
  }
}

const FOCUS_TITLE_SNIPPET = `import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { ButtonComponent } from '@lifecorner/angular-ui-kit/button';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';

@Component({
  selector: 'app-month-stage',
  imports: [HeroComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <lc-hero [label]="label()" title="522.530,00 €" [headingLevel]="2">
      @if (!released()) {
        <lc-button variant="inverse" size="lg" (clicked)="release()">Freigeben</lc-button>
      }
      <lc-button variant="inverse-outline" size="lg">Herkunft</lc-button>
    </lc-hero>
  \`,
})
export class MonthStageComponent {
  private readonly injector = inject(Injector);
  private readonly hero = viewChild.required(HeroComponent);
  protected readonly released = signal(false);
  protected readonly label = computed(() =>
    this.released() ? 'Monatsstand Oktober 2026 · Fassung 1 freigegeben' : 'Monatsstand Oktober 2026 · Entwurf',
  );

  protected release(): void {
    this.released.set(true);
    afterNextRender(() => this.hero().focusTitle(), { injector: this.injector });
  }
}`;

export const FocusTitle: StoryObj<HeroComponent> = {
  name: 'Focus Title',
  args: { color: 'primary' },
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence monatsstand row 1): „Freigeben“ releases the draft; the stage shows the new state and the button is gone. The page calls `afterNextRender(() => this.hero().focusTitle(), { injector })`: the title gets `tabindex="-1"` (it stays out of the Tab order) and the focus, so it doesn\'t fall back to the page (WCAG 2.4.3). With a `label`, the title is named „label title“ (`aria-labelledby`), so a screen reader reads „Monatsstand Oktober 2026 · Fassung 1 freigegeben 522.530,00 €“. The ring is two-tone, a white outline over a 2 px `#111827` band (at least 4.58:1 on every `color` since the 3.38 bands), shown after a keyboard action. Without the call nothing changes. In the story view „Freigeben“ is pressed with Enter on load.',
      },
      source: { code: FOCUS_TITLE_SNIPPET, language: 'typescript' },
    },
  },
  render: (args) => ({
    props: { color: args.color },
    moduleMetadata: { imports: [HeroFocusTitleDemoComponent] },
    template: `<lc-hero-focus-title-demo [color]="color" />`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    const button = canvasElement.querySelector<HTMLButtonElement>('lc-hero-focus-title-demo lc-button button');
    button?.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvasElement.ownerDocument.activeElement?.classList.contains('hero__title')).toBe(true));
  },
};

const STAGE_COLORS: HeroColor[] = [
  'primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet',
];

/** 3.36 (request 056, monatsstand row 2): the main and the quieter action on every band. */
export const StageActions: Story = {
  name: 'Stage Actions',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence monatsstand row 2): the main action „Freigeben“ (`inverse`) and the quieter „Herkunft“ (`inverse-outline`) side by side on all nine bands, `size="lg"`: both 48.5 px high in one row, the outline clearly the quieter one. Its text keeps at least 9.36:1 and its border at least 4.58:1 on every band, and the white `inverse` pill stands out from every band at 4.58:1 or more (3.38 bands, buttons at full opacity). Last, the pair at `sm`, `md` and `lg`: the same height at every size.',
      },
    },
  },
  render: () => ({
    props: { colors: STAGE_COLORS },
    moduleMetadata: { imports: [ButtonComponent, IconComponent] },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        @for (color of colors; track color) {
          <lc-hero [label]="'Monatsstand · ' + color" title="522.530,00 €" [color]="color" size="sm" [headingLevel]="2">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
              <lc-button variant="inverse" size="lg">Freigeben</lc-button>
              <lc-button variant="inverse-outline" size="lg">
                <lc-icon slot="icon-before" name="info-circle" size="sm" [decorative]="true" />
                Herkunft
              </lc-button>
            </div>
          </lc-hero>
        }
        <lc-hero label="Größen" title="sm · md · lg" color="warning" size="sm" [headingLevel]="2">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
              <lc-button variant="inverse" size="sm">Freigeben</lc-button>
              <lc-button variant="inverse-outline" size="sm">Herkunft</lc-button>
            </div>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
              <lc-button variant="inverse" size="md">Freigeben</lc-button>
              <lc-button variant="inverse-outline" size="md">Herkunft</lc-button>
            </div>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
              <lc-button variant="inverse" size="lg">Freigeben</lc-button>
              <lc-button variant="inverse-outline" size="lg">Herkunft</lc-button>
            </div>
          </div>
        </lc-hero>
      </div>`,
  }),
};

const BADGE_VARIANTS: [BadgeVariant, string][] = [
  ['default', 'Neutral'],
  ['primary', 'Primär'],
  ['success', 'Erfolg'],
  ['warning', 'Warnung'],
  ['error', 'Fehler'],
  ['info', 'Info'],
];

/** 3.37 (request 057, monatsstand row 1): badges in the default slot at full opacity, on every band. */
export const BadgesInTheBody: Story = {
  name: 'Badges in the Body',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.37 (request 057, finance-intelligence monatsstand row 1, WCAG 1.4.3): the seal of the month, `lc-badge` `size="sm"` `rounded` „Entwurf“ (`warning`) and „Freigegeben“ (`success`), in the default slot of all nine bands and one light variant, with the six variants at `xs` below. The slot has no `opacity` (before 3.37 it was 0.85 on the whole slot), so the badges keep their opaque fills; its text is white at full strength on the dark bands (since 3.38, 4.58:1 or more) and 75 % neutral-800 in the light variant. In a hero they take the light palette in both themes (the bands don\'t follow the theme): at least default 6.87, primary 8.49, success 4.85, warning 5.52, error 10.98 and info 9.08:1 on every band (before 3.37: success 3.83–4.16, warning 4.23–4.67 on the dark bands; down to 1.00 in dark).',
      },
    },
  },
  render: () => ({
    props: { colors: STAGE_COLORS, variants: BADGE_VARIANTS },
    moduleMetadata: { imports: [BadgeComponent] },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        @for (color of colors; track color) {
          <lc-hero [label]="'Monatsstand · ' + color" title="522.530,00 €" [color]="color" size="sm" [headingLevel]="2">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
              <span>September 2026</span>
              <lc-badge size="sm" variant="warning" [rounded]="true">Entwurf</lc-badge>
              <lc-badge size="sm" variant="success" [rounded]="true">Freigegeben</lc-badge>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
              @for (v of variants; track v[0]) {
                <lc-badge size="xs" [variant]="v[0]">{{ v[1] }}</lc-badge>
              }
            </div>
          </lc-hero>
        }
        <lc-hero label="Monatsstand · light" title="522.530,00 €" color="primary" variant="light" size="sm" [headingLevel]="2">
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
            <span>September 2026</span>
            <lc-badge size="sm" variant="warning" [rounded]="true">Entwurf</lc-badge>
            <lc-badge size="sm" variant="success" [rounded]="true">Freigegeben</lc-badge>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
            @for (v of variants; track v[0]) {
              <lc-badge size="xs" [variant]="v[0]">{{ v[1] }}</lc-badge>
            }
          </div>
        </lc-hero>
      </div>`,
  }),
};

const distributionItems = [
  { term: 'Netz', value: '214.300,00 €' },
  { term: 'Arbeitsplatz', value: '175.730,00 €' },
  { term: 'Rechenzentrum', value: '98.410,00 €' },
  { term: 'Anwendungen', value: '61.230,00 €' },
  { term: 'Telefonie', value: '24.500,00 €' },
  { term: 'Druck', value: '12.870,00 €' },
  { term: 'Beratung', value: '9.400,00 €' },
  { term: 'Ohne Service', value: '132.500,00 €' },
];

/** 3.37 (request 057, cockpit row 1): the hero fills its grid row beside a taller card. */
export const Fill: Story = {
  name: 'Fill',
  args: {
    fill: true,
    size: 'sm',
    color: 'primary',
    variant: 'default',
  },
  parameters: {
    controls: { include: ['fill', 'size', 'color', 'variant'] },
    docs: {
      description: {
        story:
          '3.37 (request 057, finance-intelligence cockpit row 1): `fill` makes the hero take the height its container gives it. In a two-column grid (stretching its items) beside a taller `lc-card` with eight rows, the band ends exactly at the row\'s bottom edge, at every size, colour and variant; the label, title and body stay at the top and the `[hero-footer]` sits at the bottom. Without `fill` (switch it off) the hero is as tall as its content, as before. Content taller than the row makes the row grow.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, items: distributionItems },
    moduleMetadata: { imports: [CardComponent, DescriptionListComponent] },
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: stretch;">
        <lc-hero label="Oktober 2026" title="Cockpit" [fill]="fill" [size]="size" [color]="color" [variant]="variant" [headingLevel]="2">
          <p style="margin: 0;">Ist-Kosten aller Services</p>
          <div hero-footer>
            <div style="${footerStatStyle}">
              <span style="${statLabelStyle}">IST</span>
              <span style="${statValueStyle}">729.940 €</span>
            </div>
            <div style="${footerStatStyle}">
              <span style="${statLabelStyle}">PLAN</span>
              <span style="${statValueStyle}">810.000 €</span>
            </div>
          </div>
        </lc-hero>
        <lc-card title="Verteilung" variant="outlined" [headingLevel]="2">
          <lc-description-list [items]="items" />
        </lc-card>
      </div>`,
  }),
};
