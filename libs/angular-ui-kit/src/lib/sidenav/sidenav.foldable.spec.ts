import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { SidenavComponent } from './sidenav.component';
import type { NavigationItem, NavigationItemContextMenuEvent } from '@lifecorner/angular-ui-kit/models';
import { audit, computedName, violations } from '../../testing/axe-jsdom';

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

@Component({ standalone: true, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class PageComponent {}

@Component({
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-sidenav
        mode="docked"
        [isOpen]="true"
        [collapsed]="collapsed()"
        [items]="items()"
        [activeRoute]="activeRoute()"
        busyLabel="Wird geladen"
        ariaLabel="Bereiche"
        [(collapsedSections)]="folded"
        [contextMenuOnLongPress]="longPress()"
        (itemClicked)="clicked.push($event.id)"
        (itemContextMenu)="menus.push($event)"
      />
    </div>
  `,
})
class HostComponent {
  readonly collapsed = signal(false);
  readonly activeRoute = signal('/cc');
  readonly longPress = signal(false);
  readonly items = signal<NavigationItem[]>([]);
  folded: readonly string[] = [];
  clicked: string[] = [];
  menus: NavigationItemContextMenuEvent[] = [];
}

const LINK = (id: string, extra: Partial<NavigationItem> = {}): NavigationItem => ({
  id,
  icon: 'file',
  label: id,
  route: `/${id}`,
  displayOrder: 1,
  ...extra,
});

const SECTION = (id: string, children: NavigationItem[], extra: Partial<NavigationItem> = {}): NavigationItem => ({
  id,
  icon: '',
  label: id,
  route: '',
  displayOrder: 1,
  isSection: true,
  children,
  ...extra,
});

/** Request 065: backlog 064-n2 (AC-39), 064-n7 (AC-45), 064-n9 (AC-47). */
describe('lc-sidenav foldable sections, long press, rail badge and title (3.45)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([{ path: '**', component: PageComponent }]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  const el = () => fixture.nativeElement as HTMLElement;
  const item = (label: string) =>
    [...el().querySelectorAll<HTMLElement>('.lc-sidenav__nav-item')].find(
      (n) => n.querySelector('.lc-sidenav__nav-label')?.textContent === label,
    ) as HTMLElement;
  const set = (items: NavigationItem[]) => {
    host.items.set(items);
    fixture.detectChanges();
  };
  const toggles = () => [...el().querySelectorAll<HTMLButtonElement>('.lc-sidenav__section-toggle')];

  const sections = () => [
    SECTION('Stammdaten', [LINK('cc', { label: 'Kostenstellen' })], { collapsible: true }),
    SECTION('Auswertungen', [LINK('monthly', { label: 'Monatsbericht' })], { collapsible: true, displayOrder: 2 }),
    SECTION('Verwaltung', [LINK('users', { label: 'Benutzer' })], { displayOrder: 3 }),
  ];

  describe('AC-39: foldable sections', () => {
    it('a collapsible section heading holds a disclosure button that controls its list', () => {
      set(sections());
      expect(toggles()).toHaveLength(2);
      const [first] = toggles();
      expect(first.parentElement?.tagName).toBe('H2');
      expect(first.parentElement?.className).toBe('lc-sidenav__section-title lc-sidenav__section-title--foldable');
      expect(first.getAttribute('aria-expanded')).toBe('true');
      const list = document.getElementById(first.getAttribute('aria-controls') as string);
      expect(list?.className).toBe('lc-sidenav__section-items');
      expect(list?.hasAttribute('hidden')).toBe(false);
      expect(computedName(el(), first)).toBe('Stammdaten');
    });

    it('a section without collapsible renders as before: plain h2, list without id or hidden', () => {
      set(sections());
      const plain = el().querySelectorAll('.lc-sidenav__section')[2] as HTMLElement;
      expect(plain.querySelector('h2')?.outerHTML).toMatch(/^<h2 class="lc-sidenav__section-title"[^>]*>Verwaltung<\/h2>$/);
      const list = plain.querySelector('ul') as HTMLElement;
      expect(list.hasAttribute('id')).toBe(false);
      expect(list.hasAttribute('hidden')).toBe(false);
    });

    it('a click folds and unfolds, two-way through collapsedSections', () => {
      set(sections());
      const second = toggles()[1];
      second.click();
      fixture.detectChanges();
      expect(host.folded).toEqual(['Auswertungen']);
      expect(second.getAttribute('aria-expanded')).toBe('false');
      expect(second.classList).toContain('lc-sidenav__section-toggle--folded');
      expect(document.getElementById(second.getAttribute('aria-controls') as string)?.hasAttribute('hidden')).toBe(true);
      second.click();
      fixture.detectChanges();
      expect(host.folded).toEqual([]);
      expect(second.getAttribute('aria-expanded')).toBe('true');
    });

    it('the current item moving into a folded section unfolds it; the user may fold it again', () => {
      host.folded = ['Auswertungen'];
      set(sections());
      expect(toggles()[1].getAttribute('aria-expanded')).toBe('false');
      host.activeRoute.set('/monthly');
      fixture.detectChanges();
      fixture.detectChanges();
      expect(host.folded).toEqual([]);
      expect(toggles()[1].getAttribute('aria-expanded')).toBe('true');
      toggles()[1].click();
      fixture.detectChanges();
      fixture.detectChanges();
      expect(host.folded).toEqual(['Auswertungen']);
    });

    it('the rail ignores folding: no heading button, the list shows', () => {
      host.folded = ['Auswertungen'];
      set(sections());
      host.collapsed.set(true);
      fixture.detectChanges();
      const lists = [...el().querySelectorAll('.lc-sidenav__section-items')];
      expect(lists.every((l) => !l.hasAttribute('hidden'))).toBe(true);
    });

    it('styles: 44 px button, −90° chevron while folded, [hidden] beats display: flex', () => {
      const css = compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
      expect(css).toMatch(/\.lc-sidenav__section-toggle \{[^}]*min-height: var\(--size-min-touch-height, 2\.75rem\);/);
      expect(css).toMatch(/\.lc-sidenav__section-toggle--folded \.lc-sidenav__section-chevron \{\s*transform: rotate\(-90deg\);/);
      expect(css).toMatch(/\.lc-sidenav__section-items\[hidden\] \{\s*display: none;/);
      expect(css).toMatch(/\.lc-sidenav__nav--long-press \.lc-sidenav__nav-item \{\s*-webkit-touch-callout: none;/);
    });

    it('is axe clean folded and unfolded', async () => {
      host.folded = ['Auswertungen'];
      set(sections());
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('AC-39: long press', () => {
    const pointer = (type: string, target: Element, init: { x?: number; y?: number; pointerType?: string } = {}) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: init.x ?? 10, clientY: init.y ?? 10 });
      Object.defineProperty(event, 'pointerType', { value: init.pointerType ?? 'touch' });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      target.dispatchEvent(event);
      return event;
    };

    beforeEach(() => {
      jest.useFakeTimers();
      set([LINK('cc', { label: 'Kostenstellen' }), LINK('keys', { label: 'Schlüssel', displayOrder: 2 })]);
    });
    afterEach(() => jest.useRealTimers());

    it('does nothing without the input (default)', () => {
      pointer('pointerdown', item('Kostenstellen'));
      jest.advanceTimersByTime(600);
      expect(host.menus).toHaveLength(0);
    });

    it('a 500 ms touch hold emits itemContextMenu once and swallows the click after it', () => {
      host.longPress.set(true);
      fixture.detectChanges();
      const target = item('Kostenstellen');
      pointer('pointerdown', target);
      jest.advanceTimersByTime(499);
      expect(host.menus).toHaveLength(0);
      jest.advanceTimersByTime(1);
      expect(host.menus).toHaveLength(1);
      expect(host.menus[0].item.id).toBe('cc');
      expect(host.menus[0].event.type).toBe('contextmenu');
      // Android's own contextmenu in the same press is dropped.
      const native = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      target.dispatchEvent(native);
      expect(host.menus).toHaveLength(1);
      pointer('pointerup', target);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      target.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(host.clicked).toEqual([]);
      // The next tap is a normal click.
      pointer('pointerdown', target);
      pointer('pointerup', target);
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(host.clicked).toEqual(['cc']);
    });

    it('a move of more than 10 px, an early release or a mouse cancels it', () => {
      host.longPress.set(true);
      fixture.detectChanges();
      const target = item('Schlüssel');
      pointer('pointerdown', target, { x: 10, y: 10 });
      pointer('pointermove', target, { x: 10, y: 21 });
      jest.advanceTimersByTime(600);
      pointer('pointerdown', target);
      jest.advanceTimersByTime(300);
      pointer('pointerup', target);
      jest.advanceTimersByTime(300);
      pointer('pointerdown', target, { pointerType: 'mouse' });
      jest.advanceTimersByTime(600);
      expect(host.menus).toHaveLength(0);
    });

    it('a native contextmenu before 500 ms wins and the kit does not emit again', () => {
      host.longPress.set(true);
      fixture.detectChanges();
      const target = item('Kostenstellen');
      pointer('pointerdown', target);
      jest.advanceTimersByTime(400);
      target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      jest.advanceTimersByTime(300);
      expect(host.menus).toHaveLength(1);
    });
  });

  describe('AC-45: rail badge', () => {
    it('a value longer than 2 characters is a dot on the rail only; the text stays in the name', () => {
      set([
        LINK('inc', { label: 'Incidents', badge: { value: '56/60', ariaLabel: '56 von 60 geladen' } }),
        LINK('orders', { label: 'Orders', badge: { value: 12 }, displayOrder: 2 }),
      ]);
      expect(el().querySelector('.lc-sidenav__nav-badge--dot')).toBeNull();
      host.collapsed.set(true);
      fixture.detectChanges();
      const dots = [...el().querySelectorAll('.lc-sidenav__nav-badge--dot')];
      expect(dots).toHaveLength(1);
      expect(item('Incidents').contains(dots[0])).toBe(true);
      // The rail's hidden text leads with the label (the visible label is display: none there).
      expect(item('Incidents').querySelector('.lc-sidenav__sr-only')?.textContent).toBe('Incidents 56 von 60 geladen');
      expect(item('Orders').querySelector('.lc-sidenav__nav-badge')?.classList).not.toContain('lc-sidenav__nav-badge--dot');
    });

    it('the dot is 8 px, drawn by a 4 px border, after the count rule at its weight', () => {
      const css = compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
      const count = css.indexOf('.lc-sidenav--collapsed .lc-sidenav__nav-badge .lc-badge {');
      const dot = css.indexOf('.lc-sidenav--collapsed .lc-sidenav__nav-badge--dot .lc-badge {');
      expect(count).toBeGreaterThan(-1);
      expect(dot).toBeGreaterThan(count);
      expect(css.slice(dot)).toMatch(/^[^}]*width: 8px;\s*height: 8px;\s*padding: 0;\s*border: 4px solid;\s*border-radius: 50%;/);
    });
  });

  describe('AC-47: no title on busy rail items', () => {
    it('a busy rail item has an empty title and no description; others keep the label', () => {
      set([LINK('Berichte', { busy: true }), LINK('Verträge', { displayOrder: 2 })]);
      host.collapsed.set(true);
      fixture.detectChanges();
      expect(item('Berichte').getAttribute('title')).toBe('');
      expect(item('Verträge').getAttribute('title')).toBe('Verträge');
    });
  });
});
