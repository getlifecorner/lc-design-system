import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../button/button.component';
import { TooltipDirective } from './tooltip.directive';

/**
 * 3.33 (request 052, 051-n1, AC-28): on a host with several controls the
 * control that has focus is described, and `aria-describedby` moves with the
 * focus while the tooltip stays shown. Single-control hosts and `lc-button`
 * keep their 3.32 behaviour (tooltip.focus.spec.ts).
 */
@Component({
  standalone: true,
  imports: [TooltipDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="group" lcTooltip="Formatierung" role="group" aria-label="Textformat">
      <button type="button" id="bold" aria-describedby="bold-hint">Fett</button>
      <button type="button" id="italic">Kursiv</button>
    </div>
    <div id="kit-group" lcTooltip="Formatierung">
      <lc-button id="kit-bold">Fett</lc-button>
      <lc-button id="kit-italic">Kursiv</lc-button>
    </div>
    <button id="outside" type="button">Weiter</button>
  `,
})
class Host {}

describe('lcTooltip — a host with two controls (3.33, 051-n1)', () => {
  let fixture: ComponentFixture<Host>;
  const byId = (id: string) => document.getElementById(id) as HTMLElement;
  const directiveOf = (id: string): TooltipDirective => fixture.debugElement.query(By.css(`#${id}`)).injector.get(TooltipDirective);
  const described = (...ids: string[]) => ids.map((id) => byId(id).getAttribute('aria-describedby'));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    directiveOf('group').hide();
    directiveOf('kit-group').hide();
    fixture.destroy();
  });

  it('Tab to the first control describes the first', () => {
    const id = directiveOf('group').tooltipId;
    byId('bold').focus();
    expect(described('bold', 'italic', 'group')).toEqual([`bold-hint ${id}`, null, null]);
  });

  it('Tab on to the second moves aria-describedby to the second (the tooltip stays)', () => {
    const dir = directiveOf('group');
    byId('bold').focus();
    const shown = document.getElementById(dir.tooltipId);
    byId('italic').focus();
    expect(described('bold', 'italic', 'group')).toEqual(['bold-hint', dir.tooltipId, null]);
    expect(document.getElementById(dir.tooltipId)).toBe(shown);
  });

  it('back to the first moves it back, keeping the first control’s own ids', () => {
    const dir = directiveOf('group');
    byId('italic').focus();
    byId('bold').focus();
    expect(described('bold', 'italic')).toEqual([`bold-hint ${dir.tooltipId}`, null]);
  });

  it('focus on the second control first describes the second', () => {
    const dir = directiveOf('group');
    byId('italic').focus();
    expect(described('bold', 'italic')).toEqual(['bold-hint', dir.tooltipId]);
  });

  it('leaving the host removes it everywhere', () => {
    byId('bold').focus();
    byId('italic').focus();
    byId('outside').focus();
    expect(described('bold', 'italic', 'group')).toEqual(['bold-hint', null, null]);
    expect(document.getElementById(directiveOf('group').tooltipId)).toBeNull();
  });

  it('hover without focus inside describes the first control', () => {
    const dir = directiveOf('group');
    byId('group').dispatchEvent(new MouseEvent('mouseenter'));
    expect(described('bold', 'italic')).toEqual([`bold-hint ${dir.tooltipId}`, null]);
  });

  it('works for lc-button children (their inner buttons)', () => {
    const dir = directiveOf('kit-group');
    const inner = (id: string) => byId(id).querySelector('button') as HTMLButtonElement;
    inner('kit-bold').focus();
    expect(inner('kit-bold').getAttribute('aria-describedby')).toBe(dir.tooltipId);
    inner('kit-italic').focus();
    expect(inner('kit-bold').hasAttribute('aria-describedby')).toBe(false);
    expect(inner('kit-italic').getAttribute('aria-describedby')).toBe(dir.tooltipId);
  });
});
