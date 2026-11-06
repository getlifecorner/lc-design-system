import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { SelectComponent } from './select/select.component';
import { TextareaComponent } from './textarea/textarea.component';
import { DatepickerComponent } from './datepicker/datepicker.component';

/**
 * Request 044 (3.27.2, F-31, design 044 D-3 to D-6): the border, fill and
 * outline that win on the real field element of lc-select, lc-textarea and
 * lc-datepicker, per variant and state. The cascade (specificity, then source
 * order) is resolved over the compiled component SCSS, because jsdom's
 * getComputedStyle ignores specificity; `:hover` and `:focus` are emulated by
 * classes. The filled rows are the fix; the outline rows pin the unchanged
 * default variant.
 */
type Field = 'select' | 'textarea' | 'datepicker';
type State = 'rest' | 'hover' | 'focus' | 'focus+hover' | 'error' | 'error+hover' | 'error+focus' | 'disabled' | 'disabled+hover' | 'readonly' | 'readonly+hover';
type Look = [border: string, background: string, outline: string];

const FIELDS: Record<Field, { component: Type<unknown>; scss: string; element: string; readonly: boolean }> = {
  select: { component: SelectComponent, scss: 'select/select.component.scss', element: '.lc-select', readonly: false },
  textarea: { component: TextareaComponent, scss: 'textarea/textarea.component.scss', element: 'textarea.lc-textarea', readonly: true },
  datepicker: { component: DatepickerComponent, scss: 'datepicker/datepicker.component.scss', element: 'input.lc-datepicker', readonly: true },
};

