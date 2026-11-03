import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Request 044 (3.27.2, F-28): the remove button of a pending attachment keeps
 * its 20 px look but gets a 44 × 44 px hit area (WCAG 2.5.8), the pattern of
 * the send and attach buttons (043 F-22); wrapped chip rows move 14 px apart so
 * two stacked areas meet instead of overlapping (design 044 D-1).
 */
const css = compile(resolve(__dirname, 'chat.component.scss')).css;
const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
const rulesOf = (text: string) =>
  [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
    body: m[2],
  }));
const decls = (body: string): Record<string, string> =>
  Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
/** Every rule naming `selector`, merged in source order, forced-colours blocks left out. */
const fills = (selector: string, text = css.replace(forcedBlock, '')): Record<string, string> => {
  const found = rulesOf(text).filter((r) => r.selectors.includes(selector));
  expect([selector, found.length > 0]).toEqual([selector, true]);
  return Object.assign({}, ...found.map((r) => decls(r.body)));
};
const TOUCH = 'var(--size-min-touch-height, 2.75rem)';

describe('lc-chat pending-attachment remove target (request 044, F-28)', () => {
  it('AC-1: a positioned 20 px button with a transparent ::before of exactly 44 × 44 px, centred', () => {
    const button = fills('.lc-chat__pending-remove');
    expect([button.position, button.width, button.height, button['border-radius']]).toEqual(['relative', '1.25rem', '1.25rem', '50%']);
    expect(fills('.lc-chat__pending-remove::before')).toEqual({
      content: '""',
      position: 'absolute',
      inset: `calc((1.25rem - ${TOUCH}) / 2)`,
    });
    // 20 − 44 = −24, halved: 12 px out on every side → 44 × 44.
    expect(20 - 2 * ((20 - 44) / 2)).toBe(44);
  });

  it('AC-1, AC-3: the area paints nothing (no fill, border, outline or shadow), also in forced colours', () => {
    for (const block of [css.replace(forcedBlock, ''), [...css.matchAll(forcedBlock)].map((m) => m[1]).join('\n')]) {
      for (const r of rulesOf(block).filter((x) => x.selectors.some((s) => s.startsWith('.lc-chat__pending-remove') && s.includes('::before')))) {
        expect(Object.keys(decls(r.body)).filter((p) => /background|border|outline|shadow|color/.test(p))).toEqual([]);
      }
    }
  });

  it('AC-1 (D-1): wrapped chip rows are 14 px apart, columns stay 6 px', () => {
    expect(fills('.lc-chat__pending-attachments')).toEqual({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.875rem 0.375rem' });
    // Two areas 12 px past their 30 px chips meet at the middle of a 14 px gap
    // when the × line up: (44 − 30) / 2 = 7 px into the gap from each side.
    expect((44 - 30) / 2 + (44 - 30) / 2).toBe(14);
  });

  it('AC-2: the chip, its name and the size label are unchanged (no min-inline-size on the nowrap chip)', () => {
    expect(fills('.lc-chat__pending-attachment')).toEqual({
      display: 'inline-flex',
      'align-items': 'center',
      gap: '0.375rem',
      padding: '0.25rem 0.375rem 0.25rem 0.5rem',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      'border-radius': 'var(--border-radius-md, 0.5rem)',
      'font-size': 'var(--font-size-xs, 0.75rem)',
      color: 'var(--color-text-primary)',
      'max-width': '16rem',
    });
    expect(fills('.lc-chat__pending-name')).toEqual({ overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', 'max-width': '9rem' });
  });

  it('AC-3: the ring stays on the 20 px button (kit ring) and turns Highlight in forced colours', () => {
    const ring = fills('.lc-chat__pending-remove:focus-visible');
    expect([ring.outline, ring['outline-offset']]).toEqual(['2px solid var(--color-primary-500)', '2px']);
    const forced = [...css.matchAll(forcedBlock)].map((m) => m[1]).join('\n');
    expect(fills('.lc-chat__pending-remove:focus-visible', forced)).toEqual({ 'outline-color': 'Highlight' });
  });

  it('AC-1: the hover fill and colours of the button are unchanged', () => {
    expect(fills('.lc-chat__pending-remove:hover')).toEqual({ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' });
    const button = fills('.lc-chat__pending-remove');
    expect([button.background, button.color, button.border, button.cursor]).toEqual(['transparent', 'var(--color-text-tertiary)', 'none', 'pointer']);
  });
});
