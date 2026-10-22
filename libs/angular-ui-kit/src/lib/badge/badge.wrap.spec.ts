import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { BadgeComponent } from './badge.component';

/**
 * lc-badge `wrap` (3.11, SI-15): a sentence-like label wraps onto centred
 * lines instead of running out of its container at 320 px and 200 % text.
 * Opt-in: without it the badge renders exactly as before (AC-6). The layout is
 * CSS (measured in the stories); these tests pin the class, the DOM and the
 * stylesheet contract.
 */
@Component({
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-badge variant="info" [rounded]="rounded()" [dot]="dot()" [wrap]="wrap()">
      Geschlossene Beta, nur mit Einladung
    </lc-badge>
  `,
})
class WrapHostComponent {
  readonly rounded = signal(true);
  readonly dot = signal(false);
  readonly wrap = signal(false);
}

/** The compiled stylesheet: jsdom applies none, so the rules are read here. */
const css = '\n' + compile(resolve(__dirname, 'badge.component.scss')).css;

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('lc-badge wrap (3.11, SI-15)', () => {
  function render(init: Partial<{ rounded: boolean; dot: boolean; wrap: boolean }> = {}) {
    const fixture = TestBed.createComponent(WrapHostComponent);
    const host = fixture.componentInstance;
    if (init.rounded !== undefined) host.rounded.set(init.rounded);
    if (init.dot !== undefined) host.dot.set(init.dot);
    if (init.wrap !== undefined) host.wrap.set(init.wrap);
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('lc-badge > span') as HTMLElement;
    return { fixture, host, span };
  }

  /** The class list, sorted: Angular's `[class]` order is not the computed order. */
  const classes = (el: HTMLElement): string[] => [...el.classList].sort();

  describe('AC-6: the default renders as before', () => {
    it('defaults `wrap` to false', () => {
      const badge = TestBed.createComponent(BadgeComponent);
      badge.detectChanges();
      expect(badge.componentInstance.wrap()).toBe(false);
      expect(badge.componentInstance.badgeClasses()).toBe('lc-badge lc-badge--default lc-badge--md');
    });

    it('keeps the class list and the DOM of a badge without `wrap`', () => {
      const { span } = render();
      expect(classes(span)).toEqual(['lc-badge', 'lc-badge--info', 'lc-badge--md', 'lc-badge--rounded']);
      expect(span.children).toHaveLength(0);
      expect(span.textContent?.trim()).toBe('Geschlossene Beta, nur mit Einladung');
    });

    it('keeps the class list of a dot badge without `wrap`', () => {
      const { span } = render({ dot: true, rounded: false });
      expect(classes(span)).toEqual(['lc-badge', 'lc-badge--has-dot', 'lc-badge--info', 'lc-badge--md']);
    });

    it('keeps one line and the fixed height in the base and size rules', () => {
      const base = rule('.lc-badge');
      expect(base).toMatch(/white-space:\s*nowrap/);
      expect(base).toMatch(/line-height:\s*1;/);
      expect(rule('.lc-badge--xs')).toMatch(/height:\s*1\.25rem/);
      expect(rule('.lc-badge--sm')).toMatch(/height:\s*1\.5rem/);
      expect(rule('.lc-badge--md')).toMatch(/height:\s*1\.75rem/);
      expect(rule('.lc-badge--lg')).toMatch(/height:\s*2rem/);
      expect(rule('.lc-badge--rounded')).toMatch(/border-radius:\s*var\(--border-radius-full, 9999px\)/);
    });

    it('documents the input with @default false', () => {
      const source = readFileSync(resolve(__dirname, 'badge.component.ts'), 'utf8');
      expect(source).toMatch(/Use it for sentence-like status labels \(SI-15\), not for counts\.\s*\n\s*\* @default false\s*\n\s*\*\/\s*\n\s*wrap = input<boolean>\(false\);/);
    });
  });

  describe('AC-7: with `wrap`', () => {
    it('adds lc-badge--wrap and changes nothing else in the DOM', () => {
      const { span } = render({ wrap: true });
      expect(classes(span)).toEqual([
        'lc-badge',
        'lc-badge--info',
        'lc-badge--md',
        'lc-badge--rounded',
        'lc-badge--wrap',
      ]);
      expect(span.tagName).toBe('SPAN');
      expect(span.children).toHaveLength(0);
      expect(span.textContent?.trim()).toBe('Geschlossene Beta, nur mit Einladung');
    });

    it('keeps the dot as the first child', () => {
      const { span } = render({ wrap: true, dot: true });
      expect(span.classList).toContain('lc-badge--wrap');
      expect(span.firstElementChild?.className).toBe('lc-badge__dot');
      expect(span.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    });

    it('removes the class again when `wrap` turns off', () => {
      const { fixture, host, span } = render({ wrap: true });
      host.wrap.set(false);
      fixture.detectChanges();
      expect(span.classList).not.toContain('lc-badge--wrap');
    });

    it('wraps centred lines of 1.25, never wider than the container', () => {
      const wrap = rule('.lc-badge--wrap');
      expect(wrap).toMatch(/max-width:\s*100%/);
      expect(wrap).toMatch(/white-space:\s*normal/);
      expect(wrap).toMatch(/text-align:\s*center/);
      expect(wrap).toMatch(/line-height:\s*var\(--line-height-tight, 1\.25\)/);
      expect(wrap).toMatch(/overflow-wrap:\s*anywhere/);
    });

    it.each([
      ['xs', '1.25rem', '0.625rem'],
      ['sm', '1.5rem', '0.75rem'],
      ['md', '1.75rem', '0.875rem'],
      ['lg', '2rem', '1rem'],
    ])('size %s: min-height %s instead of height, padding for one line of that height, radius %s with rounded', (size, height, radius) => {
      // Two classes (0,2,0), so `height: auto` beats `.lc-badge--<size>`.
      const sized = rule(`.lc-badge--wrap.lc-badge--${size}`);
      expect(sized).toMatch(/height:\s*auto/);
      expect(sized).toContain(`min-height: ${height};`);
      // Sass drops the redundant calc() inside max(); the math is the same.
      expect(sized).toContain(
        `padding-block: max(0px, (${height} - 2px) / 2 - var(--line-height-tight, 1.25) * 0.5em);`,
      );
      expect(rule(`.lc-badge--wrap.lc-badge--rounded.lc-badge--${size}`)).toContain(`border-radius: ${radius};`);
    });

    it('keeps the dot on the centre of the first line', () => {
      const dot = rule('.lc-badge--wrap .lc-badge__dot');
      expect(dot).toMatch(/align-self:\s*flex-start/);
      expect(dot).toMatch(/margin-top:\s*calc\(\(var\(--line-height-tight, 1\.25\) - 0\.5\) \* 0\.5em\)/);
    });

    it('AC-8: keeps the border, the colours and the inline padding (forced colours keep the border)', () => {
      const wrapRules = [...css.matchAll(/\n([^{}\n]*lc-badge--wrap[^{}\n]*)\{([^}]*)\}/g)];
      expect(wrapRules.length).toBeGreaterThanOrEqual(9);
      for (const [, , body] of wrapRules) {
        expect(body).not.toMatch(/(^|[\s;])border(-width|-style|-color)?:/);
        expect(body).not.toMatch(/(^|[\s;])(color|background(-color)?):/);
        expect(body).not.toMatch(/padding(-inline|-left|-right)?:/);
      }
    });
  });
});
