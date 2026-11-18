/**
 * Category labels of `lc-waterfall-chart` that are wider than their bar's
 * room (3.47, kosten row 6): wrapped onto a second line or cut with „…“.
 * Pure, so it runs the same in prerendering (with the width estimate below)
 * and in the browser (with the measured widths).
 *
 * @internal
 */

/** U+00AD: a soft hyphen, a break point drawn as „-“ when used. */
export const SOFT_HYPHEN = String.fromCharCode(0xad);

/** The ellipsis that ends a cut line. */
const ELLIPSIS = String.fromCharCode(0x2026);

/** Plot paddings of the chart (left 50, right 10): the labels share `width − 60`. */
const PLOT_PAD_LEFT = 50;
const PLOT_PAD_X = 60;

/** Room kept clear between two neighbouring labels, and at the chart's edge (half of it). */
const LABEL_GAP = 4;

/** The label font size in px when nothing is measured (0.6875rem at 16 px). */
export const WATERFALL_LABEL_FONT_PX = 11;

/**
 * Advance widths in em of the kit font stack (headless Chromium on macOS,
 * SF Pro, weight 400; the widest of SF, Helvetica and Arial, so the estimate
 * is at least the real width on Windows and Android). Request 067 design §3.
 */
const CHAR_EM: Readonly<Record<string, number>> = {
  '0': 0.636, '1': 0.47, '2': 0.609, '3': 0.633, '4': 0.649, '5': 0.624, '6': 0.643, '7': 0.594, '8': 0.645, '9': 0.643,
  a: 0.558, b: 0.62, c: 0.565, d: 0.62, e: 0.577, f: 0.368, g: 0.615, h: 0.594, i: 0.253, j: 0.252, k: 0.549, l: 0.259,
  m: 0.876, n: 0.589, o: 0.597, p: 0.616, q: 0.615, r: 0.396, s: 0.52, t: 0.369, u: 0.589, v: 0.548, w: 0.78, x: 0.53,
  y: 0.549, z: 0.545,
  A: 0.68, B: 0.663, C: 0.722, D: 0.732, E: 0.602, F: 0.578, G: 0.752, H: 0.748, I: 0.273, J: 0.544, K: 0.665, L: 0.574,
  M: 0.88, N: 0.748, O: 0.777, P: 0.641, Q: 0.777, R: 0.659, S: 0.643, T: 0.64, U: 0.743, V: 0.68, W: 0.974, X: 0.685,
  Y: 0.661, Z: 0.668,
  'ä': 0.558, 'ö': 0.597, 'ü': 0.589, 'ß': 0.628, 'Ä': 0.68, 'Ö': 0.777, 'Ü': 0.743,
  ' ': 0.282, '.': 0.303, ',': 0.303, ':': 0.303, ';': 0.303, '-': 0.478, '–': 0.589, '(': 0.388, ')': 0.388,
  '/': 0.311, '&': 0.717, '+': 0.636, '%': 0.931, '€': 0.636, '…': 0.811,
};

/** Width of `ch` in em: the table, 1 em from U+2E80 (CJK), 0 for U+00AD, else 0.7 em. */
function charEm(ch: string): number {
  if (ch === SOFT_HYPHEN) return 0;
  const known = CHAR_EM[ch];
  if (known !== undefined) return known;
  return (ch.codePointAt(0) ?? 0) >= 0x2e80 ? 1 : 0.7;
}

/** The estimated width of `text` in px at `fontPx` (no DOM: prerendering, jsdom, first render). */
export function estimateLabelWidth(text: string, fontPx = WATERFALL_LABEL_FONT_PX): number {
  let em = 0;
  for (const ch of text) em += charEm(ch);
  return em * fontPx;
}

/** The label without soft hyphens: what is drawn on one line, read and shown as `<title>`. */
export function plainLabel(label: string): string {
  return label.split(SOFT_HYPHEN).join('');
}

/** One label's lines; `cut`: the last line ends in „…“ and the label needs a `<title>`. */
export interface WaterfallLabelLines {
  lines: string[];
  cut: boolean;
}

/**
 * Lays out the category labels of a chart `width` px wide (one label per
 * bar, in order). A label keeps one line when it fits its room: twice the
 * smaller distance to its neighbours' text (each counted at most at the
 * slot's width) minus the gap, at least its slot minus the gap. Otherwise it
 * breaks after a space (dropped), after a „-“, or at a soft hyphen (drawn as
 * „-“): the longest first line that fits and whose rest fits; else the
 * longest first line that fits, with the rest cut; no first line fits → one
 * cut line. A cut keeps at least one character before „…“.
 */
export function layoutWaterfallLabels(
  labels: readonly string[],
  width: number,
  measure: (text: string) => number,
): WaterfallLabelLines[] {
  const n = labels.length;
  if (!n) return [];
  const slot = (width - PLOT_PAD_X) / n;
  const avail = slot - LABEL_GAP;
  const plain = labels.map(plainLabel);
  const widths = plain.map((text) => measure(text));
  const capped = widths.map((w) => Math.min(w, avail));
  const centre = (i: number) => PLOT_PAD_LEFT + slot * (i + 0.5);
  const room = widths.map((_, i) => {
    const left = i === 0 ? centre(0) - LABEL_GAP / 2 : slot - capped[i - 1] / 2 - LABEL_GAP;
    const right = i === n - 1 ? width - LABEL_GAP / 2 - centre(i) : slot - capped[i + 1] / 2 - LABEL_GAP;
    return Math.max(avail, 2 * Math.min(left, right));
  });

  const cut = (text: string, max: number): [string, boolean] => {
    if (measure(text) <= max) return [text, false];
    let kept = text;
    while (kept.length > 1 && measure(kept.trimEnd() + ELLIPSIS) > max) kept = kept.slice(0, -1);
    return [kept.trimEnd() + ELLIPSIS, true];
  };

  return labels.map((raw, i) => {
    const max = room[i];
    if (widths[i] <= max) return { lines: [plain[i]], cut: false };
    const options: [string, string][] = [];
    for (let k = 1; k < raw.length; k++) {
      if (raw[k] === ' ') options.push([plainLabel(raw.slice(0, k)), plainLabel(raw.slice(k + 1))]);
      else if (raw[k] === SOFT_HYPHEN) options.push([plainLabel(raw.slice(0, k)) + '-', plainLabel(raw.slice(k + 1))]);
      else if (raw[k - 1] === '-') options.push([plainLabel(raw.slice(0, k)), plainLabel(raw.slice(k))]);
    }
    const firstFits = options.filter(([first]) => measure(first) <= max);
    if (!firstFits.length) {
      const [line, isCut] = cut(plain[i], max);
      return { lines: [line], cut: isCut };
    }
    const bothFit = firstFits.filter(([, rest]) => measure(rest) <= max);
    const pool = bothFit.length ? bothFit : firstFits;
    const pick = pool.reduce((a, b) => (measure(b[0]) > measure(a[0]) ? b : a));
    const [second, isCut] = cut(pick[1], max);
    return { lines: [pick[0], second], cut: isCut };
  });
}
