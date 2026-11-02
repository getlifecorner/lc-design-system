import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { AccordionComponent, AccordionVariant } from './accordion.component';

/**
 * `variant="plain"` on lc-accordion (3.23, BA-9, request 035): no border,
 * background or inline inset, so the title, chevron and body line up with the
 * content edge around them; the hover background and focus ring sit on a
 * `::before` bleed box. jsdom applies no stylesheets, so the rules are read
 * from the compiled CSS (design.md §3–§6).
 */
const css = compile(resolve(__dirname, 'accordion.component.scss')).css;
const PLAIN_BLOCK = '\n.lc-accordion--plain {';

/** The declarations of the top-level rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const text = '\n' + css;
  const start = text.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return text.slice(start + selector.length + 3, text.indexOf('}', start)).trim();
}

/** Position of a top-level rule, to prove the plain rules come after the size rules. */
function at(selector: string): number {
  const index = ('\n' + css).indexOf(`\n${selector} {`);
  expect(index).toBeGreaterThan(-1);
  return index;
}

/** The body of the `@media <query>` block. */
function media(query: string): string {
  const start = css.indexOf(`@media ${query} {`);
  expect(start).toBeGreaterThan(-1);
  const end = css.indexOf('\n}', start);
  return css.slice(start, end + 2);
}

const sizes = ['sm', 'md', 'lg'] as const;

