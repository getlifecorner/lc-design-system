import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';
import { ChipComponent, type ChipVariant } from './chip.component';

/**
 * lc-chip on a hero band and the two new variants (3.40, request 060,
 * life-os G-HV4, AC-13 to AC-16, design D-4/D-5). The palette is CSS only:
 * these tests pin the rules (contrast: `theme-contrast.spec.ts`, 3.40 block;
 * the look: the stories *On Hero Bands*, *On Light Hero*).
 */
const chipCss = '\n' + compile(resolve(__dirname, 'chip.component.scss')).css;
const heroCss = '\n' + compile(resolve(__dirname, '../hero/hero.component.scss')).css;

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(css: string, selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect([selector, start > -1]).toEqual([selector, true]);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
}

@Component({
  imports: [ChipComponent, HeroComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-chip variant="primary">Off band</lc-chip>
    <lc-hero title="Bereiche">
      <lc-chip variant="primary">On band</lc-chip>
      <lc-chip variant="emphasis">Emphasis</lc-chip>
      <lc-chip variant="quiet" [clickable]="true">Quiet</lc-chip>
    </lc-hero>
  `,
})
class HeroHostComponent {}

const strip = (html: string) => html.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');

describe('lc-chip on a hero band and the emphasis / quiet variants (3.40, G-HV4)', () => {
  describe('AC-15, AC-16: the DOM', () => {
    it('emphasis and quiet are variant classes; a chip in a hero has the same markup as outside', () => {
      const fixture = TestBed.createComponent(HeroHostComponent);
      fixture.detectChanges();
      const chips = [...(fixture.nativeElement as HTMLElement).querySelectorAll('lc-chip')].map((c) => c.firstElementChild as HTMLElement);
      // Sorted: jsdom lists a `[class]` binding's classes in sorted order.
      expect(chips.map((c) => [...c.classList].sort().join(' '))).toEqual([
        'lc-chip lc-chip--md lc-chip--primary',
        'lc-chip lc-chip--md lc-chip--primary',
        'lc-chip lc-chip--emphasis lc-chip--md',
        'lc-chip lc-chip--clickable lc-chip--md lc-chip--quiet',
      ]);
      expect(strip(chips[1].outerHTML).replace('On band', 'Off band')).toBe(strip(chips[0].outerHTML));
    });

    it('the variant type lists the two new values', () => {
      const values: ChipVariant[] = ['default', 'primary', 'success', 'warning', 'error', 'info', 'emphasis', 'quiet'];
      expect(values).toHaveLength(8);
    });
  });

  describe('AC-15: the hooks win from the chip or any ancestor', () => {
    it('the base rule reads each public hook before the private variant value', () => {
      const base = chipCss.slice(chipCss.indexOf('\n.lc-chip {', chipCss.indexOf('\n.lc-chip--lg {')));
      expect(rule(base, '.lc-chip')).toBe(
        'background-color: var(--lc-chip-bg, var(--_lc-chip-bg)); color: var(--lc-chip-fg, var(--_lc-chip-fg)); ' +
          'border: 1px solid var(--lc-chip-border, var(--_lc-chip-border, transparent));',
      );
      expect(rule(chipCss, '.lc-chip')).toContain('--_lc-chip-gap: 0.375rem; gap: var(--lc-chip-gap, var(--_lc-chip-gap));');
      expect(rule(chipCss, '.lc-chip__content')).toContain('gap: var(--lc-chip-gap, var(--_lc-chip-gap));');
    });

    it('the chip never declares a public hook (020)', () => {
      expect(chipCss).not.toMatch(/--lc-chip-[\w-]+\s*:/);
    });
  });

  describe('AC-16: every 3.39 variant keeps its colours (now private)', () => {
    it.each([
      ['default', 'var(--color-surface-hover)', 'var(--color-text-secondary)', 'var(--color-border)'],
      ['primary', 'var(--color-primary-subtle)', 'var(--color-on-primary-subtle)', 'var(--color-border-strong)'],
      ['success', 'var(--color-success-subtle)', 'var(--color-on-success-subtle)', 'rgba(142, 164, 117, 0.4)'],
      ['warning', 'var(--color-warning-subtle)', 'var(--color-on-warning-subtle)', 'rgba(225, 160, 64, 0.4)'],
      ['error', 'var(--color-error-subtle)', 'var(--color-on-error-subtle)', 'rgba(157, 14, 14, 0.4)'],
      ['info', 'var(--color-info-subtle)', 'var(--color-on-info-subtle)', 'rgba(59, 101, 136, 0.42)'],
      ['emphasis', 'var(--color-primary-fill)', 'var(--color-on-primary)', 'transparent'],
      ['quiet', 'transparent', 'var(--color-text-secondary)', 'var(--color-border)'],
    ])('%s', (variant, bg, fg, border) => {
      expect(rule(chipCss, `.lc-chip--${variant}`)).toBe(`--_lc-chip-bg: ${bg}; --_lc-chip-fg: ${fg}; --_lc-chip-border: ${border};`);
    });

    it('sizes keep their gaps', () => {
      expect(rule(chipCss, '.lc-chip--sm')).toContain('--_lc-chip-gap: 0.25rem;');
      expect(rule(chipCss, '.lc-chip--lg')).toContain('--_lc-chip-gap: 0.5rem;');
    });

    it('an interactive quiet chip draws its boundary in the field border; hovered it fills, the border stays', () => {
      expect(rule(chipCss, '.lc-chip--quiet.lc-chip--clickable')).toBe('--_lc-chip-border: var(--color-field-border);');
      expect(rule(chipCss, '.lc-chip--quiet.lc-chip--clickable:hover:not(:disabled)')).toBe(
        'background-color: var(--color-surface-hover); border-color: var(--lc-chip-border, var(--_lc-chip-border));',
      );
    });
  });

  describe('AC-13: in lc-hero', () => {
    it('emphasis fills with the band\'s dark stop and white ink; quiet takes the band\'s ink', () => {
      expect(rule(chipCss, ':host-context(lc-hero) .lc-chip--emphasis')).toBe(
        '--_lc-chip-bg: var(--_lc-hero-band-from); --_lc-chip-fg: #fff; --_lc-chip-border: color-mix(in srgb, var(--_lc-hero-ink) 24%, transparent);',
      );
      expect(rule(chipCss, ':host-context(lc-hero) .lc-chip--quiet')).toBe(
        '--_lc-chip-bg: transparent; --_lc-chip-fg: var(--_lc-hero-ink); --_lc-chip-border: color-mix(in srgb, var(--_lc-hero-ink) 32%, transparent);',
      );
      expect(rule(chipCss, ':host-context(lc-hero) .lc-chip--quiet.lc-chip--clickable')).toBe('--_lc-chip-border: var(--_lc-hero-ink);');
      expect(rule(chipCss, ':host-context(lc-hero) .lc-chip--quiet.lc-chip--clickable:hover:not(:disabled)')).toBe(
        'background-color: var(--_lc-hero-glass);',
      );
    });

    it('the focus ring is the hero title\'s two-tone ring', () => {
      expect(rule(chipCss, ':host-context(lc-hero) .lc-chip--clickable:focus-visible,\n:host-context(lc-hero) .lc-chip__action:focus-visible')).toBe(
        'outline-color: var(--_lc-hero-ink); box-shadow: 0 0 0 2px var(--_lc-hero-ring-gap);',
      );
    });

    it('the hero publishes ink, glass and ring gap (dark bands, light variant) and each band\'s dark stop', () => {
      expect(rule(heroCss, '.hero')).toContain('--_lc-hero-ink: #fff; --_lc-hero-glass: rgba(17, 24, 39, 0.24); --_lc-hero-ring-gap: #111827;');
      expect(rule(heroCss, '.hero--light')).toContain('--_lc-hero-ink: #1f2937; --_lc-hero-glass: rgba(255, 255, 255, 0.5); --_lc-hero-ring-gap: #fff;');
      const bands = [...heroCss.matchAll(/\n\.hero--([\w-]+) \{\s*background: linear-gradient\(135deg, (#[0-9a-f]{6}) 0%, #[0-9a-f]{6} 100%\);\s*--_lc-hero-band-from: (#[0-9a-f]{6});\s*\}/gi)];
      expect(bands.map((m) => m[1])).toEqual(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet']);
      for (const [, , from, published] of bands) expect(published).toBe(from);
    });

    it('the private properties paint nothing in the hero', () => {
      for (const name of ['ink', 'glass', 'ring-gap', 'band-from']) {
        const uses = [...heroCss.matchAll(new RegExp(`var\\(--_lc-hero-${name}`, 'g'))];
        expect([name, uses.length]).toEqual([name, 0]);
      }
    });
  });
});
