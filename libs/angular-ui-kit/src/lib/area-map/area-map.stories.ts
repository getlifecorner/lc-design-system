import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CharacterComponent } from '@lifecorner/angular-ui-kit/character';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';
import { AreaMapComponent, type AreaMapGroup } from './area-map.component';

/** The DE reference content (life-os website-home-vision, R-068 / R-072). */
const DE: AreaMapGroup[] = [
  {
    status: 'Als Nächstes',
    statusVariant: 'primary',
    areas: [
      { label: 'Verträge und Versicherungen', icon: 'shield-check' },
      { label: 'Dokumente und Briefe', icon: 'mail' },
      { label: 'Haushaltsbudget', icon: 'wallet' },
    ],
  },
  {
    status: 'Gebaut',
    statusVariant: 'success',
    chipVariant: 'default',
    areas: [
      { label: 'Haushalt und Mitglieder', icon: 'users' },
      { label: 'Konten', icon: 'building-bank' },
    ],
  },
  {
    status: 'Geplant',
    statusVariant: 'info',
    placement: 'below',
    areas: [
      { label: 'Kalender und Erinnerungen', icon: 'calendar' },
      { label: 'Einkäufe', icon: 'shopping-bag' },
    ],
  },
  {
    status: 'Später',
    placement: 'below',
    areas: [
      { label: 'Zuhause und Auto', icon: 'home' },
      { label: 'Energie und Wasser', icon: 'bolt' },
      { label: 'Ziele und große Pläne', icon: 'target' },
      { label: 'Gesundheit, Fitness, Ernährung', icon: 'heart' },
      { label: 'Wichtige Menschen', icon: 'gift' },
      'Und mehr',
    ],
  },
];

/** The EN reference content (website-brief R-068 / R-072 EN). */
const EN: AreaMapGroup[] = [
  {
    status: 'Next',
    statusVariant: 'primary',
    areas: [
      { label: 'Contracts and insurance', icon: 'shield-check' },
      { label: 'Documents and letters', icon: 'mail' },
      { label: 'Household budget', icon: 'wallet' },
    ],
  },
  {
    status: 'Built',
    statusVariant: 'success',
    chipVariant: 'default',
    areas: [
      { label: 'Household and members', icon: 'users' },
      { label: 'Accounts', icon: 'building-bank' },
    ],
  },
  {
    status: 'Planned',
    statusVariant: 'info',
    placement: 'below',
    areas: [
      { label: 'Calendar and reminders', icon: 'calendar' },
      { label: 'Shopping', icon: 'shopping-bag' },
    ],
  },
  {
    status: 'Later',
    placement: 'below',
    areas: [
      { label: 'Home and car', icon: 'home' },
      { label: 'Energy and water', icon: 'bolt' },
      { label: 'Goals and big plans', icon: 'target' },
      { label: 'Health, fitness, nutrition', icon: 'heart' },
      { label: 'People who matter', icon: 'gift' },
      'And more',
    ],
  },
];

const TEXT = {
  de: {
    title: 'Verbunden, für dich und KI nutzbar',
    line: 'Jede Angabe mit Quelle. Du bestimmst, was eine KI lesen darf.',
    ariaLabel: 'Bereiche und ihr Stand',
    layerAriaLabel: 'Gemeinsame Ebene: die Bereiche, verbunden und nutzbar für dich und eine KI',
    heroTitle: 'Ein Ort für alles, was eure Familie organisiert',
    heroText: 'Heute Haushalt und Konten, als Nächstes Verträge, Dokumente und das Budget.',
  },
  en: {
    title: 'Connected, usable by you and AI',
    line: 'Every entry has its source. You decide what an AI may read.',
    heroTitle: 'One place for everything your family organises',
    heroText: 'Today the household and accounts; next contracts, documents and the budget.',
  },
};

