import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { resolve } from 'path';
import { SidenavComponent } from './sidenav.component';
import { NavigationItem } from '../models/navigation-item.interface';
import { computedName } from '../../testing/axe-jsdom';

// JSDOM has no matchMedia; `mobile` flips what the sidenav reads for its breakpoint.
let mobile = false;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * 3.31 (request 050, Finance Intelligence spec 010, stammdaten-2026-11-05
 * row 2): every badged item reads its badge through `badgeAriaLabel` from a
 * visually hidden span; the `lc-badge` is out of the accessibility tree. On
 * the collapsed rail the span starts with the label (D-2). Design 050 §1, §6;
 * AC-8, AC-9, AC-11, AC-12.
 *
 * The six badge sites of `sidenav.component.html`: simple item (`a`), top-level
 * parent (`button`), child of a top-level parent (`a`), section child (`a`),
 * section child with children (`button`), its grandchild (`a`).
 */
const items: NavigationItem[] = [
  { id: 'cockpit', icon: 'home', label: 'Cockpit', route: '/cockpit', displayOrder: 1 },
  {
    id: 'zuordnungen',
    icon: 'clipboard-document-list',
    label: 'Offene Zuordnungen',
    route: '/zuordnungen',
    displayOrder: 2,
    badge: { value: 12, variant: 'warning' },
  },
  {
    id: 'stammdaten',
    icon: 'folder',
    label: 'Stammdaten',
    route: '',
    displayOrder: 3,
    badge: { value: 1, variant: 'warning' },
    children: [
      {
        id: 'konten',
        icon: 'building-bank',
        label: 'Konten',
        route: '/stammdaten/konten',
        displayOrder: 1,
        badge: { value: 1, variant: 'warning' },
      },
      { id: 'kostenstellen', icon: 'calculator', label: 'Kostenstellen', route: '/stammdaten/kostenstellen', displayOrder: 2 },
    ],
  },
  {
    id: 'bereiche',
    icon: '',
    label: 'Bereiche',
    route: '',
    displayOrder: 4,
    isSection: true,
    children: [
      {
        id: 'finanzen',
        icon: 'wallet',
        label: 'Finanzen',
        route: '/finanzen',
        displayOrder: 1,
        badge: { value: 3, variant: 'primary' },
      },
      {
        id: 'banken',
        icon: 'building-bank',
        label: 'Banken',
        route: '',
        displayOrder: 2,
        badge: { value: 2, variant: 'error' },
        children: [
          {
            id: 'auszuege',
            icon: 'document-text',
            label: 'Kontoauszüge',
            route: '/banken/auszuege',
            displayOrder: 1,
            badge: { value: 2, variant: 'error' },
          },
        ],
      },
    ],
  },
];

