import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TimelineComponent, type TimelineItem, type TimelineOrientation } from './timeline.component';

/**
 * 3.46 (request 066, follow-up 065-s1, WCAG 2.1.1): a horizontal timeline
 * without `selectable` that is wider than its box becomes a named tab stop
 * (AC-12, AC-15); measured live with a ResizeObserver, not only at the first
 * render, and nothing is added while it fits, on the server, or to vertical
 * and selectable timelines (AC-13). Titles centre over their markers (AC-14).
 */
const items: TimelineItem[] = [
  { title: 'Antrag', description: 'Eingereicht' },
  { title: 'Prüfung', description: 'Fachbereich' },
  { title: 'Freigabe', description: 'Controlling' },
  { title: 'Auszahlung', description: 'Buchhaltung' },
];

/** A ResizeObserver whose callback the test calls; records what it observes. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;
  constructor(readonly callback: () => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(target: Element): void {
    this.observed.push(target);
  }
  unobserve(): void {
    /* not used */
  }
  disconnect(): void {
    this.disconnected = true;
  }
}

describe('lc-timeline horizontal overflow (3.46, request 066, 065-s1)', () => {
  let fixture: ComponentFixture<TimelineComponent>;
  let original: typeof ResizeObserver;
  /** The list's widths as the browser would report them. */
  const size = { scroll: 512, client: 328 };

  beforeEach(() => {
    original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    FakeResizeObserver.instances = [];
    size.scroll = 512;
    size.client = 328;
    TestBed.configureTestingModule({ imports: [TimelineComponent] });
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
  });

  function render(inputs: Partial<{ orientation: TimelineOrientation; selectable: boolean; scrollLabel: string; items: TimelineItem[] }> = {}) {
    fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('items', inputs.items ?? items);
    fixture.componentRef.setInput('orientation', inputs.orientation ?? 'horizontal');
    if (inputs.selectable !== undefined) fixture.componentRef.setInput('selectable', inputs.selectable);
    if (inputs.scrollLabel !== undefined) fixture.componentRef.setInput('scrollLabel', inputs.scrollLabel);
    fixture.detectChanges();
    const list = (fixture.nativeElement as HTMLElement).querySelector('ol') as HTMLOListElement;
    Object.defineProperty(list, 'scrollWidth', { configurable: true, get: () => size.scroll });
    Object.defineProperty(list, 'clientWidth', { configurable: true, get: () => size.client });
    return list;
  }

  /** The browser reports a size change: every live observer calls back. */
  function resize(scroll: number, client: number) {
    size.scroll = scroll;
    size.client = client;
    for (const observer of FakeResizeObserver.instances.filter((o) => !o.disconnected)) observer.callback();
    fixture.detectChanges();
  }

  const attrs = (list: HTMLElement) => [list.getAttribute('tabindex'), list.getAttribute('aria-label'), list.getAttribute('role'), list.className];

  it('AC-12, AC-15: overflowing, the list is a tab stop named "Timeline", keeps its list role and gets the ring class', () => {
    const list = render();
    resize(512, 328);
    expect(attrs(list)).toEqual(['0', 'Timeline', null, 'timeline timeline--horizontal timeline--scroll']);
    expect(list.tagName).toBe('OL');
  });

  it('AC-13: one observer watches the list and each item', () => {
    const list = render();
    expect(FakeResizeObserver.instances).toHaveLength(1);
    expect(FakeResizeObserver.instances[0].observed).toEqual([list, ...Array.from(list.children)]);
    expect(list.children).toHaveLength(4);
  });

  it('AC-13: live: on, then off again when it fits after a resize (no extra tab stop)', () => {
    const list = render();
    expect(attrs(list)).toEqual([null, null, null, 'timeline timeline--horizontal']);
    resize(512, 328);
    expect(list.getAttribute('tabindex')).toBe('0');
    resize(992, 992);
    expect(attrs(list)).toEqual([null, null, null, 'timeline timeline--horizontal']);
    resize(1000, 992);
    expect(list.getAttribute('tabindex')).toBe('0');
  });

  it('AC-15: a German name, and an empty one omits the name but keeps the tab stop', () => {
    const list = render({ scrollLabel: 'Zeitleiste' });
    resize(512, 328);
    expect(list.getAttribute('aria-label')).toBe('Zeitleiste');
    fixture.componentRef.setInput('scrollLabel', '');
    fixture.detectChanges();
    expect(list.hasAttribute('aria-label')).toBe(false);
    expect(list.getAttribute('tabindex')).toBe('0');
  });

  it('AC-15: the input is documented with its default', () => {
    expect(TestBed.createComponent(TimelineComponent).componentInstance.scrollLabel()).toBe('Timeline');
    const source = readFileSync(resolve(__dirname, 'timeline.component.ts'), 'utf8');
    const jsdoc = /\/\*\*((?:(?!\*\/)[^])*)\*\/\s*readonly scrollLabel = input<string>\('Timeline'\);/.exec(source)?.[1] ?? '';
    expect(jsdoc).toContain('WCAG 2.1.1');
    expect(jsdoc).toMatch(/@default 'Timeline'\s*$/);
  });

  it.each([
    ['vertical', { orientation: 'vertical' as const }],
    ['selectable horizontal', { selectable: true }],
  ])('AC-13, AC-15: a %s timeline gets nothing, even when it overflows', (_, inputs) => {
    const list = render(inputs);
    resize(512, 328);
    expect([list.getAttribute('tabindex'), list.getAttribute('aria-label')]).toEqual([null, null]);
    expect(list.classList).not.toContain('timeline--scroll');
    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it('AC-13: a selectable timeline keeps its buttons as the tab stops', () => {
    const list = render({ selectable: true });
    resize(512, 328);
    const stops = [...list.querySelectorAll('[tabindex]')].map((el) => [el.tagName, el.getAttribute('tabindex')]);
    expect(stops).toEqual([['BUTTON', '0'], ['BUTTON', '-1'], ['BUTTON', '-1'], ['BUTTON', '-1']]);
  });

  it('AC-13: turning vertical while overflowing removes it and disconnects; destroy disconnects', () => {
    const list = render();
    resize(512, 328);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect([list.getAttribute('tabindex'), list.getAttribute('aria-label')]).toEqual([null, null]);
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(FakeResizeObserver.instances).toHaveLength(2);
    fixture.destroy();
    expect(FakeResizeObserver.instances[1].disconnected).toBe(true);
  });

  it('AC-13: new items are observed by a new observer', () => {
    const list = render();
    fixture.componentRef.setInput('items', [...items, { title: 'Archiv' }]);
    fixture.detectChanges();
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
    expect(FakeResizeObserver.instances[1].observed).toEqual([list, ...Array.from(list.children)]);
    expect(list.children).toHaveLength(5);
  });

  it('AC-13: without a ResizeObserver (server) nothing is added and nothing throws', () => {
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
    const list = render();
    expect(list.outerHTML.match(/^<ol[^>]*>/)?.[0].replace(/\s_ngcontent-[\w-]+=""/, '')).toBe('<ol class="timeline timeline--horizontal">');
  });

  describe('stylesheet', () => {
    const css = compile(resolve(__dirname, 'timeline.component.scss')).css.replace(/\s+/g, ' ');

    it('AC-14: horizontal titles centre over their markers (backlog 065-n1)', () => {
      expect(css).toContain('.timeline--horizontal .timeline__header { justify-content: center; }');
      // The meta keeps its auto margin, so a header with meta still spreads.
      expect(css).toContain('.timeline__meta { margin-left: auto;');
    });

    it('AC-12, AC-16: an outside 2 px ring on the overflowing list, Highlight in forced colours', () => {
      expect(css).toContain('.timeline--scroll:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }');
      expect(css).toContain('@media (forced-colors: active) { .timeline--scroll:focus-visible { outline-color: Highlight; } }');
      // Native arrow-key scrolling needs the scroller itself.
      expect(css).toContain('.timeline--horizontal { display: flex; overflow-x: auto; }');
    });
  });
});
