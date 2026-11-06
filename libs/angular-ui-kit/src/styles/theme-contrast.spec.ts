import { compile } from 'sass';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

/**
 * Contrast contract of the semantic color tokens, measured on the compiled
 * theme files (the real values, not copies of them). WCAG 2.2 AA asks 4.5:1
 * for text below 18.66 px bold / 24 px regular.
 */

type Tokens = Record<string, string>;

function themeTokens(file: string): Tokens {
  const css = compile(resolve(__dirname, file)).css;
  const tokens: Tokens = {};
  for (const match of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

type Rgba = [number, number, number, number];

/** A token's color: hex or rgba(), following var() references. */
function color(tokens: Tokens, name: string, depth = 0): Rgba {
  const value = tokens[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = value.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
  if (ref) {
    if (depth > 10) throw new Error(`${name} does not resolve`);
    return tokens[ref[1]] !== undefined ? color(tokens, ref[1], depth + 1) : parse(ref[2]);
  }
  return parse(value);
}

function parse(value: string): Rgba {
  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) throw new Error(`not a color: ${value}`);
  let h = value.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1) as Rgba;
}

/** A translucent color composited over an opaque one. */
function over(top: Rgba, base: Rgba): Rgba {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + base[i] * (1 - a)).concat(1) as Rgba;
}

function hex(tokens: Tokens, name: string): string {
  const value = color(tokens, name);
  if (value[3] !== 1) throw new Error(`${name} is translucent; composite it first`);
  return '#' + value.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function luminance(color: string | Rgba): number {
  const rgb = typeof color === 'string' ? parse(color) : color;
  const [r, g, b] = rgb.slice(0, 3).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string | Rgba, b: string | Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const palettes: [string, Tokens][] = [
  ['light', themeTokens('_theme-light.scss')],
  ['dark', themeTokens('_theme-dark.scss')],
];

const surfaces = ['--color-background', '--color-surface', '--color-surface-2', '--color-surface-sunken'];

// The "Weite" ground (3.3, LK-11): every surface text may sit on in the app
// look - the sky, the sky at the horizon, the soft card fills, the muted tile,
// the land and the selected pill. Translucent ones composite over the page.
const weiteSurfaces = [
  '--color-background',
  '--color-background-low',
  '--color-surface',
  '--color-next-step-soft-neutral',
  '--color-next-step-soft-primary',
  '--color-next-step-soft-success',
  '--color-next-step-soft-warning',
  '--color-muted-tile',
  '--color-land-1',
  '--color-land-2',
  '--color-land-3',
  '--color-surface-selected',
];

const tones = ['primary', 'success', 'warning', 'error', 'info'];
const members = [1, 2, 3, 4, 5, 6].map((n) => `--color-member-${n}`);

describe('Theme contrast (WCAG 2.2 AA)', () => {
  describe.each(palettes)('%s palette', (_palette, tokens) => {
    const contrast = (fg: string, bg: string) => ratio(hex(tokens, fg), hex(tokens, bg));
    /** fg on bg, where bg may be translucent: composited over `base` first. */
    const on = (fg: string, bg: string, base = '--color-background') =>
      ratio(color(tokens, fg), over(color(tokens, bg), color(tokens, base)));

    it.each(surfaces)('--color-link reaches 4.5:1 on %s', (bg) => {
      expect(contrast('--color-link', bg)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(surfaces)('--color-link-hover reaches 4.5:1 on %s', (bg) => {
      expect(contrast('--color-link-hover', bg)).toBeGreaterThanOrEqual(4.5);
    });

    // Footer links and copyright, header navigation links.
    it.each(surfaces)('--color-text-secondary reaches 4.5:1 on %s', (bg) => {
      expect(contrast('--color-text-secondary', bg)).toBeGreaterThanOrEqual(4.5);
    });

    // The focused .skip-to-content utility.
    it('--color-on-primary reaches 4.5:1 on --color-primary-fill', () => {
      expect(contrast('--color-on-primary', '--color-primary-fill')).toBeGreaterThanOrEqual(4.5);
    });

    describe('"Weite" ground (LK-11)', () => {
      const inks = ['--color-text-primary', '--color-text-secondary', '--color-text-tertiary', '--color-link'];
      const pairs = inks.flatMap((ink) => weiteSurfaces.map((bg) => [ink, bg]));

      it.each(pairs)('%s reaches 4.5:1 on %s', (ink, bg) => {
        expect(on(ink, bg)).toBeGreaterThanOrEqual(4.5);
      });

      it.each(['--color-background', '--color-background-low', '--color-next-step-soft-neutral', '--color-next-step-soft-primary'])(
        '--color-overline reaches 4.5:1 on %s',
        (bg) => {
          expect(on('--color-overline', bg)).toBeGreaterThanOrEqual(4.5);
        },
      );

      it.each(['--color-background', '--color-surface'])(
        '--color-on-surface-selected reaches 4.5:1 on --color-surface-selected over %s',
        (base) => {
          expect(on('--color-on-surface-selected', '--color-surface-selected', base)).toBeGreaterThanOrEqual(4.5);
        },
      );

      // Non-text contrast (1.4.11) for the icons; they carry no meaning alone.
      it('the soft card bubble icon reaches 3:1 on the bubble', () => {
        expect(on('--color-bubble-icon', '--color-bubble')).toBeGreaterThanOrEqual(3);
      });

      it('the muted tile icon reaches 3:1 on the tile', () => {
        expect(on('--color-muted-tile-icon', '--color-muted-tile')).toBeGreaterThanOrEqual(3);
      });
    });

    // LK-7: white initials on every member colour.
    it.each(members)('--color-on-member reaches 4.5:1 on %s', (bg) => {
      expect(contrast('--color-on-member', bg)).toBeGreaterThanOrEqual(4.5);
    });

    // SI-8: a form field's boundary is a user-interface component (1.4.11).
    it.each(surfaces)('--color-field-border reaches 3:1 on %s', (bg) => {
      expect(contrast('--color-field-border', bg)).toBeGreaterThanOrEqual(3);
    });

    // HS-5: badge and alert ink on its tint, wherever the tint sits.
    const tintPairs = tones.flatMap((tone) => surfaces.map((base) => [tone, base]));
    it.each(tintPairs)('--color-on-%s-subtle reaches 4.5:1 on its tint over %s', (tone, base) => {
      expect(on(`--color-on-${tone}-subtle`, `--color-${tone}-subtle`, base)).toBeGreaterThanOrEqual(4.5);
    });
  });

  // Why the light tertiary ink moved (LK-11): the 3.2 value #6b7280 fails on
  // the tinted "Weite" surfaces, the new one passes (asserted above).
  it('the 3.2 tertiary ink #6b7280 stays below 4.5:1 on the light soft fills', () => {
    const light = palettes[0][1];
    expect(hex(light, '--color-text-tertiary')).not.toBe('#6b7280');
    for (const bg of ['--color-next-step-soft-primary', '--color-land-1', '--color-surface-selected']) {
      expect(ratio('#6b7280', hex(light, bg))).toBeLessThan(4.5);
    }
  });

  // Why the light warning and dark success ink moved (HS-5).
  it('the 3.2 badge inks stay below 4.5:1 on their tints', () => {
    const [light, dark] = [palettes[0][1], palettes[1][1]];
    expect(ratio('#9b6b2b', hex(light, '--color-warning-subtle'))).toBeLessThan(4.5);
    // Measured on the 3.2 dark card #14222e (3.3 cards are #101c26; #14222e is
    // now the floating bar's surface).
    const darkCard = over(color(dark, '--color-success-subtle'), parse('#14222e'));
    expect(ratio('#8ea475', darkCard)).toBeLessThan(4.5);
    expect(hex(dark, '--color-floating-bar-surface')).toBe('#14222e');
  });

  // The kit's accent rust cannot carry white initials; member 2 is rust-600.
  it('white on the kit accent rust #c6592e stays below 4.5:1', () => {
    expect(ratio('#ffffff', '#c6592e')).toBeLessThan(4.5);
  });

  it('white on --color-primary-500 stays below 4.5:1 in both palettes', () => {
    for (const [, tokens] of palettes) {
      expect(ratio('#ffffff', hex(tokens, '--color-primary-500'))).toBeLessThan(4.5);
    }
  });

  // "Weite": dark content cards are #101c26; the floating bar keeps #14222e,
  // a step above them, so it stands off a card behind it.
  it('dark cards are #101c26 and the floating bar a step above them', () => {
    const dark = palettes[1][1];
    expect(hex(dark, '--color-surface')).toBe('#101c26');
    expect(hex(dark, '--color-floating-bar-surface')).toBe('#14222e');
    expect(luminance(hex(dark, '--color-floating-bar-surface'))).toBeGreaterThan(luminance(hex(dark, '--color-surface')));
  });

  // The new tokens exist in both palettes (other components reference them).
  it('defines every 3.3 token in both palettes', () => {
    const names = [
      '--color-background-low', '--color-overline', '--color-next-step-soft-neutral', '--color-next-step-soft-primary',
      '--color-next-step-soft-success', '--color-next-step-soft-warning', '--color-bubble', '--color-bubble-ring',
      '--color-bubble-icon', '--color-hairline', '--color-surface-selected', '--color-on-surface-selected',
      '--color-muted-tile', '--color-muted-tile-border', '--color-muted-tile-icon', '--color-horizon-line',
      '--color-land-1', '--color-land-2', '--color-land-3', '--color-sun-1', '--color-sun-2', '--color-sun-3',
      '--color-sun-ring', '--color-sun-halo', ...members, '--color-on-member', '--color-floating-bar-surface',
      '--color-floating-bar-border', '--shadow-floating-bar', '--shadow-auth-card', '--color-field-border',
      '--color-on-warning-subtle', '--color-on-success-subtle', '--app-background-image', '--color-skeleton',
      '--color-skeleton-highlight', '--typography-font-size-7xl',
    ];
    for (const [, tokens] of palettes) {
      for (const name of names) expect(tokens[name]).toBeDefined();
    }
  });
});

// Request 020: the pairings the new component options read, computed from the
// theme tokens (no new token). The outline tint is the button stylesheet's own.
describe('Component pairings of 3.15 (request 020)', () => {
  const buttonCss = compile(resolve(__dirname, '../lib/button/button.component.scss')).css;
  const tint = parse(buttonCss.match(/\n\.btn-outline \{[^}]*background-color: (rgba\([^)]+\))/)?.[1] ?? '');
  const pages = ['--color-background', '--color-land-1', '--color-land-3', '--color-surface'];

  /** Design 020 §5, per palette: [light, dark]. */
  const expected = {
    emptyStateIcon: [7.85, 9.68],
    avatarGlyph: [7.0, 6.1],
    outlineActiveText: [6.71, 6.71],
  };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    /** A token's colour, translucent ones composited over `base`. */
    const solid = (name: string, base = '--color-background') => over(color(tokens, name), color(tokens, base));

    it('AC-8: the primary empty-state icon on its circle (--color-primary-700 on -100)', () => {
      const r = ratio(solid('--color-primary-700'), solid('--color-primary-100'));
      expect(r).toBeCloseTo(expected.emptyStateIcon[i], 2);
      expect(r).toBeGreaterThanOrEqual(3);
    });

    it('AC-12: the avatar person glyph on its disc (--color-neutral-700 on -300)', () => {
      const r = ratio(solid('--color-neutral-700'), solid('--color-neutral-300'));
      expect(r).toBeCloseTo(expected.avatarGlyph[i], 2);
      expect(r).toBeGreaterThanOrEqual(3);
    });

    it.each(pages)('AC-13: outline primary at rest on %s: text 4.5:1 on the tint, border 3:1', (page) => {
      const ground = solid(page);
      expect(ratio(solid('--color-primary-700'), over(tint, ground))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(solid('--color-primary-600'), ground)).toBeGreaterThanOrEqual(3);
    });

    it.each(pages)('AC-13: outline primary on hover over %s: text 4.5:1 on --color-surface-selected, border 3:1', (page) => {
      const fill = solid('--color-surface-selected', page);
      expect(ratio(solid('--color-primary-700'), fill)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(solid('--color-primary-600'), solid(page))).toBeGreaterThanOrEqual(3);
    });

    it('AC-13: outline primary active: text on --color-primary-200 and the border beside it', () => {
      const fill = solid('--color-primary-200');
      const text = ratio(solid('--color-primary-700'), fill);
      expect(text).toBeCloseTo(expected.outlineActiveText[i], 2);
      expect(text).toBeGreaterThanOrEqual(4.5);
      expect(ratio(solid('--color-primary-600'), fill)).toBeGreaterThanOrEqual(3);
    });
  });
});

// Request 022 (3.16): the focus ring of clickable table rows and list link rows
// (--color-primary-500, 2 px) on every row fill (1.4.11 and 2.4.13 need 3:1).
describe('Component pairings of 3.16 (request 022)', () => {
  /** Design 022 §5, per palette [light, dark]: table row fills on the card (--color-surface). */
  const rows: [string, [number, number]][] = [
    ['--color-surface', [4.37, 9.13]],
    ['--color-surface-2', [4.18, 7.58]],
    ['--color-surface-hover', [3.97, 8.18]],
    ['--color-surface-selected', [3.76, 6.87]],
  ];

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const solid = (name: string, base = '--color-surface') => over(color(tokens, name), color(tokens, base));

    it.each(rows)('AC-5: the --color-primary-500 row ring reaches 3:1 on %s', (fill, values) => {
      const r = ratio(solid('--color-primary-500'), solid(fill));
      expect(r).toBeCloseTo(values[i], 1);
      expect(r).toBeGreaterThanOrEqual(3);
    });
  });
});

