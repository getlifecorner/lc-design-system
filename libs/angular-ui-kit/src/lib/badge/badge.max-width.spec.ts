import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { BadgeComponent } from './badge.component';

/**
 * 3.49 (request 069, usm-x row 72, design D-7, §3C): the projected content
 * sits in one inline label (`.lc-badge__label`), so mixed content keeps its
 * spaces; a projected `lc-icon` keeps its own slot before it. `maxWidth`
 * cuts the label with an ellipsis and gives the badge the whole text as
 * `title`; `wrap` wins over it.
 */
const NAME = 'USM-1209 Zeitbuchung: Quartalsabschluss Kostenstellenplanung';

@Component({
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-badge class="mixed" variant="info" [rounded]="true" [dot]="true" [maxWidth]="maxWidth()" [wrap]="wrap()">Aufnahme läuft in <strong>{{ name() }}</strong></lc-badge>
    <lc-badge class="seal" variant="success" size="sm">
      @if (seal()) {
        <lc-icon name="check" size="xs" [decorative]="true" />
      }
      <span>Geladen</span>
    </lc-badge>
    <lc-badge class="titled" title="Eigener Titel" maxWidth="8rem">{{ name() }}</lc-badge>
    <lc-badge class="empty" [dot]="true" maxWidth="8rem"></lc-badge>
  `,
})
class HostComponent {
  readonly maxWidth = signal('');
  readonly wrap = signal(false);
  readonly name = signal('USM-1209 Zeitbuchung');
  readonly seal = signal(true);
}

describe('lc-badge label and maxWidth (3.49, request 069)', () => {
  const css = '\n' + compile(resolve(__dirname, 'badge.component.scss')).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }),
  );

  const render = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const badge = (cls: string) => el.querySelector(`lc-badge.${cls} > span.lc-badge`) as HTMLElement;
    return { fixture, host: fixture.componentInstance, badge };
  };
  const settle = async (fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  describe('AC-12: one inline label keeps the spaces between runs', () => {
    it('dot, then the label with the text and the strong run, spaces kept', async () => {
      const { badge } = await render();
      const span = badge('mixed');
      expect(Array.from(span.children).map((c) => c.className)).toEqual(['lc-badge__dot', 'lc-badge__label']);
      const label = span.querySelector('.lc-badge__label') as HTMLElement;
      expect(label.textContent).toBe('Aufnahme läuft in USM-1209 Zeitbuchung');
      expect(label.querySelector('strong')?.textContent).toBe('USM-1209 Zeitbuchung');
    });

    it('a projected lc-icon (the single root of an @if) keeps its slot before the label', async () => {
      const { fixture, host, badge } = await render();
      expect(Array.from(badge('seal').children).map((c) => c.tagName.toLowerCase() + (c.className ? `.${c.className.split(' ')[0]}` : ''))).toEqual([
        'lc-icon',
        'span.lc-badge__label',
      ]);
      expect(badge('seal').querySelector('.lc-badge__label')?.innerHTML.replace(/<!--[^]*?-->/g, '')).toBe('<span>Geladen</span>');
      host.seal.set(false);
      await settle(fixture);
      expect(badge('seal').querySelector('lc-icon')).toBeNull();
    });

    it('an empty label takes no room (icon-only and dot-only badges keep their gap); otherwise no rules of its own', () => {
      expect(rule('.lc-badge__label:empty')).toBe('display: none;');
      expect(css).not.toMatch(/\n\.lc-badge__label \{/);
    });
  });

  describe('AC-13: maxWidth cuts the label with an ellipsis and sets the whole text as title', () => {
    it('defaults to "" (no cap): no class, no style, no title', async () => {
      const { badge } = await render();
      const span = badge('mixed');
      expect(span.classList.contains('lc-badge--truncate')).toBe(false);
      expect(span.hasAttribute('style')).toBe(false);
      expect(span.hasAttribute('title')).toBe(false);
      const source = readFileSync(resolve(__dirname, 'badge.component.ts'), 'utf8');
      expect(source).toMatch(/Empty: no cap\.\s*\n\s*\* @default ''\s*\n\s*\*\/\s*\n\s*readonly maxWidth = input<string>\(''\);/);
    });

    it('with a value: class, inline max-width, title = the label text (whitespace collapsed)', async () => {
      const { fixture, host, badge } = await render();
      host.maxWidth.set('16rem');
      host.name.set(NAME);
      await settle(fixture);
      const span = badge('mixed');
      expect(span.classList.contains('lc-badge--truncate')).toBe(true);
      expect(span.style.maxWidth).toBe('16rem');
      expect(span.getAttribute('title')).toBe(`Aufnahme läuft in ${NAME}`);
    });

    it('the title follows the projected text while cut', async () => {
      const { fixture, host, badge } = await render();
      host.maxWidth.set('16rem');
      await settle(fixture);
      host.name.set('USM-1300 Urlaubsplanung');
      await settle(fixture);
      await new Promise((r) => setTimeout(r));
      fixture.detectChanges();
      expect(badge('mixed').getAttribute('title')).toBe('Aufnahme läuft in USM-1300 Urlaubsplanung');
    });

    it('no title when the host has its own, or the label is empty', async () => {
      const { badge } = await render();
      expect(badge('titled').classList.contains('lc-badge--truncate')).toBe(true);
      expect(badge('titled').hasAttribute('title')).toBe(false);
      expect(badge('empty').hasAttribute('title')).toBe(false);
    });

    it('rules: the label shrinks and clips with an ellipsis; padding inside the clip, cancelled by the margin', () => {
      expect(rule('.lc-badge--truncate .lc-badge__label')).toBe(
        'min-width: 0; overflow: hidden; text-overflow: ellipsis; padding-block: 0.2em; margin-block: -0.2em;',
      );
      // One line comes from the badge's own nowrap; the dot and icon keep flex-shrink: 0.
      expect(css).toMatch(/\n\.lc-badge \{[^}]*white-space: nowrap;/);
      expect(rule('.lc-badge__icon')).toContain('flex-shrink: 0;');
    });
  });

  describe('AC-14: the text stays in the DOM; wrap wins over maxWidth', () => {
    it('the whole text is in the label (clipped visually only)', async () => {
      const { fixture, host, badge } = await render();
      host.maxWidth.set('8rem');
      host.name.set(NAME);
      await settle(fixture);
      expect(badge('mixed').querySelector('.lc-badge__label')?.textContent).toBe(`Aufnahme läuft in ${NAME}`);
    });

    it('wrap + maxWidth: no class, style or title', async () => {
      const { fixture, host, badge } = await render();
      host.maxWidth.set('12rem');
      host.wrap.set(true);
      await settle(fixture);
      const span = badge('mixed');
      expect(span.classList.contains('lc-badge--wrap')).toBe(true);
      expect(span.classList.contains('lc-badge--truncate')).toBe(false);
      expect(span.hasAttribute('style')).toBe(false);
      expect(span.hasAttribute('title')).toBe(false);
    });
  });
});
