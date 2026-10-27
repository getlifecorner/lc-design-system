import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compile } from 'sass';

/**
 * The button hook --lc-btn-overflow-wrap (3.11, AS-30; WCAG 1.4.10). The
 * default stays `break-word`, because `anywhere` lets a one-word button in a
 * non-wrapping row shrink with its neighbours ("Bearbeiten" 116.7 → 93.8 px).
 * The kit sets `anywhere` only in the wrapping rows it owns, where a link or
 * button whose one word is wider than the line ("Datenschutz" as a `lg` link at
 * 320 px and 200 % text) would otherwise run out of its container.
 */
const lib = resolve(__dirname, '..');
const compiled = (file: string): string => '\n' + compile(join(lib, file)).css;

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(css: string, selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

/** Every stylesheet of the library, relative to `lib/`. */
function stylesheets(): string[] {
  return (readdirSync(lib, { recursive: true }) as string[]).filter((f) => f.endsWith('.scss')).sort();
}

describe('--lc-btn-overflow-wrap (3.11, AS-30)', () => {
  it('lc-button and a[lcButton] read the hook, default break-word (min-content unchanged)', () => {
    const css = compiled('button/button.component.scss');
    expect(rule(css, '.btn')).toMatch(/overflow-wrap:\s*var\(--lc-btn-overflow-wrap, break-word\);/);
    // The only overflow-wrap of the button stylesheet, so no variant overrides it.
    expect(css.match(/overflow-wrap:/g)).toHaveLength(1);
  });

  it('is set to anywhere in exactly four places: the footer links, the page-header actions, the narrow card actions, the narrow alert actions (3.13.1)', () => {
    const setters = stylesheets()
      .filter((f) => /--lc-btn-overflow-wrap:/.test(readFileSync(join(lib, f), 'utf-8')))
      .map((f) => f.split('\\').join('/'));
    expect(setters).toEqual([
      'alert/alert.component.scss',
      'footer/footer.component.scss',
      'next-step-card/next-step-card.component.scss',
      'page-header/page-header.component.scss',
    ]);
  });

  it('lc-footer: the wrapping bottom row (links and copyright)', () => {
    const bottom = rule(compiled('footer/footer.component.scss'), '.footer__bottom');
    expect(bottom).toMatch(/flex-wrap:\s*wrap/);
    expect(bottom).toMatch(/--lc-btn-overflow-wrap:\s*anywhere/);
  });

  it('lc-page-header: the wrapping actions, never wider than the row', () => {
    const actions = rule(compiled('page-header/page-header.component.scss'), '.lc-page-header__actions');
    expect(actions).toMatch(/flex-wrap:\s*wrap/);
    expect(actions).toMatch(/max-width:\s*100%/);
    expect(actions).toMatch(/--lc-btn-overflow-wrap:\s*anywhere/);
  });

  it('lc-next-step-card: only the narrow actions, not the wide card', () => {
    const css = compiled('next-step-card/next-step-card.component.scss');
    const narrowAt = css.indexOf('@container lc-next-step-card (width < 30rem)');
    expect(narrowAt).toBeGreaterThan(-1);
    const hookAt = css.indexOf('--lc-btn-overflow-wrap: anywhere');
    expect(hookAt).toBeGreaterThan(narrowAt);
    expect(css.indexOf('--lc-btn-overflow-wrap', hookAt + 1)).toBe(-1);
    expect(css.slice(narrowAt, css.indexOf('\n@', narrowAt + 1))).toMatch(
      /\.lc-next-step-card__actions\s*{[^}]*--lc-btn-overflow-wrap:\s*anywhere/,
    );
  });

  it('lc-alert: only the narrow actions, not the wide alert (3.13.1, G-WL4)', () => {
    const css = compiled('alert/alert.component.scss');
    const narrowAt = css.indexOf('@container lc-alert (width < 16rem)');
    expect(narrowAt).toBeGreaterThan(-1);
    const hookAt = css.indexOf('--lc-btn-overflow-wrap: anywhere');
    expect(hookAt).toBeGreaterThan(narrowAt);
    expect(css.indexOf('--lc-btn-overflow-wrap', hookAt + 1)).toBe(-1);
    expect(css.slice(narrowAt, css.indexOf('\n@', narrowAt + 1))).toMatch(
      /\.lc-alert__action\s*{[^}]*--lc-btn-overflow-wrap:\s*anywhere/,
    );
  });

  it.each(['button.component.ts', 'button-link.component.ts'])('documents the hook in the class JSDoc of %s', (file) => {
    const source = readFileSync(resolve(__dirname, file), 'utf-8').replace(/\s*\n\s*\*\s?/g, ' ');
    expect(source).toContain('CSS hook `--lc-btn-overflow-wrap` (`break-word | anywhere`, default `break-word`)');
    expect(source).toContain(
      "The kit sets it in `lc-footer`'s link row, the page-header actions, the next-step-card's narrow actions and the narrow alert's actions.",
    );
  });
});
