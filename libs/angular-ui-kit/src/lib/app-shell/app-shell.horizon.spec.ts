import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppShellComponent } from './app-shell.component';

/**
 * lc-app-shell in 3.9 (request 006): the figure slot on the horizon (AS-29,
 * AC-6) and the footer's own row below the horizon (LK-12, AC-4, AC-5). The
 * 3.5 contract is pinned by app-shell.component.spec.ts.
 */
@Component({
  imports: [AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-shell [horizon]="horizon()">
      <header shell-header>Header</header>
      <p class="t-content">Inhalt</p>
      @if (withFigure()) {
        <img shell-horizon-figure class="t-figure" src="/assets/character/hello-light.svg" alt="" width="64" height="64" />
      }
      @if (withFooter()) {
        <footer shell-footer class="t-footer">Footer</footer>
      }
    </lc-app-shell>
  `,
})
class HostComponent {
  readonly horizon = signal(true);
  readonly withFigure = signal(true);
  readonly withFooter = signal(true);
}

/** A shell with the horizon and nothing for its figure slot (an `@if` anchor would be projected there). */
@Component({
  imports: [AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-shell [horizon]="true">
      <p class="t-content">Inhalt</p>
      <footer shell-footer>Footer</footer>
    </lc-app-shell>
  `,
})
class PlainHostComponent {}

/** The element for `selector`; fails the test when it is missing. */
function q<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T & Element>(selector);
  if (!node) throw new Error(`${selector} not found`);
  return node;
}

/** The shell's regions in DOM order, by their BEM element name. */
function regions(el: HTMLElement): string[] {
  return [...q(el, '.lc-app-shell').children].map((child) => child.className);
}

describe('lc-app-shell horizon figure and footer row (AS-29, LK-12)', () => {
  const shellScss = readFileSync(resolve(__dirname, 'app-shell.component.scss'), 'utf-8');

  function render(setup?: (host: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent, PlainHostComponent] }).compileComponents();
  });

  describe('[shell-horizon-figure] slot', () => {
    it('AC-6: projects the figure as a direct child of the shell’s .lc-horizon', () => {
      const { el } = render();
      const figure = q(el, '.t-figure');
      expect(figure.parentElement?.classList).toContain('lc-app-shell__horizon');
      expect(figure.parentElement?.classList).toContain('lc-horizon');
      expect(figure.hasAttribute('shell-horizon-figure')).toBe(true);
      // Not in the page's region, whatever the default slot takes.
      expect(q(el, '.lc-app-shell__body').contains(figure)).toBe(false);
    });

    it('hides the horizon, and so the figure, from assistive technology; the footer stays outside it', () => {
      const { el } = render();
      const horizon = q(el, '.lc-app-shell__horizon');
      expect(horizon.getAttribute('aria-hidden')).toBe('true');
      expect(horizon.contains(q(el, '.t-footer'))).toBe(false);
    });

    it('leaves the horizon empty without a figure (renders as in 3.8)', () => {
      const fixture = TestBed.createComponent(PlainHostComponent);
      fixture.detectChanges();
      const horizon = q(fixture.nativeElement as HTMLElement, '.lc-app-shell__horizon');
      expect(horizon.childNodes).toHaveLength(0);
      expect(horizon.className).toBe('lc-app-shell__horizon lc-horizon');
    });

    it('shows the figure only with the horizon', () => {
      const { el } = render((host) => host.horizon.set(false));
      expect(el.querySelector('.lc-horizon')).toBeNull();
      expect(el.querySelector('.t-figure')).toBeNull();
    });
  });

  describe('default rendering (no horizon) is unchanged', () => {
    it('keeps the 3.8 regions, classes and attributes', () => {
      const { el } = render((host) => host.horizon.set(false));
      const shell = q(el, '.lc-app-shell');
      expect(shell.className).toBe('lc-app-shell');
      expect(regions(el)).toEqual([
        'lc-app-shell__header',
        'lc-app-shell__nav',
        'lc-app-shell__body',
        'lc-app-shell__footer',
        'lc-app-shell__bottom-nav',
      ]);
      expect(el.querySelector('[aria-hidden]')).toBeNull();
      expect(q(el, '.lc-app-shell__footer .t-footer')).toBeTruthy();
    });

    it('puts the horizon between the page and the footer when on, as in 3.8', () => {
      const { el } = render();
      expect(regions(el)).toEqual([
        'lc-app-shell__header',
        'lc-app-shell__nav',
        'lc-app-shell__body',
        'lc-app-shell__horizon lc-horizon',
        'lc-app-shell__footer',
        'lc-app-shell__bottom-nav',
      ]);
    });
  });

  describe('footer row below the horizon (source contract)', () => {
    it('AC-4: with the horizon, the footer takes a last row of its own, full width, in the land’s colour', () => {
      expect(shellScss).toMatch(/\n\.lc-app-shell--horizon \{\s*grid-template-rows: auto auto 1fr auto;\s*\}/);
      const footer = /\n\.lc-app-shell--horizon \.lc-app-shell__footer \{([^}]*)\}/.exec(shellScss)?.[1] ?? '';
      expect(footer).toMatch(/grid-row: 4;/);
      expect(footer).toMatch(/grid-column: 1 \/ -1;/);
      expect(footer).toMatch(/background-color: var\(--color-land-3\);/);
      expect(footer).toMatch(/position: relative;/);
      expect(footer).toMatch(/z-index: 1;/);
    });

    it('AC-5: an empty footer takes no space, so its row is 0 px', () => {
      expect(shellScss).toMatch(/\.lc-app-shell__footer:empty,\s*\.lc-app-shell__header:empty \{\s*display: none;/);
      const { el } = render((host) => host.withFooter.set(false));
      expect(q(el, '.lc-app-shell__footer').matches(':empty')).toBe(true);
    });

    it('keeps the footer after the page without the horizon (3.8 placement)', () => {
      const footer = /\n\.lc-app-shell__footer \{([^}]*)\}/.exec(shellScss)?.[1] ?? '';
      expect(footer).toMatch(/grid-area: end;/);
      expect(footer).toMatch(/align-self: end;/);
      expect(shellScss).toMatch(/\n\.lc-app-shell \{[^}]*grid-template-rows: auto auto 1fr;/);
    });

    it('leaves :has() and :where() for the figure to the global stylesheet', () => {
      expect(shellScss).not.toMatch(/shell-horizon-figure/);
    });
  });
});
