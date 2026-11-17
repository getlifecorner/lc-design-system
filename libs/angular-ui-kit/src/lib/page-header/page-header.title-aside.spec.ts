import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { compile } from 'sass';
import { join } from 'path';
import { PageHeaderComponent } from './page-header.component';
import { computedName } from '../../testing/axe-jsdom';

@Component({
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-page-header title="Rechnungsübersicht" [level]="level()" overline="Arbeitsbereich">
      <span slot="title-aside" class="chip">Entwurf</span>
      <span slot="title-aside" role="status">Geändert</span>
      <span slot="title-suffix" class="suffix">Beta</span>
      <button slot="actions">Teilen</button>
    </lc-page-header>
  `,
})
class AsideHostComponent {
  readonly level = signal<1 | 2 | 3>(1);
}

@Component({
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-page-header title="Rechnungsübersicht"><button slot="actions">Teilen</button></lc-page-header>`,
})
class PlainHostComponent {}

/** Request 064 (3.44): usm-x rows 16 and 25 (AC-8…11). */
describe('lc-page-header title-aside and hooks (3.44)', () => {
  it.each([1, 2, 3] as const)('AC-9: title-aside is beside the h%s, outside it: the heading is named by the title (and suffix) only', (level) => {
    const fixture = TestBed.createComponent(AsideHostComponent);
    fixture.componentInstance.level.set(level);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector(`h${level}.lc-page-header__title`) as HTMLElement;
    const aside = el.querySelector('.lc-page-header__title-aside') as HTMLElement;
    expect(heading.contains(aside)).toBe(false);
    expect(aside.querySelector('[role="status"]')?.textContent).toBe('Geändert');
    expect(aside.parentElement).toBe(heading.parentElement);
    // The overline stays the heading's next sibling (3.3); the aside follows it.
    expect(heading.nextElementSibling?.classList).toContain('lc-page-header__overline');
    expect(heading.nextElementSibling?.nextElementSibling).toBe(aside);
    // title-suffix keeps its place inside the heading.
    expect(heading.querySelector('.suffix')?.textContent).toBe('Beta');
    expect(computedName(el, heading).replace(/\s+/g, ' ').trim()).toBe('Rechnungsübersicht Beta');
  });

  it('AC-9: renders an empty aside without projected content (hidden by CSS :empty)', () => {
    const fixture = TestBed.createComponent(PlainHostComponent);
    fixture.detectChanges();
    const aside = (fixture.nativeElement as HTMLElement).querySelector('.lc-page-header__title-aside') as HTMLElement;
    expect(aside.childNodes).toHaveLength(0);
  });

  describe('stylesheet', () => {
    const css = '\n' + compile(join(__dirname, 'page-header.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('AC-9/AC-11: the aside is a wrapping chip row whose order and line come from the hook (default 0); empty hides it', () => {
      expect(rule('.lc-page-header__title-aside')).toBe(
        'display: inline-flex; flex-wrap: wrap; align-items: center; gap: var(--lc-density-gap-sm, 0.5rem); ' +
          'order: var(--lc-page-header-title-aside-below, 0); min-inline-size: calc(var(--lc-page-header-title-aside-below, 0) * 100%);',
      );
      expect(rule('.lc-page-header__title-aside:empty')).toBe('display: none;');
    });

    it('AC-8/AC-10: the hooks are read, never declared', () => {
      expect(css).not.toMatch(/--lc-page-header-(overline-color|title-font-size|title-aside-below):/);
      expect(css.match(/var\(--lc-page-header-title-font-size, /g)).toHaveLength(7);
      expect(rule('.lc-page-header--size-default .lc-page-header__title')).toBe(
        'font-size: var(--lc-page-header-title-font-size, var(--font-size-2xl, 1.5rem));',
      );
    });
  });
});
