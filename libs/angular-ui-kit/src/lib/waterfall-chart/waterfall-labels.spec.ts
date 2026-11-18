import { TestBed } from '@angular/core/testing';
import { WaterfallChartComponent, type WaterfallItem } from './waterfall-chart.component';
import { estimateLabelWidth, layoutWaterfallLabels, plainLabel, SOFT_HYPHEN } from './waterfall-labels';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.47 (request 067, kosten row 6, AC-W1 … W5): category labels wider than
 * their room wrap onto two lines or end in „…“ with the full label as
 * `<title>`; labels that fit draw as before.
 */
const SHY = SOFT_HYPHEN;
const ELL = String.fromCharCode(0x2026);
/** Every character 6 px wide. */
const mono = (text: string) => 6 * Array.from(text).length;
const lines = (labels: string[], width: number) =>
  layoutWaterfallLabels(labels, width, mono).map((r) => r.lines.join(' / ') + (r.cut ? ' [cut]' : ''));

describe('layoutWaterfallLabels (3.47, AC-W1)', () => {
  // 9 bars at 564 px: slot 56, room 52 between wide neighbours.
  const wide = (label: string) => ['xxxxxxxxxxxx', label, 'xxxxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx'];

  it('keeps a label that fits on one line', () => {
    expect(lines(['Preis', 'Menge', 'Summe', 'Ab', 'Cd'], 560)).toEqual(['Preis', 'Menge', 'Summe', 'Ab', 'Cd']);
  });

  it('gives a label the room its short neighbours leave (twice the smaller side)', () => {
    // slot 100: an 18-character label (108 px) between two 2-character ones fits.
    expect(lines(['ab', 'cd', 'abcdefghijklmnopqr', 'ef', 'gh'], 560)[2]).toBe('abcdefghijklmnopqr');
    // Between wide neighbours the same label does not.
    expect(lines(['xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'abcdefghijklmnopqr', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx'], 560)[2]).not.toBe(
      'abcdefghijklmnopqr',
    );
  });

  it('breaks after a space (dropped) and cuts a second line still too wide', () => {
    expect(lines(wide('Nicht eingetreten'), 564)[1]).toBe(`Nicht / eingetr${ELL} [cut]`);
  });

  it('breaks at a soft hyphen, drawn as „-“', () => {
    expect(lines(wide(`Periodi${SHY}sierung`), 564)[1]).toBe('Periodi- / sierung');
  });

  it('breaks after a hyphen, which stays on the first line', () => {
    expect(lines(wide('Ist-Kosten'), 564)[1]).toBe('Ist- / Kosten');
  });

  it('takes the longest first line whose rest fits', () => {
    // One bar 100 px wide: room 56.
    expect(lines(['aaaa bbbb cccc'], 100)).toEqual(['aaaa bbbb / cccc']);
  });

  it('cuts a single word that does not fit, keeping at least one character', () => {
    expect(lines(wide('Rechnungsfreigabe'), 564)[1]).toBe(`Rechnun${ELL} [cut]`);
    expect(lines(['Ab', 'Cd'], 66)).toEqual([`A${ELL} [cut]`, `C${ELL} [cut]`]);
  });

  it('returns nothing for no labels', () => {
    expect(layoutWaterfallLabels([], 500, mono)).toEqual([]);
  });

  it('estimates widths from the char table (SSR, jsdom): „Periodisierung“ 75.6 px at 11 px, U+00AD 0', () => {
    expect(estimateLabelWidth('Periodisierung')).toBeCloseTo(75.64, 2);
    expect(estimateLabelWidth(`Periodi${SHY}sierung`)).toBeCloseTo(75.64, 2);
    expect(estimateLabelWidth('é')).toBeCloseTo(7.7, 5);
    expect(estimateLabelWidth('中', 10)).toBe(10);
    expect(plainLabel(`Unge${SHY}plant`)).toBe('Ungeplant');
  });
});