// Request 021 (3.17): the lc-list status badges (12 px / 500, so 4.5:1) and the
// focus ring of a loading lc-button, which its 0.5 opacity fades. The token
// names come from the compiled component stylesheets, the values from the themes.
describe('Component pairings of 3.17 (request 021)', () => {
  const listCss = compile(resolve(__dirname, '../lib/list/list.component.scss')).css;
  const buttonCss = compile(resolve(__dirname, '../lib/button/button.component.scss')).css;

  /** The background and ink token of a list badge variant (a fallback after the name is ignored). */
  function badgeTokens(variant: string): [string, string] {
    const body = listCss.match(new RegExp(`\\n\\.lc-list__badge--${variant} \\{([^}]*)\\}`))?.[1] ?? '';
    const bg = body.match(/background-color: var\((--[\w-]+)/)?.[1] ?? '';
    const ink = body.match(/\scolor: var\((--[\w-]+)/)?.[1] ?? '';
    expect([bg, ink]).toEqual([expect.stringMatching(/^--color-/), expect.stringMatching(/^--color-/)]);
    return [bg, ink];
  }

  /** Design 021 §5: the minimum over the bases, per palette [light, dark]. */
  const badges: [string, [string, string], [number, number]][] = [
    ['success', ['--color-success-subtle', '--color-on-success-subtle'], [4.85, 5.17]],
    ['warning', ['--color-warning-subtle', '--color-on-warning-subtle'], [5.52, 4.61]],
    ['error', ['--color-error-100', '--color-on-error-subtle'], [6.33, 7.17]],
    ['primary', ['--color-primary-100', '--color-primary-700'], [7.85, 9.68]],
    ['default', ['--color-surface-hover', '--color-text-secondary'], [6.87, 8.18]],
  ];

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    /** The grounds a list sits on: the page, the card surfaces and a hovered row (over the surface). */
    const bases: Rgba[] = [
      color(tokens, '--color-background'),
      color(tokens, '--color-surface'),
      over(color(tokens, '--color-surface-2'), color(tokens, '--color-surface')),
      over(color(tokens, '--color-surface-hover'), color(tokens, '--color-surface')),
    ].map((c) => over(c, color(tokens, '--color-background')));

    it.each(badges)('AC-12: the %s list badge reaches 4.5:1 on every ground', (variant, pair, values) => {
      expect(badgeTokens(variant)).toEqual(pair);
      const [bg, ink] = pair;
      const min = Math.min(
        ...bases.map((base) => {
          const fill = over(color(tokens, bg), base);
          return ratio(over(color(tokens, ink), fill), fill);
        }),
      );
      expect(min).toBeCloseTo(values[i], 2);
      expect(min).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-7: the ring of a focused loading button (--color-text-primary at 50 %) reaches 3:1 on the page and the surfaces', () => {
      expect(buttonCss).toMatch(/\n\.btn\.btn-loading:focus-visible \{\s*outline-color: var\(--color-text-primary\);/);
      const ink = color(tokens, '--color-text-primary');
      for (const base of bases.slice(0, 3)) {
        expect(ratio(over([ink[0], ink[1], ink[2], 0.5], base), base)).toBeGreaterThanOrEqual(3);
      }
    });
  });
});

// Request 024 (3.19): the lc-menu danger item (020 review S2: --color-error was
// 2.06:1 on the dark menu) and the restyled lc-table pager. The token names
// come from the compiled stylesheets, the values from the themes.
describe('Component pairings of 3.19 (request 024)', () => {
  const menuScss = readFileSync(resolve(__dirname, '../lib/menu/menu.component.scss'), 'utf8');
  const menuCss = compile(resolve(__dirname, '../lib/menu/menu.component.scss')).css;
  const tableCss = compile(resolve(__dirname, '../lib/table/table.component.scss')).css;
  const body = (css: string, selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('AC-8: the danger item reads --color-text-error, its hover --color-error-subtle; no raw colour', () => {
    expect(body(menuCss, '.lc-menu__item--danger')).toMatch(/\scolor: var\(--color-text-error\);/);
    expect(body(menuCss, '.lc-menu__item--danger:hover:not(.lc-menu__item--disabled)')).toMatch(
      /background-color: var\(--color-error-subtle\);/,
    );
    expect(menuCss).not.toMatch(/--danger--disabled/);
    expect(menuScss).not.toMatch(/rgba\(|#[0-9a-f]{3,8}\b/i);
  });

  it('AC-4: the pager reads the field border, the second surface and the kit ring', () => {
    const btn = body(tableCss, '.lc-table-pagination__btn');
    expect(btn).toMatch(/border: 1px solid var\(--color-field-border\);/);
    expect(btn).toMatch(/background-color: var\(--color-surface-2\);/);
    expect(btn).toMatch(/\scolor: var\(--color-text-primary\);/);
    expect(body(tableCss, '.lc-table-pagination__btn:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\);/);
  });

  /** Design 024 §5, per palette [light, dark]: the minimum over both panel ends. */
  const expected = { dangerRest: [12.05, 7.21], dangerHover: [10.98, 7.21], dangerFocus: [11.44, 6.37] };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const page = color(tokens, '--color-background');
    /** A token over `base` (translucent ones composited), on the opaque page. */
    const on = (name: string, base: Rgba = page) => over(color(tokens, name), base);
    /** The menu panel's ends: --color-surface and --color-surface-2 (its gradient runs between them). */
    const panels = [on('--color-surface'), on('--color-surface-2', on('--color-surface'))];
    const ink = (fill: Rgba) => ratio(on('--color-text-error', fill), fill);

    it('AC-8: danger text at rest, on hover and on focus reaches 4.5:1 on the menu', () => {
      const rest = Math.min(...panels.map(ink));
      const hover = Math.min(...panels.map((p) => ink(on('--color-error-subtle', p))));
      const focus = Math.min(...panels.map((p) => ink(on('--color-surface-hover', p))));
      expect(rest).toBeCloseTo(expected.dangerRest[i], 2);
      expect(hover).toBeCloseTo(expected.dangerHover[i], 2);
      expect(focus).toBeCloseTo(expected.dangerFocus[i], 2);
      expect(Math.min(rest, hover, focus)).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-8: the focus ring (--color-primary-500) reaches 3:1 on the focused danger item', () => {
      for (const p of panels) {
        const fill = on('--color-surface-hover', p);
        expect(ratio(on('--color-primary-500', fill), fill)).toBeGreaterThanOrEqual(3);
      }
    });

    it.each(['--color-background', '--color-surface'])('AC-4: pager border 3:1, ring 3:1 and glyph 4.5:1 on %s', (ground) => {
      const g = on(ground);
      expect(ratio(on('--color-field-border', g), g)).toBeGreaterThanOrEqual(3);
      expect(ratio(on('--color-primary-500', g), g)).toBeGreaterThanOrEqual(3);
      const fill = on('--color-surface-2', g);
      expect(ratio(on('--color-text-primary', fill), fill)).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// Request 025 (3.19.1): the lc-notification-center filter chips and unread
// badge (024 review finding 4, axe color-contrast: white on the level colours
// was 1.89 to 4.37:1, the badge 1.99:1 in dark).
describe('Component pairings of 3.19.1 (request 025)', () => {
  const ncCss = compile(resolve(__dirname, '../lib/notification-center/notification-center.component.scss')).css;
  const body = (selector: string) => {
    const at = ncCss.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return ncCss.slice(at, ncCss.indexOf('}', at));
  };

  it('AC-7: the chips and the badge read tokens only; one pressed style for every level', () => {
    expect(body('.lc-nc__filter')).toMatch(/\scolor: var\(--color-text-secondary\);/);
    expect(body('.lc-nc__filter:hover:not(.lc-nc__filter--active)')).toMatch(/background: var\(--color-surface-2\);/);
    const active = body('.lc-nc__filter--active');
    expect(active).toMatch(/background: var\(--color-primary-fill\);/);
    expect(active).toMatch(/\scolor: var\(--color-on-primary\);/);
    expect(active).toMatch(/border-color: var\(--color-primary-500\);/);
    const badge = body('.lc-nc__badge');
    expect(badge).toMatch(/background: var\(--color-error-fill\);/);
    expect(badge).toMatch(/\scolor: var\(--color-on-error\);/);
    // No per-level pressed colours, and no raw colour in the chip or badge rules.
    expect(ncCss).not.toMatch(/\.lc-nc__filter--(error|warning|success|info)\.lc-nc__filter--active/);
    const chipRules = [...ncCss.matchAll(/(^|\n)([^{}\n]*\.lc-nc__(filter|badge)[^{}]*)\{([^{}]*)\}/g)];
    expect(chipRules.length).toBeGreaterThanOrEqual(4);
    for (const rule of chipRules) expect(rule[4]).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|:\s*white\b/i);
  });

  // 3.33 (request 052, 044-n3, AC-16): the pressed mark in forced colours is
  // a Highlight underline (the rich-text-editor's), not the focus ring's
  // 2 px outline, and it stays while the chip is focused.
  it('AC-13: in forced colours the pressed chip is underlined in Highlight, also while focused', () => {
    const at = ncCss.indexOf('@media (forced-colors: active)');
    expect(at).toBeGreaterThan(-1);
    const media = ncCss.slice(at, ncCss.indexOf('}\n}', at));
    expect(media).toMatch(
      /\.lc-nc__filter\[aria-pressed=true\] \{\s*text-decoration-line: underline;\s*text-decoration-thickness: 2px;\s*text-underline-offset: 4px;\s*text-decoration-color: Highlight;/,
    );
    expect(media).not.toMatch(/:not\(:focus-visible\)/);
    expect(media).not.toMatch(/outline: 2px solid Highlight;/);
  });

  /** Design 025 §5, per palette [light, dark]: the minimum over both panel ends. */
  const expected = { rest: [7.23, 9.26], active: [6.21, 6.21], rim: [4.18, 7.58], badge: [8.39, 8.39] };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const page = color(tokens, '--color-background');
    const on = (name: string, base: Rgba = page) => over(color(tokens, name), base);
    /** The panel's ends: --color-surface and --color-surface-2 (its gradient runs between them). */
    const panels = [on('--color-surface'), on('--color-surface-2', on('--color-surface'))];

    it('AC-7: chip text at rest and on hover reaches 4.5:1 on the panel', () => {
      const rest = Math.min(...panels.map((p) => ratio(on('--color-text-secondary', p), p)));
      const hover = Math.min(
        ...panels.map((p) => {
          const fill = on('--color-surface-2', p);
          return ratio(on('--color-text-secondary', fill), fill);
        }),
      );
      expect(rest).toBeCloseTo(expected.rest[i], 2);
      expect(hover).toBeCloseTo(expected.rest[i], 2);
      expect(Math.min(rest, hover)).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-7: the pressed chip: text 4.5:1 on its fill, rim 3:1 on the panel', () => {
      const fill = on('--color-primary-fill');
      const text = ratio(on('--color-on-primary', fill), fill);
      const rim = Math.min(...panels.map((p) => ratio(on('--color-primary-500', p), p)));
      expect(text).toBeCloseTo(expected.active[i], 2);
      expect(rim).toBeCloseTo(expected.rim[i], 2);
      expect(text).toBeGreaterThanOrEqual(4.5);
      expect(rim).toBeGreaterThanOrEqual(3);
    });

    it('AC-7: the unread badge reaches 4.5:1', () => {
      const fill = on('--color-error-fill');
      const badge = ratio(on('--color-on-error', fill), fill);
      expect(badge).toBeCloseTo(expected.badge[i], 2);
      expect(badge).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// Request 026 (3.19.2): the lc-toast close button (025 review finding 1). It
// had no colour, so the × and its currentColor ring took the UA's black
// buttontext: 1.47 / 1.22:1 on the dark toast. WCAG 1.4.11 asks 3:1.
describe('Component pairings of 3.19.2 (request 026)', () => {
  const toastCss = compile(resolve(__dirname, '../lib/toast/toast.component.scss')).css;
  const rules = [...toastCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const rule = (selector: string) => {
    const found = rules.filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };
  const variants = ['success', 'error', 'warning', 'info'];
  /** The close hover tints of 3.19.1, unchanged (a non-goal of 026). */
  const tints = ['rgba(142, 164, 117, 0.1)', 'rgba(157, 14, 14, 0.1)', 'rgba(225, 160, 64, 0.1)', 'rgba(59, 101, 136, 0.1)'];

  it('AC-1: the close button reads --color-text-secondary; no raw colour, no variant override', () => {
    const close = rule('.lc-toast__close');
    expect(close).toMatch(/\scolor: var\(--color-text-secondary\);/);
    expect(close).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    // The variants tint the hover only; none sets the × colour.
    const others = rules.filter((r) => r.selector.includes('.lc-toast__close') && r.selector !== '.lc-toast__close');
    expect(others.length).toBeGreaterThanOrEqual(5);
    for (const r of others) expect(r.body).not.toMatch(/(^|[\s;])color:/);
  });

  it('AC-3: the ring is the × colour, inside the box; the toast styles never opt out of forced colours', () => {
    const ring = rule('.lc-toast__close:focus-visible');
    expect(ring).toMatch(/outline: 2px solid currentColor;/);
    expect(ring).toMatch(/outline-offset: -2px;/);
    expect(toastCss).not.toMatch(/forced-color-adjust/);
  });

  it('AC-4: the hover tints are the four of 3.19.1, on a gradient-surface toast', () => {
    variants.forEach((v, n) => {
      expect(rule(`.lc-toast--${v} .lc-toast__close:hover`)).toMatch(new RegExp(`background-color: ${tints[n].replace(/[().]/g, '\\$&')};`));
      const toast = rule(`.lc-toast--${v}`);
      expect(toast).toMatch(/background-color: var\(--color-surface\);/);
      expect(toast).toMatch(/background-image: var\(--gradient-surface\);/);
    });
  });

  /** Design 026 §5, per palette [light, dark]: the minimum over both gradient ends (and every hover tint). */
  const expected = { rest: [7.23, 9.26], hover: [6.02, 7.82] };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const page = color(tokens, '--color-background');
    const on = (name: string, base: Rgba = page) => over(color(tokens, name), base);
    /** The toast's ends: the stops of --gradient-surface, over its --color-surface fill. */
    const gradient = tokens['--gradient-surface'].match(/^linear-gradient\(180deg,\s*(.+)\)$/);
    const stops = (gradient ? gradient[1] : '').split(/,\s*(?![^(]*\))/).map((stop) => {
      const ref = stop.match(/^var\((--[\w-]+)\)$/);
      return over(ref ? color(tokens, ref[1]) : parse(stop), on('--color-surface'));
    });
    const ink = (fill: Rgba) => ratio(on('--color-text-secondary', fill), fill);

    it('AC-2/AC-3: the × and its ring reach 3:1 at both ends of the toast', () => {
      expect(stops).toHaveLength(2);
      const rest = Math.min(...stops.map(ink));
      expect(rest).toBeCloseTo(expected.rest[i], 2);
      expect(rest).toBeGreaterThanOrEqual(3);
    });

    it('AC-4: the × and its ring reach 3:1 on every variant hover tint', () => {
      const hover = Math.min(...tints.flatMap((tint) => stops.map((end) => ink(over(parse(tint), end)))));
      expect(hover).toBeCloseTo(expected.hover[i], 2);
      expect(hover).toBeGreaterThanOrEqual(3);
    });
  });
});

// Request 027 (3.20): the lc-toast and lc-alert variant icons (026 review
// finding 2). They read the plain fills --color-<variant>: success and warning
// in light, error and info in dark stayed below 3:1 (toast warning light 2.16,
// error dark 1.71). WCAG 1.4.11 asks 3:1. They now read the inks
// --color-on-<variant>-subtle; the fills keep the toast rail and the alert tint.
describe('Component pairings of 3.20 (request 027)', () => {
  const sheets = {
    toast: compile(resolve(__dirname, '../lib/toast/toast.component.scss')).css,
    alert: compile(resolve(__dirname, '../lib/alert/alert.component.scss')).css,
  };
  const rulesOf = (css: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const rule = (component: keyof typeof sheets, selector: string) => {
    const found = rulesOf(sheets[component]).filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };
  const variants = ['success', 'error', 'warning', 'info'];

  it('AC-14/AC-16: each variant icon reads its ink token, no raw colour; the fills stay on the rail and the tint', () => {
    for (const c of ['toast', 'alert'] as const) {
      for (const v of variants) {
        expect(rule(c, `.lc-${c}--${v} .lc-${c}__icon`).trim()).toBe(`color: var(--color-on-${v}-subtle);`);
      }
      // The base icon rule sets no colour; nothing else colours the icon.
      expect(rule(c, `.lc-${c}__icon`)).not.toMatch(/(^|[\s;])color:/);
      const others = rulesOf(sheets[c]).filter((r) => r.selector.includes(`.lc-${c}__icon`) && /(^|[\s;])color:/.test(r.body));
      expect(others).toHaveLength(4);
      // AC-17: the UA forces the icon's currentColor in forced colours.
      expect(sheets[c]).not.toMatch(/forced-color-adjust/);
    }
    for (const v of variants) {
      expect(rule('toast', `.lc-toast--${v}`)).toMatch(new RegExp(`border-left: 4px solid var\\(--color-${v}\\);`));
    }
  });

  /** Design 027 §5, per palette [light, dark]: the minimum over the variants and the lowest backgrounds. */
  const expected = { toast: [5.07, 6.35], alert: [4.38, 4.97], before: [2.16, 1.71] };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const page = color(tokens, '--color-background');
    const on = (name: string, base: Rgba = page) => over(color(tokens, name), base);
    /** The toast's ends: the stops of --gradient-surface, over its --color-surface fill. */
    const gradient = tokens['--gradient-surface'].match(/^linear-gradient\(180deg,\s*(.+)\)$/);
    const stops = (gradient ? gradient[1] : '').split(/,\s*(?![^(]*\))/).map((stop) => {
      const ref = stop.match(/^var\((--[\w-]+)\)$/);
      return over(ref ? color(tokens, ref[1]) : parse(stop), on('--color-surface'));
    });
    const toastMin = (icon: (v: string) => string) =>
      Math.min(...variants.flatMap((v) => stops.map((end) => ratio(over(color(tokens, icon(v)), end), end))));

    it('AC-12: the toast icon reaches 3:1 at both ends of the toast in every variant', () => {
      expect(stops).toHaveLength(2);
      const min = toastMin((v) => `--color-on-${v}-subtle`);
      expect(min).toBeCloseTo(expected.toast[i], 2);
      expect(min).toBeGreaterThanOrEqual(3);
    });

    it('AC-13: the alert icon reaches 3:1 on its tint over every surface it may sit on', () => {
      const bases = [...surfaces, '--color-background-low'].map((name) => on(name));
      const min = Math.min(
        ...variants.flatMap((v) => {
          const tint = rule('alert', `.lc-alert--${v}`).match(/background-color: (rgba\([^)]+\));/);
          expect(tint).not.toBeNull();
          return bases.map((base) => {
            const fill = over(parse((tint as RegExpMatchArray)[1]), base);
            return ratio(over(color(tokens, `--color-on-${v}-subtle`), fill), fill);
          });
        }),
      );
      expect(min).toBeCloseTo(expected.alert[i], 2);
      expect(min).toBeGreaterThanOrEqual(3);
    });

    it('why: the plain fills of 3.19.2 stayed below 3:1 on the toast', () => {
      const before = toastMin((v) => `--color-${v}`);
      expect(before).toBeCloseTo(expected.before[i], 2);
      expect(before).toBeLessThan(3);
    });
  });
});

// Request 029 (3.21.1): the follow-up candidates of 027 design §5. Status
// colours used as text, icon, glyph, border or progress fill read the inks
// --color-on-<v>-subtle in both themes (WCAG 1.4.3 4.5:1 for text, 1.4.11 3:1
// for graphics). The shared fills, rails and line tints stay; the card and
// notification chips sit on --color-<v>-subtle (design 029 D-1).
describe('Component pairings of 3.21.1 (request 029)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const sheets = {
    nc: compile(lib('notification-center/notification-center.component.scss')).css,
    card: compile(lib('card/card.component.scss')).css,
    markdown: compile(lib('markdown/markdown.component.scss')).css,
    dot: compile(lib('status-dot/status-dot.component.scss')).css,
    pipeline: compile(lib('pipeline/pipeline.component.scss')).css,
    upload: compile(lib('file-upload/file-upload.component.scss')).css,
    rating: compile(lib('rating/rating.component.scss')).css,
    log: compile(lib('log-viewer/log-viewer.component.scss')).css,
    diff: compile(lib('diff-viewer/diff-viewer.component.scss')).css,
    dep: compile(lib('dependency-viewer/dependency-viewer.component.scss')).css,
    kanban: compile(lib('kanban-board/kanban-board.component.scss')).css,
    progress: compile(lib('progress-bar/progress-bar.component.scss')).css,
  };
  type Sheet = keyof typeof sheets;
  const rulesOf = (css: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const rule = (sheet: Sheet, selector: string) => {
    const found = rulesOf(sheets[sheet]).filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };
  /** The declarations of a rule body, property → value. */
  const decls = (body: string): Record<string, string> =>
    Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const ink = (v: string) => `var(--color-on-${v}-subtle)`;
  const sub = (v: string) => `var(--color-${v}-subtle)`;
  const fills = (sheet: Sheet, selector: string) => decls(rule(sheet, selector));

  const swaps: [Sheet, string, Record<string, string>][] = [
    ...(['info', 'success', 'warning', 'error'] as const).map((v): [Sheet, string, Record<string, string>] => ['nc', `.lc-nc__item-icon--${v}`, { color: ink(v) }]),
    ['nc', '.lc-nc__item-priority--high', { background: sub('warning'), color: ink('warning') }],
    ['nc', '.lc-nc__item-priority--urgent', { background: sub('error'), color: ink('error') }],
    ...(['success', 'warning', 'error'] as const).map((v): [Sheet, string, Record<string, string>] => ['card', `.card__badge--${v}`, { 'background-color': sub(v), color: ink(v) }]),
    ['markdown', '.lc-markdown__mermaid-error', { color: ink('error') }],
    ['dot', '.lc-status-dot--done', { color: ink('success') }],
    ['dot', '.lc-status-dot--wait', { color: ink('warning') }],
    ['dot', '.lc-status-dot--blocked', { color: ink('error') }],
    ['pipeline', '.lc-pipeline__step--warning .lc-pipeline__node', { 'border-color': ink('warning'), color: ink('warning') }],
    ['pipeline', '.lc-pipeline__step--error .lc-pipeline__node', { 'border-color': ink('error'), color: ink('error') }],
    ['pipeline', '.lc-pipeline__step--complete .lc-pipeline__node', { 'background-color': 'var(--color-primary-500)', color: 'var(--color-surface)' }],
    ['upload', '.file-upload__file-remove:hover', { background: 'rgba(157, 14, 14, 0.18)', color: ink('error') }],
    ['rating', '.rating__icon--filled', { color: ink('warning') }],
    ['rating', '.rating__icon-fill', { color: ink('warning') }],
    ['log', '.lc-log-viewer__line--info .lc-log-viewer__level', { color: ink('info') }],
    ['log', '.lc-log-viewer__line--warn .lc-log-viewer__level', { color: ink('warning') }],
    ['log', '.lc-log-viewer__line--error .lc-log-viewer__level', { color: ink('error') }],
    ['log', '.lc-log-viewer__level-pill--error', { 'background-color': 'rgba(157, 14, 14, 0.18)', color: ink('error') }],
    ['log', '.lc-log-viewer__level-pill--warn', { 'background-color': 'rgba(225, 160, 64, 0.18)', color: ink('warning') }],
    ['log', '.lc-log-viewer__level-pill--active', { 'box-shadow': 'inset 0 0 0 1px currentColor' }],
    ['diff', '.lc-diff__stat--add', { color: ink('success') }],
    ['diff', '.lc-diff__stat--del', { color: ink('error') }],
    ['diff', '.lc-diff__line--added .lc-diff__prefix', { color: ink('success') }],
    ['diff', '.lc-diff__line--removed .lc-diff__prefix', { color: ink('error') }],
    ...(['success', 'warning', 'error'] as const).map((v): [Sheet, string, Record<string, string>] => ['dep', `.dep-viewer__detail-status--${v}`, { color: ink(v) }]),
    ['kanban', '.lc-kanban__column-limit--over', { color: ink('error') }],
    ...(['success', 'warning', 'error', 'info'] as const).flatMap((v): [Sheet, string, Record<string, string>][] => [
      ['progress', `.progress-bar--${v} .progress-bar__fill`, { 'background-color': ink(v) }],
      ['progress', `.progress-bar-circular--${v} .progress-bar-circular__fill`, { stroke: ink(v) }],
    ]),
  ];

  it.each(swaps)('AC-1…10: %s %s reads the status ink (no raw colour)', (sheet, selector, expectedDecls) => {
    const found = fills(sheet, selector);
    for (const [property, value] of Object.entries(expectedDecls)) expect(found[property]).toBe(value);
  });

  it('AC-4: the notification type icons carry no hex fallback any more', () => {
    expect(sheets.nc).not.toMatch(/#3b82f6|#22c55e|#f59e0b|#ef4444/i);
  });

  // 3.33 (request 052, 044-n3, AC-16): the forced-colours mark is the
  // rich-text-editor's Highlight underline (was a 2 px outline, hidden on focus).
  it('D-2: the level pills stay at full opacity; the pressed pill is underlined in forced colours', () => {
    expect(fills('log', '.lc-log-viewer__level-pill').opacity).toBeUndefined();
    expect(fills('log', '.lc-log-viewer__level-pill--active').opacity).toBeUndefined();
    expect(sheets.log).toMatch(
      /@media \(forced-colors: active\) \{\s*\.lc-log-viewer__level-pill\[aria-pressed=true\] \{\s*text-decoration-line: underline;\s*text-decoration-thickness: 2px;\s*text-underline-offset: 4px;\s*text-decoration-color: Highlight;\s*\}/,
    );
    expect(sheets.log).not.toMatch(/level-pill--active:not\(:focus-visible\)/);
  });

  it('AC-10: the progress track is unchanged; primary reads the theme token (request 039), secondary the data mark (036)', () => {
    // The base rule (the forced-colours block repeats the selector with an outline).
    expect(sheets.progress).toMatch(/\n\.progress-bar__track \{\s*flex: 1;\s*background-color: var\(--color-surface-hover\);/);
    // 039 (F-14): the raw #208497 was 2.89:1 against the dark track; primary
    // now reads --color-primary-500 (same hex in light, 6.69:1 dark). This
    // line asserted the raw hex before 3.25.
    expect(fills('progress', '.progress-bar--primary .progress-bar__fill')['background-color']).toBe('var(--color-primary-500)');
    // 036 (F-11): the raw secondary-500 was 2.83:1 against the light track;
    // secondary now reads the data-mark token (4.19 light, 4.05 dark).
    expect(fills('progress', '.progress-bar--secondary .progress-bar__fill')['background-color']).toBe('var(--color-secondary-graphic)');
  });

  it('AC-9: kanban priorities, dependency relations, arrows and node borders read the inks', () => {
    const source = (path: string) => readFileSync(lib(path), 'utf8');
    const kanban = source('kanban-board/kanban-board.component.ts');
    const depTs = source('dependency-viewer/dependency-viewer.component.ts');
    const depHtml = source('dependency-viewer/dependency-viewer.component.html');
    for (const text of [kanban, depTs, depHtml]) {
      expect(text).not.toMatch(/--color-(success|warning|error|info)-default/);
      expect(text).not.toMatch(/#3b82f6/i);
    }
    const priorities: [string, string][] = [['critical', 'error'], ['high', 'warning'], ['medium', 'info'], ['low', 'success']];
    for (const [priority, v] of priorities) {
      expect(kanban).toContain(`case '${priority}': return '${ink(v)}';`);
    }
    const relations: [string, string][] = [['blocks', 'error'], ['references', 'info'], ['requires', 'warning'], ['implements', 'success']];
    for (const [relation, v] of relations) {
      expect(depTs).toMatch(new RegExp(`${relation}:\\s*\\{ color: '${ink(v).replace(/[()]/g, '\\$&')}'`));
      expect(depHtml).toMatch(new RegExp(`<marker id="arrow-${relation}"[^>]*><path [^>]*fill="${ink(v).replace(/[()]/g, '\\$&')}"/>`));
    }
    for (const v of ['success', 'warning', 'error']) {
      expect(depTs).toMatch(new RegExp(`${v}:\\s*\\{ bg: '[^']+', border: '${ink(v).replace(/[()]/g, '\\$&')}'`));
    }
  });

  /**
   * Design 029 §5, per palette [light, dark]: the minimum over every listed
   * element and its real backgrounds. Text 4.85 L (card success chip) and 4.60
   * D (NC high on the panel top, card warning on surface-2); graphics 3.52 L
   * (diff +, dependency success border) and 4.83 D (NC warning icon on an
   * unread row). F-1: the NC high chip on an unread row in dark was 3.67; since
   * 3.22.4 (request 034 D-1) the chip paints its tint over an opaque surface: 5.55.
   */
  const expected = { text: [4.85, 4.6], graphic: [3.52, 4.83], ncUnread: [5.52, 5.55], completeGlyph: [4.36, 9.12] };
  const floor = (n: number) => Math.floor(n * 100) / 100;

  /**
   * Design 029 §2/§5 (r1, review finding 1): the terminal is always dark, so
   * its levels use its own palette in both themes. The nested block of 3.21.0
   * compiled to `.lc-log-viewer__line--<lv> .lc-log-viewer--terminal
   * .lc-log-viewer__level` (a line outside the terminal), never matched, and
   * left the terminal levels on the theme's colours (light ink: warn 2.40).
   */
  const terminalLevels: [string, string, number][] = [
    ['debug', '#9399b2', 5.81],
    ['info', '#89b4fa', 7.78],
    ['warn', '#f9e2af', 11.43],
    ['error', '#f38ba8', 6.19],
  ];

  it('AC-9 (r1): the terminal levels read the terminal palette at (0,3,0); the dead selector shape is gone', () => {
    for (const [lv, hexValue] of terminalLevels) {
      // Three classes beat the log variant's `.lc-log-viewer__line--<lv> .lc-log-viewer__level` (0,2,0).
      expect(fills('log', `.lc-log-viewer--terminal .lc-log-viewer__line--${lv} .lc-log-viewer__level`)).toEqual({ color: hexValue });
    }
    expect(sheets.log).not.toMatch(/\.lc-log-viewer__line--[\w-]+ \.lc-log-viewer--terminal/);
  });

  it('AC-9 (r1): the terminal levels reach 4.5:1 on the terminal and its warn and error line tints, in both themes', () => {
    const terminal = parse(fills('log', '.lc-log-viewer--terminal')['background-color']);
    const lineTint = (lv: string) => over(parse(fills('log', `.lc-log-viewer--terminal .lc-log-viewer__line--${lv}`)['background-color']), terminal);
    const bases: Record<string, Rgba> = { debug: terminal, info: terminal, warn: lineTint('warn'), error: lineTint('error') };
    for (const [lv, hexValue, expectedRatio] of terminalLevels) {
      const level = ratio(hexValue, bases[lv]);
      expect(floor(level)).toBe(expectedRatio);
      expect(level).toBeGreaterThanOrEqual(4.5);
    }
  });

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);
    const S = c('--color-surface');
    const S2 = c('--color-surface-2');
    const BG = c('--color-background');
    const LOW = c('--color-background-low');
    const SUN = c('--color-surface-sunken');
    const TILE = c('--color-muted-tile');
    const hov = (base: Rgba) => over(c('--color-surface-hover'), base);
    const sel = (base: Rgba) => over(c('--color-surface-selected'), base);
    /** A token or literal from a rule body, composited over `base`. */
    const layer = (value: string, base: Rgba) => {
      const ref = value.match(/^var\((--[\w-]+)\)$/);
      return over(ref ? c(ref[1]) : parse(value), base);
    };
    const inkOf = (v: string) => c(`--color-on-${v}-subtle`);
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(over(fg, bg), bg)));

    const panel = [S2, S, hov(S)];
    const unread = [sel(S2), sel(S)];
    const chip = (sheet: Sheet, selector: string, v: string, bases: Rgba[]) => {
      const d = fills(sheet, selector);
      return lowest(inkOf(v), bases.map((b) => layer(d.background ?? d['background-color'], b)));
    };
    const tint = (sheet: Sheet, selector: string, property: string, base: Rgba) => layer(fills(sheet, selector)[property], base);

    const text = () => [
      chip('nc', '.lc-nc__item-priority--high', 'warning', panel),
      chip('nc', '.lc-nc__item-priority--urgent', 'error', panel),
      // A selected card's background is --color-surface-selected over the page.
      ...(['success', 'warning', 'error'] as const).map((v) => chip('card', `.card__badge--${v}`, v, [S, S2, hov(S), sel(BG), TILE])),
      lowest(inkOf('error'), [BG, S, S2, LOW, SUN]),
      lowest(inkOf('info'), [S, hov(S), tint('log', '.lc-log-viewer__line:hover', 'background-color', S)]),
      lowest(inkOf('warning'), [tint('log', '.lc-log-viewer--log .lc-log-viewer__line--warn', 'background-color', S)]),
      lowest(inkOf('error'), [tint('log', '.lc-log-viewer--log .lc-log-viewer__line--error', 'background-color', S)]),
      lowest(inkOf('warning'), [tint('log', '.lc-log-viewer__level-pill--warn', 'background-color', S)]),
      lowest(inkOf('error'), [tint('log', '.lc-log-viewer__level-pill--error', 'background-color', S)]),
      lowest(inkOf('success'), [S2]),
      lowest(inkOf('error'), [S2]),
      ...['success', 'warning', 'error', 'info'].map((v) => lowest(inkOf(v), [S, S2])),
      lowest(inkOf('error'), [layer('var(--color-error-50)', S), layer('var(--color-error-50)', BG)]),
    ];

    const graphic = () => [
      ...['success', 'warning', 'error', 'info'].map((v) => lowest(inkOf(v), [...panel, ...unread])),
      ...['success', 'warning', 'error'].map((v) => lowest(inkOf(v), [S, BG, S2])),
      lowest(inkOf('error'), [tint('upload', '.file-upload__file-remove:hover', 'background', S2)]),
      ...['success', 'error'].map((v) => lowest(inkOf(v), [layer(`var(--color-${v}-50)`, S), layer(`var(--color-${v}-50)`, BG)])),
      ...['success', 'warning', 'error'].map((v) => lowest(inkOf(v), [layer(`var(--color-${v}-50)`, S), S])),
      ...['success', 'warning', 'error', 'info'].map((v) => lowest(inkOf(v), [S])),
      ...['success', 'warning', 'error', 'info'].map((v) => lowest(inkOf(v), [hov(S), hov(BG), hov(S2)])),
    ];

    it('AC-1/2/3/9: every listed status text reaches 4.5:1 on its real backgrounds', () => {
      const min = Math.min(...text());
      expect(floor(min)).toBe(expected.text[i]);
      expect(min).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-4…10: every listed status icon, glyph, border and progress fill reaches 3:1', () => {
      const min = Math.min(...graphic());
      expect(floor(min)).toBe(expected.graphic[i]);
      expect(min).toBeGreaterThanOrEqual(3);
    });

    it('D-4: the pipeline complete check reaches 3:1 on its node fill', () => {
      const glyph = ratio(c('--color-surface'), c('--color-primary-500'));
      expect(floor(glyph)).toBe(expected.completeGlyph[i]);
      expect(glyph).toBeGreaterThanOrEqual(3);
    });

    // F-1 was a known residual (3.67 dark) until 3.22.4: request 034 D-1 gives
    // the chips on an unread row an opaque --color-surface under their tint, so
    // the translucent teal row no longer shows through.
    it('F-1 (fixed in 3.22.4): the NC priority chips on an unread row', () => {
      const unreadBase = rulesOf(sheets.nc).filter((r) =>
        r.selector.split(/,(?![^(]*\))/).map((s) => s.trim()).includes('.lc-nc__item--unread .lc-nc__item-priority'),
      );
      expect(unreadBase).toHaveLength(1);
      const tintOf = (modifier: string) => {
        const image = fills('nc', `.lc-nc__item--unread .lc-nc__item-priority--${modifier}`)['background-image'];
        const token = image.match(/^linear-gradient\((var\(--[\w-]+\)), \1\)$/);
        expect(token).not.toBeNull();
        return (token as RegExpMatchArray)[1];
      };
      const chipOnUnread = (v: string, modifier: string) =>
        lowest(inkOf(v), unread.map((row) => layer(tintOf(modifier), layer(decls(unreadBase[0].body)['background-color'], row))));
      const min = Math.min(chipOnUnread('warning', 'high'), chipOnUnread('error', 'urgent'));
      expect(floor(min)).toBe(expected.ncUnread[i]);
      expect(min).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// Request 034 (3.22.4): follow-ups F-1 to F-7 of 029. Text reaches 4.5:1 and
// graphics and boundaries 3:1 on their real backgrounds in both themes, with
// pairings the kit already asserts (status inks, the lc-badge primary pair, the
// text steps). No token is added and no shared status value changes (design
// 034 §2, §5).
describe('Component pairings of 3.22.4 (request 034)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const sheets = {
    nc: compile(lib('notification-center/notification-center.component.scss')).css,
    ring: compile(lib('progress-ring/progress-ring.component.scss')).css,
    diff: compile(lib('diff-viewer/diff-viewer.component.scss')).css,
    card: compile(lib('card/card.component.scss')).css,
    log: compile(lib('log-viewer/log-viewer.component.scss')).css,
    dep: compile(lib('dependency-viewer/dependency-viewer.component.scss')).css,
  };
  type Sheet = keyof typeof sheets;
  const depTs = readFileSync(lib('dependency-viewer/dependency-viewer.component.ts'), 'utf8');
  const depHtml = readFileSync(lib('dependency-viewer/dependency-viewer.component.html'), 'utf8');

  /** Every rule as its selector list and body (`a, b { … }` names both). */
  const rulesOf = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
      body: m[2],
    }));
  const decls = (body: string): Record<string, string> =>
    Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  /** The declarations of every rule that names `selector`, merged in source order. */
  const fills = (sheet: Sheet, selector: string): Record<string, string> => {
    const found = rulesOf(sheets[sheet]).filter((r) => r.selectors.includes(selector));
    expect(found.length).toBeGreaterThan(0);
    return Object.assign({}, ...found.map((r) => decls(r.body)));
  };
  /** The colour a relation reads in RELATION_STYLES. */
  const relationColor = (relation: string) => {
    const found = depTs.match(new RegExp(`\\n  ${relation}:\\s*\\{ color: '([^']+)'`));
    expect(found).not.toBeNull();
    return (found as RegExpMatchArray)[1];
  };

  const ink = (v: string) => `var(--color-on-${v}-subtle)`;
  const flat = (token: string) => `linear-gradient(var(${token}), var(${token}))`;
  const secondary = 'var(--color-text-secondary)';
  const tertiary = 'var(--color-text-tertiary)';
  const meta = ['line-num', 'timestamp', 'source'];
  type Row = [Sheet, string, Record<string, string>];

  const declared: Row[] = [
    // F-1: the chips on an unread row paint their tint over an opaque surface.
    ['nc', '.lc-nc__item--unread .lc-nc__item-priority', { 'background-color': 'var(--color-surface)' }],
    ['nc', '.lc-nc__item--unread .lc-nc__item-category', { 'background-color': 'var(--color-surface)', 'background-image': flat('--color-surface-hover') }],
    ['nc', '.lc-nc__item--unread .lc-nc__item-priority--high', { 'background-image': flat('--color-warning-subtle') }],
    ['nc', '.lc-nc__item--unread .lc-nc__item-priority--urgent', { 'background-image': flat('--color-error-subtle') }],
    ['nc', '.lc-nc__item--unread .lc-nc__item-priority--low', { 'background-image': flat('--color-surface-hover') }],
    // F-2: the ring arcs take the progress-bar inks.
    ['ring', '.lc-progress-ring__value--primary', { stroke: 'var(--color-primary-500)' }],
    // 036: secondary reads the data-mark token (dark secondary-600 was 1.07:1 from info).
    ['ring', '.lc-progress-ring__value--secondary', { stroke: 'var(--color-secondary-graphic)' }],
    ...['success', 'warning', 'error', 'info'].map((v): Row => ['ring', `.lc-progress-ring__value--${v}`, { stroke: ink(v) }]),
    // F-3: subtle line tints, secondary line numbers.
    ['diff', '.lc-diff__line--added', { background: 'var(--color-success-subtle)' }],
    ['diff', '.lc-diff__line--removed', { background: 'var(--color-error-subtle)' }],
    ['diff', '.lc-diff__num', { color: secondary }],
    // F-4: the lc-badge primary pair with a primary border.
    ['card', '.card__badge--primary', { 'background-color': 'var(--color-primary-subtle)', color: 'var(--color-on-primary-subtle)', border: '1px solid var(--color-primary-500)' }],
    // F-5: a hit area into half of each gap; the visible pill is unchanged.
    // Request 043 (F-22) raised it from 40 to 44 px high (and at least 44 wide):
    // the spacing exception is no longer relied on.
    ['log', '.lc-log-viewer__level-pill', { position: 'relative', padding: '0.125rem 0.5rem', 'font-size': '0.6875rem' }],
    [
      'log',
      '.lc-log-viewer__level-pill::before',
      {
        content: '""',
        position: 'absolute',
        'inset-inline': 'min(-0.125rem, (100% - var(--size-min-touch-height, 2.75rem)) / 2)',
        top: 'calc(50% - var(--size-min-touch-height, 2.75rem) / 2)',
        bottom: 'calc(50% - var(--size-min-touch-height, 2.75rem) / 2)',
      },
    ],
    // F-7: three text steps instead of opacity, in the log and the terminal.
    ['log', '.lc-log-viewer__line--debug', { color: secondary }],
    ...meta.map((m): Row => ['log', `.lc-log-viewer__${m}`, { color: secondary }]),
    ...meta.map((m): Row => ['log', `.lc-log-viewer__line--debug .lc-log-viewer__${m}`, { color: tertiary }]),
    ['log', '.lc-log-viewer__line-count', { color: tertiary }],
    ['log', '.lc-log-viewer__search-input::placeholder', { color: tertiary, opacity: '1' }],
    ...meta.map((m): Row => ['log', `.lc-log-viewer--terminal .lc-log-viewer__${m}`, { color: '#a6adc8' }]),
    ['log', '.lc-log-viewer--terminal .lc-log-viewer__line--debug', { color: '#a6adc8' }],
    ...meta.map((m): Row => ['log', `.lc-log-viewer--terminal .lc-log-viewer__line--debug .lc-log-viewer__${m}`, { color: '#9399b2' }]),
    ['log', '.lc-log-viewer--terminal .lc-log-viewer__line-count', { color: '#9399b2' }],
    ['log', '.lc-log-viewer--terminal .lc-log-viewer__search-input::placeholder', { color: '#9399b2' }],
  ];

  it.each(declared)('AC-1…9: %s %s declares the design 034 values', (sheet, selector, expectedDecls) => {
    const found = fills(sheet, selector);
    for (const [property, value] of Object.entries(expectedDecls)) expect(found[property]).toBe(value);
  });

  it('AC-7: no opacity dims log text (debug line, number, time, source, line count, placeholder)', () => {
    const textRules = rulesOf(sheets.log).filter((r) =>
      r.selectors.some((s) => /__line--debug|__line-num|__timestamp|__source|__line-count|::placeholder/.test(s)),
    );
    expect(textRules.length).toBeGreaterThanOrEqual(8);
    for (const r of textRules) {
      const opacity = decls(r.body).opacity;
      if (opacity !== undefined) expect(Number(opacity)).toBeGreaterThanOrEqual(1);
    }
  });

  it('AC-7: the terminal rules are flat selectors (no inverted nesting)', () => {
    expect(sheets.log).not.toMatch(/\.lc-log-viewer__[\w-]+ \.lc-log-viewer--terminal/);
  });

  it('AC-9: uses and extends read the tertiary text and the primary ink (edge, arrow, label, legend)', () => {
    const relations: [string, string][] = [['uses', tertiary], ['extends', 'var(--color-on-primary-subtle)']];
    for (const [relation, value] of relations) {
      expect(relationColor(relation)).toBe(value);
      const escaped = value.replace(/[()]/g, '\\$&');
      expect(depHtml).toMatch(new RegExp(`<marker id="arrow-${relation}"[^>]*><path [^>]*fill="${escaped}"/>`));
    }
    // The dash style still tells the relations apart (not colour alone).
    expect(depTs).toMatch(/\n {2}uses:\s*\{ color: '[^']+', dashed: true,/);
    expect(depTs).toMatch(/\n {2}extends:\s*\{ color: '[^']+', dashed: true,/);
    // Follow-up F-9, done in request 036: `depends` reads the secondary text
    // (neutral-400 was 2.53:1 light) and the tree edges the field border
    // (neutral-300 was 1.47:1 light); their contrast is in the 036 block.
    expect(relationColor('depends')).toBe('var(--color-text-secondary)');
    expect(depTs.match(/color: 'var\(--color-field-border\)', dashed: false, isCrossRef: false/g)).toHaveLength(2);
  });

  // The shared status values of 3.22.3, per palette [light, dark] (AC-2).
  const shared: Record<string, [string, string]> = {
    '--color-success': ['#8ea475', '#8ea475'],
    '--color-error': ['#9d0e0e', '#9d0e0e'],
    '--color-warning': ['#e1a040', '#e1a040'],
    '--color-info': ['#3b6588', '#3b6588'],
    '--color-success-default': ['#8ea475', '#cdd6c2'],
    '--color-error-default': ['#9d0e0e', '#f7a1a1'],
    '--color-warning-default': ['#e1a040', '#f1d3a7'],
    '--color-info-default': ['#3b6588', '#b8cee0'],
  };

  /**
   * Design 034 §5, floored, per palette [light, dark]. Text minimum: the diff
   * `+` (4.85 L, 5.17 D). Graphic minimum: the card border on hover and
   * selected and the `uses` cross-reference line (3.75 L), the `uses` line
   * (4.76 D). The terminal is always dark: 5.28 (debug level and meta).
   * Request 036: the dark ring secondary moved from the inverted
   * secondary-600 (8.35, 1.07:1 from info) to --color-secondary-graphic
   * (4.05), which is now the dark graphic minimum.
   */
  const expected = {
    text: [4.85, 5.17],
    graphic: [3.75, 4.05],
    ncUnread: { high: [5.52, 5.55], urgent: [10.97, 8.37], low: [5.3, 5.99], category: [5.3, 5.99] },
    ringTrack: { primary: [3.96, 6.69], secondary: [4.19, 4.05], success: [4.81, 6.15], warning: [5.47, 5.6], error: [11.43, 6.37], info: [9.22, 7.8] },
    diff: {
      numAdded: [6.91, 6.86], numRemoved: [6.58, 9.26], numContext: [7.23, 9.25],
      plus: [4.85, 5.17], minus: [10.97, 7.21], contentAdded: [16.24, 9.75], contentRemoved: [15.46, 13.16],
    },
    // The border on the chip fill computes to 4.05 L from the tokens (the design's browser value: 4.06).
    card: { text: [8.48, 5.79], borderOnCard: [3.75, 6.87], borderOnChip: [4.05, 5.79] },
    dep: { usesLabel: [5.83, 6.7], usesLine: [3.75, 4.76], usesLegend: [5.58, 5.56], extendsLabel: [9.13, 9.12], extendsLine: [5.32, 6.29], extendsLegend: [8.74, 7.57] },
    log: { meta: [5.6, 8.29], debugMessage: [6.92, 10.18], debugDim: [5.34, 6.12], count: [5.83, 6.7] },
  };
  const floor = (n: number) => Math.floor(n * 100) / 100;

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);
    /** A `var(--x)`, a one-colour gradient of it, or a literal colour. */
    const value = (text: string): Rgba => {
      const gradient = text.match(/^linear-gradient\((var\(--[\w-]+\)), \1\)$/);
      const ref = (gradient ? gradient[1] : text).match(/^var\((--[\w-]+)\)$/);
      return ref ? c(ref[1]) : parse(text);
    };
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(over(fg, bg), bg)));
    const S = c('--color-surface');
    const S2 = c('--color-surface-2');
    const BG = c('--color-background');
    const pages = [BG, S, S2];
    const ringVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
    let cache: ReturnType<typeof measure> | undefined;
    /** Every §5 cell, measured once on first use (inside a test, not at collection). */
    const measured = () => (cache ??= measure());

    function measure() {
      // F-1: the chip fill is its tint over the opaque base, on any unread row.
      const unreadRows = [S, S2].map((row) => over(c('--color-surface-selected'), row));
      const unreadChip = (selector: string) => {
        const base = fills('nc', '.lc-nc__item--unread .lc-nc__item-priority')['background-color'];
        return unreadRows.map((row) => over(value(fills('nc', selector)['background-image']), over(value(base), row)));
      };
      const chipInk = (selector: string) => value(fills('nc', selector).color);
      const nc = {
        high: lowest(chipInk('.lc-nc__item-priority--high'), unreadChip('.lc-nc__item--unread .lc-nc__item-priority--high')),
        urgent: lowest(chipInk('.lc-nc__item-priority--urgent'), unreadChip('.lc-nc__item--unread .lc-nc__item-priority--urgent')),
        low: lowest(chipInk('.lc-nc__item-priority--low'), unreadChip('.lc-nc__item--unread .lc-nc__item-priority--low')),
        category: lowest(chipInk('.lc-nc__item-category'), unreadChip('.lc-nc__item--unread .lc-nc__item-category')),
      };

      // F-2: the arc against the track (over every page) and against the page.
      const track = value(fills('ring', '.lc-progress-ring__track').stroke);
      const arc = (v: string) => value(fills('ring', `.lc-progress-ring__value--${v}`).stroke);
      const ringTrack = Object.fromEntries(ringVariants.map((v) => [v, lowest(arc(v), pages.map((p) => over(track, p)))]));
      const ringPage = ringVariants.map((v) => lowest(arc(v), pages));
      const ringText = lowest(value(fills('ring', '.lc-progress-ring__text').fill), pages);

      // F-3: the line tints over every page the viewer sits on.
      const lineOf = (selector: string) => pages.map((p) => over(value(fills('diff', selector).background), p));
      const added = lineOf('.lc-diff__line--added');
      const removed = lineOf('.lc-diff__line--removed');
      const num = value(fills('diff', '.lc-diff__num').color);
      const content = value(fills('diff', '.lc-diff__content').color);
      const diff = {
        numAdded: lowest(num, added),
        numRemoved: lowest(num, removed),
        numContext: lowest(num, pages),
        plus: lowest(value(fills('diff', '.lc-diff__line--added .lc-diff__prefix').color), added),
        minus: lowest(value(fills('diff', '.lc-diff__line--removed .lc-diff__prefix').color), removed),
        contentAdded: lowest(content, added),
        contentRemoved: lowest(content, removed),
      };

      // F-4: a card is surface, surface-2, hover, selected (over the page and
      // over the surface), the muted tile or the page itself.
      const sel = (base: Rgba) => over(c('--color-surface-selected'), base);
      const cards = [S, S2, over(c('--color-surface-hover'), S), sel(BG), sel(S), c('--color-muted-tile'), BG];
      const badge = fills('card', '.card__badge--primary');
      const chipFills = cards.map((base) => over(value(badge['background-color']), base));
      const border = value(badge.border.replace(/^1px solid /, ''));
      const card = {
        text: lowest(value(badge.color), chipFills),
        borderOnCard: lowest(border, cards),
        borderOnChip: lowest(border, chipFills),
      };

      // F-6: labels on their surface halo, lines at the cross-reference opacity
      // on the viewer, legend lines on the legend's surface-2.
      const halo = value(fills('dep', '.dep-viewer__edge-label').stroke);
      const lineOpacity = Number(fills('dep', '.dep-viewer__edge--cross-ref').opacity);
      const legend = value(fills('dep', '.dep-viewer__legend').background);
      const faded = (rgba: Rgba): Rgba => [rgba[0], rgba[1], rgba[2], rgba[3] * lineOpacity];
      const relation = (name: string) => value(relationColor(name));
      const dep = {
        usesLabel: lowest(relation('uses'), [halo]),
        usesLine: lowest(faded(relation('uses')), [S]),
        usesLegend: lowest(relation('uses'), [legend]),
        extendsLabel: lowest(relation('extends'), [halo]),
        extendsLine: lowest(faded(relation('extends')), [S]),
        extendsLegend: lowest(relation('extends'), [legend]),
      };

      // F-7: surface, the warn and error tints, each with and without hover;
      // debug lines have no tint. The toolbar and the search row are the surface.
      const logBg = value(fills('log', '.lc-log-viewer--log')['background-color']);
      const hover = parse(fills('log', '.lc-log-viewer__line:hover')['background-color']);
      const withHover = (bases: Rgba[]) => bases.flatMap((b) => [b, over(hover, b)]);
      const tintOf = (lv: string) => over(parse(fills('log', `.lc-log-viewer--log .lc-log-viewer__line--${lv}`)['background-color']), logBg);
      const logLines = withHover([logBg, tintOf('warn'), tintOf('error')]);
      const debugLines = withHover([logBg]);
      const ink7 = (selector: string) => value(fills('log', selector).color);
      const log = {
        meta: Math.min(...meta.map((m) => lowest(ink7(`.lc-log-viewer__${m}`), logLines))),
        debugMessage: lowest(ink7('.lc-log-viewer__line--debug'), debugLines),
        debugDim: Math.min(
          lowest(ink7('.lc-log-viewer__line--debug .lc-log-viewer__level'), debugLines),
          ...meta.map((m) => lowest(ink7(`.lc-log-viewer__line--debug .lc-log-viewer__${m}`), debugLines)),
        ),
        count: Math.min(
          lowest(ink7('.lc-log-viewer__line-count'), [logBg]),
          lowest(ink7('.lc-log-viewer__search-input::placeholder'), [logBg]),
        ),
      };
      return { nc, ringTrack, ringPage, ringText, diff, card, dep, log };
    }

    it('AC-1: the NC chips on an unread row (high, urgent, low, category)', () => {
      const { nc } = measured();
      for (const [key, ncRatio] of Object.entries(nc)) {
        expect([key, floor(ncRatio)]).toEqual([key, expected.ncUnread[key as keyof typeof nc][i]]);
        expect(ncRatio).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('AC-3: every ring arc reaches 3:1 against its track and the page; the centre text 4.5:1', () => {
      const { ringTrack, ringPage, ringText } = measured();
      for (const v of ringVariants) {
        expect([v, floor(ringTrack[v])]).toEqual([v, expected.ringTrack[v][i]]);
        expect(ringTrack[v]).toBeGreaterThanOrEqual(3);
      }
      expect(Math.min(...ringPage)).toBeGreaterThanOrEqual(3);
      expect(ringText).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-4: diff numbers and prefixes reach 4.5:1 on added, removed and context lines', () => {
      const { diff } = measured();
      for (const key of Object.keys(expected.diff) as (keyof typeof expected.diff)[]) {
        expect([key, floor(diff[key])]).toEqual([key, expected.diff[key][i]]);
      }
      expect(Math.min(...Object.values(diff))).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-5: the card primary chip text reaches 4.5:1 and its border 3:1, also on a selected card', () => {
      const { card } = measured();
      for (const key of Object.keys(card) as (keyof typeof card)[]) {
        expect([key, floor(card[key])]).toEqual([key, expected.card[key][i]]);
      }
      expect(card.text).toBeGreaterThanOrEqual(4.5);
      expect(Math.min(card.borderOnCard, card.borderOnChip)).toBeGreaterThanOrEqual(3);
    });

    it('AC-9: uses and extends labels reach 4.5:1, their lines and legend lines 3:1', () => {
      const { dep } = measured();
      for (const key of Object.keys(dep) as (keyof typeof dep)[]) {
        expect([key, floor(dep[key])]).toEqual([key, expected.dep[key][i]]);
      }
      expect(Math.min(dep.usesLabel, dep.extendsLabel)).toBeGreaterThanOrEqual(4.5);
      expect(Math.min(dep.usesLine, dep.usesLegend, dep.extendsLine, dep.extendsLegend)).toBeGreaterThanOrEqual(3);
    });

    it('AC-8: log meta, debug text, line count and placeholder reach 4.5:1 on every line background', () => {
      const { log } = measured();
      for (const key of Object.keys(log) as (keyof typeof log)[]) {
        expect([key, floor(log[key])]).toEqual([key, expected.log[key][i]]);
        expect(log[key]).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('§5: the text minimum is the diff +, the graphic minimum the card border and the uses line', () => {
      const { nc, ringTrack, ringPage, ringText, diff, card, dep, log } = measured();
      const text = Math.min(...Object.values(nc), ...Object.values(diff), card.text, dep.usesLabel, dep.extendsLabel, ...Object.values(log), ringText);
      const graphic = Math.min(...Object.values(ringTrack), ...ringPage, card.borderOnCard, card.borderOnChip,
        dep.usesLine, dep.usesLegend, dep.extendsLine, dep.extendsLegend);
      expect(floor(text)).toBe(expected.text[i]);
      expect(floor(graphic)).toBe(expected.graphic[i]);
    });

    it('AC-2: the shared status values keep their 3.22.3 hex', () => {
      for (const [name, hexes] of Object.entries(shared)) expect([name, hex(tokens, name)]).toEqual([name, hexes[i]]);
    });
  });

  it('AC-8: the terminal meta, debug text, line count and placeholder reach 4.5:1; the levels keep their 029 ratios', () => {
    const T = parse(fills('log', '.lc-log-viewer--terminal')['background-color']);
    const bar = parse(fills('log', '.lc-log-viewer--terminal .lc-log-viewer__toolbar')['background-color']);
    const searchRow = parse(fills('log', '.lc-log-viewer--terminal .lc-log-viewer__search')['background-color']);
    const hover = parse(fills('log', '.lc-log-viewer__line:hover')['background-color']);
    const tint = (lv: string) => over(parse(fills('log', `.lc-log-viewer--terminal .lc-log-viewer__line--${lv}`)['background-color']), T);
    const withHover = (bases: Rgba[]) => bases.flatMap((b) => [b, over(hover, b)]);
    const lines = withHover([T, tint('warn'), tint('error')]);
    const debugLines = withHover([T]);
    const ink7 = (selector: string) => parse(fills('log', selector).color);
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(fg, bg)));
    const terminal = {
      meta: Math.min(...meta.map((m) => lowest(ink7(`.lc-log-viewer--terminal .lc-log-viewer__${m}`), lines))),
      debugMessage: lowest(ink7('.lc-log-viewer--terminal .lc-log-viewer__line--debug'), debugLines),
      debugDim: Math.min(
        lowest(ink7('.lc-log-viewer--terminal .lc-log-viewer__line--debug .lc-log-viewer__level'), debugLines),
        ...meta.map((m) => lowest(ink7(`.lc-log-viewer--terminal .lc-log-viewer__line--debug .lc-log-viewer__${m}`), debugLines)),
      ),
      count: Math.min(
        lowest(ink7('.lc-log-viewer--terminal .lc-log-viewer__line-count'), [bar]),
        lowest(ink7('.lc-log-viewer--terminal .lc-log-viewer__search-input::placeholder'), [searchRow]),
      ),
    };
    expect(Object.fromEntries(Object.entries(terminal).map(([k, v]) => [k, floor(v)]))).toEqual({ meta: 5.85, debugMessage: 6.7, debugDim: 5.28, count: 6.21 });
    expect(Math.min(...Object.values(terminal))).toBeGreaterThanOrEqual(4.5);
    const levelBases: Record<string, Rgba> = { debug: T, info: T, warn: tint('warn'), error: tint('error') };
    const levels = ['debug', 'info', 'warn', 'error'].map((lv) =>
      floor(ratio(ink7(`.lc-log-viewer--terminal .lc-log-viewer__line--${lv} .lc-log-viewer__level`), levelBases[lv])),
    );
    expect(levels).toEqual([5.81, 7.78, 11.43, 6.19]);
  });
});

describe('Component pairings of 3.23.1 (request 036)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const sheets = {
    dl: compile(lib('description-list/description-list.component.scss')).css,
    nc: compile(lib('notification-center/notification-center.component.scss')).css,
    dep: compile(lib('dependency-viewer/dependency-viewer.component.scss')).css,
    log: compile(lib('log-viewer/log-viewer.component.scss')).css,
    progress: compile(lib('progress-bar/progress-bar.component.scss')).css,
    ring: compile(lib('progress-ring/progress-ring.component.scss')).css,
  };
  type Sheet = keyof typeof sheets;
  const depTs = readFileSync(lib('dependency-viewer/dependency-viewer.component.ts'), 'utf8');
  const depHtml = readFileSync(lib('dependency-viewer/dependency-viewer.component.html'), 'utf8');

  /** Every rule as its selector list and body (`a, b { … }` names both). */
  const rulesOf = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
      body: m[2],
    }));
  const decls = (body: string): Record<string, string> =>
    Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
  /**
   * The declarations of every rule that names `selector`, merged in source
   * order; rules in forced-colours blocks are left out (`Mark` is no colour).
   */
  const fills = (sheet: Sheet, selector: string): Record<string, string> => {
    const found = rulesOf(sheets[sheet].replace(forcedBlock, '')).filter((r) => r.selectors.includes(selector));
    expect(found.length).toBeGreaterThan(0);
    return Object.assign({}, ...found.map((r) => decls(r.body)));
  };
  /** The body of the `@media (forced-colors: active)` blocks of a sheet. */
  const forced = (sheet: Sheet) => [...sheets[sheet].matchAll(forcedBlock)].map((m) => m[1]).join('\n');
  const relationColor = (relation: string) => {
    const found = depTs.match(new RegExp(`\\n  ${relation}:\\s*\\{ color: '([^']+)'`));
    expect(found).not.toBeNull();
    return (found as RegExpMatchArray)[1];
  };

  const secondary = 'var(--color-text-secondary)';
  const graphic = 'var(--color-secondary-graphic)';
  type Row = [Sheet, string, Record<string, string>];

  const declared: Row[] = [
    // A (BA-10): the link and primary inks, a 2 px outline instead of the halo.
    ['dl', '.lc-dl__value--primary', { color: 'var(--color-on-primary-subtle)', 'font-weight': 'var(--font-weight-semibold)' }],
    ['dl', '.lc-dl__link', { color: 'var(--color-link)', 'text-decoration': 'none' }],
    ['dl', '.lc-dl__link:hover', { color: 'var(--color-link-hover)', 'text-decoration': 'underline' }],
    // 039 (F-17): the ring moved from the row to the row's button (same box).
    ['dl', '.lc-dl__action:focus-visible', { outline: '2px solid var(--color-primary-500)', 'outline-offset': '2px' }],
    // F-8: unread message and time in the secondary ink.
    ['nc', '.lc-nc__item--unread .lc-nc__item-message', { color: secondary }],
    ['nc', '.lc-nc__item--unread .lc-nc__item-time', { color: secondary }],
    // F-10: an opaque marker with its own ink.
    ['log', '.lc-log-viewer__match', { 'background-color': 'var(--color-warning)', color: 'var(--color-on-warning)' }],
    ['log', '.lc-log-viewer--terminal .lc-log-viewer__match', { 'background-color': '#f9e2af', color: '#1e1e2e' }],
    // F-13: gray is Overlay2 (Mocha) and Subtext1 (Latte).
    ['log', '.ansi-gray', { color: '#9399b2' }],
    ['log', ':root.light .lc-log-viewer--log .ansi-gray', { color: '#5c5f77' }],
    // F-11 and the ring: the secondary data-mark token.
    ['progress', '.progress-bar--secondary .progress-bar__fill', { 'background-color': graphic }],
    ['progress', '.progress-bar-circular--secondary .progress-bar-circular__fill', { stroke: graphic }],
    ['ring', '.lc-progress-ring__value--secondary', { stroke: graphic }],
  ];

  it.each(declared)('AC-1…13: %s %s declares the design 036 values', (sheet, selector, expectedDecls) => {
    const found = fills(sheet, selector);
    for (const [property, value] of Object.entries(expectedDecls)) expect(found[property]).toBe(value);
  });

  it('AC-2: the clickable row has no halo any more; forced colours draw the outline in Highlight', () => {
    // 039 (F-17): the focus rules moved to the row's button `.lc-dl__action`.
    const clickable = rulesOf(sheets.dl).filter((r) => r.selectors.some((s) => /lc-dl__row--clickable|lc-dl__action/.test(s)));
    for (const r of clickable) expect(decls(r.body)['box-shadow']).toBeUndefined();
    expect(sheets.dl).not.toMatch(/color-mix/);
    expect(forced('dl')).toMatch(/\.lc-dl__action:focus-visible \{\s*outline-color: Highlight;\s*\}/);
  });

  it('AC-9: forced colours paint every search match, the terminal one too, with Mark / MarkText', () => {
    expect(forced('log')).toMatch(
      /\.lc-log-viewer__match,\s*\.lc-log-viewer--terminal \.lc-log-viewer__match \{\s*background-color: Mark;\s*color: MarkText;\s*\}/,
    );
  });

  it('AC-8: depends, the structural edges and both arrows read the secondary text; tree edges the field border', () => {
    expect(relationColor('depends')).toBe(secondary);
    expect(depTs).toContain(`color: edge.structural ? '${secondary}' : style.color,`);
    expect(depTs.match(/color: 'var\(--color-field-border\)', dashed: false, isCrossRef: false/g)).toHaveLength(2);
    for (const id of ['default', 'depends']) {
      expect(depHtml).toMatch(new RegExp(`<marker id="arrow-${id}"[^>]*><path [^>]*fill="var\\(--color-text-secondary\\)"/>`));
    }
    expect(depTs).not.toMatch(/--color-neutral-400/);
    expect(depHtml).not.toMatch(/--color-neutral-400/);
    // `depends` stays solid; the relations stay apart by dash and label too.
    expect(depTs).toMatch(/\n {2}depends:\s*\{ color: '[^']+', dashed: false,/);
  });

  it('AC-12: the log tool buttons stay 28 × 28 (WCAG 2.5.8 by size)', () => {
    const btn = fills('log', '.lc-log-viewer__tool-btn');
    expect([btn.width, btn.height]).toEqual(['28px', '28px']);
  });

  /**
   * Design 036 §5, floored, per palette [light, dark]. Pages: background,
   * surface, surface-2; a hovered row is --color-surface-hover over them; an
   * unread NC row is --color-surface-selected over surface and surface-2; the
   * progress track is --color-surface-hover over the pages.
   */
  const expected = {
    dl: {
      linkPage: [5.94, 8.96], linkHover: [5.64, 7.92], linkHoverInkPage: [8.74, 10.53], linkHoverInkHover: [8.29, 9.3],
      primaryPage: [8.74, 7.57], primaryHover: [8.29, 6.69], ring: [4.17, 7.57],
    },
    ncUnread: [6.49, 7.05],
    dep: { dependsLabel: [7.55, 11.15], dependsLine: [7.55, 11.15], dependsCrossRef: [4.52, 7.55], dependsLegend: [7.23, 9.25], treeSurface: [4.83, 6.7], treeSurface2: [4.62, 5.56] },
    dependsVsUses: [1.29, 1.66],
    match: [7.85, 7.85],
    secondary: { track: [4.19, 4.05], page: [4.41, 4.59], vsInfo: [2.19, 1.92] },
    // The log variant's gray: Latte in light, Mocha in dark; plain surface and the worst line.
    ansiGray: { plain: [6.25, 6.11], worst: [4.63, 4.55] },
  };
  const floor = (n: number) => Math.floor(n * 100) / 100;

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);
    const value = (text: string): Rgba => {
      const ref = text.match(/^var\((--[\w-]+)\)$/);
      return ref ? c(ref[1]) : parse(text);
    };
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(over(fg, bg), bg)));
    const S = c('--color-surface');
    const S2 = c('--color-surface-2');
    const BG = c('--color-background');
    const pages = [BG, S, S2];
    const hovered = pages.map((p) => over(c('--color-surface-hover'), p));
    let cache: ReturnType<typeof measure> | undefined;
    /** Every §5 cell, measured once on first use (inside a test, not at collection). */
    const measured = () => (cache ??= measure());

    function measure() {
      const dlInk = (selector: string) => value(fills('dl', selector).color);
      // 039 (F-17): the ring is the row button's (it covers the row's padding box).
      const ringInk = value(fills('dl', '.lc-dl__action:focus-visible').outline.replace(/^2px solid /, ''));
      const dl = {
        linkPage: lowest(dlInk('.lc-dl__link'), pages),
        linkHover: lowest(dlInk('.lc-dl__link'), hovered),
        linkHoverInkPage: lowest(dlInk('.lc-dl__link:hover'), pages),
        linkHoverInkHover: lowest(dlInk('.lc-dl__link:hover'), hovered),
        primaryPage: lowest(dlInk('.lc-dl__value--primary'), pages),
        primaryHover: lowest(dlInk('.lc-dl__value--primary'), hovered),
        // The outline sits 2 px outside the row, on the card or the page.
        ring: lowest(ringInk, pages),
      };

      const unreadRows = [S, S2].map((row) => over(c('--color-surface-selected'), row));
      const ncUnread = Math.min(
        lowest(value(fills('nc', '.lc-nc__item--unread .lc-nc__item-message').color), unreadRows),
        lowest(value(fills('nc', '.lc-nc__item--unread .lc-nc__item-time').color), unreadRows),
      );

      // Labels on their surface halo, lines on the viewer surface (cross-refs
      // at their opacity), legend lines on the legend's surface-2.
      const halo = value(fills('dep', '.dep-viewer__edge-label').stroke);
      const lineOpacity = Number(fills('dep', '.dep-viewer__edge--cross-ref').opacity);
      const legend = value(fills('dep', '.dep-viewer__legend').background);
      const depends = value(relationColor('depends'));
      const tree = c('--color-field-border');
      const dep = {
        dependsLabel: lowest(depends, [halo]),
        dependsLine: lowest(depends, [S]),
        dependsCrossRef: lowest([depends[0], depends[1], depends[2], depends[3] * lineOpacity], [S]),
        dependsLegend: lowest(depends, [legend]),
        treeSurface: lowest(tree, [S]),
        treeSurface2: lowest(tree, [S2]),
      };
      const dependsVsUses = ratio(depends, value(relationColor('uses')));

      const mark = fills('log', '.lc-log-viewer__match');
      const match = ratio(value(mark.color), value(mark['background-color']));

      const track = value(fills('progress', '.progress-bar__track')['background-color']);
      const bar = value(fills('progress', '.progress-bar--secondary .progress-bar__fill')['background-color']);
      const ringTrack = value(fills('ring', '.lc-progress-ring__track').stroke);
      const arc = (v: string) => value(fills('ring', `.lc-progress-ring__value--${v}`).stroke);
      const secondaryCells = {
        track: Math.min(lowest(bar, pages.map((p) => over(track, p))), lowest(arc('secondary'), pages.map((p) => over(ringTrack, p)))),
        page: Math.min(lowest(bar, pages), lowest(arc('secondary'), pages)),
        vsInfo: ratio(arc('secondary'), arc('info')),
      };

      // The log variant: surface, the warn and error tints, each with and without hover.
      const logBg = value(fills('log', '.lc-log-viewer--log')['background-color']);
      const hover = parse(fills('log', '.lc-log-viewer__line:hover')['background-color']);
      const tintOf = (lv: string) => over(parse(fills('log', `.lc-log-viewer--log .lc-log-viewer__line--${lv}`)['background-color']), logBg);
      const logLines = [logBg, tintOf('warn'), tintOf('error')].flatMap((b) => [b, over(hover, b)]);
      const gray = parse(fills('log', i === 0 ? ':root.light .lc-log-viewer--log .ansi-gray' : '.ansi-gray').color);
      const ansiGray = { plain: lowest(gray, [logBg]), worst: lowest(gray, logLines) };

      return { dl, ncUnread, dep, dependsVsUses, match, secondaryCells, ansiGray };
    }

    it('AC-1, AC-2: dl link and primary values reach 4.5:1 on the page and a hovered row; the focus ring 3:1', () => {
      const { dl } = measured();
      for (const key of Object.keys(dl) as (keyof typeof dl)[]) {
        expect([key, floor(dl[key])]).toEqual([key, expected.dl[key][i]]);
      }
      expect(Math.min(dl.linkPage, dl.linkHover, dl.linkHoverInkPage, dl.linkHoverInkHover, dl.primaryPage, dl.primaryHover)).toBeGreaterThanOrEqual(4.5);
      expect(dl.ring).toBeGreaterThanOrEqual(3);
    });

    it('AC-7: the NC unread message and time reach 4.5:1 on every unread row', () => {
      const { ncUnread } = measured();
      expect(floor(ncUnread)).toBe(expected.ncUnread[i]);
      expect(ncUnread).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-8: the depends label reaches 4.5:1; depends, cross-ref, legend and tree lines 3:1', () => {
      const { dep, dependsVsUses } = measured();
      for (const key of Object.keys(dep) as (keyof typeof dep)[]) {
        expect([key, floor(dep[key])]).toEqual([key, expected.dep[key][i]]);
      }
      expect(dep.dependsLabel).toBeGreaterThanOrEqual(4.5);
      expect(Math.min(...Object.values(dep))).toBeGreaterThanOrEqual(3);
      expect(floor(dependsVsUses)).toBe(expected.dependsVsUses[i]);
    });

    it('AC-9: the search match ink reaches 4.5:1 on its opaque marker', () => {
      const { match } = measured();
      expect(floor(match)).toBe(expected.match[i]);
      expect(match).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-10, AC-11: the secondary bar fill and ring arc reach 3:1 on the track and the page, 1.5:1 from info', () => {
      const { secondaryCells } = measured();
      for (const key of Object.keys(secondaryCells) as (keyof typeof secondaryCells)[]) {
        expect([key, floor(secondaryCells[key])]).toEqual([key, expected.secondary[key][i]]);
      }
      expect(Math.min(secondaryCells.track, secondaryCells.page)).toBeGreaterThanOrEqual(3);
      expect(secondaryCells.vsInfo).toBeGreaterThanOrEqual(1.5);
    });

    it('AC-13: the log variant gray ANSI text reaches 4.5:1 on every line', () => {
      const { ansiGray } = measured();
      expect([floor(ansiGray.plain), floor(ansiGray.worst)]).toEqual([expected.ansiGray.plain[i], expected.ansiGray.worst[i]]);
      expect(ansiGray.worst).toBeGreaterThanOrEqual(4.5);
    });

    it('AC-15: the shared status values keep their hex; the new token has the design 036 values', () => {
      const shared: Record<string, [string, string]> = {
        '--color-success': ['#8ea475', '#8ea475'],
        '--color-error': ['#9d0e0e', '#9d0e0e'],
        '--color-warning': ['#e1a040', '#e1a040'],
        '--color-info': ['#3b6588', '#3b6588'],
        '--color-secondary-graphic': ['#5a798c', '#7097af'],
      };
      for (const [name, hexes] of Object.entries(shared)) expect([name, hex(tokens, name)]).toEqual([name, hexes[i]]);
    });
  });

  it('AC-9, AC-13: the terminal match reads 12.90:1 on every line; gray 4.5:1 on every line', () => {
    const T = parse(fills('log', '.lc-log-viewer--terminal')['background-color']);
    const hover = parse(fills('log', '.lc-log-viewer__line:hover')['background-color']);
    const tint = (lv: string) => over(parse(fills('log', `.lc-log-viewer--terminal .lc-log-viewer__line--${lv}`)['background-color']), T);
    const lines = [T, tint('warn'), tint('error')].flatMap((b) => [b, over(hover, b)]);
    const mark = fills('log', '.lc-log-viewer--terminal .lc-log-viewer__match');
    const gray = parse(fills('log', '.ansi-gray').color);
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(fg, bg)));
    const terminal = {
      match: ratio(parse(mark.color), parse(mark['background-color'])),
      grayPlain: ratio(gray, T),
      grayWorst: lowest(gray, lines),
    };
    expect(Object.fromEntries(Object.entries(terminal).map(([k, v]) => [k, floor(v)]))).toEqual({ match: 12.9, grayPlain: 5.81, grayWorst: 4.61 });
    expect(Math.min(...Object.values(terminal))).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * Request 039 (3.25.0): F-14 the progress-bar primary fill, F-15 focus rings
 * instead of 20–40 % halos, F-16 the dependency-viewer node and toggle
 * borders. Design 039 §3 (rings) and §5 (ratios), floored, [light, dark].
 */
describe('Component pairings of 3.25.0 (request 039)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const sheets = {
    progress: compile(lib('progress-bar/progress-bar.component.scss')).css,
    ring: compile(lib('progress-ring/progress-ring.component.scss')).css,
    nc: compile(lib('notification-center/notification-center.component.scss')).css,
    log: compile(lib('log-viewer/log-viewer.component.scss')).css,
    code: compile(lib('code-block/code-block.component.scss')).css,
    tree: compile(lib('tree-view/tree-view.component.scss')).css,
    slider: compile(lib('slider/slider.component.scss')).css,
    select: compile(lib('select/select.component.scss')).css,
    digits: compile(lib('verification-code-input/verification-code-input.component.scss')).css,
    password: compile(lib('password-input/password-input.component.scss')).css,
    textarea: compile(lib('textarea/textarea.component.scss')).css,
    number: compile(lib('number-input/number-input.component.scss')).css,
    combobox: compile(lib('combobox/combobox.component.scss')).css,
    dep: compile(lib('dependency-viewer/dependency-viewer.component.scss')).css,
    dl: compile(lib('description-list/description-list.component.scss')).css,
  };
  type Sheet = keyof typeof sheets;
  const depTs = readFileSync(lib('dependency-viewer/dependency-viewer.component.ts'), 'utf8');
  const depHtml = readFileSync(lib('dependency-viewer/dependency-viewer.component.html'), 'utf8');

  const rulesOf = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
      body: m[2],
    }));
  const decls = (body: string): Record<string, string> =>
    Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
  const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
  /** Every rule naming `selector`, merged in source order, forced-colours blocks left out. */
  const fills = (sheet: Sheet, selector: string): Record<string, string> => {
    const found = rulesOf(sheets[sheet].replace(forcedBlock, '')).filter((r) => r.selectors.includes(selector));
    expect([sheet, selector, found.length > 0]).toEqual([sheet, selector, true]);
    return Object.assign({}, ...found.map((r) => decls(r.body)));
  };
  /** The same, inside the forced-colours blocks only. */
  const forcedFills = (sheet: Sheet, selector: string): Record<string, string> => {
    const inner = [...sheets[sheet].matchAll(forcedBlock)].map((m) => m[1]).join('\n');
    return Object.assign({}, ...rulesOf(inner).filter((r) => r.selectors.includes(selector)).map((r) => decls(r.body)));
  };
  const primary = '2px solid var(--color-primary-500)';
  const halo = /color-mix\(in srgb, var\(--color-(primary-500|error-600|error-default)\) \d+%|rgba\(32, 132, 151, 0?\.\d+\)/;

  // Design 039 §3: [sheet, selector, outline, offset]. Every row was a halo or
  // had no focus style (D-4: NC action, log tool buttons, dependency toolbar).
  const rings: [Sheet, string, string, string][] = [
    ['nc', '.lc-nc__item-title:focus-visible', primary, '2px'],
    ['nc', '.lc-nc__item-action:focus-visible', primary, '2px'],
    ['nc', '.lc-nc__item-dismiss:focus-visible', primary, '2px'],
    ['log', '.lc-log-viewer__tool-btn:focus-visible', primary, '2px'],
    ['log', '.lc-log-viewer__line--clickable:focus-visible', primary, '-2px'],
    ['log', '.lc-log-viewer__jump-bottom:focus-visible', primary, '2px'],
    ['code', '.code-block__copy:focus-visible', primary, '-2px'],
    ['tree', '.lc-tree-view__tool-btn:focus-visible', primary, '2px'],
    ['tree', '.lc-tree-view__item:focus-visible', primary, '-2px'],
    ['select', '.lc-select__option.lc-select__option--highlighted', primary, '-2px'],
    ['digits', '.lc-digit-input:focus', primary, '0'],
    ['dep', '.dep-viewer__btn:focus-visible', primary, '2px'],
    ['dl', '.lc-dl__action:focus-visible', primary, '2px'],
    ['password', '.lc-input.lc-input-error:focus', '2px solid var(--color-error-600)', '0'],
    ['textarea', '.lc-textarea--error:focus', '2px solid var(--color-error-600)', '0'],
    ['number', '.number-input--error .number-input__control:focus-within', '2px solid var(--color-error-600)', '0'],
    ['combobox', '.lc-combobox--error .lc-combobox__input-wrapper:focus-within', '2px solid var(--color-error-default)', '0'],
  ];

  it.each(rings)('AC-2: %s %s draws a solid 2 px outline, no halo', (sheet, selector, outline, offset) => {
    const found = fills(sheet, selector);
    expect([found.outline, found['outline-offset']]).toEqual([outline, offset]);
    expect(found['box-shadow'] ?? 'none').not.toMatch(halo);
  });

  it.each(rings)('AC-3: %s %s turns Highlight in forced colours', (sheet, selector) => {
    expect(forcedFills(sheet, selector)['outline-color']).toBe('Highlight');
  });

  it('AC-2, AC-3: an error digit keeps the error colour, and forced colours name its selector too', () => {
    expect(fills('digits', '.lc-digit-input.lc-digit-input-error:focus')).toEqual({ 'outline-color': 'var(--color-error-600)' });
    expect(forcedFills('digits', '.lc-digit-input.lc-digit-input-error:focus')['outline-color']).toBe('Highlight');
  });

  it('AC-2: the log tool buttons show the ring at full opacity (0.7 gave 2.66:1)', () => {
    expect(fills('log', '.lc-log-viewer__tool-btn:focus-visible').opacity).toBe('1');
  });

  it('AC-2, AC-3: the slider thumb ring is solid primary-500; forced colours outline the input', () => {
    for (const thumb of ['::-webkit-slider-thumb', '::-moz-range-thumb']) {
      expect(fills('slider', `.slider__input:focus-visible${thumb}`)['box-shadow']).toBe('0 1px 3px rgba(0, 0, 0, 0.15), 0 0 0 3px var(--color-primary-500)');
    }
    expect(forcedFills('slider', '.slider__input:focus-visible')).toEqual({ outline: '2px solid Highlight', 'outline-offset': '8px' });
  });

  it('AC-11: the rings add no transition', () => {
    for (const [sheet, selector] of rings) expect([selector, fills(sheet, selector).transition]).toEqual([selector, undefined]);
  });

  /**
   * AC-5 guard (design 039 §9): no focus, `--focused` or `--highlighted` rule
   * in lib/**\/*.scss draws a ≤ 40 % primary or error halo unless the same rule
   * also changes the border or draws an outline (the "keep" rows of the
   * inventory: the field border turns primary-500, ≥ 4.17 / 7.57).
   */
  it('AC-5: no focus style is a translucent halo alone', () => {
    const root = resolve(__dirname, '../lib');
    const files = (readdirSync(root, { recursive: true }) as string[]).filter((f) => /\.scss$/.test(f) && !/(^|\/)_/.test(f));
    expect(files.length).toBeGreaterThan(100);
    const offenders: string[] = [];
    let focusRules = 0;
    for (const file of files) {
      for (const r of rulesOf(compile(resolve(root, file)).css)) {
        if (!r.selectors.some((s) => /:focus|--focused|--highlighted/.test(s))) continue;
        focusRules++;
        const d = decls(r.body);
        const shadow = d['box-shadow'] ?? '';
        const weak = [...shadow.matchAll(/color-mix\(in srgb, var\(--color-(?:primary-500|error-600|error-default)\) (\d+)%/g)].some((m) => Number(m[1]) <= 60)
          || [...shadow.matchAll(/rgba\(32, 132, 151, (0?\.\d+)\)/g)].some((m) => Number(m[1]) <= 0.4);
        const outline = (d.outline !== undefined && !/^(none|0)\b/.test(d.outline)) || d['outline-color'] !== undefined;
        if (weak && !d['border-color'] && !outline) offenders.push(`${file}: ${r.selectors.join(', ')}`);
      }
    }
    expect(focusRules).toBeGreaterThan(100);
    expect(offenders).toEqual([]);
  });

  it('AC-1: the progress primary reads the theme token in the bar and the circle, as the ring does', () => {
    expect(fills('progress', '.progress-bar--primary .progress-bar__fill')['background-color']).toBe('var(--color-primary-500)');
    expect(fills('progress', '.progress-bar-circular--primary .progress-bar-circular__fill').stroke).toBe('var(--color-primary-500)');
    expect(fills('ring', '.lc-progress-ring__value--primary').stroke).toBe('var(--color-primary-500)');
    expect(sheets.progress).not.toMatch(/#208497/i);
  });

  it('AC-6: default and muted nodes and the toggle ring read the field border, active primary-600', () => {
    const border = (status: string) => depTs.match(new RegExp(`\\n  ${status}:\\s*\\{ bg: '[^']+', border: '([^']+)'`))?.[1];
    expect(['default', 'active', 'muted'].map(border)).toEqual(['var(--color-field-border)', 'var(--color-primary-600)', 'var(--color-field-border)']);
    expect(depHtml.match(/<circle[^>]*fill="var\(--color-neutral-100\)" stroke="var\(--color-field-border\)" stroke-width="1"/g)).toHaveLength(2);
    expect(depHtml).not.toMatch(/--color-neutral-300|--color-neutral-200/);
    // The selected stroke and the edge, label and legend colours of 036 stay.
    expect(depHtml).toContain(`[attr.stroke]="selectedNodeId() === node.id ? 'var(--color-primary-500)' : getNodeBorder(node)"`);
  });

  const expected = {
    progressTrack: [3.96, 6.69],
    ringPages: [4.17, 7.57],
    ringHovered: [3.96, 6.69],
    ringUnread: [3.75, 5.77],
    // Design §5 gave 3.23 light with the hover composited over the tints; the
    // tint replaces the hover fill, so the lowest real line is the error tint.
    ringLogLines: [3.49, 7.47],
    ringTerminalLines: [3.28, 7.58],
    ringLogToolbar: [4.02, 9.12],
    ringCodeHeader: [3.78, 8.74],
    ringTreeRows: [3.75, 6.96],
    errorPages: [8.02, 7.21],
    depField: [4.83, 6.7],
    depFieldOwnFill: [4.39, 5.69],
    depActive: [5.77, 10.8],
  };
  const floor = (n: number) => Math.floor(n * 100) / 100;

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);
    const lowest = (fg: Rgba, bases: Rgba[]) => Math.min(...bases.map((bg) => ratio(over(fg, bg), bg)));

    function measure() {
      const S = c('--color-surface');
      const pages = [c('--color-background'), S, c('--color-surface-2')];
      const hovered = pages.map((p) => over(c('--color-surface-hover'), p));
      const ring = c('--color-primary-500');

      const log = (selector: string) => parse(fills('log', selector)['background-color']);
      const logBg = S;
      const T = log('.lc-log-viewer--terminal');
      const hover = log('.lc-log-viewer__line:hover');
      // A tint (0,2,0, later) replaces the hover fill on warn and error lines,
      // so hover only lightens the untinted lines.
      const lines = (base: Rgba, variant: string) => [
        base,
        over(hover, base),
        over(log(`${variant} .lc-log-viewer__line--warn`), base),
        over(log(`${variant} .lc-log-viewer__line--error`), base),
      ];

      const codeVar = (name: string) => parse(sheets.code.match(new RegExp(`${name}: (#[0-9a-f]{6})`, 'i'))?.[1] ?? '');
      const header = over(parse(fills('code', '.code-block__header')['background-color']), codeVar('--lc-code-block-bg'));
      const copyHover = over(parse(fills('code', '.code-block__copy:hover')['background-color']), header);

      const treeRows = [S, over(c('--color-surface-hover'), S), over(c('--color-primary-50'), S), over(c('--color-primary-100'), S)];
      const field = c('--color-field-border');

      return {
        progressTrack: lowest(ring, pages.map((p) => over(c('--color-surface-hover'), p))),
        ringPages: lowest(ring, pages),
        ringHovered: lowest(ring, hovered),
        ringUnread: lowest(ring, [S, c('--color-surface-2')].map((p) => over(c('--color-surface-selected'), p))),
        ringLogLines: lowest(ring, lines(logBg, '.lc-log-viewer--log')),
        ringTerminalLines: lowest(ring, lines(T, '.lc-log-viewer--terminal')),
        ringLogToolbar: lowest(ring, [S, parse('#181825')]),
        ringCodeHeader: lowest(ring, [header, copyHover]),
        ringTreeRows: lowest(ring, treeRows),
        errorPages: Math.min(lowest(c('--color-error-600'), pages), lowest(c('--color-error-default'), pages)),
        depField: lowest(field, [S]),
        depFieldOwnFill: lowest(field, [over(c('--color-neutral-50'), S), over(c('--color-neutral-100'), S)]),
        depActive: lowest(c('--color-primary-600'), [S, over(c('--color-primary-50'), S)]),
      };
    }

    it('AC-1, AC-2, AC-6: the design 039 §5 ratios; fills and boundaries ≥ 3:1', () => {
      const m = measure();
      for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
        expect([key, floor(m[key])]).toEqual([key, expected[key][i]]);
      }
      expect(Math.min(...Object.values(m))).toBeGreaterThanOrEqual(3);
    });
  });
});

