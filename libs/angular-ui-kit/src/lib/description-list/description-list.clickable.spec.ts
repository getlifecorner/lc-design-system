import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { DescriptionListComponent, DescriptionListItem, DescriptionListLayout, DescriptionListSize } from './description-list.component';

/**
 * Request 036 (BA-10): a clickable row in the rows layout is at least 44 px
 * tall and focus draws a 2 px outline. Geometry is measured in the browser
 * (build.md); this spec pins the rules and that nothing else changed.
 */
describe('DescriptionListComponent clickable rows (BA-10)', () => {
  const css = compile(join(__dirname, 'description-list.component.scss')).css;
  /** Every top-level rule (the forced-colours block is read on its own). */
  const rules = [...css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));
  const body = (selector: string) => {
    const found = rules.filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };
  const padding = (selector: string) => body(selector).match(/padding-block:\s*([^;]+);/)?.[1];
  const target = (space: string) => `max(var(${space}), (var(--size-min-touch-height) - 1lh) / 2)`;

  it('pads a clickable row to --size-min-touch-height with one line, md and sm', () => {
    expect(padding('.lc-dl--rows .lc-dl__row.lc-dl__row--clickable')).toBe(target('--spacing-2'));
    expect(padding('.lc-dl--rows.lc-dl--sm .lc-dl__row.lc-dl__row--clickable')).toBe(target('--spacing-1'));
  });

  it('places the target rules after the size rule, so 0,3,0 and 0,4,0 win over `.lc-dl--sm .lc-dl__row`', () => {
    const order = (selector: string) => rules.findIndex((r) => r.selector === selector);
    expect(order('.lc-dl--rows .lc-dl__row.lc-dl__row--clickable')).toBeGreaterThan(order('.lc-dl--sm .lc-dl__row'));
    expect(order('.lc-dl--rows.lc-dl--sm .lc-dl__row.lc-dl__row--clickable')).toBeGreaterThan(order('.lc-dl--sm .lc-dl__row'));
  });

  it('keeps the padding of non-clickable rows and of the stacked layout (AC-4)', () => {
    expect(padding('.lc-dl--rows .lc-dl__row')).toBe('var(--spacing-2)');
    expect(padding('.lc-dl--sm .lc-dl__row')).toBe('var(--spacing-1)');
    expect(padding('.lc-dl--stacked .lc-dl__row')).toBe('var(--spacing-2)');
    // Only the clickable rows of the rows layout take the touch-target padding.
    const touch = rules.filter((r) => r.body.includes('--size-min-touch-height'));
    expect(touch.map((r) => r.selector)).toEqual([
      '.lc-dl--rows .lc-dl__row.lc-dl__row--clickable',
      '.lc-dl--rows.lc-dl--sm .lc-dl__row.lc-dl__row--clickable',
    ]);
  });

  it('draws focus as a 2 px outline 2 px outside the row, Highlight in forced colours', () => {
    expect(body('.lc-dl__row--clickable:focus-visible')).toMatch(/^\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;\s*$/);
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-dl__row--clickable:focus-visible \{\s*outline-color: Highlight;\s*\}\s*\}/);
  });

  describe('markup', () => {
    @Component({
      standalone: true,
      imports: [DescriptionListComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `<lc-description-list [items]="items" [layout]="layout()" [size]="size()" [clickable]="clickable()" />`,
    })
    class Host {
      readonly items: DescriptionListItem[] = [
        { term: 'Bank', value: 'Sparkasse KölnBonn' },
        { term: 'Freigabe', value: 'Alle Erwachsenen', emphasis: 'primary' },
      ];
      readonly layout = signal<DescriptionListLayout>('rows');
      readonly size = signal<DescriptionListSize>('md');
      readonly clickable = signal(false);
    }

    it('gives rows the clickable class only when clickable (the default renders as before)', async () => {
      await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const rows = () => Array.from(fixture.nativeElement.querySelectorAll('.lc-dl__row')) as HTMLElement[];
      expect(rows().map((r) => r.className)).toEqual(['lc-dl__row', 'lc-dl__row']);

      for (const [layout, size] of [['rows', 'md'], ['rows', 'sm'], ['stacked', 'md'], ['stacked', 'sm']] as const) {
        fixture.componentInstance.layout.set(layout);
        fixture.componentInstance.size.set(size);
        fixture.componentInstance.clickable.set(true);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('dl').className).toContain(`lc-dl--${layout}`);
        expect(fixture.nativeElement.querySelector('dl').className).toContain(`lc-dl--${size}`);
        for (const row of rows()) {
          expect(row.classList).toContain('lc-dl__row--clickable');
          expect(row.getAttribute('role')).toBe('button');
          expect(row.getAttribute('tabindex')).toBe('0');
        }
      }
    });
  });
});
