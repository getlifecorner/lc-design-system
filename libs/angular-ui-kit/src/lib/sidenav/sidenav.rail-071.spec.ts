import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { join } from 'path';
import { TooltipDirective } from '@lifecorner/angular-ui-kit/tooltip';
import { LABEL_IN_NAME, audit, computedName, installFakeCanvas, outcome, violations } from '../../testing/axe-jsdom';
import { SidenavComponent, type SidenavBrandLogoFit, type SidenavMode } from './sidenav.component';
import type { NavigationItem, NavigationRailItemEvent } from '../models/navigation-item.interface';

// JSDOM has no matchMedia; `mobile` flips what the sidenav reads for its breakpoint.
let mobile = false;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: mobile,
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
 * Request 071 (3.50, usm-x rows 74–76, AC-1 … AC-5): the `[sidenav-rail-top]`
 * slot, `railItems` + `railItemClick`, `NavigationItem.hasPopup`,
 * `brandToggle`, `brandLogoFit` and the cut label in the row tooltip.
 */
const ITEMS: NavigationItem[] = [
  { id: 'start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  {
    id: 'stamm',
    icon: 'folder',
    label: 'Stammdaten',
    route: '',
    displayOrder: 2,
    children: [{ id: 'objekttypen', icon: 'cube', label: 'Objekttypen', route: '/stamm/objekttypen', displayOrder: 1 }],
  },
  { id: 'lang', icon: 'document', label: 'Rechnungsfreigabe Kostenstelle 4711', route: '/lang', displayOrder: 3, tooltip: 'Wird im Rich Client bearbeitet' },
  { id: 'plain', icon: 'document', label: 'Lange Bezeichnung ohne Tooltip', route: '/plain', displayOrder: 4 },
];

const RAIL: NavigationItem[] = [
  { id: 'r-start', icon: 'home', label: 'Übersicht', route: '/start', displayOrder: 1 },
  { id: 'r-stamm', icon: 'folder', label: 'Stammdaten', route: '', kind: 'action', hasPopup: 'menu', displayOrder: 3, children: [{ id: 'x', label: 'ignored', route: '/x', displayOrder: 1 }] },
  { id: 'r-pruef', icon: 'check', label: 'Prüfungen', route: '/pruef', matchRoutes: ['/stamm/objekttypen'], displayOrder: 2, badge: { value: 3 } },
  { id: 'r-hilfe', icon: 'question', label: 'Hilfe', route: '', kind: 'action', displayOrder: 4 },
];

const SQUARE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'/%3E";

