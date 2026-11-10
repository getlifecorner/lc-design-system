import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent, type ListItem } from './list.component';
import { LABEL_IN_NAME, axe, computedName, installFakeCanvas, outcome } from '../../testing/axe-jsdom';

/**
 * 3.39 (request 059, finance-intelligence stammdaten-prove row 1, AC-14 to
 * AC-16, design D-6): `ListItem.ariaLabel` names the row's control — the
 * `<a>` of an `href` row, the `role="button"` row, the split row's button —
 * for jump marks such as „Zu Lücken, 3 offen“. Without it the href and
 * `role="button"` rows render as in 3.38.
 */
const JUMP: ListItem[] = [
  { id: 'gaps', label: 'Lücken', badge: '3 offen', badgeVariant: 'warning', href: '#luecken', ariaLabel: 'Zu Lücken, 3 offen' },
  { id: 'maps', label: 'Zuordnungen', badge: 'keine', href: '#zuordnungen', ariaLabel: 'Zu Zuordnungen, keine' },
];
const ROWS: ListItem[] = [
  { id: 'rules', label: 'Prüfregeln', badge: '2 offen', ariaLabel: 'Zu Prüfregeln, 2 offen' },
  { id: 'sap', label: 'SAP-Ist', metadata: 'Heute, 06:00', badge: 'Geladen', action: 'Laden', ariaLabel: 'SAP-Ist neu laden, Heute, 06:00, Geladen' },
];
/** Only the item's own attributes: no Angular `_ng*` ones. */
const attrs = (el: Element) =>
  [...el.attributes]
    .map((a) => a.name)
    .filter((n) => !n.startsWith('_ng'))
    .sort();