describe('lc-waterfall-chart long labels (3.47, AC-W1 … W5)', () => {
  const causes: WaterfallItem[] = [
    { label: `Periodi${SHY}sierung`, value: 6000 },
    { label: `Verschie${SHY}bung`, value: 1200 },
    { label: `Unge${SHY}plant`, value: 25200 },
    { label: 'Nicht eingetreten', value: -2400 },
    { label: 'Preis', value: 2960 },
    { label: 'Menge', value: 1500 },
    { label: 'Einmalig', value: 3000 },
    { label: 'Nicht erklärt', value: 6370 },
    { label: 'Summe', value: 43830, type: 'total' },
  ];

  function render(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({ imports: [WaterfallChartComponent] });
    const fixture = TestBed.createComponent(WaterfallChartComponent);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg') as SVGSVGElement;
    const texts = [...svg.querySelectorAll('.lc-waterfall-chart__label')];
    return { fixture, svg, texts };
  }

  /** What a label draws: its lines (tspans or text), and its title. */
  const drawn = (t: Element) => {
    const spans = [...t.querySelectorAll('tspan')].map((s) => s.textContent);
    const title = t.querySelector('title')?.textContent;
    const text = [...t.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
    return (spans.length ? spans.join(' / ') : text) + (title ? ` [${title}]` : '');
  };

  it('AC-W3: nine German causes at 564 px wrap onto two lines, the chart one line higher (estimated widths)', () => {
    const { svg, texts } = render({ data: causes, width: 564, height: 250 });
    expect(texts.map(drawn)).toEqual([
      'Periodi- / sierung',
      'Verschie- / bung',
      'Unge- / plant',
      `Nicht / eingetr${ELL} [Nicht eingetreten]`,
      'Preis',
      'Menge',
      'Einmalig',
      'Nicht / erklärt',
      'Summe',
    ]);
    expect(svg.getAttribute('height')).toBe('264');
    expect(svg.getAttribute('viewBox')).toBe('0 0 564 264');
  });

  it('AC-W1: one <text> per label; the title first, the second line 1.2em lower at the same x', () => {
    const { texts } = render({ data: causes, width: 564, height: 250 });
    const cut = texts[3];
    expect(cut.firstElementChild?.tagName.toLowerCase()).toBe('title');
    const [first, second] = [...cut.querySelectorAll('tspan')];
    expect(first.getAttribute('x')).toBe(cut.getAttribute('x'));
    expect(second.getAttribute('x')).toBe(cut.getAttribute('x'));
    expect(first.hasAttribute('dy')).toBe(false);
    expect(second.getAttribute('dy')).toBe('1.2em');
    expect(cut.getAttribute('text-anchor')).toBe('middle');
  });

  it('AC-W2: labels that fit draw as before (one text node, no title, the set height)', () => {
    const { svg, texts } = render({
      data: [{ label: 'Revenue', value: 420, type: 'total' }, { label: 'COGS', value: -150 }, { label: 'Net', value: 270, type: 'total' }],
    });
    expect(texts.map((t) => [t.childNodes.length, t.textContent])).toEqual([
      [1, 'Revenue'],
      [1, 'COGS'],
      [1, 'Net'],
    ]);
    expect(svg.querySelector('tspan, text title')).toBeNull();
    expect(svg.getAttribute('height')).toBe('250');
  });

  it('AC-W5: the default name lists the full labels without soft hyphens; wrapped text stays inside role="img"', () => {
    const { svg } = render({ data: causes, width: 564 });
    const name = svg.getAttribute('aria-label') as string;
    expect(name.startsWith('Waterfall chart: Periodisierung +6000, Verschiebung +1200, Ungeplant +25200, Nicht eingetreten -2400')).toBe(true);
    expect(name).not.toContain(SHY);
    expect(svg.getAttribute('role')).toBe('img');
  });

  it('AC-W5: wrapLabels false draws one line each, as before 3.47', () => {
    const { svg, texts } = render({ data: causes, width: 564, height: 250, wrapLabels: false });
    expect(svg.querySelector('tspan, text title')).toBeNull();
    expect(texts.every((t) => t.childNodes.length === 1)).toBe(true);
    expect(texts[0].textContent).toBe(`Periodi${SHY}sierung`);
    expect(svg.getAttribute('height')).toBe('250');
  });

  it('AC-W4: at 360 px (328 wide) every label is cut within its 25.8 px, with the full label as title', () => {
    const { texts } = render({ data: causes, width: 328, height: 250 });
    expect(texts).toHaveLength(9);
    texts.forEach((t, i) => {
      expect(t.querySelector('tspan')).toBeNull();
      const line = [...t.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
      expect(line.endsWith(ELL)).toBe(true);
      expect(estimateLabelWidth(line)).toBeLessThanOrEqual((328 - 60) / 9 - 4);
      expect(t.querySelector('title')?.textContent).toBe(plainLabel(causes[i].label));
    });
  });

  it('measures in the browser after the first render (getComputedTextLength), estimating before', () => {
    const proto = SVGElement.prototype as unknown as { getComputedTextLength?: () => number };
    proto.getComputedTextLength = function (this: SVGElement) {
      return 3 * (this.textContent ?? '').length;
    };
    try {
      // At 3 px a character every label fits its room: one line each, the set height.
      const { svg, texts } = render({ data: causes, width: 564, height: 250 });
      expect(svg.querySelector('tspan')).toBeNull();
      expect(texts[3].textContent).toBe('Nicht eingetreten');
      expect(svg.getAttribute('height')).toBe('250');
      // The probe text is removed again.
      expect(svg.querySelectorAll('text.lc-waterfall-chart__label')).toHaveLength(9);
    } finally {
      delete proto.getComputedTextLength;
    }
  });

  it('passes axe (svg-img-alt, jsdom rules)', async () => {
    const { fixture } = render({ data: causes, width: 564 });
    expect(violations(await audit(fixture.nativeElement as HTMLElement))).toEqual([]);
  });
});
