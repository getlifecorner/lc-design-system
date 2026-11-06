import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { resolve } from 'path';
import { compile } from 'sass';
import { TagInputComponent } from './tag-input.component';

/**
 * 3.33 (request 052, F-32, AC-11, D-8): a long tag wraps instead of ending
 * in an ellipsis, so its full text is readable; no `title` is needed.
 */
@Component({
  standalone: true,
  imports: [TagInputComponent, FormsModule],
  template: `<lc-tag-input lang="de" label="Schlagwörter" removeTagAriaLabel="Entfernen" [ngModel]="seed"></lc-tag-input>`,
})
class Host {
  readonly seed = ['Leistungsverrechnungsschlüssel Nebenkosten 2026', 'Kostenstellenverantwortung', 'Q3'];
}

describe('lc-tag-input — long tags (3.33, F-32)', () => {
  const css = compile(resolve(__dirname, 'tag-input.component.scss')).css;
  const at = css.indexOf('\n.lc-tag-input__tag-text {');
  const body = css.slice(at, css.indexOf('}', at));

  it('wraps (no nowrap, no ellipsis) and hyphenates by the host language, inside 150 px', () => {
    expect(at).toBeGreaterThan(-1);
    expect(body).toMatch(/max-width: 150px;/);
    expect(body).toMatch(/white-space: normal;/);
    expect(body).toMatch(/overflow-wrap: break-word;/);
    expect(body).toMatch(/hyphens: auto;/);
    expect(body).toMatch(/hyphenate-limit-chars: 12 4 3;/);
    expect(body).not.toMatch(/text-overflow|nowrap/);
  });

  it('rounds a wrapped chip with half a one-line chip, after the pill fallback (D-8, review r1 #1)', () => {
    const chipAt = css.indexOf('\n.lc-tag-input__tag {');
    const chip = css.slice(chipAt, css.indexOf('}', chipAt));
    expect(chipAt).toBeGreaterThan(-1);
    expect(chip).toMatch(/border-radius: var\(--border-radius-full\);\s*border-radius: calc\(0\.5lh \+ 3px\);/);
    expect(chip.match(/border-radius:/g)).toHaveLength(2);
  });

  it('keeps the × hit area (24 × 24 px inside the chip) unchanged', () => {
    expect(css).toMatch(/\.lc-tag-input__tag-remove::before \{\s*content: "";\s*position: absolute;\s*inset: -0\.25rem;\s*\}/);
  });

  it('renders the full text, with no title (the text itself is readable)', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const texts = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.lc-tag-input__tag-text')];
    expect(texts.map((t) => t.textContent?.trim())).toEqual(['Leistungsverrechnungsschlüssel Nebenkosten 2026', 'Kostenstellenverantwortung', 'Q3']);
    expect(texts.some((t) => t.hasAttribute('title'))).toBe(false);
    fixture.destroy();
  });
});
