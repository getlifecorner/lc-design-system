import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { MenuComponent, type MenuAnchor, type MenuItem } from './menu.component';

/**
 * Request 068 (design §2, §3A, §6, §9): usm-x rows 53–59 and 68 on `lc-menu`:
 * the overlay `anchor`, `maxHeight`, `loading`, `ariaLabel`, item `tooltip`,
 * `disabledReason`, `emphasis`, `swatch`, dividers inside a section and
 * `preventDefault` on every handled key.
 */
const ITEMS: MenuItem[] = [
  { id: 'open', label: 'Öffnen', emphasis: true },
  { id: 'rich', label: 'Im Rich Client bearbeiten', disabled: true, disabledReason: 'Öffnet … im Rich Client' },
  { id: 'gone', label: 'Archivieren', disabled: true },
  {
    id: 'group',
    label: 'Status',
    children: [
      { id: 'neu', label: 'Neu', dividerAfter: true },
      { id: 'offen', label: 'Offen', dividerAfter: true },
      { id: 'zu', label: 'Geschlossen', dividerAfter: true },
    ],
  },
  { id: 'hell', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true, swatch: ['#ffffff', '#111827'] },
  { id: 'blau', label: 'Blau', swatch: 'var(--color-primary)', tooltip: 'Im Formular öffnen' },
];

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- a page listener for keys that bubble from the menu -->
    <div lang="de" class="wrap" (keydown)="bubbled.push($event.key)">
      <button type="button" class="before">Vorher</button>
      <button type="button" class="anchor">⋯</button>
      <lc-menu
        [items]="items()"
        [isOpen]="isOpen()"
        [anchor]="anchor()"
        [maxHeight]="maxHeight()"
        [loading]="loading()"
        [loadingLabel]="loadingLabel()"
        [ariaLabel]="ariaLabel()"
        (itemClick)="onItemClick($event.id)"
        (closed)="onClosed()"
      >
        <div header><input class="search" aria-label="Suchen" /></div>
      </lc-menu>
      <button type="button" class="after">Nachher</button>
    </div>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(ITEMS);
  readonly isOpen = signal(false);
  readonly anchor = signal<MenuAnchor | null>(null);
  readonly maxHeight = signal('');
  readonly loading = signal(false);
  readonly loadingLabel = signal('Wird geladen …');
  readonly ariaLabel = signal('');
  readonly clicked: string[] = [];
  readonly bubbled: string[] = [];
  closes = 0;
  /** The story's pattern: the app clears `anchor` when the menu closes (review r1, F-2). */
  clearAnchor = false;
  /** The app closes the menu itself on an item click. */
  closeOnItem = false;

  onItemClick(id: string): void {
    this.clicked.push(id);
    if (this.closeOnItem) this.onClosed();
  }

  onClosed(): void {
    this.isOpen.set(false);
    this.closes = this.closes + 1;
    if (this.clearAnchor) this.anchor.set(null);
  }
}

