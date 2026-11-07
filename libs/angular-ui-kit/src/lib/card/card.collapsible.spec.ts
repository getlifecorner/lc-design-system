import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { CardComponent, type CardHeadingLevel, type CardVariant } from './card.component';
import { audit, computedName, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.36 (request 056, regeln row 1, AC-21 to AC-24, D-8): `collapsible` with
 * `[(expanded)]`. The head is one toggle: a button inside the title's
 * heading, its ::after over the head; body and footer hide when closed.
 */
@Component({
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card
      lang="de"
      [title]="title()"
      subtitle="13 Regeln · Verteilung nach Fläche"
      icon="file-text"
      iconSize="sm"
      [variant]="variant()"
      [headingLevel]="level()"
      [collapsible]="collapsible()"
      [clickable]="clickable()"
      [href]="href()"
      [(expanded)]="open"
      (expandedChange)="changes.push($event)"
    >
      <button card-header-action type="button" class="add" aria-label="Regel hinzufügen">+</button>
      <p class="body">Regel 1</p>
      <a class="rule" href="#r1">Regel öffnen</a>
      <div card-footer><button type="button" class="more">Alle Regeln</button></div>
    </lc-card>
  `,
})
class Host {
  readonly title = signal<string | undefined>('Umlageschlüssel nach Kostenstellenverantwortung');
  readonly variant = signal<CardVariant>('outlined');
  readonly level = signal<CardHeadingLevel>(3);
  readonly collapsible = signal(true);
  readonly clickable = signal(false);
  readonly href = signal<string | undefined>(undefined);
  open = true;
  readonly changes: boolean[] = [];
}

describe('CardComponent — collapsible (3.36, request 056)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let warn: jest.SpyInstance;
  const root = () => fixture.nativeElement as HTMLElement;
  const card = () => root().querySelector('.card') as HTMLElement;
  const toggle = () => root().querySelector('.card__toggle') as HTMLButtonElement | null;
  const body = () => root().querySelector('.card__body') as HTMLElement;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ imports: [Host] });
  });
  afterEach(() => {
    fixture?.destroy();
    warn.mockRestore();
  });

  const create = (patch: Partial<{ open: boolean; collapsible: boolean; level: CardHeadingLevel; variant: CardVariant; title: string | undefined; clickable: boolean; href: string }> = {}) => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.open !== undefined) host.open = patch.open;
    if (patch.collapsible !== undefined) host.collapsible.set(patch.collapsible);
    if (patch.level) host.level.set(patch.level);
    if (patch.variant) host.variant.set(patch.variant);
    if ('title' in patch) host.title.set(patch.title);
    if (patch.clickable) host.clickable.set(true);
    if (patch.href) host.href.set(patch.href);
    fixture.detectChanges();
  };

  it('defaults: collapsible false, expanded true; without it the card renders as in 3.35', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [CardComponent] });
    const plain = TestBed.createComponent(CardComponent);
    plain.componentRef.setInput('title', 'Direkte Zuordnung');
    plain.componentRef.setInput('subtitle', '4 Regeln');
    plain.detectChanges();
    expect(plain.componentInstance.collapsible()).toBe(false);
    expect(plain.componentInstance.expanded()).toBe(true);
    const html = (plain.nativeElement as HTMLElement).innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\s_ngcontent-[\w-]+=""/g, '');
    expect(html).toBe(
      '<div class="card card-elevated card-padding-md card-radius-md" role="article"><div class="card__header">' +
        '<div class="card__header-left"><div class="card__title-row"><h3 class="card__title">Direkte Zuordnung</h3>' +
        '<span class="card__badge-slot"></span></div><p class="card__subtitle">4 Regeln</p></div>' +
        '<div class="card__header-action"></div></div><div class="card__body"></div></div>',
    );
    expect((plain.nativeElement as HTMLElement).className).toBe('');
    plain.destroy();
  });

  describe('AC-21, AC-22: the toggle', () => {
    it('is one button inside the heading, named by the title, described by the subtitle, controlling the body', () => {
      create();
      const heading = root().querySelector('.card__title') as HTMLElement;
      expect(heading.tagName).toBe('H3');
      expect(heading.children).toHaveLength(1);
      const button = toggle() as HTMLButtonElement;
      expect(button.parentElement).toBe(heading);
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('Umlageschlüssel nach Kostenstellenverantwortung');
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-controls')).toBe(body().id);
      expect(body().id).toMatch(/^lc-card-\d+-body$/);
      const subtitle = root().querySelector('.card__subtitle') as HTMLElement;
      expect(button.getAttribute('aria-describedby')).toBe(subtitle.id);
      expect(computedName(root(), button)).toBe('Umlageschlüssel nach Kostenstellenverantwortung');
      expect(root().querySelectorAll('.card__header button')).toHaveLength(2); // toggle + header action, never nested
      expect(button.querySelector('button')).toBeNull();
    });

    it('starts open by default; a click closes it, emits expandedChange and updates [(expanded)]', () => {
      create();
      expect(body().hidden).toBe(false);
      toggle()?.click();
      fixture.detectChanges();
      expect(host.changes).toEqual([false]);
      expect(host.open).toBe(false);
      expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
      expect(body().hidden).toBe(true);
      expect(card().classList).toContain('card-collapsed');
      expect((root().querySelector('lc-card') as HTMLElement).classList).toContain('lc-card--collapsed');
      toggle()?.click();
      fixture.detectChanges();
      expect(host.changes).toEqual([false, true]);
      expect(body().hidden).toBe(false);
    });

    it('[expanded]="false" starts closed: only the head shows (body hidden, footer class on the host)', () => {
      create({ open: false });
      expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
      expect(body().hasAttribute('hidden')).toBe(true);
      expect(card().className.split(' ').sort()).toEqual(
        ['card', 'card-outlined', 'card-padding-md', 'card-radius-md', 'card-collapsible', 'card-collapsed'].sort(),
      );
    });

    it('Enter and Space are the native button: activation clicks it (no keydown handling of its own)', () => {
      create();
      const button = toggle() as HTMLButtonElement;
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      button.dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(false);
      expect(host.changes).toEqual([]);
    });

    it('the card is not a button, link or clickable: role article, no tabindex', () => {
      create({ clickable: true, href: '/regeln' });
      expect(card().getAttribute('role')).toBe('article');
      expect(card().hasAttribute('tabindex')).toBe(false);
      expect(root().querySelector('.card__link')).toBeNull();
      expect(card().classList).not.toContain('card-clickable');
      expect(card().classList).not.toContain('card-linked');
      expect(warn).toHaveBeenCalledWith('[lc-card] collapsible wins over clickable, href and route: they are ignored');
    });
  });

  describe('AC-23: icon, iconSize, headingLevel, header action, chevron', () => {
    it.each([2, 3, 4, 5, 6] as const)('h%i keeps its level and holds the toggle', (level) => {
      create({ level });
      const heading = root().querySelector('.card__title') as HTMLElement;
      expect(heading.tagName).toBe(`H${level}`);
      expect(heading.firstElementChild?.className).toBe('card__toggle');
    });

    it('icon tile, header action and chevron stay in the head, the action outside the toggle', () => {
      create();
      const header = root().querySelector('.card__header') as HTMLElement;
      expect([...header.children].map((c) => c.className.split(' ')[0])).toEqual([
        'card__icon',
        'card__header-left',
        'card__header-action',
        'card__chevron',
      ]);
      expect(header.querySelector('.card__icon')?.classList).toContain('card__icon--size-sm');
      const chevron = header.querySelector('.card__chevron') as HTMLElement;
      expect(chevron.tagName).toBe('LC-ICON');
      expect(chevron.getAttribute('name')).toBe('chevron-down');
      expect(chevron.getAttribute('size')).toBe('sm');
      const action = header.querySelector('.add') as HTMLButtonElement;
      expect(toggle()?.contains(action)).toBe(false);
      action.click();
      expect(host.changes).toEqual([]);
    });
  });

  describe('D-8: when it does not apply', () => {
    it('without a title it is ignored (no toggle, no ids) and warns', () => {
      create({ title: undefined });
      expect(toggle()).toBeNull();
      expect(body().hasAttribute('id')).toBe(false);
      expect(body().hasAttribute('hidden')).toBe(false);
      expect(warn).toHaveBeenCalledWith('[lc-card] collapsible needs the built-in title: ignored');
    });

    it('a dashed tile ignores it', () => {
      create({ variant: 'dashed', open: false });
      expect(toggle()).toBeNull();
      expect(body().hasAttribute('hidden')).toBe(false);
      expect(card().classList).not.toContain('card-collapsible');
    });

    it('switching collapsible off restores the plain heading and body', () => {
      create({ open: false });
      host.collapsible.set(false);
      fixture.detectChanges();
      expect(toggle()).toBeNull();
      expect(root().querySelector('.card__title')?.textContent).toBe('Umlageschlüssel nach Kostenstellenverantwortung');
      expect(body().hasAttribute('hidden')).toBe(false);
      expect(body().hasAttribute('id')).toBe(false);
      expect(root().querySelector('.card__chevron')).toBeNull();
    });
  });

  describe('AC-22, AC-24: closed content is out of the tree; styles', () => {
    const css = compile(join(__dirname, 'card.component.scss')).css;

    it('closed: body and footer are not shown (hidden body, footer display none), so axe sees no hidden focusable content', async () => {
      const restore = installFakeCanvas();
      const style = document.createElement('style');
      style.textContent = css.replace(/::ng-deep\s*/g, '').replace(/:host\(([^)]*)\)/g, 'lc-card$1').replace(/:host/g, 'lc-card');
      document.head.appendChild(style);
      try {
        create({ open: false });
        const footer = root().querySelector('[card-footer]') as HTMLElement;
        expect(getComputedStyle(footer).display).toBe('none');
        expect(getComputedStyle(body()).display).toBe('none');
        const results = await audit(root());
        expect(violations(results)).toEqual([]);
      } finally {
        style.remove();
        restore();
      }
    });

    it('the head: relative, isolated, 44 px, centred; the ::after over it; the action lifted; the ring on the head', () => {
      expect(css).toMatch(/\n\.card-collapsible \.card__header \{\s*position: relative;\s*isolation: isolate;\s*min-height: 44px;\s*align-items: center;\s*cursor: pointer;\s*\}/);
      expect(css).toMatch(/\n\.card__toggle::after \{\s*content: "";\s*position: absolute;\s*inset: 0;\s*z-index: 1;\s*\}/);
      expect(css).toMatch(/\n\.card-collapsible \.card__header-action \{\s*position: relative;\s*z-index: 2;\s*\}/);
      expect(css).toMatch(/\n\.card-collapsible \.card__header:has\(\.card__toggle:focus-visible\) \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;\s*\}/);
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.card-collapsible \.card__header:has\(\.card__toggle:focus-visible\) \{\s*outline-color: Highlight;\s*\}\s*\}/);
      // The toggle keeps the title's look.
      expect(css).toMatch(/\n\.card__toggle \{\s*margin: 0;\s*padding: 0;\s*border: 0;\s*background: none;\s*font: inherit;\s*color: inherit;\s*text-align: start;\s*cursor: pointer;\s*outline: none;\s*\}/);
    });

    it('the chevron turns up while open, without motion under reduced motion; closed head has no divider', () => {
      expect(css).toMatch(/\n\.card__chevron \{\s*flex-shrink: 0;\s*color: var\(--color-text-secondary\);\s*transform: rotate\(-180deg\);\s*transition: transform 200ms ease;\s*\}/);
      expect(css).toMatch(/\n\.card-collapsed \.card__chevron \{\s*transform: none;\s*\}/);
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.card__chevron \{\s*transition: none;\s*\}\s*\}/);
      expect(css).toMatch(/\n\.card-collapsed \.card__header \{\s*margin-bottom: 0;\s*padding-bottom: 0;\s*border-bottom: 0;\s*\}/);
      expect(css).toMatch(/\n\.card__body\[hidden\] \{\s*display: none;\s*\}/);
      // The footer of a closed card: the same weight as the equal-footer rules, after them.
      expect(css).toMatch(/\n:host\(\.lc-card--collapsed\) > \.card > ::ng-deep :is\(\[card-footer\], \.card-footer\) \{\s*display: none;\s*\}/);
      expect(css.indexOf(':host(.lc-card--collapsed)')).toBeGreaterThan(css.lastIndexOf(':host(.lc-card--footer-equal) > .card'));
    });
  });
});
