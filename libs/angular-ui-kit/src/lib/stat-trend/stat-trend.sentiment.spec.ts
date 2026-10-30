import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { compile } from 'sass';
import { resolve } from 'path';
import { StatTrendComponent, StatTrendDirection, StatTrendLabels } from './stat-trend.component';
import { SparklineComponent } from '../sparkline/sparkline.component';

/** Request 019 (G4): `sentiment` decouples the colour from the direction. */
describe('StatTrendComponent sentiment (019)', () => {
  let fixture: ComponentFixture<StatTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatTrendComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(StatTrendComponent);
  });

  function render(inputs: Record<string, unknown>): HTMLElement {
    fixture.componentRef.setInput('value', '48.2m');
    fixture.componentRef.setInput('sparklineData', [1, 2, 3]);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const change = (el: HTMLElement) => el.querySelector('.lc-stat-trend__change') as HTMLElement;
  const sparkline = () =>
    fixture.debugElement.query(By.directive(SparklineComponent)).componentInstance as SparklineComponent;

  // AC-17: unset sentiment renders exactly as before for every direction.
  it.each<[string, StatTrendDirection | undefined, string, string, string]>([
    ['+3.1%', undefined, 'up', '↑', 'success'],
    ['-0.8%', undefined, 'down', '↓', 'error'],
    ['0%', undefined, 'neutral', '→', 'info'],
    ['+5%', 'down', 'down', '↓', 'error'],
  ])('without sentiment, %s (direction %s) keeps the %s class, arrow and sparkline', (text, direction, cls, arrow, color) => {
    const el = render(direction ? { change: text, direction } : { change: text });
    const pill = change(el);
    expect([...pill.classList].sort()).toEqual(['lc-stat-trend__change', `lc-stat-trend__change--${cls}`]);
    expect(pill.textContent?.trim()).toBe(`${arrow} ${text}`);
    // The text node as rendered before 3.14, its collapsed spaces included.
    expect(pill.textContent).toBe(`${arrow} ${text} `);
    expect(pill.children).toHaveLength(1);
    expect(pill.querySelector('.lc-stat-trend__icon')?.hasAttribute('aria-hidden')).toBe(false);
    expect(el.querySelector('.lc-stat-trend__sr-only')).toBeNull();
    expect(sparkline().color()).toBe(color);
  });

  // AC-18: the colour follows the sentiment, the arrow follows the direction.
  it('up + negative keeps the up arrow and uses the negative class and the error sparkline', () => {
    const el = render({ change: '+3.1%', sentiment: 'negative' });
    const pill = change(el);
    expect(pill.querySelector('.lc-stat-trend__icon')?.textContent).toBe('↑');
    expect(pill.classList.contains('lc-stat-trend__change--negative')).toBe(true);
    expect(pill.classList.contains('lc-stat-trend__change--up')).toBe(false);
    expect(sparkline().color()).toBe('error');
  });

  it.each([
    ['positive', '-0.8%', '↓', 'success'],
    ['neutral', '+0.4%', '↑', 'info'],
  ])('%s sentiment colours %s with its own class and sparkline', (sentiment, text, arrow, color) => {
    const el = render({ change: text, sentiment });
    const pill = change(el);
    expect(pill.querySelector('.lc-stat-trend__icon')?.textContent).toBe(arrow);
    expect([...pill.classList].sort()).toEqual(['lc-stat-trend__change', `lc-stat-trend__change--${sentiment}`]);
    expect(sparkline().color()).toBe(color);
  });

  it('an explicit sparklineColor still wins over the sentiment', () => {
    render({ change: '+3.1%', sentiment: 'negative', sparklineColor: 'primary' });
    expect(sparkline().color()).toBe('primary');
  });

  // AC-19: the meaning does not rest on colour, and a screen reader hears it.
  it('with sentiment, the arrow is aria-hidden and a hidden text names direction and sentiment (EN)', () => {
    const el = render({ change: '+3.1%', sentiment: 'negative' });
    expect(el.querySelector('.lc-stat-trend__icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.lc-stat-trend__sr-only')?.textContent).toBe(', up, unfavourable');
  });

  it.each([
    ['-0.8%', 'positive', ', down, favourable'],
    ['0%', 'neutral', ', unchanged, neutral'],
  ])('%s with %s reads "%s"', (text, sentiment, expected) => {
    const el = render({ change: text, sentiment });
    expect(el.querySelector('.lc-stat-trend__sr-only')?.textContent).toBe(expected);
  });

  it('German labels replace the words; missing keys fall back to English', () => {
    const de: StatTrendLabels = {
      up: 'gestiegen',
      down: 'gesunken',
      unchanged: 'unverändert',
      positive: 'günstig',
      negative: 'ungünstig',
      neutral: 'neutral',
    };
    const el = render({ change: '+3,1 %', sentiment: 'negative', labels: de });
    expect(el.querySelector('.lc-stat-trend__sr-only')?.textContent).toBe(', gestiegen, ungünstig');
    // Review r1 (N2): no space before the comma (braille read "+3,1 % , gestiegen").
    expect(change(el).textContent).toBe('↑ +3,1 %, gestiegen, ungünstig');
    fixture.componentRef.setInput('labels', { negative: 'ungünstig' });
    fixture.detectChanges();
    expect(el.querySelector('.lc-stat-trend__sr-only')?.textContent).toBe(', up, ungünstig');
  });

  // AC-20: the pills use the AA ink/tint pairs (asserted in theme-contrast.spec.ts).
  it('up/positive and down/negative pills use the text-on-subtle token pairs', () => {
    const css = compile(resolve(__dirname, 'stat-trend.component.scss')).css;
    const rule = (selector: string) => {
      const start = css.indexOf(selector);
      return css.slice(start, css.indexOf('}', start));
    };
    expect(css).toContain('.lc-stat-trend__change--up,\n.lc-stat-trend__change--positive {');
    expect(css).toContain('.lc-stat-trend__change--down,\n.lc-stat-trend__change--negative {');
    expect(rule('.lc-stat-trend__change--up,')).toContain('color: var(--color-text-success)');
    expect(rule('.lc-stat-trend__change--up,')).toContain('background-color: var(--color-success-subtle)');
    expect(rule('.lc-stat-trend__change--down,')).toContain('color: var(--color-text-error)');
    expect(rule('.lc-stat-trend__change--down,')).toContain('background-color: var(--color-error-subtle)');
    expect(rule('\n.lc-stat-trend__sr-only {')).toContain('clip: rect(0, 0, 0, 0)');
  });
});