describe('SidenavComponent badgeAriaLabel (3.31, request 050)', () => {
  let fixture: ComponentFixture<SidenavComponent>;
  let el: HTMLElement;

  function render(inputs: Record<string, unknown>): HTMLElement {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return el;
  }

  const docked = { mode: 'docked', isOpen: true, width: '240px', items, activeRoute: '/stammdaten/konten' };

  /** The link or button of the item labelled `label`. */
  const entry = (label: string): HTMLElement => {
    const labelEl = Array.from(el.querySelectorAll('.lc-sidenav__nav-label')).find((n) => n.textContent === label);
    if (!labelEl) throw new Error(`no item "${label}"`);
    return labelEl.closest('a, button') as HTMLElement;
  };
  const srText = (label: string) => entry(label).querySelector('.lc-sidenav__sr-only')?.textContent ?? null;
  const name = (label: string) => computedName(el, entry(label));
  /** Opens the section group "Banken", so its grandchild renders. */
  const openBanken = () => {
    entry('Banken').click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mobile = false;
    await TestBed.configureTestingModule({
      imports: [SidenavComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(SidenavComponent);
    el = fixture.nativeElement;
  });

  afterEach(() => fixture.destroy());

  describe('AC-8: the input', () => {
    it("defaults to '{value}' (D-1)", () => {
      expect(fixture.componentInstance.badgeAriaLabel()).toBe('{value}');
    });
  });

  describe('AC-8: every badge site, expanded', () => {
    beforeEach(() => {
      render({ ...docked, badgeAriaLabel: '{value} offen' });
      openBanken();
    });

    it.each([
      { site: 'simple item (a)', label: 'Offene Zuordnungen', tag: 'A', text: '12 offen' },
      { site: 'top-level parent (button)', label: 'Stammdaten', tag: 'BUTTON', text: '1 offen' },
      { site: 'child of a top-level parent (a)', label: 'Konten', tag: 'A', text: '1 offen' },
      { site: 'section child (a)', label: 'Finanzen', tag: 'A', text: '3 offen' },
      { site: 'section child with children (button)', label: 'Banken', tag: 'BUTTON', text: '2 offen' },
      { site: 'grandchild (a)', label: 'Kontoauszüge', tag: 'A', text: '2 offen' },
    ])('$site: hidden text "$text", badge aria-hidden, name "$label $text"', ({ label, tag, text }) => {
      const target = entry(label);
      expect(target.tagName).toBe(tag);
      expect(srText(label)).toBe(text);
      const badges = target.querySelectorAll('lc-badge');
      expect(badges).toHaveLength(1);
      expect(badges[0].getAttribute('aria-hidden')).toBe('true');
      expect(badges[0].classList).toContain('lc-sidenav__nav-badge');
      expect(name(label)).toBe(`${label} ${text}`);
    });

    it('renders one hidden span per badge, six in all', () => {
      expect(el.querySelectorAll('lc-badge')).toHaveLength(6);
      expect(el.querySelectorAll('lc-badge[aria-hidden="true"]')).toHaveLength(6);
      expect(el.querySelectorAll('.lc-sidenav__nav-item .lc-sidenav__sr-only')).toHaveLength(6);
    });
  });

  describe('AC-8: default text, empty text, values', () => {
    it("reads the badge value alone by default, as before ('{value}')", () => {
      render(docked);
      expect(srText('Offene Zuordnungen')).toBe('12');
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen 12');
      expect(name('Finanzen')).toBe('Finanzen 3');
    });

    it('reads a text badge once (no "New new")', () => {
      render({ ...docked, items: [{ ...items[0], badge: { value: 'New', variant: 'success' } }] });
      expect(name('Cockpit')).toBe('Cockpit New');
    });

    it("silences the badge with ''", () => {
      render({ ...docked, badgeAriaLabel: '' });
      expect(srText('Offene Zuordnungen')).toBe('');
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen');
    });

    it('reads the value 0', () => {
      render({ ...docked, badgeAriaLabel: '{value} offen', items: [{ ...items[1], badge: { value: 0 } }] });
      expect(srText('Offene Zuordnungen')).toBe('0 offen');
    });

    it('replaces the first {value} only, as lc-bottom-nav does', () => {
      render({ ...docked, badgeAriaLabel: '{value} von {value}' });
      expect(srText('Offene Zuordnungen')).toBe('12 von {value}');
    });
  });

  describe('AC-9: items without a badge', () => {
    it('get no hidden text and no badge', () => {
      render({ ...docked, badgeAriaLabel: '{value} offen' });
      for (const label of ['Cockpit', 'Kostenstellen']) {
        expect(entry(label).querySelector('.lc-sidenav__sr-only')).toBeNull();
        expect(entry(label).querySelector('lc-badge')).toBeNull();
        expect(name(label)).toBe(label);
      }
    });

    it('keep their markup: icon then label, nothing else', () => {
      render(docked);
      expect(Array.from(entry('Cockpit').children).map((c) => c.tagName.toLowerCase() + '.' + c.classList[0])).toEqual([
        'lc-icon.lc-sidenav__nav-icon',
        'span.lc-sidenav__nav-label',
      ]);
    });
  });

  describe('AC-9: badged items add the span after the badge, chevron last', () => {
    const order = (target: Element) => Array.from(target.children).map((c) => c.classList[0] ?? c.tagName.toLowerCase());

    it('link: icon, label, badge, hidden text, with one space between badge and text', () => {
      render(docked);
      const link = entry('Offene Zuordnungen');
      expect(order(link)).toEqual(['lc-sidenav__nav-icon', 'lc-sidenav__nav-label', 'lc-sidenav__nav-badge', 'lc-sidenav__sr-only']);
      const badge = link.querySelector('lc-badge') as Element;
      expect(badge.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
      expect(badge.nextSibling?.textContent).toBe(' ');
      expect(badge.nextSibling?.nextSibling).toBe(link.querySelector('.lc-sidenav__sr-only'));
    });

    it('parent button: the chevron stays last', () => {
      render(docked);
      expect(order(entry('Stammdaten'))).toEqual([
        'lc-sidenav__nav-icon',
        'lc-sidenav__nav-label',
        'lc-sidenav__nav-badge',
        'lc-sidenav__sr-only',
        'lc-sidenav__nav-chevron',
      ]);
    });

    it('the hidden span uses the clipped sr-only rule (no layout space)', () => {
      const css = compile(resolve(__dirname, 'sidenav.component.scss')).css;
      const at = css.indexOf('\n.lc-sidenav__sr-only {');
      expect(at).toBeGreaterThan(-1);
      const rule = css.slice(at, css.indexOf('}', at));
      expect(rule).toMatch(/position: absolute;/);
      expect(rule).toMatch(/width: 1px;/);
      expect(rule).toMatch(/height: 1px;/);
      expect(rule).toMatch(/overflow: hidden;/);
      expect(rule).toMatch(/clip: rect\(0, 0, 0, 0\);/);
    });
  });

  describe('D-2: the collapsed rail', () => {
    let style: HTMLStyleElement;

    beforeAll(() => {
      // Load the component CSS so jsdom hides the rail labels (display: none) as a browser does.
      style = document.createElement('style');
      style.textContent = compile(resolve(__dirname, 'sidenav.component.scss')).css.replace(/::ng-deep\s*/g, '');
      document.head.appendChild(style);
    });
    afterAll(() => style.remove());

    it.each([
      { site: 'simple item (a)', label: 'Offene Zuordnungen', text: 'Offene Zuordnungen 12 offen' },
      { site: 'top-level parent (button)', label: 'Stammdaten', text: 'Stammdaten 1 offen' },
      { site: 'section child (a)', label: 'Finanzen', text: 'Finanzen 3 offen' },
      { site: 'section child with children (button)', label: 'Banken', text: 'Banken 2 offen' },
    ])('$site: the label leads the hidden text, the name is "$text"', ({ label, text }) => {
      render({ ...docked, collapsed: true, badgeAriaLabel: '{value} offen' });
      expect(el.querySelector('.lc-sidenav--collapsed')).not.toBeNull();
      expect(getComputedStyle(entry(label).querySelector('.lc-sidenav__nav-label') as Element).display).toBe('none');
      expect(srText(label)).toBe(text);
      expect(name(label)).toBe(text);
      // 3.33 (request 052, 050-n5, D-7): no `title` any more (it became the
      // description, repeating the label); the tooltip reads `data-tooltip`.
      expect(entry(label).getAttribute('title')).toBe('');
      expect(entry(label).getAttribute('data-tooltip')).toBe(label);
    });

    it('reads "Label value" with the default (was the bare count)', () => {
      render({ ...docked, collapsed: true });
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen 12');
    });

    it("reads the label alone with ''", () => {
      render({ ...docked, collapsed: true, badgeAriaLabel: '' });
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen');
    });

    it('leaves unbadged rail items alone', () => {
      render({ ...docked, collapsed: true, badgeAriaLabel: '{value} offen' });
      expect(entry('Cockpit').querySelector('.lc-sidenav__sr-only')).toBeNull();
    });

    it('drops the label prefix again when expanded', () => {
      render({ ...docked, collapsed: true, badgeAriaLabel: '{value} offen' });
      expect(srText('Finanzen')).toBe('Finanzen 3 offen');
      render({ collapsed: false });
      expect(srText('Finanzen')).toBe('3 offen');
    });
  });

  describe('drawer below the breakpoint (labels visible)', () => {
    it('adds no label prefix, also with collapsed set', () => {
      mobile = true;
      render({ ...docked, collapsed: true, badgeAriaLabel: '{value} offen' });
      expect(el.querySelector('.lc-sidenav--collapsed')).toBeNull();
      expect(srText('Offene Zuordnungen')).toBe('12 offen');
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen 12 offen');
    });
  });

  describe('AC-11, AC-12: German name, one tab stop', () => {
    it('names the long German item "Offene Zuordnungen 12 offen"', () => {
      render({ ...docked, badgeAriaLabel: '{value} offen' });
      expect(name('Offene Zuordnungen')).toBe('Offene Zuordnungen 12 offen');
    });

    it('keeps each badged item one tab stop: nothing focusable inside', () => {
      render({ ...docked, badgeAriaLabel: '{value} offen' });
      openBanken();
      for (const label of ['Offene Zuordnungen', 'Stammdaten', 'Konten', 'Finanzen', 'Banken', 'Kontoauszüge']) {
        const target = entry(label);
        expect(target.tabIndex).toBe(0);
        expect(target.getAttribute('tabindex')).toBeNull();
        expect(target.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0);
      }
    });
  });
});
