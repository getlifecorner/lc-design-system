import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { PictureComponent, type PictureSource } from './picture.component';
import { CardComponent } from '../card/card.component';

/**
 * A labelled stand-in screenshot, 720 px wide (an SVG data URI): the kit ships
 * no binary assets, and the label says which file the browser chose (D-4).
 * Behind `type: 'image/avif'` the browser still picks and decodes it.
 */
function shot(label: string, theme: 'light' | 'dark' = 'light', width = 720): string {
  // Every candidate keeps the 6 : 13 ratio of the 720 × 1560 shot.
  const height = Math.round(((width * 13) / 6) * 1000) / 1000;
  const c =
    theme === 'light'
      ? { bg: '#f9fafb', fg: '#111827', card: '#ffffff', line: '#d1d5db' }
      : { bg: '#0a121b', fg: '#f1f6f8', card: '#1a2c3a', line: '#374151' };
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 720 1560">` +
    `<rect width="720" height="1560" fill="${c.bg}"/>` +
    `<rect x="40" y="40" width="640" height="112" rx="28" fill="${c.card}"/>` +
    `<text x="48" y="300" font-family="sans-serif" font-size="64" font-weight="700" fill="${c.fg}">Guten Abend</text>` +
    `<rect x="40" y="380" width="640" height="360" rx="36" fill="${c.card}"/>` +
    `<rect x="88" y="440" width="420" height="28" rx="14" fill="${c.line}"/>` +
    `<rect x="88" y="500" width="300" height="28" rx="14" fill="${c.line}"/>` +
    `<rect x="40" y="780" width="640" height="240" rx="36" fill="${c.card}"/>` +
    `<text x="48" y="1420" font-family="sans-serif" font-size="64" font-weight="700" fill="${c.fg}">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ALT = 'Startseite der App am Abend: Begrüßung „Guten Abend, Johanna“ und die Mitglieder der Familie.';

const meta: Meta<PictureComponent> = {
  title: 'Data Display/Picture',
  component: PictureComponent,
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
A responsive image (3.39, life-os website-screenshots G-SS2): a native \`<picture>\` with sources, theme variants and
the intrinsic size that reserves the box before the image loads.

**Key Features:**
- \`sources\` (\`{ srcset, type?, sizes?, media?, theme? }\`) become \`<source>\` elements in their order, before the
  fallback \`<img>\` (AVIF first, then WebP); every \`srcset\` is written before the \`src\`
- \`src\`, \`alt\`, \`width\` and \`height\` are required; \`alt=""\` marks the image decorative. \`loading\` (\`lazy\`),
  \`decoding\` (\`async\`), \`fetchpriority\`, \`srcset\` and \`sizes\` for the \`<img>\`; \`sizes\` is also every source's default
- Light and dark: \`darkSrc\`/\`darkSrcset\` or a source with \`theme: 'dark'\` render a second picture, and the root theme
  shows one (as \`lc-logo\`): it follows the theme service, \`system\` and prerendered HTML with no JavaScript; with
  \`loading="lazy"\` only the visible one is fetched
- No border, radius or shadow of its own; at most as wide as its container, ratio kept. Hooks
  \`--lc-picture-radius\` (0px) and \`--lc-picture-min-width\` (0px; \`100%\` fills a wider container)
- No \`<figure>\`: wrap it in your own \`<figure>\` with a \`<figcaption>\` that doesn't repeat the \`alt\`
`,
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Required. Fallback image URL, used when no source matches',
      table: { defaultValue: { summary: '— (required)' } },
    },
    alt: {
      control: 'text',
      description: 'Required. Text alternative; `\'\'` marks the image decorative. Say what the image shows, not "screenshot of"',
      table: { defaultValue: { summary: '— (required)' } },
    },
    width: {
      control: 'number',
      description: 'Required. Intrinsic width in CSS px at 1x (360 for a 720 × 1560 file at 2x); reserves the box with `height`',
      table: { defaultValue: { summary: '— (required)' } },
    },
    height: {
      control: 'number',
      description: 'Required. Intrinsic height in CSS px at 1x (780); every source must have this ratio',
      table: { defaultValue: { summary: '— (required)' } },
    },
    sources: {
      control: 'object',
      description: '`<source>` elements `{ srcset, type?, sizes?, media?, theme? }[]`, in this order before the `<img>`',
      table: { defaultValue: { summary: '[]' } },
    },
    srcset: {
      control: 'text',
      description: '`srcset` of the `<img>`; empty writes no attribute',
      table: { defaultValue: { summary: "''" } },
    },
    sizes: {
      control: 'text',
      description: '`sizes` of the `<img>` and the default of every source (for `w` descriptors); empty writes no attribute',
      table: { defaultValue: { summary: "''" } },
    },
    darkSrc: {
      control: 'text',
      description: 'Dark-theme fallback URL; with it the picture follows the app theme',
      table: { defaultValue: { summary: "''" } },
    },
    darkSrcset: {
      control: 'text',
      description: '`srcset` of the dark `<img>`; without `darkSrc` the dark `<img>` uses `srcset`',
      table: { defaultValue: { summary: "''" } },
    },
    loading: {
      control: 'select',
      options: ['lazy', 'eager'],
      description: '`eager` above the fold. With theme variants `lazy` fetches only the visible one',
      table: { defaultValue: { summary: "'lazy'" } },
    },
    decoding: {
      control: 'select',
      options: ['async', 'sync', 'auto'],
      description: 'Decoding hint, written as is',
      table: { defaultValue: { summary: "'async'" } },
    },
    fetchpriority: {
      control: 'select',
      options: ['auto', 'high', 'low'],
      description: '`high` for the page\'s largest image (LCP); `auto` writes no attribute',
      table: { defaultValue: { summary: "'auto'" } },
    },
  },
};

