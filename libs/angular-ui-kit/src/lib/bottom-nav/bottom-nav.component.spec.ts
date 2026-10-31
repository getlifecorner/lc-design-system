import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { BottomNavComponent, BottomNavItem } from './bottom-nav.component';

const today: BottomNavItem = { id: 'today', label: 'Heute', icon: 'sun', route: '/' };
const household: BottomNavItem = { id: 'household', label: 'Haushalt', icon: 'home', route: '/household' };

function areas(count: number): BottomNavItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `area-${i + 1}`,
    label: `Area ${i + 1}`,
    icon: 'folder',
    route: `/area-${i + 1}`,
  }));
}

describe('BottomNavComponent', () => {
  let fixture: ComponentFixture<BottomNavComponent>;
  let el: HTMLElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const links = () => Array.from(el.querySelectorAll<HTMLAnchorElement>('a.lc-bottom-nav__item'));
  const labels = () => Array.from(el.querySelectorAll('.lc-bottom-nav__label')).map((n) => n.textContent?.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    el = fixture.nativeElement;
  });

  describe('structure (AS-1)', () => {
    beforeEach(() => set({ items: [today, household], activeRoute: '/' }));

    it('renders a labelled nav with a list of links', () => {
      const nav = el.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
      expect(nav?.querySelector('ul > li > a')).toBeTruthy();
      expect(el.querySelectorAll('li')).toHaveLength(2);
      expect(el.querySelector('[role="tablist"], [role="tab"]')).toBeNull();
    });

    it('takes a translated landmark label', () => {
      set({ ariaLabel: 'Hauptnavigation' });
      expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Hauptnavigation');
    });

    it('links each item to its route', () => {
      expect(links().map((a) => a.getAttribute('href'))).toEqual(['/', '/household']);
    });

    it('always shows the label next to a decorative icon', () => {
      expect(labels()).toEqual(['Heute', 'Haushalt']);
      expect(el.querySelector('lc-icon')?.closest('[aria-hidden="true"]')).toBeTruthy();
    });

    it('sorts by displayOrder when given and keeps array order otherwise', () => {
      set({ items: [{ ...household, displayOrder: 2 }, { ...today, displayOrder: 1 }] });
      expect(labels()).toEqual(['Heute', 'Haushalt']);
    });
  });

  describe('current item', () => {
    it('marks exactly one item with aria-current="page"', () => {
      set({ items: [today, household], activeRoute: '/household' });
      const current = el.querySelectorAll('[aria-current="page"]');
      expect(current).toHaveLength(1);
      expect(current[0].textContent).toContain('Haushalt');
      expect(current[0].classList).toContain('lc-bottom-nav__item--current');
    });

    it('follows the first path segment, ignoring query and fragment', () => {
      set({ items: [today, household], activeRoute: '/household/members?x=1#invitation' });
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Haushalt');
    });

    it('matches "/" only on the start page', () => {
      set({ items: [today, household], activeRoute: '/settings' });
      expect(el.querySelector('[aria-current="page"]')).toBeNull();
      set({ activeRoute: '/' });
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Heute');
    });

    it('does not match a route that only shares a prefix', () => {
      set({ items: [household], activeRoute: '/households' });
      expect(el.querySelector('[aria-current="page"]')).toBeNull();
    });

    it('emits reselect when the current item is tapped again', () => {
      set({ items: [today, household], activeRoute: '/' });
      const spy = jest.fn();
      fixture.componentInstance.reselect.subscribe(spy);
      links()[1].click();
      expect(spy).not.toHaveBeenCalled();
      links()[0].click();
      expect(spy).toHaveBeenCalledWith(today);
    });
  });

  describe('overflow ("More")', () => {
    it('shows all items up to maxItems', () => {
      set({ items: [today, ...areas(3), household] });
      expect(labels()).toEqual(['Heute', 'Area 1', 'Area 2', 'Area 3', 'Haushalt']);
    });

    it('keeps maxItems − 1 items and adds "More" from the sixth destination on', () => {
      set({ items: [today, ...areas(4), household], moreRoute: '/more', moreLabel: 'Mehr' });
      expect(labels()).toEqual(['Heute', 'Area 1', 'Area 2', 'Area 3', 'Mehr']);
      expect(links()[4].getAttribute('href')).toBe('/more');
    });

    it('marks "More" current on the more page and on any hidden destination', () => {
      set({ items: [today, ...areas(4), household], moreRoute: '/more', activeRoute: '/household' });
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('More');
      set({ activeRoute: '/more' });
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('More');
    });

    it('renders "More" as a button that emits moreClick without a moreRoute', () => {
      set({ items: [today, ...areas(4), household], maxItems: 5 });
      const button = el.querySelector<HTMLButtonElement>('button.lc-bottom-nav__item');
      expect(button?.getAttribute('type')).toBe('button');
      const spy = jest.fn();
      fixture.componentInstance.moreClick.subscribe(spy);
      button?.click();
      expect(spy).toHaveBeenCalled();
    });

    it('honours a smaller maxItems', () => {
      set({ items: [today, ...areas(2), household], maxItems: 3, moreRoute: '/more' });
      expect(labels()).toEqual(['Heute', 'Area 1', 'More']);
    });
  });

  describe('"More" on request (showMore, request 023)', () => {
    const moreEntries = () =>
      Array.from(el.querySelectorAll('.lc-bottom-nav__item')).filter((n) => n.textContent?.includes('More'));

    it('is off by default and renders exactly as before without it (AC-1)', () => {
      expect(fixture.componentInstance.showMore()).toBe(false);
      set({ items: [today, household], moreRoute: '/more', activeRoute: '/more' });
      expect(el.querySelectorAll('li')).toHaveLength(2);
      expect(labels()).toEqual(['Heute', 'Haushalt']);
      expect(el.querySelector('button')).toBeNull();
      set({ items: [today, ...areas(3), household], showMore: false });
      expect(labels()).toEqual(['Heute', 'Area 1', 'Area 2', 'Area 3', 'Haushalt']);
    });

    it('adds "More" after two destinations at the default maxItems (AC-2)', () => {
      set({ items: [today, household], showMore: true, moreRoute: '/more', activeRoute: '/' });
      expect(el.querySelectorAll('li')).toHaveLength(3);
      expect(labels()).toEqual(['Heute', 'Haushalt', 'More']);
      expect(links().map((a) => a.getAttribute('href'))).toEqual(['/', '/household', '/more']);
    });

    it('lets "More" take one of the maxItems entries and never renders two (AC-3, D2)', () => {
      set({ items: areas(4), showMore: true, moreRoute: '/more' });
      expect(labels()).toEqual(['Area 1', 'Area 2', 'Area 3', 'Area 4', 'More']);
      expect(moreEntries()).toHaveLength(1);

      set({ items: areas(5), activeRoute: '/area-5' });
      expect(labels()).toEqual(['Area 1', 'Area 2', 'Area 3', 'Area 4', 'More']);
      expect(moreEntries()).toHaveLength(1);
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('More');

      set({ items: areas(6), activeRoute: '/' });
      expect(labels()).toEqual(['Area 1', 'Area 2', 'Area 3', 'Area 4', 'More']);
      expect(moreEntries()).toHaveLength(1);

      set({ items: areas(3), maxItems: 3 });
      expect(labels()).toEqual(['Area 1', 'Area 2', 'More']);
      expect(moreEntries()).toHaveLength(1);
    });

    it('renders only "More" without destinations, and nothing without showMore', () => {
      set({ items: [], showMore: true, moreRoute: '/more' });
      expect(labels()).toEqual(['More']);
      set({ showMore: false });
      expect(el.querySelectorAll('li')).toHaveLength(0);
    });

    it('takes moreLabel, moreIcon and moreRoute (AC-4)', () => {
      set({ items: [today, household], showMore: true, moreLabel: 'Mehr', moreIcon: 'bars-3', moreRoute: '/mehr' });
      const more = el.querySelector<HTMLAnchorElement>('a[href="/mehr"]');
      expect(more?.textContent?.trim()).toBe('Mehr');
      const icons = fixture.debugElement.queryAll(By.directive(IconComponent));
      expect(icons.map((icon) => icon.componentInstance.name())).toEqual(['sun', 'home', 'bars-3']);
    });

    it('is a button that emits moreClick once without a moreRoute, and never current (AC-4)', () => {
      set({ items: [today, household], showMore: true, activeRoute: '/settings' });
      const button = el.querySelector<HTMLButtonElement>('button.lc-bottom-nav__item');
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.textContent?.trim()).toBe('More');
      expect(button?.classList).not.toContain('lc-bottom-nav__item--current');
      expect(el.querySelector('[aria-current="page"]')).toBeNull();
      const spy = jest.fn();
      fixture.componentInstance.moreClick.subscribe(spy);
      button?.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('is the one current entry on moreRoute and its sub-pages, not elsewhere (AC-5)', () => {
      set({ items: [today, household], showMore: true, moreLabel: 'Mehr', moreRoute: '/mehr' });
      for (const activeRoute of ['/mehr', '/mehr/quellen']) {
        set({ activeRoute });
        const current = el.querySelectorAll('[aria-current="page"]');
        expect(current).toHaveLength(1);
        expect(current[0].textContent?.trim()).toBe('Mehr');
        expect(current[0].classList).toContain('lc-bottom-nav__item--current');
        expect(el.querySelectorAll('.lc-bottom-nav__item--current')).toHaveLength(1);
      }
      set({ activeRoute: '/' });
      const current = el.querySelectorAll('[aria-current="page"]');
      expect(current).toHaveLength(1);
      expect(current[0].textContent?.trim()).toBe('Heute');
    });

    it('does not emit reselect when the current "More" is tapped again', () => {
      set({ items: [today, household], showMore: true, moreRoute: '/more', activeRoute: '/more' });
      // provideRouter([]) has no '/more' route: keep the link's navigation from rejecting.
      jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const spy = jest.fn();
      fixture.componentInstance.reselect.subscribe(spy);
      links()[2].click();
      expect(spy).not.toHaveBeenCalled();
    });

    it('is a native link or button named by its label only, with the icon hidden (AC-7)', () => {
      set({ items: [today, household], showMore: true, moreRoute: '/more' });
      const link = links()[2];
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/more');
      expect(link.getAttribute('tabindex')).toBeNull();
      expect(link.textContent?.trim()).toBe('More');
      expect(link.querySelector('.lc-bottom-nav__pill')?.getAttribute('aria-hidden')).toBe('true');
      const svg = link.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('role')).toBe(false);

      set({ moreRoute: '' });
      const button = el.querySelector<HTMLButtonElement>('li:last-child > button');
      expect(button?.tagName).toBe('BUTTON');
      expect(button?.getAttribute('tabindex')).toBeNull();
      expect(button?.textContent?.trim()).toBe('More');
      expect(button?.querySelector('.lc-bottom-nav__pill')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('badges', () => {
    it('shows the badge visually and reads it through badgeAriaLabel', () => {
      set({
        items: [{ ...household, badge: { value: 3, variant: 'primary' } }],
        badgeAriaLabel: '{value} neu',
      });
      const badge = el.querySelector('.lc-bottom-nav__badge');
      expect(badge?.closest('[aria-hidden="true"]')).toBeTruthy();
      expect(badge?.textContent?.trim()).toBe('3');
      expect(el.querySelector('.lc-bottom-nav__sr-only')?.textContent?.trim()).toBe('3 neu');
    });

    it('renders no badge text without a badge', () => {
      set({ items: [household] });
      expect(el.querySelector('.lc-bottom-nav__badge')).toBeNull();
      expect(el.querySelector('.lc-bottom-nav__sr-only')).toBeNull();
    });
  });

  describe('variants and position', () => {
    it('is docked and fixed by default', () => {
      set({ items: [today] });
      const nav = el.querySelector('nav');
      expect(nav?.classList).toContain('lc-bottom-nav--docked');
      expect(nav?.classList).toContain('lc-bottom-nav--fixed');
    });

    it('renders the floating variant (LK-5)', () => {
      set({ items: [today], variant: 'floating' });
      expect(el.querySelector('nav')?.classList).toContain('lc-bottom-nav--floating');
    });

    it('renders in flow when fixed is off', () => {
      set({ items: [today], fixed: false });
      expect(el.querySelector('nav')?.classList).not.toContain('lc-bottom-nav--fixed');
    });
  });

  describe('styles (source contract)', () => {
    const scss = readFileSync(resolve(__dirname, 'bottom-nav.component.scss'), 'utf-8');

    it('gives items 64 × 64 px where the bar has room (AS-1: ≥ 48 × 64)', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__item \{[^}]*min-width: min\(64px, 100%\);[^}]*min-height: 64px;/s);
    });

    it('draws the 56 × 32 px pill', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__pill \{[^}]*width: 56px;[^}]*height: 32px;/s);
    });

    it('pads the safe-area inset (docked) and floats 16 px above it (floating)', () => {
      expect(scss).toMatch(/padding-bottom: env\(safe-area-inset-bottom/);
      expect(scss).toMatch(/bottom: calc\(16px \+ env\(safe-area-inset-bottom/);
      expect(scss).toMatch(/border-radius: 28px/);
    });

    it('stays below dialogs (lc-modal 999) and menus', () => {
      expect(scss).toMatch(/z-index: var\(--lc-bottom-nav-z, 900\)/);
    });

    it('turns transitions off under reduced motion', () => {
      expect(scss).toMatch(/prefers-reduced-motion: reduce\) \{\s*transition: none/);
    });

    // 3.10.1 (AS-31): `break-word` → `anywhere` (AC-6 asks for it): a word wider
    // than its column still breaks, and the label no longer counts in the
    // item's minimum width, so it can't widen the bar.
    it('lets the label wrap instead of clipping', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__label \{[^}]*overflow-wrap: anywhere/s);
      expect(scss).not.toMatch(/\.lc-bottom-nav__label \{[^}]*white-space: nowrap/s);
    });

    it('top-aligns the item content so every pill sits 6 px below the item top (AS-31)', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__item \{[^}]*justify-content: flex-start;/s);
      expect(scss).toMatch(/\.lc-bottom-nav__item \{[^}]*padding-block: 6px 2px;[^}]*padding-inline: 0;/s);
      expect(scss).not.toMatch(/\.lc-bottom-nav__item \{[^}]*justify-content: center;/s);
    });

    it('lets the label reach 8 px into its neighbours at 100 % text and keeps a 4 px gutter from 150 % (AS-31)', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__label \{[^}]*--_reach: clamp\(-4px, 32px - 1\.5rem, 8px\);/s);
      expect(scss).toMatch(/\.lc-bottom-nav__label \{[^}]*max-width: calc\(100% \+ var\(--_reach\)\);/s);
      expect(scss).toMatch(/\.lc-bottom-nav__label \{[^}]*margin-inline: calc\(var\(--_reach\) \/ -2\);/s);
    });

    it('keeps the pill inside its column (54 px with five floating items at 320 px)', () => {
      expect(scss).toMatch(/\.lc-bottom-nav__pill \{[^}]*width: 56px;[^}]*max-width: 100%;/s);
    });
  });
});
