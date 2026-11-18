import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { SidenavComponent } from './sidenav.component';
import { SidenavLabelDirective } from './sidenav-label.directive';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';
import type { NavigationItem, NavigationItemActionEvent } from '@lifecorner/angular-ui-kit/models';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.47 (request 067, usm-x rows 38–46, AC-S1 … S11): the `[sidenav-top]`
 * slot, the brand inputs, groups at any depth, `expandedGroups`,
 * `itemActionClick`, the label template and highlight, the truncated label's
 * title, Escape on the top-most layer only, and the new CSS hooks.
 */
let mobile = false;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: mobile,
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

/** Workflows › Eingangsrechnungen › Prüfung (action) › Freigabe › „Rechnungsfreigabe …“ (level 5, action). */
function deepTree(archiveChildren?: NavigationItem[], archiveLoading = false): NavigationItem[] {
  return [
    item('start', 'Start', { route: '/', displayOrder: 0, icon: 'home' }),
    item('wf', 'Workflows', {
      route: '',
      children: [
        item('in', 'Eingangsrechnungen', {
          route: '',
          children: [
            item('pr', 'Prüfung', {
              route: '',
              action: { icon: 'dots', ariaLabel: 'Prüfung: Aktionen' },
              children: [
                item('fr', 'Freigabe', {
                  route: '',
                  children: [
                    item('rf', 'Rechnungsfreigabe Kostenstelle 4711', { action: { icon: 'dots', ariaLabel: 'Rechnungsfreigabe: Aktionen' } }),
                    item('sr', 'Freigabe Sammelrechnung'),
                  ],
                }),
                item('ar', 'Archiv', { route: '', hasChildren: true, children: archiveChildren, childrenLoading: archiveLoading, displayOrder: 2 }),
              ],
            }),
          ],
        }),
        item('out', 'Ausgangsrechnungen', { route: '', displayOrder: 2, children: [item('o1', 'Mahnungen')] }),
      ],
    }),
    item('top-lazy', 'Ablage', { route: '', displayOrder: 3, hasChildren: true }),
  ];
}

@Component({
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-sidenav
      [mode]="mode()"
      [isOpen]="open()"
      [mobileBreakpoint]="0"
      [collapsed]="collapsed()"
      [items]="items()"
      [activeRoute]="activeRoute()"
      [brandName]="brandName()"
      [brandSubtitle]="brandSubtitle()"
      [brandRoute]="brandRoute()"
      [brandLink]="brandLink()"
      [brandIcon]="brandIcon()"
      [brandLogoSrc]="brandLogoSrc()"
      [highlight]="highlight()"
      [(expandedGroups)]="groups"
      (closed)="closedCount = closedCount + 1"
      (itemAction)="log.push('action:' + $event.id)"
      (itemActionClick)="onActionClick($event)"
      (expandRequested)="requested.push($event.id)"
    >
      <p class="default-slot">Unten</p>
    </lc-sidenav>
  `,
})
class HostComponent {
  readonly mode = signal<'docked' | 'drawer'>('docked');
  readonly open = signal(true);
  readonly collapsed = signal(false);
  readonly items = signal<NavigationItem[]>(deepTree());
  readonly activeRoute = signal('/rf');
  readonly brandName = signal('');
  readonly brandSubtitle = signal('');
  readonly brandRoute = signal('/');
  readonly brandLink = signal(true);
  readonly brandIcon = signal('');
  readonly brandLogoSrc = signal('');
  readonly highlight = signal('');
  readonly groups = signal<readonly string[]>([]);
  closedCount = 0;
  log: string[] = [];
  clicks: NavigationItemActionEvent[] = [];
  requested: string[] = [];
  onActionClick(event: NavigationItemActionEvent): void {
    this.log.push('click:' + event.item.id);
    this.clicks.push(event);
  }
}

@Component({
  standalone: true,
  imports: [SidenavComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-sidenav [mode]="mode()" [isOpen]="true" [mobileBreakpoint]="0" [collapsed]="collapsed()" [items]="items" brandName="USM X">
      <div sidenav-top class="picker"><button type="button" id="area">Bereich</button><input id="search" aria-label="Navigation durchsuchen" /></div>
      <p class="default-slot">Unten</p>
    </lc-sidenav>
  `,
})
class SlotHostComponent {
  readonly mode = signal<'docked' | 'drawer'>('docked');
  readonly collapsed = signal(false);
  readonly items = [item('a', 'Alpha'), item('b', 'Beta')];
}

