import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { NEVER, interval, map } from 'rxjs';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { LogViewerComponent, LogLine } from './log-viewer.component';

const meta: Meta<LogViewerComponent> = {
  title: 'Data Display/LogViewer',
  component: LogViewerComponent,
  parameters: {
    docs: {
      description: {
        component: `
The LogViewer component displays streaming or static log lines with
virtualized rendering, ANSI color support, auto-scroll, level filtering,
and search. Supports a "log" variant (follows the theme surface) and a
"terminal" variant (always dark).

- The virtual window is sized from the *measured* scroll area, so any
  \`height\` (\`400px\`, \`50vh\`, \`100%\` in a flex parent) renders correctly.
  Row height comes from \`--lc-log-viewer-line-height\` (22px).
- \`autoScroll\` follows new lines only while the reader is at the bottom;
  scrolling up pauses it and shows a "Jump to bottom" button.
- Set \`clickableLines\` when binding \`(lineClick)\` so rows are keyboard-operable.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['log', 'terminal'],
    },
    height: { control: 'text' },
    autoScroll: { control: 'boolean' },
    showTimestamps: { control: 'boolean' },
    showLineNumbers: { control: 'boolean' },
    ansiColors: { control: 'boolean' },
    clickableLines: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<LogViewerComponent>;

function generateLogs(count: number): LogLine[] {
  const levels: LogLine['level'][] = ['debug', 'info', 'warn', 'error'];
  const sources = ['api', 'worker', 'scheduler', 'db'];
  const messages = [
    'Request received GET /api/users',
    'Processing batch job #4521',
    'Connection pool exhausted, waiting for release',
    'Failed to parse response: unexpected token',
    'Cache miss for key user:session:abc123',
    'Retrying operation (attempt 2/3)',
    'Health check passed',
    'Rate limit exceeded for client 10.0.0.5',
    'Transaction committed successfully',
    'Memory usage: 847MB / 2048MB (41.3%)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    text: messages[i % messages.length],
    level: levels[i % levels.length],
    timestamp: new Date(Date.now() - (count - i) * 1000),
    source: sources[i % sources.length],
  }));
}

export const Default: Story = {
  args: {
    lines: generateLogs(50),
    variant: 'log',
    height: '400px',
    showTimestamps: true,
    showLineNumbers: false,
  },
};

export const Terminal: Story = {
  args: {
    lines: generateLogs(100),
    variant: 'terminal',
    height: '500px',
    showTimestamps: true,
    showLineNumbers: true,
  },
  parameters: {
    docs: { description: { story: 'Terminal variant with dark theme and line numbers.' } },
  },
};

export const WithAnsiColors: Story = {
  args: {
    lines: [
      { text: '\x1b[32m✓\x1b[0m All tests passed', level: 'info', timestamp: new Date() },
      { text: '\x1b[33m⚠\x1b[0m Deprecation warning: use \x1b[1mnewApi()\x1b[0m instead', level: 'warn', timestamp: new Date() },
      { text: '\x1b[31m✗\x1b[0m \x1b[1mERROR:\x1b[0m Connection refused to \x1b[36mdb:5432\x1b[0m', level: 'error', timestamp: new Date() },
      { text: '\x1b[90m[debug]\x1b[0m Loading config from \x1b[34m/etc/app/config.yml\x1b[0m', level: 'debug', timestamp: new Date() },
      { text: 'Build complete in \x1b[32m2.4s\x1b[0m — \x1b[35m47 modules\x1b[0m', level: 'info', timestamp: new Date() },
    ],
    variant: 'terminal',
    height: '200px',
    ansiColors: true,
  },
  parameters: {
    docs: { description: { story: 'ANSI color code parsing for terminal output.' } },
  },
};

export const ErrorsOnly: Story = {
  args: {
    lines: generateLogs(200),
    variant: 'log',
    height: '300px',
    levelFilter: ['error'],
  },
  parameters: {
    docs: { description: { story: 'Filtered to show only error-level lines.' } },
  },
};

/** Live stream: a new line every 400 ms; scroll up to pause following. */
export const Streaming: Story = {
  render: (args) => ({
    props: {
      ...args,
      stream$: interval(400).pipe(
        map((i): LogLine => ({
          text: `Tick ${i + 1}: ${['heartbeat ok', 'job processed', 'cache refreshed', 'queue drained'][i % 4]}`,
          level: i % 9 === 8 ? 'warn' : 'info',
          timestamp: new Date(),
          source: 'worker',
        })),
      ),
    },
    template: `
      <lc-log-viewer
        [stream$]="stream$"
        [variant]="variant"
        [height]="height"
        [showTimestamps]="showTimestamps"
        [showLineNumbers]="showLineNumbers"
        [autoScroll]="autoScroll"
        [maxLines]="maxLines"
      />
    `,
  }),
  args: {
    variant: 'terminal',
    height: '320px',
    showTimestamps: true,
    showLineNumbers: true,
    autoScroll: true,
    maxLines: 500,
  },
  parameters: {
    docs: { description: { story: 'Streaming mode with Pause/Resume and follow-mode auto-scroll.' } },
  },
};

/** `height="100%"` inside a fixed-height flex parent — the window fills it. */
export const FlexParent: Story = {
  render: (args) => ({
    props: { ...args, lines: generateLogs(500) },
    template: `
      <div style="display: flex; flex-direction: column; height: 60vh; gap: 8px;">
        <p style="margin: 0; font: 13px/1.4 var(--font-family-sans)">The viewer below uses <code>height="100%"</code> and grows with its flex parent.</p>
        <lc-log-viewer
          style="display: block; flex: 1; min-height: 0;"
          [lines]="lines"
          height="100%"
          [variant]="variant"
          [showLineNumbers]="true"
        />
      </div>
    `,
  }),
  args: { variant: 'log' },
  parameters: {
    docs: { description: { story: 'Percentage / flex heights render a full virtual window (measured, not parsed).' } },
  },
};

export const LargeBuffer: Story = {
  args: {
    lines: generateLogs(5000),
    variant: 'terminal',
    height: '500px',
    showLineNumbers: true,
    maxLines: 5000,
  },
  parameters: {
    docs: { description: { story: '5000 lines with virtualized rendering for smooth scrolling.' } },
  },
};

/** 40 lines with fixed timestamps (2 Nov 2026, 08:00:00 UTC, one per second), so the shot is stable. */
const fixedLogs = (count: number): LogLine[] =>
  generateLogs(count).map((line, i) => ({ ...line, timestamp: new Date(Date.UTC(2026, 10, 2, 8, 0, i)) }));

/** 120 lines (30 per level) with fixed local timestamps (2 Nov 2026, 09:00:00, one per second). */
const hierarchyLogs = (count: number): LogLine[] =>
  generateLogs(count).map((line, i) => ({ ...line, timestamp: new Date(2026, 10, 2, 9, 0, i) }));

/**
 * 3.22.4: the log and the terminal variant with line numbers, timestamps and
 * German labels, for the text steps that replaced the opacities and the pill
 * hit areas.
 */
export const TextHierarchy: Story = {
  render: () => ({
    props: { lines: hierarchyLogs(120), variants: ['log', 'terminal'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        @for (variant of variants; track variant) {
          <lc-log-viewer
            [lines]="lines"
            [variant]="variant"
            height="240px"
            [showTimestamps]="true"
            [showLineNumbers]="true"
            locale="de-DE"
            errorsLabel="Fehler"
            warningsLabel="Warnungen"
            linesLabel="Zeilen"
            searchPlaceholder="Logs durchsuchen…"
          />
        }
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Since 3.22.4 no opacity dims text. Three steps: the message in the primary text, line number, time and source (and the debug message) in `--color-text-secondary`, and on debug lines the meta, the debug level, the line count and the search placeholder in `--color-text-tertiary`; the terminal uses Subtext0 `#a6adc8` and Overlay2 `#9399b2`. Every step reaches 4.5:1 on its line, also on the warn and error tints and under hover (debug level was 2.53 in light). The level pills keep their size but get a 40 px tall hit area (WCAG 2.5.8). The German labels wrap the pills to two lines at 360 px.',
      },
    },
  },
};