describe('lc-list — ListItem.ariaLabel (3.39, request 059)', () => {
  let fixture: ComponentFixture<ListComponent>;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListComponent] });
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    fixture?.destroy();
    warn.mockRestore();
  });

  const render = (items: ListItem[], inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const rows = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('[role="list"] > [role="listitem"]')];

  describe('AC-14: the name of each row kind', () => {
    it('href row: aria-label on the <a>', () => {
      const el = render(JUMP);
      const links = [...el.querySelectorAll('a.lc-list__item')];
      expect(links.map((a) => a.getAttribute('aria-label'))).toEqual(['Zu Lücken, 3 offen', 'Zu Zuordnungen, keine']);
      expect(computedName(el, links[0])).toBe('Zu Lücken, 3 offen');
    });

    it('clickable row: aria-label on the role="button" row', () => {
      const el = render(ROWS.slice(0, 1), { clickable: true });
      const row = el.querySelector('[role="button"]') as HTMLElement;
      expect(row.getAttribute('aria-label')).toBe('Zu Prüfregeln, 2 offen');
      expect(computedName(el, row)).toBe('Zu Prüfregeln, 2 offen');
    });

    it('split row: aria-label on the native button replaces the default name; the action keeps its own', () => {
      const el = render(ROWS.slice(1), { clickable: true });
      const button = el.querySelector('.lc-list__item-button') as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('SAP-Ist neu laden, Heute, 06:00, Geladen');
      expect(button.hasAttribute('aria-labelledby')).toBe(false);
      expect(computedName(el, el.querySelector('.lc-list__action-area button') as HTMLElement)).toBe('Laden');
    });

    it('is trimmed; blank writes no attribute', () => {
      const el = render([
        { id: 'a', label: 'A', href: '#a', ariaLabel: '  Zu A  ' },
        { id: 'b', label: 'B', href: '#b', ariaLabel: '   ' },
      ]);
      expect([...el.querySelectorAll('a')].map((a) => a.getAttribute('aria-label'))).toEqual(['Zu A', null]);
    });

    it('057-n5: a split row without ariaLabel reads label, subtitle, description, badge, metadata joined by ", ", not the action', () => {
      const el = render(
        [{ id: 'x', label: ' SAP-Ist ', subtitle: 'Einzelposten', description: '', badge: 'Geladen', metadata: 'Heute, 06:00', action: 'Laden' }],
        { clickable: true },
      );
      const button = el.querySelector('.lc-list__item-button') as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('SAP-Ist, Einzelposten, Geladen, Heute, 06:00');
      expect(computedName(el, button)).not.toMatch(/Laden/);
    });
  });

  describe('AC-15: without ariaLabel the href and role="button" rows are as in 3.38', () => {
    it('href row: class and href only (aria-current when selected)', () => {
      const el = render([{ id: 'a', label: 'A', href: '#a' }, { id: 'b', label: 'B', href: '#b', selected: true }]);
      const [a, b] = [...el.querySelectorAll('a.lc-list__item')];
      expect(attrs(a)).toEqual(['class', 'href']);
      expect(attrs(b)).toEqual(['aria-current', 'class', 'href']);
    });

    it('role="button" row: class, role and tabindex only', () => {
      const el = render([{ id: 'a', label: 'A' }], { clickable: true });
      expect(attrs(el.querySelector('[role="button"]') as Element)).toEqual(['class', 'role', 'tabindex']);
    });

    it('no aria-label anywhere in a list without ariaLabel or split rows', () => {
      const el = render([{ id: 'a', label: 'A', href: '#a', badge: '1' }, { id: 'b', label: 'B', subtitle: 'b' }]);
      expect(el.querySelectorAll('[aria-label]')).toHaveLength(0);
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('AC-16: rows with no control', () => {
    it('a plain row: no aria-label is rendered, and a dev warning names the row', () => {
      const el = render([{ id: 'p', label: 'Stammdaten', badge: 'vollständig', ariaLabel: 'Zu Stammdaten, vollständig' }]);
      expect(el.querySelectorAll('[aria-label]')).toHaveLength(0);
      expect(warn).toHaveBeenCalledWith('lc-list: ariaLabel names only href or clickable rows; "Stammdaten" is neither.');
    });

    it('a disabled href row (a plain row): no aria-label and no warning', () => {
      const el = render([{ id: 'd', label: 'Alt', href: '#alt', disabled: true, ariaLabel: 'Zu Alt' }]);
      expect(rows(el)[0].querySelector('a')).toBeNull();
      expect(el.querySelectorAll('[aria-label]')).toHaveLength(0);
      expect(warn).not.toHaveBeenCalled();
    });

    it('a disabled clickable row keeps its name (it is still the row control)', () => {
      const el = render([{ id: 'd', label: 'Prüfregeln', ariaLabel: 'Zu Prüfregeln', disabled: true }], { clickable: true });
      const row = el.querySelector('[role="button"]') as HTMLElement;
      expect(row.getAttribute('aria-label')).toBe('Zu Prüfregeln');
      expect(row.getAttribute('aria-disabled')).toBe('true');
    });
  });

  // axe 4.14 joins the text nodes of the control without layout (visibleVirtual),
  // so jsdom decides as Chromium does (story Jump Marks, build.md); the component
  // CSS is left out, as jsdom can't lay it out.
  describe('WCAG 2.5.3 (axe label-content-name-mismatch)', () => {
    let restoreCanvas: () => void;
    beforeAll(() => (restoreCanvas = installFakeCanvas()));
    afterAll(() => restoreCanvas());

    const run = async (el: HTMLElement) => outcome(await axe.run(el, { runOnly: [LABEL_IN_NAME] }), LABEL_IN_NAME);

    it('„Zu Lücken, 3 offen“ over a row that shows „Lücken“ and „3 offen“ passes', async () => {
      const el = render(JUMP.slice(0, 1));
      await fixture.whenStable();
      expect(await run(el)).toBe('pass');
    });

    it('negative control: the same name over a row that also shows a subtitle fails (the JSDoc rule)', async () => {
      const el = render([{ ...JUMP[0], subtitle: 'seit gestern' }]);
      await fixture.whenStable();
      expect(await run(el)).toBe('violation');
    });

    it('the clickable row „Zu Prüfregeln, 2 offen“ and a row with every part pass too', async () => {
      const el = render(
        [ROWS[0], { id: 'all', label: 'Konten', subtitle: '3 Banken', description: 'Stand heute', badge: 'aktuell', metadata: '06:00', ariaLabel: 'Zu Konten, 3 Banken, Stand heute, aktuell, 06:00' }],
        { clickable: true },
      );
      await fixture.whenStable();
      expect(await run(el)).toBe('pass');
    });

    it('negative control: without the word breaks (the design as first built) the parts run together and fail', async () => {
      const el = render(JUMP.slice(0, 1));
      await fixture.whenStable();
      const link = el.querySelector('a') as HTMLElement;
      for (const span of Array.from(link.querySelectorAll('span'))) span.textContent = (span.textContent ?? '').trim();
      expect(link.textContent).toBe('Lücken3 offen');
      expect(await run(el)).toBe('violation');
    });
  });

  describe('AC-14: word breaks in the visible text of a named row', () => {
    it('with ariaLabel each text part starts with a space; the text reads „ Lücken 3 offen“', () => {
      const el = render([{ id: 'x', label: 'Lücken', subtitle: 'seit gestern', description: 'Konten ohne Zuordnung', badge: '3 offen', metadata: '06:00', href: '#x', ariaLabel: 'Zu Lücken' }]);
      const link = el.querySelector('a') as HTMLElement;
      expect([...link.querySelectorAll('span')].map((s) => s.textContent)).toEqual([' Lücken', ' seit gestern', ' Konten ohne Zuordnung', ' 3 offen', ' 06:00']);
      expect(link.textContent).toBe(' Lücken seit gestern Konten ohne Zuordnung 3 offen 06:00');
    });

    it('without ariaLabel (or blank) the parts have no space, as in 3.38, one text node each', () => {
      const el = render([
        { id: 'a', label: 'Lücken', subtitle: 'seit gestern', badge: '3 offen', metadata: '06:00', href: '#a' },
        { id: 'b', label: 'Prüfregeln', badge: '2 offen', href: '#b', ariaLabel: ' ' },
      ]);
      const [a, b] = [...el.querySelectorAll('a')];
      expect(a.textContent).toBe('Lückenseit gestern3 offen06:00');
      expect(b.textContent).toBe('Prüfregeln2 offen');
      for (const span of Array.from(el.querySelectorAll('a span'))) expect(span.childNodes).toHaveLength(1);
    });
  });
});