@Component({
  imports: [AccordionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-accordion
      [variant]="variant()"
      [size]="size()"
      [chevronPosition]="chevron()"
      [headingLevel]="level()"
      title="Herkunft und Abrufzeitpunkt der Buchung"
      [(expanded)]="open"
    >
      <p class="body-text">Quelle: Sparkasse KölnBonn (FinTS)</p>
    </lc-accordion>
  `,
})
class HostComponent {
  readonly variant = signal<AccordionVariant>('plain');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly chevron = signal<'leading' | 'trailing'>('trailing');
  readonly level = signal<1 | 2 | 3 | 4 | 5 | 6>(3);
  readonly open = signal(false);
}

describe('lc-accordion variant="plain" (3.23, BA-9)', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function render(values: Partial<{ variant: AccordionVariant; size: 'sm' | 'md' | 'lg'; chevron: 'leading' | 'trailing'; open: boolean }> = {}) {
    fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    if (values.variant) host.variant.set(values.variant);
    if (values.size) host.size.set(values.size);
    if (values.chevron) host.chevron.set(values.chevron);
    if (values.open !== undefined) host.open.set(values.open);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      root: el.querySelector('lc-accordion > div') as HTMLElement,
      button: el.querySelector('.lc-accordion__header') as HTMLButtonElement,
      panel: el.querySelector('.lc-accordion__panel') as HTMLElement,
    };
  }

  const classes = (node: Element) => [...node.classList].sort();

  describe('the input', () => {
    it('AC-13: variant is typed AccordionVariant, outlined by default, and documents plain with @default', () => {
      const values: readonly AccordionVariant[] = ['outlined', 'flat', 'plain'];
      expect(values).toHaveLength(3);
      expect(TestBed.createComponent(AccordionComponent).componentInstance.variant()).toBe('outlined');
      const source = readFileSync(resolve(__dirname, 'accordion.component.ts'), 'utf-8');
      expect(source).toContain("export type AccordionVariant = 'outlined' | 'flat' | 'plain';");
      // The JSDoc right above the input, as one line of text (wrapping-independent).
      const jsdoc = /\/\*\*((?:(?!\*\/)[^])*)\*\/\s*readonly variant = input<AccordionVariant>\('outlined'\);/.exec(source)?.[1] ?? '';
      const text = jsdoc.replace(/\s*\n\s*\*\s?/g, ' ').trim();
      expect(text).toContain("`'plain'`: no border, background or inline inset");
      expect(text).toContain('reach 8 px past that edge (`--lc-accordion-header-bleed`)');
      expect(text).toMatch(/@default 'outlined'$/);
    });

    it.each(sizes)('AC-1: plain at %s sets lc-accordion--plain, neither flat nor outlined', (size) => {
      const { root } = render({ size });
      expect(classes(root)).toEqual(['lc-accordion', 'lc-accordion--chevron-trailing', `lc-accordion--${size}`, 'lc-accordion--plain'].sort());
    });

    it('AC-8: the default and flat classes are exactly as before', () => {
      const outlined = render({ variant: 'outlined' }).root;
      expect(classes(outlined)).toEqual(['lc-accordion', 'lc-accordion--chevron-trailing', 'lc-accordion--md', 'lc-accordion--outlined']);
      const flat = render({ variant: 'flat', size: 'lg', open: true }).root;
      expect(classes(flat)).toEqual(['lc-accordion', 'lc-accordion--chevron-trailing', 'lc-accordion--expanded', 'lc-accordion--flat', 'lc-accordion--lg']);
    });
  });

  describe('AC-9: keyboard and semantics are unchanged in plain', () => {
    it('toggles with Enter and Space, keeps the heading, aria wiring and the inert collapsed panel', () => {
      const { button, panel } = render();
      const heading = button.parentElement as HTMLElement;
      expect(heading.getAttribute('role')).toBe('heading');
      expect(heading.getAttribute('aria-level')).toBe('3');
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel.hasAttribute('inert')).toBe(true);

      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(true);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(panel.hasAttribute('inert')).toBe(false);
      expect(classes(button.closest('.lc-accordion') as Element)).toContain('lc-accordion--expanded');

      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel.hasAttribute('inert')).toBe(true);
    });

    it('AC-4: keeps the chevron after the title, and the leading modifier with chevronPosition="leading"', () => {
      const trailing = render();
      expect(trailing.button.lastElementChild?.classList).toContain('lc-accordion__icon');
      expect(render({ chevron: 'leading' }).root.classList).toContain('lc-accordion--chevron-leading');
    });
  });

  describe('stylesheet', () => {
    it('AC-8: everything before the plain block is the 3.22.4 stylesheet, and every later rule targets plain only', () => {
      const cut = css.indexOf(PLAIN_BLOCK);
      expect(cut).toBeGreaterThan(-1);
      // Compiled CSS of accordion.component.scss at 3.22.4 (af12033): 3873 characters.
      const before = css.slice(0, cut).trimEnd();
      expect(before.length).toBe(3873);
      expect(createHash('sha1').update(before).digest('hex')).toBe('ad615247dbf5a56f1b282a860f7d1ce27fcad2c9');
      expect(before).not.toContain('plain');
      // Every selector after the cut (media blocks included) starts with .lc-accordion--plain.
      const selectors = css
        .slice(cut)
        .match(/[^{}]+(?=\{)/g)
        ?.filter((s) => !s.trim().startsWith('@media'))
        .flatMap((s) => s.split(','))
        .map((s) => s.trim());
      expect(selectors?.length).toBeGreaterThan(0);
      expect(selectors?.filter((s) => !s.startsWith('.lc-accordion--plain'))).toEqual([]);
    });

    it('AC-1: the plain container drops border, background and the clipping', () => {
      expect(rule('.lc-accordion--plain')).toBe('border: none;\n  background: transparent;\n  overflow: visible;');
    });

    it.each([
      ['sm', '0.625rem 0'],
      ['md', '0.875rem 0'],
      ['lg', '1.125rem 0'],
    ] as const)('AC-1: the %s header has block padding only, and the padding hook still wins', (size, padding) => {
      const selector = `.lc-accordion--plain.lc-accordion--${size} .lc-accordion__header`;
      expect(rule(selector)).toBe(`padding: var(--lc-accordion-header-padding, ${padding});`);
      // One class more than the size rule, and after it.
      expect(at(selector)).toBeGreaterThan(at(`.lc-accordion--${size} .lc-accordion__header`));
    });

    it('AC-1, AC-6: the collapsed body has no padding at any size, so its inline start never moves', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__body')).toBe('padding: 0;\n  overflow-x: visible;\n  overflow-y: clip;');
      // Same weight as the collapsed size rules (0,2,0) and after them.
      expect(at('.lc-accordion--plain .lc-accordion__body')).toBeGreaterThan(at('.lc-accordion--sm .lc-accordion__body'));
      expect(at('.lc-accordion--plain .lc-accordion__body')).toBeGreaterThan(at('.lc-accordion--lg .lc-accordion__body'));
    });

    it.each([
      ['sm', '0.625rem 0 0.75rem', '.lc-accordion--sm.lc-accordion--expanded .lc-accordion__body'],
      ['md', '0.875rem 0 1rem', '.lc-accordion--expanded .lc-accordion__body'],
      ['lg', '1rem 0 1.25rem', '.lc-accordion--lg.lc-accordion--expanded .lc-accordion__body'],
    ] as const)('AC-1, AC-6: the expanded %s body has block padding only, and the body hook still wins', (size, padding, sizeRule) => {
      const selector = `.lc-accordion--plain.lc-accordion--${size}.lc-accordion--expanded .lc-accordion__body`;
      expect(rule(selector)).toBe(`padding: var(--lc-accordion-body-padding, ${padding});`);
      expect(at(selector)).toBeGreaterThan(at(sizeRule));
    });

    it('AC-3: the header keeps 44 px at every size; the hooks paint the bleed box, not the button', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__header')).toBe(
        'position: relative;\n  isolation: isolate;\n  min-height: var(--size-min-touch-height, 2.75rem);\n  background: transparent;\n  border: none;',
      );
    });

    it('AC-4: the chevron gap and order are the shared ones (12 px), no plain rule moves the chevron', () => {
      expect(rule('.lc-accordion__header')).toContain('gap: 0.75rem;');
      expect(rule('.lc-accordion--chevron-leading .lc-accordion__icon')).toBe('order: -1;');
      expect(css.slice(css.indexOf(PLAIN_BLOCK)).match(/^\.lc-accordion--plain[^{\n]*__icon[^{\n]*\{/gm)).toBeNull();
    });

    it('AC-5, AC-7: the bleed box reaches --lc-accordion-header-bleed (default 8 px) past the text, behind it', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__header::before')).toBe(
        [
          'content: "";',
          'position: absolute;',
          'inset-block: 0;',
          'inset-inline: calc(-1 * var(--lc-accordion-header-bleed, var(--spacing-2)));',
          'z-index: -1;',
          'border: var(--lc-accordion-header-border, none);',
          'border-radius: var(--border-radius-md);',
          'background: var(--lc-accordion-header-bg, transparent);',
          'transition: background-color 150ms ease;',
        ].join('\n  '),
      );
      // Read at the use site only, never declared on the host (ancestor-settable).
      expect(css.match(/--lc-accordion-header-bleed/g)).toHaveLength(1);
      expect(css).not.toMatch(/--lc-accordion-header-bleed\s*:/);
    });

    it('AC-7: hover fills the bleed box; the button itself stays transparent', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__header:hover::before')).toBe(
        'background-color: var(--lc-accordion-header-hover-bg, var(--color-surface-hover));',
      );
      expect(rule('.lc-accordion--plain .lc-accordion__header:hover')).toBe('background-color: transparent;');
    });

    it('AC-5: the 2 px ring is drawn on the bleed box, not on the button; Highlight in forced colours', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__header:focus-visible')).toBe('outline: none;');
      expect(rule('.lc-accordion--plain .lc-accordion__header:focus-visible::before')).toBe(
        'outline: 2px solid var(--color-primary);\n  outline-offset: -2px;',
      );
      // The other variants keep today's ring on the button.
      expect(rule('.lc-accordion__header:focus-visible')).toBe(
        'outline: 2px solid var(--color-primary);\n  outline-offset: -2px;\n  border-radius: var(--border-radius-md);',
      );
      expect(media('(forced-colors: active)')).toMatch(
        /\n {2}\.lc-accordion--plain \.lc-accordion__header:focus-visible::before \{\n {4}outline-color: Highlight;\n {2}\}/,
      );
    });

    it('AC-7: with reduced motion the plain header, bleed box, chevron, panel and body run no transition', () => {
      const block = media('(prefers-reduced-motion: reduce)');
      const list = block.slice(block.indexOf('{') + 1, block.indexOf('{', block.indexOf('{') + 1));
      expect(list.split(',').map((s) => s.trim())).toEqual([
        '.lc-accordion--plain .lc-accordion__header',
        '.lc-accordion--plain .lc-accordion__header::before',
        '.lc-accordion--plain .lc-accordion__icon',
        '.lc-accordion--plain .lc-accordion__panel',
        '.lc-accordion--plain .lc-accordion__body',
      ]);
      expect(block).toMatch(/\{\n {4}transition: none;\n {2}\}/);
    });

    it('AC-5, AC-6: the panel still clips the collapse vertically but not the rings at the inline edges', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__panel')).toBe('overflow-x: visible;\n  overflow-y: clip;');
    });

    it('AC-10: a long German title wraps inside the header and hyphenates long compounds', () => {
      expect(rule('.lc-accordion--plain .lc-accordion__title')).toBe(
        'min-width: 0;\n  overflow-wrap: break-word;\n  hyphens: auto;\n  hyphenate-limit-chars: 12 4 3;\n  text-align: start;',
      );
    });
  });
});
