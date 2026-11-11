import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { BUNDLED_ICONS } from '@lifecorner/angular-ui-kit/icons';
import { AreaMapComponent, type AreaMapGroup } from './area-map.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * lc-area-map (3.40, request 060, life-os G-HV2, AC-4 to AC-10, design
 * D-2/D-3). The layout and the lines are CSS (measured in the stories,
 * build.md); this spec pins the DOM, the semantics, the classes the CSS keys
 * on, and the rules.
 */

/** The DE reference content of design §8 (website-home-vision R-068 / R-072). */
const DE: AreaMapGroup[] = [
  {
    status: 'Als Nächstes',
    statusVariant: 'primary',
    areas: [
      { label: 'Verträge und Versicherungen', icon: 'shield-check' },
      { label: 'Dokumente und Briefe', icon: 'mail' },
      { label: 'Haushaltsbudget', icon: 'wallet' },
    ],
  },
  {
    status: 'Gebaut',
    statusVariant: 'success',
    chipVariant: 'default',
    areas: [
      { label: 'Haushalt und Mitglieder', icon: 'users' },
      { label: 'Konten', icon: 'building-bank' },
    ],
  },
  {
    status: 'Geplant',
    statusVariant: 'info',
    placement: 'below',
    areas: [
      { label: 'Kalender und Erinnerungen', icon: 'calendar' },
      { label: 'Einkäufe', icon: 'shopping-bag' },
    ],
  },
  {
    status: 'Später',
    placement: 'below',
    areas: [
      { label: 'Zuhause und Auto', icon: 'home' },
      { label: 'Energie und Wasser', icon: 'bolt' },
      { label: 'Ziele und große Pläne', icon: 'target' },
      { label: 'Gesundheit, Fitness, Ernährung', icon: 'heart' },
      { label: 'Wichtige Menschen', icon: 'gift' },
      'Und mehr',
    ],
  },
];

