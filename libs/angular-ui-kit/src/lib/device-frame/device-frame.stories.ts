import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DeviceFrameComponent } from './device-frame.component';
import { PictureComponent } from '../picture/picture.component';
import { BadgeComponent } from '../badge/badge.component';
import { CardComponent } from '../card/card.component';

/**
 * A labelled stand-in screenshot, 720 px wide (an SVG data URI): the kit ships
 * no binary assets, and the label says which file the browser chose (D-4).
 */
function shot(label: string, theme: 'light' | 'dark' = 'light', title = 'Guten Abend', height = 1560): string {
  const c =
    theme === 'light'
      ? { bg: '#f9fafb', fg: '#111827', card: '#ffffff', line: '#d1d5db' }
      : { bg: '#0a121b', fg: '#f1f6f8', card: '#1a2c3a', line: '#374151' };
  const lower = height >= 1500 ? `<rect x="40" y="780" width="640" height="240" rx="36" fill="${c.card}"/>` : '';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}">` +
    `<rect width="720" height="${height}" fill="${c.bg}"/>` +
    `<rect x="40" y="40" width="640" height="112" rx="28" fill="${c.card}"/>` +
    `<text x="48" y="300" font-family="sans-serif" font-size="64" font-weight="700" fill="${c.fg}">${title}</text>` +
    `<rect x="40" y="380" width="640" height="360" rx="36" fill="${c.card}"/>` +
    `<rect x="88" y="440" width="420" height="28" rx="14" fill="${c.line}"/>` +
    `<rect x="88" y="500" width="300" height="28" rx="14" fill="${c.line}"/>` +
    lower +
    `<text x="48" y="${height - 60}" font-family="sans-serif" font-size="40" fill="${c.fg}">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const HOME = { light: shot('hell · 360 × 780'), dark: shot('dunkel · 360 × 780', 'dark') };
const HOME_ALT = 'Startseite der App am Abend: Begrüßung „Guten Abend, Johanna“ und die Mitglieder der Familie.';

const meta: Meta<DeviceFrameComponent> = {
  title: 'Data Display/Device Frame',
  component: DeviceFrameComponent,
  decorators: [moduleMetadata({ imports: [PictureComponent, BadgeComponent, CardComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
A phone bezel around projected media (3.39, life-os website-screenshots G-SS1), for app screenshots on a website.

**Key Features:**
- The host is the frame: black glass (#111827) in both themes inside a 1 px rim in \`--color-field-border\`,
  which keeps the frame's edge at 3:1 or more on every page and surface (light 4.39–4.83:1, dark 5.56–7.31:1)
- The media fills the screen's width and keeps its own ratio; the concentric screen radius clips it. An \`lc-picture\` or
  an \`<img width height>\` reserves the box before it loads, also in prerendered HTML
- \`size\`: \`sm\` 200, \`md\` 248, \`lg\` 320 px (never wider than the container); bezel 6 / 8 / 10 px, radius 24 / 32 / 42 px
- \`notch\`: a decorative camera pill in a three-bezel top, never over the media
- Not interactive: no role, no Tab stop, no name; screen readers read only the media's \`alt\`
- CSS hooks: \`--lc-device-frame-width\`, \`-bezel\`, \`-radius\`, \`-bezel-color\`, \`-rim-color\`, \`-notch-color\`,
  \`-shadow\` (\`--elevation-2\`), \`-screen-bg\` (\`--color-surface\`); set them on the host or any ancestor
- Forced colours: a \`CanvasText\` border, no shadow
`,
      },
    },
  },
  argTypes: {
    device: {
      control: 'select',
      options: ['phone'],
      description: "The device drawn around the media. Only `'phone'` today; more may follow",
      table: { defaultValue: { summary: "'phone'" } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Width step: `sm` 200 px, `md` 248 px, `lg` 320 px (never wider than the container); bezel and radius grow with it',
      table: { defaultValue: { summary: "'md'" } },
    },
    notch: {
      control: 'boolean',
      description: 'Draws a decorative camera pill in a deeper top bezel; it never covers the media and is hidden from assistive technology',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<DeviceFrameComponent>;

export const Default: Story = {
  args: { device: 'phone', size: 'md', notch: false },
  parameters: {
    docs: {
      description: {
        story:
          'An `lc-picture` with a light and a dark file (360 × 780, a 720 × 1560 shot at 2x) in the `md` frame: 248 px wide, the screen 232 × 502.67 px with a 24 px radius, the frame 518.67 px high. The picture follows the app theme; the rim is `--color-field-border`.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, home: HOME, alt: HOME_ALT },
    template: `
      <div lang="de">
        <lc-device-frame [device]="device" [size]="size" [notch]="notch">
          <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
        </lc-device-frame>
      </div>`,
  }),
};

export const Sizes: Story = {
  args: { notch: false },
  parameters: {
    controls: { include: ['notch'] },
    docs: {
      description: {
        story:
          '`sm` (200 px, bezel 6, radius 24, screen 188 × 407.33), `md` (248 px, bezel 8, radius 32, screen 232 × 502.67) and `lg` (320 px, bezel 10, radius 42, screen 300 × 650), bottom-aligned in a wrapping row. A frame is never wider than its container: `lg` fits the 328 px of a 360 px page.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, home: HOME, alt: HOME_ALT, sizes: ['sm', 'md', 'lg'] },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px;">
        @for (size of sizes; track size) {
          <lc-device-frame [size]="size" [notch]="notch">
            <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
          </lc-device-frame>
        }
      </div>`,
  }),
};

export const Notch: Story = {
  args: { size: 'md', notch: true },
  parameters: {
    controls: { include: ['size', 'notch'] },
    docs: {
      description: {
        story:
          '`notch`: the top bezel is three bezels deep (24 px at `md`) and holds a pill 26 % of the frame wide and one bezel high, in #374151. It is decorative (`aria-hidden`) and never covers the screen; the frame grows by two bezels (534.67 px at `md`).',
      },
    },
  },
  render: (args) => ({
    props: { ...args, home: HOME, alt: HOME_ALT },
    template: `
      <div lang="de">
        <lc-device-frame [size]="size" [notch]="notch">
          <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
        </lc-device-frame>
      </div>`,
  }),
};

/** The four shots of the life-os home section (website-screenshots §6); the first one is shorter. */
const ROW = [
  {
    light: shot('hell · 360 × 560', 'light', 'Verbinden', 1120),
    dark: shot('dunkel · 360 × 560', 'dark', 'Verbinden', 1120),
    height: 560,
    alt: 'Bank verbinden: die Liste der Banken mit Suchfeld, darüber der Hinweis, dass die Zugangsdaten nur bei der Bank bleiben.',
    badge: 'in Erprobung',
    variant: 'info',
    caption: 'Einmal verbinden, nichts abtippen.',
  },
  {
    light: shot('hell · 360 × 780', 'light', 'Guten Abend'),
    dark: shot('dunkel · 360 × 780', 'dark', 'Guten Abend'),
    height: 780,
    alt: HOME_ALT,
    badge: 'in Erprobung',
    variant: 'info',
    caption: 'Jeden Tag sehen, was zählt.',
  },
  {
    light: shot('hell · 360 × 780', 'light', 'Konten'),
    dark: shot('dunkel · 360 × 780', 'dark', 'Konten'),
    height: 780,
    alt: 'Kontenübersicht: Girokonto, Tagesgeld und Kreditkarte mit dem Stand von heute.',
    badge: 'in Erprobung',
    variant: 'info',
    caption: 'Alle Konten auf einen Blick: Girokonto, Tagesgeld und Kreditkarte mit Stand von heute, und eines davon bleibt nur für dich.',
  },
  {
    light: shot('hell · 360 × 780', 'light', 'Verträge'),
    dark: shot('dunkel · 360 × 780', 'dark', 'Verträge'),
    height: 780,
    alt: 'Verträge: eine Zahlung an die Stadtwerke, darunter der Vorschlag, sie dem Stromvertrag zuzuordnen.',
    badge: 'als Nächstes, noch nicht gebaut',
    variant: 'primary',
    caption: 'Welche Zahlung zu welchem Vertrag gehört.',
  },
];

/** Layout of the story only (life-os website-screenshots §6, design §3). */
const ROW_STYLE = `
  <style>
    .shots__row { display: flex; gap: 16px; margin-inline: -16px; padding: 0 16px 8px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; }
    .shots__row:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: -2px; }
    .shots__figure { flex: 0 0 248px; margin: 0; display: flex; flex-direction: column; gap: 8px; scroll-snap-align: start; }
    .shots__slot { block-size: 535px; display: flex; align-items: flex-end; }
    .shots__caption { margin: 0; font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-text-secondary); }
    @media (min-width: 1024px) {
      .shots__row { margin-inline: 0; padding: 0; overflow-x: visible; max-inline-size: 928px; }
      .shots__row:focus-visible { outline-offset: 2px; }
      .shots__figure { flex: 1 1 0; max-inline-size: 220px; }
      .shots__slot { block-size: 474px; }
    }
    @media (forced-colors: active) { .shots__row:focus-visible { outline-color: Highlight; } }
  </style>`;

export const ScreenshotRow: Story = {
  name: 'Screenshot Row',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The life-os home section (website-screenshots §6): four `md` frames with the notch, a badge and a caption each. At 360 px the row bleeds to the page edges and scrolls sideways with snap points (248 px figures, 80 px of the second one show); it is a named region with a Tab stop and the kit focus ring, drawn inside the region (`outline-offset: -2px`) because the row reaches the page edges. From 1024 px the four figures share up to 928 px (220 px each) and nothing scrolls. The frames sit on one baseline (the first shot is 360 × 560). The third caption is about 120 characters long and wraps in its figure.',
      },
    },
  },
  render: () => ({
    props: { shots: ROW },
    template: `${ROW_STYLE}
      <section lang="de" aria-labelledby="shots-title">
        <h2 id="shots-title" style="margin: 0 0 16px;">So sieht LifeCorner aus</h2>
        <div class="shots__row" role="region" aria-label="Bildschirmfotos der App" tabindex="0">
          @for (s of shots; track $index) {
            <figure class="shots__figure">
              <div class="shots__slot">
                <lc-device-frame notch>
                  <lc-picture [src]="s.light" [darkSrc]="s.dark" [alt]="s.alt" width="360" [height]="s.height" />
                </lc-device-frame>
              </div>
              <div><lc-badge size="xs" [variant]="s.variant" [rounded]="true">{{ s.badge }}</lc-badge></div>
              <figcaption class="shots__caption">{{ s.caption }}</figcaption>
            </figure>
          }
        </div>
      </section>`,
  }),
};

export const CardAndFrame: Story = {
  name: 'Card and Frame',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Both compositions of a 360 × 780 shot at 248 px in a wrapping row: at 360 px the frame sits below the card, from a 512 px container (2 × 248 + 16, a 544 px page) the two sit side by side. First the transition the website ships today, an outlined `lc-card` (`padding="none"`, `borderRadius="xl"`) with `--lc-picture-radius: calc(var(--border-radius-xl) - 1px)` on the picture, then the `md` frame. Without the hook `lc-picture` draws no radius or border.',
      },
    },
  },
  render: () => ({
    props: { home: HOME, alt: HOME_ALT },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
        <figure style="flex: 0 0 248px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
          <lc-card variant="outlined" padding="none" borderRadius="xl">
            <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" style="--lc-picture-radius: calc(var(--border-radius-xl) - 1px);" />
          </lc-card>
          <figcaption style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Übergang: lc-card</figcaption>
        </figure>
        <figure style="flex: 0 0 248px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
          <lc-device-frame>
            <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
          </lc-device-frame>
          <figcaption style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">lc-device-frame</figcaption>
        </figure>
      </div>`,
  }),
};

export const CustomBezel: Story = {
  name: 'Custom Bezel',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The hooks. Left: set on a wrapper (an ancestor wins over the size defaults): light glass `--lc-device-frame-bezel-color: var(--color-surface-2)`, rim `var(--color-text-secondary)`, radius 40px, shadow `none`, width 280px. Right: on the host, `--lc-device-frame-bezel: 0` (a bare zero works): only the 1 px rim is left.',
      },
    },
  },
  render: () => ({
    props: { home: HOME, alt: HOME_ALT },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
        <div style="--lc-device-frame-bezel-color: var(--color-surface-2); --lc-device-frame-rim-color: var(--color-text-secondary); --lc-device-frame-radius: 40px; --lc-device-frame-shadow: none; --lc-device-frame-width: 280px;">
          <lc-device-frame>
            <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
          </lc-device-frame>
        </div>
        <lc-device-frame style="--lc-device-frame-bezel: 0;">
          <lc-picture [src]="home.light" [darkSrc]="home.dark" [alt]="alt" width="360" height="780" />
        </lc-device-frame>
      </div>`,
  }),
};

export const AnyMedia: Story = {
  name: 'Any Media',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The frame projects any element and makes it fill the screen\'s width: a bare `<img width="360" height="780">` (left; its ratio reserves the box) and a `<div>` with a heading and text (right; its content sets the height).',
      },
    },
  },
  render: () => ({
    props: { home: HOME.light, alt: HOME_ALT },
    template: `
      <div lang="de" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
        <lc-device-frame>
          <img [src]="home" [alt]="alt" width="360" height="780" />
        </lc-device-frame>
        <lc-device-frame>
          <div style="padding: 16px; color: var(--color-text-primary);">
            <h3 style="margin: 0 0 8px;">Heute</h3>
            <p style="margin: 0;">Nichts zu tun. Alle Konten sind auf dem Stand von heute, 06:00.</p>
          </div>
        </lc-device-frame>
      </div>`,
  }),
};
