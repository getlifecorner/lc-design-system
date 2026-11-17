import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { compile } from 'sass';
import { join } from 'path';
import { TabComponent, TabsComponent, TabsMode } from './tabs.component';
import { audit, violations } from '../../testing/axe-jsdom';

@Component({ standalone: true, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class PageComponent {}

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-tabs [mode]="mode()" panelId="kosten-panel" (selectedIndexChange)="changes = changes + 1">
      @for (t of tabs; track t.key; let i = $index) {
        <lc-tab
          [label]="t.label"
          [tabId]="'tab-' + t.key"
          route="/bereich"
          [queryParams]="{ tab: t.key }"
          queryParamsHandling="merge"
          [current]="current() === t.key"
          [disabled]="t.disabled"
          >Inhalt: {{ t.label }}</lc-tab
        >
      }
      <lc-tab label="Hilfe" href="/hilfe" tabId="tab-hilfe" [current]="current() === 'hilfe'">Hilfe</lc-tab>
    </lc-tabs>
    <div role="tabpanel" id="kosten-panel" [attr.aria-labelledby]="'tab-' + current()">Inhalt</div>
  `,
})
class HostComponent {
  readonly mode = signal<TabsMode>('links');
  readonly current = signal<string>('kosten');
  readonly tabs = [
    { key: 'uebersicht', label: 'Übersicht', disabled: false },
    { key: 'kosten', label: 'Kostenstellen', disabled: false },
    { key: 'archiv', label: 'Archiv', disabled: true },
    { key: 'verlauf', label: 'Änderungsverlauf', disabled: false },
  ];
  changes = 0;
}

/** Request 064 (3.44, usm-x row 11, AC-2): `lc-tabs mode="links"`. */
describe('lc-tabs links mode (3.44)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([{ path: '**', component: PageComponent }])],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await TestBed.inject(Router).navigateByUrl('/bereich?x=1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const tabs = () => [...el().querySelectorAll<HTMLElement>('lc-tabs [role="tab"]')];
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  it('renders a tablist of a[role=tab] links, no kit tabpanel', () => {
    expect(el().querySelector('lc-tabs [role="tablist"]')).not.toBeNull();
    expect(tabs().map((t) => t.tagName)).toEqual(['A', 'A', 'A', 'A', 'A']);
    expect(el().querySelectorAll('lc-tabs [role="tabpanel"]')).toHaveLength(0);
    expect(el().querySelectorAll('lc-tabs button')).toHaveLength(0);
  });

  it('route tabs get the router href with the merged query; href tabs a plain href; disabled tabs none', () => {
    const [uebersicht, kosten, archiv, verlauf, hilfe] = tabs();
    expect(uebersicht.getAttribute('href')).toBe('/bereich?x=1&tab=uebersicht');
    expect(kosten.getAttribute('href')).toBe('/bereich?x=1&tab=kosten');
    expect(verlauf.getAttribute('href')).toBe('/bereich?x=1&tab=verlauf');
    expect(hilfe.getAttribute('href')).toBe('/hilfe');
    expect(archiv.hasAttribute('href')).toBe(false);
    expect(archiv.getAttribute('aria-disabled')).toBe('true');
    expect(archiv.hasAttribute('tabindex')).toBe(false);
  });

  it('marks only the current tab aria-selected (and selected look); ids from tabId; aria-controls = panelId', () => {
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false', 'false']);
    expect(tabs()[1].classList).toContain('lc-tabs__tab--selected');
    expect(tabs().map((t) => t.id)).toEqual(['tab-uebersicht', 'tab-kosten', 'tab-archiv', 'tab-verlauf', 'tab-hilfe']);
    expect(tabs().every((t) => t.getAttribute('aria-controls') === 'kosten-panel')).toBe(true);
    host.current.set('verlauf');
    fixture.detectChanges();
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false', 'true', 'false']);
  });

  it('a click navigates only: aria-selected stays until the app sets current; no selectedIndexChange', async () => {
    tabs()[3].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/bereich?x=1&tab=verlauf');
    expect(tabs()[3].getAttribute('aria-selected')).toBe('false');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(host.changes).toBe(0);
  });

  it('roving tab stop: the current tab; the arrows move the focus only, skipping disabled tabs and wrapping', () => {
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', null, '-1', '-1']);
    tabs()[1].focus();
    fixture.detectChanges();
    expect(key(tabs()[1], 'ArrowRight').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(tabs()[3]);
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '-1', null, '0', '-1']);
    key(tabs()[3], 'ArrowRight');
    key(tabs()[4], 'ArrowRight');
    expect(document.activeElement).toBe(tabs()[0]);
    key(tabs()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs()[4]);
    key(tabs()[4], 'Home');
    expect(document.activeElement).toBe(tabs()[0]);
    key(tabs()[0], 'End');
    expect(document.activeElement).toBe(tabs()[4]);
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(host.changes).toBe(0);
  });

  it('focus leaving the list returns the tab stop to the current tab', () => {
    tabs()[1].focus();
    key(tabs()[1], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs()[0]);
    tabs()[0].blur();
    fixture.detectChanges();
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', null, '-1', '-1']);
  });

  it('without a current tab the stop is the first enabled tab', () => {
    host.current.set('');
    fixture.detectChanges();
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false', 'false', 'false']);
    expect(tabs()[0].getAttribute('tabindex')).toBe('0');
  });

  it('Space clicks the focused link (no page scroll); Enter is left to the link', () => {
    const clicks = jest.fn((e: Event) => e.preventDefault());
    tabs()[4].addEventListener('click', clicks);
    expect(key(tabs()[4], ' ').defaultPrevented).toBe(true);
    expect(clicks).toHaveBeenCalledTimes(1);
    expect(key(tabs()[4], 'Enter').defaultPrevented).toBe(false);
  });

  it('passes axe with the app panel', async () => {
    expect(violations(await audit(el()))).toEqual([]);
  });

  it('panels mode (default) is unchanged, and a tabId names the kit panel', () => {
    host.mode.set('panels');
    fixture.detectChanges();
    const buttons = [...el().querySelectorAll<HTMLButtonElement>('lc-tabs button[role="tab"]')];
    expect(buttons).toHaveLength(5);
    expect(buttons[0].id).toBe('tab-uebersicht');
    const panel = el().querySelector(`lc-tabs [role="tabpanel"][aria-labelledby="tab-uebersicht"]`);
    expect(panel?.id).toBe(buttons[0].getAttribute('aria-controls'));
  });

  describe('stylesheet (both modes, WCAG 1.4.10)', () => {
    const css = '\n' + compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    /** The last rule for `selector` (the 3.44 rules are appended after the nested 3.x ones). */
    const rule = (selector: string): string => {
      const start = css.lastIndexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('a horizontal list scrolls on its own; the ring is inset; links have no underline', () => {
      expect(rule('.lc-tabs__list.lc-tabs--horizontal')).toBe('overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin;');
      expect(rule('.lc-tabs--horizontal .lc-tabs__tab:focus-visible')).toBe('outline-offset: -2px;');
      expect(rule('a.lc-tabs__tab')).toBe('text-decoration: none;');
      expect(css).not.toMatch(/scroll-behavior:\s*smooth/);
    });

    it('forced colours: only the selected tab shows its line, in both orientations (review 064 r1)', () => {
      const forced = [...css.matchAll(/@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)].map((m) => m[1]).join('\n');
      const fill = (selector: string) => {
        const start = forced.indexOf(`\n  ${selector} {`);
        expect([selector, start > -1]).toEqual([selector, true]);
        return forced.slice(forced.indexOf('{', start) + 1, forced.indexOf('}', start)).trim().replace(/\s+/g, ' ');
      };
      expect(fill('.lc-tabs__list .lc-tabs__tab')).toBe('border-bottom-color: Canvas;');
      expect(fill('.lc-tabs__list.lc-tabs--vertical .lc-tabs__tab')).toBe('border-right-color: Canvas;');
      expect(fill('.lc-tabs__list.lc-tabs--horizontal .lc-tabs__tab--selected')).toBe('border-bottom-color: CanvasText;');
      expect(fill('.lc-tabs__list.lc-tabs--vertical .lc-tabs__tab--selected')).toBe('border-right-color: CanvasText;');
      // The selected rules come after the rest rules of the same or lower weight.
      expect(forced.indexOf('.lc-tabs--horizontal .lc-tabs__tab--selected')).toBeGreaterThan(forced.indexOf('.lc-tabs--vertical .lc-tabs__tab {'));
    });

    it('vertical: the selected tab draws its right line; no later normal rule hides it (review 064 r2, finding 10)', () => {
      const rest = css.indexOf('\n.lc-tabs--vertical .lc-tabs__tab {');
      const selected = css.indexOf('\n.lc-tabs--vertical .lc-tabs__tab--selected {');
      expect(rest).toBeGreaterThan(-1);
      expect(selected).toBeGreaterThan(rest);
      expect(css.lastIndexOf('\n.lc-tabs--vertical .lc-tabs__tab--selected {')).toBe(selected);
      expect(rule('.lc-tabs--vertical .lc-tabs__tab')).toMatch(/^border-bottom: none; border-right: 2px solid transparent;/);
      expect(rule('.lc-tabs--vertical .lc-tabs__tab--selected')).toBe('border-right: 2px solid var(--color-primary-500);');
      // After the selected rule, only the forced-colours block may set a right border.
      const after = css.slice(css.indexOf('}', selected) + 1).replace(/@media \(forced-colors: active\) \{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '');
      expect(after).not.toMatch(/border-right/);
      // Horizontal: the underline is unchanged.
      expect(css.slice(css.indexOf('\n.lc-tabs__tab--selected {'))).toMatch(/^\n\.lc-tabs__tab--selected \{[^}]*border-bottom-color: var\(--color-primary-500\);/);
    });
  });
});

describe('lc-tabs default rendering (3.44)', () => {
  it('a plain lc-tab keeps the generated id, and the inputs default as documented', () => {
    @Component({
      standalone: true,
      imports: [TabsComponent, TabComponent],
      changeDetection: ChangeDetectionStrategy.Eager,
      template: `<lc-tabs><lc-tab label="A">a</lc-tab></lc-tabs>`,
    })
    class Plain {}
    const fixture = TestBed.createComponent(Plain);
    fixture.detectChanges();
    const tabs = fixture.debugElement.children[0].componentInstance as TabsComponent;
    expect(tabs.mode()).toBe('panels');
    expect(tabs.panelId()).toBe('');
    const tab = tabs.tabs()[0];
    expect([tab.route(), tab.queryParams(), tab.queryParamsHandling(), tab.href(), tab.current(), tab.tabId()]).toEqual([null, null, null, '', false, '']);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button[role="tab"]') as HTMLButtonElement;
    expect(button.id).toBe(tab.id);
    expect(button.id).toMatch(/^lc-tab-\d+$/);
  });
});
