import { ComponentFixture, TestBed } from '@angular/core/testing';
import { encapsulateStyle } from '@angular/compiler';
import { resolve } from 'path';
import { compile } from 'sass';
import { TableComponent, type TableColumn } from './table.component';

/**
 * 3.19 (request 024, 021 review F1 and F2): `cellClass` typography wins over
 * the kit's cell defaults, `pageSizeLabel`, the page-size select without its
 * clear control, and the wrapping pager with 44 px tap areas.
 */
const columns: TableColumn[] = [{ key: 'name', label: 'Name' }];
const data = Array.from({ length: 30 }, (_, i) => ({ name: `Row ${i + 1}` }));
const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement | null;

describe('TableComponent pagination (3.19, request 024)', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = (selector: string, root: ParentNode = el()) => root.querySelector(selector)?.textContent?.trim();
  const pagination = () => el().querySelector('.lc-table-pagination') as HTMLElement;
  const trigger = () => el().querySelector('.lc-table-pagination__size [role="combobox"]') as HTMLElement;

  async function render(inputs: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('paginate', true);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    // ngModel writes the page size into lc-select after a microtask.
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** Opens the page-size select and returns its option labels. */
  function openOptions(): HTMLElement[] {
    trigger().click();
    fixture.detectChanges();
    return [...(overlay()?.querySelectorAll<HTMLElement>('.lc-select__option') ?? [])];
  }

  afterEach(() => overlay()?.replaceChildren());

  it('pins the default pagination: texts, names, order and the md size', async () => {
    await render();
    expect(pagination().className).toBe('lc-table-pagination lc-table-pagination--md');
    expect([...pagination().children].map((c) => c.className)).toEqual([
      'lc-table-pagination__info',
      'lc-table-pagination__controls',
    ]);
    expect(text('.lc-table-pagination__info')).toBe('1–10 of 30');
    const controls = el().querySelector('.lc-table-pagination__controls') as HTMLElement;
    expect([...controls.children].map((c) => `${c.tagName}.${c.classList[0]}`)).toEqual([
      'LC-SELECT.lc-table-pagination__size',
      'DIV.lc-table-pagination__pager',
    ]);
    const pager = el().querySelector('.lc-table-pagination__pager') as HTMLElement;
    expect([...pager.children].map((c) => [c.tagName, c.className, c.textContent?.trim(), c.getAttribute('aria-label')])).toEqual([
      ['BUTTON', 'lc-table-pagination__btn', '‹', 'Previous page'],
      ['SPAN', 'lc-table-pagination__page', '1 / 3', null],
      ['BUTTON', 'lc-table-pagination__btn', '›', 'Next page'],
    ]);
    expect((pager.children[0] as HTMLButtonElement).disabled).toBe(true);
    expect((pager.children[2] as HTMLButtonElement).disabled).toBe(false);
    expect(trigger().getAttribute('aria-label')).toBe('Rows per page');
    expect(trigger().getAttribute('tabindex')).toBe('0');
    expect(trigger().classList).toContain('lc-select--md');
    expect(text('.lc-select__value', trigger())).toBe('10 / page');
    // The clear control stays in lc-select's DOM; the table hides it through --lc-select-clear-display.
    expect(el().querySelector('.lc-table-pagination__size .lc-select__clear')).toBeTruthy();
  });

  it.each([
    ['sm', 'sm'],
    ['md', 'md'],
    ['lg', 'lg'],
  ])('size %s: the pagination class and the select size follow the table size', async (size, expected) => {
    await render({ size });
    expect(pagination().classList).toContain(`lc-table-pagination--${expected}`);
    expect(trigger().classList).toContain(`lc-select--${expected}`);
  });

  describe('AC-2: pageSizeLabel', () => {
    it("defaults to '/ page' in every option and the shown value", async () => {
      await render();
      expect(openOptions().map((o) => text('.lc-select__option-label', o))).toEqual([
        '5 / page',
        '10 / page',
        '25 / page',
        '50 / page',
      ]);
    });

    it('takes the German text, in the options and the shown value', async () => {
      await render({ pageSizeLabel: '/ Seite' });
      expect(text('.lc-select__value', trigger())).toBe('10 / Seite');
      expect(openOptions().map((o) => text('.lc-select__option-label', o))).toEqual([
        '5 / Seite',
        '10 / Seite',
        '25 / Seite',
        '50 / Seite',
      ]);
    });

    it('an empty label leaves the bare number (no trailing space)', async () => {
      await render({ pageSizeLabel: '' });
      expect(openOptions().map((o) => o.querySelector('.lc-select__option-label')?.textContent)).toEqual(['5', '10', '25', '50']);
    });
  });

  it('AC-3: choosing a size from the list still sets the page size', async () => {
    await render();
    const option = openOptions().find((o) => text('.lc-select__option-label', o) === '25 / page') as HTMLElement;
    option.click();
    fixture.detectChanges();
    expect(text('.lc-table-pagination__info')).toBe('1–25 of 30');
    expect(text('.lc-table-pagination__page')).toBe('1 / 2');
    expect(text('.lc-select__value', trigger())).toBe('25 / page');
    expect(el().querySelectorAll('tbody tr').length).toBe(25);
  });
});

