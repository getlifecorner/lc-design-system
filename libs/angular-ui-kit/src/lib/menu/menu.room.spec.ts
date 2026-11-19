import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { OverlayRef, type ConnectedPosition } from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { resolve } from 'path';
import { compile } from 'sass';
import { MenuComponent, type MenuAnchor, type MenuItem } from './menu.component';

/**
 * 3.49 (request 069, usm-x row 73, design D-8, §3D): `maxHeight="room"`
 * sizes the panel to the room between its origin and the viewport edge on
 * the side it opens to (8 px gap, 8 px margin), at least 3 items plus the
 * chrome, and the room picks the side: the preferred one while it holds
 * min(240 px, the whole panel), else the larger. jsdom has no layout: the
 * panel, list and item heights, the origin's box and the viewport height are
 * mocked (sm: chrome 18, items 36).
 */
const ITEMS: MenuItem[] = Array.from({ length: 26 }, (_, i) => ({ id: `long-${i + 1}`, label: `Eintrag ${i + 1}` }));

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <button type="button" class="anchor">Weitere ▾</button>
      <lc-menu
        [items]="items()"
        [isOpen]="isOpen()"
        [anchor]="anchor()"
        [position]="position()"
        [maxHeight]="maxHeight()"
        size="sm"
        (closed)="isOpen.set(false)"
      >
        @if (trigger()) {
          <button trigger type="button" class="trigger">Aktionen ▾</button>
        }
        <div header class="head">Kopf</div>
        <div footer class="foot">Fuß</div>
      </lc-menu>
    </div>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(ITEMS);
  readonly isOpen = signal(false);
  readonly anchor = signal<MenuAnchor | null>(null);
  readonly position = signal<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'>('bottom-right');
  readonly maxHeight = signal('room');
  readonly trigger = signal(false);
}

type Box = { top: number; bottom: number };

