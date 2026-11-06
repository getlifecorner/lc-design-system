import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { resolve } from 'path';
import { compile } from 'sass';
import { DatepickerComponent, type DatepickerGranularity } from './datepicker.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.30 (request 047): the datepicker `label` (regeln row 7), the clear
 * button's hit area and focus (046-f1), the selected-day ring (046-f2), the
 * day panel below 1024 px (046-n3) and Enter in the month field (046-n4).
 * Design 047 §2–§6, AC-1, AC-2, AC-5, AC-6, AC-8 … AC-11.
 */
@Component({
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-datepicker
      [label]="label()"
      [ariaLabel]="ariaLabel()"
      [granularity]="granularity()"
      [format]="format()"
      [formControl]="control"
      (dateChange)="changes.push($event)"
    />
  `,
})
class HostComponent {
  readonly label = signal('');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly granularity = signal<DatepickerGranularity>('day');
  readonly format = signal('YYYY-MM-DD');
  readonly control = new FormControl<Date | string | null>(null);
  readonly changes: (Date | null)[] = [];
}

const panel = (): HTMLElement | null => document.querySelector('.lc-datepicker-calendar');

describe('lc-datepicker 3.30 (request 047)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const root = () => fixture.nativeElement as HTMLElement;
  const field = () => root().querySelector('input') as HTMLInputElement;
  const clearButton = () => root().querySelector<HTMLButtonElement>('.lc-datepicker-clear');
  const picker = () => fixture.debugElement.children[0].componentInstance as DatepickerComponent;

  const create = (patch: Partial<{ label: string; ariaLabel: string; month: boolean; value: Date | string | null }> = {}) => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    if (patch.label !== undefined) host.label.set(patch.label);
    if (patch.ariaLabel !== undefined) host.ariaLabel.set(patch.ariaLabel);
    if (patch.month) {
      host.granularity.set('month');
      host.format.set('YYYY-MM');
    }
    host.control.setValue(patch.value === undefined ? null : patch.value);
    fixture.detectChanges();
  };
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const type = (text: string) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  describe('label (AC-5)', () => {
    it.each([false, true])('renders a visible <label for> that names the field (month mode: %p)', (month) => {
      create({ label: 'Gilt ab', month, value: month ? '2026-07' : '2026-07-15' });
      const labels = root().querySelectorAll('label');
      expect(labels).toHaveLength(1);
      const label = labels[0];
      expect(label.className).toBe('lc-datepicker__label');
      expect(label.textContent).toBe('Gilt ab');
      expect(label.getAttribute('for')).toBe(field().id);
      expect(field().id).toMatch(/^lc-datepicker-\d+$/);
      expect(field().hasAttribute('aria-label')).toBe(false);
      expect(computedName(root(), field())).toBe('Gilt ab');
    });

    it('sits above the field, first in the wrapper', () => {
      create({ label: 'Start date' });
      const wrapper = root().querySelector('.lc-datepicker-wrapper') as HTMLElement;
      expect([...wrapper.children].map((c) => c.className)).toEqual(['lc-datepicker__label', 'lc-datepicker-input-wrapper']);
    });

    it('wins over ariaLabel: no aria-label while both are set; ariaLabel comes back when the label is emptied', () => {
      create({ label: 'Gilt ab', ariaLabel: 'Valid from' });
      expect(field().hasAttribute('aria-label')).toBe(false);
      expect(computedName(root(), field())).toBe('Gilt ab');
      host.label.set('');
      fixture.detectChanges();
      expect(root().querySelector('label')).toBeNull();
      expect(field().getAttribute('aria-label')).toBe('Valid from');
      expect(computedName(root(), field())).toBe('Valid from');
    });

    it('defaults to an empty label', () => {
      TestBed.configureTestingModule({ imports: [DatepickerComponent] });
      const plain = TestBed.createComponent(DatepickerComponent);
      expect(plain.componentInstance.label()).toBe('');
      plain.destroy();
    });

    it('opens the calendar on a click on the label (the label forwards the click to the field)', () => {
      create({ label: 'Start date' });
      (root().querySelector('label') as HTMLLabelElement).click();
      fixture.detectChanges();
      expect(picker().isOpen()).toBe(true);
    });
  });

  describe('unchanged default (AC-6)', () => {
    it('renders no label element and keeps aria-label from ariaLabel when label is empty', () => {
      create({ ariaLabel: 'Booking date' });
      expect(root().querySelectorAll('label')).toHaveLength(0);
      expect(root().querySelector('.lc-datepicker__label')).toBeNull();
      const wrapper = root().querySelector('.lc-datepicker-wrapper') as HTMLElement;
      expect([...wrapper.children].map((c) => c.className)).toEqual(['lc-datepicker-input-wrapper']);
      expect(field().getAttribute('aria-label')).toBe('Booking date');
    });

    it('keeps the 3.29 field and clear-button markup', () => {
      create({ ariaLabel: 'Booking date', value: '2026-07-15' });
      expect(field().className).toBe('lc-datepicker lc-datepicker--md lc-datepicker--outline');
      const icons = root().querySelector('.lc-datepicker-icons') as HTMLElement;
      expect([...icons.children].map((c) => c.getAttribute('class'))).toEqual(['lc-datepicker-clear', 'lc-datepicker-calendar-icon']);
      const clear = clearButton() as HTMLButtonElement;
      expect(clear.getAttributeNames().sort()).toEqual(['aria-label', 'class', 'type']);
    });
  });

  describe('clear button (AC-1, AC-8)', () => {
    it('is a native button in the tab order after the field, named by clearAriaLabel', () => {
      create({ value: '2026-07-15' });
      const clear = clearButton() as HTMLButtonElement;
      expect(clear.type).toBe('button');
      expect(clear.hasAttribute('tabindex')).toBe(false);
      expect(clear.getAttribute('aria-label')).toBe('Clear date');
      expect(field().compareDocumentPosition(clear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it.each([false, true])('clears to null and moves focus to the field (month mode: %p)', (month) => {
      create({ month, value: month ? '2026-07' : '2026-07-15' });
      const clear = clearButton() as HTMLButtonElement;
      clear.focus();
      clear.click();
      fixture.detectChanges();
      expect(host.changes).toEqual([null]);
      expect(host.control.value).toBeNull();
      expect(field().value).toBe('');
      expect(clearButton()).toBeNull();
      expect(document.activeElement).toBe(field());
      expect(picker().isOpen()).toBe(false);
    });

    it('keeps clear() itself focus-neutral (a programmatic clear does not move focus)', () => {
      create({ value: '2026-07-15' });
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();
      picker().clear();
      fixture.detectChanges();
      expect(document.activeElement).toBe(outside);
      outside.remove();
    });
  });

  describe('Enter in the open month field (AC-10, 046-n4)', () => {
    it('shows the committed month again over half-typed text and closes, without a new change', () => {
      create({ month: true, value: '2026-07' });
      field().focus();
      field().click();
      fixture.detectChanges();
      type('2026-1');
      expect(field().value).toBe('2026-1');
      const event = key(field(), 'Enter');
      expect(event.defaultPrevented).toBe(true);
      expect(field().value).toBe('2026-07');
      expect(picker().isOpen()).toBe(false);
      expect(host.changes).toEqual([]);
    });

    it('keeps the text and the panel without a selection, as day mode', () => {
      create({ month: true });
      field().click();
      fixture.detectChanges();
      type('2026-1');
      key(field(), 'Enter');
      expect(field().value).toBe('2026-1');
      expect(picker().isOpen()).toBe(true);
      expect(host.changes).toEqual([]);
    });

    it('matches day mode, which rewrites the text on Enter', () => {
      create({ value: '2026-07-15' });
      field().click();
      fixture.detectChanges();
      type('2026-07-1');
      key(field(), 'Enter');
      expect(field().value).toBe('2026-07-15');
      expect(picker().isOpen()).toBe(false);
    });
  });

  describe('day panel overlay (AC-9)', () => {
    it('is pushed into the viewport with an 8 px margin', () => {
      create();
      const node = fixture.debugElement.queryAllNodes(By.directive(CdkConnectedOverlay))[0];
      const overlay = node.injector.get(CdkConnectedOverlay);
      expect(overlay.push).toBe(true);
      // 3.33 (request 052, D-5): the 8 px live in the geometry (origin box
      // and panel margin, datepicker.overlay-geometry.spec.ts); the CDK's own
      // margin ignored the start side, so it is 0 now.
      expect(overlay.viewportMargin).toBe(0);
    });

    it('marks the selected day with the selected class (the ring is CSS)', () => {
      create({ value: '2026-07-15' });
      field().click();
      fixture.detectChanges();
      const selected = (panel() as HTMLElement).querySelectorAll('.lc-datepicker-day--selected');
      expect(selected).toHaveLength(1);
      expect(selected[0].textContent?.trim()).toBe('15');
    });
  });
});

describe('lc-datepicker 3.30 styles (request 047)', () => {
  const css = compile(resolve(__dirname, 'datepicker.component.scss')).css;
  /** The body of the top-level rule `selector` (compiled CSS, first match). */
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(at, css.indexOf('}', at));
  };
  /** The body of the `@media (…)` block that starts with `query`. */
  const media = (query: string) => {
    const at = css.indexOf(`@media ${query} {`);
    expect(at).toBeGreaterThan(-1);
    let depth = 0;
    for (let i = css.indexOf('{', at); i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1);
    }
    return '';
  };
  const inner = (block: string, selector: string) => {
    const at = block.indexOf(`  ${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return block.slice(at, block.indexOf('}', at));
  };

  it('AC-1: the clear button is a 24 px box with a 20 px footprint and content-box fill, ring at the old place', () => {
    const clear = rule('.lc-datepicker-clear');
    expect(clear).toContain('position: relative');
    expect(clear).toMatch(/width: 1\.5rem;\n\s*height: 1\.5rem;\n\s*margin: -0\.125rem;\n\s*padding: 0\.125rem;/);
    // After the `background` shorthand, which would reset the clip.
    expect(clear).toMatch(/background: none;\n\s*background-clip: content-box;/);
    expect(clear).toContain('border-radius: calc(var(--border-radius-sm) + 0.125rem)');
    expect(rule('.lc-datepicker-clear:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\);\n\s*outline-offset: -1px;/);
    expect(rule('.lc-datepicker-clear svg')).toMatch(/width: 1rem;\n\s*height: 1rem;/);
  });

  it('AC-1: md and lg get a 44 × 44 hit area (24 + 20 high, 24 + 18 + 2 wide); xs and sm keep the 24 px box', () => {
    const at = css.indexOf('\n.lc-datepicker--md ~ .lc-datepicker-icons .lc-datepicker-clear::before,\n.lc-datepicker--lg ~ .lc-datepicker-icons .lc-datepicker-clear::before {');
    expect(at).toBeGreaterThan(-1);
    const hit = css.slice(at, css.indexOf('}', at));
    expect(hit).toMatch(/content: "";\n\s*position: absolute;\n\s*inset: -0\.625rem -0\.125rem -0\.625rem -1\.125rem;/);
    expect(css).not.toMatch(/lc-datepicker--(xs|sm) ~/);
  });

  it('AC-1, AC-11: the field heights and the icons row are unchanged', () => {
    for (const size of ['xs', 'sm', 'md', 'lg']) {
      expect(rule(`.lc-datepicker.lc-datepicker--${size}`)).toContain(`height: var(--size-interactive-${size}-height)`);
    }
    expect(rule('.lc-datepicker-icons')).toMatch(/right: var\(--spacing-3\);[\s\S]*gap: var\(--spacing-1\);\n\s*pointer-events: none;/);
  });

  it('AC-2: the selected day keeps its fill and gains the inset primary-500 ring, at every width', () => {
    const selected = rule('.lc-datepicker-day.lc-datepicker-day--selected');
    expect(selected).toContain('color: var(--color-on-primary)');
    expect(selected).toContain('background-color: var(--color-primary-fill)');
    expect(selected).toContain('box-shadow: inset 0 0 0 2px var(--color-primary-500)');
    expect(rule('.lc-datepicker-day.lc-datepicker-day--selected:hover')).toContain('background-color: var(--color-primary-fill-hover)');
  });

  it('AC-9: below 1024 px the day panel has 44 px targets in a gapless 7 × 44 grid that narrows with the viewport', () => {
    const block = media('(max-width: 1023.98px)');
    expect(inner(block, '.lc-datepicker-nav-button')).toMatch(/width: 2\.75rem;\n\s*height: 2\.75rem;/);
    expect(inner(block, '.lc-datepicker-today-button')).toContain('min-height: 2.75rem');
    const grids = inner(block, '.lc-datepicker-weekdays,\n  .lc-datepicker-days');
    expect(grids).toMatch(
      /gap: 0;\n\s*grid-template-columns: repeat\(7, minmax\(0, 1fr\)\);\n\s*inline-size: 19\.25rem;\n\s*max-inline-size: calc\(100vw - 3\.125rem\);/,
    );
    expect(inner(block, '.lc-datepicker-day')).toMatch(/width: 100%;\n\s*height: auto;\n\s*aspect-ratio: 1;/);
    // Exactly these four rules: nothing else changes below 1024 px.
    expect(block.match(/\{/g)).toHaveLength(5);
  });

  it('AC-9: the panel is in the flow of the overlay pane, so the CDK measures it and can push it', () => {
    const calendar = rule('.lc-datepicker-calendar');
    expect(calendar).toMatch(/position: relative;\n\s*z-index: 1000;/);
    expect(calendar).not.toContain('position: absolute');
  });

  it('AC-11: from 1024 px the day panel keeps its 3.29 sizes (top-level rules)', () => {
    expect(rule('.lc-datepicker-weekdays')).toMatch(/grid-template-columns: repeat\(7, 1fr\);\n\s*gap: var\(--spacing-1\);/);
    expect(rule('.lc-datepicker-days')).toMatch(/grid-template-columns: repeat\(7, 1fr\);\n\s*gap: var\(--spacing-1\);/);
    expect(rule('.lc-datepicker-day')).toMatch(/width: 2\.25rem;\n\s*height: 2\.25rem;/);
    expect(rule('.lc-datepicker-nav-button')).toMatch(/width: 2rem;\n\s*height: 2rem;/);
  });

  it('AC-5: the label is 14/500 text-primary, 2 px above the wrapper gap, and hyphenates long compounds', () => {
    const label = rule('.lc-datepicker__label');
    expect(label).toMatch(
      /display: block;\n\s*margin-bottom: 0\.125rem;\n\s*font-size: var\(--font-size-sm\);\n\s*font-weight: var\(--font-weight-medium\);\n\s*line-height: var\(--line-height-normal\);\n\s*color: var\(--color-text-primary\);\n\s*overflow-wrap: break-word;\n\s*hyphens: auto;\n\s*hyphenate-limit-chars: 12 4 3;/,
    );
  });

  it('forced colours: the clear ring and the day cells as the month cells', () => {
    const forced = media('(forced-colors: active)');
    expect(forced).toMatch(/\.lc-datepicker-clear:focus-visible,\n\s*\.lc-datepicker-day:focus-visible \{\n\s*outline-color: Highlight;/);
    expect(forced).toMatch(
      /\.lc-datepicker-day\.lc-datepicker-day--selected,\n\s*\.lc-datepicker-day\.lc-datepicker-day--selected:hover \{\n\s*forced-color-adjust: none;\n\s*background-color: Highlight;\n\s*color: HighlightText;/,
    );
    expect(forced).toMatch(/\.lc-datepicker-day\.lc-datepicker-day--today \{\n\s*text-decoration: underline;/);
    expect(forced).toMatch(/\.lc-datepicker-day\.lc-datepicker-day--disabled \{\n\s*color: GrayText;/);
  });
});
