import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { resolve } from 'path';
import { BottomNavComponent, type BottomNavItem } from './bottom-nav.component';

/**
 * 3.32 (request 051, 050-f1, WCAG 1.4.3): a badge on the *current* pill gets
 * the bar colour under its own translucent fill, so it reads like a badge on
 * the bar (dark warning 4.03 → 5.17 floating, 4.26 → 5.55 docked). Badges off
 * the current pill keep their single fill. Design 051 §1 A, D-1, §9; AC-1, AC-2.
 */
const css = compile(resolve(__dirname, 'bottom-nav.component.scss')).css;
const SELECTOR = '.lc-bottom-nav__item--current .lc-bottom-nav__badge ::ng-deep .lc-badge';

/** Declarations of the rule whose selector is exactly `selector` (anchored at a line start). */
function declarations(selector: string): string[] {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  return css
    .slice(open + 1, css.indexOf('}', open))
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean);
}

const cockpit: BottomNavItem = { id: 'cockpit', label: 'Cockpit', icon: 'presentation-chart-line', route: '/cockpit' };
const kosten: BottomNavItem = {
  id: 'kosten',
  label: 'Kosten',
  icon: 'banknotes',
  route: '/kosten',
  badge: { value: 2, variant: 'primary' },
};

describe('BottomNavComponent badge on the current pill (3.32, request 051)', () => {
  describe('styles (compiled CSS)', () => {
    it('AC-1: lays the badge fill over the bar colour, read from --lc-bottom-nav-bg, else the bar', () => {
      expect(declarations(SELECTOR)).toEqual([
        'background-image: linear-gradient(var(--lc-badge-bg), var(--lc-badge-bg))',
        'background-color: var(--lc-bottom-nav-bg, var(--_bg))',
      ]);
    });

    it('AC-2: is the only rule that reaches the inner .lc-badge, and only on the current item', () => {
      const badgeRules = [...css.matchAll(/(^|\n)([^\n{}]*\.lc-badge[^\n{}]*)\{/g)].map((m) => m[2].trim());
      expect(badgeRules).toEqual([SELECTOR]);
    });

    it('uses the same bar colour as the bar itself', () => {
      expect(css).toMatch(/\n\.lc-bottom-nav \{[^}]*background-color: var\(--lc-bottom-nav-bg, var\(--_bg\)\);/);
    });
  });

  describe('which badge it reaches (DOM)', () => {
    let fixture: ComponentFixture<BottomNavComponent>;
    let el: HTMLElement;
    const matches = (badge: Element) => badge.matches(SELECTOR.replace('::ng-deep ', ''));

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BottomNavComponent],
        providers: [provideRouter([]), provideHttpClient(withXhr())],
      }).compileComponents();
      fixture = TestBed.createComponent(BottomNavComponent);
      el = fixture.nativeElement;
      fixture.componentRef.setInput('items', [cockpit, kosten]);
      fixture.componentRef.setInput('showMore', true);
      fixture.componentRef.setInput('moreRoute', '/mehr');
      fixture.componentRef.setInput('moreLabel', 'Mehr');
      fixture.componentRef.setInput('moreBadge', { value: 1, variant: 'warning' });
    });

    const badgeOf = (label: string): Element => {
      const item = Array.from(el.querySelectorAll('.lc-bottom-nav__item')).find(
        (i) => i.querySelector('.lc-bottom-nav__label')?.textContent?.trim() === label,
      );
      const badge = item?.querySelector('.lc-badge');
      expect(badge).toBeTruthy();
      return badge as Element;
    };

    it('AC-1: reaches the More badge when More is current, not the Kosten badge (AC-2)', () => {
      fixture.componentRef.setInput('activeRoute', '/mehr/stammdaten');
      fixture.detectChanges();
      expect(matches(badgeOf('Mehr'))).toBe(true);
      expect(matches(badgeOf('Kosten'))).toBe(false);
    });

    it('AC-1: reaches the Kosten badge when Kosten is current, not the More badge (AC-2)', () => {
      fixture.componentRef.setInput('activeRoute', '/kosten');
      fixture.detectChanges();
      expect(matches(badgeOf('Kosten'))).toBe(true);
      expect(matches(badgeOf('Mehr'))).toBe(false);
    });

    it('AC-2: reaches no badge when no badged item is current', () => {
      fixture.componentRef.setInput('activeRoute', '/cockpit');
      fixture.detectChanges();
      expect(Array.from(el.querySelectorAll('.lc-badge')).filter(matches)).toHaveLength(0);
      expect(el.querySelectorAll('.lc-badge')).toHaveLength(2);
    });
  });
});