@Component({
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-sidenav
      [isOpen]="true"
      [mode]="mode()"
      [mobileBreakpoint]="0"
      [items]="items"
      [railItems]="railItems()"
      [(collapsed)]="collapsed"
      [expandedActionId]="expandedActionId()"
      activeRoute="/stamm/objekttypen"
      brandName="USM X"
      brandSubtitle="Customizing"
      [brandToggle]="brandToggle()"
      [brandLogoSrc]="logo()"
      [brandLogoFit]="fit()"
      brandLetter="X"
      [brandAriaLabel]="brandAriaLabel()"
      [collapseAriaLabel]="collapseLabel()"
      [expandAriaLabel]="expandLabel()"
      (railItemClick)="railClicks.push($event)"
      (itemClicked)="clicked.push($event.id)"
    >
      <div sidenav-top class="picker-full">Bereich</div>
      <button sidenav-rail-top type="button" class="picker-icon" aria-label="Bereich wählen">B</button>
    </lc-sidenav>
  `,
})
class HostComponent {
  readonly items = ITEMS;
  readonly mode = signal<SidenavMode>('docked');
  readonly railItems = signal<NavigationItem[] | null>(null);
  readonly collapsed = signal(false);
  readonly expandedActionId = signal<string | null>(null);
  readonly brandToggle = signal(false);
  readonly logo = signal('');
  readonly fit = signal<SidenavBrandLogoFit>('tile');
  readonly collapseLabel = signal('');
  readonly brandAriaLabel = signal('');
  readonly expandLabel = signal('Expand navigation');
  readonly railClicks: NavigationRailItemEvent[] = [];
  readonly clicked: string[] = [];
}

describe('lc-sidenav rail, brand and cut labels (3.50)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const aside = () => el().querySelector('aside') as HTMLElement;
  const update = () => fixture.detectChanges();
  const row = (label: string) =>
    Array.from(el().querySelectorAll<HTMLElement>('.lc-sidenav__nav-item')).find((i) => i.querySelector('.lc-sidenav__nav-label')?.textContent === label) as HTMLElement;
  const css = '\n' + compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  beforeEach(async () => {
    mobile = false;
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    update();
  });

  afterEach(() => {
    fixture.destroy();
    el().remove();
  });

  describe('AC-1: [sidenav-rail-top]', () => {
    it('expanded: no rail-top wrapper (the content is not shown); [sidenav-top] as before', () => {
      expect(el().querySelector('.lc-sidenav__rail-top')).toBeNull();
      expect(el().querySelector('.picker-icon')).toBeNull();
      expect(el().querySelector('.lc-sidenav__top .picker-full')).not.toBeNull();
    });

    it('collapsed: the projected content sits in the rail-top wrapper between the brand (and top) and the items', () => {
      host.collapsed.set(true);
      update();
      const wrapper = el().querySelector('.lc-sidenav__rail-top') as HTMLElement;
      expect(wrapper.querySelector('.picker-icon')).not.toBeNull();
      expect([...aside().children].map((c) => c.classList[0])).toEqual([
        'lc-sidenav__logo',
        'lc-sidenav__top',
        'lc-sidenav__rail-top',
        'lc-sidenav__nav',
        'lc-sidenav__content',
      ]);
    });

    it('drawer: no rail-top wrapper', () => {
      host.collapsed.set(true);
      host.mode.set('drawer');
      update();
      expect(el().querySelector('.lc-sidenav__rail-top')).toBeNull();
    });

    it('CSS: centred column, 8 / 6 / 0 padding, children at most 44 px, no box when empty', () => {
      expect(rule('.lc-sidenav__rail-top')).toBe(
        'display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2, 0.5rem); flex-shrink: 0; padding: var(--spacing-2, 0.5rem) var(--spacing-1-5, 0.375rem) 0;',
      );
      expect(rule('.lc-sidenav__rail-top:empty')).toBe('display: none;');
      // projected children carry no _ngcontent: ::ng-deep (Angular drops it when it scopes the sheet)
      expect(rule('.lc-sidenav__rail-top > ::ng-deep *')).toBe('max-inline-size: var(--size-min-touch-width, 2.75rem);');
    });
  });

  describe('AC-2: railItems', () => {
    it('null (default): the rail draws items as before', () => {
      host.collapsed.set(true);
      update();
      expect(el().querySelector('.lc-sidenav__nav--rail-items')).toBeNull();
      expect(row('Stammdaten')).toBeTruthy();
    });

    it('collapsed: the rail draws railItems only, by displayOrder, one icon each (children ignored)', () => {
      host.railItems.set(RAIL);
      host.collapsed.set(true);
      update();
      const nav = el().querySelector('.lc-sidenav__nav--rail-items') as HTMLElement;
      expect(nav.getAttribute('aria-label')).toBe('Side navigation');
      expect(el().querySelectorAll('nav')).toHaveLength(1);
      expect([...nav.querySelectorAll('.lc-sidenav__nav-item')].map((i) => [i.tagName, i.getAttribute('data-tooltip')])).toEqual([
        ['A', 'Übersicht'],
        ['A', 'Prüfungen'],
        ['BUTTON', 'Stammdaten'],
        ['BUTTON', 'Hilfe'],
      ]);
      expect(nav.textContent).not.toContain('ignored');
      expect(nav.querySelector('.lc-sidenav__nav-chevron')).toBeNull();
    });

    it('current: by matchRoutes as for items (or the first with current)', () => {
      host.railItems.set(RAIL);
      host.collapsed.set(true);
      update();
      expect(row('Prüfungen').getAttribute('aria-current')).toBe('page');
      expect(row('Prüfungen').classList.contains('lc-sidenav__nav-item--active')).toBe(true);
      host.railItems.set(RAIL.map((i) => (i.id === 'r-hilfe' ? { ...i, current: true } : i)));
      update();
      expect(row('Hilfe').getAttribute('aria-current')).toBe('page');
      expect(row('Prüfungen').hasAttribute('aria-current')).toBe(false);
    });

    it('a press emits itemClicked and railItemClick with the element', () => {
      host.railItems.set(RAIL);
      host.collapsed.set(true);
      update();
      row('Stammdaten').click();
      expect(host.clicked).toEqual(['r-stamm']);
      expect(host.railClicks.map((e) => [e.item.id, e.element === row('Stammdaten'), e.event instanceof MouseEvent])).toEqual([['r-stamm', true, true]]);
    });

    it('hasPopup: aria-haspopup and aria-expanded (true while expandedActionId is its id); none without', () => {
      host.railItems.set(RAIL);
      host.collapsed.set(true);
      update();
      expect([row('Stammdaten').getAttribute('aria-haspopup'), row('Stammdaten').getAttribute('aria-expanded')]).toEqual(['menu', 'false']);
      expect(row('Hilfe').hasAttribute('aria-haspopup')).toBe(false);
      expect(row('Hilfe').hasAttribute('aria-expanded')).toBe(false);
      host.expandedActionId.set('r-stamm');
      update();
      expect(row('Stammdaten').getAttribute('aria-expanded')).toBe('true');
    });

    it('expanded: items show as before', () => {
      host.railItems.set(RAIL);
      update();
      expect(el().querySelector('.lc-sidenav__nav--rail-items')).toBeNull();
      expect(row('Rechnungsfreigabe Kostenstelle 4711')).toBeTruthy();
    });

    it('axe: no violations on the rail with railItems and the rail-top slot', async () => {
      const restore = installFakeCanvas();
      host.railItems.set(RAIL);
      host.collapsed.set(true);
      update();
      expect(violations(await audit(el()))).toEqual([]);
      restore();
    });
  });

  describe('AC-3: brandToggle', () => {
    const brand = () => el().querySelector('.lc-sidenav__brand') as HTMLElement;

    it('default: the brand is the home link as before', () => {
      expect(brand().tagName).toBe('A');
    });

    it('docked: one button that collapses and expands the rail, named brand + what a press does; same element in both states', () => {
      host.brandToggle.set(true);
      update();
      const button = brand();
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.classList.contains('lc-sidenav__brand--toggle')).toBe(true);
      // named by its content (the visible name stays in the name, WCAG 2.5.3) and a hidden suffix
      expect(button.hasAttribute('aria-label')).toBe(false);
      expect(computedName(el(), button)).toBe('USM X Customizing, Collapse navigation to the left');
      expect(el().querySelectorAll('.lc-sidenav__logo button')).toHaveLength(1);
      button.focus();
      button.click();
      update();
      expect(host.collapsed()).toBe(true);
      expect(brand()).toBe(button);
      expect(document.activeElement).toBe(button);
      expect(computedName(el(), button)).toBe('USM X Customizing, Expand navigation');
      expect(button.getAttribute('data-tooltip')).toBe('USM X');
      button.click();
      update();
      expect(host.collapsed()).toBe(false);
    });

    it('German labels; label-in-name passes with the letter tile (axe)', async () => {
      host.brandToggle.set(true);
      host.collapseLabel.set('Navigation nach links einklappen');
      host.expandLabel.set('Navigation ausklappen');
      update();
      expect(computedName(el(), brand())).toBe('USM X Customizing, Navigation nach links einklappen');
      const restore = installFakeCanvas();
      const results = await audit(el());
      restore();
      expect(violations(results)).toEqual([]);
      expect(outcome(results, LABEL_IN_NAME)).not.toBe('violation');
      host.collapsed.set(true);
      update();
      expect(computedName(el(), brand())).toBe('USM X Customizing, Navigation ausklappen');
    });

    it('with brandAriaLabel: named by it, then what a press does (aria-label)', () => {
      host.brandToggle.set(true);
      host.brandAriaLabel.set('USM X – Customizing');
      update();
      expect(brand().getAttribute('aria-label')).toBe('USM X – Customizing, Collapse navigation to the left');
      expect(brand().querySelector(':scope > .lc-sidenav__sr-only')).toBeNull();
    });

    it('drawer: the brand stays a link', () => {
      host.brandToggle.set(true);
      host.mode.set('drawer');
      update();
      expect(brand().tagName).toBe('A');
    });

    it('CSS: the button keeps the link box (reset only; positioned for its hidden text)', () => {
      expect(rule('.lc-sidenav__brand--toggle')).toBe('position: relative; margin: 0; border: 0; background: none; font: inherit; text-align: start; cursor: pointer;');
    });
  });

  describe('AC-4: brandLogoFit', () => {
    it("'tile' (default): the logo in the tile as before", () => {
      host.logo.set(SQUARE);
      update();
      expect(el().querySelector('.lc-sidenav__brand-tile .lc-sidenav__brand-img')).not.toBeNull();
      expect(el().querySelector('.lc-sidenav__brand-logo')).toBeNull();
    });

    it("'natural': the logo without a tile; on the rail the tile with the letter", () => {
      host.logo.set(SQUARE);
      host.fit.set('natural');
      update();
      const logo = el().querySelector('.lc-sidenav__brand > img.lc-sidenav__brand-logo') as HTMLImageElement;
      expect(logo.getAttribute('alt')).toBe('');
      expect(el().querySelector('.lc-sidenav__brand-tile')).toBeNull();
      host.collapsed.set(true);
      update();
      expect(el().querySelector('.lc-sidenav__brand-logo')).toBeNull();
      expect(el().querySelector('.lc-sidenav__brand-tile')?.textContent?.trim()).toBe('X');
      expect(el().querySelector('.lc-sidenav__brand-img')).toBeNull();
    });

    it("'natural' without brandLogoSrc: the tile as before", () => {
      host.fit.set('natural');
      update();
      expect(el().querySelector('.lc-sidenav__brand-tile')?.textContent?.trim()).toBe('X');
    });

    it('CSS: hook height (24 px), auto width up to the brand, contained, the filter hook', () => {
      expect(rule('.lc-sidenav__brand-logo')).toBe(
        'display: block; flex: none; block-size: var(--lc-sidenav-brand-logo-height, 24px); inline-size: auto; max-inline-size: 100%; object-fit: contain; filter: var(--lc-sidenav-brand-logo-filter, none);',
      );
      expect(rule('.lc-sidenav__brand-img')).toBe('display: block; width: 24px; height: 24px; object-fit: contain; filter: var(--lc-sidenav-brand-logo-filter, none);');
    });
  });

  describe('AC-5: a cut label and the row tooltip', () => {
    const cut = (label: string) => {
      const span = row(label).querySelector('.lc-sidenav__nav-label') as HTMLElement;
      Object.defineProperty(span, 'scrollWidth', { configurable: true, get: () => 300 });
      Object.defineProperty(span, 'clientWidth', { configurable: true, get: () => 100 });
      return span;
    };
    const tooltipOf = (label: string) => {
      const debug = fixture.debugElement.queryAll((d) => d.nativeElement === row(label))[0];
      return debug.injector.get(TooltipDirective).lcTooltip();
    };

    it('not cut: the tooltip is the row tooltip alone', () => {
      expect(tooltipOf('Rechnungsfreigabe Kostenstelle 4711')).toBe('Wird im Rich Client bearbeitet');
    });

    it('cut, on pointer over: „{label} · {tooltip}“ at once (before the tooltip shows); no title', () => {
      cut('Rechnungsfreigabe Kostenstelle 4711');
      row('Rechnungsfreigabe Kostenstelle 4711').dispatchEvent(new Event('pointerover', { bubbles: true }));
      // no fixture.detectChanges(): the sidenav renders the change itself
      expect(tooltipOf('Rechnungsfreigabe Kostenstelle 4711')).toBe('Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet');
      expect(row('Rechnungsfreigabe Kostenstelle 4711').querySelector('[title]')).toBeNull();
    });

    it('cut, on keyboard focus: the shown tooltip has the full label', () => {
      cut('Rechnungsfreigabe Kostenstelle 4711');
      row('Rechnungsfreigabe Kostenstelle 4711').focus();
      expect(tooltipOf('Rechnungsfreigabe Kostenstelle 4711')).toBe('Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet');
      // the tooltip takes its text once, when it shows (on this focus): render it and read it
      update();
      const shown = document.querySelector('lc-tooltip-content') as HTMLElement | null;
      expect(shown?.textContent).toContain('Rechnungsfreigabe Kostenstelle 4711 · Wird im Rich Client bearbeitet');
      row('Rechnungsfreigabe Kostenstelle 4711').blur();
    });

    it('a row without a kit tooltip keeps the title (as before)', () => {
      const span = cut('Lange Bezeichnung ohne Tooltip');
      row('Lange Bezeichnung ohne Tooltip').dispatchEvent(new Event('pointerover', { bubbles: true }));
      update();
      expect(span.getAttribute('title')).toBe('Lange Bezeichnung ohne Tooltip');
      expect(tooltipOf('Lange Bezeichnung ohne Tooltip')).toBe('');
    });
  });
});
