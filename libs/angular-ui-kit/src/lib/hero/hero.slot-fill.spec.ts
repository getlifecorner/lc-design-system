import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { BadgeComponent } from '@lifecorner/angular-ui-kit/badge';
import { HeroComponent, type HeroColor, type HeroVariant } from './hero.component';

/**
 * 3.37 (request 057): finance-intelligence monatsstand row 1 (design D-5) —
 * components in the default slot keep full opacity and badges in a hero take
 * the light palette, so every variant reaches 4.5:1 on every band — and
 * cockpit row 1 (D-6), `fill`. The rect checks of `fill` and the axe run are
 * in the stories *Fill* and *Badges in the Body*.
 */
const heroCss = compile(resolve(__dirname, 'hero.component.scss')).css;
const lightCss = compile(resolve(__dirname, '../../styles/_theme-light.scss')).css;
const badgeCss = compile(resolve(__dirname, '../badge/badge.component.scss')).css;

/** The body of the first rule whose selector is exactly `selector`. */
function rule(css: string, selector: string): string {
  const at = css.startsWith(`${selector} {`) ? 0 : css.indexOf(`\n${selector} {`);
  expect([selector, at > -1]).toEqual([selector, true]);
  const open = css.indexOf('{', at);
  return css.slice(open + 1, css.indexOf('}', open));
}