/**
 * 3.22 (BA-6): with an app that registers no icons and sets
 * `unregistered: 'placeholder'`, every glyph lc-log-viewer draws is its own
 * registration — pause/play, trash, clipboard, the magnifier (toolbar and
 * search row) and jump-to-bottom.
 */
export const AppRegistersNoIcons: Story = {
  name: 'App Registers No Icons',
  decorators: [applicationConfig({ providers: [provideLcIcons([], { unregistered: 'placeholder' })] })],
  render: (args) => ({
    props: { ...args, lines: fixedLogs(40), stream$: NEVER },
    template: `
      <lc-log-viewer
        [lines]="lines"
        [stream$]="stream$"
        [variant]="variant"
        [height]="height"
        [showTimestamps]="showTimestamps"
      />
    `,
  }),
  args: { variant: 'log', height: '240px', showTimestamps: true },
  parameters: {
    docs: {
      description: {
        story:
          "`provideLcIcons([], { unregistered: 'placeholder' })`: the app registers nothing. lc-log-viewer registers `ICON_PLAYER_PAUSE`, `ICON_PLAYER_PLAY`, `ICON_TRASH`, `ICON_CLIPBOARD`, `ICON_SEARCH` and `ICON_ARROW_DOWN` itself, so none of them shows the placeholder (before 3.22 every glyph but the trash did). Open the search (magnifier button or `/`) for the second magnifier, scroll up for the jump-to-bottom arrow, and pause for the play glyph.",
      },
    },
  },
};

