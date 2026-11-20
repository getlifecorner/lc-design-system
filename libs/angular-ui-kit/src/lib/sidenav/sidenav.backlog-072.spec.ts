import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { join } from 'path';
import { TooltipDirective } from '@lifecorner/angular-ui-kit/tooltip';
import { audit, computedName, violations } from '../../testing/axe-jsdom';
import { SidenavComponent, type SidenavMode } from './sidenav.component';
import { SidenavRailDirective } from './sidenav-rail.directive';
import type { NavigationItem, NavigationRailItemEvent } from '../models/navigation-item.interface';

// JSDOM has no matchMedia; the sidenav reads it for its breakpoint.
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
 * Request 072 (3.51): backlog 071-n1 (`railGroupMenu`), 071-n2
 * (`[sidenav-brand-mark]`), 071-n5 (`ng-template[lcSidenavRail]`) and 071-n8
 * (a cut label's tooltip described without the label). Geometry (8 px beside
 * the rail, 44 px targets, the mark at the tile's place) is measured on the
 * stories *Rail Group Menu*, *Rail Group Menu RTL*, *Brand Mark Slot* and
 * *Rail Template*.
 */
const ITEMS: NavigationItem[] = [
  { id: 'start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  { id: 'lang', icon: 'document', label: 'Rechnungsfreigabe Kostenstelle 4711', route: '/lang', displayOrder: 2, tooltip: 'Wird im Rich Client bearbeitet' },
];

const STAMM: NavigationItem = {
  id: 'stamm',
  icon: 'folder',
  label: 'Stammdaten',
  route: '',
  kind: 'action',
  hasPopup: 'menu',
  displayOrder: 2,
  children: [
    {
      id: 'objekte',
      label: 'Objekte',
      route: '',
      displayOrder: 1,
      children: [
        { id: 'objekttypen', label: 'Objekttypen', route: '/stamm/objekttypen', displayOrder: 1 },
        { id: 'felder', label: 'Felder', route: '/stamm/felder', displayOrder: 2 },
      ],
    },
    { id: 'zaehler', icon: 'clock', label: 'Zähler', route: '/stamm/zaehler', displayOrder: 2, busy: true },
    { id: 'pruefungen', label: 'Prüfungen', route: '/stamm/pruefungen', displayOrder: 3, badge: { value: 12, variant: 'warning' }, hint: 'offen' },
    { id: 'archiv', label: 'Archiv', route: '/stamm/archiv', displayOrder: 4, disabled: true, disabledReason: 'Kein Recht für diesen Bereich' },
    { id: 'neu', label: 'Neu anlegen', route: '', kind: 'action', displayOrder: 5, tooltip: 'Öffnet den Assistenten' },
  ],
};

const RAIL: NavigationItem[] = [
  { id: 'r-start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  STAMM,
  { id: 'system', icon: 'cog', label: 'System', route: '', displayOrder: 3, hasChildren: true },
  { id: 'leer', icon: 'folder', label: 'Leer', route: '/leer', displayOrder: 4, children: [] },
  { id: 'gesperrt', icon: 'lock', label: 'Gesperrt', route: '', displayOrder: 5, disabled: true, children: [{ id: 'g1', label: 'G1', route: '/g1', displayOrder: 1 }] },
];

@Component({
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="before">Vorher</button>
    <lc-sidenav
      [isOpen]="true"
      [mode]="mode()"
      [mobileBreakpoint]="0"
      [items]="items"
      [railItems]="railItems()"
      [railGroupMenu]="railGroupMenu()"
      [(collapsed)]="collapsed"
      [activeRoute]="activeRoute()"
      brandName="USM X"
      brandLetter="X"
      (railItemClick)="railClicks.push($event)"
      (itemClicked)="clicked.push($event.id)"
      (expandRequested)="requested.push($event.id)"
    >
      <svg sidenav-brand-mark class="mark" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>
    </lc-sidenav>
  `,
})
class HostComponent {
  readonly items = ITEMS;
  readonly mode = signal<SidenavMode>('docked');
  readonly railItems = signal<NavigationItem[] | null>(RAIL);
  readonly railGroupMenu = signal(true);
  readonly collapsed = signal(true);
  readonly activeRoute = signal('/stamm/objekttypen');
  readonly railClicks: NavigationRailItemEvent[] = [];
  readonly clicked: string[] = [];
  readonly requested: string[] = [];
}

/** The same sidenav without a projected mark (the default brand). */
@Component({
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-sidenav [isOpen]="true" mode="docked" [mobileBreakpoint]="0" [items]="items" brandName="USM X" brandLetter="X" />`,
})
class PlainHostComponent {
  readonly items = ITEMS;
}

/** A rail template beside `railItems` (the template wins). */
@Component({
  imports: [SidenavComponent, SidenavRailDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-sidenav [isOpen]="true" mode="docked" [mobileBreakpoint]="0" [items]="items" [railItems]="rail()" [railGroupMenu]="true" [(collapsed)]="collapsed" activeRoute="/start" ariaLabel="Bereiche">
      <ng-template lcSidenavRail let-entries let-current="current" let-railWidth="railWidth">
        @for (entry of entries; track entry.id) {
          <button type="button" class="lc-sidenav__rail-item app-item" [attr.aria-label]="entry.label" [attr.data-tooltip]="entry.label" [attr.aria-current]="entry === current ? 'page' : null">
            {{ entry.label.slice(0, 2) }}
          </button>
        }
        <span class="width">{{ railWidth }}</span>
        <span class="seen">{{ seen(entries, current, railWidth) }}</span>
      </ng-template>
    </lc-sidenav>
  `,
})
class TemplateHostComponent {
  readonly items = ITEMS;
  readonly rail = signal<NavigationItem[] | null>(RAIL);
  readonly collapsed = signal(true);
  seen(entries: readonly NavigationItem[], current: NavigationItem | null, railWidth: number): string {
    return `${entries.map((e) => e.id).join(',')}|${current?.id ?? '-'}|${railWidth}`;
  }
}

describe('lc-sidenav backlog rows of request 072 (3.51)', () => {
  const css = '\n' + compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  describe('071-n1: railGroupMenu (AC-1 … AC-3)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let navigate: jest.SpyInstance;
    const el = (): HTMLElement => fixture.nativeElement;
    const update = () => fixture.detectChanges();
    const settle = async () => {
      update();
      await fixture.whenStable();
      update();
    };
    const railButton = (label: string) =>
      Array.from(el().querySelectorAll<HTMLElement>('.lc-sidenav__nav--rail-items .lc-sidenav__nav-item')).find((b) => b.getAttribute('data-tooltip') === label) as HTMLElement;
    const menu = () => document.querySelector('.cdk-overlay-container [role="menu"]') as HTMLElement | null;
    const entry = (label: string) =>
      Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container .lc-menu__item')).find((i) => i.querySelector('.lc-menu__item-label')?.textContent === label) as HTMLElement;
    const key = (k: string, target: Element = document.activeElement ?? document.body) => {
      const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      update();
      return event;
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [provideRouter([]), provideHttpClient(withXhr())],
      }).compileComponents();
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      document.body.appendChild(el());
      update();
    });

    afterEach(() => {
      fixture.destroy();
      el().remove();
      navigate.mockRestore();
      (document.body as HTMLElement).focus();
    });

    it('off: the group is the 3.50 action button, no menu host, no anchor; a press emits as before', () => {
      host.railGroupMenu.set(false);
      update();
      const stamm = railButton('Stammdaten');
      expect(stamm.classList.contains('lc-sidenav__nav-item--rail-group')).toBe(false);
      expect(stamm.getAttribute('aria-expanded')).toBe('false');
      expect(el().querySelector('lc-menu, .lc-sidenav__rail-anchor')).toBeNull();
      // a hasChildren entry without kind is the 3.50 link
      expect(railButton('System').tagName).toBe('A');
      stamm.click();
      update();
      expect(host.railClicks.map((e) => e.item.id)).toEqual(['stamm']);
      expect(host.clicked).toEqual(['stamm']);
      expect(menu()).toBeNull();
    });

    it('on: groups are menu buttons; an empty children list stays a plain entry; the menu host and anchor render closed', () => {
      const stamm = railButton('Stammdaten');
      expect(stamm.tagName).toBe('BUTTON');
      expect([stamm.getAttribute('aria-haspopup'), stamm.getAttribute('aria-expanded')]).toEqual(['menu', 'false']);
      expect(railButton('System').getAttribute('aria-haspopup')).toBe('menu');
      expect(railButton('Leer').tagName).toBe('A');
      expect(railButton('Leer').hasAttribute('aria-haspopup')).toBe(false);
      expect(el().querySelector('aside > .lc-sidenav__rail-anchor')).not.toBeNull();
      expect(el().querySelector('aside > lc-menu.lc-sidenav__rail-menu')).not.toBeNull();
      expect(menu()).toBeNull();
    });

    it('a press opens the children in a menu named by the group; railItemClick and itemClicked are still emitted', async () => {
      railButton('Stammdaten').click();
      await settle();
      expect(railButton('Stammdaten').getAttribute('aria-expanded')).toBe('true');
      expect(menu()?.getAttribute('aria-label')).toBe('Stammdaten');
      expect(host.railClicks.map((e) => [e.item.id, e.element === railButton('Stammdaten')])).toEqual([['stamm', true]]);
      expect(host.clicked).toEqual(['stamm']);
      // the focus moves into the menu (the first enabled entry)
      expect(document.activeElement).toBe(entry('Objekttypen'));
    });

    it('AC-2: the map keeps label, icon, current, busy, badge (value, variant), hint, disabled with reason, tooltip and nested groups', async () => {
      railButton('Stammdaten').click();
      await settle();
      const labels = Array.from(document.querySelectorAll('.cdk-overlay-container .lc-menu__item-label')).map((l) => l.textContent);
      expect(labels).toEqual(['Objekttypen', 'Felder', 'Zähler', 'Prüfungen', 'Archiv', 'Neu anlegen']);
      const section = document.querySelector('.cdk-overlay-container .lc-menu__section') as HTMLElement;
      expect(section.getAttribute('role')).toBe('group');
      expect(section.querySelector('.lc-menu__section-heading')?.textContent).toBe('Objekte');
      expect(entry('Objekttypen').getAttribute('aria-current')).toBe('true');
      expect(entry('Felder').hasAttribute('aria-current')).toBe(false);
      expect(entry('Zähler').getAttribute('aria-busy')).toBe('true');
      expect(entry('Zähler').querySelector('lc-icon')).not.toBeNull();
      expect(entry('Prüfungen').querySelector('lc-badge')?.textContent?.trim()).toBe('12');
      expect(entry('Prüfungen').querySelector('lc-badge .lc-badge--warning, lc-badge')).not.toBeNull();
      expect(entry('Prüfungen').querySelector('.lc-menu__item-subtitle')?.textContent).toBe('offen');
      expect(entry('Archiv').getAttribute('aria-disabled')).toBe('true');
      expect(entry('Archiv').hasAttribute('disabled')).toBe(false);
      // the group holds the current link: aria-current="true" and the current look
      expect(railButton('Stammdaten').getAttribute('aria-current')).toBe('true');
      expect(railButton('Stammdaten').classList.contains('lc-sidenav__nav-item--active')).toBe(true);
    });

    it('AC-2: a link entry closes the menu, navigates with the router and emits itemClicked; the focus returns to the rail item', async () => {
      railButton('Stammdaten').click();
      await settle();
      entry('Felder').focus();
      key('Enter');
      await settle();
      expect(navigate).toHaveBeenCalledWith('/stamm/felder');
      expect(host.clicked).toEqual(['stamm', 'felder']);
      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(railButton('Stammdaten'));
    });

    it('AC-2: an action entry emits itemClicked without navigating; a disabled one does nothing', async () => {
      railButton('Stammdaten').click();
      await settle();
      entry('Archiv').click();
      update();
      expect(host.clicked).toEqual(['stamm']);
      entry('Neu anlegen').click();
      await settle();
      expect(host.clicked).toEqual(['stamm', 'neu']);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('AC-3: ArrowRight opens and focuses the first entry; the arrows move; Escape closes and returns the focus', async () => {
      railButton('Stammdaten').focus();
      key('ArrowRight');
      await settle();
      expect(document.activeElement).toBe(entry('Objekttypen'));
      key('ArrowDown');
      expect(document.activeElement).toBe(entry('Felder'));
      const escape = key('Escape');
      await settle();
      expect(escape.defaultPrevented).toBe(true);
      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(railButton('Stammdaten'));
      expect(railButton('Stammdaten').getAttribute('aria-expanded')).toBe('false');
      // the arrow does not emit a press
      expect(host.railClicks).toEqual([]);
    });

    it('AC-3: Escape after railItems were replaced (new objects, the group moved last) returns the focus to the live rail item', async () => {
      railButton('Stammdaten').click();
      await settle();
      host.railItems.set(RAIL.map((item) => ({ ...item, displayOrder: item.id === 'stamm' ? 10 : item.displayOrder })));
      await settle();
      const order = Array.from(el().querySelectorAll('.lc-sidenav__nav--rail-items .lc-sidenav__nav-item')).map((b) => b.getAttribute('data-tooltip'));
      expect(order).toEqual(['Übersicht', 'System', 'Leer', 'Gesperrt', 'Stammdaten']);
      expect(menu()?.getAttribute('aria-label')).toBe('Stammdaten');
      entry('Felder').focus();
      key('Escape');
      await settle();
      expect(document.activeElement).toBe(railButton('Stammdaten'));
    });

    it('a second press closes the menu; another group switches to its menu', async () => {
      railButton('Stammdaten').click();
      await settle();
      railButton('Stammdaten').click();
      await settle();
      expect(menu()).toBeNull();
      railButton('Stammdaten').click();
      await settle();
      railButton('System').click();
      await settle();
      await settle();
      expect(menu()?.getAttribute('aria-label')).toBe('System');
    });

    it('hasChildren without children: expandRequested, the menu shows its busy row', async () => {
      railButton('System').click();
      await settle();
      expect(host.requested).toEqual(['system']);
      expect(document.querySelector('.cdk-overlay-container .lc-menu__loading')).not.toBeNull();
      expect(menu()?.getAttribute('aria-busy')).toBe('true');
    });

    it('a disabled group opens nothing; expanding the rail removes the menu', async () => {
      railButton('Gesperrt').click();
      await settle();
      expect(menu()).toBeNull();
      railButton('Stammdaten').click();
      await settle();
      host.collapsed.set(false);
      await settle();
      expect(menu()).toBeNull();
      expect(el().querySelector('lc-menu')).toBeNull();
      host.collapsed.set(true);
      await settle();
      expect(menu()).toBeNull();
    });

    it('axe: no violations with the menu open', async () => {
      railButton('Stammdaten').click();
      await settle();
      expect(violations(await audit(el()))).toEqual([]);
      expect(violations(await audit(document.querySelector('.cdk-overlay-container') as HTMLElement))).toEqual([]);
    });

    it('CSS: the menu host takes no room; the anchor is hidden; an open group hides its label tooltip', () => {
      expect(rule('.lc-sidenav__rail-menu')).toBe('position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: 0; block-size: 0;');
      expect(rule('.lc-sidenav__rail-anchor')).toBe('position: absolute; visibility: hidden; pointer-events: none;');
      expect(rule(".lc-sidenav--collapsed .lc-sidenav__nav-item.lc-sidenav__nav-item--rail-group[aria-expanded=true]::after")).toBe('content: none;');
    });
  });

  describe('071-n2: [sidenav-brand-mark] (AC-5, AC-6)', () => {
    it('unset: an empty, hidden box before the tile; the brand as before', async () => {
      await TestBed.configureTestingModule({ imports: [PlainHostComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] }).compileComponents();
      const fixture = TestBed.createComponent(PlainHostComponent);
      fixture.detectChanges();
      const brand = fixture.nativeElement.querySelector('.lc-sidenav__brand') as HTMLElement;
      const mark = brand.querySelector('.lc-sidenav__brand-mark') as HTMLElement;
      expect(mark.childNodes).toHaveLength(0);
      expect(mark.getAttribute('aria-hidden')).toBe('true');
      expect(Array.from(brand.children).map((c) => c.className)).toEqual(['lc-sidenav__brand-mark', 'lc-sidenav__brand-tile', 'lc-sidenav__brand-name']);
      expect(computedName(fixture.nativeElement, brand)).toBe('USM X');
      fixture.destroy();
    });

    it('set: the mark sits in the box (decorative), in every state; the name stays brandName', async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      const brand = () => fixture.nativeElement.querySelector('.lc-sidenav__brand') as HTMLElement;
      const mark = () => brand().querySelector('.lc-sidenav__brand-mark > svg.mark');
      expect(mark()).not.toBeNull();
      expect(computedName(fixture.nativeElement, brand())).toBe('USM X');
      fixture.componentInstance.collapsed.set(false);
      fixture.detectChanges();
      expect(mark()).not.toBeNull();
      // docked → drawer → docked: the slot sits in the re-created brand template
      fixture.componentInstance.mode.set('drawer');
      fixture.detectChanges();
      expect(mark()).not.toBeNull();
      fixture.componentInstance.mode.set('docked');
      fixture.detectChanges();
      expect(mark()).not.toBeNull();
      expect(violations(await audit(fixture.nativeElement))).toEqual([]);
      fixture.destroy();
      fixture.nativeElement.remove();
    });

    it('CSS: a 32 × 32 centred box, hidden when empty; a mark hides the tile and the natural logo', () => {
      expect(rule('.lc-sidenav__brand-mark')).toBe('display: grid; place-items: center; flex: none; inline-size: 32px; block-size: 32px;');
      expect(rule('.lc-sidenav__brand-mark:empty')).toBe('display: none;');
      expect(rule('.lc-sidenav__brand-mark > ::ng-deep *')).toBe('display: block; max-inline-size: 100%; max-block-size: 100%;');
      expect(rule('.lc-sidenav__brand-mark:not(:empty) ~ .lc-sidenav__brand-tile,\n.lc-sidenav__brand-mark:not(:empty) ~ .lc-sidenav__brand-logo')).toBe('display: none;');
    });
  });

  describe('071-n5: lcSidenavRail (AC-12, AC-13)', () => {
    let fixture: ComponentFixture<TemplateHostComponent>;
    const el = (): HTMLElement => fixture.nativeElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [TemplateHostComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] }).compileComponents();
      fixture = TestBed.createComponent(TemplateHostComponent);
      fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('the template draws the collapsed rail inside the named nav; it wins over railItems (and the group menu)', () => {
      const navs = Array.from(el().querySelectorAll('nav'));
      expect(navs).toHaveLength(1);
      expect(navs[0].className).toBe('lc-sidenav__nav lc-sidenav__nav--docked lc-sidenav__nav--rail-template');
      expect(navs[0].getAttribute('aria-label')).toBe('Bereiche');
      expect(Array.from(navs[0].querySelectorAll('.app-item')).map((b) => b.getAttribute('aria-label'))).toEqual(['Übersicht', 'Stammdaten', 'System', 'Leer', 'Gesperrt']);
      expect(el().querySelector('lc-menu')).toBeNull();
    });

    it('context: the railItems entries by displayOrder, the rail’s current entry, the rail width (56)', () => {
      expect(el().querySelector('.seen')?.textContent).toBe('r-start,stamm,system,leer,gesperrt|r-start|56');
      expect(el().querySelector('[aria-current="page"]')?.getAttribute('aria-label')).toBe('Übersicht');
    });

    it('without railItems: the items and the current link at any depth', () => {
      fixture.componentInstance.rail.set(null);
      fixture.detectChanges();
      expect(el().querySelector('.seen')?.textContent).toBe('start,lang|start|56');
    });

    it('expanded: the items as before (no template)', () => {
      fixture.componentInstance.collapsed.set(false);
      fixture.detectChanges();
      expect(el().querySelector('.app-item')).toBeNull();
      expect(el().querySelector('nav')?.className).toBe('lc-sidenav__nav lc-sidenav__nav--docked');
    });

    it('CSS: the template column and the public class (44 × 44, one class plus the state, the item ring)', () => {
      expect(rule('.lc-sidenav--collapsed .lc-sidenav__nav--rail-template')).toBe('align-items: center; gap: 2px; padding: var(--spacing-2, 0.5rem) var(--spacing-1-5, 0.375rem);');
      const item = rule('::ng-deep .lc-sidenav__rail-item');
      for (const d of ['display: inline-flex', 'inline-size: var(--size-min-touch-width, 2.75rem)', 'block-size: var(--size-min-touch-height, 2.75rem)', 'color: var(--lc-sidenav-fg, var(--_lc-sidenav-t-fg))']) {
        expect(item).toContain(d);
      }
      expect(rule(".lc-sidenav__nav-item:focus-visible,\n::ng-deep .lc-sidenav__rail-item:focus-visible")).toBe(
        'outline: 2px solid var(--lc-sidenav-focus-ring, var(--_lc-sidenav-t-accent, var(--color-primary-500))); outline-offset: 2px;',
      );
      expect(rule("::ng-deep .lc-sidenav__rail-item[aria-current=page],\n::ng-deep .lc-sidenav__rail-item[aria-current=true]")).toContain(
        'box-shadow: inset 2px 0 0 var(--lc-sidenav-active-indicator, var(--_lc-sidenav-t-accent, var(--color-primary-500)));',
      );
    });
  });

  describe('071-n8: a cut label’s tooltip description (AC-18)', () => {
    let fixture: ComponentFixture<HostComponent>;
    const el = (): HTMLElement => fixture.nativeElement;
    const row = (label: string) =>
      Array.from(el().querySelectorAll<HTMLElement>('.lc-sidenav__nav-item')).find((i) => i.querySelector('.lc-sidenav__nav-label')?.textContent === label) as HTMLElement;
    const LONG = 'Rechnungsfreigabe Kostenstelle 4711';

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([]), provideHttpClient(withXhr())] }).compileComponents();
      fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.collapsed.set(false);
      document.body.appendChild(el());
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.destroy();
      el().remove();
    });

    it('cut: the visible text is „{label} · {tooltip}“, the description the tooltip text only', () => {
      const span = row(LONG).querySelector('.lc-sidenav__nav-label') as HTMLElement;
      Object.defineProperty(span, 'scrollWidth', { configurable: true, get: () => 300 });
      Object.defineProperty(span, 'clientWidth', { configurable: true, get: () => 100 });
      row(LONG).focus();
      fixture.detectChanges();
      const ids = (row(LONG).getAttribute('aria-describedby') ?? '').split(' ');
      expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual(['Wird im Rich Client bearbeitet']);
      expect(document.querySelector('lc-tooltip-content .lc-tooltip-inner')?.textContent).toBe(`${LONG} · Wird im Rich Client bearbeitet`);
      expect(computedName(el(), row(LONG))).toBe(LONG);
      row(LONG).blur();
    });

    it('not cut: the tooltip describes as before (no description element)', () => {
      const debug = fixture.debugElement.queryAll((d) => d.nativeElement === row(LONG))[0];
      expect(debug.injector.get(TooltipDirective).tooltipDescription()).toBe('');
      row(LONG).focus();
      fixture.detectChanges();
      expect(document.querySelector('.lc-tooltip-description')).toBeNull();
      row(LONG).blur();
    });
  });
});
