import type { Meta, StoryObj } from '@storybook/angular';
import { LogoComponent } from './logo.component';

/**
 * The LifeCorner logo: Edu, the emblem, and the LifeCorner lockup.
 * Renders the lockup or the emblem only, follows the app theme with its own
 * dark drawings, and switches to the small emblem at 32 px and below.
 */
const meta: Meta<LogoComponent> = {
  title: 'Components/Logo',
  component: LogoComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['full', 'emblem'],
      description: 'The lockup (emblem and name) or the emblem only',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Height: xs 24 px, sm 32 px, md 48 px, lg 64 px, xl 96 px. The emblem uses its small drawing at xs and sm.',
    },
    alt: { description: 'Alt text. Defaults to "LifeCorner"; set your brand name when you pass your own sources.' },
    clickable: { description: 'Adds hover effect and cursor pointer (for use as a link)' },
    colorMode: {
      control: 'select',
      options: ['auto', 'light', 'dark'],
      description:
        'auto follows the app theme (light source on light, dark source on dark, including `:root.system`); light or dark pins one source. No CSS inversion.',
    },
    src: { control: 'text', description: 'Custom URL for the lockup; replaces the built-in LifeCorner lockup' },
    emblemSrc: { control: 'text', description: 'Custom URL for the emblem; replaces the built-in emblem at every size' },
    darkSrc: {
      control: 'text',
      description: 'Dark-theme URL for the lockup. Without it a custom `src` is shown on dark too.',
    },
    darkEmblemSrc: { control: 'text', description: 'Dark-theme URL for the emblem' },
    srcWidth: {
      control: 'number',
      description:
        'Intrinsic width in px of your `src` file (and `darkSrc`), written as the `<img>` `width`. Set it with `srcHeight` so the box is reserved before the file loads; `size` still sets the rendered height. Without both, no size attributes.',
      table: { defaultValue: { summary: 'undefined' } },
    },
    srcHeight: {
      control: 'number',
      description: 'Intrinsic height in px of your `src` file (and `darkSrc`). See `srcWidth`.',
      table: { defaultValue: { summary: 'undefined' } },
    },
    emblemSrcWidth: {
      control: 'number',
      description:
        'Intrinsic width in px of your `emblemSrc` file (and `darkEmblemSrc`), written as the `<img>` `width`; set it with `emblemSrcHeight`.',
      table: { defaultValue: { summary: 'undefined' } },
    },
    emblemSrcHeight: {
      control: 'number',
      description: 'Intrinsic height in px of your `emblemSrc` file (and `darkEmblemSrc`). See `emblemSrcWidth`.',
      table: { defaultValue: { summary: 'undefined' } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
The LifeCorner logo: **Edu**, the emblem (a head, two eyes, four arms ending in connection points), and the **LifeCorner lockup** (filled emblem, "Life" and "Corner" in Plus Jakarta Sans Bold, outlined to paths).

**Built-in assets** (served from \`LC_LOGO_BASE_PATH\`, default \`/assets\`):

| Variant | Light | Dark |
|---|---|---|
| \`full\` | \`lifecorner-logo.svg\` | \`lifecorner-logo-on-dark.svg\` |
| \`emblem\`, md to xl | \`lifecorner-emblem.svg\` | \`lifecorner-emblem-on-dark.svg\` |
| \`emblem\`, xs and sm (≤ 32 px) | \`lifecorner-emblem-small.svg\` | \`lifecorner-emblem-small-on-dark.svg\` |

\`lifecorner-emblem-mono.svg\` (one colour) ships for print and one-colour uses.

**Theme:** with \`colorMode="auto"\` both drawings are in the DOM and the root theme picks one, with the selectors of the theme stylesheets: dark under \`:root.dark\`, a root without a theme class, and \`:root.system\` while the OS is dark; light under \`:root.light\` and \`:root.system\` while the OS is light. No script, right on the first paint.

**Intrinsic size** (3.11.2, G-38): every \`<img>\` carries the \`width\` and \`height\` of the file it shows, so the browser reserves the logo's box before the file loads. CSS still sets the rendered height (\`size\`) with \`width: auto\`, so the loaded logo is the same size as before.

| The \`<img>\` shows | \`width\` / \`height\` |
|---|---|
| the built-in lockup (light or dark) | 485 / 100 at every size |
| the built-in emblem (normal or small, light or dark) | the size's px squared: 24, 32, 48, 64, 96 |
| \`src\` or \`darkSrc\` | \`srcWidth\` / \`srcHeight\`, otherwise none |
| \`emblemSrc\` or \`darkEmblemSrc\` | \`emblemSrcWidth\` / \`emblemSrcHeight\`, otherwise none |

A pair is written only when both values are set (a whole number of px > 0; \`srcWidth="160"\` works too). The kit doesn't know the ratio of your file, so without the inputs a custom logo has no size attributes, as before.

**Rules:** the logo is flat and fixed. Never animate, rotate, pose, recolour or distort it; scale it only proportionally. The lockup always uses the filled emblem. In running text the name is plain text.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<LogoComponent>;

export const Full: Story = {
  name: 'Lockup',
  args: { variant: 'full', size: 'md' },
};

export const Emblem: Story = {
  name: 'Emblem Only',
  args: { variant: 'emblem', size: 'md' },
};

export const SmallEmblem: Story = {
  name: 'Small Emblem (≤ 32 px)',
  args: { variant: 'emblem', size: 'sm' },
  parameters: {
    docs: {
      description: {
        story: 'At `xs` and `sm` the emblem switches to its small drawing: heavier arms and filled connection points, so it stays crisp down to 16 px.',
      },
    },
  },
};

export const LightAndDark: Story = {
  name: 'Light and Dark',
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        <div style="display: flex; flex-direction: column; gap: 20px; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <lc-logo variant="full" size="md" colorMode="light"></lc-logo>
          <div style="display: flex; align-items: center; gap: 16px;">
            <lc-logo variant="emblem" size="lg" colorMode="light"></lc-logo>
            <lc-logo variant="emblem" size="sm" colorMode="light"></lc-logo>
            <lc-logo variant="emblem" size="xs" colorMode="light"></lc-logo>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px; padding: 24px; background: #0a121b; border-radius: 12px;">
          <lc-logo variant="full" size="md" colorMode="dark"></lc-logo>
          <div style="display: flex; align-items: center; gap: 16px;">
            <lc-logo variant="emblem" size="lg" colorMode="dark"></lc-logo>
            <lc-logo variant="emblem" size="sm" colorMode="dark"></lc-logo>
            <lc-logo variant="emblem" size="xs" colorMode="dark"></lc-logo>
          </div>
        </div>
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Each drawing pinned with `colorMode`. With the default `auto` the logo follows the app theme on its own.',
      },
    },
  },
};

export const Clickable: Story = {
  args: { variant: 'full', size: 'md', clickable: true },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; color: var(--color-text-secondary); width: 24px;">xs</span>
          <lc-logo variant="full" size="xs"></lc-logo>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; color: var(--color-text-secondary); width: 24px;">sm</span>
          <lc-logo variant="full" size="sm"></lc-logo>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; color: var(--color-text-secondary); width: 24px;">md</span>
          <lc-logo variant="full" size="md"></lc-logo>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; color: var(--color-text-secondary); width: 24px;">lg</span>
          <lc-logo variant="full" size="lg"></lc-logo>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; color: var(--color-text-secondary); width: 24px;">xl</span>
          <lc-logo variant="full" size="xl"></lc-logo>
        </div>
      </div>`,
  }),
};

