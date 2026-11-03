import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Request 043 (3.27.1, design 043 D-1 to D-10): the follow-ups F-22 to F-27 of
 * the 042 sweep, read from the compiled SCSS and the theme files. Hit areas
 * grow without paint and the visible boxes keep their size (D-1, D-3); the
 * dense toolbars get real 44 px buttons (D-2); field hover keeps 3:1 and never
 * hides the error state (D-5); the rich-text frame is a field boundary (D-6);
 * the F-26 inks and the kanban tint reach their contrast (D-8, D-10).
 */
const sheets = new Map<string, string>();
const css = (file: string): string => {
  if (!sheets.has(file)) sheets.set(file, compile(resolve(__dirname, file.startsWith('_') ? file : `../lib/${file}`)).css);
  return sheets.get(file) as string;
};
const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
const rulesOf = (text: string) =>
  [...text.replace(forcedBlock, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
    body: m[2],
  }));
const decls = (body: string): Record<string, string> =>
  Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
/** Every rule naming `selector`, merged in source order, forced-colours blocks left out. */
const fills = (file: string, selector: string): Record<string, string> => {
  const found = rulesOf(css(file)).filter((r) => r.selectors.includes(selector));
  expect([file, selector, found.length > 0]).toEqual([file, selector, true]);
  return Object.assign({}, ...found.map((r) => decls(r.body)));
};

