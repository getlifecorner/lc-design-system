import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayInsetsService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { AppShellComponent } from './app-shell.component';
import { ToastOutletComponent } from '../toast/toast-outlet.component';

/**
 * 3.28 (request 045, AS-34): lc-app-shell tells lc-toast-outlet where its
 * header ends and where the shown bar starts. The outlet sits after
 * `</lc-app-shell>`, as in life-os, so nothing inherits: the values travel
 * through OverlayInsetsService. jsdom has no layout, so a ResizeObserver stub
 * plays the browser (as in app-shell.bar-height.spec.ts).
 */
@Component({
  imports: [AppShellComponent, ToastOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shell()) {
      <lc-app-shell>
        @if (header()) {
          <header shell-header class="t-header">Header</header>
        }
        <p>Inhalt</p>
        @if (bar()) {
          <div shell-bottom-nav><nav class="lc-bottom-nav t-bar" style="bottom: 50px" aria-label="Leiste">Bar</nav></div>
        }
      </lc-app-shell>
    }
    <lc-toast-outlet />
  `,
})
class ToastShellHostComponent {
  readonly shell = signal(true);
  readonly header = signal(true);
  readonly bar = signal(true);
}

type Size = { blockSize: number; inlineSize: number }[];
type Entry = { target: Element; contentRect: DOMRectReadOnly; contentBoxSize: Size; borderBoxSize?: Size };

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly targets = new Set<Element>();
  disconnected = false;
  constructor(private readonly callback: (entries: Entry[]) => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }
  /** Reports a content and a border-box height, the way Chrome and Safari do. */
  resize(content: number, border = content) {
    const [target] = this.targets;
    this.callback([
      {
        target,
        contentRect: { height: content } as DOMRectReadOnly,
        contentBoxSize: [{ blockSize: content, inlineSize: 0 }],
        borderBoxSize: [{ blockSize: border, inlineSize: 0 }],
      },
    ]);
  }
}

describe('AppShellComponent — offsets for lc-toast-outlet (3.28, AS-34)', () => {
  const original = global.ResizeObserver;

  afterEach(() => {
    global.ResizeObserver = original;
    FakeResizeObserver.instances = [];
  });

  async function render() {
    TestBed.configureTestingModule({ imports: [ToastShellHostComponent] });
    const fixture = TestBed.createComponent(ToastShellHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const outlet = el.querySelector('lc-toast-outlet') as HTMLElement;
    // The bar's observer comes first (AS-31), then the header's.
    const [bar, header] = FakeResizeObserver.instances;
    return { fixture, el, outlet, bar, header, insets: TestBed.inject(OverlayInsetsService) };
  }

  const frame = (outlet: HTMLElement, edge: 'top' | 'bottom') => outlet.style.getPropertyValue(`--_lc-toast-outlet-frame-${edge}`);

  it('observes the header wrapper (it carries the top inset) and the bar itself', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { el, bar, header } = await render();
    expect([...header.targets]).toEqual([el.querySelector('.lc-app-shell__header')]);
    expect([...bar.targets]).toEqual([el.querySelector('.t-bar')]);
  });

  it('starts from the safe-area insets until a box is measured', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { insets, outlet } = await render();
    expect(insets.top()).toBe('env(safe-area-inset-top, 0px)');
    expect(insets.bottom()).toBe('env(safe-area-inset-bottom, 0px)');
    expect(frame(outlet, 'top')).toBe('env(safe-area-inset-top, 0px)');
  });

  it('AC-3: top toasts start at the header\'s bottom edge (its border box, the top inset included)', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture, header, insets, outlet } = await render();
    header.resize(22, 56);
    fixture.detectChanges();
    expect(insets.top()).toBe('56px');
    expect(frame(outlet, 'top')).toBe('56px');
    // It follows the header (200 % text: 177 px).
    header.resize(143, 177);
    fixture.detectChanges();
    expect(frame(outlet, 'top')).toBe('177px');
    // An empty header slot has no box: only the inset.
    header.resize(0, 0);
    fixture.detectChanges();
    expect(frame(outlet, 'top')).toBe('env(safe-area-inset-top, 0px)');
  });

  it('AC-2: bottom toasts end at the bar\'s top edge: its `bottom` (16 px + the 34 px inset) plus its border box', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture, bar, insets, outlet } = await render();
    bar.resize(84, 86);
    fixture.detectChanges();
    expect(insets.bottom()).toBe('136px');
    expect(frame(outlet, 'bottom')).toBe('136px');
    // The clearance's value is still the content height (AS-31, unchanged).
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.lc-app-shell')?.style.getPropertyValue('--_lc-app-shell-bar')).toBe('84px');
  });

  it('AC-4: a hidden bar (from 1024 px) or no bar leaves only the bottom inset', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture, bar, outlet } = await render();
    bar.resize(84, 86);
    bar.resize(0, 0);
    fixture.detectChanges();
    expect(frame(outlet, 'bottom')).toBe('env(safe-area-inset-bottom, 0px)');

    bar.resize(84, 86);
    fixture.componentInstance.bar.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    // MutationObserver callbacks are microtasks.
    await Promise.resolve();
    fixture.detectChanges();
    expect(frame(outlet, 'bottom')).toBe('env(safe-area-inset-bottom, 0px)');
  });

  it('clears both values when the shell is destroyed: the outlet is back to 0px (no style attribute)', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture, bar, header, insets, outlet } = await render();
    header.resize(22, 56);
    bar.resize(84, 86);
    fixture.componentInstance.shell.set(false);
    fixture.detectChanges();
    expect(header.disconnected).toBe(true);
    expect(bar.disconnected).toBe(true);
    expect(insets.top()).toBeNull();
    expect(insets.bottom()).toBeNull();
    fixture.detectChanges();
    expect(frame(outlet, 'top')).toBe('');
    expect(frame(outlet, 'bottom')).toBe('');
  });

  it('writes nothing without ResizeObserver (and on the server): the outlet keeps 0px', async () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const { insets, outlet } = await render();
    expect(insets.top()).toBeNull();
    expect(insets.bottom()).toBeNull();
    expect(outlet.hasAttribute('style')).toBe(false);
  });
});