export const EmblemSizes: Story = {
  name: 'Emblem Sizes',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 20px;">
        <lc-logo variant="emblem" size="xs"></lc-logo>
        <lc-logo variant="emblem" size="sm"></lc-logo>
        <lc-logo variant="emblem" size="md"></lc-logo>
        <lc-logo variant="emblem" size="lg"></lc-logo>
        <lc-logo variant="emblem" size="xl"></lc-logo>
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'xs and sm use the small drawing; md, lg and xl the standard one.',
      },
    },
  },
};

export const InHeader: Story = {
  name: 'In Header (Composition)',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-bottom: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <lc-logo variant="full" size="sm" [clickable]="true"></lc-logo>
          <span style="color: var(--color-border);">|</span>
          <span style="font-size: 13px; color: var(--color-text-secondary);">Design System</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px;">Sarah Connor</span>
        </div>
      </div>`,
  }),
};

export const OnDarkBackground: Story = {
  name: 'On Dark Background',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 24px; padding: 24px; background: #0a121b; border-radius: 8px;">
        <lc-logo variant="full" size="md" colorMode="dark"></lc-logo>
        <lc-logo variant="emblem" size="md" colorMode="dark"></lc-logo>
      </div>`,
  }),
};

/**
 * Consuming apps can supply their own brand assets via `src`, `emblemSrc`,
 * `darkSrc` and `darkEmblemSrc` — no need to fork the component.
 *
 * A custom logo is never recoloured: without a dark partner it is shown as it
 * is on dark too.
 */
