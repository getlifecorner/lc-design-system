import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { BadgeComponent } from './badge.component';

/**
 * Request 071 (3.50, usm-x row 83, AC-16): with `maxWidth`, a projected
 * element with the class `lc-badge__cut` is the only run that is cut; the
 * text before and after it stays whole; the badge's `title` is the whole
 * label. Without `maxWidth` the class has no effect. Widths are measured in
 * the browser (story *Cut Run*); here the rules and the DOM.
 */
const RUN = 'Änderungspaket Jahresabschluss 2026 Nord';

@Component({
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-badge class="cut" variant="info" [rounded]="true" [dot]="true" [maxWidth]="maxWidth()"
      >Aufnahme läuft in <span class="lc-badge__cut">{{ run }}</span> · 3 Objekte</lc-badge
    >
  `,
})
class HostComponent {
  readonly run = RUN;
  readonly maxWidth = signal('min(22rem, 100%)');
}

describe('lc-badge cut run (3.50)', () => {
  const css = '\n' + compile(resolve(__dirname, 'badge.component.scss')).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  const render = async (maxWidth = 'min(22rem, 100%)') => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.maxWidth.set(maxWidth);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.lc-badge') as HTMLElement;
  };

  it('the run is projected into the label as written; the title holds the whole label', async () => {
    const badge = await render();
    expect(badge.classList.contains('lc-badge--truncate')).toBe(true);
    const label = badge.querySelector('.lc-badge__label') as HTMLElement;
    expect(label.querySelector(':scope > .lc-badge__cut')?.textContent).toBe(RUN);
    expect(badge.getAttribute('title')).toBe(`Aufnahme läuft in ${RUN} · 3 Objekte`);
  });

  it('without maxWidth: no truncate class, no title (the cut class alone does nothing)', async () => {
    const badge = await render('');
    expect(badge.classList.contains('lc-badge--truncate')).toBe(false);
    expect(badge.hasAttribute('title')).toBe(false);
    expect(css).not.toMatch(/\n\.lc-badge__cut \{/);
  });

  it('CSS: a label holding a cut run is a flex row with a space-wide gap and no clip of its own', () => {
    expect(rule('.lc-badge--truncate .lc-badge__label:has(> .lc-badge__cut)')).toBe('display: flex; column-gap: 0.3em; overflow: visible;');
  });

  it('CSS: only the cut run shrinks (to 2em) and ends with an ellipsis; glyph room inside its clip', () => {
    expect(rule('.lc-badge--truncate .lc-badge__cut')).toBe(
      'flex: 0 1 auto; min-width: 2em; overflow: hidden; text-overflow: ellipsis; padding-block: 0.2em; margin-block: -0.2em;',
    );
  });

  it('CSS: the 3.49 truncate rule for a plain label keeps its values', () => {
    expect(rule('.lc-badge--truncate .lc-badge__label')).toBe(
      'min-width: 0; overflow: hidden; text-overflow: ellipsis; padding-block: 0.2em; margin-block: -0.2em;',
    );
  });
});
