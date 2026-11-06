import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { HeaderComponent, type HeaderContextPlacement } from './header.component';

/**
 * 3.33 (request 052, app-shell row 1, AC-5 to AC-8): `contextPlacement`.
 * jsdom has no media queries or layout: the class contract is tested on the
 * element, the ≤ 640 px rules in the compiled CSS, the geometry in the story.
 */
describe('HeaderComponent — contextPlacement (3.33, request 052)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const header = () => el.querySelector('header.lc-header') as HTMLElement;
  const contextButtons = () => el.querySelectorAll<HTMLButtonElement>('.lc-header__context-info');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
  });

  it("AC-5: defaults to 'inline', which adds no class (default rendering unchanged)", () => {
    const placement: HeaderContextPlacement = fixture.componentInstance.contextPlacement();
    expect(placement).toBe('inline');
    set({ title: 'Finance Intelligence', contextLabel: 'Monatsstand', contextName: 'September 2026 · Fassung 1' });
    expect(header().className).not.toContain('context-below');
    expect([...header().classList].sort()).toEqual(['lc-header', 'lc-header--size-md']);
  });

  it("AC-6: 'below' with a contextName sets lc-header--context-below", () => {
    set({ contextPlacement: 'below', contextLabel: 'Monatsstand', contextName: 'September 2026 · Fassung 1' });
    expect(header().classList).toContain('lc-header--context-below');
  });

  it("AC-8: 'below' without a contextName adds no class and no button (no second row)", () => {
    set({ contextPlacement: 'below', contextLabel: 'Monatsstand' });
    expect(header().classList).not.toContain('lc-header--context-below');
    expect(contextButtons()).toHaveLength(0);
  });

  it('AC-6, AC-8: one button in both placements, same name, label before name, emits contextClick', () => {
    set({
      contextPlacement: 'below',
      contextLabel: 'Monatsstand',
      contextName: 'September 2026 · Fassung 1',
      contextAriaLabel: 'Monatsstand wählen',
    });
    expect(contextButtons()).toHaveLength(1);
    const button = contextButtons()[0];
    expect(button.getAttribute('aria-label')).toBe('Monatsstand wählen, Monatsstand September 2026 · Fassung 1');
    expect(button.textContent?.replace(/\s+/g, ' ').trim()).toBe('Monatsstand September 2026 · Fassung 1');
    expect(button.querySelector('.lc-header__context-name')?.getAttribute('title')).toBe('September 2026 · Fassung 1');
    let clicks = 0;
    fixture.componentInstance.contextClick.subscribe(() => clicks++);
    button.click();
    expect(clicks).toBe(1);
  });

  it('AC-6: the DOM order is unchanged (end slot, theme, context, account menu): only CSS moves the button', () => {
    set({ contextPlacement: 'below', contextName: 'Acme', showThemeButton: false });
    const end = el.querySelector('.lc-header__end') as HTMLElement;
    expect([...end.children].map((c) => c.tagName.toLowerCase())).toEqual(['button', 'lc-menu']);
    expect(end.children[0].classList).toContain('lc-header__context-info');
  });

  describe('AC-6, AC-7: the rules (compiled CSS)', () => {
    const css = compile(resolve(__dirname, 'header.component.scss')).css;
    const at = css.indexOf('.lc-header--context-below');
    const block = css.slice(css.lastIndexOf('@media', at), css.indexOf('\n}\n', at) + 2);

    it('apply only up to 640 px', () => {
      expect(at).toBeGreaterThan(-1);
      expect(block.startsWith('@media (max-width: 640px) {')).toBe(true);
      // Nowhere else: from 641 px the class changes nothing.
      expect(css.indexOf('.lc-header--context-below', css.indexOf('\n}\n', at))).toBe(-1);
    });

    it('dissolve the end group and give the button a full, 44 px row after the first', () => {
      expect(block).toMatch(/\.lc-header--context-below \{\s*justify-content: flex-end;\s*\}/);
      expect(block).toMatch(/\.lc-header--context-below \.lc-header__end \{\s*display: contents;\s*\}/);
      expect(block).toMatch(
        /\.lc-header--context-below \.lc-header__context-info \{\s*display: flex;\s*order: 2;\s*flex: 1 0 calc\(100% \+ 2 \* var\(--spacing-3\)\);\s*margin: 0 calc\(-1 \* var\(--spacing-3\)\) var\(--spacing-2\);\s*max-width: none;\s*min-height: var\(--size-min-touch-height, 2\.75rem\);\s*align-items: flex-start;\s*justify-content: center;\s*text-align: start;\s*\}/,
      );
    });

    it("AC-7: keep 'inline' hidden up to 640 px, as before", () => {
      expect(css).toMatch(/@media \(max-width: 640px\) \{\s*\.lc-header__context-info \{\s*display: none;\s*\}/);
    });
  });
});
