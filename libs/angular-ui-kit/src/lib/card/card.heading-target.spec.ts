import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { CardClickTarget, CardComponent, CardHeaderSize } from './card.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * Request 064 (3.44): usm-x row 24 (AC-20: `clickTarget`, `truncateTitle`) and
 * row 17 (AC-12 tile tokens, AC-13 divider hook and body-less head, AC-14
 * `headerSize`).
 */
@Component({
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Übersicht</h2>
    <lc-card
      [title]="title()"
      [clickable]="clickable()"
      [clickTarget]="clickTarget()"
      [truncateTitle]="truncate()"
      [headerSize]="headerSize()"
      [ariaLabel]="ariaLabel()"
      badge="Neu"
      (cardClick)="clicks = clicks + 1"
    >
      <p class="body">Stand 17. November</p>
      <button type="button" class="action">Aktion</button>
    </lc-card>
  `,
})
class HostComponent {
  readonly title = signal<string | undefined>('Rechnungsübersicht Januar bis Dezember');
  readonly clickable = signal(true);
  readonly clickTarget = signal<CardClickTarget>('card');
  readonly truncate = signal(false);
  readonly headerSize = signal<CardHeaderSize>('md');
  readonly ariaLabel = signal<string | undefined>(undefined);
  clicks = 0;
}

describe('lc-card 3.44 (request 064)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const card = () => el().querySelector('.card') as HTMLElement;
  const sorted = (e: Element) => [...e.classList].sort().join(' ');

  describe('AC-20: clickTarget', () => {
    it('defaults to card: role=button, tabindex 0, the same classes as before', () => {
      fixture.detectChanges();
      const lc = fixture.debugElement.children[1].componentInstance as CardComponent;
      expect(lc.clickTarget()).toBe('card');
      expect(lc.truncateTitle()).toBe(false);
      expect(lc.headerSize()).toBe('md');
      expect(card().getAttribute('role')).toBe('button');
      expect(card().getAttribute('tabindex')).toBe('0');
      expect(sorted(card())).toBe('card card-clickable card-elevated card-padding-md card-radius-md');
      expect(el().querySelector('.card__title')?.hasAttribute('title')).toBe(false);
      expect(el().querySelector('.card__link')).toBeNull();
    });

    it('heading: a <button> inside the heading, the card an article without tabindex, one tab stop', () => {
      host.clickTarget.set('heading');
      fixture.detectChanges();
      const button = el().querySelector('h3.card__title > button.card__link') as HTMLButtonElement;
      expect(button).not.toBeNull();
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('Rechnungsübersicht Januar bis Dezember');
      expect(card().getAttribute('role')).toBe('article');
      expect(card().hasAttribute('tabindex')).toBe(false);
      expect(sorted(card())).toBe('card card-elevated card-linked card-padding-md card-radius-md');
      const tabStops = [...el().querySelectorAll<HTMLElement>('button, [tabindex]')].filter((n) => n.tabIndex >= 0 && !n.classList.contains('action'));
      expect(tabStops).toEqual([button]);
    });

    it('heading: the heading is in the outline (axe sees a heading named by the title)', async () => {
      host.clickTarget.set('heading');
      fixture.detectChanges();
      const heading = el().querySelector('h3') as HTMLElement;
      expect(heading.closest('[role="button"]')).toBeNull();
      expect(heading.textContent?.trim()).toBe('Rechnungsübersicht Januar bis Dezember');
      expect(violations(await audit(el()))).toEqual([]);
    });

    it('heading: a click emits cardClick once; the host keydown no longer turns Enter/Space into a click', () => {
      host.clickTarget.set('heading');
      fixture.detectChanges();
      const button = el().querySelector('button.card__link') as HTMLButtonElement;
      button.click();
      expect(host.clicks).toBe(1);
      for (const key of ['Enter', ' ']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        button.dispatchEvent(event);
        // The native button turns the key into one click (not in jsdom); the card adds none.
        expect(event.defaultPrevented).toBe(false);
      }
      expect(host.clicks).toBe(1);
    });

    it('heading: ariaLabel names the button, not the card', () => {
      host.clickTarget.set('heading');
      host.ariaLabel.set('Rechnungsübersicht Januar bis Dezember öffnen');
      fixture.detectChanges();
      expect(el().querySelector('button.card__link')?.getAttribute('aria-label')).toBe('Rechnungsübersicht Januar bis Dezember öffnen');
      expect(card().hasAttribute('aria-label')).toBe(false);
    });

    it('heading without a title or without clickable falls back to the card target', () => {
      host.clickTarget.set('heading');
      host.title.set(undefined);
      fixture.detectChanges();
      expect(card().getAttribute('role')).toBe('button');
      host.title.set('Kosten');
      host.clickable.set(false);
      fixture.detectChanges();
      expect(card().getAttribute('role')).toBe('article');
      expect(el().querySelector('.card__link')).toBeNull();
    });
  });

  describe('AC-20: truncateTitle', () => {
    it.each<CardClickTarget>(['card', 'heading'])('puts the full title on the heading as `title` (%s)', (target) => {
      host.clickTarget.set(target);
      host.truncate.set(true);
      fixture.detectChanges();
      expect(el().querySelector('.card__title')?.getAttribute('title')).toBe('Rechnungsübersicht Januar bis Dezember');
      expect(card().classList).toContain('card-truncate-title');
    });
  });

  describe('AC-14: headerSize', () => {
    it('adds card-header-sm for sm only', () => {
      host.headerSize.set('sm');
      fixture.detectChanges();
      expect(card().classList).toContain('card-header-sm');
    });
  });

  describe('stylesheet', () => {
    const css = '\n' + compile(join(__dirname, 'card.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('AC-12: the subtle tile reads --color-brand-tile-subtle, no literal; brand reads the derived tokens', () => {
      expect(rule('.card__icon--subtle')).toBe(
        'background-color: var(--color-brand-tile-subtle); color: var(--color-primary-500); border: 1px solid var(--color-border-strong);',
      );
      expect(rule('.card__icon--brand')).toBe(
        'background-image: var(--gradient-brand-tile); color: var(--color-on-primary, #fff); box-shadow: var(--shadow-brand-glow);',
      );
    });

    it('AC-13: every rule reads --lc-card-divider-color with its own default', () => {
      expect(rule('.card__header')).toContain('border-bottom: 1px solid var(--lc-card-divider-color, var(--color-border, #e5e7eb));');
      expect(rule(':host ::ng-deep [card-header],\n:host ::ng-deep .card-header')).toContain(
        'border-bottom: 1px solid var(--lc-card-divider-color, var(--color-divider, #e5e7eb));',
      );
      const footers = [...css.matchAll(/\n:host ::ng-deep \[card-footer\],\n:host ::ng-deep \.card-footer \{([^}]*)\}/g)].map((m) => m[1].trim());
      expect(footers[1]).toBe('border-top-color: var(--lc-card-divider-color, var(--color-divider, #e5e7eb));');
    });

    it('AC-13: a titled card without body and footer draws no rule and no space below its head', () => {
      expect(
        rule(':host > ::ng-deep .card:has(> .card__body:empty):not(:has(> :is([card-footer], .card-footer))) > .card__header'),
      ).toBe('margin-bottom: 0; padding-bottom: 0; border-bottom: 0;');
    });

    it('AC-14: sm head 8/12, collapsible head 32 px, toggle hit area 44 px (6 px above, 7 px below past the rule)', () => {
      expect(rule('.card-header-sm .card__header')).toBe('margin-bottom: var(--spacing-3); padding-bottom: var(--spacing-2);');
      expect(rule('.card-collapsible.card-header-sm .card__header')).toBe('min-height: 32px;');
      expect(rule('.card-header-sm .card__toggle::after')).toBe('inset: -6px 0 -7px;');
      // The closed head still wins: after the sm rule at the same weight.
      expect(css.indexOf('\n.card-header-sm .card__header {')).toBeLessThan(css.indexOf('\n.card-collapsed .card__header {'));
    });

    it('AC-20: one-line title with ellipsis; the badge never shrinks', () => {
      expect(rule('.card-truncate-title .card__title')).toBe('min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;');
      expect(rule('.card-truncate-title .card__title > :is(.card__link, .card__toggle)')).toContain('text-overflow: ellipsis;');
      expect(rule('.card-truncate-title :is(.card__badge-slot, .card__badge)')).toBe('flex-shrink: 0;');
    });
  });
});
