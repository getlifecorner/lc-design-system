import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, EventEmitter, signal } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { MenuComponent, type MenuAnchor, type MenuItem, type MenuPosition } from './menu.component';
import { MenuControlDirective } from './menu-control.directive';

/**
 * Request 072 (3.51): backlog 071-n3 (side positions `right-start` /
 * `left-start`, physical in LTR and RTL), 071-n4 (`popupControls`: control
 * rows in a popup, Tab walks parts and controls) and 071-n7 (part names:
 * `MenuItem.partLabel`, `partAriaLabel`). Offsets are measured on the
 * stories *Side Positions*, *Popup Control Rows* and *Part Names*.
 */
const PANEL: MenuItem[] = [
  { id: 'hell', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true },
  { id: 'dunkel', label: 'Dunkel', type: 'radio', radioGroup: 'theme' },
  { id: 'density', label: 'Dichte', control: 'density' },
  { id: 'sounds', label: 'Töne', control: 'sounds' },
  { id: 'profil', label: 'Profil', current: true, partLabel: 'Konto' },
  { id: 'logout', label: 'Abmelden' },
];

/** What CDK reads with `start` / `end` in each direction. */
const ELEMENT_LISTS: Record<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right', ConnectedPosition[]> = {
  'bottom-left': [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ],
  'bottom-right': [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ],
  'top-left': [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  ],
  'top-right': [
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  ],
};

