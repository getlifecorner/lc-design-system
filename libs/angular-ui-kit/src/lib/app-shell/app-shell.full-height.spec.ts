import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { resolve } from 'path';
import { AppShellComponent, AppShellNavPlacement } from './app-shell.component';
import { AppPageComponent } from './app-page.component';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

// JSDOM has no matchMedia; lc-sidenav reads it for its mobile breakpoint.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const nav = [
  { id: 'overview', icon: 'home', label: 'Übersicht', route: '/', displayOrder: 1 },
  { id: 'costs', icon: 'chart-bar', label: 'Kosten', route: '/costs', displayOrder: 2 },
];

/** The full-height story's frame (design 019 §8), with every landmark the shell holds. */
@Component({
  imports: [AppShellComponent, AppPageComponent, HeaderComponent, SidenavComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-to-content" href="#main">Zum Inhalt springen</a>
    <lc-app-shell [navPlacement]="placement()" [horizon]="horizon()">
      <lc-header shell-header size="md" [showLogo]="false" title="Übersicht" titleTag="span" [sticky]="false"
                 userName="Tom Ek" userMenuAriaLabel="Menü für Tom Ek" />
      @if (withNav()) {
        <lc-sidenav shell-nav mode="docked" [isOpen]="true" width="100%" [mobileBreakpoint]="0" theme="dark"
                    brandName="Finance Intelligence" brandIcon="presentation-chart-line" [showCollapseToggle]="true"
                    ariaLabel="Hauptnavigation" [items]="nav" activeRoute="/" />
      }
      <lc-app-page><h1>Übersicht</h1><a class="t-content" href="#costs">Kosten</a></lc-app-page>
      <footer shell-footer><a class="t-footer" href="#legal">Impressum</a></footer>
      <lc-bottom-nav shell-bottom-nav ariaLabel="Hauptnavigation" [items]="nav" activeRoute="/" />
    </lc-app-shell>
  `,
})
class FullHeightHostComponent {
  readonly placement = signal<AppShellNavPlacement>('full-height');
  readonly horizon = signal(false);
  readonly withNav = signal(true);
  readonly nav = nav;
}

/** Index ranges of every `@media (min-width: 1024px)` block in compiled CSS. */
function mediaBlocks(css: string, query: string): Array<[number, number]> {
  const blocks: Array<[number, number]> = [];
  let from = 0;
  for (let at = css.indexOf(query, from); at >= 0; at = css.indexOf(query, from)) {
    let i = css.indexOf('{', at) + 1;
    for (let depth = 1; depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    blocks.push([at, i]);
    from = i;
  }
  return blocks;
}

/** Request 019 (G1): `navPlacement="full-height"`. */
describe('AppShellComponent navPlacement (019)', () => {
  const css = compile(resolve(__dirname, 'app-shell.component.scss')).css;
  const scope = '.lc-app-shell--nav-full-height:not(:has(> .lc-app-shell__nav:empty))';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullHeightHostComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
  });

  function render(setup?: (host: FullHeightHostComponent) => void) {
    const fixture = TestBed.createComponent(FullHeightHostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  describe('AC-1: the default renders as before', () => {
    it("defaults to 'below-header' and adds no class", () => {
      const shell = TestBed.createComponent(AppShellComponent);
      shell.detectChanges();
      expect(shell.componentInstance.navPlacement()).toBe('below-header');
      expect((shell.nativeElement as HTMLElement).querySelector('.lc-app-shell')?.className).toBe('lc-app-shell');
    });

    it("adds lc-app-shell--nav-full-height for 'full-height' only, next to the horizon class", () => {
      const el = render((host) => host.horizon.set(true));
      expect(el.querySelector('.lc-app-shell')?.className).toBe('lc-app-shell lc-app-shell--horizon lc-app-shell--nav-full-height');
      const below = render((host) => host.placement.set('below-header'));
      expect(below.querySelector('.lc-app-shell')?.className).toBe('lc-app-shell');
    });
  });

  describe('AC-2, AC-3, AC-4: the layout is CSS from 1024 px only', () => {
    it('keeps every full-height rule inside @media (min-width: 1024px)', () => {
      const blocks = mediaBlocks(css, '@media (min-width: 1024px)');
      const hits = [...css.matchAll(/nav-full-height/g)].map((m) => m.index ?? 0);
      expect(hits.length).toBeGreaterThanOrEqual(4);
      for (const at of hits) {
        expect(blocks.some(([start, end]) => at > start && at < end)).toBe(true);
      }
    });

    it('runs the nav column over every row, 100dvh high, with the header beside it', () => {
      const rule = (suffix: string) => {
        const at = css.indexOf(`${scope}${suffix} {`);
        return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
      };
      expect(rule('')).toMatch(/grid-template-areas: "nav header" "nav body" "end end";/);
      const nav = rule(' > .lc-app-shell__nav');
      for (const d of ['grid-row: 1/-1', 'grid-column: 1', 'height: 100vh', 'height: 100dvh', 'max-height: none', 'box-sizing: border-box', 'z-index: 2', 'padding-top: env(safe-area-inset-top, 0px)', 'display: grid', 'grid-template-columns: minmax(0, 1fr)', 'grid-template-rows: minmax(100%, auto)']) {
        expect(nav).toContain(d);
      }
      // Still the sticky column of the default placement (AC-2) and its left inset (AC-4).
      expect(nav).not.toMatch(/position|\stop:|padding-left/);
      const base = css.slice(css.indexOf('  .lc-app-shell__nav {'));
      expect(base.slice(0, base.indexOf('}'))).toMatch(/position: sticky;[^}]*top: 0;[^}]*padding-left: env\(safe-area-inset-left, 0px\);/);
      // The header and the footer don't take the inset again; the footer's content starts at the nav width.
      expect(rule(' > .lc-app-shell__header')).toContain('padding-left: 0');
      const footer = rule(' > .lc-app-shell__footer');
      expect(footer).toContain('grid-column: 1/-1');
      expect(footer).toContain('padding-left: var(--_nav-width)');
    });

    it('falls back to one column with an empty nav (AC-4)', () => {
      expect(css).toContain(scope);
      const el = render((host) => host.withNav.set(false));
      expect(el.querySelector('.lc-app-shell__nav')?.children).toHaveLength(0);
      expect(el.querySelector('.lc-app-shell')?.classList).toContain('lc-app-shell--nav-full-height');
    });
  });

  describe('AC-5: landmarks and keyboard order', () => {
    it('keeps the DOM order header → nav → page → footer → bar', () => {
      const el = render();
      const regions = [...(el.querySelector('.lc-app-shell') as HTMLElement).children].map((c) => c.classList[0]);
      expect(regions).toEqual(['lc-app-shell__header', 'lc-app-shell__nav', 'lc-app-shell__body', 'lc-app-shell__footer', 'lc-app-shell__bottom-nav']);
    });

    it('exposes one banner and one main; the side nav and the bar never show at the same width', () => {
      const el = render();
      expect(el.querySelectorAll('header')).toHaveLength(1);
      expect(el.querySelectorAll('main')).toHaveLength(1);
      expect(el.querySelectorAll('.lc-app-shell__nav nav')).toHaveLength(1);
      expect(el.querySelectorAll('.lc-app-shell__bottom-nav nav')).toHaveLength(1);
      expect(el.querySelectorAll('nav')).toHaveLength(2);
      // Below 1024 px the side nav is display: none, from 1024 px the bar.
      expect(css).toMatch(/\n\.lc-app-shell__nav \{\s*display: none;\s*\}/);
      const desktop = mediaBlocks(css, '@media (min-width: 1024px)').map(([s, e]) => css.slice(s, e)).join('\n');
      expect(desktop).toMatch(/\.lc-app-shell__bottom-nav \{\s*display: none;\s*\}/);
    });

    it('tabs skip link → header → brand → nav items → collapse button → page → footer', () => {
      const el = render();
      const stops = [...el.querySelectorAll<HTMLElement>('a[href], button')].filter((n) => !n.closest('.lc-app-shell__bottom-nav'));
      const where = (n: HTMLElement) =>
        n.classList.contains('skip-to-content') ? 'skip'
          : n.closest('.lc-app-shell__header') ? 'header'
          : n.classList.contains('lc-sidenav__brand') ? 'brand'
          : n.classList.contains('lc-sidenav__nav-item') ? 'item'
          : n.classList.contains('lc-sidenav__collapse-toggle') ? 'collapse'
          : n.closest('main') ? 'page'
          : n.closest('.lc-app-shell__footer') ? 'footer'
          : 'other';
      const order = stops.map(where).filter((w, i, all) => i === 0 || all[i - 1] !== w);
      expect(order).toEqual(['skip', 'header', 'brand', 'item', 'collapse', 'page', 'footer']);
    });
  });
});
