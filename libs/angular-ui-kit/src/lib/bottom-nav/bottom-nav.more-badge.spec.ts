import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { BottomNavComponent, type BottomNavBadge, type BottomNavItem } from './bottom-nav.component';

/**
 * 3.31 (request 050, Finance Intelligence spec 010, stammdaten-2026-11-05
 * row 1): the kit-made "More" entry takes a badge through `moreBadge`, drawn
 * and read like an item badge. Design 050 §1, §2, §6; AC-5, AC-6, AC-7, AC-12.
 */
const cockpit: BottomNavItem = { id: 'cockpit', label: 'Cockpit', icon: 'presentation-chart-line', route: '/cockpit' };
const kosten: BottomNavItem = { id: 'kosten', label: 'Kosten', icon: 'banknotes', route: '/kosten' };

function areas(count: number): BottomNavItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `area-${i + 1}`,
    label: `Area ${i + 1}`,
    icon: 'folder',
    route: `/area-${i + 1}`,
  }));
}

/** The texts a screen reader gets from an entry: every leaf outside `aria-hidden`, in order. */
function spokenParts(entry: Element): string[] {
  const parts: string[] = [];
  const walk = (node: Element) => {
    if (node.getAttribute('aria-hidden') === 'true') return;
    if (node.children.length === 0) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
      return;
    }
    for (const child of Array.from(node.children)) walk(child);
  };
  walk(entry);
  return parts;
}

/** Markup of an entry without the per-entry values (label, icon, badge text, route), to compare shapes. */
function shape(entry: Element): string {
  const tags = (node: Element): string =>
    `${node.tagName.toLowerCase()}.${Array.from(node.classList).sort().join('.')}${
      node.getAttribute('aria-hidden') ? '[aria-hidden]' : ''
    }(${Array.from(node.children)
      .filter((c) => c.tagName !== 'svg')
      .map(tags)
      .join(',')})`;
  return Array.from(entry.children).map(tags).join(',');
}

