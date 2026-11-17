import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import type { MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { HeaderComponent } from './header.component';
import { ThemeService } from '../theme/theme.service';

@Component({
  imports: [HeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-header
      title="Produkt"
      userName="Johanna Apfelbaum"
      [homeLink]="homeLink()"
      logoAlt="Produkt"
      [navItems]="[{ label: 'Start', href: '/' }]"
      [userMenuItems]="userMenuItems()"
      [showProfileMenuItem]="showProfile()"
      (userMenuItemClick)="clicked.push($event)"
      (profileClick)="clicked.push('profile')"
    >
      @if (middle()) {
        <button slot="middle" type="button" class="search-trigger">Suchen</button>
      }
      <a slot="end" class="end-link" href="/en/">English</a>
    </lc-header>
  `,
})
class HostComponent {
  readonly homeLink = signal(true);
  readonly middle = signal(true);
  readonly showProfile = signal(true);
  readonly userMenuItems = signal<readonly MenuItem[]>([]);
  readonly clicked: (MenuItem | string)[] = [];
}

/** Request 065, backlog 064-n1 (AC-38): middle slot, caller menu entries, a brand that is not a link. */
describe('lc-header middle slot, menu entries and homeLink (3.45)', () => {
  function render(setup?: (host: HostComponent) => void) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr()), { provide: ThemeService, useValue: { isDark: signal(false) } }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    const header = fixture.debugElement.children[0].componentInstance as HeaderComponent;
    return { fixture, host: fixture.componentInstance, header, el: fixture.nativeElement as HTMLElement };
  }

  it('projects [slot=middle] after the nav and before the spacer and end group (DOM = focus order)', () => {
    const { el } = render();
    const bar = el.querySelector('header.lc-header') as HTMLElement;
    const children = Array.from(bar.children).map((c) => c.className.split(' ')[0]);
    expect(children).toEqual(['lc-header__brand', 'lc-header__nav', 'search-trigger', 'lc-header__spacer', 'lc-header__end']);
    expect(el.querySelector('.lc-header__end .end-link')).not.toBeNull();
  });

  it('adds nothing without middle content', () => {
    const { el } = render((h) => h.middle.set(false));
    const children = Array.from((el.querySelector('header.lc-header') as HTMLElement).children).map((c) => c.className.split(' ')[0]);
    expect(children).toEqual(['lc-header__brand', 'lc-header__nav', 'lc-header__spacer', 'lc-header__end']);
  });

  it('lets the middle content shrink on the brand row', () => {
    const css = compile(resolve(__dirname, 'header.component.scss')).css;
    expect(css).toMatch(/\n\.lc-header > \[slot=middle\] \{\s*flex: 0 1 auto;\s*min-width: 0;\s*\}/);
  });

  describe('userMenuItems', () => {
    const entries: MenuItem[] = [
      { id: 'settings', label: 'Einstellungen', icon: 'cog-6-tooth' },
      { id: 'help', label: 'Hilfe', dividerAfter: true },
    ];

    it('keeps Profile and Logout alone by default', () => {
      const { header } = render();
      expect((header as unknown as { menuItems(): MenuItem[] }).menuItems().map((i) => i.id)).toEqual(['profile', 'logout']);
    });

    it('puts the caller entries between Profile and Logout, unchanged', () => {
      const { header } = render((h) => h.userMenuItems.set(entries));
      const items = (header as unknown as { menuItems(): MenuItem[] }).menuItems();
      expect(items.map((i) => i.id)).toEqual(['profile', 'settings', 'help', 'logout']);
      expect(items[1]).toBe(entries[0]);
      expect(items[2]).toBe(entries[1]);
    });

    it('follows showProfileMenuItem=false: entries first, then Logout', () => {
      const { header } = render((h) => {
        h.userMenuItems.set(entries);
        h.showProfile.set(false);
      });
      expect((header as unknown as { menuItems(): MenuItem[] }).menuItems().map((i) => i.id)).toEqual(['settings', 'help', 'logout']);
    });

    it('renders them as menuitems and emits userMenuItemClick (not profile/logout) and closes the menu', () => {
      const { fixture, host, header, el } = render((h) => h.userMenuItems.set(entries));
      header.toggleDropdown();
      fixture.detectChanges();
      const names = Array.from(el.querySelectorAll('[role="menuitem"]')).map((m) => m.textContent?.trim());
      expect(names).toEqual(['Profile', 'Einstellungen', 'Hilfe', 'Logout']);
      header.onMenuItemClick(entries[0]);
      fixture.detectChanges();
      expect(host.clicked).toEqual([entries[0]]);
      expect(header.isDropdownOpen()).toBe(false);
      header.onMenuItemClick({ id: 'profile', label: 'Profile' });
      expect(host.clicked).toEqual([entries[0], 'profile']);
    });
  });

  describe('homeLink', () => {
    it('is a link by default (as before)', () => {
      const { el } = render();
      expect(el.querySelector('a.lc-header__logo')).not.toBeNull();
      expect(el.querySelector('span.lc-header__logo')).toBeNull();
    });

    it('false: a <span> named by the logo alt, no link, no tab stop', () => {
      const { el } = render((h) => h.homeLink.set(false));
      const brand = el.querySelector('.lc-header__logo') as HTMLElement;
      expect(brand.tagName).toBe('SPAN');
      expect(brand.hasAttribute('tabindex')).toBe(false);
      expect(brand.hasAttribute('aria-label')).toBe(false);
      expect(el.querySelector('a.lc-header__logo')).toBeNull();
      expect(brand.querySelector('img')?.getAttribute('alt')).toBe('Produkt');
    });
  });
});
