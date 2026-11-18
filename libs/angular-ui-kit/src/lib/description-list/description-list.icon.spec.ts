import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { compile } from 'sass';
import { join } from 'path';
import { readFileSync } from 'fs';
import { DescriptionListComponent, type DescriptionListItem } from './description-list.component';
import { IconComponent } from '../icon/icon.component';
import { audit, computedName, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.46 (request 066, finance-intelligence kosten row 3): `DescriptionListItem.icon`
 * draws a decorative kit icon before the value, in one inline-flex row with it
 * (design D-1), in the value's ink at 1em. Without `icon` the DOM is the 3.45
 * one, comment anchors included (D-2).
 */
describe('DescriptionListComponent — item icon (3.46, request 066)', () => {
  let fixture: ComponentFixture<DescriptionListComponent>;
  let root: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [DescriptionListComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }),
  );
  afterEach(() => fixture?.destroy());

  const render = (items: DescriptionListItem[], inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(DescriptionListComponent);
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    return root;
  };
  const dds = () => Array.from(root.querySelectorAll<HTMLElement>('dd'));
  /** A dd's markup without the emulation attributes; comment anchors kept unless asked. */
  const ddHtml = (dd: HTMLElement, comments = true) => {
    const html = dd.outerHTML.replace(/\s_ng(?:content|host)-[\w-]+=""/g, '');
    return comments ? html : html.replace(/<!--[\s\S]*?-->/g, '');
  };
  const css = compile(join(__dirname, 'description-list.component.scss')).css;
  const ruleBody = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect(start).toBeGreaterThan(-1);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  describe('AC-1: without icon, the 3.45 DOM', () => {
    const anchors = (n: number) => '<!--container-->'.repeat(n);
    // Captured from the 3.45 template (main d6cdc79) with the same items.
    it.each([
      ['plain', { term: 'Plain', value: 'Wert' }, `<dd class="lc-dl__value lc-dl__value--default">${anchors(3)}Wert${anchors(3)}</dd>`],
      ['href', { term: 'Link', value: 'SAP-Ist', href: '#sap' }, `<dd class="lc-dl__value lc-dl__value--default">${anchors(1)}<a class="lc-dl__link" href="#sap">SAP-Ist</a>${anchors(5)}</dd>`],
      [
        'datetime',
        { term: 'Time', value: 'heute 06:00', datetime: '2026-11-07T06:00:00+01:00' },
        `<dd class="lc-dl__value lc-dl__value--default">${anchors(2)}<time datetime="2026-11-07T06:00:00+01:00">heute 06:00</time>${anchors(4)}</dd>`,
      ],
      [
        'suffix',
        { term: 'Suffix', value: 'B', valueSuffix: 'Note' },
        `<dd class="lc-dl__value lc-dl__value--default">${anchors(3)}B ${anchors(2)}<span class="lc-dl__value-suffix">Note</span>${anchors(2)}</dd>`,
      ],
      [
        'datetime + suffix',
        { term: 'Time suffix', value: 'heute', datetime: '2026-11-07', valueSuffix: 'automatisch' },
        `<dd class="lc-dl__value lc-dl__value--default">${anchors(2)}<time datetime="2026-11-07">heute</time>${anchors(2)}<span class="lc-dl__sep"> </span>${anchors(1)}<span class="lc-dl__value-suffix">automatisch</span>${anchors(2)}</dd>`,
      ],
    ] as const)('%s: the dd is the 3.45 one, comment anchors included', (_, item, expected) => {
      render([item]);
      expect(ddHtml(dds()[0])).toBe(expected);
      expect(root.querySelector('lc-icon')).toBeNull();
    });

    it('a badge item: the 3.45 dd apart from comment anchors', () => {
      render([{ term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success' }]);
      expect(ddHtml(dds()[0], false)).toBe(
        '<dd class="lc-dl__value lc-dl__value--default"><span class="lc-dl__badge-value">1</span><lc-badge class="lc-dl__badge lc-dl__badge--after-value"><span class="lc-badge lc-badge--rounded lc-badge--sm lc-badge--success"> Freigegeben</span></lc-badge></dd>',
      );
    });

    it('the item field is documented with @default undefined', () => {
      const source = readFileSync(join(__dirname, 'description-list.component.ts'), 'utf8');
      const jsdoc = /\/\*\*((?:(?!\*\/)[^])*)\*\/\s*icon\?: string;/.exec(source)?.[1] ?? '';
      expect(jsdoc).toContain('Kit icon name');
      expect(jsdoc).toMatch(/@default undefined\s*$/);
    });
  });

  describe('AC-2: before the value, in one row with it', () => {
    it.each([
      ['rows', 'md'],
      ['rows', 'sm'],
      ['stacked', 'md'],
      ['stacked', 'sm'],
    ] as const)('%s · %s: dd > icon row > icon, then the value text, no text at the dd edges', (layout, size) => {
      render([{ term: 'Abweichung zum Budget', value: '6,7 % über Budget', icon: 'arrow-up', emphasis: 'strong' }], { layout, size });
      const dd = dds()[0];
      const row = dd.firstElementChild as HTMLElement;
      expect(row.className).toBe('lc-dl__icon-row');
      expect([...dd.childNodes].filter((n) => n.nodeType !== Node.COMMENT_NODE)).toEqual([row]);
      const [icon, text] = [...row.children] as HTMLElement[];
      expect(icon.tagName).toBe('LC-ICON');
      expect(icon.classList).toContain('lc-dl__icon');
      expect(text.className).toBe('lc-dl__icon-text');
      expect(text.textContent).toBe('6,7 % über Budget');
      expect(row.childNodes.length).toBe(2);
      // The value's colour: the icon sits inside the dd that carries the emphasis.
      // r1 (D-7): an icon item's dd also carries `lc-dl__value--icon` (its `rows` basis);
      // jsdom lists a `[class]` binding's classes sorted.
      expect(dd.className).toBe('lc-dl__value lc-dl__value--icon lc-dl__value--strong');
      const instance = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect([instance.name(), instance.size(), instance.decorative(), instance.color()]).toEqual(['arrow-up', 'xs', true, 'currentColor']);
    });

    it('rules: an inline-flex baseline row with a 4 px gap; a 1em icon on the first line box; a shrinking text', () => {
      expect(ruleBody('.lc-dl__icon-row')).toBe('display: inline-flex; align-items: baseline; gap: var(--spacing-1); max-width: 100%; vertical-align: top;');
      expect(ruleBody('lc-icon.lc-dl__icon')).toBe('--lc-icon-size: 1em; align-self: flex-start; height: 1lh; flex-shrink: 0;');
      expect(ruleBody('.lc-dl__icon-text')).toBe('min-width: 0;');
      // Between the 3.36 rules and the 3.37 separator (which stays right before the narrow rows).
      expect(css.indexOf('\n.lc-dl__icon-row {')).toBeGreaterThan(css.indexOf('\n.lc-dl__sr-only {'));
      expect(css.indexOf('\n.lc-dl__icon-text {')).toBeLessThan(css.indexOf('\n.lc-dl__sep {'));
      // No colour of its own: the svg takes the dd's ink (currentColor), also in forced colours.
      expect(css.slice(css.indexOf('\n.lc-dl__icon-row {'), css.indexOf('\n.lc-dl__sep {'))).not.toMatch(/color|forced/);
    });

    it('r1, D-6: in rows an inline nowrap row glues the icon 4 px before line 1; the text wraps as before', () => {
      expect(ruleBody('.lc-dl--rows .lc-dl__icon-row')).toBe('display: inline; white-space: nowrap; vertical-align: baseline;');
      expect(ruleBody('.lc-dl--rows .lc-dl__icon-text')).toBe('white-space: normal;');
      expect(ruleBody('.lc-dl--rows lc-icon.lc-dl__icon')).toBe('vertical-align: top; margin-inline-end: var(--spacing-1);');
      // After the base rules they override (higher weight anyway), before the 3.37 separator.
      expect(css.indexOf('\n.lc-dl--rows .lc-dl__icon-row {')).toBeGreaterThan(css.indexOf('\n.lc-dl__icon-text {'));
      expect(css.indexOf('\n.lc-dl--rows lc-icon.lc-dl__icon {')).toBeLessThan(css.indexOf('\n.lc-dl__sep {'));
    });

    it('r1, D-7: in rows an icon value keeps 6em of text: basis min(100%, 7em + 4 px) at (0,4,0), before the 3.39 basis', () => {
      const d7 = '.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--icon';
      // Sass drops the inner calc() inside min().
      expect(ruleBody(d7)).toBe('flex-basis: min(100%, 7em + var(--spacing-1));');
      expect(css.indexOf(`\n${d7} {`)).toBeLessThan(css.indexOf('\n.lc-dl__sep {'));
      // The 3.39 basis it beats by weight, not by order: (0,3,0), unchanged.
      expect(css).toMatch(/\n\.lc-dl--rows > \.lc-dl__row > \.lc-dl__term,\s*\.lc-dl--rows > \.lc-dl__row > \.lc-dl__value \{\s*flex-basis: min\(100%, 6em\);\s*\}/);
      expect(css.indexOf(`\n${d7} {`)).toBeLessThan(css.indexOf('\n.lc-dl--rows > .lc-dl__row > .lc-dl__term,'));
    });

    it('r1: the rows rules reach rows icon items only; the class is only on icon items', () => {
      const items: DescriptionListItem[] = [
        { term: 'Abweichung zum Budget', value: '6,7 % über Budget', icon: 'arrow-up', emphasis: 'strong' },
        { term: 'Plan', value: '120.000,00 €', emphasis: 'strong' },
      ];
      const d6 = '.lc-dl--rows .lc-dl__icon-row';
      const d7 = '.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--icon';
      render(items, { layout: 'rows' });
      expect(dds().map((dd) => dd.className)).toEqual(['lc-dl__value lc-dl__value--icon lc-dl__value--strong', 'lc-dl__value lc-dl__value--strong']);
      expect((root.querySelector('.lc-dl__icon-row') as HTMLElement).matches(d6)).toBe(true);
      expect(dds().map((dd) => dd.matches(d7))).toEqual([true, false]);
      fixture.destroy();
      render(items, { layout: 'stacked' });
      expect((root.querySelector('.lc-dl__icon-row') as HTMLElement).matches(d6)).toBe(false);
      expect(dds().map((dd) => dd.matches(d7))).toEqual([false, false]);
    });
  });

  describe('AC-3: decorative, adds no text', () => {
    const shapes: DescriptionListItem[] = [
      { term: 'Abweichung', value: '6,7 % über Budget' },
      { term: 'Beleg', value: 'FC-2026-0412', href: '#fc' },
      { term: 'Abgleich', value: 'heute 06:00', datetime: '2026-11-18T06:00:00+01:00', valueSuffix: 'automatisch' },
      { term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success' },
      { term: 'Überschreitung gesamt', value: '+12.400,00 €', total: true, valueSuffix: 'brutto' },
    ];

    it('the icon host is aria-hidden and decorative, the inline glyph too', async () => {
      render([{ term: 'Prognose', value: '2,1 % unter Plan', icon: 'arrow-down' }]);
      await fixture.whenStable();
      fixture.detectChanges();
      const icon = root.querySelector('lc-icon') as HTMLElement;
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      const svg = icon.querySelector('svg') as SVGElement;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });

    it.each(shapes.map((item) => ({ item })))('$item.term: the same dd text, no new tab stop or button', ({ item }) => {
      render([item], { clickable: true });
      const text = dds()[0].textContent;
      const stops = root.querySelectorAll('[tabindex], button, a').length;
      fixture.destroy();
      render([{ ...item, icon: 'arrow-up' }], { clickable: true });
      expect(dds()[0].textContent).toBe(text);
      expect(root.querySelectorAll('[tabindex], button, a').length).toBe(stops);
      expect(root.querySelector('lc-icon')?.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('AC-4: next to a badge, a link, a time, in a total and a clickable row', () => {
    it('badge: icon, value, badge in that order, all in the icon row', () => {
      render([{ term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success', icon: 'check' }]);
      const text = root.querySelector('.lc-dl__icon-text') as HTMLElement;
      expect([...text.children].map((c) => c.className.split(' ')[0])).toEqual(['lc-dl__badge-value', 'lc-dl__badge']);
      expect(dds()[0].textContent).toBe('1 Freigegeben');
    });

    it('href: the icon is not part of the link', () => {
      render([{ term: 'Beleg', value: 'FC-2026-0412', href: '#fc', emphasis: 'primary', icon: 'file-text' }]);
      const link = root.querySelector('a.lc-dl__link') as HTMLAnchorElement;
      expect(root.querySelector('lc-icon')?.closest('a')).toBeNull();
      expect(link.parentElement?.className).toBe('lc-dl__icon-text');
      expect(link.textContent).toBe('FC-2026-0412');
    });

    it('datetime + suffix: the time and the suffix follow the icon, the 0 px space between them stays', () => {
      render([{ term: 'Letzter Abgleich', value: 'heute 06:00', datetime: '2026-11-18T06:00:00+01:00', valueSuffix: 'automatisch', emphasis: 'muted', icon: 'clock' }]);
      const text = root.querySelector('.lc-dl__icon-text') as HTMLElement;
      expect([...text.children].map((c) => c.tagName.toLowerCase() + (c.className ? `.${c.className}` : ''))).toEqual([
        'time',
        'span.lc-dl__sep',
        'span.lc-dl__value-suffix',
      ]);
      expect(dds()[0].querySelectorAll('.lc-dl__value-suffix')).toHaveLength(1);
      expect(dds()[0].textContent).toBe('heute 06:00 automatisch');
    });

    it('total: the icon in the strong total value, the hidden prefix unchanged', () => {
      render([{ term: 'Überschreitung gesamt', value: '+12.400,00 €', total: true, icon: 'arrow-up' }], { totalAriaLabel: 'Summe' });
      const row = root.querySelector('.lc-dl__row') as HTMLElement;
      expect(row.classList).toContain('lc-dl__row--total');
      expect(dds()[0].className).toBe('lc-dl__value lc-dl__value--icon lc-dl__value--strong');
      expect(dds()[0].querySelector('lc-icon.lc-dl__icon')).not.toBeNull();
      expect(row.querySelector('dt')?.textContent).toBe('Summe, Überschreitung gesamt');
    });

    it('clickable: the button keeps its labelled-by ids and its name', () => {
      const items: DescriptionListItem[] = [
        { term: 'Abweichung zum Budget', value: '6,7 % über Budget', emphasis: 'strong' },
        { term: 'Prognose', value: '2,1 % unter Plan' },
      ];
      render(items, { clickable: true });
      const before = [...root.querySelectorAll('.lc-dl__action')].map((b) => [b.getAttribute('aria-labelledby')?.replace(/lc-dl-\d+/g, 'lc-dl-N'), computedName(root, b)]);
      fixture.destroy();
      render(items.map((item, i) => ({ ...item, icon: i ? 'arrow-down' : 'arrow-up' })), { clickable: true });
      const after = [...root.querySelectorAll('.lc-dl__action')].map((b) => [b.getAttribute('aria-labelledby')?.replace(/lc-dl-\d+/g, 'lc-dl-N'), computedName(root, b)]);
      expect(after).toEqual(before);
      expect(after.map(([, name]) => name)).toEqual(['Abweichung zum Budget 6,7 % über Budget', 'Prognose 2,1 % unter Plan']);
      // The button stays the dd's last element, after the icon row.
      expect(dds()[0].lastElementChild?.className).toBe('lc-dl__action');
    });
  });

  describe('AC-6: unknown names and axe', () => {
    let restoreCanvas: () => void;
    beforeAll(() => {
      restoreCanvas = installFakeCanvas();
    });
    afterAll(() => restoreCanvas());

    it('an unknown name renders lc-icon with it, without throwing', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      expect(() => render([{ term: 'Status', value: 'offen', icon: 'kein-solches-icon' }])).not.toThrow();
      const instance = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(instance.name()).toBe('kein-solches-icon');
      expect(root.querySelector('.lc-dl__icon-text')?.textContent).toBe('offen');
      warn.mockRestore();
    });

    it.each([
      ['rows', false],
      ['stacked', false],
      ['rows', true],
    ] as const)('%s, clickable %s: icon items have no violations', async (layout, clickable) => {
      render(
        [
          { term: 'Abweichung zum Budget', value: '6,7 % über Budget', icon: 'arrow-up', emphasis: 'strong' },
          { term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success', icon: 'check' },
          { term: 'Letzter Abgleich', value: 'heute 06:00', datetime: '2026-11-18T06:00:00+01:00', valueSuffix: 'automatisch', icon: 'clock' },
          { term: 'Überschreitung gesamt', value: '+12.400,00 €', total: true, icon: 'arrow-up' },
        ],
        { layout, clickable, totalAriaLabel: 'Summe' },
      );
      await fixture.whenStable();
      const wrapper = document.createElement('div');
      wrapper.lang = 'de';
      root.parentElement?.appendChild(wrapper);
      wrapper.appendChild(root);
      expect(violations(await audit(wrapper))).toEqual([]);
    });
  });
});
