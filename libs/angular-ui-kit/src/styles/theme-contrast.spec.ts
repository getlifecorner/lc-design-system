import { compile } from 'sass';
import { readFileSync } from 'fs';
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

  it('AC-13: in forced colours the pressed chip keeps a Highlight outline unless it is focused', () => {
    const at = ncCss.indexOf('@media (forced-colors: active)');
    expect(at).toBeGreaterThan(-1);
    const media = ncCss.slice(at, ncCss.indexOf('}\n}', at));
    expect(media).toMatch(/\.lc-nc__filter--active:not\(:focus-visible\) \{/);
    expect(media).toMatch(/outline: 2px solid Highlight;/);
    expect(media).toMatch(/outline-offset: 1px;/);
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

  it('D-2: the level pills stay at full opacity; the pressed pill gets an outline in forced colours', () => {
    expect(fills('log', '.lc-log-viewer__level-pill').opacity).toBeUndefined();
    expect(fills('log', '.lc-log-viewer__level-pill--active').opacity).toBeUndefined();
    expect(sheets.log).toMatch(
      /@media \(forced-colors: active\) \{\s*\.lc-log-viewer__level-pill--active:not\(:focus-visible\) \{\s*outline: 2px solid Highlight;\s*outline-offset: 1px;\s*\}/,
    );
  });

  it('AC-10: the progress track is unchanged; primary and secondary stay raw', () => {
    // The base rule (the forced-colours block repeats the selector with an outline).
    expect(sheets.progress).toMatch(/\n\.progress-bar__track \{\s*flex: 1;\s*background-color: var\(--color-surface-hover\);/);
    expect(fills('progress', '.progress-bar--primary .progress-bar__fill')['background-color']).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fills('progress', '.progress-bar--secondary .progress-bar__fill')['background-color']).toMatch(/^#[0-9a-f]{6}$/i);
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
   * unread row). F-1: the NC high chip on an unread row in dark stays 3.67.
   */
  const expected = { text: [4.85, 4.6], graphic: [3.52, 4.83], ncUnread: [5.52, 3.67], completeGlyph: [4.36, 9.12] };
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

    it('F-1 (known): the NC priority chips on an unread row', () => {
      const min = Math.min(
        chip('nc', '.lc-nc__item-priority--high', 'warning', unread),
        chip('nc', '.lc-nc__item-priority--urgent', 'error', unread),
      );
      expect(floor(min)).toBe(expected.ncUnread[i]);
    });
  });
});