@Component({
  standalone: true,
  imports: [MenuComponent, MenuControlDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <button type="button" class="before">Vorher</button>
    <button type="button" class="anchor">Anker</button>
    <lc-menu
      [items]="items()"
      [isOpen]="isOpen()"
      [inline]="inline()"
      [anchor]="anchor()"
      [position]="position()"
      [maxHeight]="maxHeight()"
      [popupControls]="popupControls()"
      [ariaLabel]="ariaLabel()"
      [partAriaLabel]="partAriaLabel()"
      (itemClick)="clicked.push($event.id)"
      (itemToggle)="toggled.push($event.item.id)"
      (closed)="onClosed()"
    >
      <button trigger type="button" class="trigger">Ansicht</button>
      <ng-template lcMenuControl="density" let-labelId="labelId">
        <div role="radiogroup" class="density" [attr.aria-labelledby]="labelId">
          <button type="button" role="radio" aria-checked="true" class="kompakt">Kompakt</button>
        </div>
      </ng-template>
      <ng-template lcMenuControl="sounds" let-labelId="labelId">
        <button type="button" role="switch" aria-checked="false" class="sounds" [attr.aria-labelledby]="labelId"><span aria-hidden="true">Aus</span></button>
      </ng-template>
    </lc-menu>
    <button type="button" class="after">Nachher</button>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(PANEL);
  readonly isOpen = signal(false);
  readonly inline = signal(false);
  readonly anchor = signal<MenuAnchor | null>(null);
  readonly position = signal<MenuPosition>('bottom-right');
  readonly maxHeight = signal('');
  readonly popupControls = signal(false);
  readonly ariaLabel = signal('Darstellung');
  readonly partAriaLabel = signal('{label}, part {n}');
  readonly clicked: string[] = [];
  readonly toggled: string[] = [];
  closes = 0;

  onClosed(): void {
    this.isOpen.set(false);
    this.closes = this.closes + 1;
  }
}

/** A Directionality as CDK's: `value` and the signal behind it. */
function direction(value: 'ltr' | 'rtl'): Partial<Directionality> {
  return { value, valueSignal: signal(value), change: new EventEmitter<'ltr' | 'rtl'>() } as unknown as Partial<Directionality>;
}

describe('lc-menu backlog rows of request 072 (3.51)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = () => document.querySelector('.lc-menu__dropdown') as HTMLElement | null;
  const menus = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'));
  const item = (label: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('.lc-menu__item')).find((i) => i.querySelector('.lc-menu__item-label')?.textContent === label) as HTMLElement;
  const menuOf = () => fixture.debugElement.query((d) => d.name === 'lc-menu').componentInstance as MenuComponent;
  const positions = () => (menuOf() as unknown as { overlayPositions: () => ConnectedPosition[] }).overlayPositions();
  const keydown = (key: string, init: KeyboardEventInit = {}, target: Element = document.activeElement ?? document.body) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const open = async () => {
    host.isOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const setup = async (dir?: 'ltr' | 'rtl') => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), ...(dir ? [{ provide: Directionality, useValue: direction(dir) }] : [])],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    fixture.detectChanges();
  };

  afterEach(() => {
    host.isOpen.set(false);
    fixture.detectChanges();
    fixture.destroy();
    el().remove();
    (document.body as HTMLElement).focus();
  });

  describe('071-n3: side positions (AC-7, AC-8)', () => {
    const right = (rtl: boolean): ConnectedPosition => ({ originX: rtl ? 'start' : 'end', originY: 'top', overlayX: rtl ? 'end' : 'start', overlayY: 'top' });
    const left = (rtl: boolean): ConnectedPosition => ({ originX: rtl ? 'end' : 'start', originY: 'top', overlayX: rtl ? 'start' : 'end', overlayY: 'top' });

    for (const dir of ['ltr', 'rtl'] as const) {
      it(`${dir}: right-start opens on the physical right, top edges aligned, then flips left; left-start the other way`, async () => {
        await setup(dir);
        host.items.set([{ id: 'a', label: 'Eins' }]);
        host.anchor.set(el().querySelector('.anchor') as HTMLElement);
        host.position.set('right-start');
        fixture.detectChanges();
        expect(positions()).toEqual([right(dir === 'rtl'), left(dir === 'rtl')]);
        host.position.set('left-start');
        fixture.detectChanges();
        expect(positions()).toEqual([left(dir === 'rtl'), right(dir === 'rtl')]);
      });

      it(`${dir}: the four positions of 3.50 keep their lists`, async () => {
        await setup(dir);
        host.anchor.set(el().querySelector('.anchor') as HTMLElement);
        for (const position of Object.keys(ELEMENT_LISTS) as (keyof typeof ELEMENT_LISTS)[]) {
          host.position.set(position);
          fixture.detectChanges();
          expect([position, positions()]).toEqual([position, ELEMENT_LISTS[position]]);
        }
      });
    }

    it('an anchored side panel carries the side class (8 px inline margins, none above or below)', async () => {
      await setup();
      host.items.set([{ id: 'a', label: 'Eins' }]);
      host.anchor.set(el().querySelector('.anchor') as HTMLElement);
      host.position.set('right-start');
      await open();
      expect(panel()?.classList.contains('lc-menu__dropdown--right-start')).toBe(true);
      expect(panel()?.classList.contains('lc-menu__dropdown--overlay')).toBe(true);
      expect(panel()?.classList.contains('lc-menu__dropdown--bottom-right')).toBe(false);
    });

    it('at the projected trigger: the side class (beside the trigger, no flip)', async () => {
      await setup();
      host.items.set([{ id: 'a', label: 'Eins' }]);
      host.position.set('left-start');
      await open();
      expect([...(panel() as HTMLElement).classList].sort()).toEqual(['lc-menu__dropdown', 'lc-menu__dropdown--left-start']);
    });

    it('at a point: the point positions, no side class', async () => {
      await setup();
      host.items.set([{ id: 'a', label: 'Eins' }]);
      host.anchor.set({ x: 40, y: 40 });
      host.position.set('right-start');
      await open();
      expect(positions()[0]).toEqual({ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' });
      expect(panel()?.classList.contains('lc-menu__dropdown--right-start')).toBe(false);
    });

    it("maxHeight='room': a side panel keeps its side and has no room edge class", async () => {
      await setup();
      host.items.set([{ id: 'a', label: 'Eins' }]);
      host.anchor.set(el().querySelector('.anchor') as HTMLElement);
      host.position.set('right-start');
      host.maxHeight.set('room');
      await open();
      expect(panel()?.classList.contains('lc-menu__dropdown--right-start')).toBe(true);
      expect(panel()?.classList.contains('lc-menu__dropdown--room-below')).toBe(false);
      expect(panel()?.classList.contains('lc-menu__dropdown--room-above')).toBe(false);
      expect(positions()[0]).toEqual(right(false));
    });
  });

  describe('071-n4: control rows in a popup (AC-9 … AC-11)', () => {
    /** Tab as the browser does it when the menu does not prevent it: to the next (previous) stop of the page. */
    const tab = (shift = false) => {
      const before = document.activeElement as HTMLElement;
      const event = keydown('Tab', { shiftKey: shift });
      expect(event.defaultPrevented).toBe(false);
      if (document.activeElement !== before) return; // the menu moved it (returned it)
      const stops = Array.from(document.querySelectorAll<HTMLElement>('button, [tabindex]')).filter((n) => n.tabIndex >= 0 && !(n as HTMLButtonElement).disabled);
      const at = stops.indexOf(before);
      stops[at + (shift ? -1 : 1)]?.focus();
      fixture.detectChanges();
    };
    const name = () => {
      const a = document.activeElement as HTMLElement;
      return a.querySelector('.lc-menu__item-label')?.textContent ?? a.className.split(' ')[0];
    };

    beforeEach(async () => {
      await setup();
      host.popupControls.set(true);
      fixture.detectChanges();
    });

    it('renders the rows between role="menu" parts inside the body; the slot is per part, not on the panel', async () => {
      await open();
      expect(menus()).toHaveLength(2);
      const body = panel()?.querySelector(':scope > .lc-menu__body') as HTMLElement;
      expect(Array.from(body.children).map((c) => c.className.split(' ')[0])).toEqual(['lc-menu__items', 'lc-menu__control', 'lc-menu__control', 'lc-menu__items']);
      for (const row of Array.from(document.querySelectorAll('.lc-menu__control'))) expect(row.closest('[role="menu"]')).toBeNull();
      expect(panel()?.classList.contains('lc-menu__dropdown--has-toggles')).toBe(false);
      expect(menus().map((m) => m.classList.contains('lc-menu__items--has-toggles'))).toEqual([true, false]);
      expect(item('Dichte')).toBeUndefined();
    });

    it('the focus starts on the first part; Tab walks part → toggle → switch → part 2; Tab past the last stop closes', async () => {
      await open();
      expect(name()).toBe('Hell');
      const walk: string[] = [name()];
      for (let i = 0; i < 3; i++) {
        tab();
        walk.push(name());
      }
      expect(walk).toEqual(['Hell', 'kompakt', 'sounds', 'Profil']);
      expect(host.closes).toBe(0);
      tab();
      expect(host.closes).toBe(1);
    });

    it('Shift+Tab walks back and closes before the first stop', async () => {
      await open();
      item('Profil').focus();
      tab(true);
      expect(name()).toBe('sounds');
      tab(true);
      tab(true);
      expect(name()).toBe('Hell');
      expect(host.closes).toBe(0);
      tab(true);
      expect(host.closes).toBe(1);
    });

    it('the arrows stay inside a part (each part is a role="menu")', async () => {
      await open();
      keydown('ArrowDown');
      expect(name()).toBe('Dunkel');
      keydown('ArrowDown');
      expect(name()).toBe('Hell');
      item('Profil').focus();
      keydown('ArrowDown');
      expect(name()).toBe('Abmelden');
      expect(item('Dunkel').getAttribute('tabindex')).toBe('-1');
      expect(item('Hell').getAttribute('tabindex')).toBe('0');
      expect(item('Abmelden').getAttribute('tabindex')).toBe('0');
    });

    it('a click in a control keeps the menu open; Escape in a control closes it and returns the focus to the trigger', async () => {
      await open();
      const kompakt = document.querySelector('.kompakt') as HTMLElement;
      kompakt.focus();
      kompakt.click();
      fixture.detectChanges();
      expect(host.closes).toBe(0);
      const event = keydown('Escape');
      expect(event.defaultPrevented).toBe(true);
      expect(host.closes).toBe(1);
      expect(document.activeElement).toBe(el().querySelector('.trigger'));
    });

    it('with an anchor: the body is the scroller, Tab past the last stop returns the focus first (the trigger before the anchor, as 3.48)', async () => {
      host.anchor.set(el().querySelector('.anchor') as HTMLElement);
      await open();
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(true);
      expect(panel()?.querySelector(':scope > .lc-menu__body')).not.toBeNull();
      item('Abmelden').focus();
      keydown('ArrowUp');
      expect(name()).toBe('Profil');
      keydown('ArrowDown');
      keydown('Tab');
      expect(host.closes).toBe(1);
      expect(document.activeElement).toBe(el().querySelector('.trigger'));
    });

    it('a leading control row takes the focus on open (its first control)', async () => {
      host.items.set([PANEL[2], PANEL[0], PANEL[1]]);
      await open();
      expect(document.activeElement).toBe(document.querySelector('.kompakt'));
    });

    it('a popup without control rows is unchanged (one part, the panel slot class)', async () => {
      host.items.set(PANEL.filter((i) => !i.control));
      await open();
      expect(menus()).toHaveLength(1);
      expect(panel()?.querySelector('.lc-menu__body')).toBeNull();
      expect(panel()?.classList.contains('lc-menu__dropdown--has-toggles')).toBe(true);
      expect(menus()[0].getAttribute('class')).toBe('lc-menu__items');
    });

    it('inline ignores popupControls (no body)', () => {
      host.inline.set(true);
      fixture.detectChanges();
      expect(menus()).toHaveLength(2);
      expect(panel()?.querySelector('.lc-menu__body')).toBeNull();
    });

    it('axe: no violations (two named parts, two control rows)', async () => {
      await open();
      expect(menus().map((m) => m.getAttribute('aria-label'))).toEqual(['Darstellung', 'Konto']);
      expect(violations(await audit(panel() as HTMLElement))).toEqual([]);
    });
  });

  describe('071-n7: part names (AC-16, AC-17, AC-22)', () => {
    beforeEach(async () => {
      await setup();
      host.inline.set(true);
      fixture.detectChanges();
    });

    const names = () => menus().map((m) => m.getAttribute('aria-label'));

    it('partLabel names a later part (no aria-labelledby)', () => {
      expect(names()).toEqual(['Darstellung', 'Konto']);
      expect(menus()[1].hasAttribute('aria-labelledby')).toBe(false);
    });

    it('without partLabel: „{label}, part {n}“ from ariaLabel; German pattern; the third part is 3', () => {
      host.items.set([...PANEL.slice(0, 4), { id: 'profil', label: 'Profil' }, { id: 'x', label: 'Mehr', control: 'sounds' }, { id: 'hilfe', label: 'Hilfe' }]);
      fixture.detectChanges();
      expect(names()).toEqual(['Darstellung', 'Darstellung, part 2', 'Darstellung, part 3']);
      host.partAriaLabel.set('{label}, Teil {n}');
      fixture.detectChanges();
      expect(names()).toEqual(['Darstellung', 'Darstellung, Teil 2', 'Darstellung, Teil 3']);
    });

    it("partAriaLabel '' or no ariaLabel: a later part stays unnamed (as 3.50)", () => {
      host.items.set([...PANEL.slice(0, 4), { id: 'profil', label: 'Profil' }]);
      host.partAriaLabel.set('');
      fixture.detectChanges();
      expect(names()).toEqual(['Darstellung', null]);
      host.partAriaLabel.set('{label}, part {n}');
      host.ariaLabel.set('');
      fixture.detectChanges();
      expect(names()).toEqual([null, null]);
    });

    it('a part that starts with a section keeps its heading as name; a partLabel on the section wins', () => {
      const section: MenuItem = { id: 'konto', label: 'Konto', children: [{ id: 'profil', label: 'Profil' }] };
      host.items.set([...PANEL.slice(0, 4), section]);
      fixture.detectChanges();
      const heading = menus()[1].querySelector('.lc-menu__section-heading') as HTMLElement;
      expect(menus()[1].getAttribute('aria-labelledby')).toBe(heading.id);
      expect(names()).toEqual(['Darstellung', null]);
      host.items.set([...PANEL.slice(0, 4), { ...section, partLabel: 'Mein Konto' }]);
      fixture.detectChanges();
      expect(names()).toEqual(['Darstellung', 'Mein Konto']);
      expect(menus()[1].hasAttribute('aria-labelledby')).toBe(false);
    });

    it('the first part keeps ariaLabel; after a leading control row its partLabel names it when ariaLabel is empty', () => {
      host.items.set([PANEL[2], { ...PANEL[0], partLabel: 'Thema' }, PANEL[1]]);
      fixture.detectChanges();
      expect(names()).toEqual(['Darstellung']);
      host.ariaLabel.set('');
      fixture.detectChanges();
      expect(names()).toEqual(['Thema']);
    });

    it('AC-17: one part and no ariaLabel: no name attributes; a partLabel on its first entry is ignored', () => {
      host.ariaLabel.set('');
      host.items.set([{ id: 'a', label: 'Eins', partLabel: 'Ignoriert' }, { id: 'b', label: 'Zwei' }]);
      fixture.detectChanges();
      expect(menus()).toHaveLength(1);
      expect(['aria-label', 'aria-labelledby'].map((a) => menus()[0].hasAttribute(a))).toEqual([false, false]);
    });

    it('AC-17 (popup default): one role="menu" with ariaLabel only, panel classes as 3.50', async () => {
      host.inline.set(false);
      host.items.set([{ id: 'a', label: 'Eins' }, { id: 'b', label: 'Zwei' }]);
      await open();
      expect(menus()).toHaveLength(1);
      expect(menus()[0].getAttribute('aria-label')).toBe('Darstellung');
      expect(menus()[0].hasAttribute('aria-labelledby')).toBe(false);
      expect([...(panel() as HTMLElement).classList].sort()).toEqual(['lc-menu__dropdown', 'lc-menu__dropdown--bottom-right']);
      expect(panel()?.querySelector('.lc-menu__body')).toBeNull();
    });
  });

  describe('SCSS', () => {
    const css = '\n' + compile(resolve(__dirname, 'menu.component.scss')).css;
    const rule = (selector: string) => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('side panels: beside the trigger, top aligned, 8 px; in the overlay 8 px inline margins only', () => {
      expect(rule('.lc-menu__dropdown--right-start')).toBe('top: 0; left: calc(100% + var(--spacing-2));');
      expect(rule('.lc-menu__dropdown--left-start')).toBe('top: 0; right: calc(100% + var(--spacing-2));');
      expect(
        rule('.lc-menu__dropdown.lc-menu__dropdown--overlay.lc-menu__dropdown--right-start,\n.lc-menu__dropdown.lc-menu__dropdown--overlay.lc-menu__dropdown--left-start'),
      ).toBe('margin-block: 0; margin-inline: var(--spacing-2);');
      // after the overlay rule of the same weight's margin-block (0,2,0 < 0,3,0)
      expect(css.indexOf('\n.lc-menu__dropdown.lc-menu__dropdown--overlay.lc-menu__dropdown--right-start')).toBeGreaterThan(
        css.indexOf('\n.lc-menu__dropdown.lc-menu__dropdown--overlay {'),
      );
    });

    it('the body of a segmented popup is the scroller of a capped or overlay panel', () => {
      expect(rule('.lc-menu__dropdown--scroll > .lc-menu__body')).toBe('flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain;');
    });
  });
});