@Component({
  standalone: true,
  imports: [SidenavComponent, SidenavLabelDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-sidenav mode="docked" [isOpen]="true" [mobileBreakpoint]="0" [items]="items" activeRoute="/rf" highlight="rech">
      <ng-template lcSidenavLabel let-item let-level="level" let-hl="highlight"
        ><span class="code">{{ item.id }}</span> {{ item.label }} <span class="meta">{{ level }}|{{ hl }}</span></ng-template
      >
    </lc-sidenav>
  `,
})
class TemplateHostComponent {
  readonly items = deepTree();
}

@Component({
  standalone: true,
  imports: [SidenavComponent, CommandPaletteComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-sidenav [isOpen]="open()" [mobileBreakpoint]="0" [items]="items" (closed)="closedCount = closedCount + 1; open.set(false)" />
    <lc-command-palette [(open)]="palette" [groups]="[]" />
  `,
})
class PaletteHostComponent {
  readonly open = signal(true);
  readonly palette = signal(false);
  readonly items = [item('a', 'Alpha')];
  closedCount = 0;
}

const providers = [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()];

describe('lc-sidenav, usm-x rows 38–46 (3.47, request 067)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const sidenav = () => fixture.debugElement.children[0].componentInstance as SidenavComponent;
  const row = (label: string) =>
    [...el().querySelectorAll<HTMLElement>('.lc-sidenav__nav-item')].find(
      (i) => i.querySelector('.lc-sidenav__nav-label')?.textContent?.trim() === label,
    ) as HTMLElement;
  const update = () => {
    fixture.detectChanges();
    fixture.detectChanges();
  };

  beforeEach(() => {
    mobile = false;
    TestBed.configureTestingModule({ imports: [HostComponent], providers });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    update();
  });

  afterEach(() => fixture.destroy());

  describe('AC-S2, S3, S4: brand route, a brand without link, a logo image', () => {
    it('keeps the static routerLink "/" by default and follows brandRoute', () => {
      host.brandName.set('USM X');
      update();
      let link = el().querySelector('a.lc-sidenav__brand') as HTMLAnchorElement;
      expect(link.getAttribute('routerlink')).toBe('/');
      expect(link.getAttribute('href')).toBe('/');
      host.brandRoute.set('/start');
      update();
      link = el().querySelector('a.lc-sidenav__brand') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('/start');
    });

    it('renders a plain block with brandLink false: no link, no role, no tab stop, name and subtitle stay', () => {
      host.brandName.set('USM X');
      host.brandSubtitle.set('Arbeitsbereich');
      host.brandLink.set(false);
      update();
      const block = el().querySelector('.lc-sidenav__logo--brand') as HTMLElement;
      expect(block.querySelector('a')).toBeNull();
      const brand = block.querySelector('div.lc-sidenav__brand.lc-sidenav__brand--static') as HTMLElement;
      expect(brand).not.toBeNull();
      for (const attr of ['role', 'tabindex', 'aria-label', 'href']) expect(brand.hasAttribute(attr)).toBe(false);
      expect(brand.getAttribute('data-tooltip')).toBe('USM X');
      expect(brand.querySelector('.lc-sidenav__brand-name')?.textContent).toBe('USM X');
      expect(brand.querySelector('.lc-sidenav__brand-subtitle')?.textContent).toBe('Arbeitsbereich');
      expect(brand.querySelector('.lc-sidenav__brand-tile')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('draws brandLogoSrc in the tile (decorative), over brandIcon; none by default', () => {
      host.brandName.set('Kunde AG');
      host.brandIcon.set('home');
      update();
      expect(el().querySelector('.lc-sidenav__brand-img')).toBeNull();
      host.brandLogoSrc.set('/logo.svg');
      update();
      const tile = el().querySelector('.lc-sidenav__brand-tile') as HTMLElement;
      const img = tile.querySelector('img') as HTMLImageElement;
      expect(img.className).toBe('lc-sidenav__brand-img');
      expect(img.getAttribute('src')).toBe('/logo.svg');
      expect(img.getAttribute('alt')).toBe('');
      expect(tile.querySelector('lc-icon')).toBeNull();
    });
  });

  describe('AC-S5: groups at any depth (one recursive template)', () => {
    it('opens the current item’s five-level path on the first render, each group marked', () => {
      for (const label of ['Workflows', 'Eingangsrechnungen', 'Prüfung', 'Freigabe']) {
        const button = row(label);
        expect(button.tagName).toBe('BUTTON');
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(button.classList).toContain('lc-sidenav__nav-item--has-active-child');
      }
      const current = row('Rechnungsfreigabe Kostenstelle 4711');
      expect(current.tagName).toBe('A');
      expect(current.getAttribute('aria-current')).toBe('page');
      expect(current.classList).toContain('lc-sidenav__nav-item--child');
      // Four nested children containers above the current link.
      let depth = 0;
      for (let node: Element | null = current; node; node = node.parentElement) {
        if (node.classList.contains('lc-sidenav__nav-children')) depth++;
      }
      expect(depth).toBe(4);
      expect(el().querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    });

    it('folds and unfolds each level on its own', () => {
      row('Prüfung').click();
      update();
      expect(row('Prüfung').getAttribute('aria-expanded')).toBe('false');
      expect(row('Freigabe')).toBeUndefined();
      expect(row('Eingangsrechnungen').getAttribute('aria-expanded')).toBe('true');
      // Still marked: the current item is below the folded group.
      expect(row('Prüfung').classList).toContain('lc-sidenav__nav-item--has-active-child');
      row('Prüfung').click();
      update();
      expect(row('Freigabe').getAttribute('aria-expanded')).toBe('true');
    });

    it('asks a lazy level-4 group for its children and shows its loading row', () => {
      row('Archiv').click();
      update();
      expect(host.requested).toEqual(['ar']);
      host.items.set(deepTree([], true));
      update();
      const area = row('Archiv').closest('.lc-sidenav__nav-item-row')?.nextElementSibling as HTMLElement;
      expect(area.classList).toContain('lc-sidenav__nav-children');
      expect(area.getAttribute('aria-busy')).toBe('true');
      expect(area.querySelector('.lc-sidenav__nav-loading')).not.toBeNull();
      host.items.set(deepTree([item('a1', 'Archiv 2025')]));
      update();
      expect(row('Archiv 2025').getAttribute('href')).toBe('/a1');
    });

    it('lists deep links as links (current item rules at any depth)', () => {
      host.activeRoute.set('/sr');
      update();
      expect(row('Freigabe Sammelrechnung').getAttribute('aria-current')).toBe('page');
      expect(row('Rechnungsfreigabe Kostenstelle 4711').hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('AC-S6: expandedGroups', () => {
    it('reports the first open set: the input’s ids, then the current item’s groups', () => {
      expect(host.groups()).toEqual(['wf', 'in', 'pr', 'fr']);
    });

    it('reports a toggle and keeps a folded group folded through an items update', () => {
      row('Prüfung').click();
      update();
      expect(host.groups()).toEqual(['wf', 'in', 'fr']);
      host.items.set(deepTree([item('a1', 'Archiv 2025')]));
      update();
      expect(row('Prüfung').getAttribute('aria-expanded')).toBe('false');
      expect(host.groups()).toEqual(['wf', 'in', 'fr']);
    });

    it('re-opens the current item’s groups when the current item changes', () => {
      row('Prüfung').click();
      update();
      host.activeRoute.set('/sr');
      update();
      expect(row('Prüfung').getAttribute('aria-expanded')).toBe('true');
      expect(host.groups()).toEqual(['wf', 'in', 'fr', 'pr']);
    });

    it('replaces the open set from the input, keeps unknown ids and emits no expandRequested', () => {
      host.groups.set(['top-lazy', 'later']);
      update();
      expect(row('Ablage').getAttribute('aria-expanded')).toBe('true');
      expect(row('Workflows').getAttribute('aria-expanded')).toBe('false');
      expect(host.requested).toEqual([]);
      expect([...sidenav().expandedItems()]).toEqual(['top-lazy', 'later']);
    });

    it('reports a write to expandedItems', () => {
      sidenav().expandedItems.set(new Set(['wf', 'out']));
      update();
      expect(host.groups()).toEqual(['wf', 'out']);
      expect(row('Eingangsrechnungen').getAttribute('aria-expanded')).toBe('false');
      expect(row('Ausgangsrechnungen').getAttribute('aria-expanded')).toBe('true');
      expect(row('Mahnungen').getAttribute('href')).toBe('/o1');
    });

    it('seeds from the input on the first render', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      host.groups.set(['wf', 'out']);
      host.activeRoute.set('/');
      update();
      expect(row('Workflows').getAttribute('aria-expanded')).toBe('true');
      expect(row('Eingangsrechnungen').getAttribute('aria-expanded')).toBe('false');
      expect(row('Mahnungen').getAttribute('href')).toBe('/o1');
      expect(host.groups()).toEqual(['wf', 'out']);
    });
  });

  describe('AC-S7: the action at every level, itemActionClick', () => {
    it.each([
      ['level 3 (a group)', 'Prüfung: Aktionen', 'pr'],
      ['level 5 (a link)', 'Rechnungsfreigabe: Aktionen', 'rf'],
    ])('%s: one button with its own name; itemAction then itemActionClick, once each', (_level, name, id) => {
      const button = el().querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement;
      expect(button.classList).toContain('lc-sidenav__action-btn');
      expect(button.parentElement?.classList).toContain('lc-sidenav__nav-item-row');
      button.click();
      update();
      expect(host.log).toEqual([`action:${id}`, `click:${id}`]);
      expect(host.clicks).toHaveLength(1);
      expect(host.clicks[0].item.id).toBe(id);
      expect(host.clicks[0].element).toBe(button);
      expect(host.clicks[0].event.type).toBe('click');
    });

    it('a level-5 row without action stays the bare link of 3.46 (no row)', () => {
      expect(row('Freigabe Sammelrechnung').parentElement?.classList).toContain('lc-sidenav__nav-children');
    });
  });

  describe('AC-S9: Escape closes the drawer only on the top-most layer', () => {
    const stack = () => TestBed.inject(OverlayStackService) as unknown as { stack: string[] };
    const escape = (target: EventTarget = document) => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      update();
      return event;
    };

    beforeEach(() => {
      host.mode.set('drawer');
      update();
    });

    it('closes on a plain Escape and takes the event (defaultPrevented)', () => {
      const event = escape();
      expect(host.closedCount).toBe(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('ignores an Escape another handler already took', () => {
      const close = el().querySelector('.lc-sidenav__close') as HTMLElement;
      close.addEventListener('keydown', (e) => e.preventDefault());
      escape(close);
      expect(host.closedCount).toBe(0);
    });

    it('ignores Escape while another layer (a menu, popover or tooltip) is above it', () => {
      const overlays = TestBed.inject(OverlayStackService);
      overlays.push('menu-above');
      escape();
      expect(host.closedCount).toBe(0);
      overlays.remove('menu-above');
      escape();
      expect(host.closedCount).toBe(1);
    });

    it('leaves the stack when it closes, is destroyed, or is docked', () => {
      expect(stack().stack).toHaveLength(1);
      host.open.set(false);
      update();
      expect(stack().stack).toEqual([]);
      host.open.set(true);
      update();
      expect(stack().stack).toHaveLength(1);
      host.mode.set('docked');
      update();
      expect(stack().stack).toEqual([]);
      host.mode.set('drawer');
      update();
      fixture.destroy();
      expect(stack().stack).toEqual([]);
    });
  });

  describe('AC-S11: highlight and the title of a cut label', () => {
    it('marks every case-insensitive match of the trimmed text; the label text stays whole', () => {
      host.highlight.set('  RECH ');
      update();
      const label = row('Rechnungsfreigabe Kostenstelle 4711').querySelector('.lc-sidenav__nav-label') as HTMLElement;
      expect([...label.querySelectorAll('mark')].map((m) => [m.className, m.textContent])).toEqual([['lc-sidenav__mark', 'Rech']]);
      expect(label.textContent).toBe('Rechnungsfreigabe Kostenstelle 4711');
      const sr = row('Freigabe Sammelrechnung').querySelector('.lc-sidenav__nav-label') as HTMLElement;
      expect([...sr.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['rech']);
      expect(row('Eingangsrechnungen').querySelectorAll('mark')).toHaveLength(1);
      expect(row('Start').querySelector('mark')).toBeNull();
      host.highlight.set('   ');
      update();
      expect(el().querySelector('mark')).toBeNull();
    });

    it('marks every match in one label', () => {
      host.items.set([item('x', 'Rechnungen rechnen')]);
      host.highlight.set('rech');
      update();
      expect([...el().querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['Rech', 'rech']);
    });

    it('sets title only on a cut label under the pointer, and removes it once it fits', () => {
      const current = row('Rechnungsfreigabe Kostenstelle 4711');
      const label = current.querySelector('.lc-sidenav__nav-label') as HTMLElement;
      expect(el().querySelector('.lc-sidenav__nav-label[title]')).toBeNull();
      let scroll = 240;
      Object.defineProperty(label, 'scrollWidth', { configurable: true, get: () => scroll });
      Object.defineProperty(label, 'clientWidth', { configurable: true, get: () => 132 });
      current.dispatchEvent(new Event('pointerover', { bubbles: true }));
      update();
      expect(label.getAttribute('title')).toBe('Rechnungsfreigabe Kostenstelle 4711');
      expect(el().querySelectorAll('.lc-sidenav__nav-label[title]')).toHaveLength(1);
      scroll = 120;
      label.dispatchEvent(new Event('pointerover', { bubbles: true }));
      update();
      expect(label.hasAttribute('title')).toBe(false);
    });

    it('no title on the rail or when the row has a kit tooltip', () => {
      host.items.set([item('t', 'Lange Bezeichnung mit Tooltip', { tooltip: 'Erklärung' }), item('u', 'Lange Bezeichnung ohne')]);
      update();
      for (const label of ['Lange Bezeichnung mit Tooltip', 'Lange Bezeichnung ohne']) {
        const span = row(label).querySelector('.lc-sidenav__nav-label') as HTMLElement;
        Object.defineProperty(span, 'scrollWidth', { configurable: true, get: () => 300 });
        Object.defineProperty(span, 'clientWidth', { configurable: true, get: () => 100 });
        row(label).dispatchEvent(new Event('pointerover', { bubbles: true }));
        update();
      }
      expect(row('Lange Bezeichnung mit Tooltip').querySelector('[title]')).toBeNull();
      const plain = row('Lange Bezeichnung ohne').querySelector('.lc-sidenav__nav-label') as HTMLElement;
      expect(plain.getAttribute('title')).toBe('Lange Bezeichnung ohne');
      host.collapsed.set(true);
      update();
      expect(plain.hasAttribute('title')).toBe(false);
    });

    it('passes axe with marks, actions and five levels (jsdom rules)', async () => {
      host.highlight.set('rech');
      host.brandName.set('USM X');
      host.brandLink.set(false);
      update();
      expect(violations(await audit(el()))).toEqual([]);
    });
  });
});

describe('lc-sidenav [sidenav-top] slot (3.47, AC-S1)', () => {
  let fixture: ComponentFixture<SlotHostComponent>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    mobile = false;
    TestBed.configureTestingModule({ imports: [SlotHostComponent], providers });
    fixture = TestBed.createComponent(SlotHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('projects the content between the brand and the items; the default slot stays below', () => {
    const aside = el().querySelector('aside') as HTMLElement;
    expect([...aside.children].map((c) => c.classList[0])).toEqual([
      'lc-sidenav__logo',
      'lc-sidenav__top',
      'lc-sidenav__nav',
      'lc-sidenav__content',
    ]);
    const top = aside.querySelector('.lc-sidenav__top') as HTMLElement;
    expect(top.querySelector('.picker #area')).not.toBeNull();
    expect(top.querySelector('#search')).not.toBeNull();
    expect(aside.querySelector('.lc-sidenav__content .default-slot')).not.toBeNull();
    expect(aside.querySelector('.lc-sidenav__content .picker')).toBeNull();
  });

  it('is in the drawer too: after the close button, inside the dialog, in tab order brand → × → slot → items', () => {
    fixture.componentInstance.mode.set('drawer');
    fixture.detectChanges();
    const aside = el().querySelector('aside[role="dialog"]') as HTMLElement;
    expect([...aside.children].map((c) => c.classList[0]).slice(0, 4)).toEqual([
      'lc-sidenav__logo',
      'lc-sidenav__close',
      'lc-sidenav__top',
      'lc-sidenav__nav',
    ]);
    const order = [...aside.querySelectorAll('a, button, input')].map((n) => n.id || n.className.split(' ')[0]);
    expect(order.slice(0, 5)).toEqual(['lc-sidenav__brand', 'lc-sidenav__close', 'area', 'search', 'lc-sidenav__nav-item']);
  });

  it('passes axe in the drawer (jsdom rules)', async () => {
    fixture.componentInstance.mode.set('drawer');
    fixture.detectChanges();
    expect(violations(await audit(el()))).toEqual([]);
  });
});

describe('lc-sidenav lcSidenavLabel (3.47, AC-S11)', () => {
  it('replaces the label at every level with the template, which gets the item, its level and the highlight', () => {
    mobile = false;
    TestBed.configureTestingModule({ imports: [TemplateHostComponent], providers });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    const labels = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.lc-sidenav__nav-label')].map((l) => l.textContent?.replace(/\s+/g, ' ').trim());
    expect(labels).toEqual([
      'start Start 1|rech',
      'wf Workflows 1|rech',
      'in Eingangsrechnungen 2|rech',
      'pr Prüfung 3|rech',
      'fr Freigabe 4|rech',
      'rf Rechnungsfreigabe Kostenstelle 4711 5|rech',
      'sr Freigabe Sammelrechnung 5|rech',
      'ar Archiv 4|rech',
      'out Ausgangsrechnungen 2|rech',
      'top-lazy Ablage 1|rech',
    ]);
    // The template wins over highlight: no marks.
    expect((fixture.nativeElement as HTMLElement).querySelector('mark')).toBeNull();
    fixture.destroy();
  });
});

describe('lc-sidenav Escape under the command palette (3.47, AC-S9)', () => {
  it('the palette above the drawer takes the first Escape, the drawer the second', () => {
    mobile = false;
    TestBed.configureTestingModule({ imports: [PaletteHostComponent], providers });
    const fixture = TestBed.createComponent(PaletteHostComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    host.palette.set(true);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(document.querySelector('.lc-command-palette')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(host.palette()).toBe(false);
    expect(host.closedCount).toBe(0);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(host.closedCount).toBe(1);
    fixture.destroy();
  });
});

describe('lc-sidenav 3.47 styles (AC-S1, S4, S5, S7, S8, S10, S11)', () => {
  const css = compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const rule = (selector: string, last = false) => {
    const at = last ? css.lastIndexOf(`\n${selector} {`) : css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('AC-S1: the slot wrapper is a column on the nav gutter, no box when empty or on the rail', () => {
    const top = rule('.lc-sidenav__top');
    for (const d of ['display: flex', 'flex-direction: column', 'gap: var(--spacing-2, 0.5rem)', 'padding: var(--lc-density-padding-md, 1rem) var(--lc-sidenav-nav-padding-x) 0']) {
      expect(top).toContain(d);
    }
    expect(rule('.lc-sidenav__top:empty')).toContain('display: none');
    expect(rule('.lc-sidenav--collapsed .lc-sidenav__top')).toContain('display: none');
    expect(rule('.lc-sidenav__top:not(:empty) ~ .lc-sidenav__nav')).toContain('padding-top: var(--lc-density-padding-md, 1rem)');
  });

  it('AC-S4: the logo image is 24 px, contained, through --lc-sidenav-brand-logo-filter (default none)', () => {
    const img = rule('.lc-sidenav__brand-img');
    for (const d of ['width: 24px', 'height: 24px', 'object-fit: contain', 'filter: var(--lc-sidenav-brand-logo-filter, none)']) expect(img).toContain(d);
    expect(rule('.lc-sidenav__brand--static:hover')).toContain('background-color: transparent');
  });

  it('AC-S5: every deeper level indents 12 px after the first 16', () => {
    expect(rule('.lc-sidenav__nav-children')).toContain('padding-left: var(--spacing-4, 1rem)');
    expect(rule('.lc-sidenav__nav-children .lc-sidenav__nav-children')).toContain('padding-left: var(--spacing-3, 0.75rem)');
  });

  it('AC-S7: a row’s action button has a 44 × 44 hit area (28 + 2 × 8)', () => {
    // The 3.47 rule comes after the rest/hover opacity rule of the same selector.
    expect(rule('.lc-sidenav__nav-item-row .lc-sidenav__action-btn', true)).toContain('position: relative');
    const hit = rule('.lc-sidenav__nav-item-row .lc-sidenav__action-btn::before');
    for (const d of ['content: ""', 'position: absolute', 'inset: -8px']) expect(hit).toContain(d);
    expect(rule('.lc-sidenav__action-btn')).toMatch(/width: 28px;\s*height: 28px;/);
  });

  it('AC-S7, S12 (r1, WCAG 2.4.7): a row action shows when focused or expanded, at the weight of the rest rule', () => {
    // Rest (0,2,0 + _ngcontent) stays hidden; the own `.lc-sidenav__action-btn:focus-visible`
    // (0,2,0) lost to it since 3.0, so the reveal sits under the row selector (0,3,0).
    expect(rule('.lc-sidenav__nav-item-row .lc-sidenav__action-btn')).toMatch(/opacity: 0;\s*transition: opacity 0\.15s ease;/);
    expect(rule('.lc-sidenav__nav-item-row:hover .lc-sidenav__action-btn')).toContain('opacity: 1');
    const reveal = css.match(
      /\n\.lc-sidenav__nav-item-row \.lc-sidenav__action-btn:focus-visible,\s*\.lc-sidenav__nav-item-row \.lc-sidenav__action-btn\[aria-expanded=["']?true["']?\] \{([^}]*)\}/,
    );
    expect(reveal?.[1]).toMatch(/^\s*opacity: 1;\s*$/);
  });

  it('AC-S8: the hooks fall back to the 3.46 values', () => {
    expect(rule('.lc-sidenav__overlay')).toContain('background-color: var(--lc-sidenav-backdrop, rgba(0, 0, 0, 0.5))');
    expect(css).toContain('color: var(--lc-sidenav-muted-fg, var(--lc-sidenav-section-fg, var(--_lc-sidenav-t-section-fg)))');
    const icon = rule('.lc-sidenav__nav-icon');
    expect(icon).toContain('width: var(--lc-sidenav-icon-size, 20px)');
    expect(icon).toContain('height: var(--lc-sidenav-icon-size, 20px)');
    // Unset, `--lc-icon-size` is invalid and lc-icon keeps its own 20 px.
    expect(icon).toContain('--lc-icon-size: var(--lc-sidenav-icon-size);');
    expect(rule('.lc-sidenav--collapsed .lc-sidenav__nav-icon')).toContain('width: calc(var(--lc-sidenav-icon-size, 20px) + 2px)');
  });

  it('AC-S10: the brand block reads --lc-sidenav-brand-height, falling back to the logoSize heights; the × follows', () => {
    for (const [size, px] of [['xs', 56], ['sm', 56], ['md', 64], ['lg', 80], ['xl', 112]] as const) {
      expect(css).toMatch(new RegExp(`\\.lc-sidenav__logo--size-${size} \\{\\s*min-height: var\\(--lc-sidenav-brand-height, ${px}px\\);`));
    }
    expect(rule('.lc-sidenav--drawer .lc-sidenav__logo--brand ~ .lc-sidenav__close')).toContain(
      'top: calc((var(--lc-sidenav-brand-height, 64px) - 44px) / 2)',
    );
  });

  it('AC-S11: a mark is bold and underlined in the label’s ink (no fill)', () => {
    const mark = rule('.lc-sidenav__mark');
    for (const d of ['background: none', 'color: inherit', 'font-weight: var(--font-weight-bold, 700)', 'text-decoration: underline']) expect(mark).toContain(d);
  });

  it('never declares a new hook (020: ancestor values reach the rail)', () => {
    expect(css).not.toMatch(/--lc-sidenav-(focus-ring|muted-fg|icon-size|backdrop|brand-height|brand-logo-filter)\s*:/);
  });
});
