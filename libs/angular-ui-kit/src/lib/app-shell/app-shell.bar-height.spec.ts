import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppShellComponent } from './app-shell.component';

/**
 * lc-app-shell keeps the bottom bar's real height free (3.10.1, AS-31): in the
 * browser it writes the bar's content height to `--_lc-app-shell-bar`, which
 * the clearance and the horizon's land read. jsdom has no layout, so a
 * ResizeObserver stub plays the browser here.
 */
@Component({
  imports: [AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-shell [horizon]="horizon()">
      <p class="t-content">Inhalt</p>
      @if (bar()) {
        <div shell-bottom-nav class="t-host"><nav class="lc-bottom-nav t-bar" aria-label="Leiste">Bar</nav></div>
      }
    </lc-app-shell>
  `,
})
class BarHostComponent {
  readonly horizon = signal(false);
  readonly bar = signal(true);
}

type Entry = Pick<ResizeObserverEntry, 'contentRect'> & { contentBoxSize?: { blockSize: number }[] };

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
  /** Reports a content height, the way Chrome and Safari do. */
  resize(blockSize: number) {
    this.callback([{ contentRect: { height: blockSize } as DOMRectReadOnly, contentBoxSize: [{ blockSize }] }]);
  }
}

const VAR = '--_lc-app-shell-bar';

describe('AppShellComponent — the bar’s real height (AS-31)', () => {
  const original = global.ResizeObserver;

  afterEach(() => {
    global.ResizeObserver = original;
    FakeResizeObserver.instances = [];
  });

  async function render() {
    TestBed.configureTestingModule({ imports: [BarHostComponent] });
    const fixture = TestBed.createComponent(BarHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const shell = el.querySelector<HTMLElement>('.lc-app-shell');
    if (!shell) throw new Error('shell not rendered');
    return { fixture, el, shell };
  }

  it('writes the bar’s content height to the shell, and follows it', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { el, shell } = await render();
    const [observer] = FakeResizeObserver.instances;
    // It observes the bar itself (.lc-bottom-nav), not its host element.
    expect([...observer.targets]).toEqual([el.querySelector('.t-bar')]);
    // No value before the first measurement: the CSS fallback (72 px) holds.
    expect(shell.style.getPropertyValue(VAR)).toBe('');

    observer.resize(180);
    expect(shell.style.getPropertyValue(VAR)).toBe('180px');
    observer.resize(116);
    expect(shell.style.getPropertyValue(VAR)).toBe('116px');
  });

  it('falls back to contentRect where contentBoxSize is missing', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { shell } = await render();
    const [observer] = FakeResizeObserver.instances;
    (observer as unknown as { callback: (e: Entry[]) => void }).callback([
      { contentRect: { height: 84 } as DOMRectReadOnly },
    ]);
    expect(shell.style.getPropertyValue(VAR)).toBe('84px');
  });

  it('removes the value when the bar is hidden (0 px from 1024 px) or removed', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture, el, shell } = await render();
    const [observer] = FakeResizeObserver.instances;
    observer.resize(180);
    observer.resize(0);
    expect(shell.style.getPropertyValue(VAR)).toBe('');

    observer.resize(180);
    fixture.componentInstance.bar.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    // MutationObserver callbacks are microtasks.
    await Promise.resolve();
    expect(shell.style.getPropertyValue(VAR)).toBe('');
    expect(observer.targets.size).toBe(0);

    // A bar that comes later (`@if (items())` around it) is picked up.
    fixture.componentInstance.bar.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    expect([...observer.targets]).toEqual([el.querySelector('.t-bar')]);
  });

  it('disconnects when the shell is destroyed', async () => {
    global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const { fixture } = await render();
    const [observer] = FakeResizeObserver.instances;
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('does nothing without ResizeObserver: the CSS fallback keeps 3.10’s 112 px', async () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const { shell } = await render();
    expect(shell.style.getPropertyValue(VAR)).toBe('');
  });

  describe('styles (source contract)', () => {
    const scss = readFileSync(resolve(__dirname, 'app-shell.component.scss'), 'utf-8');

    it('keeps at least 112 px plus the inset free, or the bar’s height plus 40 px when that is more', () => {
      expect(scss).toContain(
        'max(calc(112px + env(safe-area-inset-bottom, 0px)), calc(var(--_lc-app-shell-bar, 72px) + 40px + env(safe-area-inset-bottom, 0px)))',
      );
      // The consumer's hook still wins.
      expect(scss).toMatch(/--_clearance: var\(\s*--lc-app-shell-bottom-clearance,/);
    });

    it('grows the horizon’s land by what the bar is taller than 72 px, below 1024 px', () => {
      expect(scss).toMatch(
        /@media \(max-width: 1023\.98px\) \{[^]*\.lc-app-shell--horizon:has\(> \.lc-app-shell__bottom-nav:not\(:empty\)\) > \.lc-app-shell__horizon \{\s*--_lc-horizon-land: calc\(var\(--lc-horizon-land, 112px\) \+ max\(0px, var\(--_lc-app-shell-bar, 72px\) - 72px\)\);/,
      );
    });
  });
});
