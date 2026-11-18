import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { AccordionComponent, type AccordionChevronPosition, type AccordionVariant } from './accordion.component';
import { audit, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.46 (request 066, finance-intelligence kosten row 4): an lc-accordion in
 * the body of another one keeps its own state. The size, chevron, plain and
 * open-state rules reach their parts through child chains, so no rule of the
 * parent reaches a part of the child (AC-7 to AC-9, AC-11). jsdom applies no
 * stylesheets: the compiled rules are matched against the rendered DOM.
 */
const css = compile(resolve(__dirname, 'accordion.component.scss')).css;

/** Every selector (top-level and in @media) that names a modifier. */
const modifierSelectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)]
  .flatMap((m) => m[1].split(','))
  .map((s) => s.trim())
  .filter((s) => s.includes('.lc-accordion--'));

/** A selector jsdom can match structurally: :where() unwrapped, states and pseudo-elements dropped. */
const structural = (selector: string) =>
  selector.replace(/:where\(([^()]*)\)/g, '$1').replace(/::?[a-z-]+(?:\([^()]*\))?/g, '');

/** The modifiers of a selector's first compound (`.lc-accordion--plain.lc-accordion--sm` → both; not those in `:not()`). */
const modifiersOf = (selector: string) => structural(selector).match(/^[^\s>]+/)?.[0].match(/lc-accordion--[\w-]+/g) ?? [];

type Config = { variant: AccordionVariant; size: 'sm' | 'md' | 'lg'; chevron: AccordionChevronPosition };

