import { join } from 'path';
import { compile } from 'sass';

/**
 * 3.35 (request 055, 054-n1, AC-13): from 16rem to 30rem inside the border an
 * inline button action takes its own row below the text, so at 360 px the
 * message keeps 226 px beside the × instead of about 70. jsdom has no
 * container queries, so this pins the compiled rules; the boxes are measured
 * in the browser (build.md).
 */
describe('AlertComponent 3.35: inline button actions below 30rem (054-n1)', () => {
  const css = compile(join(__dirname, 'alert.component.scss'), {
    loadPaths: [join(__dirname, '../../styles')],
  }).css;

  const BAND = '@container lc-alert (16rem <= width < 30rem)';
  /** The whole `@container` block that starts with `prelude`, nested rules included. */
  const containerBlock = (prelude: string): string => {
    const at = css.indexOf(prelude);
    if (at < 0) return '';
    let depth = 0;
    for (let i = css.indexOf('{', at); i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1);
    }
    return '';
  };
  const band = containerBlock(BAND);
  /** Rules inside `block` as { selector, body }, selectors with whitespace collapsed. */
  const rules = (block: string) =>
    [...block.slice(block.indexOf('{') + 1).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selector: m[1].replace(/\s+/g, ' ').trim(),
      body: m[2],
    }));

  const LINK = 'a:where(:not(.btn))';
  const CONTAINER = `.lc-alert:not(.lc-alert--actions-stacked) .lc-alert__container:has(> .lc-alert__action:not(:empty)):not(:has(> .lc-alert__action > ${LINK}))`;
  const INDENT = `.lc-alert--with-icon:not(.lc-alert--actions-stacked) .lc-alert__container:not(:has(> .lc-alert__action > ${LINK})) > .lc-alert__action`;
  const body = (selector: string) => rules(band).find((r) => r.selector === selector)?.body ?? '';

  it('has one band query on the alert width, in rem, with an upper and a lower bound', () => {
    expect(band).not.toBe('');
    expect(css.split(BAND)).toHaveLength(2);
  });

  it('wraps the container of an inline alert with a non-empty action and no text link', () => {
    expect(body(CONTAINER)).toMatch(/^\s*flex-wrap:\s*wrap;\s*$/);
    expect(body(`${CONTAINER} > .lc-alert__body`)).toMatch(/^\s*flex:\s*1 1 0;\s*$/);
  });

  it('puts the action on its own full-width row below the text, at its natural width', () => {
    const action = body(`${CONTAINER} > .lc-alert__action`);
    expect(action).toMatch(/order:\s*1;/);
    expect(action).toMatch(/flex:\s*1 1 100%;/);
    expect(action).toMatch(/align-self:\s*auto;/);
    expect(action).toMatch(/min-width:\s*0;/);
    expect(action).toMatch(/margin-top:\s*var\(--spacing-1\);/);
    // The button keeps its natural width: nothing stretches it.
    expect(band).not.toMatch(/width:\s*100%/);
    expect(rules(band).filter((r) => /lc-button|\.btn\s*$|\.btn\s*>/.test(r.selector))).toEqual([]);
  });

  it('lines the action up with the text when the icon shows (24 px icon + gap)', () => {
    expect(body(INDENT)).toMatch(/^\s*padding-inline-start:\s*calc\(24px \+ var\(--spacing-3\)\);\s*$/);
  });

  it('has exactly these four rules, and leaves stacked alerts and text links to their own rules', () => {
    expect(rules(band).map((r) => r.selector)).toEqual([
      CONTAINER,
      `${CONTAINER} > .lc-alert__body`,
      `${CONTAINER} > .lc-alert__action`,
      INDENT,
    ]);
    for (const r of rules(band)) {
      expect(r.selector).toContain(':not(.lc-alert--actions-stacked)');
      expect(r.selector).toContain(`:not(:has(> .lc-alert__action > ${LINK}))`);
    }
  });

  it('sits between the 3.12 link rules and the 3.13.1 narrow layout, with no word breaking, motion or forced colours', () => {
    expect(css.indexOf(BAND)).toBeGreaterThan(css.indexOf('@container lc-alert (width < 36rem)'));
    expect(css.indexOf(BAND)).toBeLessThan(css.indexOf('@container lc-alert (width < 16rem)'));
    expect(band).not.toMatch(/hyphens|overflow-wrap|word-break|transition|animation|forced-color/);
  });
});