/** A compact map for the band overview: 2 + 1 lined chips, one group below. */
const COMPACT: AreaMapGroup[] = [
  { status: 'Als Nächstes', statusVariant: 'primary', areas: [{ label: 'Verträge', icon: 'shield-check' }, { label: 'Budget', icon: 'wallet' }] },
  { status: 'Gebaut', statusVariant: 'success', chipVariant: 'default', areas: [{ label: 'Konten', icon: 'building-bank' }] },
  { status: 'Später', placement: 'below', areas: [{ label: 'Gesundheit', icon: 'heart' }, { label: 'Wichtige Menschen', icon: 'gift' }] },
];

/** Story layout only: the figure is 50 px, 60 px from 1024 px (website-home-vision §3.3). */
const FIGURE_STYLE = `
  <style>
    .am-figure { --lc-character-size: 50px; }
    @media (min-width: 1024px) { .am-figure { --lc-character-size: 60px; } }
  </style>`;

const meta: Meta<AreaMapComponent> = {
  title: 'Data Display/Area Map',
  component: AreaMapComponent,
  decorators: [moduleMetadata({ imports: [HeroComponent, CharacterComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
Status groups stacked top to bottom, each a badge and its areas as wrapping, centred chips; thin straight lines run from the chips of the upper groups into one translucent layer bar with a figure, a title and a line; quieter groups sit under a divider, without lines (3.40, life-os website-home-vision G-HV2). Made for the \`[hero-media]\` slot of \`lc-hero\`; it works on a page too.

**Key Features:**
- Data in, markup out: \`groups\` (\`status\`, \`statusVariant\`, \`areas\`, \`placement: 'above' | 'below'\`, \`chipVariant\`), \`layerTitle\`, \`layerText\`; a figure goes into \`[area-map-figure]\`, anything else after the line
- No JavaScript for the layout: the lines are CSS anchor positioning and every class is in the prerendered HTML; no inline \`style\` (works under a CSP without \`unsafe-inline\`). Without anchor positioning, with \`lines\` off and in forced colours the lines are hidden and nothing else moves
- Several maps on one page: each host scopes its anchors (\`anchor-scope: all\`)
- In \`lc-hero\`: emphasis chips in the band's dark stop, quiet chips in its ink, the layer a dark glass (white 6.40:1 or more on all nine bands); on a light hero a white glass with neutral 800 (12.51:1 or more)
- Semantics: one \`<ul role="list">\` named by \`ariaLabel\`, each group a list item with its badge text and a list of its areas, then the layer as a named group; the lines are \`aria-hidden\`; nothing is focusable
- Limits: 11 groups and 8 lines; further chips of upper groups render without a line
- CSS hooks: \`--lc-area-map-line-color\` (\`currentColor\` 50 %), \`--lc-area-map-layer-bg\` (hero glass, else \`--color-surface-secondary\`), \`--lc-area-map-layer-border\` (\`currentColor\` 32 %), \`--lc-area-map-divider-color\` (\`currentColor\` 20 %)
`,
      },
    },
  },
  argTypes: {
    groups: {
      control: 'object',
      description:
        'Status groups in visual order. `above` groups sit over the layer and their chips get lines; `below` groups sit under the divider. Rendered above-first, each part in input order. At most 11 groups and 8 lined chips; further chips render without a line. Required',
      table: { defaultValue: { summary: '— (required)' } },
    },
    layerTitle: {
      control: 'text',
      description: 'Title of the layer bar (bold, balanced). Required',
      table: { defaultValue: { summary: '— (required)' } },
    },
    layerText: {
      control: 'text',
      description: 'Line under the title; nothing is rendered when empty',
      table: { defaultValue: { summary: "''" } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name of the area list',
      table: { defaultValue: { summary: "'Areas and their status'" } },
    },
    layerAriaLabel: {
      control: 'text',
      description: 'Accessible name of the layer group; `null` uses `layerTitle`',
      table: { defaultValue: { summary: 'null' } },
    },
    lines: {
      control: 'boolean',
      description: 'Draws the lines from the chips into the layer. `false` renders no line spans: the layout browsers without anchor positioning show',
      table: { defaultValue: { summary: 'true' } },
    },
  },
};

export default meta;
type Story = StoryObj<AreaMapComponent>;

/**
 * A full-width page band (as on the website) with the map in its media slot, driven by the controls.
 * With `layout: 'fullscreen'` the media column is 320 px at 360 px (design §3).
 */
const heroTemplate = (lang: string, text: { heroTitle: string; heroText: string }, attrs = '', figureMode = 'dark') => `${FIGURE_STYLE}
  <div lang="${lang}">
    <lc-hero title="${text.heroTitle}" borderRadius="none" ${attrs} style="--lc-hero-media-width: 34rem;">
      <p style="margin: 0;">${text.heroText}</p>
      <lc-area-map hero-media [groups]="groups" [layerTitle]="layerTitle" [layerText]="layerText" [ariaLabel]="ariaLabel" [layerAriaLabel]="layerAriaLabel" [lines]="lines">
        <lc-character area-map-figure class="am-figure" pose="connects" colorMode="${figureMode}" [size]="48" />
      </lc-area-map>
    </lc-hero>
  </div>`;

const DE_ARGS = {
  groups: DE,
  layerTitle: TEXT.de.title,
  layerText: TEXT.de.line,
  ariaLabel: TEXT.de.ariaLabel,
  layerAriaLabel: TEXT.de.layerAriaLabel,
  lines: true,
};

export const OnHeroBand: Story = {
  name: 'On Hero Band',
  args: DE_ARGS,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The website home band (G-HV2) in German: `lc-hero` primary, `md`, the map in `[hero-media]` with `--lc-hero-media-width: 34rem`, the Edu figure (`lc-character` `pose="connects"` `colorMode="dark"`, 50 px, 60 px from 1024 px) in `[area-map-figure]`. Each line starts at the bottom centre of its chip and stops at the top edge of the layer, whatever the chips wrap to. Next: emphasis chips (the band\'s dark stop, white ink); Built: default chips (light palette); Planned and Later: quiet chips under the divider, without lines. A full-width page band (`borderRadius="none"`): at 360 px the map column is 320 px and the map 581 px high.',
      },
    },
  },
  render: (args) => ({ props: args, template: heroTemplate('de', TEXT.de) }),
};