// ── Colours: the root rule of each theme file, var() followed ─────────────
type Rgba = [number, number, number, number];
function rootTokens(file: string, selector: string): Record<string, string> {
  const text = css(file);
  const open = text.indexOf('{', text.indexOf(selector));
  const tokens: Record<string, string> = {};
  for (const m of text.slice(open, text.indexOf('}', open)).matchAll(/(--[\w-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  return tokens;
}
const themes: [string, Record<string, string>][] = [
  ['light', rootTokens('_theme-light.scss', ':root,')],
  ['dark', rootTokens('_theme-dark.scss', ':root.dark,')],
];
function parse(value: string): Rgba {
  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`not a colour: ${value}`);
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)).concat(1) as Rgba;
}
/** A declared value (`var(--x)`, `var(--x, fallback)`, hex, rgba) in one theme. */
function colour(tokens: Record<string, string>, value: string, depth = 0): Rgba {
  const ref = value.trim().match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (!ref) return parse(value.trim());
  if (depth > 10) throw new Error(`${value} does not resolve`);
  return tokens[ref[1]] !== undefined ? colour(tokens, tokens[ref[1]], depth + 1) : colour(tokens, ref[2], depth + 1);
}
const over = (top: Rgba, base: Rgba): Rgba => [0, 1, 2].map((i) => top[i] * top[3] + base[i] * (1 - top[3])).concat(1) as Rgba;
const mix = (a: Rgba, share: number, b: Rgba): Rgba => [0, 1, 2].map((i) => a[i] * share + b[i] * (1 - share)).concat(1) as Rgba;
const lum = (c: Rgba) =>
  c
    .slice(0, 3)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
/** WCAG ratio, floored to two decimals (as the design's measure script). */
const ratio = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return Math.floor(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};

const TOUCH = 'var(--size-min-touch-height, 2.75rem)';

describe('Touch targets, hover borders and contrast (request 043)', () => {
  it('the touch size token is 44 px in both themes', () => {
    for (const [, t] of themes) expect(t['--size-min-touch-height']).toBe('2.75rem');
  });

  describe('D-1 / D-3: hit areas without paint; the visible control keeps its size (AC-1, AC-2)', () => {
    const centred = { 'inset-inline': `min(0px, (100% - ${TOUCH}) / 2)`, top: `calc(50% - ${TOUCH} / 2)`, bottom: `calc(50% - ${TOUCH} / 2)` };
    // [sheet, control, its hit area, the visible box that must not change]
    const areas: [string, string, Record<string, string>, Record<string, string>][] = [
      ['notification-center/notification-center.component.scss', '.lc-nc__action-btn', centred, { padding: '4px 8px', 'font-size': '0.75rem' }],
      ['notification-center/notification-center.component.scss', '.lc-nc__filter', centred, { padding: '4px 10px', 'font-size': '0.6875rem', 'white-space': 'nowrap' }],
      [
        'log-viewer/log-viewer.component.scss',
        '.lc-log-viewer__level-pill',
        { 'inset-inline': `min(-0.125rem, (100% - ${TOUCH}) / 2)`, top: centred.top, bottom: centred.bottom },
        { padding: '0.125rem 0.5rem', 'font-size': '0.6875rem' },
      ],
      ['callout/callout.component.scss', '.callout__dismiss', { inset: `calc((1.5rem - ${TOUCH}) / 2)` }, { width: '1.5rem', height: '1.5rem' }],
      ['chat/chat.component.scss', '.lc-chat__send-btn', { inset: `calc((2rem - ${TOUCH}) / 2)` }, { width: '2rem', height: '2rem' }],
      ['chat/chat.component.scss', '.lc-chat__attach-btn', { inset: `calc((2rem - ${TOUCH}) / 2)` }, { width: '2rem', height: '2rem' }],
      // D-3: 24 × 24 (WCAG 2.5.8 by size): 44 would cover the next chip row.
      ['tag-input/tag-input.component.scss', '.lc-tag-input__tag-remove', { inset: '-0.25rem' }, { width: '16px', height: '16px' }],
    ];

    it.each(areas)('%s %s: a positioned host and a transparent ::before with exactly the hit-area box', (file, cls, area, box) => {
      expect(fills(file, cls).position).toBe('relative');
      expect(fills(file, `${cls}::before`)).toEqual({ content: '""', position: 'absolute', ...area });
      const host = fills(file, cls);
      for (const [property, value] of Object.entries(box)) expect([cls, property, host[property]]).toEqual([cls, property, value]);
    });

    // Review 043 r1 F3: the select × was a 20 px box with a 24 px `::before`; axe
    // `target-size` reads the element's own box and flagged it (×12). It is now a
    // 24 px box whose 2 px padding the negative margin takes back: the layout
    // footprint, the 20 px hover fill (content-box) and the ring (offset 0 on 24 px
    // = 2 px round 20 px) are unchanged; 44 px would leave the field.
    it('the select × is a 24 × 24 px box with the 20 px layout, hover fill and ring of 3.27.0', () => {
      const file = 'select/select.component.scss';
      expect(fills(file, '.lc-select__clear')).toMatchObject({
        width: '1.5rem',
        height: '1.5rem',
        margin: '-0.125rem',
        padding: '0.125rem',
        'background-clip': 'content-box',
        'border-radius': 'calc(var(--border-radius-sm) + 0.125rem)',
      });
      expect(rulesOf(css(file)).some((r) => r.selectors.includes('.lc-select__clear::before'))).toBe(false);
      expect(fills(file, '.lc-select__clear:focus-visible')['outline-offset']).toBe('0');
      expect(fills(file, '.lc-select__clear:hover')['background-clip']).toBeUndefined();
    });

    it('the 24 px areas are 24 px: 1.5rem with 24 − 2 × 2 = 20 in the layout (select ×) and 16 + 2 × 4 (tag ×)', () => {
      expect(1.5 * 16).toBe(24);
      expect(1.5 * 16 - 2 * 0.125 * 16).toBe(20);
      expect(16 + 2 * 0.25 * 16).toBe(24);
    });

    it('the rows the hit areas sit in grew just enough: NC filters 9 px (26.5 + 2 × 8.75), log toolbar 8 px', () => {
      expect(fills('notification-center/notification-center.component.scss', '.lc-nc__filters').padding).toBe('9px 16px');
      expect(fills('log-viewer/log-viewer.component.scss', '.lc-log-viewer__toolbar').padding).toBe('0.5rem');
    });
  });

  describe('D-2: real 44 px buttons where the pitch leaves no room (AC-1, AC-2)', () => {
    it('rich-text toolbar buttons are 44 × 44, mode buttons at least 44 × 44', () => {
      const btn = fills('rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__toolbar-btn');
      expect([btn.width, btn.height]).toEqual([TOUCH, TOUCH]);
      const mode = fills('rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__mode-btn');
      expect([mode['min-width'], mode['min-height'], mode.padding]).toEqual([TOUCH, TOUCH, 'var(--spacing-1) var(--spacing-2)']);
    });

    it('document-viewer tools are 44 × 44 and the toolbar wraps instead of overflowing', () => {
      const file = 'document-viewer/document-viewer.component.scss';
      const btn = fills(file, '.doc-viewer__btn');
      expect([btn.width, btn.height]).toEqual([TOUCH, TOUCH]);
      expect(fills(file, '.doc-viewer__toolbar')['flex-wrap']).toBe('wrap');
      expect(fills(file, '.doc-viewer__toolbar-left')).toMatchObject({ flex: '1 1 10rem', 'min-width': '0' });
      expect(fills(file, '.doc-viewer__toolbar-right')).toMatchObject({
        'flex-wrap': 'wrap',
        'justify-content': 'flex-end',
        'row-gap': 'var(--spacing-1)',
        'flex-shrink': '1',
        'min-width': '0',
        'margin-inline-start': 'auto',
      });
    });
  });

  describe('D-5: field hover (F-23, AC-3, AC-4)', () => {
    // [sheet, the field's selector prefix, its error class]
    const fields: [string, RegExp, string][] = [
      ['input/input.component.scss', /^\.input-container[:.]/, '.input-invalid'],
      ['select/select.component.scss', /^\.lc-select[:.]/, '.lc-select--error'],
      ['textarea/textarea.component.scss', /^\.lc-textarea--(outline|filled)[:.]/, '.lc-textarea--error'],
      ['datepicker/datepicker.component.scss', /^\.lc-datepicker[:.]/, '.lc-datepicker--error'],
    ];

    it.each(fields)('AC-4: %s: every hover rule on the field skips the error state', (file, field, error) => {
      const hovers = rulesOf(css(file))
        .flatMap((r) => r.selectors)
        .filter((s) => field.test(s) && s.includes(':hover'));
      expect(hovers.length).toBeGreaterThan(0);
      for (const s of hovers) expect([s, s.includes(`:not(${error})`)]).toEqual([s, true]);
    });

    it.each(fields)('AC-3: %s: no hover border below 3:1 (primary-400 is gone)', (file, field) => {
      const borders = rulesOf(css(file))
        .filter((r) => r.selectors.some((s) => field.test(s) && s.includes(':hover')))
        .map((r) => decls(r.body)['border-color'])
        .filter(Boolean);
      // Request 044 (F-31): --color-border (1.23:1 light) left the allow-list;
      // the filled hovers moved to --color-text-secondary as well.
      expect(borders.length).toBeGreaterThan(0);
      expect(borders.every((b) => b === 'var(--color-text-secondary)')).toBe(true);
    });

    it('AC-3: the outline hover border (--color-text-secondary) is ≥ 3:1 on the page, the surface and surface-2', () => {
      const got = themes.map(([, t]) =>
        ['--color-background', '--color-surface', '--color-surface-2'].map((bg) => ratio(colour(t, 'var(--color-text-secondary)'), colour(t, `var(${bg})`))),
      );
      expect(got).toEqual([
        [7.55, 7.55, 7.23],
        [12.16, 11.15, 9.25],
      ]);
    });

    it('AC-4: the error border at rest (and so under the pointer) is ≥ 3:1: 8.39 light, 9.47 dark on the page', () => {
      expect(themes.map(([, t]) => ratio(colour(t, 'var(--color-error-600)'), colour(t, 'var(--color-background)')))).toEqual([8.39, 9.47]);
    });
  });

  describe('D-6: the rich-text frame is a field boundary (F-24, AC-5)', () => {
    it('uses lc-input’s --color-field-border: 4.83 light, 7.31 / 6.70 dark (page / surface)', () => {
      expect(fills('rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor').border).toBe('1px solid var(--color-field-border)');
      expect(fills('input/input.component.scss', '.input-container').border).toBe('1px solid var(--color-field-border)');
      const got = themes.map(([, t]) =>
        ['--color-background', '--color-surface'].map((bg) => ratio(colour(t, 'var(--color-field-border)'), colour(t, `var(${bg})`))),
      );
      expect(got).toEqual([
        [4.83, 4.83],
        [7.31, 6.7],
      ]);
    });
  });

  describe('D-8: inks (F-26, AC-8)', () => {
    it('RTE mode .active and the gallery --active chip use the fill pair: 6.21:1 in both themes', () => {
      expect(fills('rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__mode-btn.active')).toEqual({
        'background-color': 'var(--color-primary-fill)',
        color: 'var(--color-on-primary)',
      });
      expect(fills('gallery/gallery.component.scss', '.gallery__filter-btn--active')).toEqual({
        background: 'var(--color-primary-fill)',
        'border-color': 'var(--color-primary-500)',
        color: 'var(--color-on-primary)',
      });
      expect(themes.map(([, t]) => ratio(colour(t, 'var(--color-on-primary)'), colour(t, 'var(--color-primary-fill)')))).toEqual([6.21, 6.21]);
    });

    it('gallery hover: the active chip darkens to the fill hover (9.13:1), an inactive chip takes the link ink', () => {
      const file = 'gallery/gallery.component.scss';
      expect(fills(file, '.gallery__filter-btn--active:hover')).toMatchObject({ background: 'var(--color-primary-fill-hover)', color: 'var(--color-on-primary)' });
      expect(fills(file, '.gallery__filter-btn:hover').color).toBe('var(--color-link)');
      expect(themes.map(([, t]) => ratio(colour(t, 'var(--color-on-primary)'), colour(t, 'var(--color-primary-fill-hover)')))).toEqual([9.13, 9.13]);
      expect(themes.map(([, t]) => ratio(colour(t, 'var(--color-link)'), colour(t, 'var(--color-background)')))).toEqual([6.21, 11.78]);
    });

    it('tag chip text on its tint over surface-2: 7.18 light, 6.34 dark (the dark value is today’s)', () => {
      const chip = fills('tag-input/tag-input.component.scss', '.lc-tag-input__tag');
      expect(chip.color).toBe('var(--color-on-primary-subtle)');
      const got = themes.map(([, t]) => {
        const bg = over(parse(chip.background), colour(t, 'var(--color-surface-2)'));
        return ratio(colour(t, chip.color), bg);
      });
      expect(got).toEqual([7.18, 6.34]);
      expect(colour(themes[1][1], 'var(--color-on-primary-subtle)')).toEqual(colour(themes[1][1], 'var(--color-primary-500)'));
    });

    it('chat monogram on its 18 % tint: 7.00 light, 5.11 dark (unchanged)', () => {
      const mono = fills('chat/chat.component.scss', '.lc-chat__monogram');
      expect([mono.color, mono.background]).toEqual([
        'var(--color-on-primary-subtle)',
        'color-mix(in srgb, var(--color-primary-500) 18%, var(--color-surface-2))',
      ]);
      const got = themes.map(([, t]) => ratio(colour(t, mono.color), mix(colour(t, 'var(--color-primary-500)'), 0.18, colour(t, 'var(--color-surface-2)'))));
      expect(got).toEqual([7, 5.11]);
    });

    it('no raw white is left in the changed rules', () => {
      for (const [file, selector] of [
        ['rich-text-editor/rich-text-editor.component.scss', '.lc-rich-text-editor__mode-btn.active'],
        ['gallery/gallery.component.scss', '.gallery__filter-btn--active'],
        ['gallery/gallery.component.scss', '.gallery__filter-btn--active:hover'],
      ]) {
        expect(Object.values(fills(file, selector)).join(' ')).not.toMatch(/#fff|\bwhite\b/i);
      }
    });
  });

  describe('D-10: the over-limit kanban column (F-27, AC-10)', () => {
    it('is --color-error-subtle: the title (text-secondary) reads 6.58 light, ≥ 4.5 dark on the page and the surface', () => {
      const file = 'kanban-board/kanban-board.component.scss';
      expect(fills(file, '.lc-kanban__column--over-limit').background).toBe('var(--color-error-subtle)');
      expect(fills(file, '.lc-kanban__column-header').color).toBe('var(--color-text-secondary)');
      const got = themes.map(([, t]) =>
        ['--color-background', '--color-surface'].map((bg) => ratio(colour(t, 'var(--color-text-secondary)'), over(colour(t, 'var(--color-error-subtle)'), colour(t, `var(${bg})`)))),
      );
      expect(got[0]).toEqual([6.58, 6.58]);
      expect(Math.min(...got[1])).toBeGreaterThanOrEqual(4.5);
    });

    it('the inset card ring sits on the card surface: 4.36 light, 9.12 dark', () => {
      expect(themes.map(([, t]) => ratio(colour(t, 'var(--color-primary-500)'), colour(t, 'var(--color-surface)')))).toEqual([4.36, 9.12]);
    });
  });
});
