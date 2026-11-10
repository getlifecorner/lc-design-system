import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join, resolve } from 'path';
import { DescriptionListComponent, type DescriptionListItem } from './description-list.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.36 (request 056): an item's value as a badge (quellen row 2, AC-7, D-2)
 * and the sum item with ledger rules (app-shell row 2, AC-11, AC-12).
 */
describe('DescriptionListComponent — badge and total (3.36, request 056)', () => {
  let fixture: ComponentFixture<DescriptionListComponent>;
  let root: HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({ imports: [DescriptionListComponent] }));
  afterEach(() => fixture?.destroy());

  const render = (items: DescriptionListItem[], inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(DescriptionListComponent);
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    return root;
  };
  const rows = () => Array.from(root.querySelectorAll<HTMLElement>('.lc-dl__row'));
  const strip = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s_ngcontent-[\w-]+=""/g, '');

  describe('defaults (unchanged)', () => {
    it('items without badge or total render the 3.35 rows', () => {
      render([
        { term: 'Quelle', value: 'SAP-Ist', href: '#sap' },
        { term: 'Stand', value: 'heute 06:00', datetime: '2026-11-07T06:00:00+01:00' },
        { term: 'Zeilen', value: '12.408', emphasis: 'strong' },
      ]);
      // 3.37 (request 057, D-4): one space between dt, leader and dd and after
      // each row (word breaks in the text); they render nothing. Otherwise the 3.35 rows.
      // 3.39 (request 059, AC-17, D-7): one space per break: none between the
      // leader and the dd, none at the dd's edges.
      expect(strip(root.innerHTML)).toBe(
        '<dl class="lc-dl lc-dl--md lc-dl--rows lc-dl--sep-line">' +
          '<div class="lc-dl__row"><dt class="lc-dl__term">Quelle</dt> <span aria-hidden="true" class="lc-dl__leader"></span>' +
          '<dd class="lc-dl__value lc-dl__value--default"><a class="lc-dl__link" href="#sap">SAP-Ist</a></dd></div> ' +
          '<div class="lc-dl__row"><dt class="lc-dl__term">Stand</dt> <span aria-hidden="true" class="lc-dl__leader"></span>' +
          '<dd class="lc-dl__value lc-dl__value--default"><time datetime="2026-11-07T06:00:00+01:00">heute 06:00</time></dd></div> ' +
          '<div class="lc-dl__row"><dt class="lc-dl__term">Zeilen</dt> <span aria-hidden="true" class="lc-dl__leader"></span>' +
          '<dd class="lc-dl__value lc-dl__value--strong">12.408</dd></div> </dl>',
      );
      expect(fixture.componentInstance.totalAriaLabel()).toBe('');
    });
  });

  describe('badge (AC-7, D-2)', () => {
    it('the value is an lc-badge (sm, rounded, variant) inside the dd; term and value stay one dt/dd pair', () => {
      render([{ term: 'Zustand', value: 'Freigegeben', badge: 'Freigegeben', badgeVariant: 'success' }]);
      const [row] = rows();
      expect([...row.children].map((c) => c.tagName)).toEqual(['DT', 'SPAN', 'DD']);
      const dd = row.querySelector('dd') as HTMLElement;
      const badge = dd.querySelector('lc-badge') as HTMLElement;
      expect(badge.classList).toContain('lc-dl__badge');
      expect(badge.classList).not.toContain('lc-dl__badge--after-value');
      expect((badge.querySelector('span') as HTMLElement).className.split(' ').sort()).toEqual(
        ['lc-badge', 'lc-badge--rounded', 'lc-badge--sm', 'lc-badge--success'].sort(),
      );
      // The same word is not shown twice.
      expect(dd.textContent?.trim()).toBe('Freigegeben');
    });

    it('an empty value or the same word (any case) is dropped; another value stays as text before the badge', () => {
      render([
        { term: 'A', value: '', badge: 'Entwurf' },
        { term: 'B', value: ' freigegeben ', badge: 'Freigegeben' },
        { term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success' },
      ]);
      const dds = rows().map((r) => r.querySelector('dd') as HTMLElement);
      // 3.37 (request 057, D-4): the badge's text starts with a space (it renders
      // nothing at the start of the badge's flex box), so „1 Freigegeben“, not „1Freigegeben“.
      expect(dds.map((dd) => dd.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Entwurf', 'Freigegeben', '1 Freigegeben']);
      expect(dds[2].querySelector('.lc-dl__badge-value')?.textContent).toBe('1');
      expect(dds[2].querySelector('lc-badge')?.classList).toContain('lc-dl__badge--after-value');
      // No text node between value and badge (only comment anchors): the 6 px margin is the gap.
      expect([...dds[2].childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)).toHaveLength(0);
      expect(dds[2].querySelector('.lc-dl__badge-value')?.compareDocumentPosition(dds[2].querySelector('lc-badge') as Node)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      // Default variant without badgeVariant.
      expect(dds[0].querySelector('lc-badge span')?.classList).toContain('lc-badge--default');
    });

    it('href and datetime wrap the value text only', () => {
      render([
        { term: 'Lauf', value: '#4711', href: '#lauf', badge: 'Fehlgeschlagen', badgeVariant: 'error' },
        { term: 'Stand', value: 'heute', datetime: '2026-11-07', badge: 'Aktuell' },
      ]);
      const [run, at] = rows().map((r) => r.querySelector('dd') as HTMLElement);
      expect(run.querySelector('a.lc-dl__link')?.textContent).toBe('#4711');
      expect(run.querySelector('a lc-badge')).toBeNull();
      expect(at.querySelector('time')?.textContent).toBe('heute');
      expect(at.querySelector('time lc-badge')).toBeNull();
    });

    it('sm lists use the xs badge', () => {
      render([{ term: 'Zustand', value: 'Geladen', badge: 'Geladen' }], { size: 'sm' });
      expect(root.querySelector('lc-badge span')?.classList).toContain('lc-badge--xs');
    });

    it.each(['rows', 'stacked'] as const)('%s: a clickable row is named „term value“ with the badge text', (layout) => {
      render([{ term: 'Zustand', value: 'Freigegeben', badge: 'Freigegeben', badgeVariant: 'success' }], { layout, clickable: true });
      const button = root.querySelector('.lc-dl__action') as HTMLButtonElement;
      expect(computedName(root, button)).toBe('Zustand Freigegeben');
    });
  });

  describe('total (AC-11, AC-12)', () => {
    const ITEMS: DescriptionListItem[] = [
      { term: 'Personalkosten', value: '412.300,00 €' },
      { term: 'Sachkosten', value: '110.230,00 €' },
      { term: 'Gesamtkosten Ist', value: '522.530,00 €', total: true, emphasis: 'mono' },
    ];

    it('marks the row, makes the value strong (emphasis ignored) and keeps the dt/dd pair', () => {
      render(ITEMS);
      const total = rows()[2];
      expect(total.classList).toContain('lc-dl__row--total');
      expect(rows()[0].classList).not.toContain('lc-dl__row--total');
      expect(total.querySelector('dd')?.className).toBe('lc-dl__value lc-dl__value--strong');
      expect([...total.children].map((c) => c.tagName)).toEqual(['DT', 'SPAN', 'DD']);
      // Without totalAriaLabel nothing is added to the term.
      expect(total.querySelector('dt')?.innerHTML.replace(/<!--[\s\S]*?-->/g, '')).toBe('Gesamtkosten Ist');
    });

    it('totalAriaLabel is read before the term: „Summe, Gesamtkosten Ist“, visually hidden', () => {
      render(ITEMS, { totalAriaLabel: 'Summe', clickable: true });
      const dt = rows()[2].querySelector('dt') as HTMLElement;
      const hidden = dt.querySelector('.lc-dl__sr-only') as HTMLElement;
      // 3.39 (request 059, AC-17): the prefix ends at its comma; the space
      // after it (3.37, D-4, it collapses at the line start) is the only one.
      expect(hidden.textContent).toBe('Summe,');
      expect(dt.textContent).toBe('Summe, Gesamtkosten Ist');
      const button = rows()[2].querySelector('.lc-dl__action') as HTMLButtonElement;
      expect(computedName(root, button)).toBe('Summe, Gesamtkosten Ist 522.530,00 €');
      // Only the total gets it.
      expect(root.querySelectorAll('.lc-dl__sr-only')).toHaveLength(1);
    });

    it('stacked layout and sm size keep it', () => {
      render(ITEMS, { layout: 'stacked', size: 'sm', totalAriaLabel: 'Summe' });
      expect(rows()[2].classList).toContain('lc-dl__row--total');
      // 3.39 (request 059, AC-17): no trailing space in the prefix.
      expect(rows()[2].querySelector('.lc-dl__sr-only')?.textContent).toBe('Summe,');
    });

    it('styles: field-border rules (1 px solid above, 3 px double below), on the separator line, semibold term', () => {
      const css = compile(join(__dirname, 'description-list.component.scss')).css;
      expect(css).toMatch(/\n\.lc-dl \.lc-dl__row--total \{\s*border-top: 1px solid var\(--color-field-border\);\s*border-bottom: 3px double var\(--color-field-border\);\s*\}/);
      expect(css).toMatch(
        /\n\.lc-dl--rows\.lc-dl--sep-line \.lc-dl__row\.lc-dl__row--total,\s*\.lc-dl--rows\.lc-dl--sep-divider \.lc-dl__row\.lc-dl__row--total \{\s*margin-top: -1px;\s*border-bottom: 3px double var\(--color-field-border\);\s*\}/,
      );
      // After the last-child reset of equal weight (0,4,0), so a last total keeps its double rule.
      expect(css.indexOf('.lc-dl__row.lc-dl__row--total {')).toBeGreaterThan(css.indexOf('.lc-dl--sep-line .lc-dl__row:last-child'));
      expect(css).toMatch(/\n\.lc-dl__row--total \.lc-dl__term \{\s*position: relative;\s*color: var\(--color-text-primary\);\s*font-weight: var\(--font-weight-semibold\);\s*\}/);
      expect(css).toMatch(/\n\.lc-dl__sr-only \{[^}]*clip-path: inset\(50%\);/);
      expect(css).toMatch(/\nlc-badge\.lc-dl__badge \{\s*display: inline-flex;\s*margin-block: calc\(\(1lh - 1\.5rem\) \/ 2\);\s*\}/);
      expect(css).toMatch(/\n\.lc-dl--sm lc-badge\.lc-dl__badge \{\s*margin-block: calc\(\(1lh - 1\.25rem\) \/ 2\);\s*\}/);
    });

    it('AC-12: the rule colour meets 3:1 on every surface in both themes (4.39 light, 5.56 dark)', () => {
      type Rgb = [number, number, number];
      const theme = (file: string) => compile(resolve(__dirname, '../../styles', file)).css;
      const token = (css: string, name: string) => css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1] ?? '';
      const hex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
      const lum = (c: Rgb) =>
        c
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a: Rgb, b: Rgb) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };
      const worst = (file: string) => {
        const css = theme(file);
        const rule = hex(token(css, '--color-field-border'));
        const grounds = ['--color-background', '--color-surface', '--color-surface-2']
          .map((n) => token(css, n))
          .filter(Boolean)
          .map(hex);
        expect(grounds.length).toBeGreaterThanOrEqual(2);
        return Math.min(...grounds.map((g) => ratio(rule, g)));
      };
      expect(worst('_theme-light.scss')).toBeGreaterThanOrEqual(3);
      expect(worst('_theme-dark.scss')).toBeGreaterThanOrEqual(3);
    });
  });
});