export const English: Story = {
  args: { groups: EN, layerTitle: TEXT.en.title, layerText: TEXT.en.line, ariaLabel: 'Areas and their status', layerAriaLabel: null, lines: true },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The same band in English: other words, other wraps; the lines still start at each chip\'s centre. `ariaLabel` keeps its English default, the layer group takes its name from `layerTitle`.',
      },
    },
  },
  render: (args) => ({ props: args, template: heroTemplate('en', TEXT.en) }),
};

export const TwoInstances: Story = {
  name: 'Two Instances',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A German and an English map on one page. Both use the same anchor names; each host is the lines\' containing block and sets `anchor-scope: all`, so every line binds to the chips of its own map (AC-9).',
      },
    },
  },
  render: () => ({
    props: { de: DE, en: EN, text: TEXT },
    template: `${FIGURE_STYLE}
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <lc-hero lang="de" title="${TEXT.de.heroTitle}" [headingLevel]="2" style="--lc-hero-media-width: 34rem;">
          <lc-area-map hero-media [groups]="de" [layerTitle]="text.de.title" [layerText]="text.de.line" [ariaLabel]="text.de.ariaLabel">
            <lc-character area-map-figure class="am-figure" pose="connects" colorMode="dark" [size]="48" />
          </lc-area-map>
        </lc-hero>
        <lc-hero lang="en" color="success" title="${TEXT.en.heroTitle}" [headingLevel]="2" style="--lc-hero-media-width: 34rem;">
          <lc-area-map hero-media [groups]="en" [layerTitle]="text.en.title" [layerText]="text.en.line">
            <lc-character area-map-figure class="am-figure" pose="connects" colorMode="dark" [size]="48" />
          </lc-area-map>
        </lc-hero>
      </div>`,
  }),
};

