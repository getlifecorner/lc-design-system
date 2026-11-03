import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { TableComponent, type TableColumn } from './table.component';

/**
 * Request 043 (F-22, design §2/§3): the selection checkbox keeps its 16 px box,
 * and the whole 44 px cell is its hit area through a wrapping label (its
 * `::before` covers the cell). A click in the cell never reaches a clickable row.
 */
const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'Ort' },
];
const data = [
  { id: 'a', name: 'Alice', city: 'Köln' },
  { id: 'b', name: 'Bob', city: 'Bonn' },
];

describe('TableComponent selection hit area (043)', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const rowBoxes = () => Array.from(el().querySelectorAll<HTMLInputElement>('tbody .lc-table__checkbox'));
  const headerBox = () => el().querySelector<HTMLInputElement>('thead .lc-table__checkbox') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
  });

  describe('selectable', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();
    });

    it('wraps every checkbox in an empty label inside the select cell; the box keeps its attributes and name', () => {
      const boxes = [headerBox(), ...rowBoxes()];
      expect(boxes).toHaveLength(3);
      for (const box of boxes) {
        const label = box.parentElement as HTMLElement;
        expect([label.tagName, label.className, label.textContent?.trim()]).toEqual(['LABEL', 'lc-table__select-hit', '']);
        expect(label.parentElement?.classList.contains('lc-table__select-cell')).toBe(true);
        expect(box.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['aria-label', 'class', 'type']);
      }
      expect(rowBoxes().map((b) => b.getAttribute('aria-label'))).toEqual(['Select row 1', 'Select row 2']);
      expect(headerBox().getAttribute('aria-label')).toBe('Select all rows');
    });

    it('a click on the label (anywhere in the cell) toggles the row once', () => {
      const emitted: unknown[][] = [];
      fixture.componentInstance.selectionChange.subscribe((e) => emitted.push(e.selected));
      (rowBoxes()[1].parentElement as HTMLElement).click();
      fixture.detectChanges();
      expect(rowBoxes()[1].checked).toBe(true);
      expect(emitted).toEqual([[data[1]]]);
    });

    it('a click on the header label selects all rows', () => {
      (headerBox().parentElement as HTMLElement).click();
      fixture.detectChanges();
      expect(rowBoxes().every((b) => b.checked)).toBe(true);
      expect(headerBox().checked).toBe(true);
    });

    it('a click on the label or the box never emits rowClick on a clickable row', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();
      const clicks: unknown[] = [];
      fixture.componentInstance.rowClick.subscribe((r) => clicks.push(r));
      (rowBoxes()[0].parentElement as HTMLElement).click();
      rowBoxes()[1].click();
      fixture.detectChanges();
      expect(clicks).toEqual([]);
      expect(rowBoxes().map((b) => b.checked)).toEqual([true, true]);
    });
  });

  it('renders no select cell or label when not selectable (default unchanged)', () => {
    fixture.detectChanges();
    expect(el().querySelectorAll('.lc-table__select-cell, .lc-table__select-hit, .lc-table__checkbox')).toHaveLength(0);
  });

  describe('SCSS', () => {
    const css = compile(resolve(__dirname, 'table.component.scss')).css;
    const body = (selector: string) => {
      const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].trim() === selector);
      expect([selector, found.length]).toEqual([selector, 1]);
      return found[0][2].replace(/\s+/g, ' ').trim();
    };

    it('AC-1: a 44 px column whose cell is the containing block of the label hit area', () => {
      expect(body('.lc-table__select-cell')).toBe(
        'position: relative; width: var(--size-min-touch-height, 2.75rem); text-align: center !important; padding: var(--spacing-2) calc((var(--size-min-touch-height, 2.75rem) - 1rem) / 2) !important;',
      );
      expect(body('.lc-table__select-hit::before')).toBe('content: ""; position: absolute; inset: 0;');
      // An inline label (no display of its own) leaves the box where a bare checkbox sat.
      expect(body('.lc-table__select-hit')).toBe('cursor: pointer;');
    });

    it('AC-2: the box keeps its 16 px size and sits above the hit area', () => {
      const box = body('.lc-table__checkbox');
      expect(box).toMatch(/^position: relative; width: 16px; height: 16px; cursor: pointer; accent-color: var\(--color-primary\);/);
    });
  });
});
