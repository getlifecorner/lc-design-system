import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HeaderComponent, type HeaderNavItem } from './header.component';
import { ThemeService } from '../theme/theme.service';

/**
 * lc-header at a large text size (3.10.1, AS-31): the end content is one
 * group, `.lc-header__end`, that wraps to a second row instead of covering the
 * brand. The layout itself is CSS (measured in the stories); these tests pin
 * the DOM it relies on, the focus order and the default rendering.
 */
@Component({
  imports: [HeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-header
      title="LifeCorner"
      subtitle="Familie Apfelbaum-Kieselbacher-Morgentau"
      [showUserMenu]="showUserMenu()"
      [showThemeButton]="showThemeButton()"
      [navItems]="navItems()"
      contextName="Apfelbaum"
      [sticky]="false"
    >
      @if (showLanguage()) {
        <a slot="end" class="lang-link" href="/en/" hreflang="en" lang="en">English</a>
      }
    </lc-header>
  `,
})
class LargeTextHostComponent {
  readonly showUserMenu = signal(true);
  readonly showThemeButton = signal(true);
  readonly showLanguage = signal(true);
  readonly navItems = signal<readonly HeaderNavItem[]>([]);
}

@Component({
  imports: [HeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-header [showUserMenu]="showUserMenu()" />`,
})
class DefaultHostComponent {
  readonly showUserMenu = signal(true);
}

const themeFactory = () => ({ isDark: signal(false), toggleTheme: jest.fn() });

function render<T>(host: new () => T) {
  TestBed.configureTestingModule({
    imports: [host],
    // The router is for the home link, HttpClient for lc-icon; the
    // ThemeService stub avoids localStorage.
    providers: [provideRouter([]), provideHttpClient(withXhr()), { provide: ThemeService, useFactory: themeFactory }],
  });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const header = el.querySelector('header');
  if (!header) throw new Error('header not rendered');
  return { fixture, el, header };
}

const childClasses = (parent: Element) => [...parent.children].map((c) => c.classList[0] ?? c.tagName.toLowerCase());

describe('HeaderComponent — large text (AS-31)', () => {
  it('keeps the default header as before: brand, spacer, end group with the account menu; md size', () => {
    const { header } = render(DefaultHostComponent);
    expect(header.className).toBe('lc-header lc-header--size-md');
    expect(childClasses(header)).toEqual(['lc-header__brand', 'lc-header__spacer', 'lc-header__end']);
    const end = header.querySelector('.lc-header__end');
    expect(end && childClasses(end)).toEqual(['lc-menu']);
  });

  it('puts every end item into one group, in the 3.10 order: slot, theme button, context, account menu', () => {
    const { header } = render(LargeTextHostComponent);
    const end = header.querySelector('.lc-header__end');
    if (!end) throw new Error('end group not rendered');
    expect(childClasses(end)).toEqual([
      'lang-link',
      'lc-header__theme-toggle',
      'lc-header__context-info',
      'lc-menu',
    ]);
    // Nothing of the end content is left outside the group.
    expect(header.querySelector(':scope > lc-menu, :scope > .lang-link, :scope > .lc-header__context-info')).toBeNull();
    // The spacer sits between brand and group.
    expect(childClasses(header)).toEqual(['lc-header__brand', 'lc-header__spacer', 'lc-header__end']);
  });

  it('keeps the DOM order, and so the focus order, brand → nav → end group', () => {
    const { fixture, header } = render(LargeTextHostComponent);
    fixture.componentInstance.navItems.set([{ label: 'Heute', href: '/heute', current: true }]);
    fixture.detectChanges();
    expect(childClasses(header)).toEqual(['lc-header__brand', 'lc-header__nav', 'lc-header__spacer', 'lc-header__end']);
    const focusable = [...header.querySelectorAll<HTMLElement>('a[href], button')].map(
      (e) => e.closest('.lc-header__brand, .lc-header__nav, .lc-header__end')?.classList[0],
    );
    const firstEnd = focusable.indexOf('lc-header__end');
    expect(focusable.indexOf('lc-header__brand')).toBeLessThan(focusable.indexOf('lc-header__nav'));
    expect(focusable.indexOf('lc-header__nav')).toBeLessThan(firstEnd);
    expect(focusable.slice(firstEnd).every((c) => c === 'lc-header__end')).toBe(true);
  });

  it('adds no role or aria-hidden to the group, so nothing is hidden from screen readers', () => {
    const { header } = render(LargeTextHostComponent);
    const end = header.querySelector('.lc-header__end');
    expect(end?.getAttribute('role')).toBeNull();
    expect(header.querySelector('[aria-hidden="true"].lc-header__title, [aria-hidden="true"].lc-header__subtitle')).toBeNull();
    // The full subtitle stays in the DOM and in the title attribute.
    const subtitle = header.querySelector('.lc-header__subtitle');
    expect(subtitle?.textContent?.trim()).toBe('Familie Apfelbaum-Kieselbacher-Morgentau');
    expect(subtitle?.getAttribute('title')).toBe('Familie Apfelbaum-Kieselbacher-Morgentau');
  });

  it('leaves the group empty (no box, `:empty`) when there is no end content', () => {
    const { fixture, header } = render(DefaultHostComponent);
    const end = header.querySelector('.lc-header__end');
    expect(end?.matches(':empty')).toBe(false);
    fixture.componentInstance.showUserMenu.set(false);
    fixture.detectChanges();
    // Only Angular's comment anchors are left, which `:empty` ignores.
    expect(end?.matches(':empty')).toBe(true);
  });

  describe('styles (source contract)', () => {
    const scss = readFileSync(resolve(__dirname, 'header.component.scss'), 'utf-8');
    const rule = (selector: string) => {
      const match = new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(scss);
      if (!match) throw new Error(`rule ${selector} not found`);
      return match[1];
    };
    const gap = 'var(--lc-density-gap-md, var(--spacing-4))';

    it('lets every header wrap, with no row gap', () => {
      expect(scss).toMatch(/\.lc-header \{[^}]*flex-wrap: wrap;\s*row-gap: 0;/s);
    });

    it('bases the brand on logo and longest title word, growing into the free space', () => {
      const brand = rule('.lc-header__brand');
      expect(brand).toContain('flex: 1 1 auto;');
      expect(brand).toContain('width: min-content;');
      expect(brand).toContain(`max-width: calc(100% - ${gap});`);
      expect(brand).toContain('min-width: 0;');
    });

    it('leaves the subtitle out of the brand basis and lets the title use one gap', () => {
      expect(rule('.lc-header__subtitle')).toContain('contain: inline-size;');
      expect(rule('.lc-header__title')).toContain(`margin-inline-end: calc(-1 * ${gap});`);
      expect(rule('.lc-header__title')).toContain('overflow-wrap: break-word;');
    });

    it('keeps the first row at the header size through the spacer, less the bottom border', () => {
      const spacer = rule('.lc-header__spacer');
      expect(spacer).toContain('flex: 0 0 0;');
      expect(spacer).toContain('min-height: calc(var(--lc-header-row-height, 64px) - var(--_lc-header-border-width, 1px));');
      expect(scss).toMatch(/\.lc-header\.lc-header--transparent \{[^}]*--_lc-header-border-width: 0px;/s);
    });

    it('keeps the end group at the end of its row and drops its box when empty', () => {
      expect(scss).toMatch(
        /\.lc-header__end \{[^}]*flex-wrap: wrap;[^}]*justify-content: flex-end;[^}]*margin-inline-start: auto;[^}]*max-width: 100%;\s*&:empty \{\s*display: none;/s,
      );
    });

    it('restores the 3.10 row of a has-nav header from 1024 px', () => {
      expect(scss).toMatch(
        /@media \(min-width: 1024px\) \{\s*\.lc-header--has-nav \{\s*\.lc-header__brand \{\s*flex: 0 1 auto;\s*width: auto;\s*max-width: none;/s,
      );
      expect(scss).toMatch(/\.lc-header__title \{\s*margin-inline-end: 0;\s*\}\s*\.lc-header__subtitle \{\s*contain: none;\s*\}\s*\.lc-header__spacer \{\s*flex: 1;/s);
    });
  });
});
