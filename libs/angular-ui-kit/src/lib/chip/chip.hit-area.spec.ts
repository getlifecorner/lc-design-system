import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';

/** Request 065, backlog 060-n5 (AC-34): the remove × gets a 24 × 24 hit area; chips keep their size. */
describe('lc-chip remove hit area (3.45)', () => {
  const css = compile(resolve(__dirname, 'chip.component.scss')).css;

  it('the × button is the positioning box of a 24 px area (14 px glyph + 2 × 5 px)', () => {
    expect(css).toMatch(/\n\.lc-chip__delete \{[^}]*flex-shrink: 0;\s*position: relative;/);
    expect(css).toMatch(/\n\.lc-chip__delete::before \{\s*content: "";\s*position: absolute;\s*inset: -5px;\s*\}/);
  });

  it('the chip heights are unchanged (sm 1.5rem); the exception is documented on `removable`', () => {
    expect(css).toMatch(/\n\.lc-chip--sm \{[^}]*height: 1\.5rem;/);
    const source = readFileSync(resolve(__dirname, 'chip.component.ts'), 'utf-8');
    expect(source).toMatch(/24 × 24 px hit area[\s\S]*?WCAG 2\.5\.8[\s\S]*?@default false\s*\*\/\s*removable = input<boolean>\(false\);/);
  });
});
