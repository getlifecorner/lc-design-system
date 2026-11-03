import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DescriptionListComponent } from './description-list.component';
import { CardComponent } from '../card/card.component';
import { AccordionComponent } from '../accordion/accordion.component';

const meta: Meta<DescriptionListComponent> = {
  title: 'Components/Description List',
  component: DescriptionListComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Description list for key/value metadata (a styled \`<dl>\`).

**Key Features:**
- \`rows\` layout: term left, value right, with an optional dotted leader line
- \`stacked\` layout: term above value, for narrow columns
- Per-row value emphasis (\`default\`, \`muted\`, \`strong\`, \`primary\`) and optional links
- Semantic \`<dl>\`/\`<dt>\`/\`<dd>\` markup
- 3.3: long unbroken values (an e-mail address, an IBAN) wrap instead of overflowing the row;
  an item's \`datetime\` (ISO 8601) renders its value inside \`<time datetime>\`
- Term and value carry no browser margin; the row gap is the only space (BA-8)
- 3.23.1 (BA-10): link and \`primary\` values reach 4.5:1 in both themes; clickable rows are
  at least 44 px tall and show a 2 px focus outline (\`Highlight\` in forced colours)
- 3.25 (F-17): a clickable row holds a native button named by its term and value; the row
  keeps \`dl > div > dt + dd\` with no \`role\`, so assistive tech still reads the pairs
- 3.26 (041): \`rows\`: a row that is too narrow is shared — term and value each keep their
  width up to half of the free width (row − 32 px); the longer one wraps in the rest: the term
  at spaces, the value at spaces or inside an unbroken string. With \`leaders\` the dots sit on
  the first line, next to the value
`,
      },
    },
  },
  argTypes: {
    items: {
      description:
        '`DescriptionListItem[]`: `term`, `value`, `valueSuffix`, `href`, `emphasis`, `id`; 3.3: `datetime` (ISO 8601) renders the value inside `<time datetime>` (ignored with `href`).',
      table: { defaultValue: { summary: 'required' } },
    },
    layout: {
      control: 'inline-radio',
      options: ['rows', 'stacked'],
      description: '`rows`: term left, value right; `stacked`: term above value, for narrow columns.',
      table: { defaultValue: { summary: 'rows' } },
    },
    leaders: {
      control: 'boolean',
      description: 'A dotted leader line between term and value (rows layout).',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Density of the rows: `sm` 12 px, `md` 14 px.',
      table: { defaultValue: { summary: 'md' } },
    },
    clickable: {
      control: 'boolean',
      description:
        'Each row holds a native button, named term + value, that Tab reaches; Enter, Space and a click anywhere on the row emit itemClick. The `dl` keeps its term and value pairs (F-17, 3.25). Set this whenever itemClick is handled. 3.23.1 (BA-10): a clickable row in the `rows` layout is at least 44 px tall and shows a 2 px focus outline (`Highlight` in forced colours).',
      table: { defaultValue: { summary: 'false' } },
    },
    itemClick: {
      action: 'itemClick',
      description: 'Emitted with the item when a clickable row is clicked or activated with Enter / Space.',
      table: { defaultValue: { summary: '—' } },
    },
    separator: {
      control: 'inline-radio',
      options: ['line', 'divider', 'none'],
      description: 'Per-row separator style (rows layout). Orthogonal to `leaders`.',
      table: { defaultValue: { summary: 'line' } },
    },
  },
};

export default meta;
type Story = StoryObj<DescriptionListComponent>;

const sampleItems = [
  { term: 'Identifier', value: 'example/resource', href: '#', emphasis: 'primary' as const },
  { term: 'Access', value: 'Token stored · read only' },
  { term: 'Owner', value: 'Placeholder Team' },
  { term: 'Status', value: 'Maintained', emphasis: 'strong' as const },
  { term: 'Last change', value: 'Two hours ago', emphasis: 'muted' as const },
];

export const Rows: Story = {
  args: { items: sampleItems, layout: 'rows', leaders: false, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px;"><lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" [size]="size" /></div>`,
  }),
};

export const WithLeaders: Story = {
  args: { items: sampleItems, layout: 'rows', leaders: true, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px;"><lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" [size]="size" /></div>`,
  }),
};

export const Stacked: Story = {
  args: { items: sampleItems, layout: 'stacked', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 280px;"><lc-description-list [items]="items" [layout]="layout" [size]="size" /></div>`,
  }),
};

const qualifiedItems = [
  { term: 'Score', value: '78 / 100', valueSuffix: 'good', emphasis: 'strong' as const },
  { term: 'State', value: 'Checked out', valueSuffix: 'last change 7d ago' },
  { term: 'Location', value: 'example.host/group/resource', emphasis: 'mono' as const },
  { term: 'Revision', value: 'a1b2c3d', emphasis: 'mono' as const },
];

export const WithValueSuffix: Story = {
  name: 'Value suffix + mono values',
  args: { items: qualifiedItems, layout: 'rows', size: 'md', separator: 'line' },
  parameters: {
    docs: { description: { story: '`valueSuffix` appends a muted qualifier after the value on the same line; `emphasis: "mono"` renders the value in the monospace font (paths, URLs, hashes).' } },
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 460px;"><lc-description-list [items]="items" [layout]="layout" [size]="size" [separator]="separator" /></div>`,
  }),
};

