import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_HEART } from '@lifecorner/angular-ui-kit/icons';
import { ChipComponent } from './chip.component';

/**
 * lc-chip `wrap` (3.40, request 060, life-os G-HV3, AC-11, AC-12): a long
 * label wraps onto centred lines instead of running out of its container at
 * 320 px and 200 % text (WCAG 1.4.10), as lc-badge `wrap` (3.11). Opt-in:
 * without it the chip renders exactly as in 3.39. The layout is CSS (measured
 * in the stories); these tests pin the class, the DOM and the stylesheet.
 */
@Component({
  imports: [ChipComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-chip variant="info" icon="heart" [removable]="removable()" [clickable]="clickable()" [wrap]="wrap()">
      Gesundheit, Fitness, Ernährung
    </lc-chip>
    <lc-chip wrap>Attribut</lc-chip>
  `,
})
class WrapHostComponent {
  readonly removable = signal(false);
  readonly clickable = signal(false);
  readonly wrap = signal(false);
}

/** The compiled stylesheet: jsdom applies none, so the rules are read here. */
const css = '\n' + compile(resolve(__dirname, 'chip.component.scss')).css;

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect([selector, start > -1]).toEqual([selector, true]);
  return css.slice(start, css.indexOf('}', start));
}

/** Markup without Angular's attributes and comments. */
const strip = (html: string) => html.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');

describe('lc-chip wrap (3.40, G-HV3)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideLcIcons([ICON_HEART])] }));

  function render(init: Partial<{ removable: boolean; clickable: boolean; wrap: boolean }> = {}) {
    const fixture = TestBed.createComponent(WrapHostComponent);
    const host = fixture.componentInstance;
    if (init.removable !== undefined) host.removable.set(init.removable);
    if (init.clickable !== undefined) host.clickable.set(init.clickable);
    if (init.wrap !== undefined) host.wrap.set(init.wrap);
    fixture.detectChanges();
    const chip = (fixture.nativeElement as HTMLElement).querySelector('lc-chip') as HTMLElement;
    const pill = chip.firstElementChild as HTMLElement;
    return { fixture, host, chip, pill };
  }

  /** The class list, sorted: Angular's `[class]` order is not the computed order. */
  const classes = (el: HTMLElement): string[] => [...el.classList].sort();

  describe('AC-12: the default renders as in 3.39', () => {
    it('defaults `wrap` to false; the class string is the 3.39 one', () => {
      const chip = TestBed.createComponent(ChipComponent);
      chip.detectChanges();
      expect(chip.componentInstance.wrap()).toBe(false);
      expect(chip.componentInstance.chipClasses()).toBe('lc-chip lc-chip--default lc-chip--md');
    });

    // The 3.39 markup of the three shells (chip template unchanged in 3.40).
    it.each([
      [{}, 'SPAN', 'lc-chip lc-chip--info lc-chip--md'],
      [{ removable: true }, 'SPAN', 'lc-chip lc-chip--info lc-chip--md lc-chip--removable'],
      [{ clickable: true }, 'BUTTON', 'lc-chip lc-chip--info lc-chip--md lc-chip--clickable'],
      [{ clickable: true, removable: true }, 'SPAN', 'lc-chip lc-chip--info lc-chip--md lc-chip--removable lc-chip--clickable lc-chip--split'],
    ])('without wrap, %j: the 3.39 element and classes', (init, tag, expected) => {
      const { pill } = render(init);
      expect(pill.tagName).toBe(tag);
      expect(classes(pill)).toEqual(expected.split(' ').sort());
    });

    it('wrap adds lc-chip--wrap and changes nothing else in the DOM, in every shell', () => {
      for (const init of [{}, { removable: true }, { clickable: true }, { clickable: true, removable: true }]) {
        const off = render(init);
        const before = strip(off.chip.innerHTML);
        off.host.wrap.set(true);
        off.fixture.detectChanges();
        expect([init, classes(off.pill).filter((c) => c === 'lc-chip--wrap')]).toEqual([init, ['lc-chip--wrap']]);
        off.pill.classList.remove('lc-chip--wrap');
        expect([init, strip(off.chip.innerHTML)]).toEqual([init, before]);
      }
    });

    it('takes the bare attribute form (booleanAttribute)', () => {
      const { fixture } = render();
      const chips = (fixture.nativeElement as HTMLElement).querySelectorAll('lc-chip');
      expect((chips[1].firstElementChild as HTMLElement).className).toBe('lc-chip lc-chip--default lc-chip--md lc-chip--wrap');
    });

    it('keeps one line and the fixed heights in the base and size rules', () => {
      const base = rule('.lc-chip');
      expect(base).toMatch(/white-space:\s*nowrap/);
      expect(base).toMatch(/line-height:\s*1;/);
      expect(rule('.lc-chip--sm')).toMatch(/height:\s*1\.5rem/);
      expect(rule('.lc-chip--md')).toMatch(/height:\s*2rem/);
      expect(rule('.lc-chip--lg')).toMatch(/height:\s*2\.5rem/);
      expect(base).toMatch(/border-radius:\s*var\(--border-radius-full, 9999px\)/);
    });

    it('documents the input with @default false', () => {
      const source = readFileSync(resolve(__dirname, 'chip.component.ts'), 'utf8');
      expect(source).toMatch(/its height; the icon and the remove button stay on the first line\.\s*\n\s*\* @default false\s*\n\s*\*\/\s*\n\s*wrap = input\(false, \{ transform: booleanAttribute \}\);/);
    });
  });

  describe('AC-11: with `wrap`', () => {
    it('keeps icon, label and remove button in order', () => {
      const { pill } = render({ wrap: true, removable: true });
      expect([...pill.children].map((c) => c.className)).toEqual(['lc-chip__content', 'lc-chip__delete']);
      expect([...(pill.firstElementChild as HTMLElement).children].map((c) => c.className.split(' ')[0])).toEqual(['lc-chip__icon', 'lc-chip__label']);
      expect(pill.textContent?.trim()).toBe('Gesundheit, Fitness, Ernährung');
    });

    it('wraps centred lines of 1.25, never wider than the container, hyphenating long German compounds', () => {
      const wrap = rule('.lc-chip--wrap');
      expect(wrap).toMatch(/max-width:\s*100%/);
      expect(wrap).toMatch(/white-space:\s*normal/);
      expect(wrap).toMatch(/text-align:\s*center/);
      expect(wrap).toMatch(/line-height:\s*var\(--line-height-tight, 1\.25\)/);
      expect(wrap).toMatch(/overflow-wrap:\s*anywhere/);
      expect(wrap).toMatch(/hyphens:\s*auto/);
      expect(wrap).toMatch(/hyphenate-limit-chars:\s*12 4 3/);
      expect(wrap).toMatch(/align-items:\s*flex-start/);
      // After the clickable rule, so a <button> chip centres its lines too.
      expect(css.indexOf('\n.lc-chip--wrap {')).toBeGreaterThan(css.indexOf('\n.lc-chip--clickable {'));
    });

    it.each([
      ['sm', '1.5rem', '0.75rem'],
      ['md', '2rem', '1rem'],
      ['lg', '2.5rem', '1.25rem'],
    ])('size %s: min-height %s instead of height, padding for one line of that height, radius %s', (size, height, radius) => {
      // Two classes (0,2,0), so `height: auto` beats `.lc-chip--<size>`.
      const sized = rule(`.lc-chip--wrap.lc-chip--${size}`);
      expect(sized).toMatch(/height:\s*auto/);
      expect(sized).toContain(`min-height: ${height};`);
      // Sass drops the redundant calc() inside max(); the math is the same.
      expect(sized).toContain(`padding-block: max(0px, (${height} - 2px) / 2 - var(--line-height-tight, 1.25) * 0.5em);`);
      expect(sized).toContain(`border-radius: ${radius};`);
    });

    it('content and action shrink and align to the first line; the label is a block', () => {
      expect(rule('.lc-chip--wrap .lc-chip__content,\n.lc-chip--wrap .lc-chip__action')).toMatch(/min-width: 0;\s*align-items: flex-start;/);
      expect(rule('.lc-chip--wrap .lc-chip__label')).toMatch(/display: block;\s*min-width: 0;/);
    });

    it('keeps the 20 px icon and the 1em × on the centre of the first line', () => {
      expect(rule('.lc-chip--wrap .lc-chip__icon')).toContain('margin-block: calc((var(--line-height-tight, 1.25) * 1em - 20px) / 2);');
      expect(rule('.lc-chip--wrap .lc-chip__delete')).toContain('margin-block-start: calc((var(--line-height-tight, 1.25) - 1) * 0.5em);');
    });

    it('keeps the border, the colours and the inline padding', () => {
      const wrapRules = [...css.matchAll(/\n([^{}\n]*lc-chip--wrap[^{}\n]*)\{([^}]*)\}/g)];
      expect(wrapRules.length).toBeGreaterThanOrEqual(7);
      for (const [, , body] of wrapRules) {
        expect(body).not.toMatch(/(^|[\s;])border(-width|-style|-color)?:/);
        expect(body).not.toMatch(/(^|[\s;])(color|background(-color)?):/);
        expect(body).not.toMatch(/padding(-inline|-left|-right)?:/);
      }
    });
  });
});
