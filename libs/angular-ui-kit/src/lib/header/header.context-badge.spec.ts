import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { HeaderComponent, type HeaderContextBadge } from './header.component';
import { containsWords, labelWords } from '../internal/a11y/label-in-name';

/**
 * 3.36 (request 056): `contextBadge` (app-shell row 1, AC-9, AC-10, D-4) and
 * `hamburgerClick` with the hamburger's `<button>` (055-n3, AC-31, D-10).
 */
describe('HeaderComponent — contextBadge and hamburgerClick (3.36, request 056)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  const GERMAN = { contextLabel: 'Monatsstand', contextAriaLabel: 'Monatsstand wählen', contextName: 'Oktober 2026 · Fassung 1' };
  const RELEASED: HeaderContextBadge = { label: 'Freigegeben', variant: 'success' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
  });

  afterEach(() => fixture.destroy());

  function render(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const button = () => el.querySelector('.lc-header__context-info') as HTMLButtonElement;
  const badge = () => button().querySelector('lc-badge') as HTMLElement | null;
  const strip = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');

  describe('contextBadge (AC-9, AC-10)', () => {
    it('defaults to undefined: the button, its children and its name are those of 3.35', () => {
      render(GERMAN);
      expect(fixture.componentInstance.contextBadge()).toBeUndefined();
      expect(badge()).toBeNull();
      expect(button().className).toBe('lc-header__context-info');
      expect(strip(button().innerHTML)).toBe(
        '<span class="lc-header__context-label">Monatsstand</span> ' +
          '<span class="lc-header__context-name" title="Oktober 2026 · Fassung 1">Oktober 2026 · Fassung 1</span>',
      );
      expect(button().getAttribute('aria-label')).toBe('Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1');
    });

    it.each(['inline', 'below'] as const)('%s: an lc-badge (sm, rounded, variant) after the name, inside the button', (placement) => {
      render({ ...GERMAN, contextPlacement: placement, contextBadge: RELEASED });
      const row = button().querySelector('.lc-header__context-row') as HTMLElement;
      expect(row).not.toBeNull();
      expect([...row.children].map((c) => c.className.split(' ')[0])).toEqual(['lc-header__context-name', 'lc-header__context-badge']);
      expect(badge()?.textContent?.trim()).toBe('Freigegeben');
      const inner = badge()?.querySelector('span') as HTMLElement;
      expect(inner.className.split(' ').sort()).toEqual(['lc-badge', 'lc-badge--rounded', 'lc-badge--sm', 'lc-badge--success'].sort());
      expect(button().classList).toContain('lc-header__context-info--badge');
      expect(button().querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
    });

    it('a badge without a variant is the default one', () => {
      render({ ...GERMAN, contextBadge: { label: 'Ersetzt' } });
      expect(badge()?.querySelector('span')?.classList).toContain('lc-badge--default');
    });

    it('AC-10: the name ends with the badge word, and the visible text is one run of the name (WCAG 2.5.3)', () => {
      render({ ...GERMAN, contextBadge: RELEASED });
      const name = button().getAttribute('aria-label') as string;
      expect(name).toBe('Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1, Freigegeben');
      expect(containsWords(labelWords(name), labelWords(button().textContent ?? ''))).toBe(true);
    });

    it('is not appended twice when contextAriaLabel already holds it; an empty label adds nothing', () => {
      render({ ...GERMAN, contextAriaLabel: 'Monatsstand wählen, Freigegeben', contextBadge: RELEASED });
      expect(button().getAttribute('aria-label')).toBe('Monatsstand wählen, Freigegeben, Monatsstand Oktober 2026 · Fassung 1');
      render({ contextAriaLabel: 'Freigegeben: Monatsstand Oktober 2026 · Fassung 1' });
      expect(button().getAttribute('aria-label')).toBe('Freigegeben: Monatsstand Oktober 2026 · Fassung 1');
      render({ contextBadge: { label: '  ' } });
      expect(button().getAttribute('aria-label')).toBe('Freigegeben: Monatsstand Oktober 2026 · Fassung 1');
    });

    it('clearing the badge restores the 3.35 button', () => {
      render({ ...GERMAN, contextBadge: RELEASED });
      render({ contextBadge: undefined });
      expect(badge()).toBeNull();
      expect(button().className).toBe('lc-header__context-info');
      expect(button().getAttribute('aria-label')).toBe('Monatsstand wählen, Monatsstand Oktober 2026 · Fassung 1');
    });

    it('contextClick and focusContext() behave as before', async () => {
      render({ ...GERMAN, contextPlacement: 'below', contextBadge: RELEASED });
      let clicks = 0;
      fixture.componentInstance.contextClick.subscribe(() => clicks++);
      badge()?.click();
      button().click();
      expect(clicks).toBe(2);
      fixture.componentInstance.focusContext();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement).toBe(button());
    });

    it('styles: 340 px with a badge, one row with the ellipsis on the name, block margins on the badge', () => {
      const css = compile(resolve(__dirname, 'header.component.scss')).css;
      expect(css).toMatch(/\n\.lc-header__context-info--badge \{\s*max-width: 340px;\s*\}/);
      expect(css).toMatch(/\n\.lc-header__context-row \{\s*display: flex;\s*align-items: center;\s*gap: var\(--spacing-1-5\);\s*min-width: 0;\s*max-width: 100%;\s*\}/);
      expect(css).toMatch(/\n\.lc-header__context-row \.lc-header__context-name \{\s*flex: 0 1 auto;\s*min-width: 0;\s*\}/);
      expect(css).toMatch(/\n\.lc-header__context-badge \{\s*display: inline-flex;\s*flex-shrink: 0;\s*margin-block: calc\(0\.65 \* var\(--font-size-sm\) - 0\.75rem\);\s*\}/);
      // The cap comes after the 220 px rule (same weight) and the below layout still lifts it.
      expect(css.indexOf('\n.lc-header__context-info--badge {')).toBeGreaterThan(css.indexOf('\n.lc-header__context-info {'));
      expect(css).toMatch(/\.lc-header--context-below \.lc-header__context-info \{[^}]*max-width: none;/);
    });
  });

  describe('hamburgerClick (AC-31, D-10)', () => {
    it("emits the hamburger's native <button>", () => {
      render({ showHamburger: true });
      const emitted: HTMLElement[] = [];
      fixture.componentInstance.hamburgerClick.subscribe((b) => emitted.push(b));
      const native = el.querySelector('.lc-header__hamburger button') as HTMLButtonElement;
      native.click();
      expect(emitted).toEqual([native]);
      expect(emitted[0].tagName).toBe('BUTTON');
    });

    it('handlers without $event, and $event handed to returnFocusTo, both work in a template', () => {
      @Component({
        standalone: true,
        imports: [HeaderComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          <lc-header [showHamburger]="true" (hamburgerClick)="toggle()" />
          <lc-header [showHamburger]="true" (hamburgerClick)="trigger.set($event)" />
        `,
      })
      class Host {
        readonly count = signal(0);
        readonly trigger = signal<HTMLElement | null>(null);
        toggle(): void {
          this.count.update((n) => n + 1);
        }
      }
      const host = TestBed.createComponent(Host);
      host.detectChanges();
      const [first, second] = Array.from((host.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.lc-header__hamburger button'));
      first.click();
      second.click();
      expect(host.componentInstance.count()).toBe(1);
      expect(host.componentInstance.trigger()).toBe(second);
      host.destroy();
    });

    it('called without a rendered hamburger it still emits (the header host)', () => {
      render({});
      const emitted: HTMLElement[] = [];
      fixture.componentInstance.hamburgerClick.subscribe((b) => emitted.push(b));
      fixture.componentInstance.onHamburgerClick();
      expect(emitted).toEqual([el]);
    });
  });
});
