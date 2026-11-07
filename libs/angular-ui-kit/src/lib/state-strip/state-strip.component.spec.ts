import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import {
  DEFAULT_STATE_STRIP_LABELS,
  StateStripComponent,
  type StateStripLabels,
  type StateStripSegment,
} from './state-strip.component';
import { audit, computedName, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.36 (request 056, quellen row 1, AC-1 to AC-6, D-1): the states of the
 * last runs as a single-row grid. jsdom has no layout: widths, overflow and
 * contrast are measured in the stories and theme-contrast.spec.ts.
 */
const GERMAN: StateStripLabels = { success: 'geladen', warning: 'teilweise geladen', error: 'fehlgeschlagen', neutral: 'ausstehend' };
const day = (n: number) => `${String(n).padStart(2, '0')}.10., 06:00`;
/** Nine loaded runs and one failed one, the failed one ninth (oldest first). */
const RUNS: StateStripSegment[] = Array.from({ length: 10 }, (_, i) => ({ state: i === 8 ? 'error' : 'success', label: day(i + 1) }));

describe('StateStripComponent (3.36, request 056)', () => {
  let fixture: ComponentFixture<StateStripComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const grid = () => host().querySelector('[role=grid]') as HTMLElement | null;
  const cells = () => Array.from(host().querySelectorAll<HTMLElement>('[role=gridcell]'));
  const caption = () => host().querySelector('.lc-state-strip__caption') as HTMLElement | null;

  beforeEach(() => TestBed.configureTestingModule({ imports: [StateStripComponent] }));
  afterEach(() => fixture?.destroy());

  const render = (inputs: Record<string, unknown>) => {
    fixture = TestBed.createComponent(StateStripComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    document.body.appendChild(host());
  };
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  describe('AC-1: segments in order, nothing without them', () => {
    it('one cell per segment, oldest first, each with its state mark', () => {
      render({ segments: RUNS, ariaLabel: 'Last 10 load runs' });
      expect(host().className).toBe('lc-state-strip');
      expect(cells()).toHaveLength(10);
      expect(cells().map((c) => c.querySelector('.lc-state-strip__mark')?.className.split(' ')[1])).toEqual([
        ...Array(8).fill('lc-state-strip__mark--success'),
        'lc-state-strip__mark--error',
        'lc-state-strip__mark--success',
      ]);
      expect(cells().map((c) => c.querySelector('.lc-state-strip__name')?.textContent)[0]).toBe('01.10., 06:00, succeeded');
      expect(grid()?.querySelector('[role=row]')?.parentElement).toBe(grid());
    });

    it('no segments: no grid, no caption, and the host is display none (class)', () => {
      render({ segments: [], ariaLabel: 'Last 10 load runs' });
      expect(grid()).toBeNull();
      expect(host().children).toHaveLength(0);
      expect(host().classList).toContain('lc-state-strip--empty');
      const css = compile(resolve(__dirname, 'state-strip.component.scss')).css;
      expect(css).toMatch(/:host\(\.lc-state-strip--empty\) \{\s*display: none;\s*\}/);
    });

    it('an unknown state draws as neutral', () => {
      render({ segments: [{ state: 'running' as never, label: 'Heute' }] });
      expect(cells()[0].querySelector('.lc-state-strip__mark')?.classList).toContain('lc-state-strip__mark--neutral');
      expect(grid()?.getAttribute('aria-label')).toBe('1 pending');
    });
  });

  describe('AC-2 (D-1): the name counts the states', () => {
    it('English defaults: ariaLabel, then the counts in the order success, warning, error, neutral; 0 left out', () => {
      render({ segments: RUNS, ariaLabel: 'Last 10 load runs' });
      expect(grid()?.getAttribute('aria-label')).toBe('Last 10 load runs, 9 succeeded, 1 failed');
      expect(DEFAULT_STATE_STRIP_LABELS).toEqual({ success: 'succeeded', warning: 'with warnings', error: 'failed', neutral: 'pending' });
    });

    it('German stateLabels: „Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“', () => {
      render({ segments: RUNS, ariaLabel: 'Letzte 10 Ladeläufe', stateLabels: GERMAN });
      expect(grid()?.getAttribute('aria-label')).toBe('Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen');
      expect(computedName(host(), cells()[8])).toBe('09.10., 06:00, fehlgeschlagen');
    });

    it('all four states, a partial stateLabels over the defaults, no ariaLabel', () => {
      const mixed: StateStripSegment[] = [
        { state: 'neutral', label: 'a' },
        { state: 'warning', label: 'b' },
        { state: 'success', label: 'c' },
        { state: 'error', label: 'd' },
        { state: 'warning', label: 'e' },
      ];
      render({ segments: mixed, stateLabels: { warning: 'teilweise geladen' } });
      expect(grid()?.getAttribute('aria-label')).toBe('1 succeeded, 2 teilweise geladen, 1 failed, 1 pending');
    });
  });

  describe('AC-3: one Tab stop, arrows, caption', () => {
    it('only the newest run is in the Tab order at first', () => {
      render({ segments: RUNS });
      expect(cells().map((c) => c.getAttribute('tabindex'))).toEqual([...Array(9).fill('-1'), '0']);
    });

    it('Arrow Left/Right, Home and End move the stop and the focus, without wrapping', () => {
      render({ segments: RUNS, stateLabels: GERMAN });
      cells()[9].focus();
      fixture.detectChanges();
      expect(key(cells()[9], 'ArrowRight').defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(cells()[9]);
      key(cells()[9], 'ArrowLeft');
      expect(document.activeElement).toBe(cells()[8]);
      expect(cells().filter((c) => c.getAttribute('tabindex') === '0')).toEqual([cells()[8]]);
      key(cells()[8], 'Home');
      expect(document.activeElement).toBe(cells()[0]);
      key(cells()[0], 'ArrowLeft');
      expect(document.activeElement).toBe(cells()[0]);
      key(cells()[0], 'End');
      expect(document.activeElement).toBe(cells()[9]);
      expect(key(cells()[9], 'a').defaultPrevented).toBe(false);
    });

    it('focus shows the run\'s name in the caption (hidden from screen readers); Escape hides it; blur removes it', () => {
      render({ segments: RUNS, stateLabels: GERMAN });
      expect(caption()).toBeNull();
      cells()[8].focus();
      fixture.detectChanges();
      expect(caption()?.textContent).toBe('09.10., 06:00, fehlgeschlagen');
      expect(caption()?.getAttribute('aria-hidden')).toBe('true');
      expect(key(cells()[8], 'Escape').defaultPrevented).toBe(true);
      expect(caption()).toBeNull();
      key(cells()[8], 'ArrowRight');
      expect(caption()?.textContent).toBe('10.10., 06:00, geladen');
      cells()[9].blur();
      fixture.detectChanges();
      expect(caption()).toBeNull();
    });

    it('pointer hover shows the hovered run, then falls back to the focused one', () => {
      render({ segments: RUNS, stateLabels: GERMAN });
      cells()[9].focus();
      cells()[2].dispatchEvent(new Event('pointerenter'));
      fixture.detectChanges();
      expect(caption()?.textContent).toBe('03.10., 06:00, geladen');
      cells()[2].dispatchEvent(new Event('pointerleave'));
      fixture.detectChanges();
      expect(caption()?.textContent).toBe('10.10., 06:00, geladen');
    });

    it('a click focuses the run and makes it the Tab stop', () => {
      render({ segments: RUNS });
      cells()[3].focus(); // what a click on a tabindex=-1 cell does
      fixture.detectChanges();
      expect(cells()[3].getAttribute('tabindex')).toBe('0');
      expect(cells()[9].getAttribute('tabindex')).toBe('-1');
    });

    it('axe: grid > row > gridcell, every cell named', async () => {
      const restore = installFakeCanvas();
      try {
        render({ segments: RUNS, ariaLabel: 'Letzte 10 Ladeläufe', stateLabels: GERMAN });
        expect(violations(await audit(host()))).toEqual([]);
      } finally {
        restore();
      }
    });
  });

  describe('AC-4, AC-5: styles', () => {
    const css = compile(resolve(__dirname, 'state-strip.component.scss')).css;

    it('hooks with their defaults; cells share the width up to the cap and never overflow', () => {
      expect(css).toMatch(/\n\.lc-state-strip__row \{\s*display: flex;\s*block-size: var\(--lc-state-strip-height, 2rem\);\s*\}/);
      expect(css).toMatch(
        /\n\.lc-state-strip__cell \{\s*position: relative;\s*flex: 1 1 0;\s*min-inline-size: 0;\s*max-inline-size: var\(--lc-state-strip-segment-max-width, 1\.5rem\);\s*\}/,
      );
      expect(css).toMatch(/\n\.lc-state-strip__cell:focus-visible \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: -2px;\s*\}/);
    });

    it('AC-4: the four states differ in place and height (32 px: 4/11, 17/11, 8/16, 15/2), in the state inks', () => {
      const geometry = (state: string) => {
        const body = css.match(new RegExp(`\\n\\.lc-state-strip__mark--${state} \\{([^}]*)\\}`))?.[1] ?? '';
        return [body.match(/top: ([^;]+);/)?.[1], body.match(/height: ([^;]+);/)?.[1], body.match(/background-color: ([^;]+);/)?.[1]];
      };
      expect(geometry('success')).toEqual(['12.5%', '34.375%', 'var(--color-text-success)']);
      expect(geometry('error')).toEqual(['53.125%', '34.375%', 'var(--color-text-error)']);
      expect(geometry('warning')).toEqual(['25%', '50%', 'var(--color-text-warning)']);
      expect(geometry('neutral')).toEqual(['calc(50% - 1px)', '2px', 'var(--color-field-border)']);
      const px = (value: string) => (value.startsWith('calc') ? 16 - 1 : (parseFloat(value) / 100) * 32);
      expect(['success', 'error', 'warning'].map((s) => geometry(s).slice(0, 2).map((v) => px(v ?? '')))).toEqual([
        [4, 11],
        [17, 11],
        [8, 16],
      ]);
      expect(css).toMatch(/\n\.lc-state-strip__mark \{\s*position: absolute;\s*inset-inline: min\(3px, 25%\);\s*\}/);
    });

    it('forced colours: marks in CanvasText (neutral GrayText), the ring in Highlight; no motion anywhere', () => {
      const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*)\}\s*$/)?.[1] ?? '';
      expect(forced).toMatch(/\.lc-state-strip__mark \{\s*forced-color-adjust: none;\s*background-color: CanvasText;\s*\}/);
      expect(forced).toMatch(/\.lc-state-strip__mark--neutral \{\s*background-color: GrayText;\s*\}/);
      expect(forced).toMatch(/\.lc-state-strip__cell:focus-visible \{\s*outline-color: Highlight;\s*\}/);
      expect(css).not.toMatch(/transition|animation/);
    });

    it('the caption: tooltip look below the strip, at most as wide as it, wrapping', () => {
      const body = css.match(/\n\.lc-state-strip__caption \{([^}]*)\}/)?.[1] ?? '';
      expect(body).toMatch(/top: calc\(100% \+ 4px\);/);
      expect(body).toMatch(/max-inline-size: 100%;/);
      expect(body).toMatch(/background-color: var\(--color-text-primary\);/);
      expect(body).toMatch(/\scolor: var\(--color-surface\);/);
      expect(body).toMatch(/overflow-wrap: break-word;/);
      expect(body).toMatch(/pointer-events: none;/);
    });
  });
});
