import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SelectComponent, type SelectOption } from './select.component';

/**
 * 3.33 (request 052, 050-n4, AC-23, D-6): the dropdown is at least as wide as
 * the field, with its 200 px as the floor. jsdom has no layout: the width the
 * panel receives is tested here, the boxes in the stories (328 / 400 / 1248).
 */
@Component({
  standalone: true,
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-select ariaLabel="Land" placeholder="Land wählen" [options]="options" />`,
})
class Host {
  readonly options: SelectOption[] = ['Deutschland', 'Österreich'].map((label, i) => ({ value: `c${i}`, label }));
}

const dropdown = (): HTMLElement | null => document.querySelector('.cdk-overlay-container .lc-select__dropdown');

describe('lc-select — panel at least field-wide (3.33, 050-n4)', () => {
  let fixture: ComponentFixture<Host>;
  const trigger = () => (fixture.nativeElement as HTMLElement).querySelector('[role="combobox"]') as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
  });

  it('the open panel carries the trigger width, read at every opening', () => {
    const rect = jest.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue({ width: 328 } as DOMRect);
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()?.getAttribute('style')?.trim()).toBe('--_lc-select-field-width: 328px;');
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeNull();
    rect.mockReturnValue({ width: 1248 } as DOMRect);
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()?.style.getPropertyValue('--_lc-select-field-width')).toBe('1248px');
  });

  it('the rule: max(200 px, field) wide at least, the viewport minus 16 px at most', () => {
    const css = compile(resolve(__dirname, 'select.component.scss')).css;
    const at = css.indexOf('\n.lc-select__dropdown {');
    const body = css.slice(at, css.indexOf('}', at));
    expect(body).toMatch(/min-width: max\(200px, var\(--_lc-select-field-width, 0px\)\);\s*max-width: calc\(100vw - 2 \* var\(--spacing-2\)\);\s*max-height: 320px;/);
    // The panel keeps its absolute position and its 4 px gap (select is not in AC-19).
    expect(body).toMatch(/position: absolute;/);
    expect(body).toMatch(/margin-top: var\(--spacing-1\);/);
  });
});
