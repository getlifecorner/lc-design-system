import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { ButtonLinkComponent } from './button-link.component';

const meta: Meta<ButtonLinkComponent> = {
  title: 'Components/Button Link',
  component: ButtonLinkComponent,
  parameters: {
    docs: {
      description: {
        component: `
\`a[lcButton]\` — the \`lc-button\` look on a native link. Use it for navigation that
should look like a button: calls to action, "read more" links, a language switch,
links to social profiles.

\`\`\`html
<a lcButton variant="primary" size="lg" href="/de/neuigkeiten">Schau uns beim Bauen zu</a>
<a lcButton variant="ghost" href="/en/security" hreflang="en" lang="en">English</a>
\`\`\`

**How it differs from \`lc-button\`**
- The host *is* the \`<a>\`: there is no wrapper and no inner \`<button>\`. Every native
  link attribute — \`href\`, \`hreflang\`, \`lang\`, \`rel\`, \`target\`, \`download\`,
  \`title\`, \`aria-*\` — passes through untouched (they are not inputs).
- No event listeners: navigation is the browser's. After SSR or prerendering the
  markup is a plain \`<a class="btn btn-primary btn-lg" href="…">\`, so it works with
  JavaScript disabled. \`routerLink\` may sit on the same anchor for in-app navigation.
- Same variants (\`primary | secondary | outline | ghost | link | danger | warning | info\`),
  sizes (\`xs | sm | md | lg\`) and modifiers (\`fullWidth\`, \`iconOnly\`, \`inline\`, \`flush\`) as
  \`lc-button\`, from the same stylesheet. Icon slots: \`[slot='icon-before']\`,
  \`[slot='icon-after']\`.
- Labels wrap instead of overflowing the viewport (WCAG 1.4.10 reflow).
- A link cannot be disabled or busy — render plain text or an \`lc-button\` for those
  states. \`iconOnly\` links need an \`aria-label\`.

**Touch target:** \`size="lg"\` is 48.5 px high (2 × 12 px padding + 18 px × 1.25 line
height + 2 × 1 px border) and meets the 44 px target; \`md\` is 42 px, \`sm\` 35.5 px.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'warning', 'info'],
      description: 'Visual style variant (same as lc-button)',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size (same as lc-button); lg meets the 44 px touch target',
      table: { defaultValue: { summary: 'md' } },
    },
    fullWidth: { control: 'boolean', description: 'Stretches the link to the full container width' },
    iconOnly: { control: 'boolean', description: 'Square icon-only link (needs aria-label)' },
    inline: { control: 'boolean', description: 'Flows with surrounding text (pair with variant="link")' },
    flush: {
      control: 'boolean',
      description:
        '3.9 (AS-26): drops the inline padding so a `variant="link"` link sits flush with the content edge; it keeps its height and a 44 × 44 px minimum target. The label starts at the edge; `--lc-btn-flush-align: end` puts it at the end edge (a link at the end of a row). Ignored on other variants and with `iconOnly`',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonLinkComponent>;

export const Primary: Story = {
  args: { variant: 'primary', size: 'lg' },
  render: (args) => ({
    props: args,
    template: `<a lcButton [variant]="variant" [size]="size" href="#neuigkeiten">Schau uns beim Bauen zu</a>`,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /schau uns beim bauen zu/i });
    await expect(link.tagName).toBe('A');
    await expect(link.getAttribute('href')).toBe('#neuigkeiten');
    await expect(link.classList.contains('btn-lg')).toBe(true);
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <a lcButton variant="primary" href="#primary">Primary</a>
        <a lcButton variant="secondary" href="#secondary">Secondary</a>
        <a lcButton variant="outline" href="#outline">Outline</a>
        <a lcButton variant="ghost" href="#ghost">Ghost</a>
        <a lcButton variant="link" href="#link">Link</a>
        <a lcButton variant="danger" href="#danger">Danger</a>
        <a lcButton variant="warning" href="#warning">Warning</a>
        <a lcButton variant="info" href="#info">Info</a>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <a lcButton size="xs" href="#xs">Extra small</a>
        <a lcButton size="sm" href="#sm">Small</a>
        <a lcButton size="md" href="#md">Medium (42 px)</a>
        <a lcButton size="lg" href="#lg">Large (48.5 px, touch target)</a>
      </div>
    `,
  }),
};

/** Language switch: `hreflang` names the target language, `lang` the language of the label. */
export const LanguageSwitch: Story = {
  render: () => ({
    template: `
      <a lcButton variant="ghost" size="lg" href="#en-security" hreflang="en" lang="en"
         aria-label="Open this page in English">English</a>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /open this page in english/i });
    await expect(link.getAttribute('hreflang')).toBe('en');
    await expect(link.getAttribute('lang')).toBe('en');
  },
};

/** Secondary links at the end of a page: outline, large, full width on phones. */
export const SecondaryLinks: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px; max-width: 360px;">
        <a lcButton variant="outline" size="lg" [fullWidth]="true" href="#sicherheit">Sind meine Daten sicher?</a>
        <a lcButton variant="outline" size="lg" [fullWidth]="true" href="#so-bauen-wir">Wer das baut, und wie?</a>
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <a lcButton variant="primary" href="#weiter">
          Weiter
          <lc-icon slot="icon-after" name="arrow-right" size="sm" [decorative]="true" />
        </a>
        <a lcButton variant="outline" href="#profil" rel="me">
          <lc-icon slot="icon-before" name="external-link" size="sm" [decorative]="true" />
          LinkedIn
        </a>
        <a lcButton variant="ghost" [iconOnly]="true" href="#start" aria-label="Startseite">
          <lc-icon name="home" size="sm" [decorative]="true" />
        </a>
      </div>
    `,
  }),
};

/** `variant="link"` with `inline` reads as a link inside running text — underlined at rest since 3.6 (AS-19). */
export const InlineInText: Story = {
  render: () => ({
    template: `
      <p style="max-width: 420px; line-height: 1.6;">
        Alle Entscheidungen stehen auf der Seite
        <a lcButton variant="link" [inline]="true" href="#so-bauen-wir">So bauen wir</a>,
        jede mit Datum.
      </p>
    `,
  }),
};

const wrapCopy = {
  en: { before: 'By signing in you accept the', link: 'privacy policy and the terms of use of the household app', after: 'for everyone in it.' },
  de: { before: 'Mit der Anmeldung stimmst du der', link: 'Datenschutzerklärung und den Nutzungsbedingungen der Haushalts-App', after: 'für alle Mitglieder zu.' },
};

/**
 * 3.6 (AS-19): the underline is decoration — it takes no space, so a link
 * that wraps over two lines keeps the paragraph's line boxes. Each paragraph
 * twice: with the default underline and with `--lc-btn-inline-text-decoration: none`.
 */
export const InlineLinkWrapping: Story = {
  name: 'Inline link wrapping',
  argTypes: {
    '--lc-btn-inline-text-decoration': {
      control: false,
      description:
        'CSS hook on `a[lcButton]` / `lc-button` with `inline`: the `text-decoration` of the inline link. `none` only for a non-text use (a linked counter in a table); keep the default in running text (WCAG 1.4.1).',
      table: { category: 'CSS hooks', defaultValue: { summary: 'underline' } },
    },
  } as Meta<ButtonLinkComponent>['argTypes'],
  parameters: {
    docs: {
      description: {
        story:
          'A sign-in page at 360 px (312 px of text), English and German, the link wrapping over two lines. The left paragraph of each pair has the default underline, the right one `--lc-btn-inline-text-decoration: none`: both are the same height, so the line changes neither line height nor wrapping.',
      },
    },
  },
  render: () => ({
    props: { copy: [wrapCopy.en, wrapCopy.de] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        @for (text of copy; track text.link) {
          <div style="display: flex; flex-wrap: wrap; gap: 24px;">
            <p class="wrap-default" style="max-width: 312px; margin: 0; font-size: 16px; line-height: 1.5; color: var(--color-text-primary);">
              {{ text.before }} <a lcButton variant="link" [inline]="true" href="#datenschutz">{{ text.link }}</a> {{ text.after }}
            </p>
            <p class="wrap-none" style="max-width: 312px; margin: 0; font-size: 16px; line-height: 1.5; color: var(--color-text-primary); --lc-btn-inline-text-decoration: none;">
              {{ text.before }} <a lcButton variant="link" [inline]="true" href="#datenschutz">{{ text.link }}</a> {{ text.after }}
            </p>
          </div>
        }
      </div>
    `,
  }),
};

/**
 * 3.9 (AS-26): `flush` on a `variant="link"` link drops the inline padding, so
 * the label starts at the content edge, like the paragraph above it. The link
 * keeps its height (46.5 px at `lg`) and a 44 × 44 px minimum target. At the
 * end edge of a row, `--lc-btn-flush-align: end` puts every line at that edge.
 */
export const Flush: Story = {
  argTypes: {
    // The hook, documented here (it is CSS, not an input).
    '--lc-btn-flush-align': {
      control: false,
      description:
        'CSS hook on `a[lcButton]` / `lc-button` with `flush`: the edge the label sits on, `start` or `end`. `end` puts the label and every wrapped line at the end edge, for a link at the end of a row (`justify-content: space-between`). It inherits: set it on the link, the `lc-button` host or an ancestor, no `::ng-deep`.',
      table: { category: 'CSS hooks', defaultValue: { summary: 'start' } },
    },
  } as Meta<ButtonLinkComponent>['argTypes'],
  parameters: {
    docs: {
      description: {
        story:
          'A sign-in step at 360 px (a 312 px column): the paragraph and the three flush `lg` links start at the same x, also the one with an icon and the two-letter "Ja", which stays 44 px wide. The fourth link is without `flush`, for comparison: its label starts 24 px in. Below, a row with `justify-content: space-between`: "Neu senden in 25 s" on the start edge and "Anders anmelden" with `--lc-btn-flush-align: end` on the end edge; it wraps to two lines, and both end at the row\'s edge. The focus ring reaches 4 px past the edge, so leave that room (no `overflow: hidden` at the edge).',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="width: 312px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
        <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.5; color: var(--color-text-primary);">Wir haben dir einen Code geschickt.</p>
        <a lcButton variant="link" size="lg" [flush]="true" href="#code">Code erneut senden</a>
        <a lcButton variant="link" size="lg" [flush]="true" href="#anderer-weg">
          <lc-icon slot="icon-before" name="arrow-left" size="sm" [decorative]="true" />
          Anderen Weg wählen
        </a>
        <a lcButton variant="link" size="lg" [flush]="true" href="#ja">Ja</a>
        <a lcButton variant="link" size="lg" href="#ohne">Ohne flush</a>
        <div style="width: 312px; margin-top: 24px; display: flex; justify-content: space-between; gap: 8px;">
          <a lcButton variant="link" size="lg" [flush]="true" href="#neu-senden" style="flex: 0 0 auto;">Neu senden in 25 s</a>
          <a lcButton variant="link" size="lg" [flush]="true" href="#anders-anmelden" style="flex: 0 1 auto; min-width: 0; --lc-btn-flush-align: end;">Anders anmelden</a>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Code erneut senden' }).classList.contains('btn-flush')).toBe(true);
    await expect(canvas.getByRole('link', { name: 'Ohne flush' }).classList.contains('btn-flush')).toBe(false);
    const endLink = canvas.getByRole('link', { name: 'Anders anmelden' });
    await expect(getComputedStyle(endLink).textAlign).toBe('end');
    await expect(getComputedStyle(endLink).justifyContent).toBe('end');
  },
};