describe('MenuComponent maxHeight="room" (3.49, request 069)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let viewport: { height: number };
  let resize: Subject<Event>;
  /** Mocked layout: chrome (padding, border, header, footer), item pitch, list height cap. */
  const layout = { chrome: 18, pitch: 36, menuBox: { top: 0, bottom: 0 } as Box };
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = () => document.querySelector('.lc-menu__dropdown') as HTMLElement;
  const menu = () => fixture.debugElement.query(By.directive(MenuComponent)).componentInstance as MenuComponent;
  const positions = () => (menu() as unknown as { overlayPositions: () => ConnectedPosition[] }).overlayPositions();
  const anchorAt = (box: Box) => {
    const button = el().querySelector('.anchor') as HTMLElement;
    button.getBoundingClientRect = () => ({ ...box, left: 0, right: 44, width: 44, height: box.bottom - box.top, x: 0, y: box.top }) as DOMRect;
    return button;
  };
  const open = async () => {
    host.isOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    const ruler = TestBed.inject(ViewportRuler);
    viewport = { height: 300 };
    resize = new Subject<Event>();
    jest.spyOn(ruler, 'getViewportSize').mockImplementation(() => ({ width: 1280, height: viewport.height }));
    jest.spyOn(ruler, 'change').mockReturnValue(resize.asObservable());
    // The list shows every item unless the panel is capped; the panel is chrome + list.
    const listHeight = (list: HTMLElement) => {
      const content = list.querySelectorAll('.lc-menu__item').length * layout.pitch;
      const cap = parseFloat((list.closest('.lc-menu__dropdown') as HTMLElement | null)?.style.maxHeight ?? '');
      return Number.isNaN(cap) ? content : Math.min(content, cap - layout.chrome);
    };
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('lc-menu__dropdown')) return layout.chrome + listHeight(this.querySelector('.lc-menu__items') as HTMLElement);
      if (this.classList.contains('lc-menu__item')) return layout.pitch;
      return 0;
    });
    jest.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return this.classList.contains('lc-menu__items') ? listHeight(this as HTMLElement) : 0;
    });
    jest.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return this.classList.contains('lc-menu__items') ? this.querySelectorAll('.lc-menu__item').length * layout.pitch : 0;
    });
    const rect = Element.prototype.getBoundingClientRect;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('lc-menu')) return { ...layout.menuBox, left: 0, right: 100, width: 100, height: 44, x: 0, y: layout.menuBox.top } as DOMRect;
      return rect.call(this);
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    fixture.detectChanges();
  });

  afterEach(() => {
    host.isOpen.set(false);
    fixture.detectChanges();
    fixture.destroy();
    el().remove();
    jest.restoreAllMocks();
  });

  describe('AC-17/AC-19: the height is the room on the side it opens to', () => {
    // Below an overlay origin the room keeps 16 px to the bottom (CDK's fit test
    // ends the viewport at its height less both 8 px margins; build.md deviation).
    it('vh 300, anchor 126–162 (below 300 − 162 − 8 − 16 = 114, above 126 − 16 = 110): below, 126 px = 18 + 3 × 36 (the minimum)', async () => {
      host.anchor.set(anchorAt({ top: 126, bottom: 162 }));
      await open();
      expect(panel().style.maxHeight).toBe('126px');
      expect(panel().classList.contains('lc-menu__dropdown--room-below')).toBe(true);
      expect(positions()[0]).toEqual({ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' });
    });

    it('vh 1150, anchor at a third (379.5–423.5): below, 702 px = 1150 − 423.5 − 8 − 16, floored', async () => {
      viewport.height = 1150;
      host.anchor.set(anchorAt({ top: 379.5, bottom: 423.5 }));
      await open();
      expect(panel().style.maxHeight).toBe('702px');
      // 702 − 18 chrome = 684 px of list: 19 whole items of 36 (> 15).
      expect(Math.floor((702 - layout.chrome) / layout.pitch)).toBe(19);
    });

    it('a point: the room less the margin only (16 px below), no gap; no margin class', async () => {
      viewport.height = 1150;
      host.anchor.set({ x: 340, y: 600 });
      await open();
      expect(panel().style.maxHeight).toBe('534px');
      expect(panel().classList.contains('lc-menu__dropdown--at-point')).toBe(true);
      expect(['lc-menu__dropdown--room-below', 'lc-menu__dropdown--room-above'].some((c) => panel().classList.contains(c))).toBe(false);
    });

    it('the projected trigger: the room around the .lc-menu box', async () => {
      viewport.height = 800;
      host.trigger.set(true);
      layout.menuBox = { top: 100, bottom: 144 };
      await open();
      expect(el().contains(panel())).toBe(true);
      expect(panel().style.maxHeight).toBe('640px');
      expect(panel().classList.contains('lc-menu__dropdown--bottom-right')).toBe(true);
    });

    it('a short window: at least 3 items and the chrome; the list scrolls', async () => {
      viewport.height = 200;
      host.anchor.set(anchorAt({ top: 80, bottom: 116 }));
      await open();
      expect(panel().style.maxHeight).toBe('126px');
      expect(panel().classList.contains('lc-menu__dropdown--scroll')).toBe(true);
    });

    it('a short menu: the minimum is the whole panel (no forced height beyond it)', async () => {
      host.items.set(ITEMS.slice(0, 2));
      host.anchor.set(anchorAt({ top: 130, bottom: 166 }));
      await open();
      // whole = 18 + 72 = 90 < 126; below 110 holds it.
      expect(panel().style.maxHeight).toBe('110px');
      expect(panel().classList.contains('lc-menu__dropdown--room-below')).toBe(true);
    });
  });

  describe('AC-18: the room picks the side', () => {
    it('below under min(240, panel) and above larger: above, its bottom 8 px over the anchor', async () => {
      viewport.height = 1150;
      host.position.set('bottom-left');
      host.anchor.set(anchorAt({ top: 862.5, bottom: 906.5 }));
      // What the panel shows each time the pane is placed.
      const placed: string[] = [];
      jest.spyOn(OverlayRef.prototype, 'updatePosition').mockImplementation(function (this: OverlayRef) {
        const shown = this.overlayElement.querySelector('.lc-menu__dropdown') as HTMLElement | null;
        placed.push(`${shown?.style.maxHeight} ${shown?.classList.contains('lc-menu__dropdown--room-above')}`);
      });
      await open();
      expect(panel().style.maxHeight).toBe('846px');
      expect(panel().classList.contains('lc-menu__dropdown--room-above')).toBe(true);
      expect(positions()[0]).toEqual({ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' });
      // CDK places the uncapped pane on attach; the menu places it again after the
      // render that gave the panel its height, margin and position list.
      expect(placed[placed.length - 1]).toBe('846px true');
      const css = compile(resolve(__dirname, 'menu.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-menu__dropdown.lc-menu__dropdown--overlay.lc-menu__dropdown--room-above { margin-block: 0 var(--spacing-2); }');
      expect(css).toContain('.lc-menu__dropdown.lc-menu__dropdown--overlay.lc-menu__dropdown--room-below { margin-block: var(--spacing-2) 0; }');
      // No transition (the reduced-motion 0.01 ms would let CDK read the old height).
      expect(panel().classList.contains('lc-menu__dropdown--room')).toBe(true);
      expect(css).toContain('.lc-menu__dropdown--room { transition-property: none; }');
    });

    it('the preferred side is kept while its room holds 240 px', async () => {
      viewport.height = 1150;
      host.position.set('top-left');
      host.anchor.set(anchorAt({ top: 264, bottom: 300 }));
      await open();
      // above 248 ≥ 240 although below is 834.
      expect(panel().style.maxHeight).toBe('248px');
      expect(panel().classList.contains('lc-menu__dropdown--room-above')).toBe(true);
    });

    it.each([
      ['top-right', 'above'],
      ['bottom-right', 'below'],
    ] as const)('a tie keeps the preferred side (%s → %s)', async (position, side) => {
      host.position.set(position);
      host.anchor.set(anchorAt({ top: 138, bottom: 154 }));
      await open();
      // below 300 − 154 − 24 = 122 = above 138 − 16 = 122, both under 240.
      expect(panel().style.maxHeight).toBe('126px');
      expect(panel().classList.contains(`lc-menu__dropdown--room-${side}`)).toBe(true);
    });

    it('a point near the bottom opens above it (the above-first list)', async () => {
      viewport.height = 1150;
      host.anchor.set({ x: 340, y: 1000 });
      await open();
      // below 1150 − 1000 − 16 = 134, above 992.
      expect(panel().style.maxHeight).toBe('992px');
      expect(positions()[0]).toEqual({ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' });
    });

    it('the projected trigger: the position class follows the side', async () => {
      viewport.height = 800;
      host.trigger.set(true);
      host.position.set('bottom-left');
      layout.menuBox = { top: 700, bottom: 744 };
      await open();
      expect(panel().classList.contains('lc-menu__dropdown--top-left')).toBe(true);
      expect(panel().classList.contains('lc-menu__dropdown--bottom-left')).toBe(false);
      expect(panel().style.maxHeight).toBe('684px');
    });
  });

  describe('recomputed on resize, items and (at the trigger) scroll', () => {
    it('window resize: height and side again', async () => {
      host.anchor.set(anchorAt({ top: 130, bottom: 166 }));
      await open();
      // below 110 < above 114: above, the minimum.
      expect(panel().style.maxHeight).toBe('126px');
      expect(panel().classList.contains('lc-menu__dropdown--room-above')).toBe(true);
      viewport.height = 1150;
      resize.next(new Event('resize'));
      await settle();
      expect(panel().style.maxHeight).toBe('960px');
      expect(panel().classList.contains('lc-menu__dropdown--room-below')).toBe(true);
    });

    it('new items while open: the menu places the pane again itself, with the new height and side', async () => {
      host.anchor.set(anchorAt({ top: 130, bottom: 166 }));
      await open();
      const placed: string[] = [];
      jest.spyOn(OverlayRef.prototype, 'updatePosition').mockImplementation(function (this: OverlayRef) {
        const shown = this.overlayElement.querySelector('.lc-menu__dropdown') as HTMLElement;
        placed.push(`${shown.style.maxHeight} ${shown.className.match(/room-\w+/)?.[0]}`);
      });
      host.items.set(ITEMS.slice(0, 2));
      await settle();
      expect(panel().style.maxHeight).toBe('110px');
      // CDK does not place a pane on its own when the content changes.
      expect(placed).toEqual(['110px room-below']);
    });

    it('a scroll moves the trigger: the height follows, the side stays', async () => {
      viewport.height = 800;
      host.trigger.set(true);
      layout.menuBox = { top: 100, bottom: 144 };
      await open();
      expect(panel().style.maxHeight).toBe('640px');
      layout.menuBox = { top: 600, bottom: 644 };
      document.dispatchEvent(new Event('scroll'));
      await settle();
      // Below is now 140 (< 240, above 584), but a scroll keeps the side.
      expect(panel().style.maxHeight).toBe('140px');
      expect(panel().classList.contains('lc-menu__dropdown--bottom-right')).toBe(true);
      expect(host.isOpen()).toBe(true);
    });
  });

  describe('AC-20: items scroll inside, header and footer stay, the focused item is revealed', () => {
    it('header, list, footer are the panel’s children; End scrolls the last item into view', async () => {
      viewport.height = 1150;
      host.anchor.set(anchorAt({ top: 379.5, bottom: 423.5 }));
      await open();
      expect(Array.from(panel().children).map((c) => c.className.split(' ')[0])).toEqual(['head', 'lc-menu__items', 'foot']);
      const list = panel().querySelector('.lc-menu__items') as HTMLElement;
      list.getBoundingClientRect = () => ({ top: 450, bottom: 1142 }) as DOMRect;
      const all = list.querySelectorAll<HTMLElement>('.lc-menu__item');
      const last = all[all.length - 1];
      last.getBoundingClientRect = () => ({ top: 1350, bottom: 1386 }) as DOMRect;
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(last);
      expect(list.scrollTop).toBe(244);
    });
  });

  describe('without "room" nothing changes', () => {
    it.each(['', 'min(56vh, 420px)'])('maxHeight %p: the 3.48 style and classes', async (value) => {
      host.maxHeight.set(value);
      host.anchor.set(anchorAt({ top: 862.5, bottom: 906.5 }));
      await open();
      expect(panel().style.maxHeight).toBe(value);
      expect(['lc-menu__dropdown--room', 'lc-menu__dropdown--room-below', 'lc-menu__dropdown--room-above'].some((c) => panel().classList.contains(c))).toBe(false);
      expect(positions()[0]).toEqual({ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' });
    });

    it('the projected trigger keeps its position class', async () => {
      host.maxHeight.set('');
      host.trigger.set(true);
      host.position.set('bottom-left');
      layout.menuBox = { top: 700, bottom: 744 };
      await open();
      expect(panel().classList.contains('lc-menu__dropdown--bottom-left')).toBe(true);
      expect(panel().hasAttribute('style')).toBe(true);
      expect(panel().style.maxHeight).toBe('');
    });
  });
});