export const DividerSeparator: Story = {
  name: 'Dashed row separator',
  args: { items: sampleItems, layout: 'rows', size: 'sm', separator: 'divider' },
  parameters: {
    docs: { description: { story: '`separator="divider"` swaps the solid row line for a subtle dashed one — a lighter treatment for dense card layouts. `separator="none"` removes the line entirely. Independent from `leaders`.' } },
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px;"><lc-description-list [items]="items" [layout]="layout" [size]="size" [separator]="separator" /></div>`,
  }),
};

/** 3.3 (AC-10, HS-3): a long address wraps at a phone width; times carry `datetime`. */
export const LongValuesAndTimes: Story = {
  name: 'Long values and times (3.3)',
  args: {
    items: [
      { term: 'E-Mail', value: 'johanna-friederike.brandt-oberhausen@example.com' },
      { term: 'Beigetreten', value: 'heute 18:05', datetime: '2026-10-12T18:05:00+02:00' },
      { term: 'Gerät', value: 'Samsung Galaxy S24 Ultra (Android 16)' },
    ],
    layout: 'rows',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 312px;">
        <lc-description-list [items]="items" [layout]="layout" [size]="size" />
      </div>
    `,
  }),
};

const rejectionCardTemplate = `
  <lc-card>
    <lc-accordion title="Abgewiesene Zeilen" variant="flat" size="lg" [expanded]="true">
      <lc-description-list [items]="items" [leaders]="true" separator="none" size="md" />
    </lc-accordion>
  </lc-card>
`;

/** 3.26 (request 041): a short value next to a long term stays on one line; the term wraps. */
export const LongTermsShortValues: Story = {
  name: 'Long terms, short values (3.26)',
  decorators: [moduleMetadata({ imports: [CardComponent, AccordionComponent] })],
  args: {
    items: [
      { term: 'Sekundäre Kostenart (Umlage)', value: '10' },
      { term: 'Periode nach dem Monat des Ladens', value: '3' },
      { term: '„Gültig bis“ liegt vor „Gültig ab“', value: '2' },
      // U+00A0 before the euro sign, as Intl.NumberFormat('de-DE', { style: 'currency' }) writes it.
      { term: 'Abgewiesener Betrag (Umlage)', value: '1.234,56 €' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Request 041 (finance-intelligence sources page, Pixel 7 and iPhone 15): rejection reasons with leaders in an `lc-card` → flat `lc-accordion` (lg) at 280 px and 312 px (lists 202 and 234 px). ' +
          'Until 3.25 the term kept its width and the value took all the missing width, so "10" broke into "1" and "0" and the row overflowed (42 px at 202). ' +
          'Since 3.26 a row that is too narrow is shared: term and value each keep their width up to half of the free width F = row − 32 px (two 8 px gaps and the 16 px leader; F/2 = 85 px at 202, 101 px at 234), and the longer one wraps in the rest. ' +
          'So "10", "3", "2" and "1.234,56 €" (74 px) stay on one line and the terms wrap at spaces; the dots sit on the first line, next to the value. ' +
          'Write amounts with a no-break space before the currency sign (U+00A0, as `Intl.NumberFormat` does), or the sign can wrap on its own. Rows that fit look as before.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div lang="de" style="display: grid; gap: 16px;">
        <div style="max-width: 280px;">${rejectionCardTemplate}</div>
        <div style="max-width: 312px;">${rejectionCardTemplate}</div>
      </div>
    `,
  }),
};

/** BA-8 (life-os): short German values stay on one line at a phone width. */
export const ShortValuesAtPhoneWidth: Story = {
  name: 'Short values at a phone width (BA-8)',
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  args: {
    items: [
      { term: 'Umbenennen', value: 'Alle Erwachsenen' },
      { term: 'Entfernen', value: 'Alle Erwachsenen' },
      { term: 'Sichtbarkeit', value: 'Nur du' },
      { term: 'Claude-App', value: 'nicht eingerichtet', emphasis: 'muted' as const },
      { term: 'Claude Code', value: 'seit 02.11.2026' },
      { term: 'Konten', value: 'nicht erlaubt', emphasis: 'muted' as const },
    ],
    layout: 'rows',
    leaders: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'BA-8 (life-os connection and assistant pages): short German values in an outlined `lc-card padding="lg"` at the 312 px content width of `lc-app-page` at 360 px (262 px list). Term and value have no browser margin, so the row gap is the only space and each value stays on one line.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 312px;"><lc-card variant="outlined" borderRadius="xl" padding="lg"><lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" [size]="size" /></lc-card></div>`,
  }),
};

const bankItemsDe = [
  { term: 'Bank', value: 'Sparkasse KölnBonn' },
  { term: 'Freigabe', value: 'Alle Erwachsenen', emphasis: 'primary' as const },
  { term: 'Einwilligung', value: 'Details ansehen', href: '#' },
  { term: 'Letzter Abruf', value: 'heute 09:14', datetime: '2026-11-02T09:14:00+01:00', emphasis: 'muted' as const },
];

