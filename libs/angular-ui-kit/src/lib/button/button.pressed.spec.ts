import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent, type ButtonAriaPressed, type ButtonVariant } from './button.component';

/**
 * Request 068 (3.48, usm-x row 70, design §2, §5): `ariaPressed` true on an
 * outline or ghost button draws a pressed look; `false`, `mixed`, unset and
 * the other variants keep today's look.
 */
@Component({
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-button [variant]="variant()" [ariaPressed]="pressed()">Master/Detail</lc-button>`,
})
class Host {
  readonly variant = signal<ButtonVariant>('outline');
  readonly pressed = signal<ButtonAriaPressed | null>(null);
}

const PRESSED = '.btn-outline[aria-pressed="true"], .btn-ghost[aria-pressed="true"]';

describe('lc-button pressed look (3.48)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.each<[ButtonVariant, ButtonAriaPressed | null, boolean]>([
    ['outline', true, true],
    ['ghost', true, true],
    ['outline', false, false],
    ['outline', 'mixed', false],
    ['outline', null, false],
    ['primary', true, false],
    ['secondary', true, false],
  ])('%s with ariaPressed %p: pressed look %p', (variant, pressed, look) => {
    host.variant.set(variant);
    host.pressed.set(pressed);
    fixture.detectChanges();
    expect(button().matches(PRESSED)).toBe(look);
  });

  it('the off state renders no new attribute or class (unchanged DOM)', () => {
    host.pressed.set(false);
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect([...button().classList].filter((c) => /press/.test(c))).toEqual([]);
  });

  describe('stylesheet', () => {
    const css = compile(resolve(__dirname, 'button.component.scss')).css.replace(/\s+/g, ' ');

    it('hover uses the pressed hover fill; the rule comes after tone="primary" so it wins at equal weight', () => {
      expect(css).toContain(
        '.btn-outline[aria-pressed=true]:hover:not(:disabled, .btn-loading), .btn-ghost[aria-pressed=true]:hover:not(:disabled, .btn-loading) { background-color: var(--lc-button-pressed-hover-bg, var(--color-primary-200)); border-color: var(--lc-button-pressed-border, var(--color-primary-600)); color: var(--lc-button-pressed-fg, var(--color-primary-700)); }',
      );
      expect(css.indexOf('.btn-outline[aria-pressed=true],')).toBeGreaterThan(css.indexOf('.btn-outline.btn-tone-primary {'));
    });

    it('forced colours: Highlight fill and border, HighlightText, no inset shadow, the ring Highlight', () => {
      expect(css).toContain(
        '@media (forced-colors: active) { .btn-outline[aria-pressed=true], .btn-ghost[aria-pressed=true], .btn-outline[aria-pressed=true]:hover:not(:disabled, .btn-loading), .btn-ghost[aria-pressed=true]:hover:not(:disabled, .btn-loading) { forced-color-adjust: none; background-color: Highlight; border-color: Highlight; box-shadow: none; color: HighlightText; } .btn-outline[aria-pressed=true]:focus-visible, .btn-ghost[aria-pressed=true]:focus-visible { outline-color: Highlight; } }',
      );
    });
  });
});