describe('BottomNavComponent moreBadge (3.31, request 050)', () => {
  let fixture: ComponentFixture<BottomNavComponent>;
  let el: HTMLElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const entries = () => Array.from(el.querySelectorAll<HTMLElement>('.lc-bottom-nav__item'));
  const more = () => entries()[entries().length - 1];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(BottomNavComponent);
    el = fixture.nativeElement;
  });

  describe('default: no moreBadge', () => {
    it('defaults to null', () => {
      expect(fixture.componentInstance.moreBadge()).toBeNull();
    });

    it('renders the More entry without badge or hidden text, as in 3.30 (AC-6)', () => {
      set({ items: [cockpit, kosten], showMore: true, moreRoute: '/mehr', moreLabel: 'Mehr' });
      expect(more().querySelector('.lc-bottom-nav__badge')).toBeNull();
      expect(more().querySelector('.lc-bottom-nav__sr-only')).toBeNull();
      expect(more().textContent?.trim()).toBe('Mehr');
      expect(shape(more())).toBe(
        'span.lc-bottom-nav__pill[aria-hidden](lc-icon.lc-bottom-nav__icon(div.icon-container.icon-md.icon-outline())),' +
          'span.lc-bottom-nav__label()',
      );
    });

    it('renders the same bar for null, undefined and unset', () => {
      set({ items: [cockpit, ...areas(5)], moreRoute: '/mehr' });
      const unset = el.innerHTML;
      set({ moreBadge: undefined });
      expect(el.innerHTML).toBe(unset);
      set({ moreBadge: null });
      expect(el.innerHTML).toBe(unset);
    });
  });

  describe('AC-5: the badge on the More entry', () => {
    const badge: BottomNavBadge = { value: 3, variant: 'primary' };

    it('shows it on overflow, with the markup and classes of an item badge', () => {
      set({
        items: [{ ...cockpit, badge: { value: 2, variant: 'primary' } }, ...areas(5)],
        moreRoute: '/more',
        moreBadge: badge,
      });
      expect(entries()).toHaveLength(5);
      const host = more().querySelector('.lc-bottom-nav__pill > .lc-bottom-nav__badge');
      const lcBadge = host?.querySelector('lc-badge');
      expect(lcBadge?.textContent?.trim()).toBe('3');
      expect(lcBadge?.querySelector('.lc-badge')?.className).toBe(
        entries()[0].querySelector('.lc-bottom-nav__badge lc-badge .lc-badge')?.className,
      );
      expect(lcBadge?.querySelector('.lc-badge')?.classList).toContain('lc-badge--primary');
      expect(lcBadge?.querySelector('.lc-badge')?.classList).toContain('lc-badge--xs');
      expect(lcBadge?.querySelector('.lc-badge')?.classList).toContain('lc-badge--rounded');
      expect(shape(more())).toBe(shape(entries()[0]));
    });

    it('shows it with showMore on a button More entry too', () => {
      set({ items: [cockpit, kosten], showMore: true, moreBadge: { value: 1, variant: 'warning' } });
      const button = more();
      expect(button.tagName).toBe('BUTTON');
      expect(button.querySelector('.lc-bottom-nav__badge lc-badge')?.textContent?.trim()).toBe('1');
      expect(button.querySelector('.lc-badge')?.classList).toContain('lc-badge--warning');
    });

    it('draws the default variant without one', () => {
      set({ items: [cockpit, kosten], showMore: true, moreRoute: '/mehr', moreBadge: { value: '9+' } });
      expect(more().querySelector('.lc-badge')?.classList).toContain('lc-badge--default');
      expect(more().querySelector('lc-badge')?.textContent?.trim()).toBe('9+');
    });

    it('shows the value 0, as item badges do', () => {
      set({ items: [cockpit, kosten], showMore: true, moreRoute: '/mehr', moreBadge: { value: 0 } });
      expect(more().querySelector('lc-badge')?.textContent?.trim()).toBe('0');
    });

    it('adds nothing when every destination fits and showMore is off', () => {
      set({ items: [cockpit, kosten], moreBadge: badge });
      expect(entries()).toHaveLength(2);
      expect(el.querySelector('.lc-bottom-nav__badge')).toBeNull();
    });

    it('goes away when moreBadge is reset to null', () => {
      set({ items: [cockpit, kosten], showMore: true, moreRoute: '/mehr', moreBadge: badge });
      expect(more().querySelector('.lc-bottom-nav__badge')).not.toBeNull();
      set({ moreBadge: null });
      expect(more().querySelector('.lc-bottom-nav__badge')).toBeNull();
      expect(more().querySelector('.lc-bottom-nav__sr-only')).toBeNull();
    });
  });

  describe('AC-6: the hidden badge text', () => {
    it('reads badgeAriaLabel after the More label; the badge stays aria-hidden', () => {
      set({
        items: [cockpit, kosten],
        showMore: true,
        moreLabel: 'Mehr',
        moreRoute: '/mehr',
        moreBadge: { value: 1, variant: 'warning' },
        badgeAriaLabel: '{value} offen',
      });
      const link = more();
      expect(link.getAttribute('href')).toBe('/mehr');
      expect(link.querySelector('.lc-bottom-nav__sr-only')?.textContent).toBe('1 offen');
      expect(link.querySelector('.lc-bottom-nav__badge')?.closest('[aria-hidden="true"]')).toBe(
        link.querySelector('.lc-bottom-nav__pill'),
      );
      expect(spokenParts(link)).toEqual(['Mehr', '1 offen']);
    });

    it('uses the default "{value} new"', () => {
      set({ items: [cockpit, ...areas(5)], moreRoute: '/more', moreBadge: { value: 3, variant: 'primary' } });
      expect(spokenParts(more())).toEqual(['More', '3 new']);
    });

    it('builds the More text like an item text (same span, same class)', () => {
      set({
        items: [{ ...cockpit, badge: { value: 2 } }, ...areas(5)],
        moreRoute: '/more',
        moreBadge: { value: 3 },
        badgeAriaLabel: '{value} neu',
      });
      const texts = Array.from(el.querySelectorAll('.lc-bottom-nav__sr-only')).map((n) => n.textContent);
      expect(texts).toEqual(['2 neu', '3 neu']);
      expect(spokenParts(entries()[0])).toEqual(['Cockpit', '2 neu']);
    });
  });

  describe('AC-7: no summing', () => {
    it('shows only the moreBadge value, not the hidden destinations’ badges', () => {
      const hidden = areas(5).map((item, i) => ({ ...item, badge: { value: i + 1 } }));
      set({ items: [cockpit, ...hidden], moreRoute: '/more', moreBadge: { value: 4, variant: 'primary' } });
      expect(entries().map((e) => e.querySelector('.lc-bottom-nav__label')?.textContent?.trim())).toEqual([
        'Cockpit',
        'Area 1',
        'Area 2',
        'Area 3',
        'More',
      ]);
      expect(more().querySelector('lc-badge')?.textContent?.trim()).toBe('4');
      expect(more().querySelector('.lc-bottom-nav__sr-only')?.textContent).toBe('4 new');
    });

    it('shows no badge on More when only the hidden destinations have one', () => {
      const hidden = areas(5).map((item) => ({ ...item, badge: { value: 7 } }));
      set({ items: [cockpit, ...hidden], moreRoute: '/more' });
      expect(more().querySelector('.lc-bottom-nav__badge')).toBeNull();
      expect(more().querySelector('.lc-bottom-nav__sr-only')).toBeNull();
    });
  });

  describe('AC-12: keyboard', () => {
    it('keeps the badged More entry one tab stop, current state unchanged', () => {
      set({
        items: [cockpit, kosten],
        showMore: true,
        moreRoute: '/mehr',
        activeRoute: '/mehr',
        moreBadge: { value: 3, variant: 'primary' },
      });
      const link = more();
      expect(link.getAttribute('tabindex')).toBeNull();
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(link.classList).toContain('lc-bottom-nav__item--current');
      expect(link.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
    });
  });
});
