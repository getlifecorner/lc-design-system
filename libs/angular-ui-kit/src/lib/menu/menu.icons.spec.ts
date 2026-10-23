import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_USER } from '@lifecorner/angular-ui-kit/icons';
import { MenuComponent, MenuItem } from './menu.component';

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-menu [items]="items" [isOpen]="true">
      <button trigger type="button">Open</button>
    </lc-menu>
  `,
})
class IconMenuHostComponent {
  readonly items: MenuItem[] = [
    { id: 'button', label: 'Profile', icon: 'user' },
    { id: 'link', label: 'Account', icon: 'user', href: '#account' },
  ];
}

/**
 * Request 014 (AS-33): every item has a text label (`MenuItem.label` is
 * required), so its icon is decoration: hidden from assistive technology
 * instead of an unnamed `<svg role="img">` (axe `svg-img-alt`, WCAG 1.1.1).
 */
describe('MenuComponent — item icons are decorative (014)', () => {
  it('renders the button and link item icons with aria-hidden and no role', async () => {
    await TestBed.configureTestingModule({
      imports: [IconMenuHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons([ICON_USER])],
    }).compileComponents();
    const fixture = TestBed.createComponent(IconMenuHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const svgs = Array.from(el.querySelectorAll<SVGElement>('.lc-menu__item svg'));
    expect(svgs.length).toBe(2);
    for (const svg of svgs) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('role')).toBeNull();
      expect(svg.getAttribute('aria-label')).toBeNull();
    }
    // The items keep their names from the label text.
    expect(Array.from(el.querySelectorAll('[role="menuitem"]')).map((item) => item.textContent?.trim())).toEqual([
      'Profile',
      'Account',
    ]);
  });
});
