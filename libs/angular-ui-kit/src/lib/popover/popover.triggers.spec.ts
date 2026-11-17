import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverAlign, PopoverComponent, PopoverPosition, PopoverTriggerKind } from './popover.component';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';

@Component({
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-popover
      [trigger]="trigger()"
      [openDelay]="openDelay()"
      [closeDelay]="closeDelay()"
      [position]="position()"
      [align]="align()"
      (openChange)="changes.push($event)"
    >
      <button popover-trigger type="button" aria-describedby="hint">Info</button>
      <div popover-content><p>Kostenstelle 4711</p></div>
    </lc-popover>
    <p id="hint">Own description</p>
  `,
})
class Host {
  readonly trigger = signal<PopoverTriggerKind | readonly PopoverTriggerKind[]>('click');
  readonly openDelay = signal(0);
  readonly closeDelay = signal(0);
  readonly position = signal<PopoverPosition>('bottom');
  readonly align = signal<PopoverAlign>('center');
  readonly changes: boolean[] = [];
  readonly popover = viewChild.required(PopoverComponent);
}

/** Request 065 (usm-x row 35): trigger kinds, delays, methods, placement (AC-14 … AC-18). */
describe('lc-popover triggers and placement (3.45)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const root = (): HTMLElement => fixture.nativeElement.querySelector('.popover');
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('[popover-trigger]');
  const panel = (): HTMLElement | null => fixture.nativeElement.querySelector('.popover__panel');
  const set = (patch: Partial<{ trigger: PopoverTriggerKind | readonly PopoverTriggerKind[]; openDelay: number; closeDelay: number }>): void => {
    if (patch.trigger) host.trigger.set(patch.trigger);
    if (patch.openDelay !== undefined) host.openDelay.set(patch.openDelay);
    if (patch.closeDelay !== undefined) host.closeDelay.set(patch.closeDelay);
    fixture.detectChanges();
  };
  const pointer = (type: string, x = 0, y = 0, pointerType = 'touch'): void => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    button().dispatchEvent(event);
  };

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    jest.useRealTimers();
  });

  describe('AC-16: methods and openChange', () => {
    it('opens, closes and toggles programmatically, emitting once per real change', () => {
      const p = host.popover();
      p.open();
      p.open();
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      p.close();
      p.close();
      fixture.detectChanges();
      expect(panel()).toBeNull();
      p.toggle();
      p.toggle();
      expect(host.changes).toEqual([true, false, true, false]);
    });

    it('emits no false for a hover leave while closed', () => {
      set({ trigger: 'hover' });
      root().dispatchEvent(new Event('mouseleave'));
      expect(host.changes).toEqual([]);
    });
  });

  describe('AC-14: focus and longpress kinds', () => {
    it('opens on keyboard focus of the trigger and closes when the focus leaves', () => {
      set({ trigger: 'focus' });
      button().focus();
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      button().blur();
      fixture.detectChanges();
      expect(panel()).toBeNull();
    });

    it('opens after a touch hold of 500 ms and cancels the click that ends it', () => {
      set({ trigger: ['click', 'longpress'] });
      pointer('pointerdown', 10, 10);
      jest.advanceTimersByTime(499);
      fixture.detectChanges();
      expect(panel()).toBeNull();
      jest.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      pointer('pointerup', 10, 10);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      button().dispatchEvent(click);
      fixture.detectChanges();
      expect(click.defaultPrevented).toBe(true);
      expect(panel()).not.toBeNull();
      expect(host.changes).toEqual([true]);
    });

    it('cancels a hold that moves more than 10 px, and ignores a mouse hold', () => {
      set({ trigger: 'longpress' });
      pointer('pointerdown', 10, 10);
      pointer('pointermove', 25, 10);
      jest.advanceTimersByTime(600);
      pointer('pointerdown', 10, 10, 'mouse');
      jest.advanceTimersByTime(600);
      fixture.detectChanges();
      expect(panel()).toBeNull();
    });

    it('opens on right click (contextmenu), Shift+F10 and the Menu key', () => {
      set({ trigger: 'longpress' });
      const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      button().dispatchEvent(menu);
      fixture.detectChanges();
      expect(menu.defaultPrevented).toBe(true);
      expect(panel()).not.toBeNull();
      host.popover().close();
      for (const init of [{ key: 'F10', shiftKey: true }, { key: 'ContextMenu' }]) {
        const key = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
        button().dispatchEvent(key);
        fixture.detectChanges();
        expect(key.defaultPrevented).toBe(true);
        expect(panel()).not.toBeNull();
        host.popover().close();
        fixture.detectChanges();
      }
    });

    it('keeps the iOS callout away only with longpress', () => {
      expect(root().classList).not.toContain('popover--longpress');
      set({ trigger: 'longpress' });
      expect(root().classList).toContain('popover--longpress');
    });

    it('leaves click-only popovers as before: a click toggles, no hold opens', () => {
      pointer('pointerdown');
      jest.advanceTimersByTime(600);
      fixture.detectChanges();
      expect(panel()).toBeNull();
      button().click();
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
    });
  });

  describe('AC-15: delays', () => {
    it('opens after openDelay and closes after closeDelay on hover', () => {
      set({ trigger: 'hover', openDelay: 300, closeDelay: 200 });
      root().dispatchEvent(new Event('mouseenter'));
      jest.advanceTimersByTime(299);
      fixture.detectChanges();
      expect(panel()).toBeNull();
      jest.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      root().dispatchEvent(new Event('mouseleave'));
      jest.advanceTimersByTime(199);
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      root().dispatchEvent(new Event('mouseenter'));
      jest.advanceTimersByTime(500);
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
      root().dispatchEvent(new Event('mouseleave'));
      jest.advanceTimersByTime(200);
      fixture.detectChanges();
      expect(panel()).toBeNull();
    });

    it('cancels a pending open when the pointer leaves first', () => {
      set({ trigger: 'hover', openDelay: 300 });
      root().dispatchEvent(new Event('mouseenter'));
      root().dispatchEvent(new Event('mouseleave'));
      jest.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(panel()).toBeNull();
      expect(host.changes).toEqual([]);
    });
  });

  describe('AC-18: semantics and dismissal', () => {
    it('makes a hover/focus-only panel a tooltip that describes the trigger while open', () => {
      set({ trigger: ['hover', 'focus'] });
      expect(button().hasAttribute('aria-haspopup')).toBe(false);
      expect(button().hasAttribute('aria-expanded')).toBe(false);
      expect(button().getAttribute('aria-describedby')).toBe('hint');
      root().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(panel()?.getAttribute('role')).toBe('tooltip');
      expect(panel()?.hasAttribute('aria-modal')).toBe(false);
      expect(button().getAttribute('aria-describedby')).toBe(`hint ${panel()?.id}`);
      expect(panel()?.classList).toContain('popover__panel--bridge');
    });

    it('keeps a dialog for click and longpress kinds', () => {
      set({ trigger: ['hover', 'longpress'] });
      host.popover().open();
      fixture.detectChanges();
      expect(panel()?.getAttribute('role')).toBe('dialog');
      expect(button().getAttribute('aria-haspopup')).toBe('dialog');
      expect(button().getAttribute('aria-expanded')).toBe('true');
      expect(button().getAttribute('aria-describedby')).toBe('hint');
    });

    it('closes a hover panel with Escape and does not reopen it until the pointer leaves', () => {
      set({ trigger: 'hover' });
      root().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(panel()).toBeNull();
      root().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(panel()).toBeNull();
      root().dispatchEvent(new Event('mouseleave'));
      root().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(panel()).not.toBeNull();
    });

    it('has no axe violations as a tooltip', async () => {
      jest.useRealTimers();
      set({ trigger: 'hover' });
      root().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(violations(await audit(fixture.nativeElement))).toEqual([]);
    });
  });

  describe('AC-17: align and placement', () => {
    const rect = (left: number, top: number, width: number, height: number): DOMRect =>
      ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

    let original: typeof Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      original = Element.prototype.getBoundingClientRect;
      Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 360 });
      Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 640 });
      // The panel's layout size (placement reads it, not the panel's rect): 240 × 120.
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get(this: HTMLElement) {
          return this.classList.contains('popover__panel') ? 240 : 0;
        },
      });
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get(this: HTMLElement) {
          return this.classList.contains('popover__panel') ? 120 : 0;
        },
      });
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = original;
      delete (document.documentElement as unknown as Record<string, unknown>)['clientWidth'];
      delete (document.documentElement as unknown as Record<string, unknown>)['clientHeight'];
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)['offsetWidth'];
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)['offsetHeight'];
    });

    it('adds the align class only for start/end', () => {
      host.popover().open();
      fixture.detectChanges();
      expect([...(panel() as HTMLElement).classList].sort()).toEqual([
        'popover__panel',
        'popover__panel--arrow',
        'popover__panel--bottom',
      ]);
      host.align.set('end');
      fixture.detectChanges();
      expect(panel()?.classList).toContain('popover__panel--align-end');
    });

    it('shifts a panel that would leave a 360 px viewport and points the arrow at the trigger', () => {
      // Trigger at the right edge (x 300–340); a centred 240 px panel would end at 440.
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if (this.classList.contains('popover__trigger')) return rect(300, 100, 40, 40);
        if (this.classList.contains('popover__panel')) {
          const shift = parseFloat((this as HTMLElement).style.getPropertyValue('--_lc-popover-shift') || '0');
          return rect(200 + shift, 148, 240, 120);
        }
        return rect(0, 0, 0, 0);
      };
      host.popover().open();
      fixture.detectChanges();
      TestBed.tick();
      const p = panel() as HTMLElement;
      expect(p.style.getPropertyValue('--_lc-popover-shift')).toBe('-88px');
      // Panel 112–352, trigger centre 320 → arrow at 208 from the panel's start (207 in its padding box).
      expect(p.style.getPropertyValue('--_lc-popover-arrow')).toBe('207px');
    });

    it('computes the shift for the side it flips to, whatever geometry the panel still has (Placement r0)', () => {
      // position="right" at the right edge: no room, so bottom. The panel's
      // rect still reports the right-hand geometry; the shift must not use it.
      host.position.set('right');
      fixture.detectChanges();
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if (this.classList.contains('popover__trigger')) return rect(300, 100, 40, 40);
        if (this.classList.contains('popover__panel')) return rect(348, 60, 240, 120);
        return rect(0, 0, 0, 0);
      };
      host.popover().open();
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      const p = panel() as HTMLElement;
      expect(p.classList).toContain('popover__panel--bottom');
      expect(p.style.getPropertyValue('--_lc-popover-shift')).toBe('-88px');
      expect(p.style.getPropertyValue('--_lc-popover-arrow')).toBe('207px');
    });

    it('align="end" lines the panel up with the trigger end; no shift while it fits', () => {
      host.align.set('end');
      fixture.detectChanges();
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if (this.classList.contains('popover__trigger')) return rect(280, 100, 60, 40);
        return rect(0, 0, 0, 0);
      };
      host.popover().open();
      fixture.detectChanges();
      TestBed.tick();
      const p = panel() as HTMLElement;
      // Panel 100–340, trigger centre 310 → arrow at 210 (209 in the padding box).
      expect(p.style.getPropertyValue('--_lc-popover-shift')).toBe('');
      expect(p.style.getPropertyValue('--_lc-popover-arrow')).toBe('209px');
    });

    it('flips a bottom panel to the top when there is no room below', () => {
      Element.prototype.getBoundingClientRect = function (this: Element) {
        if (this.classList.contains('popover__trigger')) return rect(160, 560, 40, 40);
        if (this.classList.contains('popover__panel')) return rect(60, 608, 240, 120);
        return rect(0, 0, 0, 0);
      };
      host.popover().open();
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      expect(panel()?.classList).toContain('popover__panel--top');
    });
  });
});

describe('lc-popover panel text alignment (3.45, review r1 M4)', () => {
  // A static `align="end"` on the host is a presentational hint in Chrome
  // (`text-align: end` on lc-popover); the panel content starts anyway.
  const css = compile(resolve(__dirname, 'popover.component.scss')).css;

  it('the panel rule sets text-align: start', () => {
    const start = css.indexOf('\n.popover__panel {');
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))).toMatch(/\btext-align: start;/);
  });
});
