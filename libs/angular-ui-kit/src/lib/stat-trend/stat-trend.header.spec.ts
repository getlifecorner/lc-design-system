import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { encapsulateStyle } from '@angular/compiler';
import { resolve } from 'path';
import { compile } from 'sass';
import { StatTrendComponent, type StatTrendIconPlacement } from './stat-trend.component';
import { CardComponent } from '../card/card.component';
import { BadgeComponent } from '../badge/badge.component';
import { LABEL_IN_NAME as RULE, audit, installFakeCanvas, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * 3.52 (request 073, finance-intelligence cockpit-prove-2026-11-22, AC-6 …
 * AC-11, design D-2 … D-5): `iconPlacement`, `fullWidth` and the
 * `[stat-trend-end]` header slot. Each new rule is keyed to a host class or to
 * projected content, so the default tile keeps its DOM and CSS. jsdom has no
 * layout: positions, the second header row and the widths are measured in the
 * stories *KPI Tile (DE)*, *Header Arrangement* and *Header RTL* (build.md).
 */
@Component({
  standalone: true,
  imports: [StatTrendComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (attr()) {
      <lc-stat-trend label="Revenue" value="$42,350" icon="wallet" fullWidth />
    } @else if (slot()) {
      <lc-stat-trend [label]="label()" value="27" [icon]="icon()" [iconPlacement]="placement()" [fullWidth]="fullWidth()">
        <lc-badge stat-trend-end variant="warning" size="sm" [rounded]="true">&ngsp;Teilweise umgesetzt</lc-badge>
      </lc-stat-trend>
    } @else if (unset()) {
      <lc-stat-trend [label]="label()" value="27" [icon]="icon()" />
    } @else {
      <lc-stat-trend [label]="label()" value="27" [icon]="icon()" [iconPlacement]="placement()" [fullWidth]="fullWidth()" />
    }
  `,
})
class Host {
  readonly attr = signal(false);
  readonly slot = signal(false);
  readonly unset = signal(false);
  readonly label = signal('Offene Maßnahmen');
  readonly icon = signal('info-circle');
  readonly placement = signal<StatTrendIconPlacement>('end');
  readonly fullWidth = signal(false);
}

describe('lc-stat-trend — header arrangement (3.52, request 073)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const statTrend = () => root().querySelector('lc-stat-trend') as HTMLElement;
  const header = () => root().querySelector('.lc-stat-trend__header') as HTMLElement | null;
  /** The header's element children as `tag.firstClass` (or `tag[attr]` for the slot). */
  const parts = () =>
    [...(header()?.children ?? [])].map((c) => (c.hasAttribute('stat-trend-end') ? `${c.tagName.toLowerCase()}[stat-trend-end]` : `${c.tagName.toLowerCase()}.${c.classList[0]}`));
  const render = (set: (h: Host) => void = () => undefined) => {
    TestBed.configureTestingModule({ imports: [Host], providers: [provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(Host);
    set(fixture.componentInstance);
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  describe('AC-10: defaults as 3.51', () => {
    it.each(['unset', 'bound to the defaults'])('%s: no host class attribute, header label + icon, no other nodes', (mode) => {
      render((h) => h.unset.set(mode === 'unset'));
      expect(statTrend().hasAttribute('class')).toBe(false);
      expect(parts()).toEqual(['span.lc-stat-trend__label', 'lc-icon.lc-stat-trend__header-icon']);
      // Only the two elements and the comment anchors of their @if blocks: no text node, no slot box.
      expect([...(header() as HTMLElement).childNodes].filter((n) => n.nodeType !== Node.COMMENT_NODE)).toHaveLength(2);
      expect(statTrend().textContent).toBe('Offene Maßnahmen 27');
    });
  });

  describe('AC-6: iconPlacement', () => {
    it("defaults to 'end'; 'after-label' adds the host class lc-stat-trend--icon-after-label", () => {
      render();
      const component = fixture.debugElement.query((d) => d.componentInstance instanceof StatTrendComponent).componentInstance as StatTrendComponent;
      expect(component.iconPlacement()).toBe('end');
      fixture.componentInstance.placement.set('after-label');
      fixture.detectChanges();
      expect(statTrend().className).toBe('lc-stat-trend--icon-after-label');
      expect(parts()).toEqual(['span.lc-stat-trend__label', 'lc-icon.lc-stat-trend__header-icon']);
    });
  });

  describe('AC-7: fullWidth', () => {
    it('true adds the host class lc-stat-trend--full-width; false removes it again', () => {
      render((h) => h.fullWidth.set(true));
      expect(statTrend().className).toBe('lc-stat-trend--full-width');
      fixture.componentInstance.fullWidth.set(false);
      fixture.detectChanges();
      expect(statTrend().classList).toHaveLength(0);
    });

    it('takes the bare attribute form fullWidth (booleanAttribute)', () => {
      render((h) => h.attr.set(true));
      expect(statTrend().classList.contains('lc-stat-trend--full-width')).toBe(true);
    });
  });

  describe('AC-8, AC-9: the [stat-trend-end] slot', () => {
    it.each<StatTrendIconPlacement>(['end', 'after-label'])('%s: the projected element is the header\'s last child, no wrapper; order label, icon, slot', (placement) => {
      render((h) => {
        h.slot.set(true);
        h.placement.set(placement);
        h.fullWidth.set(true);
      });
      expect(parts()).toEqual(['span.lc-stat-trend__label', 'lc-icon.lc-stat-trend__header-icon', 'lc-badge[stat-trend-end]']);
      expect(root().querySelector('[stat-trend-end]')?.parentElement).toBe(header());
    });

    it('with a label only (no icon): label, slot', () => {
      render((h) => {
        h.slot.set(true);
        h.icon.set('');
      });
      expect(parts()).toEqual(['span.lc-stat-trend__label', 'lc-badge[stat-trend-end]']);
    });

    it('slot only (no label, no icon): no header and no slot element (D-4)', () => {
      render((h) => {
        h.slot.set(true);
        h.icon.set('');
        h.label.set('');
      });
      expect(header()).toBeNull();
      expect(root().querySelector('[stat-trend-end]')).toBeNull();
      expect(root().querySelector('.lc-stat-trend__value')?.textContent).toBe('27');
    });

    it('text order: label, slot, value (the badge text starts with a space)', () => {
      render((h) => h.slot.set(true));
      expect(statTrend().textContent?.replace(/\s+/g, ' ')).toBe('Offene Maßnahmen Teilweise umgesetzt 27');
    });
  });

  describe('CSS: every new rule is keyed to a host class or projected content', () => {
    const css = compile(resolve(__dirname, 'stat-trend.component.scss')).css;
    const NEW = css.indexOf(':host(.lc-stat-trend--full-width) {');
    const selectors = (text: string) => [...text.matchAll(/(^|\n)([^\s@}][^{]*)\{/g)].map((m) => m[2].trim());

    it('the 3.52 rules come after every earlier rule; none of the earlier selectors changes', () => {
      expect(NEW).toBeGreaterThan(css.indexOf('.lc-stat-trend__sr-only {'));
      expect(selectors(css.slice(0, NEW)).filter((s) => /:host|stat-trend-end|:has/.test(s))).toEqual([]);
    });

    it('each new selector needs a 3.52 host class or [stat-trend-end] content', () => {
      const added = selectors(css.slice(NEW));
      expect(added).toHaveLength(8);
      for (const s of added) expect(s).toMatch(/:host\(\.lc-stat-trend--(full-width|icon-after-label)\)|:host\(:not\(\.lc-stat-trend--icon-after-label\)\) .*\[stat-trend-end\]|\[stat-trend-end\]/);
    });

    it('pins the values of design §3', () => {
      const body = (selector: string) => {
        const at = css.indexOf(`${selector} {`);
        return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
      };
      expect(body(':host(.lc-stat-trend--full-width)')).toBe('display: block; inline-size: 100%;');
      expect(body(':host(.lc-stat-trend--full-width) > .lc-stat-trend')).toBe('display: flex;');
      expect(body(':host(.lc-stat-trend--icon-after-label) .lc-stat-trend__header-icon')).toBe('margin-inline-end: auto;');
      expect(body('.lc-stat-trend__header > ::ng-deep [stat-trend-end]')).toBe('display: flex;');
      expect(body('.lc-stat-trend__header:has(> [stat-trend-end])')).toBe('flex-wrap: wrap; row-gap: 0.25rem;');
      expect(body('.lc-stat-trend__header:has(> [stat-trend-end]) > .lc-stat-trend__label')).toBe('overflow-wrap: anywhere; hyphens: auto; hyphenate-limit-chars: 12 4 3;');
      expect(body('.lc-stat-trend__header:has(> [stat-trend-end]) > .lc-stat-trend__label:has(+ .lc-stat-trend__header-icon)')).toBe('max-inline-size: calc(100% - 20px - 0.5rem);');
      expect(body(':host(:not(.lc-stat-trend--icon-after-label)) .lc-stat-trend__header:has(> [stat-trend-end]) > .lc-stat-trend__label')).toBe('margin-inline-end: auto;');
    });

    it("Angular's style shim leaves :has() unscoped, so the scoped rules match the projected element", () => {
      render((h) => {
        h.slot.set(true);
        h.fullWidth.set(true);
      });
      const rules = selectors(encapsulateStyle(css.slice(NEW), 'c1'));
      expect(rules).toHaveLength(8);
      expect(rules[4]).toBe('.lc-stat-trend__header[_ngcontent-c1]:has(> [stat-trend-end])');
      // No scope attribute inside any :has(): the projected element carries the consumer's, not ours.
      for (const s of rules) for (const m of s.matchAll(/:has\(([^)]*)\)/g)) expect(m[1]).not.toContain('_ng');
      // The test renderer adds no scope attributes: map them back onto the plain DOM to match.
      const plain = (s: string) => s.replace(/([^\s>]*)\[_nghost-c1\]/g, 'lc-stat-trend$1').replaceAll('[_ngcontent-c1]', '');
      // Slot present, icon at the end, fullWidth: every rule but after-label's matches.
      expect(rules.map((s) => root().querySelectorAll(plain(s)).length > 0)).toEqual([true, true, false, true, true, true, true, true]);
    });
  });
});

/** AC-11: axe with a badge in the slot, also in a clickable card (design §6). */
@Component({
  standalone: true,
  imports: [CardComponent, StatTrendComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-card variant="outlined" padding="md" borderRadius="md" [clickable]="true" ariaLabel="Offene Maßnahmen: Teilweise umgesetzt, 27">
        <lc-stat-trend label="Offene Maßnahmen" value="27" icon="info-circle" iconPlacement="after-label" [fullWidth]="true">
          @if (space()) {
            <lc-badge stat-trend-end variant="warning" size="sm" [rounded]="true" [wrap]="true">&ngsp;Teilweise umgesetzt</lc-badge>
          } @else {
            <lc-badge stat-trend-end variant="warning" size="sm" [rounded]="true" [wrap]="true">Teilweise umgesetzt</lc-badge>
          }
        </lc-stat-trend>
      </lc-card>
      <lc-card variant="outlined" padding="md" borderRadius="md">
        <lc-stat-trend label="Einsparung 2026" value="1,2 Mio. €" change="+4,0 %" sentiment="positive" icon="wallet" [fullWidth]="true">
          <lc-badge stat-trend-end variant="success" size="sm" [rounded]="true">Im Plan</lc-badge>
        </lc-stat-trend>
      </lc-card>
    </div>
  `,
})
class CardHost {
  readonly space = signal(true);
}

describe('lc-stat-trend — [stat-trend-end] under axe-core 4.14 (3.52, AC-11)', () => {
  let fixture: ComponentFixture<CardHost>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => restoreCanvas());

  const render = async (space: boolean) => {
    TestBed.configureTestingModule({ imports: [CardHost], providers: [provideHttpClient(withXhr())] });
    fixture = TestBed.createComponent(CardHost);
    fixture.componentInstance.space.set(space);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { root, card: root.querySelector('[role="button"]') as HTMLElement };
  };

  afterEach(() => fixture?.destroy());

  it('passes with the badge text starting with a space: no violations, label-in-name passes on the card', async () => {
    const { root, card } = await render(true);
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    expect(outcomeFor(results, RULE, card)).toBe('pass');
  });

  it('fails without the space (negative control: axe joins "Maßnahmen" and "Teilweise" into one word)', async () => {
    const { root, card } = await render(false);
    const results = await audit(root);
    expect(outcomeFor(results, RULE, card)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
  });
});
