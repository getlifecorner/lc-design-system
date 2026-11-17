import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { join } from 'path';
import { TabComponent, TabsComponent } from './tabs.component';

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-tabs [showIcons]="showIcons()" [mode]="mode()" [orientation]="orientation()">
      <lc-tab label="Dashboard" icon="home" href="/a" [current]="true">A</lc-tab>
      <lc-tab label="Users" icon="users" href="/b">B</lc-tab>
      <lc-tab label="Settings" href="/c">C</lc-tab>
    </lc-tabs>
  `,
})
class HostComponent {
  readonly showIcons = signal(false);
  readonly mode = signal<'panels' | 'links'>('panels');
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

/** Request 065: backlog 064-n3 (AC-40), 064-n6 (AC-44), 064-n8 (AC-46). */
describe('lc-tabs icons, overflow fade and stacked vertical tabs (3.45)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const list = () => el().querySelector('[role="tablist"]') as HTMLElement;
  const tabs = () => [...el().querySelectorAll<HTMLElement>('[role="tab"]')];

  describe('AC-40: showIcons', () => {
    it('renders no icon by default, although tabs have `icon` (as before)', () => {
      expect(el().querySelector('lc-icon')).toBeNull();
      expect(tabs()[0].textContent?.trim()).toBe('Dashboard');
    });

    it('renders the icon (16 px, decorative) before the label only for tabs with one', () => {
      host.showIcons.set(true);
      fixture.detectChanges();
      const icons = [...el().querySelectorAll('lc-icon.lc-tabs__icon')];
      expect(icons).toHaveLength(2);
      expect(tabs()[0].firstElementChild).toBe(icons[0]);
      expect(tabs()[1].firstElementChild).toBe(icons[1]);
      expect(tabs()[2].querySelector('lc-icon')).toBeNull();
      // The label stays the tab's name.
      expect(tabs()[0].textContent?.trim()).toBe('Dashboard');
    });

    it('does the same in links mode', () => {
      host.mode.set('links');
      fixture.detectChanges();
      expect(el().querySelector('lc-icon')).toBeNull();
      host.showIcons.set(true);
      fixture.detectChanges();
      expect(el().querySelectorAll('a[role="tab"] lc-icon.lc-tabs__icon')).toHaveLength(2);
    });
  });

  describe('AC-44: overflow fade', () => {
    const geometry = (scrollWidth: number, clientWidth: number, scrollLeft: number) => {
      const node = list();
      Object.defineProperty(node, 'scrollWidth', { configurable: true, value: scrollWidth });
      Object.defineProperty(node, 'clientWidth', { configurable: true, value: clientWidth });
      Object.defineProperty(node, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });
      node.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
    };
    const classes = () => [...list().classList].filter((c) => c.startsWith('lc-tabs__list--fade'));

    it('adds no class while the list fits (default DOM)', () => {
      expect(classes()).toEqual([]);
      geometry(300, 300, 0);
      expect(classes()).toEqual([]);
    });

    it('fades the end at the start, both sides in the middle, the start at the end', () => {
      geometry(557, 328, 0);
      expect(classes()).toEqual(['lc-tabs__list--fade-end']);
      geometry(557, 328, 100);
      expect(classes().sort()).toEqual(['lc-tabs__list--fade-end', 'lc-tabs__list--fade-start']);
      geometry(557, 328, 229);
      expect(classes()).toEqual(['lc-tabs__list--fade-start']);
      // Right to left: scrollLeft runs negative.
      geometry(557, 328, -229);
      expect(classes()).toEqual(['lc-tabs__list--fade-start']);
    });

    it('a focused tab scrolls fully in, 24 px clear of the fade', () => {
      geometry(557, 328, 0);
      const node = list();
      node.getBoundingClientRect = () => ({ left: 0, right: 328, top: 0, bottom: 40, width: 328, height: 40, x: 0, y: 0, toJSON: () => ({}) });
      const tab = tabs()[2];
      tab.getBoundingClientRect = () => ({ left: 300, right: 400, top: 0, bottom: 40, width: 100, height: 40, x: 300, y: 0, toJSON: () => ({}) });
      tab.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      expect(node.scrollLeft).toBe(400 - (328 - 24));
    });

    it('vertical lists never fade', () => {
      host.orientation.set('vertical');
      fixture.detectChanges();
      geometry(557, 328, 100);
      expect(classes()).toEqual([]);
    });

    it('stylesheet: 24 px masks per side, logical in right to left', () => {
      const css = compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
      expect(css).toMatch(/\.lc-tabs__list\.lc-tabs--horizontal\.lc-tabs__list--fade-end \{[^}]*mask-image: linear-gradient\(to right, #000 calc\(100% - 24px\), transparent\);/);
      expect(css).toMatch(/\.lc-tabs__list\.lc-tabs--horizontal\.lc-tabs__list--fade-start \{[^}]*mask-image: linear-gradient\(to left, #000 calc\(100% - 24px\), transparent\);/);
      expect(css).toMatch(/\.lc-tabs__list\.lc-tabs--horizontal:dir\(rtl\)\.lc-tabs__list--fade-end:not\(\.lc-tabs__list--fade-start\) \{/);
    });
  });

  describe('AC-46: vertical tabs stack below 31rem', () => {
    const css = compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;

    it('only a vertical tabs host is a container (pure CSS, no host class)', () => {
      expect(css).toMatch(/\.lc-tabs:has\(> \.lc-tabs__container--vertical\) \{\s*container-name: lc-tabs;\s*container-type: inline-size;/);
      expect(el().querySelector('lc-tabs')?.className).toBe('lc-tabs');
    });

    it('below 31rem: column, list full width with its divider below, selected line at the inline start', () => {
      const block = css.slice(css.indexOf('@container lc-tabs (width < 31rem) {'));
      expect(block).toMatch(/^[^]*?\.lc-tabs__container--vertical \{\s*flex-direction: column;/);
      expect(block).toMatch(/\.lc-tabs__container--vertical > \.lc-tabs__list\.lc-tabs--vertical \{\s*min-width: 0;\s*border-right: none;\s*border-bottom: 1px solid var\(--color-divider\);/);
      expect(block).toMatch(/> \.lc-tabs__tab \{\s*border-right: none;\s*border-inline-start: 2px solid transparent;/);
      expect(block).toMatch(/> \.lc-tabs__tab--selected \{\s*border-inline-start-color: var\(--color-primary-500\);/);
      expect(block).toMatch(/@media \(forced-colors: active\) \{[^]*?> \.lc-tabs__tab--selected \{\s*border-inline-start-color: CanvasText;/);
    });
  });
});
