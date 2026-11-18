import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { SidenavComponent } from './sidenav.component';
import type { NavigationItem, NavigationItemActionEvent } from '@lifecorner/angular-ui-kit/models';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * Request 068 (3.48, design §2, §3): 067-n4 (`action.hasPopup` and
 * `expandedActionId`, declarative) and 067-s1 (row actions always visible
 * under `hover: none`).
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

const item = (id: string, label: string, extra: Partial<NavigationItem> = {}): NavigationItem => ({
  id,
  icon: 'file',
  label,
  route: `/${id}`,
  displayOrder: 1,
  ...extra,
});

const ITEMS: NavigationItem[] = [
  item('inbox', 'Eingang', { action: { icon: 'dots', ariaLabel: 'Aktionen für Eingang', hasPopup: 'menu' } }),
  item('drafts', 'Entwürfe', { action: { icon: 'plus', ariaLabel: 'Neuer Entwurf' } }),
  item('wf', 'Workflows', {
    route: '',
    children: [item('review', 'Prüfung', { action: { icon: 'dots', ariaLabel: 'Aktionen für Prüfung', hasPopup: 'dialog' } })],
  }),
];

@Component({
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-sidenav [isOpen]="true" mode="docked" [mobileBreakpoint]="0" [items]="items" [expandedGroups]="['wf']"
                ariaLabel="Navigation" [expandedActionId]="open()" (itemActionClick)="events.push($event)" />
  `,
})
class Host {
  readonly items = ITEMS;
  readonly open = signal<string | null>(null);
  readonly events: NavigationItemActionEvent[] = [];
}

describe('lc-sidenav action popup and touch (3.48)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const button = (name: string) => fixture.nativeElement.querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('067-n4: hasPopup renders aria-haspopup and aria-expanded="false" (at every level); without it, nothing', () => {
    expect(button('Aktionen für Eingang').getAttribute('aria-haspopup')).toBe('menu');
    expect(button('Aktionen für Eingang').getAttribute('aria-expanded')).toBe('false');
    expect(button('Aktionen für Prüfung').getAttribute('aria-haspopup')).toBe('dialog');
    expect(button('Aktionen für Prüfung').getAttribute('aria-expanded')).toBe('false');
    expect(button('Neuer Entwurf').hasAttribute('aria-haspopup')).toBe(false);
    expect(button('Neuer Entwurf').hasAttribute('aria-expanded')).toBe(false);
  });

  it('067-n4: expandedActionId sets aria-expanded="true" on that item’s button only', () => {
    host.open.set('review');
    fixture.detectChanges();
    expect(button('Aktionen für Prüfung').getAttribute('aria-expanded')).toBe('true');
    expect(button('Aktionen für Eingang').getAttribute('aria-expanded')).toBe('false');
    host.open.set('drafts');
    fixture.detectChanges();
    expect(button('Neuer Entwurf').hasAttribute('aria-expanded')).toBe(false);
  });

  it('067-n4: itemActionClick is unchanged ({ item, event, element })', () => {
    button('Aktionen für Eingang').click();
    expect(host.events).toHaveLength(1);
    expect(host.events[0].item.id).toBe('inbox');
    expect(host.events[0].element).toBe(button('Aktionen für Eingang'));
  });

  it('axe: no violations with a popup action expanded', async () => {
    host.open.set('inbox');
    fixture.detectChanges();
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });

  it('067-s1: under hover: none the row actions show at rest, after the rest rule at its weight', () => {
    const css = compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const touch = css.lastIndexOf('@media (hover: none)');
    expect(touch).toBeGreaterThan(css.indexOf('.lc-sidenav__nav-item-row .lc-sidenav__action-btn {'));
    expect(css.slice(touch).replace(/\s+/g, ' ')).toMatch(
      /^@media \(hover: none\) \{ \.lc-sidenav__nav-item-row \.lc-sidenav__action-btn \{ opacity: 1; \} \}/,
    );
  });
});
