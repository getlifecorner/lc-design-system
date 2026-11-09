import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { StateStripComponent, type StateStripLabels, type StateStripSegment } from './state-strip.component';
import { audit, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.37 (request 057, 056 S-1, design D-9): dense strips (30 / 60 runs at
 * 360 px: cells of 10.92 / 5.45 px) get a pointer path that needs no 24 px
 * cell. One transparent layer over the row, hidden from assistive tech,
 * picks the run under the pointer; releasing focuses it. jsdom has no
 * layout, so the cell boxes are given here; the story measures them.
 */
const GERMAN: StateStripLabels = { success: 'geladen', warning: 'teilweise geladen', error: 'fehlgeschlagen', neutral: 'ausstehend' };
const WIDTH = 10.92;
const RUNS: StateStripSegment[] = Array.from({ length: 30 }, (_, i) => ({
  state: i % 7 === 3 ? 'error' : 'success',
  label: `Lauf ${i + 1}`,
}));

describe('StateStripComponent — pointer path for dense strips (3.37, request 057)', () => {
  let fixture: ComponentFixture<StateStripComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const row = () => host().querySelector('[role=row]') as HTMLElement;
  const cells = () => Array.from(host().querySelectorAll<HTMLElement>('[role=gridcell]'));
  const scrub = () => host().querySelector('.lc-state-strip__scrub') as HTMLElement;
  const caption = () => host().querySelector('.lc-state-strip__caption')?.textContent ?? null;
  const hovered = () => cells().flatMap((c, i) => (c.classList.contains('lc-state-strip__cell--hovered') ? [i] : []));
  /** A pointer event at x (jsdom has no PointerEvent; the handlers read clientX only). */
  const pointer = (type: string, x: number) => {
    scrub().dispatchEvent(new MouseEvent(type, { clientX: x, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StateStripComponent] });
    fixture = TestBed.createComponent(StateStripComponent);
    fixture.componentRef.setInput('segments', RUNS);
    fixture.componentRef.setInput('ariaLabel', 'Letzte 30 Ladeläufe');
    fixture.componentRef.setInput('stateLabels', GERMAN);
    fixture.detectChanges();
    document.body.appendChild(host());
    cells().forEach((cell, i) =>
      jest.spyOn(cell, 'getBoundingClientRect').mockReturnValue({ left: i * WIDTH, right: (i + 1) * WIDTH, width: WIDTH } as DOMRect),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
  });

  it('AC-21: one scrub layer, the last child of the row, hidden from assistive tech', () => {
    expect(host().querySelectorAll('.lc-state-strip__scrub')).toHaveLength(1);
    expect(row().lastElementChild).toBe(scrub());
    expect(scrub().getAttribute('aria-hidden')).toBe('true');
    expect(scrub().hasAttribute('tabindex')).toBe(false);
    expect(scrub().hasAttribute('role')).toBe(false);
    expect(scrub().textContent).toBe('');
  });

  it('AC-21: pointing at the strip shows the run under the pointer, with the hover fill', () => {
    expect(caption()).toBeNull();
    pointer('pointermove', 3 * WIDTH + 5);
    expect(caption()).toBe('Lauf 4, fehlgeschlagen');
    expect(hovered()).toEqual([3]);
    pointer('pointermove', 29 * WIDTH + 1);
    expect(caption()).toBe('Lauf 30, geladen');
    expect(hovered()).toEqual([29]);
  });

  it('AC-21: a pressed finger shows the run at once and slides along the strip', () => {
    pointer('pointerdown', 0.5);
    expect(caption()).toBe('Lauf 1, geladen');
    pointer('pointermove', 10 * WIDTH + 2);
    expect(caption()).toBe('Lauf 11, fehlgeschlagen');
  });

  it('AC-21: releasing focuses that run: it becomes the Tab stop and keeps the caption', () => {
    pointer('pointerdown', 12 * WIDTH + 3);
    pointer('pointerup', 12 * WIDTH + 3);
    expect(document.activeElement).toBe(cells()[12]);
    expect(cells()[12].getAttribute('tabindex')).toBe('0');
    expect(cells()[29].getAttribute('tabindex')).toBe('-1');
    pointer('pointerleave', 12 * WIDTH + 3);
    expect(hovered()).toEqual([]);
    expect(caption()).toBe('Lauf 13, geladen');
  });

  it('beyond the last cell nothing is picked, and a release focuses nothing', () => {
    pointer('pointermove', 30 * WIDTH + 4);
    expect(caption()).toBeNull();
    pointer('pointerup', 30 * WIDTH + 4);
    expect(cells().includes(document.activeElement as HTMLElement)).toBe(false);
  });

  it('leaving or a cancelled pointer (the page scrolls) clears the hover', () => {
    pointer('pointermove', 2 * WIDTH);
    expect(caption()).toBe('Lauf 3, geladen');
    pointer('pointerleave', 2 * WIDTH);
    expect(caption()).toBeNull();
    pointer('pointerdown', 5 * WIDTH);
    pointer('pointercancel', 5 * WIDTH);
    expect(caption()).toBeNull();
    expect(hovered()).toEqual([]);
  });

  it('Escape hides the caption until the pointer reaches another run, as entering a cell did', () => {
    pointer('pointermove', 2 * WIDTH + 1);
    row().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(caption()).toBeNull();
    pointer('pointermove', 2 * WIDTH + 6);
    expect(caption()).toBeNull();
    pointer('pointermove', 4 * WIDTH + 1);
    expect(caption()).toBe('Lauf 5, geladen');
  });

  it('AC-22: the grid stays grid > row > gridcell for axe; every cell named', async () => {
    const restore = installFakeCanvas();
    try {
      expect(violations(await audit(host()))).toEqual([]);
    } finally {
      restore();
    }
  });

  it('the rules: a positioned row, the scrub over it (vertical scroll and zoom stay), the hover fill', () => {
    const css = compile(resolve(__dirname, 'state-strip.component.scss')).css;
    expect(css).toMatch(/\n\.lc-state-strip__row \{\s*position: relative;\s*\}/);
    expect(css).toMatch(/\n\.lc-state-strip__scrub \{\s*position: absolute;\s*inset: 0;\s*touch-action: pan-y pinch-zoom;\s*\}/);
    expect(css).toMatch(/\n\.lc-state-strip__cell--hovered \{\s*background-color: var\(--color-surface-hover\);\s*\}/);
    expect(css).toMatch(/\n\.lc-state-strip__cell:hover \{\s*background-color: var\(--color-surface-hover\);\s*\}/);
  });
});
