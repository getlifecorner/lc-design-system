import { TestBed } from '@angular/core/testing';
import { createHash } from 'crypto';
import { resolve } from 'path';
import { compile } from 'sass';
import { AlertComponent } from './alert.component';

/**
 * 3.34 (request 054, monatsstand bug, AC-14/AC-15): the × keeps its 28 px box
 * (icon 20 px + 4 px padding, −4 px margin), hover fill and ring, and its
 * glyph takes the variant's text colour (D-5, review r1 F-1); a transparent
 * `::before`, centred on it, makes the target 44 × 44 px. jsdom has no
 * layout: the rules are pinned in the compiled CSS, the geometry (hit scan,
 * heights, hash-identical shots) is measured in the stories.
 */
describe('AlertComponent — 44 px close target (3.34, request 054)', () => {
  const css = compile(resolve(__dirname, 'alert.component.scss')).css;

  /** The declarations of the first top-level rule whose selector is exactly `selector`. */
  const rule = (selector: string) => {
    const at = new RegExp(`(?:^|\\n)${selector.replace(/[.:()]/g, '\\$&')} \\{([^}]*)\\}`).exec(css);
    if (!at) throw new Error(`${selector} not found`);
    return at[1];
  };

  const BEFORE = '\n.lc-alert__close::before {\n  content: "";\n  position: absolute;\n  inset: min(0px, (100% - 44px) / 2);\n}\n';
  const POSITION = '\n  position: relative;';
  /** D-5 (review r1): the glyph in the variant's text colour, not the UA `buttontext` black. */
  const COLOR = '\n  border: none;\n  color: inherit;';

  it('F-1 (D-5): the glyph takes the variant text colour, after the border reset', () => {
    expect(css).toContain(COLOR);
    expect(rule('.lc-alert__close')).toContain('color: inherit;');
    for (const variant of ['success', 'error', 'warning', 'info']) {
      expect(rule(`.lc-alert--${variant}`)).toMatch(/color: var\(--color-text-primary\);/);
      expect(css).not.toMatch(new RegExp(`\\.lc-alert--${variant} \\.lc-alert__close[^{]*\\{[^}]*(?:^|[;\\s])color:`));
    }
  });

  it('AC-14: a 44 × 44 px hit area centred on the box, in CSS px (also at 200 % text)', () => {
    expect(css).toContain(BEFORE);
    expect(rule('.lc-alert__close::before')).not.toMatch(/background|border|outline|box-shadow|color/);
    expect(rule('.lc-alert__close')).toContain(POSITION.trim());
    expect(css).not.toMatch(/\.lc-alert__close::before[^{]*\{[^}]*--size-min-touch/);
  });

  it('AC-15: the box, padding, margin, radius, hover fill and ring of the × are unchanged', () => {
    const close = rule('.lc-alert__close');
    expect(close).toMatch(/padding: var\(--spacing-1\);/);
    expect(close).toMatch(/margin: calc\(var\(--spacing-1\) \* -1\);/);
    expect(close).toMatch(/border-radius: var\(--border-radius-sm\);/);
    expect(close).toMatch(/background: transparent;/);
    expect(rule('.lc-alert__close:hover')).toMatch(/background-color: var\(--color-surface-hover\);/);
    expect(rule('.lc-alert__close:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;/);
  });

  it('AC-15: apart from the three additions the compiled CSS is the one of 3.33.1', () => {
    // Length and sha1 of the 3.33.1 file compiled the same way (compared with
    // a copy of it once, then pinned). The additions: the `::before` rule,
    // `position: relative` and (D-5) `color: inherit`. 3.35 (request 055,
    // 054-n1) added the inline-action band block before the × rule; it is
    // cut out whole first (alert.inline-action-band.spec.ts pins it).
    const bandAt = css.indexOf('@container lc-alert (16rem <= width < 30rem) {');
    expect(bandAt).toBeGreaterThan(-1);
    const bandEnd = css.indexOf('\n  }\n}', bandAt) + '\n  }\n}'.length;
    const withoutBand = css.slice(0, bandAt).replace(/\s+$/, '') + css.slice(bandEnd);
    expect(withoutBand.indexOf('16rem <= width')).toBe(-1);
    const withoutColor = withoutBand.replace(COLOR, '\n  border: none;');
    expect(withoutColor).not.toBe(withoutBand);
    const rest = withoutColor.replace(BEFORE, '\n').replace(POSITION, '');
    expect(rest).not.toBe(withoutColor);
    expect([rest.length, createHash('sha1').update(rest).digest('hex')]).toEqual([6722, '11ed3a6df7fe623ccf0e3085306b84227d9c3f63']);
  });

  it('the narrow-layout block still follows the × rule (its margin wins by source order)', () => {
    expect(css.indexOf('@container lc-alert (width < 16rem)')).toBeGreaterThan(css.indexOf('\n.lc-alert__close {'));
  });

  it('adds no markup: the × is the same button', () => {
    TestBed.configureTestingModule({ imports: [AlertComponent] });
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('dismissible', true);
    fixture.componentRef.setInput('closeAriaLabel', 'Hinweis schließen');
    fixture.detectChanges();
    const close = (fixture.nativeElement as HTMLElement).querySelector('.lc-alert__close') as HTMLButtonElement;
    expect(close.tagName).toBe('BUTTON');
    expect(close.getAttribute('aria-label')).toBe('Hinweis schließen');
    expect(close.children).toHaveLength(1);
    fixture.destroy();
  });
});