@Component({
  imports: [AccordionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-accordion
        class="parent"
        title="Kostenstelle 4711 · IT-Betrieb"
        [variant]="parent().variant"
        [size]="parent().size"
        [chevronPosition]="parent().chevron"
        [(expanded)]="parentOpen"
      >
        <lc-accordion
          class="child"
          title="Budget Cloud-Dienste"
          [variant]="child().variant"
          [size]="child().size"
          [chevronPosition]="child().chevron"
          [(expanded)]="childOpen"
        >
          <p>Plan 120.000,00 € · Ist 128.040,00 €</p>
        </lc-accordion>
        <lc-accordion class="sibling" title="Budget Hardware" [variant]="child().variant" [size]="child().size" [chevronPosition]="child().chevron">
          <p>Plan 40.000,00 €</p>
        </lc-accordion>
      </lc-accordion>
      <lc-accordion class="after" title="Kostenstelle 4712 · Netze">Netze</lc-accordion>
    </div>
  `,
})
class HostComponent {
  readonly parent = signal<Config>({ variant: 'plain', size: 'lg', chevron: 'leading' });
  readonly child = signal<Config>({ variant: 'plain', size: 'lg', chevron: 'leading' });
  readonly parentOpen = signal(true);
  readonly childOpen = signal(false);
}

describe('lc-accordion nested (3.46, request 066, kosten row 4)', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function render(values: Partial<{ parent: Config; child: Config; parentOpen: boolean; childOpen: boolean }> = {}): HTMLElement {
    fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    if (values.parent) host.parent.set(values.parent);
    if (values.child) host.child.set(values.child);
    if (values.parentOpen !== undefined) host.parentOpen.set(values.parentOpen);
    if (values.childOpen !== undefined) host.childOpen.set(values.childOpen);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  /** The root `div.lc-accordion` and its parts of one accordion (not those of an accordion inside it). */
  function parts(el: HTMLElement, which: 'parent' | 'child' | 'sibling' | 'after') {
    const root = el.querySelector(`lc-accordion.${which} > .lc-accordion`) as HTMLElement;
    const header = root.querySelector(':scope > .lc-accordion__heading > .lc-accordion__header') as HTMLButtonElement;
    return {
      root,
      header,
      icon: header.querySelector(':scope > .lc-accordion__icon') as HTMLElement,
      panel: root.querySelector(':scope > .lc-accordion__panel') as HTMLElement,
      body: root.querySelector(':scope > .lc-accordion__panel > .lc-accordion__body') as HTMLElement,
    };
  }

  /** Rules a part matches (structurally), whose modifiers its own accordion doesn't have. */
  function leaks(el: HTMLElement): string[] {
    const found: string[] = [];
    for (const selector of modifierSelectors) {
      for (const match of el.querySelectorAll(structural(selector))) {
        const own = match.closest('.lc-accordion') as Element;
        const missing = modifiersOf(selector).filter((m) => !own.classList.contains(m));
        if (missing.length) found.push(`${selector} → ${match.className} (no ${missing.join(', ')})`);
      }
    }
    return found;
  }

  const plainLgLeading: Config = { variant: 'plain', size: 'lg', chevron: 'leading' };
  const outlinedSmTrailing: Config = { variant: 'outlined', size: 'sm', chevron: 'trailing' };
  const flatMdLeading: Config = { variant: 'flat', size: 'md', chevron: 'leading' };
  const configs: readonly [string, Config, Config][] = [
    ['plain lg leading ⊃ plain lg leading', plainLgLeading, plainLgLeading],
    ['plain lg leading ⊃ outlined sm trailing', plainLgLeading, outlinedSmTrailing],
    ['outlined sm trailing ⊃ flat md leading', outlinedSmTrailing, flatMdLeading],
    ['flat md leading ⊃ plain lg leading', flatMdLeading, plainLgLeading],
    ['outlined lg trailing ⊃ plain sm leading', { variant: 'outlined', size: 'lg', chevron: 'trailing' }, { variant: 'plain', size: 'sm', chevron: 'leading' }],
  ];
  const states: readonly [boolean, boolean][] = [
    [true, false],
    [false, true],
    [true, true],
  ];

  describe('stylesheet', () => {
    it('AC-7: no compiled selector reaches a part through a descendant space after a modifier', () => {
      expect(modifierSelectors.length).toBeGreaterThan(30);
      expect(modifierSelectors.filter((s) => /\.lc-accordion--[\w-]+(?:\.lc-accordion--[\w-]+)*(?::[\w-]+(?:\([^()]*\))?)* +\.lc-accordion__/.test(s))).toEqual([]);
    });

    it.each(configs.flatMap(([name, parent, child]) => states.map(([parentOpen, childOpen]) => ({ name, parent, child, parentOpen, childOpen }))))(
      'AC-7, AC-9: $name, parent open $parentOpen, child open $childOpen: every part reads only its own modifiers',
      ({ parent, child, parentOpen, childOpen }) => {
        expect(leaks(render({ parent, child, parentOpen, childOpen }))).toEqual([]);
      },
    );

    it('AC-7: in an open parent the closed child matches none of the open-state rules, the parent all of them', () => {
      const el = render();
      const parent = parts(el, 'parent');
      const child = parts(el, 'child');
      const open = modifierSelectors.filter((s) => modifiersOf(s).includes('lc-accordion--expanded')).map(structural);
      expect(open.length).toBeGreaterThan(5);
      const matched = (node: Element) => open.filter((s) => node.matches(s));
      for (const part of ['icon', 'panel', 'body'] as const) {
        expect(matched(child[part])).toEqual([]);
        expect(matched(parent[part]).length).toBeGreaterThan(0);
      }
      expect(child.panel.hasAttribute('inert')).toBe(true);
      expect(child.header.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('behaviour', () => {
    it('AC-8: opening and closing the child changes only the child; closing removes its open state', () => {
      const el = render();
      const parent = parts(el, 'parent');
      const child = parts(el, 'child');
      child.header.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.childOpen()).toBe(true);
      expect(child.root.classList).toContain('lc-accordion--expanded');
      expect(child.panel.hasAttribute('inert')).toBe(false);
      expect(fixture.componentInstance.parentOpen()).toBe(true);
      expect(parent.root.classList).toContain('lc-accordion--expanded');

      child.header.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.childOpen()).toBe(false);
      expect(child.root.classList).not.toContain('lc-accordion--expanded');
      expect(child.panel.hasAttribute('inert')).toBe(true);
      expect(parent.root.classList).toContain('lc-accordion--expanded');
      expect(leaks(el)).toEqual([]);
    });

    it('AC-8: open the child, then close the parent: the parent closes, the child keeps its own state', () => {
      const el = render();
      const parent = parts(el, 'parent');
      const child = parts(el, 'child');
      child.header.click();
      fixture.detectChanges();
      parent.header.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.parentOpen()).toBe(false);
      expect(parent.root.classList).not.toContain('lc-accordion--expanded');
      expect(parent.panel.hasAttribute('inert')).toBe(true);
      expect(fixture.componentInstance.childOpen()).toBe(true);
      expect(child.header.getAttribute('aria-expanded')).toBe('true');
      expect(leaks(el)).toEqual([]);
    });

    it('AC-9: a closed parent never makes an open child look closed', () => {
      const el = render({ parentOpen: false, childOpen: true });
      const child = parts(el, 'child');
      const parent = parts(el, 'parent');
      const openBody = structural(modifierSelectors.find((s) => s.startsWith('.lc-accordion--expanded >') && s.endsWith('.lc-accordion__body')) as string);
      const openIcon = structural(modifierSelectors.find((s) => s.startsWith('.lc-accordion--expanded >') && s.endsWith('.lc-accordion__icon')) as string);
      expect(child.body.matches(openBody)).toBe(true);
      expect(child.icon.matches(openIcon)).toBe(true);
      expect(parent.body.matches(openBody)).toBe(false);
      expect(parent.icon.matches(openIcon)).toBe(false);
      // Hidden only through the parent's collapsed panel.
      expect(child.panel.hasAttribute('inert')).toBe(false);
      expect(child.root.closest('[inert]')).toBe(parent.panel);
    });

    it('AC-11: the heads that Tab reaches follow the DOM order, each aria-expanded is its own', () => {
      const reachable = (el: HTMLElement) =>
        [...el.querySelectorAll<HTMLButtonElement>('button.lc-accordion__header')]
          .filter((b) => !b.closest('[inert]'))
          .map((b) => [b.textContent?.trim(), b.getAttribute('aria-expanded')]);
      expect(reachable(render())).toEqual([
        ['Kostenstelle 4711 · IT-Betrieb', 'true'],
        ['Budget Cloud-Dienste', 'false'],
        ['Budget Hardware', 'false'],
        ['Kostenstelle 4712 · Netze', 'false'],
      ]);
      expect(reachable(render({ parentOpen: false, childOpen: true }))).toEqual([
        ['Kostenstelle 4711 · IT-Betrieb', 'false'],
        ['Kostenstelle 4712 · Netze', 'false'],
      ]);
    });
  });

  describe('axe', () => {
    let restoreCanvas: () => void;
    beforeAll(() => {
      restoreCanvas = installFakeCanvas();
    });
    afterAll(() => restoreCanvas());

    it.each(states)('AC-11: nested accordions pass axe (parent open %s, child open %s)', async (parentOpen, childOpen) => {
      const el = render({ parentOpen, childOpen });
      await fixture.whenStable();
      expect(violations(await audit(el))).toEqual([]);
    });
  });
});
