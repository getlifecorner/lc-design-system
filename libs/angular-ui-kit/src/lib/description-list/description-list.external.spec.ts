import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { compile } from 'sass';
import { join } from 'path';
import { readFileSync } from 'fs';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { DescriptionListComponent, type DescriptionListItem, type DescriptionListLayout } from './description-list.component';
import { IconComponent } from '../icon/icon.component';
import { audit, computedName, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.49 (request 069, finance-intelligence vertraege row 1, design D-1…D-4):
 * `DescriptionListItem.external` opens `href` in a new tab with a decorative
 * icon and the hidden `externalLinkHint`, in all 4 links of the template;
 * without it the link is 3.48's. AC-5 (backlog 068-n2): the separator of a
 * clickable non-total row is a straight pseudo-element border.
 */
describe('DescriptionListComponent — external links (3.49, request 069)', () => {
  let fixture: ComponentFixture<DescriptionListComponent>;
  let root: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [DescriptionListComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons([], { unregistered: 'placeholder' })],
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
  const links = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('a.lc-dl__link'));
  const css = compile(join(__dirname, 'description-list.component.scss')).css;
  const ruleBody = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  const href = 'https://dms.example.de/vertraege/2026-0412';
  /** One item per link place of the template: plain, badge, icon, icon + badge; total and clickable below. */
  const shapes: [string, DescriptionListItem][] = [
    ['plain', { term: 'Vertragsdokument', value: 'Rahmenvertrag 2026', href, external: true }],
    ['badge', { term: 'Fassung', value: '3', badge: 'Unterschrieben', badgeVariant: 'success', href, external: true }],
    ['icon', { term: 'Rechnung', value: 'RE-2026-0412', icon: 'file-text', href, external: true }],
    ['icon + badge', { term: 'Anlage', value: '2', badge: 'Geprüft', icon: 'check', href, external: true }],
    ['total', { term: 'Gesamtwert', value: '214.300,00 €', total: true, href, external: true }],
  ];

  describe('AC-1: target and rel in every link place', () => {
    it.each(
      (['rows', 'stacked'] as DescriptionListLayout[]).flatMap((layout) => shapes.map(([name, item]) => ({ layout, name, item }))),
    )('$layout · $name: target="_blank", rel="noopener noreferrer"', ({ layout, item }) => {
      render([item], { layout, totalAriaLabel: 'Summe' });
      const [link] = links();
      expect(links()).toHaveLength(1);
      expect([link.getAttribute('target'), link.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer']);
      expect(link.getAttribute('href')).toBe(href);
    });

    it('clickable rows: the link keeps target and rel', () => {
      render([shapes[0][1], { term: 'Status', value: 'aktiv' }], { clickable: true });
      expect([links()[0].getAttribute('target'), links()[0].getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer']);
    });

    it('the field and the input are documented with @default', () => {
      const source = readFileSync(join(__dirname, 'description-list.component.ts'), 'utf8');
      expect(/\/\*\*((?:(?!\*\/)[^])*)\*\/\s*external\?: boolean;/.exec(source)?.[1]).toMatch(/Ignored without `href`[^]*@default false\s*$/);
      expect(/\/\*\*((?:(?!\*\/)[^])*)\*\/\s*readonly externalLinkHint = input<string>\('\(opens in a new tab\)'\);/.exec(source)?.[1]).toMatch(
        /@default '\(opens in a new tab\)'\s*$/,
      );
    });
  });

  describe('AC-2: a decorative external-link icon after the value, glued to its last word', () => {
    it.each(shapes.map(([name, item]) => ({ name, item })))('$name: link > text, then glue > 0 px space, hint, icon', ({ item }) => {
      render([item], { totalAriaLabel: 'Summe' });
      const [link] = links();
      const [text, glue] = Array.from(link.childNodes).filter((n) => n.nodeType !== Node.COMMENT_NODE);
      // No space or break opportunity between the value and the glue.
      expect(text.textContent).toBe(item.value);
      expect((glue as HTMLElement).className).toBe('lc-dl__external');
      const parts = Array.from((glue as HTMLElement).children);
      expect(parts.map((p) => `${p.tagName.toLowerCase()}.${p.className}`)).toEqual([
        'span.lc-dl__sep',
        'span.lc-dl__sr-only',
        'lc-icon.lc-dl__external-icon',
      ]);
      expect(parts[0].textContent).toBe(' ');
      const icon = parts[2] as HTMLElement;
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      const instance = fixture.debugElement.query(By.css('lc-icon.lc-dl__external-icon')).componentInstance as IconComponent;
      expect([instance.name(), instance.decorative(), instance.color()]).toEqual(['external-link', true, 'currentColor']);
    });

    it('the kit registers the glyph: it renders, no placeholder, with an app that registers nothing', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      render([shapes[0][1]]);
      const svg = root.querySelector('lc-icon.lc-dl__external-icon .icon-container > svg') as SVGElement;
      expect(svg).not.toBeNull();
      // The kit-icons.spec placeholder shape is a rect and a text.
      expect(Array.from(svg.children).map((c) => c.tagName).join(',')).not.toBe('rect,text');
      expect(warn.mock.calls.map(([m]) => String(m)).filter((m) => m.includes('is not registered'))).toEqual([]);
      warn.mockRestore();
    });

    it('rules: a nowrap glue that holds the hidden text; a 1em icon on the line box, 4 px after the word; no colour of its own', () => {
      expect(ruleBody('.lc-dl__external')).toBe('position: relative; white-space: nowrap;');
      expect(ruleBody('lc-icon.lc-dl__external-icon')).toBe('--lc-icon-size: 1em; height: 1lh; vertical-align: top; margin-inline-start: var(--spacing-1);');
      const block = css.slice(css.indexOf('\n.lc-dl__external {'), css.indexOf('\n.lc-dl__sep {'));
      expect(block).not.toMatch(/color|forced/);
      // After the item icon rules, before the 3.37 separator and the narrow rows.
      expect(css.indexOf('\n.lc-dl__external {')).toBeGreaterThan(css.indexOf('\n.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--icon {'));
      expect(css.indexOf('\n.lc-dl__external {')).toBeLessThan(css.indexOf('\n.lc-dl__sep {'));
    });

    it('D-3: in rows an external value keeps 6em of text (basis + 1em + 4 px; with an item icon + 2)', () => {
      expect(ruleBody('.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--external')).toBe('flex-basis: min(100%, 7em + var(--spacing-1));');
      expect(ruleBody('.lc-dl--rows > .lc-dl__row > .lc-dl__value.lc-dl__value--icon.lc-dl__value--external')).toBe(
        'flex-basis: min(100%, 8em + 2 * var(--spacing-1));',
      );
      render([shapes[0][1], shapes[2][1], { term: 'Intern', value: 'Akte', href: '#akte' }, { term: 'Ohne Link', value: 'x', external: true }]);
      // jsdom lists a `[class]` binding's classes sorted.
      expect(Array.from(root.querySelectorAll('dd')).map((dd) => dd.className)).toEqual([
        'lc-dl__value lc-dl__value--default lc-dl__value--external',
        'lc-dl__value lc-dl__value--default lc-dl__value--external lc-dl__value--icon',
        'lc-dl__value lc-dl__value--default',
        'lc-dl__value lc-dl__value--default',
      ]);
    });
  });

  describe('AC-3: the hint ends the name, as hidden text inside the link', () => {
    it('default „(opens in a new tab)“: the link reads value + space + hint, no aria-label', () => {
      render([shapes[0][1]]);
      const [link] = links();
      expect(link.textContent).toBe('Rahmenvertrag 2026 (opens in a new tab)');
      expect(computedName(root, link)).toBe('Rahmenvertrag 2026 (opens in a new tab)');
      expect(link.hasAttribute('aria-label')).toBe(false);
    });

    it('German hint; empty adds none', () => {
      render([shapes[0][1]], { externalLinkHint: '(öffnet in neuem Tab)' });
      expect(computedName(root, links()[0])).toBe('Rahmenvertrag 2026 (öffnet in neuem Tab)');
      fixture.componentRef.setInput('externalLinkHint', '');
      fixture.detectChanges();
      expect(links()[0].querySelector('.lc-dl__sr-only')).toBeNull();
      expect(computedName(root, links()[0])).toBe('Rahmenvertrag 2026');
    });

    it('clickable row: the row button reads term, value and the hint (known limit, JSDoc)', () => {
      render([shapes[0][1]], { clickable: true, externalLinkHint: '(öffnet in neuem Tab)' });
      expect(computedName(root, root.querySelector('.lc-dl__action') as HTMLElement)).toBe('Vertragsdokument Rahmenvertrag 2026 (öffnet in neuem Tab)');
    });
  });

  describe('AC-4: ignored without href; without external the link is 3.48’s', () => {
    it('external without href renders the plain value, no glue', () => {
      render([{ term: 'Status', value: 'aktiv', external: true }]);
      expect(root.querySelector('a, .lc-dl__external, lc-icon')).toBeNull();
      expect(root.querySelector('dd')?.textContent).toBe('aktiv');
    });

    it.each(shapes.map(([name, item]) => ({ name, item })))('$name without external: no target, rel, icon or hint; the 3.48 attributes', ({ item }) => {
      render([{ ...item, external: undefined }], { totalAriaLabel: 'Summe' });
      const [link] = links();
      expect(Array.from(link.attributes).map((a) => a.name).filter((n) => !n.startsWith('_ng'))).toEqual(['class', 'href']);
      expect(link.innerHTML.replace(/<!--[^]*?-->/g, '')).toBe(item.value);
      expect(root.querySelector('.lc-dl__external, lc-icon.lc-dl__external-icon')).toBeNull();
    });
  });

  describe('AC-5: a straight separator under clickable non-total rows (backlog 068-n2)', () => {
    const sel = (sep: string) => `.lc-dl--rows.lc-dl--sep-${sep} .lc-dl__row.lc-dl__row--clickable:not(.lc-dl__row--total, :last-child)`;

    it('the row gives its border to a pseudo-element at the same place: 1 px, across the row', () => {
      expect(ruleBody(`${sel('line')},\n${sel('divider')}`)).toBe('border-bottom: 0; margin-bottom: 1px;');
      expect(ruleBody(`${sel('line')}::after,\n${sel('divider')}::after`)).toBe(
        'content: ""; position: absolute; inset-inline: 0; bottom: -1px; border-bottom: 1px solid var(--color-divider); pointer-events: none;',
      );
      // The divider's own rule: the last one with that selector (it also ends the shared list).
      const at = css.lastIndexOf(`\n${sel('divider')}::after {`);
      expect(css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()).toBe('border-bottom-style: dashed;');
    });

    it('placed after the 3.48 total rules, before the narrow rows; the separator rule it beats is unchanged', () => {
      const at = css.indexOf(`\n${sel('line')},`);
      expect(at).toBeGreaterThan(css.indexOf('\n.lc-dl__row--total.lc-dl__row--clickable::after {'));
      expect(at).toBeLessThan(css.indexOf('\n.lc-dl--rows > .lc-dl__row {'));
      expect(css).toMatch(/\n\.lc-dl--rows\.lc-dl--sep-line \.lc-dl__row,\s*\.lc-dl--rows\.lc-dl--sep-divider \.lc-dl__row \{\s*border-bottom: 1px solid var\(--color-divider\);\s*\}/);
    });

    it('reaches clickable rows that are neither a total nor the last', () => {
      render(
        [
          { term: 'A', value: '1' },
          { term: 'B', value: '2' },
          { term: 'Summe', value: '3', total: true },
        ],
        { clickable: true },
      );
      const rows = Array.from(root.querySelectorAll<HTMLElement>('.lc-dl__row'));
      expect(rows.map((r) => r.matches(sel('line')))).toEqual([true, true, false]);
      fixture.destroy();
      render([{ term: 'A', value: '1' }, { term: 'B', value: '2' }]);
      expect(Array.from(root.querySelectorAll<HTMLElement>('.lc-dl__row')).map((r) => r.matches(sel('line')))).toEqual([false, false]);
    });
  });

  describe('axe', () => {
    let restoreCanvas: () => void;
    beforeAll(() => {
      restoreCanvas = installFakeCanvas();
    });
    afterAll(() => restoreCanvas());

    it.each([
      ['rows', false],
      ['stacked', false],
      ['rows', true],
    ] as const)('%s, clickable %s: external items have no violations', async (layout, clickable) => {
      render(
        clickable ? [shapes[0][1], shapes[4][1]] : shapes.map(([, item]) => item),
        { layout, clickable, totalAriaLabel: 'Summe', externalLinkHint: '(öffnet in neuem Tab)' },
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