describe('TableComponent 3.19 styles (request 024)', () => {
  const css = compile(resolve(__dirname, 'table.component.scss')).css;
  /** Every rule (selector list and declarations), at-rule bodies included. */
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  /** The declarations of the rule whose selector list is exactly `selector`. */
  const rule = (selector: string) => {
    const found = rules.filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };

  describe('AC-1: body-cell typography has zero specificity', () => {
    it('every rule that sets a td colour or font size is a :where() rule', () => {
      const typography = rules.filter((r) => /(^|\s)(color|font-size):/.test(r.body));
      const onCells = typography.filter((r) =>
        r.selector.split(/,(?![^(]*\))/).some((s) => /tbody tr td(\.[\w-]+)*\)?$/.test(s.trim())),
      );
      expect(onCells.map((r) => r.selector)).toEqual([
        ':where(.lc-table tbody tr td)',
        ':where(.lc-table--sm tbody tr td)',
        ':where(.lc-table--lg tbody tr td)',
      ]);
    });

    it('keeps the defaults of 3.18: 14 px text-primary, 12 px at sm, 16 px at lg, in that order', () => {
      const base = rule(':where(.lc-table tbody tr td)');
      expect(base).toMatch(/font-size: var\(--typography-font-size-sm\);/);
      expect(base).toMatch(/\scolor: var\(--color-text-primary\);/);
      expect(rule(':where(.lc-table--sm tbody tr td)')).toMatch(/font-size: var\(--typography-font-size-xs\);/);
      expect(rule(':where(.lc-table--lg tbody tr td)')).toMatch(/font-size: var\(--typography-font-size-base\);/);
      const order = ['base', 'sm', 'lg'].map((s) =>
        css.indexOf(s === 'base' ? ':where(.lc-table tbody' : `:where(.lc-table--${s} tbody`),
      );
      expect(order).toEqual([...order].sort((a, b) => a - b));
      // The padding stays at full weight.
      expect(rule('.lc-table tbody tr td')).not.toMatch(/(^|\s)(color|font-size):/);
    });

    it('leaves the header cells as they were', () => {
      expect(rule('.lc-table thead tr th')).toMatch(/font-size: var\(--typography-font-size-sm\);/);
      expect(rule('.lc-table--sm thead tr th')).toMatch(/font-size: var\(--typography-font-size-xs\);/);
      expect(rule('.lc-table--lg thead tr th')).toMatch(/font-size: var\(--typography-font-size-base\);/);
    });

    it('drops the empty cell colour that never applied (it stays text-primary)', () => {
      expect(rule('.lc-table__empty')).not.toMatch(/(^|\s)color:/);
    });

    it("Angular's emulation scopes inside :where(), so the attributes add no weight", () => {
      const scoped = encapsulateStyle(':where(.lc-table tbody tr td) { color: red; }', 'c1');
      expect(scoped).toMatch(
        /^:where\(\.lc-table\[_ngcontent-c1\]\s+tbody\[_ngcontent-c1\]\s+tr\[_ngcontent-c1\]\s+td\[_ngcontent-c1\]\)\s*\{/,
      );
    });
  });

  describe('AC-3 to AC-5: the pager', () => {
    it('hides the clear control of the page-size select through its public hook', () => {
      expect(rule('.lc-table-pagination__size')).toMatch(/--lc-select-clear-display: none;/);
    });

    it('wraps the row and the controls, the controls at the end', () => {
      const row = rule('.lc-table-pagination');
      expect(row).toMatch(/flex-wrap: wrap;/);
      expect(row).toMatch(/gap: var\(--spacing-2\) var\(--spacing-4\);/);
      const controls = rule('.lc-table-pagination__controls');
      expect(controls).toMatch(/flex-wrap: wrap;/);
      expect(controls).toMatch(/justify-content: flex-end;/);
      expect(controls).toMatch(/margin-inline-start: auto;/);
      expect(rule('.lc-table-pagination__pager')).toMatch(/display: flex;[\s\S]*gap: var\(--spacing-2\);/);
      expect(rule('.lc-table-pagination__pager')).not.toMatch(/flex-wrap/);
    });

    it('sizes prev/next like the select: 32 / 40 / 44 px', () => {
      expect(rule('.lc-table-pagination')).toMatch(/--_lc-table-pagination-btn: var\(--size-interactive-md-height\);/);
      expect(rule('.lc-table-pagination--sm')).toMatch(/--_lc-table-pagination-btn: var\(--size-interactive-sm-height\);/);
      expect(rule('.lc-table-pagination--lg')).toMatch(/--_lc-table-pagination-btn: var\(--size-interactive-lg-height\);/);
      const btn = rule('.lc-table-pagination__btn');
      expect(btn).toMatch(/width: var\(--_lc-table-pagination-btn\);/);
      expect(btn).toMatch(/height: var\(--_lc-table-pagination-btn\);/);
      expect(btn).toMatch(/position: relative;/);
      expect(btn).toMatch(/border: 1px solid var\(--color-field-border\);/);
      expect(btn).toMatch(/background-color: var\(--color-surface-2\);/);
      expect(btn).toMatch(/border-radius: var\(--border-radius-md\);/);
      expect(btn).toMatch(/font-size: var\(--typography-font-size-xl\);/);
    });

    it('AC-4: a 44 px unpainted hit area and the kit ring', () => {
      const hit = rule('.lc-table-pagination__btn::before');
      expect(hit).toMatch(/content: "";/);
      expect(hit).toMatch(/position: absolute;/);
      expect(hit).toMatch(/inset: min\(0px, (calc\()?\(100% - var\(--size-min-touch-height, 2\.75rem\)\) \/ 2\)?\);/);
      expect(hit).not.toMatch(/background|border|outline/);
      const ring = rule('.lc-table-pagination__btn:focus-visible');
      expect(ring).toMatch(/outline: 2px solid var\(--color-primary-500\);/);
      expect(ring).toMatch(/outline-offset: 2px;/);
      expect(rule('.lc-table-pagination__btn:hover:not(:disabled)')).toMatch(/border-color: var\(--color-text-secondary\);/);
      expect(rule('.lc-table-pagination__btn:disabled')).toMatch(/opacity: 0\.4;/);
    });
  });
});