/**
 * Request 044 (3.27.2, F-31, design 044 §5): the filled select, textarea and
 * datepicker draw the field boundary of the outline variant, --color-field-border
 * at rest and --color-text-secondary on hover (it was transparent at rest and
 * --color-border, 1.23 / 1.29, or nothing on hover). Pages are the background,
 * surface and surface-2; the field's own fill (--color-surface-sunken at rest,
 * --color-surface-hover on hover) is composited over each page.
 */
describe('Component pairings of 3.27.2 (request 044)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const fields = {
    select: {
      css: compile(lib('select/select.component.scss')).css,
      rest: '.lc-select.lc-select--filled',
      hover: '.lc-select.lc-select--filled:hover:not(.lc-select--disabled):not(.lc-select--error):not(:focus)',
      error: '.lc-select.lc-select--error',
    },
    textarea: {
      css: compile(lib('textarea/textarea.component.scss')).css,
      rest: '.lc-textarea--filled',
      hover: '.lc-textarea--filled:hover:not(:disabled):not(:read-only):not(.lc-textarea--error):not(:focus)',
      error: '.lc-textarea--error',
    },
    datepicker: {
      css: compile(lib('datepicker/datepicker.component.scss')).css,
      rest: '.lc-datepicker.lc-datepicker--filled',
      hover: '.lc-datepicker.lc-datepicker--filled:hover:not(:disabled):not([readonly]):not(.lc-datepicker--error):not(:focus)',
      error: '.lc-datepicker.lc-datepicker--filled.lc-datepicker--error',
    },
  };
  type Field = keyof typeof fields;
  const names = Object.keys(fields) as Field[];

  const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
  const rulesOf = (css: string) =>
    [...css.replace(forcedBlock, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
      body: m[2],
    }));
  const decls = (body: string): Record<string, string> =>
    Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
  /** Every rule naming `selector`, merged in source order, forced-colours blocks left out. */
  const fills = (field: Field, selector: string): Record<string, string> => {
    const found = rulesOf(fields[field].css).filter((r) => r.selectors.includes(selector));
    expect([field, selector, found.length > 0]).toEqual([field, selector, true]);
    return Object.assign({}, ...found.map((r) => decls(r.body)));
  };
  const token = (value: string) => value.match(/^var\((--[\w-]+)\)$/)?.[1] ?? `not a token: ${value}`;
  const floor = (n: number) => Math.floor(n * 100) / 100;

  it.each(names)('AC-8, AC-9: filled %s: field border on the sunken fill at rest, text-secondary on the hover fill', (field) => {
    const rest = fills(field, fields[field].rest);
    const hover = fills(field, fields[field].hover);
    expect([rest['background-color'], rest['border-color']]).toEqual(['var(--color-surface-sunken)', 'var(--color-field-border)']);
    expect([hover['background-color'], hover['border-color']]).toEqual(['var(--color-surface-hover)', 'var(--color-text-secondary)']);
    expect(fills(field, fields[field].error)['border-color']).toBe('var(--color-error-600)');
  });

  // [light, dark] per page (background, surface, surface-2), design 044 §5.
  const expected = {
    restOnPage: [[4.83, 4.83, 4.62], [7.31, 6.7, 5.56]],
    restOnFill: [[4.39, 4.39, 4.39], [7.02, 7.02, 7.02]],
    hoverOnPage: [[7.55, 7.55, 7.23], [12.16, 11.15, 9.25]],
    hoverOnFill: [[6.86, 6.86, 6.86], [11.05, 9.97, 8.17]],
    // §5 quotes the page (background) only: 8.39 light, 9.47 dark.
    errorOnPage: [[8.39, 8.39, 8.02], [9.47, 8.68, 7.21]],
    errorOnFill: [[7.62, 7.62, 7.62], [9.09, 9.09, 9.09]],
  };

  describe.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('%s palette', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);

    function measure(field: Field) {
      const pages = ['--color-background', '--color-surface', '--color-surface-2'].map(c);
      const rest = fills(field, fields[field].rest);
      const hover = fills(field, fields[field].hover);
      const error = fills(field, fields[field].error);
      const on = (ink: string, bases: Rgba[]) => bases.map((b) => floor(ratio(over(c(token(ink)), b), b)));
      const restFill = pages.map((p) => over(c(token(rest['background-color'])), p));
      const hoverFill = pages.map((p) => over(c(token(hover['background-color'])), p));
      return {
        restOnPage: on(rest['border-color'], pages),
        restOnFill: on(rest['border-color'], restFill),
        hoverOnPage: on(hover['border-color'], pages),
        hoverOnFill: on(hover['border-color'], hoverFill),
        errorOnPage: on(error['border-color'], pages),
        errorOnFill: on(error['border-color'], restFill),
      };
    }

    it.each(names)('AC-8, AC-9: filled %s: the design 044 §5 ratios, all ≥ 3:1, hover ≥ rest', (field) => {
      const m = measure(field);
      for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
        expect([key, m[key]]).toEqual([key, expected[key][i]]);
        expect(Math.min(...m[key])).toBeGreaterThanOrEqual(3);
      }
      m.hoverOnPage.forEach((r, page) => expect(r).toBeGreaterThanOrEqual(m.restOnPage[page]));
      m.hoverOnFill.forEach((r, page) => expect(r).toBeGreaterThanOrEqual(m.restOnFill[page]));
    });
  });
});

