import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { ButtonComponent } from '../button/button.component';
import { TooltipDirective } from './tooltip.directive';

/**
 * 3.32 (request 051, 050-f3, WCAG 1.4.13 and 1.3.1): on a wrapper such as
 * `lc-button`, the tooltip shows on keyboard focus of the wrapped `<button>`
 * (`focusin`; `focus` does not bubble), describes that button
 * (`aria-describedby` on it, not on the host) and anchors to it when it is the
 * host's only child. Plain hosts keep everything as before. Design 051 §1 C,
 * D-4, §4, §6, §9; AC-5 … AC-8.
 */
@Component({
  standalone: true,
  imports: [TooltipDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-button
      id="wrapper"
      lcTooltip="Saves your changes"
      tooltipPosition="bottom"
      [tooltipShowDelay]="showDelay()"
      [tooltipDisabled]="tooltipOff()"
      [ariaDescribedBy]="hint()"
    >Save</lc-button>
    <button id="plain" type="button" lcTooltip="Plain tooltip">Plain</button>
    <div id="field" lcTooltip="Field tooltip">
      <label for="field-input">Name</label>
      <input id="field-input" />
    </div>
    <span id="pair" lcTooltip="Pair tooltip"><button type="button" id="first">A</button><button type="button" id="second">B</button></span>
    <button id="outside" type="button">Outside</button>
  `,
})
class Host {
  readonly showDelay = signal(0);
  readonly tooltipOff = signal(false);
  readonly hint = signal<string | undefined>(undefined);
}

describe('lcTooltip 3.32 focus inside a wrapper (request 051)', () => {
  let fixture: ComponentFixture<Host>;
  let setOrigin: jest.SpyInstance;

  const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const directiveOf = (id: string): TooltipDirective =>
    fixture.debugElement.query(By.css(`#${id}`)).injector.get(TooltipDirective);
  const tooltip = (dir: TooltipDirective) => document.getElementById(dir.tooltipId);
  const inner = () => byId('wrapper').querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    setOrigin = jest.spyOn(FlexibleConnectedPositionStrategy.prototype, 'setOrigin');
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    // Attached, so focus() and focusin/focusout work as in a page
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    for (const id of ['wrapper', 'plain', 'field', 'pair']) directiveOf(id).hide();
    fixture.destroy();
    setOrigin.mockRestore();
    jest.useRealTimers();
  });

  describe('AC-5: keyboard focus on lc-button', () => {
    it('shows when the inner button gets focus, and hides when focus leaves', () => {
      const dir = directiveOf('wrapper');
      inner().focus();
      expect(document.activeElement).toBe(inner());
      fixture.detectChanges();
      expect(tooltip(dir)?.getAttribute('role')).toBe('tooltip');
      expect(tooltip(dir)?.textContent?.trim()).toBe('Saves your changes');

      byId('outside').focus();
      expect(tooltip(dir)).toBeNull();
    });

    it('waits for tooltipShowDelay, as on hover', () => {
      jest.useFakeTimers();
      fixture.componentInstance.showDelay.set(300);
      fixture.detectChanges();
      const dir = directiveOf('wrapper');

      inner().focus();
      expect(tooltip(dir)).toBeNull();
      jest.advanceTimersByTime(299);
      expect(tooltip(dir)).toBeNull();
      jest.advanceTimersByTime(1);
      expect(tooltip(dir)).not.toBeNull();
    });

    it('hides on Escape while the button keeps focus, and shows again on the next Tab in', () => {
      const dir = directiveOf('wrapper');
      inner().focus();
      expect(tooltip(dir)).not.toBeNull();

      inner().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(tooltip(dir)).toBeNull();
      expect(document.activeElement).toBe(inner());
      expect(inner().getAttribute('aria-describedby')).toBeNull();

      byId('outside').focus();
      inner().focus();
      expect(tooltip(dir)).not.toBeNull();
    });

    it('never shows with tooltipDisabled', () => {
      fixture.componentInstance.tooltipOff.set(true);
      fixture.detectChanges();
      inner().focus();
      expect(tooltip(directiveOf('wrapper'))).toBeNull();
    });

    it('keeps the tooltip while focus moves between two controls inside one host', () => {
      const dir = directiveOf('pair');
      byId('first').focus();
      expect(tooltip(dir)).not.toBeNull();
      byId('second').focus();
      expect(tooltip(dir)).not.toBeNull();
      byId('outside').focus();
      expect(tooltip(dir)).toBeNull();
    });

    it('acts on focusin/focusout from inside only: relatedTarget inside the host keeps it', () => {
      const dir = directiveOf('pair');
      byId('first').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      expect(tooltip(dir)).not.toBeNull();
      byId('first').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: byId('second') }));
      expect(tooltip(dir)).not.toBeNull();
      byId('second').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      expect(tooltip(dir)).toBeNull();
    });
  });

  describe('AC-6: what aria-describedby is on', () => {
    it('lc-button: on the inner <button> while shown, never on the host, removed on hide', () => {
      const dir = directiveOf('wrapper');
      inner().focus();
      expect(inner().getAttribute('aria-describedby')).toBe(dir.tooltipId);
      expect(byId('wrapper').hasAttribute('aria-describedby')).toBe(false);

      byId('outside').focus();
      expect(inner().hasAttribute('aria-describedby')).toBe(false);
      expect(byId('wrapper').hasAttribute('aria-describedby')).toBe(false);
    });

    it('lc-button: on the inner <button> on hover too', () => {
      const dir = directiveOf('wrapper');
      byId('wrapper').dispatchEvent(new MouseEvent('mouseenter'));
      expect(inner().getAttribute('aria-describedby')).toBe(dir.tooltipId);
      expect(byId('wrapper').hasAttribute('aria-describedby')).toBe(false);
      byId('wrapper').dispatchEvent(new MouseEvent('mouseleave'));
      expect(inner().hasAttribute('aria-describedby')).toBe(false);
    });

    it("keeps ids from lc-button's ariaDescribedBy and restores them on hide", () => {
      fixture.componentInstance.hint.set('save-hint');
      fixture.detectChanges();
      const dir = directiveOf('wrapper');
      expect(inner().getAttribute('aria-describedby')).toBe('save-hint');

      inner().focus();
      expect(inner().getAttribute('aria-describedby')).toBe(`save-hint ${dir.tooltipId}`);
      dir.hide();
      expect(inner().getAttribute('aria-describedby')).toBe('save-hint');
    });

    it('plain <button lcTooltip>: on the host, as before', () => {
      const dir = directiveOf('plain');
      byId('plain').focus();
      expect(byId('plain').getAttribute('aria-describedby')).toBe(dir.tooltipId);
      byId('outside').focus();
      expect(byId('plain').hasAttribute('aria-describedby')).toBe(false);
    });

    it('a host with a label and an input: on the input', () => {
      const dir = directiveOf('field');
      byId('field-input').focus();
      expect(byId('field-input').getAttribute('aria-describedby')).toBe(dir.tooltipId);
      expect(byId('field').hasAttribute('aria-describedby')).toBe(false);
    });

    it('a host with two controls: on the first one, whichever has focus', () => {
      const dir = directiveOf('pair');
      byId('second').focus();
      expect(byId('first').getAttribute('aria-describedby')).toBe(dir.tooltipId);
      expect(byId('second').hasAttribute('aria-describedby')).toBe(false);
      expect(byId('pair').hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('AC-8 / D-4: a plain host runs once per focus, as before', () => {
    it('shows once on focus of a <button lcTooltip> (focus and focusin both arrive)', () => {
      const dir = directiveOf('plain');
      const show = jest.spyOn(dir, 'show');
      byId('plain').focus();
      expect(show).toHaveBeenCalledTimes(1);
    });

    it('hides once on blur of a <button lcTooltip>', () => {
      const dir = directiveOf('plain');
      byId('plain').focus();
      const hide = jest.spyOn(dir, 'hide');
      byId('outside').focus();
      expect(hide).toHaveBeenCalledTimes(1);
      expect(tooltip(dir)).toBeNull();
    });
  });

  describe('AC-7: the overlay anchor', () => {
    const lastOrigin = () => setOrigin.mock.calls[setOrigin.mock.calls.length - 1]?.[0];

    it('lc-button: the inner button, its only child', () => {
      inner().focus();
      expect(lastOrigin()).toBe(inner());
    });

    it('plain <button lcTooltip>: the host', () => {
      byId('plain').focus();
      expect(lastOrigin()).toBe(byId('plain'));
    });

    it('a host with a label and an input: the host', () => {
      byId('field-input').focus();
      expect(lastOrigin()).toBe(byId('field'));
    });

    it('a host with two controls: the host', () => {
      byId('first').focus();
      expect(lastOrigin()).toBe(byId('pair'));
    });

    it('is resolved at every show', () => {
      const dir = directiveOf('wrapper');
      dir.show();
      dir.hide();
      dir.show();
      const calls = setOrigin.mock.calls.filter(([origin]) => origin === inner());
      expect(calls).toHaveLength(2);
    });
  });
});