type Rgba = [number, number, number, number];
function parse(value: string): Rgba {
  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
  let h = value.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1) as Rgba;
}
const over = (top: Rgba, base: Rgba): Rgba => [0, 1, 2].map((i) => top[i] * top[3] + base[i] * (1 - top[3])).concat(1) as Rgba;
function luminance([r, g, b]: Rgba): number {
  const [R, G, B] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const ratio = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The light root tokens, `var()` references followed. */
const lightTokens: Record<string, string> = {};
for (const m of rule(lightCss, ':root,\n:root.light').matchAll(/(--[\w-]+):\s*([^;]+);/g)) lightTokens[m[1]] = m[2].trim();
function token(name: string, depth = 0): Rgba {
  const value = lightTokens[name];
  if (value === undefined) throw new Error(`${name} is not defined`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref && depth < 10 ? token(ref[1], depth + 1) : parse(value);
}

const COLORS: HeroColor[] = ['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet'];
const VARIANTS = ['default', 'primary', 'success', 'warning', 'error', 'info'] as const;

/** Both ends of a band: `.hero--<color>` (dark) or `.hero--light.hero--<color>` (pastel). */
function bandEnds(color: HeroColor, light: boolean): [Rgba, Rgba] {
  const body = rule(heroCss, light ? `.hero--light.hero--${color}` : `.hero--${color}`);
  const m = body.match(/linear-gradient\(135deg, (#[0-9a-f]{3,6}) 0%, (#[0-9a-f]{3,6}) 100%\)/i);
  expect(m).not.toBeNull();
  return [parse((m as RegExpMatchArray)[1]), parse((m as RegExpMatchArray)[2])];
}

/** The fill and ink tokens of a badge variant, read from the badge styles. */
function badgeTokens(variant: string): [string, string] {
  const body = rule(badgeCss, `.lc-badge--${variant}`);
  const bg = body.match(/--lc-badge-bg: var\((--[\w-]+)\);/)?.[1] as string;
  const fg = body.match(/--lc-badge-fg: var\((--[\w-]+)\);/)?.[1] as string;
  return [bg, fg];
}

describe('lc-hero — slot contrast (3.37, request 057, monatsstand row 1)', () => {
  // 3.38 (request 058, 057-s2, design H1): on a default band the body and the
  // label are white at full strength (the 85 % body and 80 % label fell to
  // 1.93:1), so the body has no colour of its own and `.hero__label` left the
  // dimmed list; the light variant still softens both. The contrast values are
  // in `hero.contrast.spec.ts`.
  it('AC-15: the body never dims through opacity; since 3.38 it inherits the band ink (light variant: 75 % through its colour)', () => {
    const body = rule(heroCss, '.hero__body');
    expect(body).not.toMatch(/color/);
    expect(body).not.toMatch(/opacity/);
    expect(rule(heroCss, '.hero--light .hero__body')).toMatch(/^\s*color: rgba\(31, 41, 55, 0\.75\);\s*$/);
    // No rule of the hero dims the body (or anything) through opacity, apart from the light variant's label.
    const dimmed = [...heroCss.matchAll(/\n([^{}\n]+) \{[^{}]*opacity:/g)].map((m) => m[1]);
    expect(dimmed).toEqual(['.hero--light .hero__label']);
  });

  // 3.40 (request 060, G-HV4): the list goes on with `lc-hero lc-chip`.
  it('badges in lc-hero take the light palette, in both themes (a rule of the light file)', () => {
    expect(lightCss).toMatch(/\.lc-sidenav-container--light \.lc-sidenav__nav-badge,\nlc-hero lc-badge,\nlc-hero lc-chip \{/);
  });

  it('the badge fills are opaque in the light palette, so the band never shows through', () => {
    for (const variant of VARIANTS) {
      const [bg] = badgeTokens(variant);
      expect([variant, token(bg)[3]]).toEqual([variant, 1]);
    }
  });

  // Floored to 2 decimals; design §5 quotes them rounded (6.87, 8.49, 10.98).
  const EXPECTED: Record<(typeof VARIANTS)[number], number> = {
    default: 6.86,
    primary: 8.48,
    success: 4.85,
    warning: 5.52,
    error: 10.97,
    info: 9.08,
  };

  it.each(VARIANTS)('AC-14: the %s badge reaches 4.5:1 on all 9 bands, dark and pastel, both ends', (variant) => {
    const [bg, fg] = badgeTokens(variant);
    const ratios = COLORS.flatMap((color) => [false, true].flatMap((light) => bandEnds(color, light).map((end) => ratio(token(fg), over(token(bg), end)))));
    expect(ratios).toHaveLength(36);
    const min = Math.min(...ratios);
    expect(min).toBeGreaterThanOrEqual(4.5);
    expect(Math.floor(min * 100) / 100).toBe(EXPECTED[variant]);
  });
});

@Component({
  standalone: true,
  imports: [HeroComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (withFill()) {
      <lc-hero title="Cockpit" [fill]="fill()" [variant]="variant()">
        <p>September 2026</p>
        <lc-badge size="sm" variant="warning" [rounded]="true">Entwurf</lc-badge>
        <div hero-footer>Stand</div>
      </lc-hero>
    } @else {
      <lc-hero title="Cockpit" [variant]="variant()">
        <p>September 2026</p>
        <lc-badge size="sm" variant="warning" [rounded]="true">Entwurf</lc-badge>
        <div hero-footer>Stand</div>
      </lc-hero>
    }
    <lc-hero title="Attribute" fill />
  `,
})
class Host {
  readonly withFill = signal(true);
  readonly fill = signal(false);
  readonly variant = signal<HeroVariant>('default');
}

describe('lc-hero — fill (3.37, request 057, cockpit row 1)', () => {
  let fixture: ComponentFixture<Host>;
  const heroes = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('lc-hero'));
  const strip = (html: string) => html.replace(/<!--[^]*?-->/g, '').replace(/\s_ng(content|host)-[\w-]+=""/g, '');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('defaults to false', () => {
    const hero = fixture.debugElement.children.find((c) => c.componentInstance instanceof HeroComponent)?.componentInstance as HeroComponent;
    expect(hero.fill()).toBe(false);
  });

  it('AC-18: without fill the host has no class, and the hero renders as without the input', () => {
    const [bound] = heroes();
    expect(bound.hasAttribute('class')).toBe(false);
    const withInput = strip(bound.outerHTML);
    fixture.componentInstance.withFill.set(false);
    fixture.detectChanges();
    expect(strip(heroes()[0].outerHTML)).toBe(withInput);
  });

  it('AC-17: fill puts lc-hero--fill on the host only; the band markup is unchanged', () => {
    const inner = strip(heroes()[0].innerHTML);
    fixture.componentInstance.fill.set(true);
    fixture.detectChanges();
    expect(heroes()[0].className).toBe('lc-hero--fill');
    expect(strip(heroes()[0].innerHTML)).toBe(inner);
    // As a bare attribute too (booleanAttribute).
    expect(heroes()[1].className).toBe('lc-hero--fill');
  });

  it('AC-17/AC-18: the host becomes a flex column, the band grows, the media grid keeps its rows at the top', () => {
    expect(rule(heroCss, ':host(.lc-hero--fill)')).toMatch(/^\s*display: flex;\s*flex-direction: column;\s*$/);
    expect(rule(heroCss, ':host(.lc-hero--fill) > .hero')).toMatch(/^\s*flex: 1 1 auto;\s*$/);
    expect(rule(heroCss, ':host(.lc-hero--fill) .hero__inner')).toMatch(/^\s*align-content: start;\s*$/);
    // The base stays: a block host, the band a flex column whose inner part takes the free height.
    expect(rule(heroCss, ':host')).toMatch(/^\s*display: block;\s*width: 100%;\s*$/);
    expect(rule(heroCss, '.hero__inner')).toMatch(/^\s*flex: 1;\s*$/);
    expect(rule(heroCss, '.hero')).toMatch(/display: flex;\s*flex-direction: column;\s*justify-content: space-between;/);
  });

  it('AC-15: a badge in the default slot sits in the body, a plain lc-badge', () => {
    const body = heroes()[0].querySelector('.hero__body') as HTMLElement;
    expect(body.querySelector('lc-badge')?.textContent?.trim()).toBe('Entwurf');
  });
});
