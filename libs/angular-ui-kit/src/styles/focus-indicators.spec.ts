import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Request 042 (3.27, design 042 D-1 to D-9): the guard for F-18 and F-19.
 * Every element of design §6.1 rows B–F has a `:focus-visible` indicator of its
 * own (kit ring: 2 px `--color-primary-500`), `Highlight` in forced colours;
 * the global button reset only takes the ring from mouse focus; a field's hover
 * rule never applies while it is focused. Read from the compiled SCSS sources.
 */
const sheets = new Map<string, string>();
const css = (file: string): string => {
  if (!sheets.has(file)) sheets.set(file, compile(resolve(__dirname, file.startsWith('_') ? file : `../lib/${file}`)).css);
  return sheets.get(file) as string;
};

const rulesOf = (text: string) =>
  [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
    body: m[2],
  }));
const decls = (body: string): Record<string, string> =>
  Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;

/** Every rule naming `selector`, merged in source order, forced-colours blocks left out. */
const fills = (file: string, selector: string): Record<string, string> => {
  const found = rulesOf(css(file).replace(forcedBlock, '')).filter((r) => r.selectors.includes(selector));
  expect([file, selector, found.length > 0]).toEqual([file, selector, true]);
  return Object.assign({}, ...found.map((r) => decls(r.body)));
};
/** The same, inside the forced-colours blocks only. */
const forcedFills = (file: string, selector: string): Record<string, string> => {
  const inner = [...css(file).matchAll(forcedBlock)].map((m) => m[1]).join('\n');
  return Object.assign({}, ...rulesOf(inner).filter((r) => r.selectors.includes(selector)).map((r) => decls(r.body)));
};

const RING = '2px solid var(--color-primary-500)';

/** Design 042 §3: [sheet, element class, outline offset]. Rows B–D, kanban (D-3), remove (D-8), dep canvas (D-7). */
const rings: [string, string, string][] = [
  ['rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__toolbar-btn', '2px'],
  ['rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__mode-btn', '2px'],
  ['document-viewer/document-viewer.component.scss', '.doc-viewer__btn', '2px'],
  ['document-viewer/document-viewer.component.scss', '.doc-viewer__download-btn', '2px'],
  ['filter-bar/filter-bar.component.scss', '.lc-filter-bar__toggle-btn', '-2px'],
  // 2px → 0 by review 043 r1 F3: the button grew from 20 to 24 px (2 px padding
  // inside a −2 px margin), so offset 0 draws the ring where 2 px round 20 px did.
  ['select/select.component.scss', '.lc-select__clear', '0'],
  ['gallery/gallery.component.scss', '.gallery__filter-btn', '2px'],
  ['log-viewer/log-viewer.component.scss', '.lc-log-viewer__level-pill', '2px'],
  ['callout/callout.component.scss', '.callout__dismiss', '2px'],
  ['notification-center/notification-center.component.scss', '.lc-nc__action-btn', '2px'],
  ['notification-center/notification-center.component.scss', '.lc-nc__filter', '2px'],
  ['tabs/tabs.component.scss', '.lc-tabs__panel', '-2px'],
  ['chat/chat.component.scss', '.lc-chat__attachment', '2px'],
  ['chat/chat.component.scss', '.lc-chat__attach-btn', '2px'],
  ['chat/chat.component.scss', '.lc-chat__send-btn', '2px'],
  ['chat/chat.component.scss', '.lc-chat__pending-remove', '2px'],
  ['description-list/description-list.component.scss', '.lc-dl__link', '2px'],
  ['color-picker/color-picker.component.scss', '.color-picker__native', '2px'],
  ['table/table.component.scss', '.lc-table__checkbox', '2px'],
  ['number-input/number-input.component.scss', '.number-input__button', '-2px'],
  ['tag-input/tag-input.component.scss', '.lc-tag-input__tag-remove', '2px'],
  ['file-upload/file-upload.component.scss', '.file-upload__file-remove', '2px'],
  // Review 042 r1: inset, an outside ring measured 2.19:1 on an over-limit column (light).
  ['kanban-board/kanban-board.component.scss', '.lc-kanban__card', '-2px'],
  ['dependency-viewer/dependency-viewer.component.scss', '.dep-viewer__canvas--scroll', '-2px'],
];

