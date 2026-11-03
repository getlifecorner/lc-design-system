import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, WritableSignal } from '@angular/core';
import { join } from 'path';
import { compile } from 'sass';
import { DependencyNode, DependencyViewerComponent } from './dependency-viewer.component';

/**
 * Request 042 (F-20, design D-7): `fit-width` held at `minNodeSize` pins the
 * graph to the start and lets the canvas scroll sideways; while it scrolls the
 * canvas is a named, focusable region (`regionLabel`). Every other mode, and a
 * graph that fits, renders as before.
 */
interface Internals {
  zoom: WritableSignal<number>;
  panX: WritableSignal<number>;
  panY: WritableSignal<number>;
  contentHeight: Signal<number | null>;
  graph: Signal<{ nodes: { id: string; x: number; y: number; width: number; height: number }[] }>;
}

/** Six steps with no dependencies: one layer, side by side in `vertical`. */
const row: DependencyNode[] = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, label: `Step ${id.toUpperCase()}` }));

describe('DependencyViewerComponent — sideways scroll at phone width (042)', () => {
  let fixture: ComponentFixture<DependencyViewerComponent>;

  const viewer = () => fixture.componentInstance as unknown as DependencyViewerComponent & Internals;
  const host = () => fixture.nativeElement as HTMLElement;
  const canvas = () => host().querySelector('.dep-viewer__canvas') as HTMLElement;
  const size = (w: number, h: number) => {
    Object.defineProperty(canvas(), 'clientWidth', { value: w, configurable: true });
    Object.defineProperty(canvas(), 'clientHeight', { value: h, configurable: true });
  };
  const set = (inputs: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
  };
  const fitAt = (w: number, h = 400) => {
    size(w, h);
    viewer().fit();
    fixture.detectChanges();
  };
  /** The phone recipe on a 326 px canvas: 160 px nodes held at 120 px (scale 0.75). */
  const phone = (extra: Record<string, unknown> = {}) => {
    set({ root: row, layout: 'layered', direction: 'vertical', fitMode: 'fit-width', minNodeSize: 120, showEdgeLabels: false, ...extra });
    fitAt(326);
  };
  const regionAttrs = () => ['tabindex', 'role', 'aria-label'].map((a) => canvas().getAttribute(a));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DependencyViewerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DependencyViewerComponent);
    fixture.componentRef.setInput('root', row);
    fixture.detectChanges();
  });

  it('AC-13: regionLabel defaults to "Dependency graph"', () => {
    expect(fixture.componentInstance.regionLabel()).toBe('Dependency graph');
  });

  it('AC-9/AC-13: the default viewer renders no scroll state, region or scroll width', () => {
    fitAt(326);
    expect(canvas().className).toBe('dep-viewer__canvas');
    expect(regionAttrs()).toEqual([null, null, null]);
    expect(canvas().getAttribute('style')).toBeNull();
    expect(host().style.height).toBe('500px');
    // The svg sits in a box-less stage (`display: contents`), the canvas's only child.
    expect([...canvas().children].map((c) => c.className)).toEqual(['dep-viewer__stage']);
    expect(canvas().querySelector('.dep-viewer__stage > svg.dep-viewer__svg')).not.toBeNull();
  });

  it('AC-10: before a fit (no canvas size, as in prerendered HTML) the host keeps its height and the canvas has no region', () => {
    set({ layout: 'layered', direction: 'vertical', fitMode: 'fit-width', minNodeSize: 120, height: '480px' });
    viewer().fit(); // 0 × 0 canvas: a no-op
    fixture.detectChanges();
    expect(host().style.height).toBe('480px');
    expect(canvas().classList).not.toContain('dep-viewer__canvas--scroll');
    expect(regionAttrs()).toEqual([null, null, null]);
  });

  it('AC-8: held at minNodeSize, the canvas scrolls sideways as a named, focusable region', () => {
    phone();
    expect(viewer().zoom()).toBeCloseTo(75, 5);
    expect(canvas().classList).toContain('dep-viewer__canvas--scroll');
    expect(regionAttrs()).toEqual(['0', 'region', 'Dependency graph']);
  });

  it('AC-8: the graph is pinned to the start (first node 24 px × scale in) and the scroll width ends at its right edge', () => {
    phone();
    const v = viewer();
    const z = v.zoom() / 100;
    const nodes = v.graph().nodes;
    const left = Math.min(...nodes.map((n) => v.panX() + n.x * z));
    const right = Math.max(...nodes.map((n) => v.panX() + (n.x + n.width) * z));
    expect(left).toBeCloseTo(24 * z, 5);
    const width = parseFloat(canvas().style.getPropertyValue('--_lc-dep-scroll-width'));
    expect(width).toBe(Math.ceil(right + 24 * z));
    expect(width).toBeGreaterThan(326);
  });

  it('AC-12 (texts): a localised regionLabel names the region', () => {
    phone({ regionLabel: 'Freigabeprozess' });
    expect(canvas().getAttribute('aria-label')).toBe('Freigabeprozess');
  });

  it('the scroll width follows the zoom buttons', () => {
    phone();
    const before = parseFloat(canvas().style.getPropertyValue('--_lc-dep-scroll-width'));
    (host().querySelector('.dep-viewer__btn') as HTMLButtonElement).click(); // zoom in
    fixture.detectChanges();
    expect(parseFloat(canvas().style.getPropertyValue('--_lc-dep-scroll-width'))).toBeGreaterThan(before);
  });

  it('a wider frame leaves the scroll state: centred, no region', () => {
    phone();
    fitAt(2000);
    expect(canvas().classList).not.toContain('dep-viewer__canvas--scroll');
    expect(regionAttrs()).toEqual([null, null, null]);
    expect(canvas().style.getPropertyValue('--_lc-dep-scroll-width')).toBe('');
  });

  it('each fit starts the scroll at the left edge', () => {
    phone();
    canvas().scrollLeft = 120;
    viewer().fit();
    expect(canvas().scrollLeft).toBe(0);
  });

  it('AC-9: contain with minNodeSize still clips (no scroll state)', () => {
    set({ layout: 'layered', direction: 'vertical', fitMode: 'contain', minNodeSize: 120, showEdgeLabels: false });
    fitAt(326);
    expect(viewer().zoom()).toBeCloseTo(75, 5);
    expect(canvas().classList).not.toContain('dep-viewer__canvas--scroll');
    expect(regionAttrs()).toEqual([null, null, null]);
  });

  it('AC-9: fit-width without a floor it hits renders as before (centred, no region)', () => {
    set({ layout: 'layered', direction: 'vertical', fitMode: 'fit-width', showEdgeLabels: false });
    fitAt(326);
    expect(viewer().zoom()).toBeLessThan(75);
    expect(canvas().classList).not.toContain('dep-viewer__canvas--scroll');
    expect(regionAttrs()).toEqual([null, null, null]);
  });

  it('a horizontal drag scrolls the canvas instead of panning past the scroll range', () => {
    phone();
    const panX = viewer().panX();
    canvas().scrollLeft = 200;
    canvas().dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 100, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(canvas().scrollLeft).toBe(240);
    expect(viewer().panX()).toBe(panX);
  });

  it('Shift + wheel and a sideways swipe scroll the region; the vertical wheel still zooms', () => {
    phone();
    const zoom = viewer().zoom();
    const shift = new WheelEvent('wheel', { deltaY: 40, shiftKey: true, cancelable: true, bubbles: true });
    canvas().dispatchEvent(shift);
    const swipe = new WheelEvent('wheel', { deltaX: 40, deltaY: 2, cancelable: true, bubbles: true });
    canvas().dispatchEvent(swipe);
    expect([shift.defaultPrevented, swipe.defaultPrevented, viewer().zoom()]).toEqual([false, false, zoom]);

    const plain = new WheelEvent('wheel', { deltaY: -40, cancelable: true, bubbles: true });
    canvas().dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(true);
    expect(viewer().zoom()).toBeGreaterThan(zoom);
  });

  it('the stage has no box by default; while scrolling it is the scroll extent and clips the unscaled svg box', () => {
    const css = compile(join(__dirname, 'dependency-viewer.component.scss')).css.replace(/\s+/g, ' ');
    expect(css).toContain('.dep-viewer__stage { display: contents; }');
    expect(css).toContain(
      '.dep-viewer__canvas--scroll .dep-viewer__stage { display: block; width: var(--_lc-dep-scroll-width, 100%); height: 100%; overflow: hidden; }',
    );
    expect(css).toContain('.dep-viewer__canvas--scroll { overflow-x: auto; overflow-y: hidden; }');
  });

  it('outside the scroll state Shift + wheel zooms, as before', () => {
    fitAt(326);
    const zoom = viewer().zoom();
    const shift = new WheelEvent('wheel', { deltaY: -40, shiftKey: true, cancelable: true, bubbles: true });
    canvas().dispatchEvent(shift);
    expect(shift.defaultPrevented).toBe(true);
    expect(viewer().zoom()).toBeGreaterThan(zoom);
  });
});
