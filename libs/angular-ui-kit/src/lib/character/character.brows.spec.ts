import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { CHARACTER_POSES } from '@lifecorner/angular-ui-kit/character-svg';

/**
 * Edu's brows (3.11.3, gap G-42): AC-1, AC-2, AC-4 and AC-7 of request 013.
 *
 * A brow is a `<path>` stroked #0c1722 (its own attribute or its group's) whose
 * two end points both lie above y 34 (the eye whites' top is 33.4), read in the
 * path's own (head) frame. Inner = the end nearer x 50; rise = outer y − inner y.
 * The rule (design 013 §3.1): every brow has rise ≥ 0, or is a `Q` arch whose
 * control point lies at least 2 units above both ends. No pose frowns.
 */
const ASSETS = resolve(__dirname, '../../assets/character');
const file = (name: string) => readFileSync(join(ASSETS, name), 'utf-8');

/** The three `d` values redrawn in 3.11.3 (design 013 §2): [3.11.2, 3.11.3]. */
const REDRAWN: [string, string][] = [
  ['M38 31 L45.5 32.5', 'M38 32.5 L45.5 29.5'],
  ['M54.5 32.5 L62 31', 'M54.5 29.5 L62 32.5'],
  ['M46 47.5 Q50 46.3 54 47.5', 'M46 47.5 Q50 48.7 54 47.5'],
];

/** `git rev-parse v3.11.2:libs/angular-ui-kit/src/assets/character/comforts-light.svg` */
const COMFORTS_3_11_2_BLOB = '13e0531f1273789856b48887addec97e616ed471';

/** comforts-light.svg as shipped in 3.11.2: the current file with the three values put back. */
const comforts3112 = () => REDRAWN.reduce((svg, [old, now]) => svg.replace(`d="${now}"`, `d="${old}"`), file('comforts-light.svg'));

const gitBlob = (text: string) => createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  d: string;
  start: Point;
  end: Point;
  /** The control point of a single `Q` segment. */
  control?: Point;
}

interface Brow {
  d: string;
  inner: Point;
  outer: Point;
  rise: number;
  /** How far a `Q` arch's control point lies above the higher end. */
  arch?: number;
}

/** Every `<path>` stroked #0c1722, with its end points. */
function darkStrokes(svg: string): Stroke[] {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  return Array.from(doc.querySelectorAll('path'))
    .filter((path) => path.closest('[stroke]')?.getAttribute('stroke') === '#0c1722')
    .map((path) => {
      const d = path.getAttribute('d') ?? '';
      const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      const start = { x: n[0], y: n[1] };
      const end = /z\s*$/i.test(d) ? start : { x: n[n.length - 2], y: n[n.length - 1] };
      const control = /^M[\d.\s-]+Q[\d.\s-]+$/.test(d) ? { x: n[2], y: n[3] } : undefined;
      return { d, start, end, control };
    });
}

function brows(svg: string): Brow[] {
  return darkStrokes(svg)
    .filter(({ start, end }) => start.y < 34 && end.y < 34)
    .map(({ d, start, end, control }) => {
      const [inner, outer] = Math.abs(start.x - 50) <= Math.abs(end.x - 50) ? [start, end] : [end, start];
      const arch = control ? Math.min(inner.y, outer.y) - control.y : undefined;
      return { d, inner, outer, rise: outer.y - inner.y, arch };
    });
}

const passes = (brow: Brow) => brow.rise >= 0 || (brow.arch !== undefined && brow.arch >= 2);

/** Inside Edu's head: the ellipse at (50, 38), radii 22 × 20. */
const inHead = ({ x, y }: Point) => ((x - 50) / 22) ** 2 + ((y - 38) / 20) ** 2 <= 1;

describe('Edu: brows (013)', () => {
  it('only comforts, connection-paused and discovered draw brows, two each, in absolute commands (AC-4)', () => {
    const withBrows = CHARACTER_POSES.filter((pose) => brows(file(`${pose}-light.svg`)).length > 0);
    expect([...withBrows].sort()).toEqual(['comforts', 'connection-paused', 'discovered']);
    for (const pose of withBrows) {
      const found = brows(file(`${pose}-light.svg`));
      expect(found).toHaveLength(2);
      for (const { d } of found) expect(d).toMatch(/^M[^a-z]*$/);
    }
  });

  it.each(CHARACTER_POSES)('%s: no brow slopes down toward the centre unless it arches (AC-4)', (pose) => {
    for (const theme of ['light', 'dark']) {
      expect(brows(file(`${pose}-${theme}.svg`)).filter((brow) => !passes(brow)).map(({ d }) => d)).toEqual([]);
    }
  });

  it('comforts is worried: both inner ends sit 3 units above the outer ends (AC-1)', () => {
    const found = brows(file('comforts-light.svg'));
    expect(found.map(({ inner }) => inner.x)).toEqual([45.5, 54.5]);
    for (const { rise } of found) {
      expect(rise).toBeGreaterThanOrEqual(1.5);
      expect(rise).toBe(3);
    }
  });

  it('comforts has a soft mouth: the control point is not above its ends, all inside the head (AC-2)', () => {
    const mouths = darkStrokes(file('comforts-light.svg')).filter(({ start, end }) => start.y > 44 && end.y > 44);
    expect(mouths).toHaveLength(1);
    const [{ start, end, control = { x: NaN, y: NaN } }] = mouths;
    expect(control).toEqual({ x: 50, y: 48.7 });
    expect(control.y).toBeGreaterThanOrEqual(Math.max(start.y, end.y));
    for (const point of [start, end, control]) expect(inHead(point)).toBe(true);
  });

  it('comforts changed only the three values: put back, they give the 3.11.2 file byte for byte (AC-7)', () => {
    const light = file('comforts-light.svg');
    for (const [old, now] of REDRAWN) {
      expect(light.split(`d="${now}"`)).toHaveLength(2);
      expect(light).not.toContain(`d="${old}"`);
    }
    expect(gitBlob(comforts3112())).toBe(COMFORTS_3_11_2_BLOB);
  });

  it('catches the fault: the 3.11.2 comforts brows slope down toward the centre and its mouth turns down (fixture)', () => {
    const old = comforts3112();
    const found = brows(old);
    expect(found.map(({ rise }) => rise)).toEqual([-1.5, -1.5]);
    expect(found.some(passes)).toBe(false);
    const [{ start, end, control }] = darkStrokes(old).filter((stroke) => stroke.start.y > 44 && stroke.end.y > 44);
    expect(control).toEqual({ x: 50, y: 46.3 });
    expect(control?.y).toBeLessThan(Math.max(start.y, end.y));
  });
});