/** Gray ANSI text on a debug, info, warn and error line, with fixed local timestamps (2 Nov 2026, 09:00:00, one per second). */
const ansiGrayLines: Pick<LogLine, 'text' | 'level'>[] = [
  { text: '\x1b[90m[debug]\x1b[0m cache warm-up', level: 'debug' },
  { text: 'Request served \x1b[90m· 34 ms\x1b[0m', level: 'info' },
  { text: 'Slow query \x1b[90m· 812 ms\x1b[0m', level: 'warn' },
  { text: 'Upstream timeout \x1b[90m· 30 s\x1b[0m', level: 'error' },
  { text: '\x1b[30mblack\x1b[0m \x1b[90mgray\x1b[0m \x1b[37mwhite\x1b[0m \x1b[97mbright white\x1b[0m', level: 'info' },
];
const ansiGrayLogs: LogLine[] = ansiGrayLines.map((line, i) => ({ ...line, timestamp: new Date(2026, 10, 2, 9, 0, i) }));

/**
 * 3.23.1 (F-13): gray ANSI text (`\x1b[90m`) on every line tint, in the log
 * and the terminal variant.
 */
export const AnsiGrayOnEveryLine: Story = {
  name: 'ANSI gray on every line',
  render: () => ({
    props: { lines: ansiGrayLogs, variants: ['log', 'terminal'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        @for (variant of variants; track variant) {
          <lc-log-viewer
            [lines]="lines"
            [variant]="variant"
            height="160px"
            [showTimestamps]="true"
            [ansiColors]="true"
          />
        }
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Since 3.23.1 (F-13) gray ANSI text reaches 4.5:1 on every line. Light log (Catppuccin Latte): Subtext1 `#5c5f77`, 6.25:1 on the surface and 4.63:1 on the worst line tint (was Overlay0 `#9ca0b0`, 2.60 / 1.92); it now matches bright white. Terminal and dark log (Mocha): Overlay2 `#9399b2`, 5.81:1 on the terminal and 4.61:1 on its worst line, 4.55:1 on the worst dark log line (was Overlay0 `#6c7086`, 3.35 / 2.66 / 2.63). The other ANSI colours are unchanged. A search match is an opaque marker with its own ink (7.85:1, terminal 12.90:1), over any ANSI colour.',
      },
    },
  },
};
