import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Which root classes select which palette (read from the compiled CSS).
 * 3.3, G-6: `<html class="system">` follows the OS without JavaScript.
 */
const dark = compile(resolve(__dirname, '_theme-dark.scss')).css;
const light = compile(resolve(__dirname, '_theme-light.scss')).css;

/** Custom properties of the first rule whose selector list starts with `selector`. */
function tokensOf(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  const body = css.slice(open, css.indexOf('}', open));
  const tokens: Record<string, string> = {};
  // Whitespace normalised: multi-line values are indented by nesting depth.
  for (const match of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) tokens[match[1]] = match[2].replace(/\s+/g, ' ').trim();
  return tokens;
}

describe('Theme modes', () => {
  it('keeps light on :root and :root.light (and so on a `system` root by default)', () => {
    expect(light).toMatch(/:root,\s*:root\.light\s*\{/);
  });

  it('keeps dark as the default for a root without a class, but not for a `system` root', () => {
    expect(dark).toMatch(/:root\.dark,\s*:root:not\(\.light\):not\(\.system\)\s*\{/);
    expect(dark).not.toMatch(/:root:not\(\.light\)\s*[,{]/);
  });

  it('switches a `system` root to dark only when the OS prefers dark (G-6)', () => {
    expect(dark).toMatch(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\.system:not\(\.light\)\s*\{/);
  });

  it('emits the full dark token set for the `system` root', () => {
    const base = tokensOf(dark, ':root.dark,');
    const system = tokensOf(dark, ':root.system:not(.light)');
    expect(Object.keys(base).length).toBeGreaterThan(100);
    expect(system).toEqual(base);
  });

  it('lets the browser draw its own controls in the OS scheme under `system`', () => {
    expect(dark).toMatch(/:root\.system\s*\{\s*color-scheme:\s*light dark;/);
  });

  it('gives the light theme a sky (LK-1): white into --color-background-low', () => {
    const tokens = tokensOf(light, ':root,');
    expect(tokens['--color-background']).toBe('#ffffff');
    expect(tokens['--color-background-low']).toBe('#f6fafb');
    expect(tokens['--app-background-image']).toBe('linear-gradient(180deg, #ffffff 55%, #f6fafb)');
  });

  it('keeps the dark glow, the violet at 0.14', () => {
    const tokens = tokensOf(dark, ':root.dark,');
    expect(tokens['--app-background-image']).toContain('rgba(32, 132, 151, 0.20)');
    expect(tokens['--app-background-image']).toContain('rgba(78, 63, 132, 0.14)');
  });
});

/**
 * Request 043 (F-25, design D-7): a header with `theme="light"` / `"dark"`
 * re-declares every colour token of that theme, so its slot content (buttons,
 * links, the theme toggle, the account menu) resolves the header's palette
 * instead of the page's. Derived tokens resolve where they are declared, so
 * the set must be complete.
 */
describe('Theme scope of a themed header', () => {
  const COLOUR = /^--(color-|gradient-|shadow-|elevation-|accent-line$|app-background-image$)/;
  const colours = (tokens: Record<string, string>) =>
    Object.fromEntries(Object.entries(tokens).filter(([name]) => COLOUR.test(name)));

  it('AC-6: .lc-header--light declares exactly the colour tokens of the light root (172), with the same values', () => {
    const root = tokensOf(light, ':root,');
    const header = tokensOf(light, '\n.lc-header--light {');
    expect(Object.keys(header)).toHaveLength(172);
    expect(header).toEqual(colours(root));
  });

  it('AC-7: .lc-header--dark declares exactly the colour tokens of the dark root (172), with the same values', () => {
    const root = tokensOf(dark, ':root.dark,');
    const header = tokensOf(dark, '\n.lc-header--dark {');
    expect(Object.keys(header)).toHaveLength(172);
    expect(header).toEqual(colours(root));
  });

  it('AC-12: the root rules still declare the full token set (252 per theme), colours and the rest', () => {
    expect(Object.keys(tokensOf(light, ':root,'))).toHaveLength(252);
    expect(Object.keys(tokensOf(dark, ':root.dark,'))).toHaveLength(252);
    expect(Object.keys(colours(tokensOf(light, ':root,')))).toHaveLength(172);
  });

  it('scopes only the header: each theme file emits the header rule once, after its root rules', () => {
    expect(light.match(/\.lc-header--light \{/g)).toHaveLength(1);
    expect(dark.match(/\.lc-header--dark \{/g)).toHaveLength(1);
    expect(light.indexOf('.lc-header--light {')).toBeGreaterThan(light.indexOf(':root,'));
    expect(dark.indexOf('.lc-header--dark {')).toBeGreaterThan(dark.indexOf(':root.system {'));
  });
});

/**
 * Request 051 (050-f2, design §1 B, D-3): a sidenav with `theme="light"` /
 * `"dark"` re-declares every colour token of that theme on its badge hosts,
 * so the badges take the rail's palette instead of the page's (1.11–1.96:1 on
 * a light rail on a dark page before). Only the badge host: the collapsed
 * rail's label tooltip keeps the page palette. On a matching page the values
 * equal the root's, so the badge renders exactly as before (AC-4).
 */
describe('Theme scope of a themed sidenav rail badge (request 051)', () => {
  const COLOUR = /^--(color-|gradient-|shadow-|elevation-|accent-line$|app-background-image$)/;
  const colours = (tokens: Record<string, string>) =>
    Object.fromEntries(Object.entries(tokens).filter(([name]) => COLOUR.test(name)));
  // 3.37 (request 057, design D-5): the light rule's selector list also takes
  // `lc-hero lc-badge` (badges on the hero's fixed bands), so the light rule
  // ends in it; the declarations are the same single block.
  const LIGHT_RAIL = '.lc-sidenav-container--light .lc-sidenav__nav-badge,\nlc-hero lc-badge {';
  const DARK_RAIL = '.lc-sidenav-container--dark .lc-sidenav__nav-badge {';

  it('AC-3/AC-4: the light rail badge declares exactly the colour tokens of the light root (172), with the same values', () => {
    const badge = tokensOf(light, `\n${LIGHT_RAIL}`);
    expect(Object.keys(badge)).toHaveLength(172);
    expect(badge).toEqual(colours(tokensOf(light, ':root,')));
  });

  it('AC-3/AC-4: the dark rail badge declares exactly the colour tokens of the dark root (172), with the same values', () => {
    const badge = tokensOf(dark, `\n${DARK_RAIL}`);
    expect(Object.keys(badge)).toHaveLength(172);
    expect(badge).toEqual(colours(tokensOf(dark, ':root.dark,')));
  });

  it('emits each rail rule once, in its own theme file, after the header rule', () => {
    expect(light.split(LIGHT_RAIL)).toHaveLength(2);
    expect(dark.split(DARK_RAIL)).toHaveLength(2);
    expect(light.includes('.lc-sidenav-container--dark')).toBe(false);
    expect(dark.includes('.lc-sidenav-container--light')).toBe(false);
    expect(light.indexOf(LIGHT_RAIL)).toBeGreaterThan(light.indexOf('.lc-header--light {'));
    expect(dark.indexOf(DARK_RAIL)).toBeGreaterThan(dark.indexOf('.lc-header--dark {'));
  });

  it('scopes the badge host only, not the rail or its label tooltip', () => {
    // Whole selector lists, the text before each `{` (3.37: the light one spans two lines).
    const selectorLists = (css: string) =>
      css
        .replace(/\/\*[^]*?\*\//g, '')
        .split('{')
        .slice(0, -1)
        .map((chunk) => chunk.slice(chunk.lastIndexOf('}') + 1).trim());
    expect(selectorLists(light).filter((s) => s.includes('lc-sidenav'))).toEqual([
      '.lc-sidenav-container--light .lc-sidenav__nav-badge,\nlc-hero lc-badge',
    ]);
    expect(selectorLists(dark).filter((s) => s.includes('lc-sidenav'))).toEqual(['.lc-sidenav-container--dark .lc-sidenav__nav-badge']);
  });

  it('3.37: badges in lc-hero take the light palette in both themes, from the light file only', () => {
    expect(light.match(/lc-hero lc-badge/g)).toHaveLength(1);
    expect(dark.includes('lc-hero')).toBe(false);
  });
});