const atRules = /@[\w-]+[^{;]*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
const rulesOf = (text: string) =>
  [...text.replace(atRules, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
    decls: [...m[2].matchAll(/([\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2].replace(/\s+/g, ' ').trim()] as const),
  }));

/** The value a declaration gives the longhand, if it sets it (`border: 1px solid x` → x). */
const longhands: Record<string, (property: string, value: string) => string | undefined> = {
  border: (p, v) => (p === 'border-color' ? v : p === 'border' ? (v === 'none' ? 'none' : v.split(' ').slice(2).join(' ')) : undefined),
  background: (p, v) => (p === 'background-color' || p === 'background' ? v : undefined),
  outline: (p, v) => (p === 'outline-color' ? v : p === 'outline' ? (/^(none|0)\b/.test(v) ? 'none' : v.split(' ').slice(2).join(' ')) : undefined),
};

const specificity = (selector: string): number => {
  const s = selector.replace(/:not\(/g, '(');
  const ids = (s.match(/#[\w-]+/g) ?? []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g) ?? []).length;
  const types = (s.match(/(^|[(])[a-z][\w-]*/gi) ?? []).length;
  return ids * 10000 + classes * 100 + types;
};

/** The winning value of one longhand on `el` (`-` when no rule sets it). */
function cascade(css: string, el: Element, longhand: keyof typeof longhands): string {
  let best: { weight: number; order: number; value: string } | undefined;
  rulesOf(css).forEach((rule, order) => {
    let value: string | undefined;
    for (const [p, v] of rule.decls) value = longhands[longhand](p, v) ?? value;
    if (value === undefined) return;
    for (const selector of rule.selectors) {
      // Only compound selectors on the field itself (no pseudo-elements, no combinators).
      if (selector.includes('::') || /[\s>+~](?![^(]*\))/.test(selector) || selector.startsWith(':')) continue;
      const emulated = selector.replace(/:hover\b/g, '.zz-hover').replace(/:focus(-visible)?(?![\w-])/g, '.zz-focus');
      let hit = false;
      try {
        hit = el.matches(emulated);
      } catch {
        hit = false;
      }
      if (!hit) continue;
      const weight = specificity(emulated);
      if (!best || weight > best.weight || (weight === best.weight && order >= best.order)) best = { weight, order, value };
    }
  });
  return best?.value ?? '-';
}

function look(field: Field, variant: 'outline' | 'filled', state: State, css = compiled(field)): Look {
  const { component, element } = FIELDS[field];
  const fixture = TestBed.createComponent(component);
  fixture.componentRef.setInput('variant', variant);
  fixture.componentRef.setInput('error', state.startsWith('error'));
  fixture.componentRef.setInput('disabled', state.startsWith('disabled'));
  if (FIELDS[field].readonly) fixture.componentRef.setInput('readonly', state.startsWith('readonly'));
  fixture.detectChanges();
  const el = (fixture.nativeElement as HTMLElement).querySelector(element) as HTMLElement;
  expect([field, element, el !== null]).toEqual([field, element, true]);
  if (state.includes('hover')) el.classList.add('zz-hover');
  if (state.includes('focus')) el.classList.add('zz-focus');
  const result: Look = [cascade(css, el, 'border'), cascade(css, el, 'background'), cascade(css, el, 'outline')];
  fixture.destroy();
  return result;
}

const sheets = new Map<Field, string>();
function compiled(field: Field): string {
  if (!sheets.has(field)) sheets.set(field, compile(resolve(__dirname, FIELDS[field].scss)).css);
  return sheets.get(field) as string;
}

const v = (token: string) => `var(--color-${token})`;
const F = v('field-border');
const TS = v('text-secondary');
const P = v('primary-500');
const E = v('error-600');
const B = v('border');
const SUN = v('surface-sunken');
const HOV = v('surface-hover');
const S = v('surface');
const S2 = v('surface-2');
const MUT = v('surface-muted');

// [state, filled look, outline look]. Filled: design 044 §4 and D-3 to D-6.
const EXPECTED: Record<Field, [State, Look, Look][]> = {
  select: [
    ['rest', [F, SUN, '-'], [F, S2, '-']],
    ['hover', [TS, HOV, '-'], [TS, S2, '-']],
    ['focus', [P, S, P], [P, S2, P]],
    ['focus+hover', [P, S, P], [P, S2, P]],
    ['error', [E, SUN, '-'], [E, S2, '-']],
    ['error+hover', [E, SUN, '-'], [E, S2, '-']],
    ['error+focus', [E, S, E], [E, S2, E]],
    ['disabled', [B, MUT, '-'], [B, MUT, '-']],
    ['disabled+hover', [B, MUT, '-'], [B, MUT, '-']],
  ],
  textarea: [
    ['rest', [F, SUN, 'none'], [F, S, 'none']],
    ['hover', [TS, HOV, 'none'], [TS, S, 'none']],
    // 3.33 (request 052, 044-n1, AC-14): focus is the 2 px primary ring of
    // lc-select and lc-datepicker (it was a 20 % halo, outline none).
    ['focus', [P, S, P], [P, S, P]],
    ['focus+hover', [P, S, P], [P, S, P]],
    ['error', [E, SUN, 'none'], [E, S, 'none']],
    ['error+hover', [E, SUN, 'none'], [E, S, 'none']],
    ['error+focus', [E, S, E], [E, S, E]],
    ['disabled', [F, MUT, 'none'], [F, MUT, 'none']],
    ['disabled+hover', [F, MUT, 'none'], [F, MUT, 'none']],
    ['readonly', [F, MUT, 'none'], [F, MUT, 'none']],
    ['readonly+hover', [F, MUT, 'none'], [F, MUT, 'none']],
  ],
  datepicker: [
    ['rest', [F, SUN, '-'], [F, S, '-']],
    ['hover', [TS, HOV, '-'], [TS, S, '-']],
    ['focus', [P, S, P], [P, S, P]],
    ['focus+hover', [P, S, P], [P, S, P]],
    ['error', [E, SUN, '-'], [E, S, '-']],
    ['error+hover', [E, SUN, '-'], [E, S, '-']],
    ['error+focus', [E, S, E], [E, S, E]],
    ['disabled', [B, MUT, '-'], [B, MUT, '-']],
    ['disabled+hover', [B, MUT, '-'], [B, MUT, '-']],
    ['readonly', [F, SUN, '-'], [F, MUT, '-']],
    ['readonly+hover', [F, SUN, '-'], [F, MUT, '-']],
  ],
};

describe('Filled field boundary (request 044, F-31)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectComponent, TextareaComponent, DatepickerComponent] }).compileComponents();
  });

  describe.each(Object.keys(FIELDS) as Field[])('lc-%s', (field) => {
    it.each(EXPECTED[field])('AC-8 to AC-10: filled, %s: border, fill and outline', (state, filled) => {
      expect([state, look(field, 'filled', state)]).toEqual([state, filled]);
    });

    it.each(EXPECTED[field])('AC-12: outline (the default), %s: as before', (state, _filled, outline) => {
      expect([state, look(field, 'outline', state)]).toEqual([state, outline]);
    });

    it('AC-8, AC-9: rest and hover border are the 3:1 field tokens; the hover border is never --color-border or transparent', () => {
      const rows = EXPECTED[field];
      const filled = (s: State) => rows.find((r) => r[0] === s)?.[1][0];
      expect([filled('rest'), filled('hover')]).toEqual([F, TS]);
      for (const [state, [border]] of rows) {
        if (!state.startsWith('disabled')) expect([state, border]).not.toEqual([state, B]);
        expect([state, border]).not.toEqual([state, 'transparent']);
      }
    });
  });

  it('AC-10: no filled rule outside forced colours draws a transparent border any more', () => {
    for (const field of Object.keys(FIELDS) as Field[]) {
      const filled = rulesOf(compiled(field)).filter((r) => r.selectors.some((s) => s.includes('--filled')));
      expect(filled.length).toBeGreaterThan(0);
      for (const r of filled) expect([field, r.selectors[0], r.decls.some(([p, val]) => p.startsWith('border') && val.includes('transparent'))]).toEqual([field, r.selectors[0], false]);
    }
  });

  it('D-4: the filled datepicker error rule comes after the filled focus rule, so error wins at rest and on focus', () => {
    const selectors = rulesOf(compiled('datepicker')).flatMap((r) => r.selectors);
    const error = selectors.indexOf('.lc-datepicker.lc-datepicker--filled.lc-datepicker--error');
    expect(error).toBeGreaterThan(selectors.indexOf('.lc-datepicker.lc-datepicker--filled:focus'));
    expect(error).toBeGreaterThan(selectors.indexOf('.lc-datepicker.lc-datepicker--filled'));
  });
});