// A clickable row holds no link (a nested interactive).
const bankRowsDe = [
  { term: 'Bank', value: 'Sparkasse KölnBonn' },
  { term: 'Freigabe', value: 'Alle Erwachsenen', emphasis: 'primary' as const },
  { term: 'Letzter Abruf', value: 'heute 09:14', datetime: '2026-11-02T09:14:00+01:00', emphasis: 'muted' as const },
];

const bankRowsEn = [
  { term: 'Bank', value: 'Northwind Savings' },
  { term: 'Shared with', value: 'All adults', emphasis: 'primary' as const },
  { term: 'Last sync', value: 'today 09:14', datetime: '2026-11-02T09:14:00+01:00', emphasis: 'muted' as const },
];

/** BA-10 (life-os): link and primary values in the kit's link and primary inks. */
export const LinkAndPrimaryValues: Story = {
  name: 'Link and primary values (BA-10)',
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  args: { items: bankItemsDe, layout: 'rows', leaders: false },
  parameters: {
    docs: {
      description: {
        story:
          'BA-10 (life-os bank accounts page): a link value uses `--color-link` (hover `--color-link-hover`, underlined) and a `primary` value `--color-on-primary-subtle`, both at least 4.5:1 at 14 px (`md`) and 12 px (`sm`). Light: link 5.94:1 on the page, 5.64:1 on a hovered row (was 4.17 / 3.96 with `--color-primary-500`); primary 8.74 / 8.29. Dark: link 8.96 / 7.92; primary 7.57 / 6.69 (unchanged value).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 312px;">
        <lc-card variant="outlined" borderRadius="xl" padding="lg">
          <div style="display: grid; gap: 16px;">
            <lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" size="md" />
            <lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" size="sm" />
          </div>
        </lc-card>
      </div>
    `,
  }),
};

const clickableRowsTemplate = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
    <lc-card variant="outlined" borderRadius="xl" padding="lg" title="rows · md">
      <lc-description-list [items]="items" layout="rows" size="md" [clickable]="true" (itemClick)="itemClick($event)" />
    </lc-card>
    <lc-card variant="outlined" borderRadius="xl" padding="lg" title="rows · sm">
      <lc-description-list [items]="items" layout="rows" size="sm" [clickable]="true" (itemClick)="itemClick($event)" />
    </lc-card>
    <lc-card variant="outlined" borderRadius="xl" padding="lg" title="stacked · md">
      <lc-description-list [items]="items" layout="stacked" size="md" [clickable]="true" (itemClick)="itemClick($event)" />
    </lc-card>
    <lc-card variant="outlined" borderRadius="xl" padding="lg" title="stacked · sm">
      <lc-description-list [items]="items" layout="stacked" size="sm" [clickable]="true" (itemClick)="itemClick($event)" />
    </lc-card>
  </div>
`;

/** BA-10 (life-os): clickable rows are at least 44 px tall and show a 2 px focus ring. */
export const ClickableRows: Story = {
  name: 'Clickable rows (BA-10)',
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  args: { items: bankRowsDe },
  parameters: {
    docs: {
      description: {
        story:
          'BA-10: a clickable row in the `rows` layout pads to `--size-min-touch-height`, so it is 45 px tall (44 px for the last row, which has no line) in `md` and `sm`, at every width (was 38 / 27 px); the `stacked` rows (62 / 48 px) and non-clickable rows keep their size. 3.25 (F-17): each row holds a native button, named term + value ("Bank Sparkasse KölnBonn"), as the last child of its `dd`; the `dl` keeps its pairs (the row has no `role` and no `tabindex`, axe `definition-list` and `dlitem` pass). The button covers the row and takes no pointer events, so a click anywhere on the row emits as before. Focus shows a 2 px `--color-primary-500` outline 2 px outside the row (4.17:1 on the light page, 7.57:1 dark, also next to a hovered row; the old 20 % halo measured 1.28 / 1.50); in forced colours the outline is `Highlight`. Avoid `href` in clickable rows: a link inside the row is a second tab stop (link, then row button).',
      },
    },
  },
  render: (args) => ({ props: args, template: clickableRowsTemplate }),
};

/** BA-10: the clickable rows with English values. */
export const ClickableRowsEnglish: Story = {
  name: 'Clickable rows, English',
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  args: { items: bankRowsEn },
  parameters: {
    docs: {
      description: {
        story:
          'The `Clickable rows (BA-10)` layout with English values: every clickable row is at least 44 px tall in `rows` and `stacked`, `md` and `sm`.',
      },
    },
  },
  render: (args) => ({ props: args, template: clickableRowsTemplate }),
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  args: { items: sampleItems, layout: 'rows', leaders: false, size: 'md' },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the first link value is focused as Tab would focus it (in the story view). Link values show the kit ring instead of the browser default (2.29:1 in dark): 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 9.95:1 dark on the page), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px;"><lc-description-list [items]="items" [layout]="layout" [leaders]="leaders" [size]="size" /></div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.lc-dl__link')?.focus({ preventScroll: true });
  },
};

