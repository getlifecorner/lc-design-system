import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { join } from 'path';
import { compile } from 'sass';
import { IconComponent } from '../icon/icon.component';
import { AlertActionsLayout, AlertComponent } from './alert.component';

/**
 * 3.13.1 (request 018, G-WL4): lc-alert in a narrow container. In
 * `lc-next-step-card` `[slot='body']` at 320 px and 200 % text the alert is
 * 123 px wide and long words ran past it. Every alert is now a size container;
 * below 16rem inside the border a narrow layout (TD-1) applies, with word
 * breaking. jsdom has no container queries, so this pins the compiled rules
 * and the unchanged DOM; the boxes are measured in the browser (build.md).
 */
@Component({
  imports: [AlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-alert variant="error" [title]="title()" message="Wir haben nichts gespeichert." [actionsLayout]="layout()" [dismissible]="true">
      <a slot="action" href="mailto:kontakt@beispiel.example">kontakt@beispiel.example</a>
    </lc-alert>
  `,
})
class NarrowHostComponent {
  readonly title = signal<string | undefined>('Nicht eingetragen');
  readonly layout = signal<AlertActionsLayout>('inline');
}

describe('AlertComponent 3.13.1: narrow container (G-WL4)', () => {
  const css = compile(join(__dirname, 'alert.component.scss'), {
    loadPaths: [join(__dirname, '../../styles')],
  }).css;

  /** The first top-level rule with exactly this selector (the base rule). */
  const baseRule = (selector: string): string => {
    const text = `\n${css}`;
    const at = text.indexOf(`\n${selector} {`);
    return at < 0 ? '' : text.slice(at, text.indexOf('}', at) + 1);
  };

  /** The whole `@container` block that starts with `prelude`, nested rules included. */
  const containerBlock = (prelude: string): string => {
    const at = css.indexOf(prelude);
    if (at < 0) return '';
    let depth = 0;
    for (let i = css.indexOf('{', at); i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1);
    }
    return '';
  };

  /**
   * A rule inside `block` whose selector list is exactly `selector` (the text
   * before it ends a rule or opens the block, so `.a,\n  .b {` is no `.b` rule).
   */
  const ruleIn = (block: string, selector: string): string => {
    for (let at = block.indexOf(`  ${selector} {`); at >= 0; at = block.indexOf(`  ${selector} {`, at + 1)) {
      if (/[{}]$/.test(block.slice(0, at).trimEnd())) return block.slice(at, block.indexOf('}', at) + 1);
    }
    return '';
  };

  const NARROW = '@container lc-alert (width < 16rem)';
  const narrow = containerBlock(NARROW);

  describe('every alert is a size container (AC-4, AC-6)', () => {
    it('puts the container on the base .lc-alert rule, next to the full-width block', () => {
      const rule = baseRule('.lc-alert');
      expect(rule).toMatch(/display:\s*block;/);
      expect(rule).toMatch(/width:\s*100%;/);
      expect(rule).toMatch(/container:\s*lc-alert\s*\/\s*inline-size;/);
    });
  });

  describe('AC-1: long words break inside the narrow layout', () => {
    it('has the narrow query on the alert width, in rem (follows the root text size)', () => {
      expect(narrow).not.toBe('');
      expect(css.match(/@container lc-alert \(width < 16rem\)/g)).toHaveLength(1);
    });

    it('gives title and content overflow-wrap: break-word and hyphens: auto there', () => {
      const rule = ruleIn(narrow, '.lc-alert__title,\n  .lc-alert__content');
      expect(rule).toMatch(/overflow-wrap:\s*break-word;/);
      expect(rule).toMatch(/hyphens:\s*auto;/);
    });

    it('keeps the text column shrinkable: .lc-alert__body { flex: 1; min-width: 0 } unchanged', () => {
      expect(baseRule('.lc-alert__body')).toMatch(/\{\s*flex:\s*1;\s*min-width:\s*0;\s*\}/);
    });

    it('wide layout unchanged (R3): no word breaking outside the narrow query', () => {
      const outside = css.replace(narrow, '');
      expect(outside).not.toMatch(/hyphens/);
      expect(outside).not.toMatch(/\soverflow-wrap:\s*break-word/);
    });
  });

  describe('AC-4: the narrow layout (TD-1)', () => {
    it('makes the container a wrapping row with one density step less padding (tokens only)', () => {
      const rule = ruleIn(narrow, '.lc-alert__container');
      expect(rule).toMatch(/flex-wrap:\s*wrap;/);
      expect(rule).toMatch(/column-gap:\s*var\(--spacing-3\);/);
      expect(rule).toMatch(/row-gap:\s*var\(--spacing-1\);/);
      expect(rule).toMatch(/padding:\s*var\(--lc-density-padding-sm, var\(--spacing-3\)\);/);
      const declarations = narrow.slice(narrow.indexOf('{'));
      expect(declarations).not.toMatch(/\d(px|rem)\s*[;)]/);
      expect(declarations).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    });

    it('dissolves the body, so the icon and the title share the first row', () => {
      expect(ruleIn(narrow, '.lc-alert__body')).toMatch(/display:\s*contents;/);
      const title = ruleIn(narrow, '.lc-alert__title');
      expect(title).toMatch(/flex:\s*1 1 0%;/);
      expect(title).toMatch(/max-width:\s*100%;/);
      expect(title).toMatch(/margin-bottom:\s*0;/);
    });

    it('puts the message on its own full-width row, or beside the icon when there is no title', () => {
      expect(ruleIn(narrow, '.lc-alert__content')).toMatch(/order:\s*1;\s*flex:\s*1 1 100%;\s*min-width:\s*0;/);
      expect(ruleIn(narrow, '.lc-alert__content:first-child')).toMatch(
        /order:\s*0;\s*flex:\s*1 1 0%;\s*min-width:\s*auto;\s*max-width:\s*100%;/,
      );
    });

    it('starts every action layout at the inner edge, with a selector that beats the 3.3 and 3.12 rules', () => {
      const rule = ruleIn(
        narrow,
        '.lc-alert.lc-alert .lc-alert__container > .lc-alert__action.lc-alert__action.lc-alert__action',
      );
      expect(rule).toMatch(/order:\s*1;/);
      expect(rule).toMatch(/flex:\s*1 1 100%;/);
      expect(rule).toMatch(/max-width:\s*none;/);
      expect(rule).toMatch(/margin-top:\s*var\(--spacing-3\);/);
      expect(rule).toMatch(/padding-inline-start:\s*0;/);
      expect(rule).toMatch(/--lc-btn-overflow-wrap:\s*anywhere;/);
    });

    it('caps the link min-width at the line and pushes the × to the row end, after the base rules (R2)', () => {
      expect(ruleIn(narrow, '.lc-alert__action > a:where(:not(.btn))')).toMatch(
        /min-width:\s*min\(var\(--size-min-touch-width\), 100%\);/,
      );
      expect(ruleIn(narrow, '.lc-alert__close')).toMatch(/margin-inline-start:\s*auto;/);
      expect(css.indexOf(NARROW)).toBeGreaterThan(css.indexOf('\n.lc-alert__close {'));
      expect(css.indexOf(NARROW)).toBeGreaterThan(css.indexOf('\n.lc-alert__action > a:where(:not(.btn)) {'));
    });

    it('adds no motion and no forced-colours override (AC-8)', () => {
      expect(narrow).not.toMatch(/transition|animation|forced-color/);
    });
  });

  describe('default rendering unchanged (AC-7)', () => {
    it('keeps the wide 3.13 rules for container, title and content', () => {
      expect(baseRule('.lc-alert__container')).toMatch(
        /\{\s*display:\s*flex;\s*align-items:\s*flex-start;\s*gap:\s*var\(--spacing-3\);\s*padding:\s*var\(--lc-density-padding-md, var\(--spacing-4\)\);\s*\}/,
      );
      expect(baseRule('.lc-alert__title')).toMatch(
        /\{\s*font-weight:\s*var\(--font-weight-semibold\);\s*font-size:\s*var\(--font-size-sm\);\s*line-height:\s*var\(--line-height-tight\);\s*margin-bottom:\s*var\(--spacing-1\);\s*\}/,
      );
      expect(baseRule('.lc-alert__content')).toMatch(
        /\{\s*font-size:\s*var\(--font-size-sm\);\s*line-height:\s*var\(--line-height-normal\);\s*\}/,
      );
    });
  });

  describe('AC-9: DOM order and roles unchanged', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NarrowHostComponent],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
      }).compileComponents();
    });

    let fixture: ComponentFixture<NarrowHostComponent>;

    function render(title: string | undefined, layout: AlertActionsLayout = 'inline'): HTMLElement {
      fixture = TestBed.createComponent(NarrowHostComponent);
      fixture.componentInstance.title.set(title);
      fixture.componentInstance.layout.set(layout);
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('lc-alert');
    }

    const order = (alert: HTMLElement): string[] =>
      Array.from(
        alert.querySelectorAll(
          '.lc-alert__icon, .lc-alert__body, .lc-alert__title, .lc-alert__content, .lc-alert__action, .lc-alert__close',
        ),
      ).map((el) => el.className);

    it.each<AlertActionsLayout>(['inline', 'stacked'])('%s: icon, body (title, content), action, close', (layout) => {
      const alert = render('Nicht eingetragen', layout);
      expect(order(alert)).toEqual([
        'lc-alert__icon',
        'lc-alert__body',
        'lc-alert__title',
        'lc-alert__content',
        'lc-alert__action',
        'lc-alert__close',
      ]);
      expect(alert.getAttribute('role')).toBe('alert');
      expect(alert.getAttribute('aria-live')).toBe('assertive');
      const icon = fixture.debugElement.query(By.css('.lc-alert__icon lc-icon')).componentInstance as IconComponent;
      expect(icon.decorative()).toBe(true);
    });

    it('without a title the content is the first child of the body (the :first-child rule)', () => {
      const alert = render(undefined);
      const body = alert.querySelector('.lc-alert__body') as HTMLElement;
      expect(body.firstElementChild?.className).toBe('lc-alert__content');
      expect(order(alert)).toEqual([
        'lc-alert__icon',
        'lc-alert__body',
        'lc-alert__content',
        'lc-alert__action',
        'lc-alert__close',
      ]);
    });

    it('keeps the host classes: no new class for the narrow layout', () => {
      expect(render('Nicht eingetragen').className).toBe('lc-alert lc-alert--error lc-alert--with-icon');
    });
  });
});
