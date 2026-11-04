import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { encapsulateStyle } from '@angular/compiler';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent } from '@lifecorner/angular-ui-kit/button';
import { CardComponent, type CardFooterLayout } from './card.component';
import type { CardFooterLayout as PublicCardFooterLayout } from './index';

/**
 * 3.29 (request 046, life-os CC-2): `lc-card` `footerLayout="equal"`, two
 * answers of equal weight in the `[card-footer]` slot (design 046 §2, §3).
 */
@Component({
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card title="Streaming-Abo" [footerLayout]="layout()" [href]="href()">
      <p>Monatlich</p>
      <div card-footer>
        <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
        <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
      </div>
    </lc-card>
  `,
})
class HostComponent {
  readonly layout = signal<CardFooterLayout>('default');
  readonly href = signal<string | undefined>(undefined);
}

@Component({
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-card title="Karte"><div card-footer>Fuß</div></lc-card>`,
})
class PlainHostComponent {}

describe('lc-card footerLayout (3.29, CC-2)', () => {
  const render = (layout: CardFooterLayout = 'default', href?: string) => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.layout.set(layout);
    fixture.componentInstance.href.set(href);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, host: el.querySelector('lc-card') as HTMLElement };
  };

  it('defaults to "default" and adds no host class or attribute (AC-26)', () => {
    TestBed.configureTestingModule({ imports: [PlainHostComponent] });
    const fixture = TestBed.createComponent(PlainHostComponent);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector('lc-card') as HTMLElement;
    expect(fixture.debugElement.children[0].componentInstance.footerLayout()).toBe('default');
    expect(host.getAttributeNames().filter((n) => !n.startsWith('_ng'))).toEqual(['title']);
    expect(host.hasAttribute('class')).toBe(false);
  });

  it('exports the CardFooterLayout type from the entry (AC-26)', () => {
    const layout: PublicCardFooterLayout = 'equal';
    expect(layout).toBe('equal');
  });

  it('sets lc-card--footer-equal on the host for "equal" only (AC-26, AC-31)', () => {
    const { fixture, host } = render('equal');
    expect(host.classList).toContain('lc-card--footer-equal');
    fixture.componentInstance.layout.set('default');
    fixture.detectChanges();
    expect(host.classList).not.toContain('lc-card--footer-equal');
  });

  it('keeps the footer a direct child of .card, after the body, with the buttons in order (AC-27, AC-28)', () => {
    const { host } = render('equal');
    const footer = host.querySelector('[card-footer]') as HTMLElement;
    expect(footer.parentElement?.classList).toContain('card');
    expect(footer.previousElementSibling?.classList).toContain('card__body');
    expect([...footer.querySelectorAll('button')].map((b) => b.textContent?.trim())).toEqual(['Stimmt', 'Kein Vertrag']);
  });

  it('keeps the footer buttons above the link overlay of a link card (AC-29)', () => {
    const { host } = render('equal', '#/vertraege/1');
    expect(host.querySelector('.card')?.classList).toContain('card-linked');
    // The 3.24 lift rule, unscoped: every footer button is in it, the card link is not.
    const lift = '.card-linked :is(a[href], button, input, select, textarea, summary, [tabindex]):not(.card__link)';
    const buttons = [...host.querySelectorAll<HTMLElement>('[card-footer] button')];
    expect(buttons).toHaveLength(2);
    expect(buttons.every((b) => b.matches(lift))).toBe(true);
    expect((host.querySelector('.card__link') as HTMLElement).matches(lift)).toBe(false);
  });
});

describe('lc-card footerLayout styles (3.29, AC-27, AC-28, AC-31)', () => {
  const css = compile(resolve(__dirname, 'card.component.scss')).css;
  const scoped = encapsulateStyle(css, 'c1');

  it('makes the equal host a full-width inline-size container named lc-card', () => {
    // Sass writes the shorthand without spaces around the slash.
    expect(css).toMatch(/\n:host\(\.lc-card--footer-equal\) \{\n\s*container: lc-card\s*\/\s*inline-size;\n\s*inline-size: 100%;\n\}/);
  });

  it('stacks the footer children full width below 30rem: one minmax(0, 1fr) column, stretched', () => {
    const at = css.indexOf('\n:host(.lc-card--footer-equal) > .card > ::ng-deep :is([card-footer], .card-footer) {');
    expect(at).toBeGreaterThan(0);
    const rule = css.slice(at, css.indexOf('}', at));
    expect(rule).toContain('display: grid');
    expect(rule).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(rule).toContain('align-items: stretch');
    // Gap, margin, padding and divider stay those of the default footer rule.
    expect(rule).not.toMatch(/gap|margin|padding|border/);
  });

  it('puts the children side by side at equal width from a 30rem card (container query, not the viewport)', () => {
    expect(css).toMatch(
      /@container lc-card \(width >= 30rem\) \{\n\s*:host\(\.lc-card--footer-equal\) > \.card > ::ng-deep :is\(\[card-footer\], \.card-footer\) \{\n\s*grid-template-columns: none;\n\s*grid-auto-flow: column;\n\s*grid-auto-columns: minmax\(0, 1fr\);/,
    );
    expect(css).not.toMatch(/@media[^{]*\{[^}]*lc-card--footer-equal/);
  });

  it('gives the buttons the row height, without restyling them otherwise', () => {
    const at = css.indexOf(':is([card-footer], .card-footer) > lc-button > .btn {');
    expect(at).toBeGreaterThan(0);
    expect(css.slice(at, css.indexOf('}', at))).toMatch(/\{\n\s*block-size: 100%;\n$/);
  });

  it('is scoped to the card itself and its own footer (Angular emulation)', () => {
    const chain = String.raw`\.lc-card--footer-equal\[_nghost-c1\]\s*>\s*\.card\[_ngcontent-c1\]\s*>\s*:is\(\[card-footer\], \.card-footer\)`;
    expect(scoped).toMatch(/\.lc-card--footer-equal\[_nghost-c1\]\s*\{\s*container: lc-card\s*\/\s*inline-size;/);
    expect(scoped).toMatch(new RegExp(`${chain}\\s*\\{\\s*display: grid;`));
    expect(scoped).toMatch(new RegExp(`@container lc-card \\(width >= 30rem\\)\\s*\\{\\s*${chain}\\s*\\{\\s*grid-template-columns: none;`));
    expect(scoped).toMatch(new RegExp(`${chain} > lc-button > \\.btn\\s*\\{\\s*block-size: 100%;`));
  });

  it('leaves the default footer rule as it was (AC-26)', () => {
    const at = css.indexOf('\n:host ::ng-deep [card-footer],');
    const rule = css.slice(at, css.indexOf('}', at) + 1);
    expect(rule).toBe(
      '\n:host ::ng-deep [card-footer],\n:host ::ng-deep .card-footer {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: var(--lc-density-gap-sm, var(--spacing-2));\n  margin-top: var(--lc-density-padding-md, var(--spacing-4));\n  padding-top: var(--lc-density-padding-sm, var(--spacing-3));\n  border-top: 1px solid var(--color-divider, #e5e7eb);\n  color: var(--color-text-secondary);\n}',
    );
  });
});
