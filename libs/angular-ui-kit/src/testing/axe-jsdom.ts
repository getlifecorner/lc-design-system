import * as axe from 'axe-core';

/**
 * axe-core 4.14 (devDependency) in Jest's jsdom, shared by the `*.axe.spec.ts`
 * files (requests 014 and 015, AS-33). Test-only: excluded from the library
 * build (`tsconfig.lib.json`) and never exported.
 *
 * `color-contrast` and `target-size` need layout, which jsdom does not have:
 * `story-shots --axe` runs them in the browser, in light and dark, at 360 and
 * 1280 px. Run one audit at a time (axe refuses parallel runs): every caller
 * awaits it.
 */

/** The WCAG 2.0–2.2 A/AA tags the kit is audited on. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** WCAG 2.5.3 Label in Name. */
export const LABEL_IN_NAME = 'label-content-name-mismatch';

export type AxeOutcome = 'violation' | 'pass' | 'incomplete' | 'inapplicable' | 'not run';

/**
 * jsdom has no 2D canvas, and axe's icon-ligature check (part of
 * `label-content-name-mismatch`) draws the visible text. Every glyph here is
 * 10 px wide and fully inked, so no text counts as an icon ligature and the
 * rule decides as in a browser with a text font.
 */
export function fakeCanvasContext(canvas: HTMLCanvasElement): unknown {
  return {
    canvas,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    measureText: (text: string) => ({ width: 10 * Array.from(text).length }),
    fillText: () => undefined,
    clearRect: () => undefined,
    getImageData: (_x: number, _y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(Math.max(1, Math.ceil(width) * Math.ceil(height)) * 4).fill(255),
    }),
  };
}

/** Installs the fake canvas on `HTMLCanvasElement`; call the returned function to restore it. */
export function installFakeCanvas(): () => void {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    return fakeCanvasContext(this);
  } as unknown as typeof original;
  return () => {
    HTMLCanvasElement.prototype.getContext = original;
  };
}

/** One axe run on the kit's tags, without the layout rules. */
export function audit(context: Element): Promise<axe.AxeResults> {
  return axe.run(context, {
    runOnly: { type: 'tag', values: AXE_TAGS },
    rules: { 'color-contrast': { enabled: false }, 'target-size': { enabled: false } },
  });
}

/** Violations as `rule: targets`, so a failure names what failed; `except` drops rules by id. */
export function violations(results: axe.AxeResults, except: readonly string[] = []): string[] {
  return results.violations
    .filter((v) => !except.includes(v.id))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
}

/** The outcome of rule `id`; a rule with passing and failing nodes is a violation. */
export function outcome(results: axe.AxeResults, id: string): AxeOutcome {
  if (results.violations.some((r) => r.id === id)) return 'violation';
  if (results.incomplete.some((r) => r.id === id)) return 'incomplete';
  if (results.passes.some((r) => r.id === id)) return 'pass';
  if (results.inapplicable.some((r) => r.id === id)) return 'inapplicable';
  return 'not run';
}

/** The targets of rule `id`'s violating nodes, as elements. */
export function violatingElements(results: axe.AxeResults, id: string): Element[] {
  const nodes = results.violations.find((v) => v.id === id)?.nodes ?? [];
  return nodes.map((n) => document.querySelector(String(n.target[0]))).filter((e): e is Element => e !== null);
}

/** The outcome of rule `id` for one element (other nodes of the rule aside). */
export function outcomeFor(results: axe.AxeResults, id: string, element: Element): AxeOutcome {
  const has = (list: axe.Result[]) =>
    list.some((r) => r.id === id && r.nodes.some((n) => document.querySelector(String(n.target[0])) === element));
  if (has(results.violations)) return 'violation';
  if (has(results.incomplete)) return 'incomplete';
  if (has(results.passes)) return 'pass';
  return 'inapplicable';
}

/** The accessible name as axe computes it (not just the attribute). */
export function computedName(root: Element, element: Element): string {
  axe.setup(root);
  try {
    return axe.commons.text.accessibleText(element);
  } finally {
    axe.teardown();
  }
}

export { axe };
