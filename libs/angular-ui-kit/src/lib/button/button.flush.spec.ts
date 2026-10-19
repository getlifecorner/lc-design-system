import { ChangeDetectionStrategy, Component, isSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ButtonComponent } from './button.component';
import { ButtonLinkComponent } from './button-link.component';

/**
 * `flush` on lc-button and a[lcButton] (3.9, AS-26, request 006): a link that
 * sits flush with the content edge and keeps its height and 44 px target.
 * jsdom applies no stylesheets, so the rules are read from the compiled CSS.
 */
const css = '\n' + compile(resolve(__dirname, 'button.component.scss')).css;

/** The declarations of the rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start + selector.length + 3, css.indexOf('}', start)).trim();
}

@Component({
  imports: [ButtonComponent, ButtonLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-button variant="link" size="lg" [flush]="flush()">Code erneut senden</lc-button>
    <a lcButton variant="link" size="lg" [flush]="flush()" href="#code">Code erneut senden</a>
    <lc-button variant="link" size="lg" class="t-plain">Ohne flush</lc-button>
    <a lcButton variant="link" size="lg" class="t-plain" href="#ohne">Ohne flush</a>
  `,
})
class HostComponent {
  readonly flush = signal(true);
}

describe('flush link buttons (AS-26)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function render(flush = true) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.flush.set(flush);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      button: el.querySelector('lc-button:not(.t-plain) button') as HTMLButtonElement,
      link: el.querySelector('a[lcButton]:not(.t-plain)') as HTMLAnchorElement,
      plainButton: el.querySelector('lc-button.t-plain button') as HTMLButtonElement,
      plainLink: el.querySelector('a[lcButton].t-plain') as HTMLAnchorElement,
    };
  }

  describe('the input', () => {
    it.each([
      ['lc-button', ButtonComponent, 'button.component.ts'],
      ['a[lcButton]', ButtonLinkComponent, 'button-link.component.ts'],
    ] as const)('%s: an optional boolean signal input, false by default, documented with @default false', (_, type, file) => {
      const instance = TestBed.createComponent(type).componentInstance;
      expect(isSignal(instance.flush)).toBe(true);
      expect(instance.flush()).toBe(false);
      const source = readFileSync(resolve(__dirname, file), 'utf-8');
      // The JSDoc right above the input, as one line of text (wrapping-independent).
      const jsdoc = /\/\*\*((?:(?!\*\/)[^])*)\*\/\s*readonly flush = input\(false\);/.exec(source)?.[1] ?? '';
      const text = jsdoc.replace(/\s*\n\s*\*\s?/g, ' ').trim();
      expect(text).toMatch(/Ignored on other variants and with `iconOnly` \(3\.9, AS-26\)\. @default false$/);
      // Rev. 1 (review 006 finding 1): the end-edge hook is documented on the input.
      expect(text).toContain('`--lc-btn-flush-align: end` (default `start`)');
    });

    it('AC-12: adds btn-flush to the <button> and to the anchor', () => {
      const { button, link } = render(true);
      expect(button.classList).toContain('btn-flush');
      expect(link.classList).toContain('btn-flush');
    });

    it('AC-14: without flush the classes are exactly as before', () => {
      const { button, link, plainButton, plainLink } = render(false);
      const classes = (node: Element) => [...node.classList].sort();
      expect(classes(button)).toEqual(['btn', 'btn-lg', 'btn-link']);
      expect(classes(link)).toEqual(['btn', 'btn-lg', 'btn-link']);
      expect(classes(plainLink)).toEqual(['btn', 'btn-lg', 'btn-link', 't-plain']);
      expect(classes(plainButton)).toEqual(['btn', 'btn-lg', 'btn-link']);
    });

    it('AC-13: keeps the native element, its role and the button states', () => {
      const { button, link } = render(true);
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('#code');
    });
  });

  describe('stylesheet', () => {
    const flush = '.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)';

    it('AC-12: drops only the inline padding and keeps a 44 × 44 px minimum box', () => {
      const body = rule(flush);
      expect(body).toMatch(/padding-inline:\s*0;/);
      expect(body).not.toMatch(/padding(-block|-top|-bottom)?:/);
      expect(body).toMatch(/min-width:\s*var\(--size-min-touch-width, 2\.75rem\);/);
      expect(body).toMatch(/min-height:\s*var\(--size-min-touch-height, 2\.75rem\);/);
    });

    it('AC-12: starts the label and every wrapped line at the edge; --lc-btn-flush-align (default start) picks the edge', () => {
      const body = rule(flush);
      // Both declarations read the same hook, so `end` moves the box content and every line.
      expect(body).toMatch(/justify-content:\s*var\(--lc-btn-flush-align, start\);/);
      expect(body).toMatch(/text-align:\s*var\(--lc-btn-flush-align, start\);/);
      expect(body).not.toMatch(/justify-content:\s*flex-start|text-align:\s*start/);
      // The hook is only read by the flush rule.
      expect(css.match(/--lc-btn-flush-align/g)).toHaveLength(2);
    });

    it('AC-13: shapes the focus ring with the small radius; the ring itself is the shared one', () => {
      expect(rule(flush)).toMatch(/border-radius:\s*var\(--border-radius-sm\);/);
      expect(rule('.btn:focus-visible')).toMatch(/outline:\s*2px solid var\(--color-primary-500\);[^]*outline-offset:\s*2px;/);
      // No rule takes the ring, the hover underline or the colours away from a flush link.
      expect(css.match(/^[^{}\n]*btn-flush[^{}\n]*(?= \{)/gm)).toEqual([flush]);
    });

    it('outranks the size classes (0,3,0) and comes after them', () => {
      expect(css.indexOf(`\n${flush} {`)).toBeGreaterThan(css.indexOf('\n.btn-lg {'));
      expect(css.indexOf(`\n${flush} {`)).toBeGreaterThan(css.indexOf('\n.btn-inline {'));
    });

    it('AC-14: the sizes and the link variant are unchanged (lg keeps 12 px / 24 px)', () => {
      expect(rule('.btn-lg')).toBe('padding: var(--spacing-3) var(--spacing-6);\n  font-size: var(--font-size-lg);');
      expect(rule('.btn-link')).toMatch(/padding:\s*0;/);
    });
  });
});
