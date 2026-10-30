import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { compile } from 'sass';
import { resolve } from 'path';
import { SidenavComponent } from './sidenav.component';
import { IconComponent } from '../icon/icon.component';
import { SidenavPlaceholderComponent } from '../sidenav-placeholder/sidenav-placeholder.component';
import { NavigationItem } from '../models/navigation-item.interface';

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

const items: NavigationItem[] = [
  { id: 'overview', icon: 'home', label: 'Übersicht', route: '/', displayOrder: 1 },
  { id: 'costs', icon: 'chart-bar', label: 'Kosten', route: '/costs', displayOrder: 2 },
];

/** `selector → declarations` of a plain compiled rule (outside @media), or ''. */
function ruleOf(css: string, selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
}

/** WCAG contrast of two #rrggbb colours. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Request 019 (G2): the text brand, the collapse button and the theme-hook fix. */
describe('SidenavComponent text brand (019)', () => {
  let fixture: ComponentFixture<SidenavComponent>;
  let el: HTMLElement;

  function render(inputs: Record<string, unknown>): HTMLElement {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return el;
  }

  const docked = { mode: 'docked', isOpen: true, width: '240px', items };

  beforeEach(async () => {
    mobile = false;
    await TestBed.configureTestingModule({
      imports: [SidenavComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(SidenavComponent);
    el = fixture.nativeElement;
  });

  describe('AC-9: the default renders as before', () => {
    it('renders no brand, no collapse row and no theme class on the host by default', () => {
      render(docked);
      const aside = el.querySelector('aside') as HTMLElement;
      expect([...aside.children].map((c) => c.className)).toEqual([
        'lc-sidenav__nav lc-sidenav__nav--docked',
        'lc-sidenav__content lc-sidenav__content--docked',
      ]);
      expect(el.querySelector('.lc-sidenav__brand, .lc-sidenav__logo, .lc-sidenav__collapse-row')).toBeNull();
      expect([...el.classList].sort()).toEqual(['lc-sidenav-container', 'lc-sidenav-container--docked', 'lc-sidenav-container--open']);
    });

    it('keeps the image logo block with showLogo, and brandIcon alone renders nothing', () => {
      render({ ...docked, showLogo: true, brandIcon: 'presentation-chart-line' });
      expect(el.querySelector('.lc-sidenav__logo-link')).not.toBeNull();
      expect(el.querySelector('.lc-sidenav__logo--brand, .lc-sidenav__brand')).toBeNull();
    });
  });

  describe('AC-10: one link, decorative tile, the name as text', () => {
    it('renders a router link to "/" with the tile aria-hidden and the name as its text', () => {
      render({ ...docked, brandName: 'Finance Intelligence', brandIcon: 'presentation-chart-line' });
      const block = el.querySelector('.lc-sidenav__logo.lc-sidenav__logo--brand.lc-sidenav__logo--size-md') as HTMLElement;
      expect(block).not.toBeNull();
      const links = block.querySelectorAll('a');
      expect(links).toHaveLength(1);
      expect(block.querySelectorAll('button')).toHaveLength(0);
      const link = links[0];
      expect(link.classList).toContain('lc-sidenav__brand');
      expect(link.getAttribute('href')).toBe('/');
      expect(link.hasAttribute('aria-label')).toBe(false);
      expect(link.textContent?.trim()).toBe('Finance Intelligence');
      const tile = link.querySelector('.lc-sidenav__brand-tile') as HTMLElement;
      expect(tile.getAttribute('aria-hidden')).toBe('true');
      const icon = fixture.debugElement.query(By.css('.lc-sidenav__brand-tile lc-icon')).injector.get(IconComponent);
      expect(icon.name()).toBe('presentation-chart-line');
      expect(icon.decorative()).toBe(true);
      expect(link.querySelector('.lc-sidenav__brand-name')?.textContent).toBe('Finance Intelligence');
      // The brand sits before the navigation landmark.
      expect(block.nextElementSibling?.tagName).toBe('NAV');
    });

    it('uses a plain href with brandHref and brandAriaLabel as the accessible name', () => {
      render({ ...docked, brandName: 'Finance Intelligence', brandHref: '/de/', brandAriaLabel: 'Finance Intelligence – Startseite' });
      const link = el.querySelector('.lc-sidenav__brand') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('/de/');
      expect(link.getAttribute('aria-label')).toBe('Finance Intelligence – Startseite');
    });

    it('shows the first letter, upper-cased, without brandIcon', () => {
      render({ ...docked, brandName: '  ärzte-Portal' });
      expect(el.querySelector('.lc-sidenav__brand-tile')?.textContent?.trim()).toBe('Ä');
      expect(el.querySelector('.lc-sidenav__brand-tile lc-icon')).toBeNull();
    });

    it('sits on the logo block, at least 44 px high, its height following logoSize', () => {
      render({ ...docked, brandName: 'Finance Intelligence', logoSize: 'lg' });
      expect(el.querySelector('.lc-sidenav__logo--brand')?.classList).toContain('lc-sidenav__logo--size-lg');
      const css = compile(resolve(__dirname, 'sidenav.component.scss')).css;
      expect(ruleOf(css, '.lc-sidenav__brand')).toContain('min-height: var(--size-min-touch-height, 2.75rem)');
      expect(ruleOf(css, '.lc-sidenav__logo--size-md')).toContain('min-height: 64px');
    });
  });

  describe('AC-12: the rail and the collapse button', () => {
    it('keeps the link and hides only the name visually when collapsed', () => {
      render({ ...docked, brandName: 'Finance Intelligence', collapsed: true });
      const link = el.querySelector('.lc-sidenav__brand') as HTMLAnchorElement;
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/');
      expect(link.getAttribute('data-tooltip')).toBe('Finance Intelligence');
      expect(link.hasAttribute('title')).toBe(false);
      const name = link.querySelector('.lc-sidenav__brand-name') as HTMLElement;
      expect(name.classList).toContain('lc-sidenav__sr-only');
      expect(name.textContent).toBe('Finance Intelligence');
      render({ collapsed: false });
      expect(name.classList).not.toContain('lc-sidenav__sr-only');
    });

    it('renders the collapse button last in the rail, only with showCollapseToggle and only docked', () => {
      render({ ...docked, brandName: 'Finance Intelligence' });
      expect(el.querySelector('.lc-sidenav__collapse-row')).toBeNull();
      render({ showCollapseToggle: true });
      const aside = el.querySelector('aside') as HTMLElement;
      expect(aside.lastElementChild?.classList).toContain('lc-sidenav__collapse-row');
      render({ mode: 'drawer' });
      expect(document.querySelector('.lc-sidenav__collapse-row')).toBeNull();
    });

    it('toggles the rail, switches its label and chevron and keeps the same button (focus stays)', () => {
      render({ ...docked, brandName: 'Finance Intelligence', showCollapseToggle: true });
      const button = el.querySelector('.lc-sidenav__collapse-toggle') as HTMLButtonElement;
      const chevron = () => fixture.debugElement.query(By.css('.lc-sidenav__collapse-toggle lc-icon')).injector.get(IconComponent);
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('Collapse navigation to the left');
      expect(button.hasAttribute('title')).toBe(false);
      expect(chevron().name()).toBe('chevron-left');
      expect(chevron().decorative()).toBe(true);
      button.focus();
      button.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.collapsed()).toBe(true);
      expect(el.querySelector('.lc-sidenav__collapse-toggle')).toBe(button);
      expect(document.activeElement).toBe(button);
      expect(button.getAttribute('aria-label')).toBe('Expand navigation');
      expect(chevron().name()).toBe('chevron-right');
      render({ expandAriaLabel: 'Navigation ausklappen' });
      expect(button.getAttribute('aria-label')).toBe('Navigation ausklappen');
      button.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.collapsed()).toBe(false);
      render({ collapseAriaLabel: 'Navigation nach links einklappen' });
      expect(button.getAttribute('aria-label')).toBe('Navigation nach links einklappen');
    });

    it('mirrors the chevron for position="right"', () => {
      render({ ...docked, position: 'right', showCollapseToggle: true });
      const chevron = () => fixture.debugElement.query(By.css('.lc-sidenav__collapse-toggle lc-icon')).injector.get(IconComponent);
      expect(chevron().name()).toBe('chevron-right');
      expect(el.querySelector('.lc-sidenav__collapse-toggle')?.getAttribute('aria-label')).toBe('Collapse navigation to the right');
      render({ collapsed: true });
      expect(chevron().name()).toBe('chevron-left');
    });

    it('the brand never toggles the rail', () => {
      render({ ...docked, brandName: 'Finance Intelligence', showCollapseToggle: true });
      (el.querySelector('.lc-sidenav__brand') as HTMLElement).click();
      expect(fixture.componentInstance.collapsed()).toBe(false);
    });
  });

  describe('drawer', () => {
    it('orders brand → close → items and closes on a brand click on a phone', () => {
      mobile = true;
      const closed = jest.fn();
      fixture.componentInstance.closed.subscribe(closed);
      render({ ...docked, brandName: 'Finanz-Controlling Cockpit', closeAriaLabel: 'Navigation schließen' });
      const aside = el.querySelector('aside') as HTMLElement;
      expect(aside.getAttribute('role')).toBe('dialog');
      expect([...aside.children].slice(0, 3).map((c) => c.classList[0])).toEqual(['lc-sidenav__logo', 'lc-sidenav__close', 'lc-sidenav__nav']);
      (el.querySelector('.lc-sidenav__brand') as HTMLElement).click();
      expect(closed).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC-13: tokens, hooks and forced colours', () => {
    const css = compile(resolve(__dirname, 'sidenav.component.scss')).css;

    it('fills the tile through the documented hooks with theme-stable defaults', () => {
      const tile = ruleOf(css, '.lc-sidenav__brand-tile');
      expect(tile).toContain('background-color: var(--lc-sidenav-brand-tile-bg, var(--color-primary-fill))');
      expect(tile).toContain('color: var(--lc-sidenav-brand-tile-fg, var(--color-on-primary))');
      expect(tile).toContain('width: 32px');
      // 020: hooks are no longer declared on `:host`, so ancestor values reach
      // the rail; the read falls back to the theme's private variable.
      expect(ruleOf(css, '.lc-sidenav__brand')).toContain('color: var(--lc-sidenav-fg-active, var(--_lc-sidenav-t-fg-active))');
      expect(css).toMatch(
        /\n\.lc-sidenav__brand:focus-visible \{\s*outline: 2px solid var\(--_lc-sidenav-t-accent, var\(--color-primary-500\)\);\s*outline-offset: 2px;/,
      );
    });

    it('draws the active bar through --lc-sidenav-active-indicator (default: the theme accent, then primary-500)', () => {
      expect(css).toContain(
        'box-shadow: inset 2px 0 0 var(--lc-sidenav-active-indicator, var(--_lc-sidenav-t-accent, var(--color-primary-500)))',
      );
      expect(css).not.toMatch(/box-shadow: inset 2px 0 0 var\(--color-primary-500\)/);
    });

    // Review r1 (F1): a `theme="light"` rail on a dark page kept the page's
    // #84c7d4 ring (1.89:1 on #fff) and bar (1.76:1 on #f0f8fa).
    it('reads the theme accent in every focus ring of the rail', () => {
      const outlines = css.match(/outline: 2px solid [^;]+;/g) ?? [];
      expect(outlines).toHaveLength(8);
      for (const o of outlines) {
        expect(o).toMatch(/^outline: 2px solid var\(--_lc-sidenav-t-accent, var\(--color-primary-500[,)]/);
      }
    });

    it('gives only the light theme an accent, at least 3:1 on its rail and its current item', () => {
      const light = ruleOf(css, ':host(.lc-sidenav-container--light)');
      expect(light).toContain('--_lc-sidenav-t-accent: #208497');
      expect(light).toContain('--_lc-sidenav-t-bg: #ffffff');
      expect(light).toContain('--_lc-sidenav-t-active-bg: #f0f8fa');
      expect(ruleOf(css, ':host(.lc-sidenav-container--dark)')).not.toContain('--_lc-sidenav-t-accent');
      expect(contrast('#208497', '#ffffff')).toBeCloseTo(4.37, 2);
      expect(contrast('#208497', '#f0f8fa')).toBeCloseTo(4.06, 2);
      expect(Math.min(contrast('#208497', '#ffffff'), contrast('#208497', '#f0f8fa'))).toBeGreaterThanOrEqual(3);
    });

    it('outlines the tile and the current item in forced colours', () => {
      const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
      expect(forced).toMatch(/\.lc-sidenav__brand-tile \{\s*border: 1px solid CanvasText;\s*color: CanvasText;/);
      expect(forced).toMatch(/\.lc-sidenav__nav-item\[aria-current=page\]:not\(:focus-visible\) \{\s*outline: 1px solid Highlight;/);
    });

    it('keeps the brand name to two lines that wrap long words (AC-14)', () => {
      const name = ruleOf(css, '.lc-sidenav__brand-name');
      for (const d of ['min-width: 0', '-webkit-line-clamp: 2', 'overflow: hidden', 'overflow-wrap: break-word', 'hyphens: auto']) {
        expect(name).toContain(d);
      }
    });
  });

  describe('theme-hook fix: the theme sits on the host, behind the public hooks', () => {
    const css = compile(resolve(__dirname, 'sidenav.component.scss')).css;

    it('binds the theme as a host class', () => {
      render({ ...docked, theme: 'dark' });
      expect(el.classList).toContain('lc-sidenav-container--dark');
      expect(el.querySelector('aside')?.classList).toContain('lc-sidenav--dark');
      render({ theme: 'light' });
      expect(el.classList).toContain('lc-sidenav-container--light');
      expect(el.classList).not.toContain('lc-sidenav-container--dark');
    });

    it('sets only private variables for the theme, which each public hook reads first', () => {
      const dark = ruleOf(css, ':host(.lc-sidenav-container--dark)');
      expect(dark).toContain('--_lc-sidenav-t-bg: #070e15');
      expect(dark).not.toMatch(/\s--lc-sidenav-/);
      expect(ruleOf(css, ':host(.lc-sidenav-container--light)')).toContain('--_lc-sidenav-t-bg: #ffffff');
      // 020: hooks are no longer declared on `:host`, so ancestor values reach
      // the rail. The host holds each hook's auto default as the private
      // variable, which every read of the hook falls back to.
      const host = ruleOf(css, ':host');
      for (const hook of ['bg', 'fg', 'fg-active', 'border', 'hover-bg', 'section-fg', 'active-bg', 'active-fg', 'active-icon']) {
        expect(host).toContain(`--_lc-sidenav-t-${hook}: var(--color-`);
        expect(host).not.toContain(`--lc-sidenav-${hook}:`);
        expect(css).toContain(`var(--lc-sidenav-${hook}, var(--_lc-sidenav-t-${hook}`);
      }
      // No rule on the inner element redefines a public hook for a theme.
      expect(css).not.toMatch(/\n\.lc-sidenav--(dark|light) \{/);
    });

    it('lc-sidenav-placeholder carries the same host class', () => {
      const placeholder = TestBed.createComponent(SidenavPlaceholderComponent);
      placeholder.componentRef.setInput('theme', 'dark');
      placeholder.detectChanges();
      expect((placeholder.nativeElement as HTMLElement).classList).toContain('lc-sidenav-container--dark');
    });
  });
});
