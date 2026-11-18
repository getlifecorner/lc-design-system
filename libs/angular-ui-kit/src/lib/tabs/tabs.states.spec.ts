import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { compile } from 'sass';
import { join } from 'path';
import { TabComponent, TabsComponent, TabsMode } from './tabs.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * Request 068 (3.48, design §2, §6, §9): usm-x rows 49–52 and 69 on `lc-tabs`:
 * `ariaLabel`, `replaceUrl`, the panel hooks, and `lc-tab` `tooltip`,
 * `disabledReason`, `muted` and `hint`.
 */
@Component({ standalone: true, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class PageComponent {}

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-tabs [mode]="mode()" [ariaLabel]="ariaLabel()" [replaceUrl]="replaceUrl()" [(selectedIndex)]="selected">
        <lc-tab label="Ticket" hint="12 Status" badge="3 Treffer" route="/facetten" [queryParams]="{ teil: 'ticket' }" [current]="true">Ticket</lc-tab>
        <lc-tab label="Problem" route="/facetten" [queryParams]="{ teil: 'problem' }" tooltip="Probleme dieses Modells">Problem</lc-tab>
        <lc-tab label="Workflow" [disabled]="true" disabledReason="Wird im Rich Client bearbeitet">Workflow</lc-tab>
        <lc-tab label="Archiv" [disabled]="true">Archiv</lc-tab>
        <lc-tab label="Regeln" [muted]="true" route="/facetten" [queryParams]="{ teil: 'regeln' }">Regeln</lc-tab>
      </lc-tabs>
    </div>
  `,
})
class HostComponent {
  readonly mode = signal<TabsMode>('panels');
  readonly ariaLabel = signal('');
  readonly replaceUrl = signal(false);
  selected = 0;
}

describe('lc-tabs 3.48 (request 068)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const list = () => el().querySelector('[role="tablist"]') as HTMLElement;
  const tabs = () => [...el().querySelectorAll<HTMLElement>('[role="tab"]')];
  const tab = (label: string) => tabs().find((t) => t.textContent?.trim().startsWith(label)) as HTMLElement;
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const describedBy = (t: HTMLElement) => document.getElementById(t.getAttribute('aria-describedby') ?? '')?.textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([{ path: '**', component: PageComponent }])],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    await TestBed.inject(Router).navigateByUrl('/facetten');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    el().remove();
  });

  describe('AC-3: ariaLabel names the tablist in both modes', () => {
    it.each([['panels'], ['links']] as const)('%s', (mode) => {
      host.mode.set(mode);
      fixture.detectChanges();
      expect(list().hasAttribute('aria-label')).toBe(false);
      host.ariaLabel.set('Facetten');
      fixture.detectChanges();
      expect(list().getAttribute('aria-label')).toBe('Facetten');
    });
  });

  describe('AC-7: hint', () => {
    it.each([['panels'], ['links']] as const)('%s: label, hint and badge make the name "Ticket 12 Status 3 Treffer"', (mode) => {
      host.mode.set(mode);
      fixture.detectChanges();
      const ticket = tab('Ticket');
      expect(ticket.textContent?.replace(/\s+/g, ' ').trim()).toBe('Ticket 12 Status 3 Treffer');
      const hint = ticket.querySelector('.lc-tabs__hint') as HTMLElement;
      expect(hint.textContent).toBe('12 Status');
      expect(hint.nextElementSibling?.classList.contains('lc-tabs__badge')).toBe(true);
      expect(tab('Problem').querySelector('.lc-tabs__hint')).toBeNull();
    });

    it('the hint is 12 px tertiary ink at weight 400', () => {
      const css = compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-tabs__hint { font-size: var(--font-size-xs); font-weight: var(--font-weight-normal); color: var(--color-text-tertiary); }');
    });
  });

  describe('AC-4: tooltip, disabledReason, muted (panels)', () => {
    it('a reason tab is aria-disabled, not natively disabled, never selected; a plain disabled tab is as before', () => {
      const workflow = tab('Workflow') as HTMLButtonElement;
      expect(workflow.disabled).toBe(false);
      expect(workflow.getAttribute('aria-disabled')).toBe('true');
      expect(workflow.getAttribute('tabindex')).toBe('-1');
      expect(workflow.classList.contains('lc-tabs__tab--disabled')).toBe(true);
      workflow.click();
      fixture.detectChanges();
      expect(host.selected).toBe(0);
      const archiv = tab('Archiv') as HTMLButtonElement;
      expect(archiv.disabled).toBe(true);
    });

    it('the arrows reach a reason tab (focus and tooltip), keep the selection, and move on from it', () => {
      tab('Problem').focus();
      key(tab('Ticket'), 'ArrowRight');
      expect(host.selected).toBe(1);
      expect(document.activeElement).toBe(tab('Problem'));
      expect(describedBy(tab('Problem'))).toBe('Probleme dieses Modells');
      key(tab('Problem'), 'ArrowRight');
      const workflow = tab('Workflow');
      expect(document.activeElement).toBe(workflow);
      expect(host.selected).toBe(1);
      expect(describedBy(workflow)).toBe('Wird im Rich Client bearbeitet');
      expect(workflow.getAttribute('tabindex')).toBe('-1');
      expect(tab('Problem').getAttribute('tabindex')).toBe('0');
      // the plain disabled „Archiv“ is skipped
      key(workflow, 'ArrowRight');
      expect(document.activeElement).toBe(tab('Regeln'));
      expect(host.selected).toBe(4);
      key(tab('Regeln'), 'ArrowLeft');
      expect(document.activeElement).toBe(workflow);
      expect(host.selected).toBe(4);
    });

    it('muted is a class with tertiary ink at weight 400; the selected look wins', () => {
      expect(tab('Regeln').classList.contains('lc-tabs__tab--muted')).toBe(true);
      expect(tab('Ticket').classList.contains('lc-tabs__tab--muted')).toBe(false);
      const css = compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-tabs__tab--muted:not(.lc-tabs__tab--selected) { color: var(--color-text-tertiary); font-weight: var(--font-weight-normal); }');
    });

    it('axe: no violations with a named list, a reason tab and a hint', async () => {
      host.ariaLabel.set('Facetten');
      fixture.detectChanges();
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('AC-4: links mode', () => {
    beforeEach(() => {
      host.mode.set('links');
      fixture.detectChanges();
    });

    it('a reason tab is in the roving order (tabindex -1, tooltip on focus); a plain disabled one is not', () => {
      const workflow = tab('Workflow');
      expect(workflow.getAttribute('tabindex')).toBe('-1');
      expect(workflow.hasAttribute('href')).toBe(false);
      expect(tab('Archiv').hasAttribute('tabindex')).toBe(false);
      tab('Problem').focus();
      fixture.detectChanges();
      key(tab('Problem'), 'ArrowRight');
      expect(document.activeElement).toBe(workflow);
      expect(describedBy(workflow)).toBe('Wird im Rich Client bearbeitet');
      key(workflow, 'ArrowRight');
      expect(document.activeElement).toBe(tab('Regeln'));
    });

    it('axe: no violations', async () => {
      host.ariaLabel.set('Facetten');
      fixture.detectChanges();
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('AC-5: replaceUrl (links)', () => {
    const click = (target: HTMLElement, init: MouseEventInit = {}) =>
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));

    beforeEach(() => {
      host.mode.set('links');
      fixture.detectChanges();
    });

    it('default: a plain click pushes (replaceUrl false)', () => {
      const spy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl');
      click(tab('Problem'));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ replaceUrl: false }));
    });

    it('replaceUrl: a plain click replaces; Ctrl, Meta, Shift and middle clicks stay the browser’s', () => {
      host.replaceUrl.set(true);
      fixture.detectChanges();
      const spy = jest.spyOn(TestBed.inject(Router), 'navigateByUrl');
      click(tab('Problem'), { ctrlKey: true });
      click(tab('Problem'), { metaKey: true });
      click(tab('Problem'), { shiftKey: true });
      click(tab('Problem'), { button: 1 });
      expect(spy).not.toHaveBeenCalled();
      click(tab('Problem'));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(String(spy.mock.calls[0][0])).toBe('/facetten?teil=problem');
      expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ replaceUrl: true }));
    });
  });

  describe('AC-6: panel hooks', () => {
    it('the gap and the panel padding read --lc-tabs-gap and --lc-tabs-panel-padding over the old values', () => {
      const css = compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-tabs__container { display: flex; gap: var(--lc-tabs-gap, var(--lc-density-gap-md, var(--spacing-4))); }');
      expect(css).toContain('padding: var(--lc-tabs-panel-padding, var(--lc-density-padding-md, var(--spacing-4)));');
      expect(css).not.toMatch(/--lc-tabs-gap:|--lc-tabs-panel-padding:/);
    });
  });
});
