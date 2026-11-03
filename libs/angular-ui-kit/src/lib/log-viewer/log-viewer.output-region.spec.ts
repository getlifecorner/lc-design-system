import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { LogViewerComponent, LogLine } from './log-viewer.component';

/**
 * Request 043 (F-26, design D-9, AC-9): the scrolling output is the viewer's
 * keyboard stop (axe `scrollable-region-focusable`), not the whole root, and
 * there is no second stop when its lines are buttons (`clickableLines`).
 */
describe('LogViewerComponent output region (043)', () => {
  let fixture: ComponentFixture<LogViewerComponent>;
  const lines: LogLine[] = [
    { text: 'Started', level: 'info' },
    { text: 'Disk almost full', level: 'warn' },
    { text: 'Connection refused', level: 'error' },
  ];
  const root = (): HTMLElement => fixture.nativeElement.querySelector('.lc-log-viewer');
  const content = (): HTMLElement => fixture.nativeElement.querySelector('.lc-log-viewer__content');
  /** Elements that are keyboard stops only through a tabindex attribute. */
  const tabindexStops = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[tabindex]') as NodeListOf<HTMLElement>).filter(
      (e) => e.getAttribute('tabindex') !== '-1',
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LogViewerComponent] }).compileComponents();
    fixture = TestBed.createComponent(LogViewerComponent);
    fixture.componentRef.setInput('lines', lines);
  });

  it('AC-9: the output region is the tab stop (tabindex 0, role log, its name); the root is not', () => {
    fixture.detectChanges();
    expect(root().hasAttribute('tabindex')).toBe(false);
    expect([content().getAttribute('tabindex'), content().getAttribute('role'), content().getAttribute('aria-label')]).toEqual([
      '0',
      'log',
      'Log output',
    ]);
    expect(tabindexStops()).toEqual([content()]);
  });

  it('AC-9: the region keeps a custom outputAriaLabel (German)', () => {
    fixture.componentRef.setInput('outputAriaLabel', 'Protokollausgabe');
    fixture.detectChanges();
    expect(content().getAttribute('aria-label')).toBe('Protokollausgabe');
  });

  it('AC-9: with clickableLines the lines are the stops and the region adds none', () => {
    fixture.componentRef.setInput('clickableLines', true);
    fixture.detectChanges();
    expect(content().hasAttribute('tabindex')).toBe(false);
    expect(root().hasAttribute('tabindex')).toBe(false);
    const stops = tabindexStops();
    expect(stops).toHaveLength(lines.length);
    expect(stops.every((e) => e.classList.contains('lc-log-viewer__line') && e.getAttribute('role') === 'button')).toBe(true);
  });

  it('AC-9: the shortcuts still reach the root from the focused region (`/` opens the search)', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc-log-viewer__search')).toBeNull();
    content().dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc-log-viewer__search')).not.toBeNull();
  });

  describe('focus ring (SCSS)', () => {
    const css = compile(resolve(__dirname, 'log-viewer.component.scss')).css;

    it('AC-9/AC-13: the region draws the kit ring inset (the root clips), Highlight in forced colours', () => {
      expect(css).toMatch(/\n\.lc-log-viewer__content:focus-visible \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: -2px;\s*\}/);
      const forced = css.slice(css.indexOf('@media (forced-colors: active)', css.indexOf('.lc-log-viewer__level-pill--active:not(:focus-visible)') + 1));
      expect(forced).toMatch(/\.lc-log-viewer__content:focus-visible \{\s*outline-color: Highlight;/);
    });

    it('drops the dead ring of the root, which is no longer focusable', () => {
      expect(css).not.toMatch(/\n\.lc-log-viewer:focus-visible/);
    });
  });
});
