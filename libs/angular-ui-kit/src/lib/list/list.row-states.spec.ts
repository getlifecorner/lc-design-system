import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { ListComponent, ListHeadingLevel, ListItem, ListLinkClickEvent } from './list.component';
import { audit, computedName, violations } from '../../testing/axe-jsdom';

@Component({
  standalone: true,
  imports: [ListComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-list
        [items]="items()"
        [clickable]="clickable()"
        [multiColumn]="columns()"
        [headingLevel]="level()"
        busyLabel="Wird geladen"
        (itemClick)="clicks.push($event.label)"
        (linkClick)="onLink($event)"
        (actionClick)="actions.push($event.label)"
      />
    </div>
  `,
})
class HostComponent {
  readonly items = signal<ListItem[]>([]);
  readonly clickable = signal(false);
  readonly columns = signal(false);
  readonly level = signal<ListHeadingLevel>(3);
  clicks: string[] = [];
  links: string[] = [];
  actions: string[] = [];
  onLink(e: ListLinkClickEvent): void {
    e.event.preventDefault();
    this.links.push(e.item.label);
  }
}

/** Request 064 (3.44, usm-x row 20, AC-15): lc-list busy, tooltips, heading items, indent, columns. */
describe('lc-list row states, headings, indent, columns (3.44)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  const el = () => fixture.nativeElement as HTMLElement;
  const list = () => el().querySelector('[role="list"]') as HTMLElement;
  const set = (items: ListItem[], clickable = false) => {
    host.clickable.set(clickable);
    host.items.set(items);
    fixture.detectChanges();
  };
  const name = (node: Element) => computedName(el(), node).replace(/\s+/g, ' ').trim();

  it('the new inputs default as documented', () => {
    const plain = TestBed.createComponent(ListComponent);
    expect([plain.componentInstance.busyLabel(), plain.componentInstance.headingLevel(), plain.componentInstance.multiColumn()]).toEqual([
      'Loading',
      3,
      false,
    ]);
    plain.destroy();
  });

  describe('busy', () => {
    it('clickable rows: spinner in the icon box, aria-busy and aria-disabled, focusable, no itemClick; the name ends with the busy text', () => {
      set([{ label: 'Berichte', icon: 'file', busy: true }, { label: 'Offen', avatar: 'JA', busy: true }, { label: 'Leer', busy: true }], true);
      const rows = [...el().querySelectorAll<HTMLElement>('[role="button"]')];
      expect(rows.map((r) => [r.getAttribute('aria-busy'), r.getAttribute('aria-disabled'), r.getAttribute('tabindex')])).toEqual([
        ['true', 'true', '0'],
        ['true', 'true', '0'],
        ['true', 'true', '0'],
      ]);
      expect(rows.map((r) => r.querySelector('.lc-list__busy')?.className)).toEqual([
        'lc-list__busy lc-list__busy--icon',
        'lc-list__busy lc-list__busy--avatar',
        'lc-list__busy',
      ]);
      expect(rows[0].querySelector('lc-icon.lc-list__icon')).toBeNull();
      expect(rows[1].querySelector('.lc-list__avatar')).toBeNull();
      expect(rows[0].querySelector('.lc-list__busy')?.getAttribute('aria-hidden')).toBe('true');
      rows[0].click();
      rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      expect(host.clicks).toEqual([]);
      expect(name(rows[0])).toBe('Berichte Wird geladen');
    });

    it('a row with an ariaLabel gets ", Wird geladen" appended; a split row too, and its action shows loading', () => {
      set(
        [
          { label: 'Lücken', badge: '3 offen', ariaLabel: 'Lücken 3 offen', busy: true },
          { label: 'Gerät', subtitle: 'Safari', action: 'Entfernen', busy: true },
        ],
        true,
      );
      expect(el().querySelector('[role="button"]')?.getAttribute('aria-label')).toBe('Lücken 3 offen, Wird geladen');
      const split = el().querySelector('.lc-list__item-button') as HTMLButtonElement;
      expect(split.getAttribute('aria-label')).toBe('Gerät, Safari, Wird geladen');
      expect(split.getAttribute('aria-busy')).toBe('true');
      expect(split.getAttribute('aria-disabled')).toBe('true');
      expect(el().querySelector('.lc-list__action button')?.getAttribute('aria-busy')).toBe('true');
      split.click();
      expect(host.clicks).toEqual([]);
    });

    it('a busy link row neither navigates nor emits linkClick', () => {
      set([{ label: 'Zu Lücken', href: '/luecken', busy: true }]);
      const a = el().querySelector('a.lc-list__item') as HTMLAnchorElement;
      expect(a.getAttribute('aria-busy')).toBe('true');
      expect(a.getAttribute('aria-disabled')).toBe('true');
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      a.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(host.links).toEqual([]);
    });
  });

  describe('tooltips and reasons', () => {
    it('tooltip and badge tooltip on the row focus target, joined with " · "; a plain row becomes a tab stop', () => {
      set([{ label: 'Incidents', badge: '12', tooltip: 'Zuletzt geladen heute, 06:00', badgeTooltip: '12 offen, davon 3 überfällig' }, { label: 'Ruhig' }]);
      const [row, quiet] = [...el().querySelectorAll<HTMLElement>('.lc-list__item')];
      expect(row.getAttribute('tabindex')).toBe('0');
      expect(quiet.hasAttribute('tabindex')).toBe(false);
      row.focus();
      fixture.detectChanges();
      expect(document.getElementById(row.getAttribute('aria-describedby') as string)?.textContent?.trim()).toBe(
        'Zuletzt geladen heute, 06:00 · 12 offen, davon 3 überfällig',
      );
      row.blur();
    });

    it('disabled with a reason: focusable, aria-disabled, the reason describes it, no click; without a reason tabindex -1', () => {
      set([{ label: 'Planwerte', disabled: true, disabledReason: 'Planwerte erst ab 1. Dezember' }, { label: 'Archiv', disabled: true }], true);
      const [withReason, without] = [...el().querySelectorAll<HTMLElement>('[role="button"]')];
      expect(withReason.getAttribute('tabindex')).toBe('0');
      expect(withReason.getAttribute('aria-disabled')).toBe('true');
      expect(withReason.classList).toContain('lc-list__item--has-reason');
      expect(without.getAttribute('tabindex')).toBe('-1');
      withReason.click();
      expect(host.clicks).toEqual([]);
      withReason.focus();
      fixture.detectChanges();
      expect(document.getElementById(withReason.getAttribute('aria-describedby') as string)?.textContent?.trim()).toBe(
        'Planwerte erst ab 1. Dezember',
      );
      withReason.blur();
    });
  });

  describe('heading items', () => {
    it('render hN in a role=listitem, no control, label only; one list child per item', () => {
      set([
        { label: 'Arbeit', heading: true, href: '/ignored', icon: 'file', badge: 'x' },
        { label: 'Incidents', href: '/incidents' },
        { label: 'Customizing', heading: true },
      ]);
      expect(list().children).toHaveLength(3);
      const heading = list().children[0] as HTMLElement;
      expect(heading.getAttribute('role')).toBe('listitem');
      expect(heading.className).toBe('lc-list__heading-item');
      expect(heading.innerHTML.replace(/<!--[\s\S]*?-->/g, '').trim()).toMatch(/^<h3 class="lc-list__heading"[^>]*>Arbeit<\/h3>$/);
      expect(heading.querySelector('a, button, [tabindex]')).toBeNull();
    });

    it('headingLevel picks h2–h6', () => {
      set([{ label: 'Arbeit', heading: true }]);
      for (const level of [2, 4, 5, 6] as ListHeadingLevel[]) {
        host.level.set(level);
        fixture.detectChanges();
        expect(list().querySelector(`h${level}.lc-list__heading`)?.textContent).toBe('Arbeit');
      }
    });
  });

  describe('indent', () => {
    it('adds lc-list__indent-N for 1–4 (floored, clamped), on rows and headings', () => {
      set([
        { label: 'A', indent: 0 },
        { label: 'B', indent: 1 },
        { label: 'C', indent: 2.7 },
        { label: 'D', indent: 9 },
        { label: 'E', indent: -2 },
        { label: 'H', heading: true, indent: 1 },
      ]);
      const classes = [...list().children].map((c) => [...c.classList].filter((k) => k.startsWith('lc-list__indent')).join(' '));
      expect(classes).toEqual(['', 'lc-list__indent-1', 'lc-list__indent-2', 'lc-list__indent-4', '', 'lc-list__indent-1']);
    });
  });

  describe('multiColumn', () => {
    it('adds lc-list--columns on a vertical list only', () => {
      host.columns.set(true);
      set([{ label: 'A' }]);
      expect(list().classList).toContain('lc-list--columns');
    });
  });

  it('passes axe with headings, busy, tooltip and reason rows', async () => {
    set(
      [
        { label: 'Arbeit', heading: true },
        { label: 'Berichte', icon: 'file', busy: true },
        { label: 'Incidents', badge: '12', tooltip: 'Zuletzt geladen heute' },
        { label: 'Planwerte', disabled: true, disabledReason: 'Erst ab 1. Dezember', indent: 1 },
      ],
      true,
    );
    expect(violations(await audit(el()))).toEqual([]);
  });

  describe('stylesheet', () => {
    const css = '\n' + compile(join(__dirname, 'list.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('indent: the row padding plus n steps (sm 28, md 32, lg 36 px)', () => {
      expect(rule('.lc-list')).toContain('display: flex;');
      expect(css).toMatch(/\n\.lc-list \{\s*--_lc-list-indent-step: var\(--lc-list-indent-step, 32px\);\s*\}/);
      expect(css).toMatch(/\n\.lc-list--sm \{\s*--_lc-list-indent-step: var\(--lc-list-indent-step, 28px\);\s*\}/);
      expect(css).toMatch(/\n\.lc-list--lg \{\s*--_lc-list-indent-step: var\(--lc-list-indent-step, 36px\);\s*\}/);
      expect(rule('.lc-list :is(.lc-list__item, .lc-list__heading-item).lc-list__indent-2')).toBe(
        'padding-inline-start: calc(var(--lc-density-padding-md, var(--spacing-4)) + 2 * var(--_lc-list-indent-step));',
      );
    });

    it('columns: hooks, rows never split, a heading stays with its first row', () => {
      expect(rule('.lc-list--vertical.lc-list--columns')).toBe(
        'display: block; column-width: var(--lc-list-column-width, 18rem); column-gap: var(--lc-list-column-gap, var(--spacing-6));',
      );
      expect(rule('.lc-list--vertical.lc-list--columns > *')).toBe('break-inside: avoid;');
      expect(rule('.lc-list--vertical.lc-list--columns > .lc-list__heading-item')).toBe('break-after: avoid;');
    });

    it('heading: 14/20 semibold, secondary ink, 12 · row-x · 4, 36 px', () => {
      expect(rule('.lc-list__heading-item')).toContain('min-height: 36px;');
      expect(rule('.lc-list__heading-item')).toContain('padding: var(--spacing-3) var(--lc-density-padding-md, var(--spacing-4)) var(--spacing-1);');
      expect(rule('.lc-list__heading')).toContain('font-size: var(--font-size-sm, 0.875rem); line-height: 1.25rem; font-weight: var(--font-weight-semibold, 600); color: var(--color-text-secondary);');
    });
  });
});