export const CustomBrand: Story = {
  name: 'Custom Brand Logo',
  args: {
    variant: 'full',
    size: 'md',
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    alt: 'Acme Inc.',
  },
  parameters: {
    docs: {
      description: {
        story: `
\`\`\`html
<lc-logo
  src="/assets/acme-logo.svg"
  emblemSrc="/assets/acme-emblem.svg"
  darkSrc="/assets/acme-logo-dark.svg"
  darkEmblemSrc="/assets/acme-emblem-dark.svg"
  alt="Acme Inc.">
</lc-logo>
\`\`\`

\`darkSrc\` / \`darkEmblemSrc\` are optional. When provided, the logo
swaps with the **app theme** (\`:root.dark\`, the dark-first default, or
\`:root.system\` while the OS is dark), pure CSS, no JavaScript needed.
\`colorMode="light|dark"\` pins one source.
`,
      },
    },
  },
};

/**
 * A custom lockup with `srcWidth` / `srcHeight` (3.11.2, G-38): both `<img>`
 * carry the pair, so the box is reserved before the file loads.
 */
export const CustomLockupWithSize: Story = {
  name: 'Custom Lockup with Intrinsic Size',
  args: {
    variant: 'full',
    size: 'md',
    src: '/assets/lifecorner-logo.svg',
    darkSrc: '/assets/lifecorner-logo-on-dark.svg',
    srcWidth: 485,
    srcHeight: 100,
    alt: 'Acme Inc.',
  },
  parameters: {
    docs: {
      description: {
        story: `
The kit's own lockup files stand in for a brand file here, so the story works offline. Set the pair to your file's own size (its \`viewBox\` or \`width\`/\`height\`); the light and the dark \`<img>\` both carry it.

\`\`\`html
<lc-logo
  src="/assets/acme-logo.svg"
  darkSrc="/assets/acme-logo-dark.svg"
  [srcWidth]="485"
  [srcHeight]="100"
  alt="Acme Inc.">
</lc-logo>
\`\`\`
`,
      },
    },
  },
};

/**
 * A custom emblem with `emblemSrcWidth` / `emblemSrcHeight` (3.11.2, G-38):
 * rendered 64 × 64 at `lg`, attributes 100 × 100 from the file.
 */
export const CustomEmblemWithSize: Story = {
  name: 'Custom Emblem with Intrinsic Size',
  args: {
    variant: 'emblem',
    size: 'lg',
    emblemSrc: '/assets/lifecorner-emblem.svg',
    darkEmblemSrc: '/assets/lifecorner-emblem-on-dark.svg',
    emblemSrcWidth: 100,
    emblemSrcHeight: 100,
    alt: 'Acme Inc.',
  },
  parameters: {
    docs: {
      description: {
        story: `
The kit's own emblem files stand in for a brand file here, so the story works offline. The emblem pair applies to \`emblemSrc\` and \`darkEmblemSrc\` only (the dark \`<img>\` shares it); the lockup pair (\`srcWidth\` / \`srcHeight\`) to \`src\` and \`darkSrc\`. Rendered 64 × 64 (\`size="lg"\`), attributes 100 × 100.

\`\`\`html
<lc-logo
  variant="emblem"
  size="lg"
  emblemSrc="/assets/acme-emblem.svg"
  darkEmblemSrc="/assets/acme-emblem-dark.svg"
  [emblemSrcWidth]="100"
  [emblemSrcHeight]="100"
  alt="Acme Inc.">
</lc-logo>
\`\`\`
`,
      },
    },
  },
};