describe('Focus indicators (request 042)', () => {
  describe('D-1: the global button reset', () => {
    it('AC-5: takes the outline from mouse focus only, so a button with no ring of its own keeps the browser ring on Tab', () => {
      const reset = css('_reset.scss');
      expect(reset).toMatch(/\nbutton:focus:not\(:focus-visible\) \{\s*outline: none;\s*\}/);
      expect(reset).not.toMatch(/\nbutton:focus \{/);
    });
  });

  describe('D-2: the kit ring on every §6.1 B–D element', () => {
    it.each(rings)('AC-2: %s %s draws a solid 2 px primary-500 outline (offset %s), no halo', (file, cls, offset) => {
      const ring = fills(file, `${cls}:focus-visible`);
      expect([ring.outline, ring['outline-offset']]).toEqual([RING, offset]);
      expect(ring['box-shadow']).toBeUndefined();
      expect(ring.transition).toBeUndefined();
    });

    it.each(rings)('AC-3: %s %s turns Highlight in forced colours', (file, cls) => {
      expect(forcedFills(file, `${cls}:focus-visible`)['outline-color']).toBe('Highlight');
    });

    it.each(rings)('AC-4: %s %s draws no ring on mouse focus (no outline on a bare :focus rule)', (file, cls) => {
      const bare = rulesOf(css(file).replace(forcedBlock, '')).filter((r) => r.selectors.includes(`${cls}:focus`));
      for (const r of bare) expect([cls, decls(r.body).outline ?? 'none']).toEqual([cls, 'none']);
    });

    it('AC-2: the dimmed buttons turn fully opaque on focus (the ring is not dimmed with them)', () => {
      expect(fills('callout/callout.component.scss', '.callout__dismiss').opacity).toBe('0.6');
      expect(fills('callout/callout.component.scss', '.callout__dismiss:focus-visible').opacity).toBe('1');
      expect(fills('tag-input/tag-input.component.scss', '.lc-tag-input__tag-remove').opacity).toBe('0.7');
      expect(fills('tag-input/tag-input.component.scss', '.lc-tag-input__tag-remove:focus-visible').opacity).toBe('1');
    });

    // Offset 2px → -2px by review 042 r1: outside, the ring sat on the column tint
    // (2.19:1 on an over-limit column, light); inset it sits on the card (4.36 / 9.12).
    it('AC-2: the kanban card drops its 20 % halo (1.28:1) for an inset ring on the card and keeps the border change', () => {
      expect(fills('kanban-board/kanban-board.component.scss', '.lc-kanban__card:focus-visible')).toEqual({
        outline: RING,
        'outline-offset': '-2px',
        'border-color': 'var(--color-primary-500)',
      });
    });
  });

  describe('D-3: indicators that forced colours drop', () => {
    const forced: [string, string, Record<string, string>][] = [
      ['toggle-group/toggle-group.component.scss', '.lc-toggle-group__btn:focus-visible', { outline: '2px solid Highlight', 'outline-offset': '-2px' }],
      ['list/list.component.scss', '.lc-list__item:focus-visible', { outline: '2px solid Highlight', 'outline-offset': '-2px' }],
      ['gantt-chart/gantt-chart.component.scss', '.lc-gantt__bar:focus-visible', { outline: '2px solid Highlight', 'outline-offset': '2px' }],
      ['split-pane/split-pane.component.scss', '.lc-split-pane__separator:focus-visible', { outline: '2px solid Highlight', 'outline-offset': '-2px' }],
      ['scatter-plot/scatter-plot.component.scss', '.lc-scatter-plot__dot:focus-visible', { stroke: 'Highlight' }],
    ];

    it.each(forced)('AC-3: %s %s has its own forced-colours indicator', (file, selector, expected) => {
      expect(forcedFills(file, selector)).toEqual(expected);
    });

    it('AC-7: their normal-mode indicators are unchanged', () => {
      expect(fills('toggle-group/toggle-group.component.scss', '.lc-toggle-group__btn:focus-visible')['box-shadow']).toBe('inset 0 0 0 2px var(--color-primary-500)');
      expect(fills('list/list.component.scss', '.lc-list__item:focus-visible')['box-shadow']).toBe('inset 0 0 0 2px var(--color-primary-500)');
      expect(fills('gantt-chart/gantt-chart.component.scss', '.lc-gantt__bar:focus-visible')['box-shadow']).toBe('0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary-500)');
      expect(fills('split-pane/split-pane.component.scss', '.lc-split-pane__separator:focus-visible::before').background).toBe('var(--color-primary-500)');
      expect(fills('scatter-plot/scatter-plot.component.scss', '.lc-scatter-plot__dot:focus-visible').stroke).toBe('var(--color-text-primary)');
    });
  });

  describe('D-9: the rich-text editing surface', () => {
    const frame = '.lc-rich-text-editor:has(.lc-rich-text-editor__rich:focus-visible, .lc-rich-text-editor__textarea:focus-visible)';
    const file = 'rich-text-editor/rich-text-editor.component.scss';

    it('AC-2: the frame shows the field ring (lc-input pattern); the surfaces keep outline: none', () => {
      expect(fills(file, frame)).toEqual({ 'border-color': 'var(--color-primary-500)', outline: RING, 'outline-offset': '0px' });
      expect(fills(file, '.lc-rich-text-editor__rich').outline).toBe('none');
      expect(fills(file, '.lc-rich-text-editor__textarea').outline).toBe('none');
    });

    it('AC-3: the ancestor ring has its own Highlight rule', () => {
      expect(forcedFills(file, frame)).toEqual({ 'border-color': 'Highlight', 'outline-color': 'Highlight' });
    });
  });

  describe('D-4: the light header on a dark page', () => {
    const file = 'header/header.component.scss';
    const own = ['.lc-header__nav-link', '.lc-header__logo', '.lc-header__context-info', '.lc-header__profile-trigger'];

    it('AC-2: the header-owned rings read the private ring colour, primary-500 by default', () => {
      for (const cls of own) {
        expect([cls, fills(file, `${cls}:focus-visible`).outline]).toEqual([cls, '2px solid var(--_lc-header-ring, var(--color-primary-500))']);
      }
    });

    it('AC-2: theme="light" pins the light primary-500: 4.36:1 on its white bar in both themes (dark primary-500 was 1.89)', () => {
      const light = fills(file, '.lc-header--light');
      expect([light['--_lc-header-ring'], light['--lc-header-bg']]).toEqual(['#208497', '#ffffff']);
      const lum = (hex: string) =>
        [1, 3, 5]
          .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      expect(Math.floor(((lum('#ffffff') + 0.05) / (lum('#208497') + 0.05)) * 100) / 100).toBe(4.36);
    });
  });

  describe('D-6: focus wins over hover in every field with the pattern (F-19)', () => {
    // [sheet, hover selector after the fix, declarations it keeps]
    // Request 043 (F-23, design D-5) changed the first seven rows on purpose:
    // they also exclude the error class (an error field kept no error border
    // under the pointer), and the textarea/datepicker outline hover moved from
    // --color-primary-400 (1.89:1 light) to --color-text-secondary (7.55:1).
    const hovers: [string, string, Record<string, string>][] = [
      ['textarea/textarea.component.scss', '.lc-textarea--outline:hover:not(:disabled):not(:read-only):not(.lc-textarea--error):not(:focus)', { 'border-color': 'var(--color-text-secondary)' }],
      ['textarea/textarea.component.scss', '.lc-textarea--filled:hover:not(:disabled):not(:read-only):not(.lc-textarea--error):not(:focus)', { 'background-color': 'var(--color-surface-hover)' }],
      ['datepicker/datepicker.component.scss', '.lc-datepicker:hover:not(:disabled):not([readonly]):not(.lc-datepicker--error):not(:focus)', { 'border-color': 'var(--color-text-secondary)' }],
      ['datepicker/datepicker.component.scss', '.lc-datepicker.lc-datepicker--filled:hover:not(:disabled):not([readonly]):not(.lc-datepicker--error):not(:focus)', { 'background-color': 'var(--color-surface-hover)', 'border-color': 'var(--color-border)' }],
      ['input/input.component.scss', '.input-container:hover:not(.input-disabled):not(.input-readonly):not(.input-invalid):not(:focus-within)', { 'border-color': 'var(--color-text-secondary)' }],
      ['select/select.component.scss', '.lc-select:hover:not(.lc-select--disabled):not(.lc-select--error):not(:focus)', { 'border-color': 'var(--color-text-secondary)' }],
      ['select/select.component.scss', '.lc-select.lc-select--filled:hover:not(.lc-select--disabled):not(.lc-select--error):not(:focus)', { 'background-color': 'var(--color-surface-hover)', 'border-color': 'var(--color-border)' }],
      ['search-input/search-input.component.scss', '.search-input:hover:not(.search-input--disabled):not(:focus-within)', { 'border-color': 'var(--color-text-secondary)' }],
      ['tag-input/tag-input.component.scss', '.lc-tag-input__container:hover:not(.lc-tag-input__container--focused)', { 'border-color': 'var(--color-text-secondary)' }],
      ['date-range-picker/date-range-picker.component.scss', '.lc-drp__field:hover:not(.lc-drp__field--disabled):not(:focus-within)', { 'border-color': 'var(--color-text-secondary)' }],
    ];

    it.each(hovers)('AC-6/AC-7: %s %s keeps its look and excludes focus', (file, selector, expected) => {
      expect(fills(file, selector)).toEqual(expected);
    });

    it.each(hovers)('AC-6: %s has no other hover rule on that field', (file, selector) => {
      const field = selector.slice(0, selector.indexOf(':hover'));
      const others = rulesOf(css(file).replace(forcedBlock, ''))
        .flatMap((r) => r.selectors)
        .filter((s) => s.startsWith(`${field}:hover`) && s !== selector);
      expect(others).toEqual([]);
    });
  });
});
