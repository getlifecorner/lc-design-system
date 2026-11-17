import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
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
        childrenLoadingLabel="Wird geladen …"
        ariaLabel="Bereiche"
        [brandName]="brandName()"
        [brandSubtitle]="brandSubtitle()"
        [brandLetter]="brandLetter()"
        brandHref="/"
        (itemClicked)="clicked.push($event.id)"
        (expandRequested)="requested.push($event.id)"
        (itemContextMenu)="menus.push($event)"
      />
    </div>
  `,
})
class HostComponent {
  readonly collapsed = signal(false);
  readonly activeRoute = signal('');
  readonly brandName = signal('');
  readonly brandSubtitle = signal('');
  readonly brandLetter = signal('');
  readonly items = signal<NavigationItem[]>([]);
  clicked: string[] = [];
  requested: string[] = [];
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

/** Request 064 (3.44): usm-x row 14 (AC-3…7) and backlog 064-n2 (AC-32). */
describe('lc-sidenav row states, action items, lazy children (3.44)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([{ path: '**', component: PageComponent }]), provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    router = TestBed.inject(Router);
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
  const name = (node: HTMLElement) => computedName(el(), node).replace(/\s+/g, ' ').trim();

  describe('AC-3: action items', () => {
    it('render as a button without href; a click emits itemClicked once and does not navigate', () => {
      const navigate = jest.spyOn(router, 'navigateByUrl');
      set([LINK('Kostenstellen'), LINK('Fenster', { kind: 'action', route: '' })]);
      const action = item('Fenster');
      expect(action.tagName).toBe('BUTTON');
      expect(action.getAttribute('type')).toBe('button');
      expect(action.hasAttribute('href')).toBe(false);
      action.click();
      expect(host.clicked).toEqual(['Fenster']);
      expect(navigate).not.toHaveBeenCalled();
      expect(item('Kostenstellen').tagName).toBe('A');
    });

    it('the app sets current: aria-current on it alone, over activeRoute; routes never make an action current', () => {
      host.activeRoute.set('/Kostenstellen');
      set([LINK('Kostenstellen'), LINK('Fenster', { kind: 'action', route: '/Kostenstellen' })]);
      expect(item('Kostenstellen').getAttribute('aria-current')).toBe('page');
      expect(item('Fenster').hasAttribute('aria-current')).toBe(false);
      set([LINK('Kostenstellen'), LINK('Fenster', { kind: 'action', route: '', current: true })]);
      expect(item('Fenster').getAttribute('aria-current')).toBe('page');
      expect(item('Fenster').classList).toContain('lc-sidenav__nav-item--active');
      expect(item('Kostenstellen').hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('AC-4: busy', () => {
    it('spinner in place of the icon, aria-busy and aria-disabled, the busy text read last', () => {
      set([LINK('Berichte', { busy: true, badge: { value: 3 } })]);
      const busy = item('Berichte');
      expect(busy.getAttribute('aria-busy')).toBe('true');
      expect(busy.getAttribute('aria-disabled')).toBe('true');
      expect(busy.querySelector('lc-spinner')).not.toBeNull();
      expect(busy.querySelector('.lc-sidenav__nav-spinner')?.getAttribute('aria-hidden')).toBe('true');
      expect(busy.querySelector('lc-icon.lc-sidenav__nav-icon')).toBeNull();
      expect(name(busy)).toBe('Berichte 3 Wird geladen');
    });

    it('ignores activation (no output, no navigation) for links and actions, and keeps the element and focus', () => {
      const navigate = jest.spyOn(router, 'navigateByUrl');
      set([LINK('Berichte', { busy: true }), LINK('Fenster', { kind: 'action', route: '', busy: true })]);
      const link = item('Berichte');
      link.focus();
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      item('Fenster').click();
      expect(host.clicked).toEqual([]);
      expect(navigate).not.toHaveBeenCalled();
      set([LINK('Berichte', { busy: false }), LINK('Fenster', { kind: 'action', route: '', busy: true })]);
      expect(item('Berichte')).toBe(link);
      expect(document.activeElement).toBe(link);
      expect(link.hasAttribute('aria-busy')).toBe(false);
    });

    describe('on the collapsed rail (review 064 r1 finding 1)', () => {
      let style: HTMLStyleElement;

      beforeAll(() => {
        // The component CSS hides the rail labels (display: none) as a browser does.
        style = document.createElement('style');
        style.textContent = compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css.replace(
          /::ng-deep\s*/g,
          '',
        );
        document.head.appendChild(style);
      });
      afterAll(() => style.remove());

      it('names a busy link, action and group "label busyLabel"; a badge text already leads with the label', () => {
        host.collapsed.set(true);
        set([
          LINK('Berichte', { busy: true }),
          LINK('Fenster', { kind: 'action', route: '', busy: true, displayOrder: 2 }),
          LINK('Verträge', { route: '', busy: true, children: [LINK('Rahmen')], displayOrder: 3 }),
          LINK('Incidents', { busy: true, badge: { value: '56/60', ariaLabel: '56 von 60 geladen' }, displayOrder: 4 }),
        ]);
        expect(el().querySelector('.lc-sidenav--collapsed')).not.toBeNull();
        expect(getComputedStyle(item('Berichte').querySelector('.lc-sidenav__nav-label') as Element).display).toBe('none');
        expect(item('Berichte').tagName).toBe('A');
        expect(item('Fenster').tagName).toBe('BUTTON');
        expect(item('Verträge').getAttribute('aria-expanded')).not.toBeNull();
        expect(name(item('Berichte'))).toBe('Berichte Wird geladen');
        expect(name(item('Fenster'))).toBe('Fenster Wird geladen');
        expect(name(item('Verträge'))).toBe('Verträge Wird geladen');
        expect(name(item('Incidents'))).toBe('Incidents 56 von 60 geladen Wird geladen');
        // The visible label tooltip is unchanged.
        expect(item('Berichte').getAttribute('data-tooltip')).toBe('Berichte');
      });

      it('the drawer keeps the busy text after the label', () => {
        set([LINK('Berichte', { busy: true })]);
        expect(name(item('Berichte'))).toBe('Berichte Wird geladen');
        expect(item('Berichte').querySelectorAll('.lc-sidenav__sr-only')[0]?.textContent).toBe('Wird geladen');
      });
    });
  });

  describe('AC-5: children on demand', () => {
    const lazy = (extra: Partial<NavigationItem> = {}) => LINK('Verträge', { route: '', hasChildren: true, ...extra });

    it('shows the chevron and aria-expanded="false" with no children; opening emits expandRequested once', () => {
      set([lazy()]);
      const group = item('Verträge');
      expect(group.tagName).toBe('BUTTON');
      expect(group.getAttribute('aria-expanded')).toBe('false');
      expect(group.querySelector('.lc-sidenav__nav-chevron')).not.toBeNull();
      group.click();
      fixture.detectChanges();
      expect(group.getAttribute('aria-expanded')).toBe('true');
      expect(host.requested).toEqual(['Verträge']);
      // Open, no children, not loading: nothing below.
      expect(el().querySelector('.lc-sidenav__nav-children')).toBeNull();
    });

    it('childrenLoading: an aria-busy children area with a loading row; children then render and focus stays', () => {
      set([lazy()]);
      const group = item('Verträge');
      group.focus();
      group.click();
      fixture.detectChanges();
      set([lazy({ childrenLoading: true })]);
      const area = el().querySelector('.lc-sidenav__nav-children') as HTMLElement;
      expect(area.getAttribute('aria-busy')).toBe('true');
      const loading = area.querySelector('.lc-sidenav__nav-loading') as HTMLElement;
      expect(loading.querySelector('.lc-sidenav__nav-label')?.textContent).toBe('Wird geladen …');
      expect(loading.querySelector('.lc-sidenav__nav-spinner')?.getAttribute('aria-hidden')).toBe('true');
      set([lazy({ children: [LINK('Laufend', { displayOrder: 1 }), LINK('Beendet', { displayOrder: 2 })] })]);
      const loaded = el().querySelector('.lc-sidenav__nav-children') as HTMLElement;
      expect(loaded.hasAttribute('aria-busy')).toBe(false);
      expect([...loaded.querySelectorAll('.lc-sidenav__nav-label')].map((n) => n.textContent)).toEqual(['Laufend', 'Beendet']);
      expect(document.activeElement).toBe(item('Verträge'));
      // Opened again with children: no new request.
      item('Verträge').click();
      item('Verträge').click();
      expect(host.requested).toEqual(['Verträge']);
    });
  });

  describe('AC-6: disabled with a reason', () => {
    it('stays in place, aria-disabled, tabbable with a reason, -1 without; no activation', () => {
      set([LINK('Darstellungen', { disabled: true, disabledReason: 'Kein Recht für diesen Bereich' }), LINK('Archiv', { disabled: true })]);
      const withReason = item('Darstellungen');
      const without = item('Archiv');
      expect(withReason.getAttribute('aria-disabled')).toBe('true');
      expect(withReason.hasAttribute('tabindex')).toBe(false);
      expect(without.getAttribute('tabindex')).toBe('-1');
      withReason.click();
      without.click();
      expect(host.clicked).toEqual([]);
    });

    it('the reason is the tooltip on focus and describes the item', () => {
      set([LINK('Darstellungen', { disabled: true, disabledReason: 'Kein Recht für diesen Bereich', tooltip: 'not shown while disabled' })]);
      const row = item('Darstellungen');
      row.focus();
      fixture.detectChanges();
      const id = row.getAttribute('aria-describedby') as string;
      expect(id).toMatch(/^lc-tooltip-\d+$/);
      expect(document.getElementById(id)?.textContent?.trim()).toBe('Kein Recht für diesen Bereich');
      row.blur();
    });

    it('a tooltip and the badge tooltip join with " · "', () => {
      set([LINK('Incidents', { tooltip: 'Zuletzt geladen heute', badge: { value: '56/60', tooltip: '56 von 60 geladen' } })]);
      const row = item('Incidents');
      row.focus();
      fixture.detectChanges();
      expect(document.getElementById(row.getAttribute('aria-describedby') as string)?.textContent?.trim()).toBe(
        'Zuletzt geladen heute · 56 von 60 geladen',
      );
      row.blur();
    });
  });

  describe('AC-7: hint', () => {
    it('renders beside the label with the full text as title, and joins the name after the label', () => {
      set([LINK('Kostenstellen', { hint: 'Rich Client', badge: { value: 3 } })]);
      const row = item('Kostenstellen');
      const hint = row.querySelector('.lc-sidenav__nav-hint') as HTMLElement;
      expect(hint.textContent).toBe('Rich Client');
      expect(hint.getAttribute('title')).toBe('Rich Client');
      expect(row.classList).toContain('lc-sidenav__nav-item--hint');
      expect(name(row)).toBe('Kostenstellen Rich Client 3');
    });
  });

  describe('AC-32: matchRoutes, iconUrl, muted, badge name, context menu, brand', () => {
    it('matchRoutes: current for every route it owns (exact, then the longest prefix)', async () => {
      set([LINK('Arbeit', { route: '/arbeit', matchRoutes: ['/fenster', '/vorgang'] }), LINK('Customizing', { route: '/customizing' })]);
      await router.navigateByUrl('/vorgang/42');
      fixture.detectChanges();
      expect(item('Arbeit').getAttribute('aria-current')).toBe('page');
      await router.navigateByUrl('/customizing');
      fixture.detectChanges();
      expect(item('Customizing').getAttribute('aria-current')).toBe('page');
      expect(item('Arbeit').hasAttribute('aria-current')).toBe(false);
    });

    it('iconUrl: an image with alt="" in the icon box; muted: a class only', () => {
      set([LINK('Klassen', { iconUrl: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E', muted: true })]);
      const img = item('Klassen').querySelector('img.lc-sidenav__nav-img') as HTMLImageElement;
      expect(img.getAttribute('alt')).toBe('');
      expect(img.classList).toContain('lc-sidenav__nav-icon');
      expect(item('Klassen').querySelector('lc-icon.lc-sidenav__nav-icon')).toBeNull();
      expect(item('Klassen').classList).toContain('lc-sidenav__nav-item--muted');
    });

    it('badge.ariaLabel is read after the label instead of badgeAriaLabel', () => {
      set([LINK('Incidents', { badge: { value: '56/60', ariaLabel: '56 von 60 geladen' } })]);
      expect(name(item('Incidents'))).toBe('Incidents 56 von 60 geladen');
    });

    it('contextmenu emits once per event, never prevented; not for disabled items', () => {
      set([LINK('Incidents'), LINK('Archiv', { disabled: true })]);
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      item('Incidents').dispatchEvent(event);
      item('Archiv').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      expect(host.menus.map((m) => m.item.id)).toEqual(['Incidents']);
      expect(host.menus[0].event).toBe(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('brandSubtitle joins the link name; brandLetter sets the tile', () => {
      host.brandName.set('USM X');
      host.brandSubtitle.set('Customizing');
      host.brandLetter.set('X');
      set([LINK('Klassen')]);
      const brand = el().querySelector('a.lc-sidenav__brand') as HTMLElement;
      expect(name(brand)).toBe('USM X Customizing');
      expect(brand.querySelector('.lc-sidenav__brand-tile')?.textContent?.trim()).toBe('X');
      expect(brand.querySelector('.lc-sidenav__brand-name--one-line')?.textContent).toBe('USM X');
    });
  });

  it('passes axe with every state', async () => {
    set([
      LINK('Kostenstellen', { hint: 'Rich Client' }),
      LINK('Fenster', { kind: 'action', route: '', current: true, displayOrder: 2 }),
      LINK('Berichte', { busy: true, displayOrder: 3 }),
      LINK('Darstellungen', { disabled: true, disabledReason: 'Kein Recht', displayOrder: 4 }),
      LINK('Verträge', { route: '', hasChildren: true, childrenLoading: true, displayOrder: 5 }),
    ]);
    item('Verträge').click();
    fixture.detectChanges();
    expect(violations(await audit(el()))).toEqual([]);
  });

  describe('stylesheet', () => {
    const css = '\n' + compile(join(__dirname, 'sidenav.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('the hint shrinks first, ends in an ellipsis and hides on the rail', () => {
      expect(rule('.lc-sidenav__nav-hint')).toContain('flex: 0 100000 auto; min-width: 3em;');
      expect(rule('.lc-sidenav__nav-hint')).toContain('text-overflow: ellipsis;');
      expect(rule('.lc-sidenav__nav-item--hint .lc-sidenav__nav-label')).toBe('flex: 1 1 auto;');
      expect(rule('.lc-sidenav--collapsed .lc-sidenav__nav-hint')).toBe('display: none;');
    });

    it('disabled content is dimmed, not the control; GrayText in forced colours', () => {
      expect(rule('.lc-sidenav__nav-item--disabled > *')).toBe('opacity: 0.5;');
      expect(css).toMatch(/@media \(forced-colors: active\) \{[^@]*\.lc-sidenav__nav-item--disabled > \* \{\s*color: GrayText;\s*opacity: 1;/);
    });
  });
});