describe('MenuComponent 3.48 (request 068)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const menu = () => document.querySelector('[role="menu"]') as HTMLElement | null;
  const panel = () => document.querySelector('.lc-menu__dropdown') as HTMLElement | null;
  const item = (label: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('.lc-menu__item')).find(
      (i) => i.querySelector('.lc-menu__item-label')?.textContent === label,
    ) as HTMLElement;
  const focused = () => (document.activeElement as HTMLElement).querySelector('.lc-menu__item-label')?.textContent;
  const keydown = (key: string, target: Element = document.activeElement ?? document.body) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
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
    (document.body as HTMLElement).focus();
  });

  describe('AC-14: ariaLabel', () => {
    it('renders no aria-label by default, the name when set', async () => {
      await open();
      expect(menu()?.hasAttribute('aria-label')).toBe(false);
      host.ariaLabel.set('Was diese Liste anbietet');
      fixture.detectChanges();
      expect(menu()?.getAttribute('aria-label')).toBe('Was diese Liste anbietet');
    });
  });

  describe('AC-12: handled keys are preventDefault-ed and stopped', () => {
    it('arrows, Home and End do not reach a listener of the page', async () => {
      await open();
      for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
        const event = keydown(key);
        expect([key, event.defaultPrevented]).toEqual([key, true]);
      }
      expect(host.bubbled).toEqual([]);
      // Tab is not handled: it reaches the page (and closes the menu)
      keydown('Tab');
      expect(host.bubbled).toEqual(['Tab']);
    });

    it('Escape: a later capture listener on document sees defaultPrevented; a bubbling one is not called', async () => {
      await open();
      const capture: boolean[] = [];
      const bubble: string[] = [];
      const onCapture = (e: KeyboardEvent) => capture.push(e.defaultPrevented);
      const onBubble = (e: KeyboardEvent) => bubble.push(e.key);
      document.addEventListener('keydown', onCapture, true);
      document.addEventListener('keydown', onBubble);
      try {
        const event = keydown('Escape');
        expect(event.defaultPrevented).toBe(true);
        expect(capture).toEqual([true]);
        expect(bubble).toEqual([]);
        expect(host.bubbled).toEqual([]);
        expect(host.closes).toBe(1);
      } finally {
        document.removeEventListener('keydown', onCapture, true);
        document.removeEventListener('keydown', onBubble);
      }
    });

    it('a closed menu leaves Escape alone (its listener is removed)', async () => {
      await open();
      host.isOpen.set(false);
      fixture.detectChanges();
      const event = keydown('Escape', el().querySelector('.before') as HTMLElement);
      expect(event.defaultPrevented).toBe(false);
      expect(host.bubbled).toEqual(['Escape']);
    });
  });

  describe('AC-13: dividers in a section, emphasis', () => {
    it('dividerAfter draws between members of a section, not after the last one', async () => {
      await open();
      const group = menu()?.querySelector('[role="group"]') as HTMLElement;
      const order = Array.from(group.children).map((c) =>
        c.localName === 'hr' ? 'hr' : (c.querySelector('.lc-menu__item-label')?.textContent ?? 'heading'),
      );
      expect(order).toEqual(['heading', 'Neu', 'hr', 'Offen', 'hr', 'Geschlossen']);
    });

    it('emphasis is a class whose label is bold (visual only: no ARIA state)', async () => {
      await open();
      const open1 = item('Öffnen');
      expect(open1.classList.contains('lc-menu__item--emphasis')).toBe(true);
      expect(Array.from(open1.attributes).map((a) => a.name)).not.toContain('aria-current');
      const css = compile(resolve(__dirname, 'menu.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-menu__item--emphasis .lc-menu__item-label { font-weight: var(--font-weight-bold); }');
    });
  });

  describe('AC-11: tooltip and disabledReason', () => {
    it('a reason item is aria-disabled, not natively disabled, and in the arrow order', async () => {
      await open();
      const rich = item('Im Rich Client bearbeiten');
      expect(rich.getAttribute('aria-disabled')).toBe('true');
      expect((rich as HTMLButtonElement).disabled).toBe(false);
      expect(rich.classList.contains('lc-menu__item--reason')).toBe(true);
      expect(rich.classList.contains('lc-menu__item--disabled')).toBe(false);
      const gone = item('Archivieren');
      expect((gone as HTMLButtonElement).disabled).toBe(true);
      expect(gone.hasAttribute('aria-disabled')).toBe(false);
      expect(focused()).toBe('Öffnen');
      keydown('ArrowDown');
      expect(focused()).toBe('Im Rich Client bearbeiten');
      keydown('ArrowDown');
      expect(focused()).toBe('Neu');
    });

    it('the reason shows on keyboard focus (aria-describedby), activation is ignored', async () => {
      await open();
      keydown('ArrowDown');
      const rich = item('Im Rich Client bearbeiten');
      const tip = document.getElementById(rich.getAttribute('aria-describedby') ?? '');
      expect(tip?.textContent?.trim()).toBe('Öffnet … im Rich Client');
      rich.click();
      fixture.detectChanges();
      expect(host.clicked).toEqual([]);
      expect(host.isOpen()).toBe(true);
    });

    it('an enabled item shows its tooltip on focus; Escape closes the tooltip first, then the menu', async () => {
      await open();
      keydown('End');
      const blau = item('Blau');
      expect(document.activeElement).toBe(blau);
      const tip = document.getElementById(blau.getAttribute('aria-describedby') ?? '');
      expect(tip?.textContent?.trim()).toBe('Im Formular öffnen');
      expect(item('Neu').hasAttribute('aria-describedby')).toBe(false);
      keydown('Escape');
      expect(blau.hasAttribute('aria-describedby')).toBe(false);
      expect(host.isOpen()).toBe(true);
      expect(keydown('Escape').defaultPrevented).toBe(true);
      expect(host.isOpen()).toBe(false);
    });
  });

  describe('AC-15: swatch', () => {
    it('draws a decorative sample before the label; the radio keeps its semantics', async () => {
      await open();
      const hell = item('Hell');
      expect(hell.getAttribute('role')).toBe('menuitemradio');
      expect(hell.getAttribute('aria-checked')).toBe('true');
      const swatch = hell.querySelector('.lc-menu__item-swatch') as HTMLElement;
      expect(swatch.getAttribute('aria-hidden')).toBe('true');
      expect(hell.firstElementChild?.classList.contains('lc-menu__item-indicator')).toBe(true);
      expect(swatch.nextElementSibling?.classList.contains('lc-menu__item-content')).toBe(true);
      expect(swatch.style.background).toContain('linear-gradient(90deg');
      const blau = item('Blau').querySelector('.lc-menu__item-swatch') as HTMLElement;
      expect(blau.getAttribute('style')).toContain('var(--color-primary)');
      expect(item('Öffnen').querySelector('.lc-menu__item-swatch')).toBeNull();
    });
  });

  describe('AC-10: loading', () => {
    it('shows a busy row outside role="menu", aria-busy, and the status text a frame later', async () => {
      host.items.set([]);
      host.loading.set(true);
      host.isOpen.set(true);
      fixture.detectChanges();
      const row = panel()?.querySelector('.lc-menu__loading') as HTMLElement;
      expect(menu()?.getAttribute('aria-busy')).toBe('true');
      expect(menu()?.contains(row)).toBe(false);
      // (the spinner's own status sits in an aria-hidden box)
      const status = row.querySelector('.lc-menu__loading-text') as HTMLElement;
      expect(status.getAttribute('role')).toBe('status');
      expect(status.textContent?.trim()).toBe('');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(status.textContent?.trim()).toBe('');
      await new Promise((done) => setTimeout(done, 40));
      fixture.detectChanges();
      expect(status.textContent?.trim()).toBe('Wird geladen …');
      host.loading.set(false);
      fixture.detectChanges();
      expect(menu()?.hasAttribute('aria-busy')).toBe(false);
      expect(panel()?.querySelector('.lc-menu__loading')).toBeNull();
    });

    it('items that arrive while open take the focus (first enabled item)', async () => {
      host.items.set([]);
      host.loading.set(true);
      (el().querySelector('.before') as HTMLElement).focus();
      await open();
      host.items.set(ITEMS);
      host.loading.set(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(focused()).toBe('Öffnen');
      expect(item('Öffnen').getAttribute('tabindex')).toBe('0');
    });

    it('…but not when the focus is already inside the panel', async () => {
      host.items.set([]);
      host.loading.set(true);
      await open();
      const search = panel()?.querySelector('.search') as HTMLInputElement;
      search.focus();
      host.items.set(ITEMS);
      host.loading.set(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement).toBe(search);
      expect(item('Öffnen').getAttribute('tabindex')).toBe('0');
    });
  });

  describe('AC-9: maxHeight', () => {
    it('caps the panel and makes it a column whose item list scrolls; no cap by default', async () => {
      await open();
      expect(panel()?.style.maxHeight).toBe('');
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(false);
      host.maxHeight.set('min(56vh, 420px)');
      fixture.detectChanges();
      expect(panel()?.style.maxHeight).toBe('min(56vh, 420px)');
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(true);
      const css = compile(resolve(__dirname, 'menu.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain(
        '.lc-menu__dropdown--scroll > .lc-menu__items { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }',
      );
    });

    it('scrolls the focused item fully into the capped list', async () => {
      host.maxHeight.set('100px');
      await open();
      const list = menu() as HTMLElement;
      Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 400 });
      Object.defineProperty(list, 'clientHeight', { configurable: true, value: 100 });
      list.getBoundingClientRect = () => ({ top: 0, bottom: 100 }) as DOMRect;
      item('Neu').getBoundingClientRect = () => ({ top: 120, bottom: 164 }) as DOMRect;
      keydown('ArrowDown');
      keydown('ArrowDown');
      expect(focused()).toBe('Neu');
      expect(list.scrollTop).toBe(64);
    });
  });

  describe('AC-8: anchor (overlay)', () => {
    it('without an anchor the panel stays inside the host (default)', async () => {
      await open();
      expect(el().contains(panel())).toBe(true);
      expect(panel()?.classList.contains('lc-menu__dropdown--overlay')).toBe(false);
      expect(panel()?.hasAttribute('lang')).toBe(false);
    });

    it('an element anchor renders the panel in the overlay container with the host lang', async () => {
      host.anchor.set(el().querySelector('.anchor') as HTMLElement);
      await open();
      expect(panel()).not.toBeNull();
      expect(el().contains(panel())).toBe(false);
      expect(panel()?.closest('.cdk-overlay-pane')).not.toBeNull();
      expect(panel()?.classList.contains('lc-menu__dropdown--overlay')).toBe(true);
      expect(panel()?.classList.contains('lc-menu__dropdown--at-point')).toBe(false);
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(true);
      expect(panel()?.getAttribute('lang')).toBe('de');
      expect(focused()).toBe('Öffnen');
      // the kit writes no ARIA onto the app's anchor
      expect((el().querySelector('.anchor') as HTMLElement).hasAttribute('aria-expanded')).toBe(false);
    });

    it('a point anchor opens at the point without a gap', async () => {
      host.anchor.set({ x: 340, y: 600 });
      await open();
      expect(panel()?.classList.contains('lc-menu__dropdown--at-point')).toBe(true);
      const css = compile(resolve(__dirname, 'menu.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-menu__dropdown.lc-menu__dropdown--at-point { margin-block: 0; max-height: calc(100dvh - 16px); }');
    });

    it('a click on the anchor or inside the panel keeps it open; outside closes', async () => {
      host.anchor.set(el().querySelector('.anchor') as HTMLElement);
      await open();
      (el().querySelector('.anchor') as HTMLElement).click();
      panel()?.querySelector('.search')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(host.closes).toBe(0);
      (el().querySelector('.before') as HTMLElement).click();
      expect(host.closes).toBe(1);
    });

    it('a scroll outside the panel closes it, a scroll of its list does not', async () => {
      host.anchor.set({ x: 10, y: 10 });
      await open();
      menu()?.dispatchEvent(new Event('scroll'));
      expect(host.closes).toBe(0);
      el().dispatchEvent(new Event('scroll'));
      expect(host.closes).toBe(1);
    });

    it('Escape returns the focus to the anchor element', async () => {
      const anchor = el().querySelector('.anchor') as HTMLElement;
      host.anchor.set(anchor);
      await open();
      expect(focused()).toBe('Öffnen');
      keydown('Escape');
      expect(document.activeElement).toBe(anchor);
      expect(host.isOpen()).toBe(false);
    });

    it('at a point, Escape returns the focus to the element focused before', async () => {
      const before = el().querySelector('.before') as HTMLElement;
      before.focus();
      host.anchor.set({ x: 10, y: 10 });
      await open();
      expect(focused()).toBe('Öffnen');
      keydown('Escape');
      expect(document.activeElement).toBe(before);
    });

    describe('the app clears `anchor` in `closed`; opened without focus on the anchor (a Safari pointer click) (review r1, F-2)', () => {
      let anchor: HTMLElement;
      const openFromPointer = async () => {
        anchor = el().querySelector('.anchor') as HTMLElement;
        host.clearAnchor = true;
        (document.activeElement as HTMLElement | null)?.blur();
        expect(document.activeElement).toBe(document.body);
        host.anchor.set(anchor);
        await open();
        expect(focused()).toBe('Öffnen');
      };

      it('a scroll outside the panel returns the focus to the anchor given at open', async () => {
        await openFromPointer();
        el().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
        expect(host.anchor()).toBeNull();
        expect(host.isOpen()).toBe(false);
        expect(document.activeElement).toBe(anchor);
      });

      it('a click outside, while the focus is still in the panel, returns it to the anchor', async () => {
        await openFromPointer();
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(host.closes).toBe(1);
        expect(document.activeElement).toBe(anchor);
      });

      it('an item that closes the menu returns the focus to the anchor', async () => {
        await openFromPointer();
        host.closeOnItem = true;
        // Enter on a button item: the browser's activation click, focus stays on the item
        (document.activeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(host.clicked).toEqual(['open']);
        expect(host.isOpen()).toBe(false);
        expect(document.activeElement).toBe(anchor);
      });

      it('Escape still returns it to the anchor; the next open at a point does not reuse the old anchor', async () => {
        await openFromPointer();
        keydown('Escape');
        expect(document.activeElement).toBe(anchor);
        const before = el().querySelector('.before') as HTMLElement;
        before.focus();
        host.anchor.set({ x: 10, y: 10 });
        await open();
        expect(focused()).toBe('Öffnen');
        el().dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
        expect(document.activeElement).toBe(before);
      });
    });

    describe('Tab (review r2, F-4; design §3A): the focus continues from the anchor, not after the panel at the end of <body>', () => {
      /**
       * The order in a zoneless browser: the keydown, then the browser's own
       * focus step (unless prevented), then change detection. jsdom has no
       * focus step, so it is emulated over the tabbables in document order.
       */
      const tab = (shiftKey = false) => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
        (document.activeElement ?? document.body).dispatchEvent(event);
        const focusAfterKeydown = document.activeElement;
        if (!event.defaultPrevented) {
          const tabbables = Array.from(
            document.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex]'),
          ).filter((e) => e.tabIndex >= 0 && !e.matches(':disabled'));
          const next = tabbables[tabbables.indexOf(document.activeElement as HTMLElement) + (shiftKey ? -1 : 1)];
          if (next) next.focus();
          else (document.activeElement as HTMLElement | null)?.blur();
        }
        fixture.detectChanges();
        return { event, focusAfterKeydown };
      };
      const button = (name: 'before' | 'anchor' | 'after') => el().querySelector(`.${name}`) as HTMLElement;

      it.each([
        { shiftKey: false, end: 'after' as const },
        { shiftKey: true, end: 'before' as const },
      ])('element anchor (the app clears it in `closed`), shiftKey $shiftKey: anchor focused during the keydown, not prevented, ends on .$end', async (row) => {
        host.clearAnchor = true;
        host.anchor.set(button('anchor'));
        await open();
        expect(focused()).toBe('Öffnen');
        const { event, focusAfterKeydown } = tab(row.shiftKey);
        expect(focusAfterKeydown).toBe(button('anchor'));
        expect(event.defaultPrevented).toBe(false);
        expect(host.closes).toBe(1);
        expect(panel()).toBeNull();
        expect(document.activeElement).toBe(button(row.end));
      });

      it('point anchor: the element focused before the open takes the focus during the keydown', async () => {
        button('before').focus();
        host.anchor.set({ x: 10, y: 10 });
        await open();
        expect(focused()).toBe('Öffnen');
        const { event, focusAfterKeydown } = tab();
        expect(focusAfterKeydown).toBe(button('before'));
        expect(event.defaultPrevented).toBe(false);
        expect(host.closes).toBe(1);
        expect(document.activeElement).toBe(button('anchor'));
      });

      it('in-place mode is unchanged: the focus stays on the item during the keydown and Tab moves on from the panel', async () => {
        await open();
        const item = document.activeElement;
        expect(focused()).toBe('Öffnen');
        expect(el().contains(panel())).toBe(true);
        const { event, focusAfterKeydown } = tab();
        expect(focusAfterKeydown).toBe(item);
        expect(event.defaultPrevented).toBe(false);
        expect(host.bubbled).toEqual(['Tab']);
        expect(host.closes).toBe(1);
        expect(document.activeElement).toBe(button('after'));
      });
    });
  });
});
