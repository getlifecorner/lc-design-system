import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { SidenavComponent } from './sidenav.component';
import { NavigationItem } from '../models/navigation-item.interface';

// JSDOM has no matchMedia (the sidenav reads its breakpoint); desktop here.
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

/**
 * 3.33 (request 052, 050-n5, AC-26, D-7): a badged rail item has no `title`
 * (it became the description, repeating the label); every rail item's
 * tooltip reads `data-tooltip`. Names are tested in sidenav.badge-name.spec.
 */
describe('lc-sidenav — rail tooltip without title on badged items (3.33, 050-n5)', () => {
  let fixture: ComponentFixture<SidenavComponent>;
  let el: HTMLElement;

  const items: NavigationItem[] = [
    { id: 'cockpit', label: 'Cockpit', icon: 'home', route: '/cockpit', displayOrder: 1 },
    { id: 'runs', label: 'Agent Runs', icon: 'folder', route: '/runs', displayOrder: 2, badge: { value: 3 } },
    {
      id: 'master',
      label: 'Stammdaten',
      icon: 'wallet',
      route: '',
      displayOrder: 3,
      children: [{ id: 'c', label: 'Konten', icon: 'wallet', route: '/konten', displayOrder: 1 }],
    },
  ];

  function render(collapsed: boolean): void {
    TestBed.configureTestingModule({ imports: [SidenavComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(SidenavComponent);
    for (const [name, value] of Object.entries({ mode: 'docked', isOpen: true, width: '240px', items, collapsed })) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  afterEach(() => fixture?.destroy());

  const entry = (label: string) =>
    [...el.querySelectorAll<HTMLElement>('.lc-sidenav__nav-item')].find((e) => e.querySelector('.lc-sidenav__nav-label')?.textContent?.trim() === label) as HTMLElement;

  it('collapsed, badged: no title, the tooltip text in data-tooltip', () => {
    render(true);
    expect(entry('Agent Runs').getAttribute('title')).toBe('');
    expect(entry('Agent Runs').getAttribute('data-tooltip')).toBe('Agent Runs');
  });

  it('collapsed, not badged: title still names it, data-tooltip shows it', () => {
    render(true);
    expect(entry('Cockpit').getAttribute('title')).toBe('Cockpit');
    expect(entry('Cockpit').getAttribute('data-tooltip')).toBe('Cockpit');
    expect(entry('Stammdaten').getAttribute('title')).toBe('Stammdaten');
    expect(entry('Stammdaten').getAttribute('data-tooltip')).toBe('Stammdaten');
  });

  it('expanded: title empty and no data-tooltip, as before', () => {
    render(false);
    for (const label of ['Cockpit', 'Agent Runs', 'Stammdaten']) {
      expect([label, entry(label).getAttribute('title'), entry(label).hasAttribute('data-tooltip')]).toEqual([label, '', false]);
    }
  });

  it('the item tooltip reads data-tooltip, with an empty alt text (not part of the focused item name)', () => {
    const css = compile(resolve(__dirname, 'sidenav.component.scss')).css;
    expect(css).toMatch(
      /\.lc-sidenav--collapsed \.lc-sidenav__nav-item:hover::after, \.lc-sidenav--collapsed \.lc-sidenav__nav-item:focus-visible::after \{\s*content: attr\(data-tooltip\);\s*content: attr\(data-tooltip\) \/ "";/,
    );
    expect(css).not.toMatch(/content: attr\(title\)/);
  });
});
