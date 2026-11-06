import { ApplicationRef, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { SidenavComponent, type SidenavMode } from './sidenav.component';
import { NavigationItem } from '../models/navigation-item.interface';

/**
 * 3.35 (request 055, 054-n3, AC-14): in drawer mode `returnFocusTo` gives the
 * focus to the named element after the panel closed. The tests start with
 * `body` active, as after a WebKit tap, which doesn't focus the button.
 */

// jsdom has no matchMedia; the mock lets a test flip the viewport.
let mediaListeners: Array<(e: MediaQueryListEvent) => void> = [];
let mediaMatches = false;
function emitViewportChange(matches: boolean): void {
  mediaMatches = matches;
  mediaListeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: mediaMatches,
    media: query,
    addEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) => mediaListeners.push(listener),
    removeEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) => {
      mediaListeners = mediaListeners.filter((l) => l !== listener);
    },
  })),
});

const ITEMS: NavigationItem[] = [
  { id: 'overview', label: 'Übersicht', icon: 'home', route: '/overview', displayOrder: 1 },
  { id: 'month', label: 'Monatsstand', icon: 'calendar', route: '/month', displayOrder: 2 },
];

@Component({
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="opener">Öffnen</button>
    <button type="button" class="target">Navigation öffnen</button>
    <lc-sidenav
      [isOpen]="open()"
      [mode]="mode()"
      [items]="items"
      brandName="LifeCorner"
      brandHref="/"
      [returnFocusTo]="target()"
      (closed)="open.set(false)"
    />
  `,
})
class Host {
  readonly open = signal(false);
  readonly mode = signal<SidenavMode>('drawer');
  readonly target = signal<HTMLElement | null>(null);
  readonly items = ITEMS;
}

const checker: Partial<InteractivityChecker> = {
  isDisabled: (e: HTMLElement) => e.hasAttribute('disabled'),
  isVisible: () => true,
  isFocusable: (e: HTMLElement) => !e.hasAttribute('disabled'),
  isTabbable: (e: HTMLElement) => !e.hasAttribute('disabled') && e.tabIndex >= 0,
};

describe('SidenavComponent — returnFocusTo (3.35, request 055)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
  const extras: HTMLElement[] = [];

  beforeEach(() => {
    mediaListeners = [];
    mediaMatches = false;
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([]), { provide: InteractivityChecker, useValue: checker }],
    });
    jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    fixture?.destroy();
    jest.restoreAllMocks();
    extras.splice(0).forEach((e) => e.remove());
    (document.activeElement as HTMLElement | null)?.blur();
  });

  /** Renders and runs the after-render hooks. */
  function settle() {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  }

  function create(mode: SidenavMode = 'drawer') {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    host.mode.set(mode);
    settle();
  }

  /** Opens the drawer with `body` active (the WebKit tap). */
  function openWithBodyActive(target: HTMLElement | null | 'target' = 'target', mode: SidenavMode = 'drawer') {
    create(mode);
    host.target.set(target === 'target' ? el('.target') : target);
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.activeElement).toBe(document.body);
    host.open.set(true);
    settle();
    expect(el('aside.lc-sidenav').contains(document.activeElement)).toBe(true);
  }

  describe('every close path gives the focus to the element', () => {
    const paths: Array<[string, () => void]> = [
      ['the close button', () => el<HTMLButtonElement>('.lc-sidenav__close').click()],
      ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))],
      ['the backdrop', () => el<HTMLElement>('.lc-sidenav__overlay').click()],
      ['[isOpen] set to false by the page', () => host.open.set(false)],
    ];

    it.each(paths)('%s', (_name, close) => {
      openWithBodyActive();
      close();
      settle();
      expect(document.querySelector('aside.lc-sidenav')).toBeNull();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('an item tap on a phone (docked below the breakpoint)', () => {
      mediaMatches = true;
      openWithBodyActive('target', 'docked');
      el<HTMLAnchorElement>('a.lc-sidenav__nav-item').click();
      settle();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('a brand tap on a phone', () => {
      mediaMatches = true;
      openWithBodyActive('target', 'docked');
      el<HTMLAnchorElement>('.lc-sidenav__brand').click();
      settle();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('destroying an open sidenav still returns the focus', () => {
      openWithBodyActive();
      fixture.destroy();
      TestBed.inject(ApplicationRef).tick();
      expect(document.activeElement).toBe(el('.target'));
    });

    it('the drawer becoming docked while open (viewport grows) hands it over too', () => {
      mediaMatches = true;
      openWithBodyActive('target', 'docked');
      emitViewportChange(false);
      settle();
      expect(el('aside.lc-sidenav').classList).toContain('lc-sidenav--docked');
      expect(document.activeElement).toBe(el('.target'));
    });

    it('works again on the next open and close', () => {
      openWithBodyActive();
      host.open.set(false);
      settle();
      (document.activeElement as HTMLElement).blur();
      host.open.set(true);
      settle();
      el<HTMLButtonElement>('.lc-sidenav__close').click();
      settle();
      expect(document.activeElement).toBe(el('.target'));
    });
  });

  describe('docked mode and state guards', () => {
    it('docked: opening and closing moves no focus', () => {
      create('docked');
      host.target.set(el('.target'));
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      settle();
      host.open.set(false);
      settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('changing the input alone moves no focus', () => {
      create();
      el<HTMLButtonElement>('.opener').focus();
      host.target.set(el('.target'));
      settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('reopened before the render: the hook does nothing', () => {
      openWithBodyActive();
      host.open.set(false);
      fixture.detectChanges();
      host.open.set(true);
      settle();
      expect(el('aside.lc-sidenav').contains(document.activeElement)).toBe(true);
    });
  });

  describe('an element that is gone or cannot take focus', () => {
    it('removed while open: the captured opener gets the focus', () => {
      create();
      const doomed = document.createElement('button');
      document.body.appendChild(doomed);
      host.target.set(doomed);
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      settle();
      doomed.remove();
      host.open.set(false);
      settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('an <x-trigger> host hands the focus to its first focusable descendant', () => {
      const trigger = document.createElement('x-trigger');
      const inner = document.createElement('button');
      trigger.appendChild(inner);
      document.body.appendChild(trigger);
      extras.push(trigger);
      openWithBodyActive(trigger);
      el<HTMLButtonElement>('.lc-sidenav__close').click();
      settle();
      expect(document.activeElement).toBe(inner);
    });
  });

  describe('unset, nothing changes (3.34)', () => {
    it('null: the captured element gets the focus (body after a WebKit tap)', () => {
      openWithBodyActive(null);
      el<HTMLButtonElement>('.lc-sidenav__close').click();
      settle();
      expect(document.querySelector('aside.lc-sidenav')).toBeNull();
      expect(document.activeElement).toBe(document.body);
    });

    it('null: a focused opener gets it back', () => {
      create();
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('the input renders nothing: the sidenav DOM is the same with and without it', () => {
      openWithBodyActive(null);
      const strip = (html: string) => html.replace(/_ng(host|content)-[\w-]+(="")?/g, '');
      const without = strip(el('lc-sidenav').outerHTML);
      host.target.set(el('.target'));
      fixture.detectChanges();
      expect(strip(el('lc-sidenav').outerHTML)).toBe(without);
    });
  });
});