/**
 * Request 047 (3.30, 046-f2, design 047 §5): the selected day carries the
 * month cell's inset --color-primary-500 ring, since its fill alone is
 * 2.78:1 on the dark panel (WCAG 1.4.11); the new combobox clear ring sits
 * on the field fill (--color-surface-2).
 */
describe('Component pairings of 3.30 (request 047)', () => {
  const lib = (path: string) => resolve(__dirname, '../lib', path);
  const sheets = {
    datepicker: compile(lib('datepicker/datepicker.component.scss')).css,
    combobox: compile(lib('combobox/combobox.component.scss')).css,
  };
  const body = (sheet: keyof typeof sheets, selector: string) => {
    const css = sheets[sheet];
    const at = css.indexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(at, css.indexOf('}', at));
  };
  const floor = (n: number) => Math.floor(n * 100) / 100;

  it('AC-2, AC-3: the rules pair these tokens', () => {
    expect(body('datepicker', '.lc-datepicker-calendar')).toContain('background-color: var(--color-surface)');
    const selected = body('datepicker', '.lc-datepicker-day.lc-datepicker-day--selected');
    expect(selected).toContain('box-shadow: inset 0 0 0 2px var(--color-primary-500)');
    expect(selected).toContain('background-color: var(--color-primary-fill)');
    expect(selected).toContain('color: var(--color-on-primary)');
    expect(body('combobox', '.lc-combobox__input-wrapper')).toContain('background-color: var(--color-surface-2)');
    expect(body('combobox', '.lc-combobox__clear:focus-visible')).toContain('outline: 2px solid var(--color-primary-500)');
  });

  // [light, dark], floored; design 047 §5 quotes the browser's rounded
  // values (ring 4.37 / 9.13, clear ring 4.18 / 7.58).
  const expected = {
    ringOnPanel: [4.36, 9.12],
    textOnFill: [6.21, 6.21],
    textOnHoverFill: [9.13, 9.13],
    fillOnPanel: [6.21, 2.78],
    clearRingOnField: [4.17, 7.57],
  };

  it.each(palettes.map(([name, tokens], i) => [name, tokens, i] as const))('AC-2, AC-3: %s palette: the design 047 §5 ratios', (_palette, tokens, i) => {
    const c = (name: string) => color(tokens, name);
    const on = (ink: string, base: string) => floor(ratio(over(c(ink), c(base)), c(base)));
    const got = {
      ringOnPanel: on('--color-primary-500', '--color-surface'),
      textOnFill: on('--color-on-primary', '--color-primary-fill'),
      textOnHoverFill: on('--color-on-primary', '--color-primary-fill-hover'),
      fillOnPanel: on('--color-primary-fill', '--color-surface'),
      clearRingOnField: on('--color-primary-500', '--color-surface-2'),
    };
    expect(got).toEqual(Object.fromEntries(Object.entries(expected).map(([key, pair]) => [key, pair[i]])));
    // The state is carried by the ring in both themes (the dark fill is not).
    expect(got.ringOnPanel).toBeGreaterThanOrEqual(3);
    expect(got.clearRingOnField).toBeGreaterThanOrEqual(3);
    expect(Math.min(got.textOnFill, got.textOnHoverFill)).toBeGreaterThanOrEqual(4.5);
  });
});
