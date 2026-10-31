import { ChangeDetectionStrategy, Component, reflectComponentType, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent } from './button.component';
import type { ButtonTone, ButtonVariant } from './button.component';
import { ButtonLinkComponent } from './button-link.component';

@Component({
  imports: [ButtonComponent, ButtonLinkComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-button [variant]="variant()" [tone]="tone()">Abmelden</lc-button>
    <a lcButton href="/abmelden" [variant]="variant()" [tone]="tone()">Abmelden</a>
    <lc-button variant="outline">Standard</lc-button>
    <a lcButton href="/standard" variant="outline">Standard</a>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('outline');
  readonly tone = signal<ButtonTone>('neutral');
}

/** Request 020, row 6: `tone="primary"` on `variant="outline"` (AC-13). */
describe('lc-button / a[lcButton] — outline tone (020)', () => {
  function render(variant: ButtonVariant, tone: ButtonTone) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.variant.set(variant);
    fixture.componentInstance.tone.set(tone);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [button, plainButton] = [...el.querySelectorAll('button')];
    const [link, plainLink] = [...el.querySelectorAll('a')];
    return { button, link, plainButton, plainLink };
  }

  const sorted = (e: Element) => [...e.classList].sort().join(' ');

  it('adds an optional `tone` input to both, `neutral` by default, documented with @default', () => {
    for (const [type, file] of [[ButtonComponent, 'button.component.ts'], [ButtonLinkComponent, 'button-link.component.ts']] as const) {
      expect(reflectComponentType(type)?.inputs.map((i) => i.propName)).toContain('tone');
      const source = readFileSync(resolve(__dirname, file), 'utf-8');
      expect(source).toMatch(/@default 'neutral'\s*\*\/\s*readonly tone = input<ButtonTone>\('neutral'\);/);
    }
  });

  it('renders the default outline exactly as before (no tone class)', () => {
    const { plainButton, plainLink } = render('outline', 'neutral');
    expect(sorted(plainButton)).toBe('btn btn-md btn-outline');
    expect(sorted(plainLink)).toBe('btn btn-md btn-outline');
  });

  it('adds btn-tone-primary to an outline button and link with tone="primary"', () => {
    const { button, link } = render('outline', 'primary');
    expect(sorted(button)).toBe('btn btn-md btn-outline btn-tone-primary');
    expect(sorted(link)).toBe('btn btn-md btn-outline btn-tone-primary');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'ghost', 'link'])('ignores tone on variant="%s"', (variant) => {
    const { button, link } = render(variant, 'primary');
    expect(button.classList).not.toContain('btn-tone-primary');
    expect(link.classList).not.toContain('btn-tone-primary');
  });

  describe('styles', () => {
    const css = compile(resolve(__dirname, 'button.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
    };

    it('takes text and border from the primary tokens at rest and on hover', () => {
      // 3.17: hover and active also exclude a loading button (`.btn-loading`).
      for (const selector of ['.btn-outline.btn-tone-primary', '.btn-outline.btn-tone-primary:hover:not(:disabled, .btn-loading)']) {
        expect(rule(selector)).toContain('border-color: var(--color-primary-600)');
        expect(rule(selector)).toContain('color: var(--color-primary-700)');
      }
      expect(rule('.btn-outline.btn-tone-primary:hover:not(:disabled, .btn-loading)')).toContain('background-color: var(--color-surface-selected)');
    });

    it('presses to --color-primary-200 without the outline brightness filter', () => {
      const active = rule('.btn-outline.btn-tone-primary:active:not(:disabled, .btn-loading)');
      expect(active).toContain('background-color: var(--color-primary-200)');
      expect(active).toContain('filter: none');
    });

    it('keeps the default outline of 3.14', () => {
      const outline = rule('.btn-outline');
      expect(outline).toContain('background-color: rgba(132, 199, 212, 0.06)');
      expect(outline).toContain('border-color: var(--color-border-strong)');
      expect(outline).toContain('color: var(--color-text-primary)');
    });
  });
});