export default meta;
type Story = StoryObj<PictureComponent>;

export const Default: Story = {
  args: {
    src: shot('360 × 780 · 1x', 'light', 360),
    alt: ALT,
    width: 360,
    height: 780,
    loading: 'lazy',
    decoding: 'async',
    fetchpriority: 'auto',
    srcset: `${shot('360w', 'light', 360)} 360w, ${shot('720w', 'light', 720)} 720w`,
    sizes: '(min-width: 1024px) 360px, 100vw',
  },
  parameters: {
    controls: { include: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'fetchpriority', 'srcset', 'sizes'] },
    docs: {
      description: {
        story:
          'A 720 × 1560 shot as `width="360" height="780"` with a `srcset` of 360w and 720w: the box (at most the container\'s width, ratio 6 : 13) is reserved before the file loads, at 360 px 328 × 710.67, from 1024 px 360 × 780. The label in the image names the candidate the browser chose.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de">
        <lc-picture
          [src]="src"
          [alt]="alt"
          [width]="width"
          [height]="height"
          [loading]="loading"
          [decoding]="decoding"
          [fetchpriority]="fetchpriority"
          [srcset]="srcset"
          [sizes]="sizes"
        />
      </div>`,
  }),
};

const SOURCES: PictureSource[] = [
  { type: 'image/avif', srcset: `${shot('AVIF · 280w', 'light', 280)} 280w, ${shot('AVIF · 560w', 'light', 560)} 560w` },
  { type: 'image/webp', srcset: `${shot('WebP · 280w', 'light', 280)} 280w, ${shot('WebP · 560w', 'light', 560)} 560w` },
];

export const Sources: Story = {
  args: { sources: SOURCES, sizes: '(min-width: 1024px) 200px, 248px' },
  parameters: {
    controls: { include: ['sources', 'sizes'] },
    docs: {
      description: {
        story:
          'An AVIF and a WebP source (280w and 560w each) before the PNG-style fallback, `sizes="(min-width: 1024px) 200px, 248px"`, in a 248 px box. The browser takes the first type it can decode and the candidate for the slot and pixel density; the image names it („AVIF · 280w“ at 1x, „AVIF · 560w“ at 2x). Every `srcset` is in the DOM before the `src`, so the fallback is not fetched first.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, src: shot('Fallback', 'light', 360), alt: ALT },
    template: `
      <div lang="de" style="max-width: 248px;">
        <lc-picture [src]="src" [alt]="alt" width="360" height="780" [sources]="sources" [sizes]="sizes" />
      </div>`,
  }),
};

const THEME_SOURCES: PictureSource[] = [
  { type: 'image/svg+xml', srcset: shot('hell · source'), theme: 'light' },
  { type: 'image/svg+xml', srcset: shot('dunkel · source', 'dark'), theme: 'dark' },
];

export const ThemeVariants: Story = {
  name: 'Theme Variants',
  args: { sources: THEME_SOURCES, src: shot('hell · fallback'), darkSrc: shot('dunkel · fallback', 'dark') },
  parameters: {
    controls: { include: ['sources', 'src', 'darkSrc'] },
    docs: {
      description: {
        story:
          'A light and a dark source plus `darkSrc`: two pictures are rendered and the root theme shows one, with the selectors of `lc-logo` (`:root.dark`, a root without a theme class, `:root.system` in a dark OS). Switch the theme: „hell“ and „dunkel“ swap with no flash and no JavaScript, also in prerendered HTML. With `loading="lazy"` the hidden one is not fetched. The hidden image is `display: none`, so a screen reader meets the `alt` once.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, alt: ALT },
    template: `
      <div lang="de" style="max-width: 248px;">
        <lc-picture [src]="src" [darkSrc]="darkSrc" [sources]="sources" [alt]="alt" width="360" height="780" />
      </div>`,
  }),
};

export const InACard: Story = {
  name: 'In a Card',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The figure pattern: a `<figure>` holds an outlined `lc-card` (`padding="none"`, `borderRadius="xl"`) with the picture, and a `<figcaption>` that says what the image is for, not what it shows (that is the `alt`). `--lc-picture-radius: calc(var(--border-radius-xl) - 1px)` rounds the image inside the card\'s 1 px border; without it the picture draws no radius.',
      },
    },
  },
  render: () => ({
    props: { light: shot('hell · 360 × 780'), dark: shot('dunkel · 360 × 780', 'dark'), alt: ALT },
    template: `
      <figure lang="de" style="max-width: 248px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
        <lc-card variant="outlined" padding="none" borderRadius="xl">
          <lc-picture [src]="light" [darkSrc]="dark" [alt]="alt" width="360" height="780" style="--lc-picture-radius: calc(var(--border-radius-xl) - 1px);" />
        </lc-card>
        <figcaption style="font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-text-secondary);">Jeden Tag sehen, was zählt.</figcaption>
      </figure>`,
  }),
};

export const LoadError: Story = {
  name: 'Load Error',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The file is missing (`/assets/missing-shot.png`): the box stays as reserved (248 × 537.33 in a 248 px box, the size the loaded image has), and the browser draws the `alt` inside it, here a German text of about 120 characters, clipped to the box. Nothing shifts when an image fails.',
      },
    },
  },
  render: () => ({
    props: {
      alt: 'Startseite der App am Abend: Begrüßung ‚Guten Abend, Johanna‘, darunter die Mitglieder und der Hinweis, dass nichts zu tun ist.',
    },
    template: `
      <div lang="de" style="max-width: 248px;">
        <lc-picture src="/assets/missing-shot.png" [alt]="alt" width="360" height="780" />
      </div>`,
  }),
};
