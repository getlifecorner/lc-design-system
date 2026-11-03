import { ChangeDetectionStrategy, Component, isSignal, reflectComponentType, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { AppPageComponent, type AppPageContentWidth } from './app-page.component';

/**
 * 3.28 (request 045): `reserveAside` (AS-35) and `contentWidth` with
 * `[page-wide]` children (AS-36) on lc-app-page.
 */
@Component({
  imports: [AppPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-page [asideLabelledby]="labelledby()" [reserveAside]="reserve()" [contentWidth]="width()" [contentMaxWidth]="max()">
      <h1>Konten</h1>
      <div page-wide class="t-wide">Tabelle</div>
      <section page-aside><h2 id="members">Mitglieder</h2></section>
    </lc-app-page>
  `,
})
class WidthHostComponent {
  readonly labelledby = signal('');
  readonly reserve = signal(false);
  readonly width = signal<AppPageContentWidth>('default');
  readonly max = signal('880px');
}

/** The page's own markup without Angular's emulation attributes. */
const markup = (el: Element) => el.outerHTML.replace(/ _ng(?:host|content)-[a-z0-9-]+=""/g, '');

describe('AppPageComponent — reserveAside and contentWidth (3.28, AS-35, AS-36)', () => {
  const source = readFileSync(resolve(__dirname, 'app-page.component.ts'), 'utf-8');
  const css = compile(resolve(__dirname, 'app-page.component.scss')).css;

  beforeEach(() => TestBed.configureTestingModule({ imports: [WidthHostComponent] }));

  function render(setup?: (host: WidthHostComponent) => void) {
    const fixture = TestBed.createComponent(WidthHostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const page = el.querySelector('.lc-app-page') as HTMLElement;
    return { fixture, el, page };
  }

  const classes = (page: HTMLElement) => [...page.classList].sort().join(' ');
  const reservedDiv = (el: HTMLElement) => el.querySelector<HTMLElement>('.lc-app-page__aside--reserved');

  describe('API', () => {
    it('AC-7, AC-12: two optional signal inputs, documented with @default', () => {
      const inputs = reflectComponentType(AppPageComponent)?.inputs.map((i) => i.propName) ?? [];
      expect(inputs).toEqual(expect.arrayContaining(['reserveAside', 'contentWidth']));
      const page = TestBed.createComponent(AppPageComponent).componentInstance;
      expect(isSignal(page.reserveAside)).toBe(true);
      expect(page.reserveAside()).toBe(false);
      expect(page.contentWidth()).toBe('default');
      expect(source).toMatch(/@default false\s*\*\/\s*readonly reserveAside = input\(false\);/);
      expect(source).toMatch(/@default 'default'\s*\*\/\s*readonly contentWidth = input<AppPageContentWidth>\('default'\);/);
      expect(source).toMatch(/export type AppPageContentWidth = 'default' \| 'wide';/);
    });
  });

  describe('AC-10: unchanged defaults', () => {
    it('renders the 3.27.2 DOM without the new inputs: classes, style, one anchor', () => {
      const { page } = render();
      expect(markup(page)).toBe(
        '<div class="lc-app-page" style="--lc-app-page-content-max: 880px;">' +
          '<main class="lc-app-page__main" id="main"><div class="lc-app-page__content"><h1>Konten</h1><div page-wide="" class="t-wide">Tabelle</div></div></main>' +
          '<!--container--></div>',
      );
      expect(page.style.getPropertyValue('--_lc-app-page-wide-max')).toBe('');
    });

    it('keeps a named aside as before: the class, one aside, its name, no reserved column', () => {
      const { el, page } = render((h) => h.labelledby.set('members'));
      expect(classes(page)).toBe('lc-app-page lc-app-page--aside');
      expect(el.querySelectorAll('aside')).toHaveLength(1);
      expect(el.querySelector('aside')?.getAttribute('aria-labelledby')).toBe('members');
      expect(reservedDiv(el)).toBeNull();
      expect(page.getAttribute('style')).toBe('--lc-app-page-content-max: 880px;');
    });
  });

  describe('reserveAside (AS-35)', () => {
    it('AC-7: keeps the column (the aside class and grid) with no content', () => {
      const { el, page } = render((h) => h.reserve.set(true));
      expect(classes(page)).toBe('lc-app-page lc-app-page--aside');
      const column = reservedDiv(el);
      expect(column?.tagName).toBe('DIV');
      expect(column?.className).toBe('lc-app-page__aside lc-app-page__aside--reserved');
      expect(column?.childNodes).toHaveLength(0);
      // After <main>, where the named aside sits.
      expect(column?.previousElementSibling?.tagName).toBe('MAIN');
      // The projected [page-aside] content is not rendered without a name.
      expect(el.querySelector('#members')).toBeNull();
    });

    it('AC-8: aria-hidden, no role, no name, not focusable, no landmark', () => {
      const { el } = render((h) => h.reserve.set(true));
      const column = reservedDiv(el) as HTMLElement;
      expect(column.getAttribute('aria-hidden')).toBe('true');
      expect(column.getAttributeNames().sort()).toEqual(['aria-hidden', 'class']);
      expect(column.tabIndex).toBe(-1);
      expect(el.querySelectorAll('aside, [role="complementary"]')).toHaveLength(0);
    });

    it('AC-9: a named aside wins: one real landmark with its content', () => {
      const { el, page } = render((h) => {
        h.reserve.set(true);
        h.labelledby.set('members');
      });
      expect(classes(page)).toBe('lc-app-page lc-app-page--aside');
      expect(el.querySelectorAll('aside')).toHaveLength(1);
      expect(el.querySelector('aside #members')).toBeTruthy();
      expect(reservedDiv(el)).toBeNull();
    });

    it('AC-7, AC-9, AC-11: shares the named aside\'s rules (hidden below 1280 px, column, tint, forced colours)', () => {
      // No rule of its own: every declaration comes from `.lc-app-page__aside`.
      expect(css).not.toMatch(/__aside--reserved/);
      expect(css).toMatch(/(^|\n)\.lc-app-page__aside \{\s*display: none;/);
      expect(css).toMatch(/@media \(min-width: 1280px\) \{[^@]*\.lc-app-page--aside \{\s*grid-template-columns: minmax\(0, 1fr\) var\(--_aside-width\);/);
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-app-page__aside \{\s*background: none;\s*border-image: none;\s*border-left-color: CanvasText;/);
      // The shell paints the header row's part for any `.lc-app-page__aside`.
      const shell = readFileSync(resolve(__dirname, 'app-shell.component.scss'), 'utf-8');
      expect(shell).toMatch(/\.lc-app-shell:has\(\.lc-app-page__aside\) > \.lc-app-shell__header \{/);
    });
  });

  describe('contentWidth (AS-36)', () => {
    it('AC-13: "wide" takes the right column\'s grid but renders nothing in it (no tint, no landmark)', () => {
      const { el, page } = render((h) => h.width.set('wide'));
      expect(classes(page)).toBe('lc-app-page lc-app-page--aside lc-app-page--wide');
      expect(el.querySelectorAll('aside, .lc-app-page__aside')).toHaveLength(0);
      // reserveAside on a wide page: the column stays empty and untinted.
      const both = render((h) => {
        h.width.set('wide');
        h.reserve.set(true);
      });
      expect(classes(both.page)).toBe('lc-app-page lc-app-page--aside lc-app-page--wide');
      expect(both.el.querySelectorAll('aside, .lc-app-page__aside')).toHaveLength(0);
    });

    it('AC-15: yields to a named aside: no wide class, no wide cap, the aside with its content', () => {
      const { el, page } = render((h) => {
        h.width.set('wide');
        h.labelledby.set('members');
        h.max.set('1000px');
      });
      expect(classes(page)).toBe('lc-app-page lc-app-page--aside');
      expect(page.style.getPropertyValue('--_lc-app-page-wide-max')).toBe('');
      const aside = el.querySelector('aside') as HTMLElement;
      expect(aside.querySelector('#members')).toBeTruthy();
      // DOM order: main, then the aside.
      expect(aside.previousElementSibling?.tagName).toBe('MAIN');
    });

    it.each([
      ['880px', ''],
      ['1000px', '1000px'],
      ['60rem', '60rem'],
      ['none', '100vw'],
    ])('AC-16: contentMaxWidth %s gives the wide cap "%s" and stays the one content cap', (max, wideMax) => {
      const { page } = render((h) => {
        h.width.set('wide');
        h.max.set(max);
      });
      expect(page.style.getPropertyValue('--_lc-app-page-wide-max')).toBe(wideMax);
      expect(page.style.getPropertyValue('--lc-app-page-content-max')).toBe(max);
    });

    it('AC-16: "default" never sets the wide cap', () => {
      const { page } = render((h) => h.max.set('1000px'));
      expect(page.style.getPropertyValue('--_lc-app-page-wide-max')).toBe('');
      expect(page.getAttribute('style')).toBe('--lc-app-page-content-max: 1000px;');
    });

    it('AC-13, AC-14, AC-16: only [page-wide] children of a wide page widen, from 1280 px, up to 928 px', () => {
      const rule = /@media \(min-width: 1280px\) \{\s*:host ::ng-deep \.lc-app-page--wide > \.lc-app-page__main > \.lc-app-page__content > \[page-wide\] \{([^}]*)\}/.exec(css)?.[1] ?? '';
      expect(rule).toMatch(/box-sizing: border-box;/);
      // Sass drops the calc() inside min(); `100% + …` is a valid min() argument.
      expect(rule).toMatch(/width: min\(var\(--_lc-app-page-wide-max, 928px\), 100% \+ var\(--_aside-width\)\);/);
      expect(rule).toMatch(/max-width: none;/);
      // The only [page-wide] rule, so below 1280 px wide renders like default.
      expect(css.match(/\[page-wide\]/g)).toHaveLength(1);
      // The content cap is unchanged.
      expect(css).toMatch(/max-width: var\(--lc-app-page-content-max, 880px\);/);
    });
  });
});
