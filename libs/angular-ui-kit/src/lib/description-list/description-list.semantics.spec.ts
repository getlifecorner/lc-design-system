import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { DescriptionListComponent, DescriptionListItem, DescriptionListLayout } from './description-list.component';

/**
 * Request 039 (F-17, design D-6): a clickable row keeps `dl > div > dt + dd`
 * with no `role` or `tabindex`; the keyboard target is a native button, the
 * last child of the `dd`, named by the term and the value. It covers the row
 * and takes no pointer events, so a click lands on the row as before.
 */
@Component({
  standalone: true,
  imports: [DescriptionListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-description-list [items]="items()" [layout]="layout()" [clickable]="clickable()" (itemClick)="onItemClick($event)" />
    <lc-description-list [items]="items()" [clickable]="clickable()" />
  `,
})
class Host {
  readonly items = signal<DescriptionListItem[]>([
    { term: 'Bank', value: 'Sparkasse KölnBonn' },
    { term: 'Freigabe', value: 'Alle Erwachsenen', emphasis: 'primary' },
    { term: 'Letzter Abruf', value: 'heute 09:14', datetime: '2026-11-02T09:14:00+01:00' },
  ]);
  readonly layout = signal<DescriptionListLayout>('rows');
  readonly clickable = signal(true);
  readonly onItemClick = jest.fn<(item: DescriptionListItem) => void>();
}

describe('DescriptionListComponent clickable row semantics (F-17)', () => {
  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  const lists = () => Array.from(root.querySelectorAll('dl')) as HTMLElement[];
  const rowsOf = (dl: HTMLElement) => Array.from(dl.querySelectorAll('.lc-dl__row')) as HTMLElement[];

  it('AC-7: keeps dl > div > dt + dd with no role or tabindex on the row, dt or dd', () => {
    for (const dl of lists()) {
      for (const row of rowsOf(dl)) {
        expect(row.parentElement).toBe(dl);
        expect(row.tagName).toBe('DIV');
        for (const el of [row, row.querySelector('dt') as HTMLElement, row.querySelector('dd') as HTMLElement]) {
          expect(el.hasAttribute('role')).toBe(false);
          expect(el.hasAttribute('tabindex')).toBe(false);
        }
        expect(Array.from(row.children).map((c) => c.tagName)).toEqual(['DT', 'SPAN', 'DD']);
      }
    }
  });

  it('AC-7: puts one native button last in each dd, named by the ids of its term and value', () => {
    const seen = new Set<string>();
    for (const dl of lists()) {
      rowsOf(dl).forEach((row, i) => {
        const dt = row.querySelector('dt') as HTMLElement;
        const dd = row.querySelector('dd') as HTMLElement;
        expect(dt.id).toMatch(new RegExp(`^lc-dl-\\d+-t${i}$`));
        expect(dd.id).toBe(dt.id.replace(/-t(\d+)$/, '-v$1'));
        const button = dd.lastElementChild as HTMLButtonElement;
        expect(button.tagName).toBe('BUTTON');
        expect(button.className).toBe('lc-dl__action');
        expect(button.getAttribute('type')).toBe('button');
        expect(button.getAttribute('aria-labelledby')).toBe(`${dt.id} ${dd.id}`);
        expect(button.textContent).toBe('');
        expect(dd.querySelectorAll('button')).toHaveLength(1);
        for (const id of [dt.id, dd.id]) {
          expect(seen.has(id)).toBe(false);
          seen.add(id);
        }
      });
    }
    // Two lists on one page get their own ids.
    expect(seen.size).toBe(12);
  });

  it('AC-7: the button is the only tab stop of a row', () => {
    const [dl] = lists();
    for (const row of rowsOf(dl)) {
      const focusable = Array.from(row.querySelectorAll<HTMLElement>('a[href], button, [tabindex]'));
      expect(focusable.map((el) => el.className)).toEqual(['lc-dl__action']);
      expect(focusable[0].tabIndex).toBe(0);
    }
  });

  it('AC-7, AC-8: a click on the button (native Enter / Space activation) emits itemClick once', () => {
    const [dl] = lists();
    const button = rowsOf(dl)[1].querySelector('.lc-dl__action') as HTMLButtonElement;
    button.click();
    expect(fixture.componentInstance.onItemClick).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onItemClick).toHaveBeenCalledWith(expect.objectContaining({ term: 'Freigabe' }));

    // The key itself is the button's: the row's keydown path ignores it, so
    // the native click that follows it is the only emission.
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      button.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(fixture.componentInstance.onItemClick).toHaveBeenCalledTimes(1);
  });

  it('AC-8: a click on the term or the value still emits through the row', () => {
    const [dl] = lists();
    const row = rowsOf(dl)[0];
    (row.querySelector('dt') as HTMLElement).click();
    (row.querySelector('dd') as HTMLElement).click();
    expect(fixture.componentInstance.onItemClick).toHaveBeenCalledTimes(2);
  });

  it('AC-7: the stacked layout gets the same button', () => {
    fixture.componentInstance.layout.set('stacked');
    fixture.detectChanges();
    const [dl] = lists();
    expect(dl.className).toContain('lc-dl--stacked');
    expect(rowsOf(dl).map((row) => row.querySelector('dd > .lc-dl__action')?.tagName)).toEqual(['BUTTON', 'BUTTON', 'BUTTON']);
  });

  it('renders no ids and no button without clickable (the default markup)', () => {
    fixture.componentInstance.clickable.set(false);
    fixture.detectChanges();
    for (const dl of lists()) {
      expect(dl.querySelectorAll('[id], button, [aria-labelledby]')).toHaveLength(0);
      for (const row of rowsOf(dl)) expect(row.className).toBe('lc-dl__row');
    }
  });

  it('pins the default rendering: the 3.24.1 markup apart from one more @if anchor comment per dd', () => {
    // Measured once against the 3.24.1 template over 24 layout × size ×
    // leaders × separator cases (build.md): equal once comments are dropped.
    fixture.componentInstance.clickable.set(false);
    fixture.componentInstance.items.set([
      { term: 'Repository', value: 'example/project', href: '#', emphasis: 'primary', id: 'repo' },
      { term: 'Access', value: 'Token stored · read only', valueSuffix: 'x' },
      { term: 'Beigetreten', value: 'heute 18:05', datetime: '2026-10-12T18:05:00+02:00', emphasis: 'mono' },
    ]);
    fixture.detectChanges();
    const html = lists()[1].outerHTML.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');
    expect(html).toBe(
      '<dl class="lc-dl lc-dl--md lc-dl--rows lc-dl--sep-line">' +
        '<div class="lc-dl__row"><dt class="lc-dl__term">Repository</dt><span aria-hidden="true" class="lc-dl__leader"></span>' +
        '<dd class="lc-dl__value lc-dl__value--primary"><a class="lc-dl__link" href="#">example/project</a></dd></div>' +
        '<div class="lc-dl__row"><dt class="lc-dl__term">Access</dt><span aria-hidden="true" class="lc-dl__leader"></span>' +
        '<dd class="lc-dl__value lc-dl__value--default"> Token stored · read only <span class="lc-dl__value-suffix">x</span></dd></div>' +
        '<div class="lc-dl__row"><dt class="lc-dl__term">Beigetreten</dt><span aria-hidden="true" class="lc-dl__leader"></span>' +
        '<dd class="lc-dl__value lc-dl__value--mono"><time datetime="2026-10-12T18:05:00+02:00">heute 18:05</time></dd></div>' +
        '</dl>',
    );
  });

  it('keeps the value text: the empty button adds nothing to the dd', () => {
    const [dl] = lists();
    const values = rowsOf(dl).map((row) => (row.querySelector('dd') as HTMLElement).textContent?.replace(/\s+/g, ' ').trim());
    expect(values).toEqual(['Sparkasse KölnBonn', 'Alle Erwachsenen', 'heute 09:14']);
  });

  describe('styles', () => {
    const css = compile(join(__dirname, 'description-list.component.scss')).css;
    const rule = (selector: string) => {
      const found = [...css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
        (m) => m[1].trim() === selector,
      );
      expect(found).toHaveLength(1);
      return found[0][2];
    };

    it('stretches the button over the row and lets the pointer through (D-6)', () => {
      expect(rule('.lc-dl__row--clickable')).toMatch(/position: relative;/);
      const action = rule('.lc-dl__action');
      for (const decl of ['position: absolute;', 'inset: 0;', 'margin: 0;', 'padding: 0;', 'border: 0;', 'background: none;', 'border-radius: var(--border-radius-sm);', 'pointer-events: none;']) {
        expect(action).toContain(decl);
      }
    });

    it('has no focus rule on the row any more (it cannot take focus)', () => {
      expect(css).not.toMatch(/\.lc-dl__row--clickable:focus/);
      expect(css).not.toMatch(/transition/);
    });
  });
});
