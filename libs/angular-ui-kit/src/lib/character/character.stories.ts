import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeroComponent } from '../hero/hero.component';
import { CHARACTER_POSES, type CharacterPose } from '../character-svg';
import { CharacterComponent } from './character.component';

/** The German brand names of the poses (documentation, not UI). */
const DE: Record<CharacterPose, string> = {
  hello: 'Hallo',
  'shows-the-way': 'Zeigt den Weg',
  happy: 'Freut sich',
  'welcomes-member': 'Begrüßt ein Mitglied',
  resting: 'Ruht sich aus',
  'in-his-corner': 'Sitzt in seiner Ecke',
  comforts: 'Tröstet',
  'all-done': 'Erledigt',
  calm: 'ruhig',
  connects: 'Verbindet',
  discovered: 'Hat etwas entdeckt',
  thinking: 'Denkt nach',
  'connection-paused': 'Verbindung pausiert',
  'see-you': 'Bis bald',
};

const caption = 'font-family: var(--font-family-base); font-size: var(--font-size-xs); color: var(--color-text-secondary)';

/**
 * Edu, the LifeCorner character (3.8, gap G-4): 14 poses as files, as SVG
 * strings, and as `lc-character` in its own entry.
 */
const meta: Meta<CharacterComponent> = {
  title: 'Components/Character',
  component: CharacterComponent,
  argTypes: {
    pose: {
      control: 'select',
      options: [...CHARACTER_POSES],
      description: 'Which pose to draw. `calm` is the neutral Edu.',
      table: { defaultValue: { summary: 'calm' } },
    },
    size: {
      control: 'select',
      options: [48, 64, 80, 96, 128],
      description: 'Edge of the square box in px (`size="96"` works too). `--lc-character-size` overrides it per breakpoint in CSS.',
      table: { defaultValue: { summary: '64' } },
    },
    colorMode: {
      control: 'select',
      options: ['auto', 'dark'],
      description:
        '`auto`: both drawings are in the DOM and the root theme shows one (light, dark, system), without JavaScript. `dark`: the on-dark drawing in both themes, for a fixed dark surface such as the hero band.',
      table: { defaultValue: { summary: 'auto' } },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Empty: decorative (`aria-hidden="true"`). Set: `role="img"` with this name. Your own translated text (EN "Edu waves", DE „Edu winkt"); the kit ships none.',
      table: { defaultValue: { summary: "''" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
**Edu**, the LifeCorner character: one figure in 14 still poses, drawn from the logo's parts (a head, two eyes, four arms ending in connection points). Each pose has a light drawing and a dark one. Edu never moves, never speaks and never holds anything, and he is **decorative by default**: a page reads the same without him.

**Five ways to use him** (the files are in the package's \`src/assets/character/\`, 28 files of 1.0 to 1.7 KB, 100 × 100):

| Form | How |
|---|---|
| Angular assets | \`{ "glob": "**/*", "input": "node_modules/@lifecorner/angular-ui-kit/src/assets/character", "output": "assets/character" }\` in \`angular.json\`. If you already copy the package's \`src/assets\` to \`/assets\` for \`lc-logo\`, the folder comes along. |
| \`lc-character\` | \`import { CharacterComponent } from '@lifecorner/angular-ui-kit/character'\` → \`<lc-character pose="comforts" size="96" />\`. Two \`<img>\` from \`LC_CHARACTER_BASE_PATH\` (default: \`LC_LOGO_BASE_PATH\` + \`/character\`, so \`/assets/character\`); the root theme picks one. Prerenders; no JavaScript needed to show it. |
| \`<img>\` | \`<img src="/assets/character/comforts-light.svg" alt="" width="96" height="96">\` |
| \`<picture>\` | \`<picture><source srcset="/assets/character/comforts-dark.svg" media="(prefers-color-scheme: dark)"><img src="/assets/character/comforts-light.svg" alt="" width="96" height="96"></picture>\`. This follows the OS setting only, not the app's theme class. |
| Bundler import | \`@lifecorner/angular-ui-kit/assets/character/<pose>-<light\\|dark>.svg\` resolves through the package's \`exports\`: with Angular's \`"loader": { ".svg": "file" }\` an \`import\` gives the URL (\`"text"\` gives the markup); in Node, \`createRequire(import.meta.url).resolve('@lifecorner/angular-ui-kit/assets/character/hello-light.svg')\`. |
| SVG string | \`import { CHARACTER_SVG_COMFORTS } from '@lifecorner/angular-ui-kit/character-svg'\` → \`.light\` / \`.dark\`, each equal to its file. Plain TypeScript without Angular (Node imports it); a bundler keeps only the poses you import. \`CHARACTER_SVG\` holds all 14, \`CHARACTER_POSES\` lists them. |

**Poses** (\`CharacterPose\`; the German names are the brand names):

| Pose | DE | Dark drawing |
|---|---|---|
| \`hello\` | Hallo | drawn |
| \`shows-the-way\` | Zeigt den Weg | drawn |
| \`happy\` | Freut sich | drawn |
| \`welcomes-member\` | Begrüßt ein Mitglied | by the rule |
| \`resting\` | Ruht sich aus | by the rule |
| \`in-his-corner\` | Sitzt in seiner Ecke | by the rule |
| \`comforts\` | Tröstet | by the rule |
| \`all-done\` | Erledigt | by the rule |
| \`calm\` | ruhig (the default) | drawn |
| \`connects\` | Verbindet | by the rule |
| \`discovered\` | Hat etwas entdeckt | by the rule |
| \`thinking\` | Denkt nach | by the rule |
| \`connection-paused\` | Verbindung pausiert | by the rule |
| \`see-you\` | Bis bald | by the rule |

The dark rule: body, arms and rings \`#1a6a79\` → \`#84c7d4\`; head highlight 0.14 → 0.22; cheeks \`#84c7d4\` → \`#1a6a79\`; open points \`#ffffff\` → \`#0a121b\`; accent lines, dots and arrow heads \`#84c7d4\` → \`#4f9aaa\`; walls \`#cfe0e4\`/\`#d3e2e6\` → \`#2a4250\`, \`#e9f1f3\` → \`#13222e\`; eyes, mouth and gold unchanged.

**Sizes:** \`size\` 48, 64 (default), 80, 96 or 128 px. Set \`--lc-character-size\` (a length; it inherits) on the element or a wrapper to change it per breakpoint in CSS, for example 64 px on the phone, 96 px from 1024 px and 128 px from 1920 px. The box is square and sized before JavaScript runs, so nothing shifts when the file arrives.

**On the horizon:** \`<lc-character class="lc-horizon__figure" pose="comforts" />\` as a direct child of \`.lc-horizon\`, before \`.lc-horizon__land\` (see *Design Tokens / Horizon*).

**On a card corner:** a wrapper with \`position: relative\` and the room above the card as \`padding-top\`; the figure \`position: absolute; right: 16px; top: calc(<room> - 0.875 * <size>)\`, so his feet stand on the card's top edge. On the hero band, use \`left: 16px\` instead of \`right: 16px\` where the right corner is past the band rule below.

**On a static page without JavaScript:** inline both strings at build time, each in \`<span class="edu edu--light" aria-hidden="true">\` / \`<span class="edu edu--dark" aria-hidden="true">\`, with \`.edu--dark { display: none } @media (prefers-color-scheme: dark) { .edu--light { display: none } .edu--dark { display: block } }\`.

**On the hero band** (\`colorMode="dark"\`, the band runs from \`#0d353d\` to \`#208497\` at 135°): \`#84c7d4\` reaches 6.97:1 at the band's dark start, 3.55:1 at 60 % and 3.01:1 at 75 % of the way, and 2.31:1 at the light end. Keep the box's centre where t = (x + y) / (width + height) ≤ 0.75. A band's top-right corner is at t = w / (w + h) (0.88 for 1280 × 168), so on a short, wide band stand him left of the right end.

**Contrast** (computed): light body \`#1a6a79\` on white 6.21:1, on \`--color-background-low\` 5.91:1; dark body \`#84c7d4\` on the night sky 9.14:1, on \`--color-background\` 9.95:1, on \`--color-surface\` 9.13:1.

**Accessibility:** decorative by default (\`aria-hidden="true"\`, images \`alt=""\`); never focusable, never a pointer target. \`ariaLabel\` is your own text (the kit has no built-in text, so there is no \`locale\`). A figure never carries meaning alone. In forced-colours mode a decorative figure is hidden and keeps its box; a named one stays as drawn. Nothing moves, so reduced motion changes nothing.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<CharacterComponent>;

export const Playground: Story = {
  args: { pose: 'calm', size: 64, colorMode: 'auto', ariaLabel: '' },
};

export const AllPoses: Story = {
  parameters: { docs: { description: { story: 'All 14 poses at 64 px. Switch the theme in the toolbar for the dark drawings.' } } },
  render: () => ({
    props: { poses: CHARACTER_POSES, de: DE, caption },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-6)">
        @for (pose of poses; track pose) {
          <figure style="margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2); width: 112px; text-align: center">
            <lc-character [pose]="pose" />
            <figcaption [style]="caption">{{ pose }} · {{ de[pose] }}</figcaption>
          </figure>
        }
      </div>`,
  }),
};

const poseStory = (pose: CharacterPose): Story => ({
  args: { pose },
  parameters: { docs: { description: { story: `${DE[pose]} (\`${pose}\`) at 64 and 96 px; the theme picks the drawing.` } } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: flex-end; gap: var(--spacing-6)">
        <lc-character [pose]="pose" [size]="64" />
        <lc-character [pose]="pose" [size]="96" />
      </div>`,
  }),
});

export const Hello = poseStory('hello');
export const ShowsTheWay = poseStory('shows-the-way');
export const Happy = poseStory('happy');
export const WelcomesMember = poseStory('welcomes-member');
export const Resting = poseStory('resting');
export const InHisCorner = poseStory('in-his-corner');
export const Comforts = poseStory('comforts');
export const AllDone = poseStory('all-done');
export const Calm = poseStory('calm');
export const Connects = poseStory('connects');
export const Discovered = poseStory('discovered');
export const Thinking = poseStory('thinking');
export const ConnectionPaused = poseStory('connection-paused');
export const SeeYou = poseStory('see-you');

export const Sizes: Story = {
  parameters: { docs: { description: { story: 'The five steps of `size`: 48, 64, 80, 96 and 128 px.' } } },
  render: () => ({
    props: { sizes: [48, 64, 80, 96, 128], caption },
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--spacing-4)">
        @for (size of sizes; track size) {
          <figure style="margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2)">
            <lc-character pose="calm" [size]="size" />
            <figcaption [style]="caption">{{ size }} px</figcaption>
          </figure>
        }
      </div>`,
  }),
};

export const ResponsiveSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'No input: a wrapper sets `--lc-character-size` to 64 px, 96 px from 1024 px and 128 px from 1920 px in media queries, so prerendered HTML has the right size on every screen.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="story-edu-responsive">
        <lc-character pose="hello" />
      </div>
      <style>
        .story-edu-responsive { --lc-character-size: 64px; }
        @media (min-width: 1024px) { .story-edu-responsive { --lc-character-size: 96px; } }
        @media (min-width: 1920px) { .story-edu-responsive { --lc-character-size: 128px; } }
      </style>`,
  }),
};

export const OnDarkSurface: Story = {
  args: { pose: 'hello', colorMode: 'dark' },
  decorators: [moduleMetadata({ imports: [HeroComponent] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Hallo on the hero band with `colorMode="dark"`: the on-dark drawing in both themes. He stands on the top-left corner of a card (24 px room above it, 16 px from the left), where the band is dark (box centre t ≤ 0.75 at every width).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-hero title="Welcome to LifeCorner" size="sm" borderRadius="none">
        <p style="margin: 0">Everything your household needs, in one place.</p>
        <div hero-media style="position: relative; padding-top: 24px">
          <lc-character [pose]="pose" [colorMode]="colorMode" [size]="64" style="position: absolute; left: 16px; top: calc(24px - 0.875 * 64px)" />
          <div style="padding: var(--spacing-4); border-radius: var(--border-radius-lg); background: var(--color-surface); color: var(--color-text-primary); font-family: var(--font-family-base)">
            Your first step is ready.
          </div>
        </div>
      </lc-hero>`,
  }),
};

export const WithLabel: Story = {
  args: { pose: 'hello', ariaLabel: 'Edu waves' },
  parameters: {
    docs: {
      description: {
        story: 'The semantic variant: `role="img"` with `aria-label="Edu waves"` (DE „Edu winkt"). Only where the figure says something the text around it doesn\'t.',
      },
    },
  },
};

export const StaticFiles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The files without Angular: a plain `<img>`, a `<picture>` that follows the OS colour scheme, and `lc-character` (follows the app theme), all Hallo at 64 px from `/assets/character/`.',
      },
    },
  },
  render: () => ({
    props: { caption },
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--spacing-6)">
        <figure style="margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2)">
          <img src="/assets/character/hello-light.svg" alt="" width="64" height="64" />
          <figcaption [style]="caption">&lt;img&gt;</figcaption>
        </figure>
        <figure style="margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2)">
          <picture>
            <source srcset="/assets/character/hello-dark.svg" media="(prefers-color-scheme: dark)" />
            <img src="/assets/character/hello-light.svg" alt="" width="64" height="64" style="display: block" />
          </picture>
          <figcaption [style]="caption">&lt;picture&gt;</figcaption>
        </figure>
        <figure style="margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2)">
          <lc-character pose="hello" />
          <figcaption [style]="caption">lc-character</figcaption>
        </figure>
      </div>`,
  }),
};