@Component({
  imports: [AreaMapComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-area-map [groups]="groups()" layerTitle="Verbunden, für dich und KI nutzbar" layerText="Jede Angabe mit Quelle." [lines]="lines()">
      <span area-map-figure class="figure"></span>
      <a href="/mehr">Mehr erfahren</a>
    </lc-area-map>
    @if (second()) {
      <lc-area-map [groups]="groups()" layerTitle="Zweite Karte" lines="false" />
    }
  `,
})
class Host {
  readonly groups = signal<readonly AreaMapGroup[]>(DE);
  readonly lines = signal(true);
  readonly second = signal(false);
}

/** Markup without Angular's attributes and comments. */
const strip = (html: string) => html.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');

/** Sorted class list: jsdom lists a `[class]` binding's classes in sorted order. */
const classes = (el: Element) => [...el.classList].sort().join(' ');

describe('lc-area-map (3.40, request 060, G-HV2)', () => {
  let fixture: ComponentFixture<AreaMapComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideLcIcons(BUNDLED_ICONS)] }));

  function render(inputs: Record<string, unknown> = {}) {
    fixture = TestBed.createComponent(AreaMapComponent);
    for (const [key, value] of Object.entries({ groups: DE, layerTitle: 'Verbunden, für dich und KI nutzbar', ...inputs })) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return host();
  }

  describe('AC-4, AC-5: the DOM in reading order', () => {
    it('one named list of groups, then the layer, then the lines; defaults: EN name, lines on, no text', () => {
      const el = render();
      expect(el.className).toBe('lc-area-map');
      expect([...el.children].map((c) => c.tagName + '.' + classes(c))).toEqual([
        'UL.lc-area-map__list',
        'DIV.lc-area-map__layer lc-area-map__row-3',
        ...[1, 2, 3, 4, 5].map((n) => `SPAN.lc-area-map__link lc-area-map__link--${n}`),
      ]);
      const list = el.querySelector('.lc-area-map__list') as HTMLElement;
      expect([list.getAttribute('role'), list.getAttribute('aria-label')]).toEqual(['list', 'Areas and their status']);
      expect(el.querySelectorAll('ul')).toHaveLength(5);
      expect(el.querySelector('.lc-area-map__line')).toBeNull();
    });

    it('each group is a list item with its badge, then a list of its areas', () => {
      const groups = [...render().querySelectorAll('.lc-area-map__list > li')];
      expect(groups.map((g) => [...g.children].map((c) => c.tagName.toLowerCase() + '.' + c.classList[0]))).toEqual(
        Array(4).fill(['lc-badge.lc-area-map__status', 'ul.lc-area-map__areas']),
      );
      for (const g of groups) expect(g.querySelector('.lc-area-map__areas')?.getAttribute('role')).toBe('list');
      expect(groups.map((g) => g.querySelector('lc-badge')?.textContent?.trim())).toEqual(['Als Nächstes', 'Gebaut', 'Geplant', 'Später']);
      expect(groups.map((g) => [...g.querySelectorAll('lc-chip')].map((c) => c.textContent?.trim()))).toEqual(
        DE.map((group) => group.areas.map((a) => (typeof a === 'string' ? a : a.label))),
      );
    });

    it('groups: row classes in visual order; the first below group draws the divider', () => {
      const groups = [...render().querySelectorAll('.lc-area-map__list > li')];
      expect(groups.map(classes)).toEqual([
        'lc-area-map__group lc-area-map__row-1',
        'lc-area-map__group lc-area-map__row-2',
        'lc-area-map__group lc-area-map__group--below lc-area-map__group--divided lc-area-map__row-4',
        'lc-area-map__group lc-area-map__group--below lc-area-map__row-5',
      ]);
    });

    it('renders above groups first, each part in input order', () => {
      const [built, planned, next, later] = [DE[1], DE[2], DE[0], DE[3]];
      const groups = [...render({ groups: [planned, built, later, next] }).querySelectorAll('.lc-area-map__list > li lc-badge')];
      expect(groups.map((b) => b.textContent?.trim())).toEqual([built.status, next.status, planned.status, later.status]);
    });

    it('badges: xs, rounded, dot, wrap in the group colour; chips: sm, wrap, emphasis above and quiet below unless set', () => {
      const el = render();
      const badges = [...el.querySelectorAll('lc-badge > span')];
      expect(badges.map(classes)).toEqual(
        ['primary', 'success', 'info', 'default'].map((v) =>
          ['lc-badge', `lc-badge--${v}`, 'lc-badge--has-dot', 'lc-badge--rounded', 'lc-badge--wrap', 'lc-badge--xs'].sort().join(' '),
        ),
      );
      expect(badges.map((b) => b.querySelectorAll('.lc-badge__dot').length)).toEqual([1, 1, 1, 1]);
      const chips = [...el.querySelectorAll('.lc-area-map__list > li')].map((g) => [...g.querySelectorAll('lc-chip > .lc-chip')].map(classes));
      expect(chips).toEqual([
        Array(3).fill('lc-chip lc-chip--emphasis lc-chip--sm lc-chip--wrap'),
        Array(2).fill('lc-chip lc-chip--default lc-chip--sm lc-chip--wrap'),
        Array(2).fill('lc-chip lc-chip--quiet lc-chip--sm lc-chip--wrap'),
        Array(6).fill('lc-chip lc-chip--quiet lc-chip--sm lc-chip--wrap'),
      ]);
      // An area as a string has no icon; an AreaMapArea keeps its own.
      const icons = [...el.querySelectorAll('lc-chip')].map((c) => !!c.querySelector('lc-icon.lc-chip__icon'));
      expect(icons).toEqual([...Array(12).fill(true), false]);
      expect(el.querySelectorAll('lc-chip button')).toHaveLength(0);
    });

    it('the layer is a group named by its title, with the figure first, title and line as paragraphs, then free content', () => {
      const hostFixture = TestBed.createComponent(Host);
      hostFixture.detectChanges();
      const layer = (hostFixture.nativeElement as HTMLElement).querySelector('.lc-area-map__layer') as HTMLElement;
      expect([layer.getAttribute('role'), layer.getAttribute('aria-label')]).toEqual(['group', 'Verbunden, für dich und KI nutzbar']);
      expect(strip(layer.innerHTML)).toBe(
        '<span area-map-figure="" class="figure"></span><div class="lc-area-map__text">' +
          '<p class="lc-area-map__title">Verbunden, für dich und KI nutzbar</p><p class="lc-area-map__line">Jede Angabe mit Quelle.</p>' +
          '<a href="/mehr">Mehr erfahren</a></div>',
      );
    });

    it('takes its own names (DE) for the list and the layer', () => {
      const el = render({ ariaLabel: 'Bereiche und ihr Stand', layerAriaLabel: 'Gemeinsame Ebene: die Bereiche, verbunden und nutzbar für dich und eine KI' });
      expect(el.querySelector('.lc-area-map__list')?.getAttribute('aria-label')).toBe('Bereiche und ihr Stand');
      expect(el.querySelector('.lc-area-map__layer')?.getAttribute('aria-label')).toBe(
        'Gemeinsame Ebene: die Bereiche, verbunden und nutzbar für dich und eine KI',
      );
      expect(el.querySelector('.lc-area-map__title')?.textContent).toBe('Verbunden, für dich und KI nutzbar');
    });

    it('AC-5: no inline style anywhere (CSP without unsafe-inline); the lines are hidden and silent', () => {
      const el = render();
      expect([el, ...el.querySelectorAll('*')].filter((n) => n.hasAttribute('style')).map((n) => n.tagName)).toEqual([]);
      for (const link of el.querySelectorAll('.lc-area-map__link')) {
        expect([link.getAttribute('aria-hidden'), link.textContent, link.hasAttribute('role')]).toEqual(['true', '', false]);
      }
    });

    it('AC-20: nothing is focusable; axe finds nothing', async () => {
      const el = render({ ariaLabel: 'Bereiche und ihr Stand' });
      expect(el.querySelectorAll('button, a, input, [tabindex]')).toHaveLength(0);
      await fixture.whenStable();
      expect(violations(await audit(el))).toEqual([]);
    });
  });

  describe('AC-6, AC-9: anchors and lines', () => {
    it('one anchor per lined chip (above groups), one line each; below groups get none', () => {
      const el = render();
      const areas = [...el.querySelectorAll('.lc-area-map__area')].map(classes);
      expect(areas.slice(0, 5)).toEqual([1, 2, 3, 4, 5].map((n) => `lc-area-map__area lc-area-map__area--anchor-${n}`));
      expect(areas.slice(5)).toEqual(Array(8).fill('lc-area-map__area'));
      expect(el.querySelectorAll('.lc-area-map__link')).toHaveLength(5);
    });

    it('at most 8 lines: further chips of above groups render without an anchor', () => {
      const el = render({ groups: [{ status: 'Neun', areas: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }] });
      const areas = [...el.querySelectorAll('.lc-area-map__area')];
      expect(areas.filter((a) => /--anchor-/.test(a.className))).toHaveLength(8);
      expect(classes(areas[8])).toBe('lc-area-map__area');
      expect([...el.querySelectorAll('.lc-area-map__link')].map((l) => l.className.split('--')[1])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    });

    it('lines=false (also the bare string "false") renders no line span and nothing else changes', () => {
      const on = strip(render().innerHTML);
      const off = render({ lines: false });
      expect(off.querySelectorAll('.lc-area-map__link')).toHaveLength(0);
      expect(on.match(/<span[^>]*lc-area-map__link[^>]*><\/span>/g)).toHaveLength(5);
      expect(strip(off.innerHTML)).toBe(on.replace(/<span[^>]*lc-area-map__link[^>]*><\/span>/g, ''));
      expect(render({ lines: 'false' }).querySelectorAll('.lc-area-map__link')).toHaveLength(0);
    });

    it('two maps on a page use the same class names; each host scopes its anchors (AC-9)', () => {
      const hostFixture = TestBed.createComponent(Host);
      hostFixture.componentInstance.second.set(true);
      hostFixture.detectChanges();
      const [a, b] = [...(hostFixture.nativeElement as HTMLElement).querySelectorAll('lc-area-map')];
      const anchors = (m: Element) => [...m.querySelectorAll('[class*="--anchor-"]')].map(classes);
      expect(anchors(b)).toEqual(anchors(a));
      expect(a.querySelectorAll('.lc-area-map__link')).toHaveLength(5);
      expect(b.querySelectorAll('.lc-area-map__link')).toHaveLength(0);
    });
  });

  describe('edge cases (design §6)', () => {
    it('no groups: the layer alone in row 1, no lines', () => {
      const el = render({ groups: [] });
      expect([...el.children].map(classes)).toEqual(['lc-area-map__list', 'lc-area-map__layer lc-area-map__row-1']);
      expect(el.querySelectorAll('.lc-area-map__list > li')).toHaveLength(0);
    });

    it('no below group: no divider; only below groups: the layer first, the divider under it', () => {
      const above = render({ groups: DE.slice(0, 2) });
      expect(above.querySelector('.lc-area-map__group--divided')).toBeNull();
      const below = render({ groups: DE.slice(2) });
      expect(classes(below.querySelector('.lc-area-map__layer') as Element)).toBe('lc-area-map__layer lc-area-map__row-1');
      expect([...below.querySelectorAll('.lc-area-map__list > li')].map(classes)).toEqual([
        'lc-area-map__group lc-area-map__group--below lc-area-map__group--divided lc-area-map__row-2',
        'lc-area-map__group lc-area-map__group--below lc-area-map__row-3',
      ]);
      expect(below.querySelectorAll('.lc-area-map__link')).toHaveLength(0);
    });

    it('the documented limit: 11 groups and the layer take the 12 row tracks; a 12th group gets no row class', () => {
      const groups = Array.from({ length: 12 }, (_, i): AreaMapGroup => ({ status: `G${i + 1}`, areas: [], placement: i < 6 ? 'above' : 'below' }));
      const el = render({ groups });
      const rows = [...el.querySelectorAll('.lc-area-map__list > li')].map((g) => g.className.match(/lc-area-map__row-(\d+)/)?.[1] ?? null);
      expect(rows).toEqual(['1', '2', '3', '4', '5', '6', '8', '9', '10', '11', '12', null]);
      expect(classes(el.querySelector('.lc-area-map__layer') as Element)).toBe('lc-area-map__layer lc-area-map__row-7');
    });
  });

  describe('the API documentation (MCP)', () => {
    const source = readFileSync(resolve(__dirname, 'area-map.component.ts'), 'utf-8');

    it.each([
      ['layerText', "@default ''\n   */\n  readonly layerText = input<string>('');"],
      ['ariaLabel', "@default 'Areas and their status'\n   */\n  readonly ariaLabel = input<string>('Areas and their status');"],
      ['layerAriaLabel', '@default null\n   */\n  readonly layerAriaLabel = input<string | null>(null);'],
      ['lines', '@default true\n   */\n  readonly lines = input(true, { transform: booleanAttribute });'],
    ])('%s has JSDoc with its @default', (_, text) => {
      expect(source).toContain(text);
    });

    it('is a public entry', () => {
      const index = readFileSync(resolve(__dirname, '../../index.ts'), 'utf-8');
      expect(index).toContain("export * from '@lifecorner/angular-ui-kit/area-map';");
      expect(readFileSync(resolve(__dirname, 'index.ts'), 'utf-8')).toContain("\nexport * from './area-map.component';\n");
    });
  });

  describe('the rules', () => {
    const css = '\n' + compile(resolve(__dirname, 'area-map.component.scss')).css;
    /** Declarations of the first rule whose selector list is exactly `selector`. */
    const rule = (selector: string, from = 0) => {
      const at = css.indexOf(`\n${selector} {`, from);
      expect([selector, at > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
    };

    it('AC-9: the host is the lines\' containing block and scopes the anchor names', () => {
      expect(rule(':host')).toBe('position: relative; anchor-scope: all; isolation: isolate; display: grid; grid-template-columns: minmax(0, 1fr);');
    });

    it('the list is a subgrid over 12 rows; rows 1 to 12 place groups and layer', () => {
      expect(rule('.lc-area-map__list')).toContain('grid-column: 1; grid-row: 1/span 12; display: grid; grid-template-rows: subgrid;');
      for (let n = 1; n <= 12; n++) expect(rule(`.lc-area-map__row-${n}`)).toBe(`grid-row: ${n};`);
      expect(css).not.toContain('.lc-area-map__row-13');
    });

    it('AC-6: 8 chip anchors and the layer anchor; each line from its chip\'s bottom centre to the layer\'s top', () => {
      for (let n = 1; n <= 8; n++) {
        expect(rule(`.lc-area-map__area--anchor-${n}`)).toBe(`anchor-name: --lc-area-map-a${n};`);
        expect(rule(`.lc-area-map__link--${n}`)).toBe(`position-anchor: --lc-area-map-a${n};`);
      }
      expect(css).not.toContain('--anchor-9');
      expect(rule('.lc-area-map__layer')).toContain('position: relative; z-index: 2; anchor-name: --lc-area-map-layer;');
      expect(rule('.lc-area-map__link')).toBe(
        'position: absolute; z-index: 0; left: anchor(center); top: anchor(bottom); bottom: anchor(--lc-area-map-layer top); ' +
          'width: 1.5px; margin-left: -0.75px; border-radius: 1px; ' +
          'background: var(--lc-area-map-line-color, color-mix(in srgb, currentColor 50%, transparent)); pointer-events: none;',
      );
      // Lines under the list (z 1): the opaque chips and badges cover them.
      expect(rule('.lc-area-map__list')).toContain('position: relative; z-index: 1;');
    });

    it('AC-7: without anchor positioning and in forced colours the lines are hidden; nothing else changes', () => {
      expect(css).toContain('@supports not (anchor-name: --a) {\n  .lc-area-map__link {\n    display: none;\n  }\n}');
      const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
      expect(forced).toMatch(/^@media \(forced-colors: active\) \{\s*\.lc-area-map__link \{\s*display: none;\s*\}\s*\.lc-area-map__layer \{\s*border-color: CanvasText;\s*\}\s*\}/);
    });

    it('the hooks: read with their documented defaults, never declared (an ancestor wins)', () => {
      expect(rule('.lc-area-map__layer')).toContain(
        'border: 1px solid var(--lc-area-map-layer-border, color-mix(in srgb, currentColor 32%, transparent)); border-radius: var(--border-radius-lg); ' +
          'background: var(--lc-area-map-layer-bg, var(--_lc-hero-glass, var(--color-surface-secondary)));',
      );
      expect(rule('.lc-area-map__list > .lc-area-map__group--divided')).toContain(
        'border-top: 1px solid var(--lc-area-map-divider-color, color-mix(in srgb, currentColor 20%, transparent));',
      );
      expect(css).not.toMatch(/--lc-area-map-[\w-]+\s*:/);
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    });

    it('the divider rule outweighs the group gap: same specificity, later in the sheet', () => {
      expect(css.indexOf('\n.lc-area-map__list > .lc-area-map__group--divided {')).toBeGreaterThan(css.indexOf('\n.lc-area-map__group + .lc-area-map__group {'));
    });

    it('≥ 1024 px: the measured gaps and the larger title', () => {
      const wide = css.slice(css.indexOf('@media (min-width: 1024px)'));
      expect(wide).toMatch(/\.lc-area-map__group,\s*\.lc-area-map__areas \{\s*gap: var\(--spacing-2\);/);
      expect(wide).toMatch(/\.lc-area-map__list > \.lc-area-map__group--divided \{\s*margin-top: var\(--spacing-7\);\s*padding-top: var\(--spacing-5\);/);
      expect(wide).toMatch(/\.lc-area-map__layer \{\s*margin-top: var\(--spacing-7\);\s*padding: var\(--spacing-3-5\) var\(--spacing-4\);/);
      expect(wide).toMatch(/\.lc-area-map__title \{\s*font-size: var\(--typography-font-size-lg\);/);
    });
  });
});