const BANDS = ['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet'];

export const AllBands: Story = {
  name: 'All Bands',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A compact map (two and one lined chips, one group below) on all nine bands, the same in both themes. The layer is a dark glass, `rgba(17, 24, 39, 0.24)`: white text reads 6.40:1 or more on every band end (AC-8). Lines (white 50 %) and divider (white 20 %) are decorative.',
      },
    },
  },
  render: () => ({
    props: { groups: COMPACT, bands: BANDS, text: TEXT.de },
    template: `${FIGURE_STYLE}
      <div lang="de" style="display: flex; flex-direction: column; gap: 12px;">
        @for (band of bands; track band) {
          <lc-hero [color]="band" size="sm" [title]="band" [headingLevel]="2" style="--lc-hero-media-width: 24rem;">
            <lc-area-map hero-media [groups]="groups" [layerTitle]="text.title" [layerText]="text.line" [ariaLabel]="text.ariaLabel">
              <lc-character area-map-figure class="am-figure" pose="connects" colorMode="dark" [size]="48" />
            </lc-area-map>
          </lc-hero>
        }
      </div>`,
  }),
};

export const LightHero: Story = {
  name: 'Light Hero',
  args: DE_ARGS,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'On a light hero (`variant="light"`) the band\'s ink is neutral 800: quiet chips, lines, divider and layer border follow it, the layer is a white glass (white 50 %), its text 12.51:1 or more on every pastel band. The figure uses its own colours (`colorMode="auto"`).',
      },
    },
  },
  render: (args) => ({ props: args, template: heroTemplate('de', TEXT.de, 'variant="light"', 'auto') }),
};

export const WithoutLines: Story = {
  name: 'Without Lines',
  args: { ...DE_ARGS, lines: false },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '`[lines]="false"` renders no line spans. This is also the layout of a browser without CSS anchor positioning (`@supports not (anchor-name: --a)`) and of forced colours: groups, layer and divider stay exactly where they are (AC-7).',
      },
    },
  },
  render: (args) => ({ props: args, template: heroTemplate('de', TEXT.de) }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<AreaMapComponent & { textSize: StoryTextSize }>;

export const LargeText: LargeTextStory = {
  name: 'Large Text (phone)',
  args: { ...DE_ARGS, textSize: '200%' },
  argTypes: {
    textSize: {
      control: 'inline-radio',
      options: ['200%', '100%'],
      description:
        "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
      table: { defaultValue: { summary: "'200%'" } },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The German band with the root text at 200 % (WCAG 1.4.4 / 1.4.10). The chips wrap (`lc-chip` `wrap`), long compounds hyphenate, no chip runs out of the column at 320 px, and the lines follow the taller chips. Open it in the canvas at 360 or 320 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize">${heroTemplate('de', TEXT.de)}</div>
      <style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`,
  }),
};

export const OnPage: Story = {
  name: 'On Page',
  args: DE_ARGS,
  parameters: {
    docs: {
      description: {
        story:
          'Without a hero, on the page: the chips keep their off-band colours (emphasis: the primary fill, white ink, 6.21:1; quiet: secondary text, 7.56:1 light, 12.17:1 dark), the layer is `--color-surface-secondary` with primary text (16.12:1 / 16.60:1), lines and divider take the text colour at 50 % and 20 %.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `${FIGURE_STYLE}
      <div lang="de" style="max-width: 34rem; color: var(--color-text-primary);">
        <lc-area-map [groups]="groups" [layerTitle]="layerTitle" [layerText]="layerText" [ariaLabel]="ariaLabel" [layerAriaLabel]="layerAriaLabel" [lines]="lines">
          <lc-character area-map-figure class="am-figure" pose="connects" [size]="48" />
        </lc-area-map>
      </div>`,
  }),
};
