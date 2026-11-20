import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

/**
 * Request 072 (3.51, backlog 071-n8, AC-18): `tooltipDescription` describes
 * the element with its own text while the tooltip shows the visible text, so
 * a visible text that repeats the element's name is not heard twice.
 * `''` (the default): `aria-describedby` points at the tooltip, as before.
 */
@Component({
  standalone: true,
  imports: [TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" id="bold" aria-label="Fett" aria-describedby="hint" lcTooltip="Fett (Strg+B)" [tooltipDescription]="description()">B</button>
    <span id="hint" hidden>Formatierung</span>
    <div id="group" lcTooltip="Formatierung" [tooltipDescription]="description()">
      <button type="button" id="first">Eins</button>
      <button type="button" id="second">Zwei</button>
    </div>
  `,
})
class Host {
  readonly description = signal('');
}

describe('lcTooltip tooltipDescription (3.51, 071-n8)', () => {
  let fixture: ComponentFixture<Host>;
  const byId = (id: string) => document.getElementById(id) as HTMLElement;
  const directiveOf = (id: string): TooltipDirective => fixture.debugElement.query(By.css(`#${id}`)).injector.get(TooltipDirective);
  const describedText = (id: string) =>
    (byId(id).getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter(Boolean)
      .map((ref) => document.getElementById(ref)?.textContent ?? `(missing ${ref})`);

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    directiveOf('bold').hide();
    directiveOf('group').hide();
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("'' (default): aria-describedby points at the tooltip; no description element (as before)", () => {
    const dir = directiveOf('bold');
    byId('bold').focus();
    fixture.detectChanges();
    expect(byId('bold').getAttribute('aria-describedby')).toBe(`hint ${dir.tooltipId}`);
    expect(document.querySelector('.lc-tooltip-description')).toBeNull();
    expect(byId(dir.tooltipId).innerHTML.replace(/<!--[^]*?-->/g, '')).toBe('<div class="lc-tooltip-inner">Fett (Strg+B)</div>');
  });

  it('set: the description is a hidden element inside the tooltip; the visible text is unchanged', () => {
    fixture.componentInstance.description.set('Strg+B');
    fixture.detectChanges();
    const dir = directiveOf('bold');
    byId('bold').focus();
    fixture.detectChanges();
    expect(byId('bold').getAttribute('aria-describedby')).toBe(`hint ${dir.tooltipId}-description`);
    expect(describedText('bold')).toEqual(['Formatierung', 'Strg+B']);
    const description = byId(`${dir.tooltipId}-description`);
    expect(description.hidden).toBe(true);
    expect(description.closest('[role="tooltip"]')?.id).toBe(dir.tooltipId);
    expect(byId(dir.tooltipId).querySelector('.lc-tooltip-inner')?.textContent).toBe('Fett (Strg+B)');
  });

  it('hiding removes only its own id (the app’s ids stay)', () => {
    fixture.componentInstance.description.set('Strg+B');
    fixture.detectChanges();
    byId('bold').focus();
    fixture.detectChanges();
    byId('bold').blur();
    fixture.detectChanges();
    expect(byId('bold').getAttribute('aria-describedby')).toBe('hint');
    expect(document.querySelector('.lc-tooltip-description')).toBeNull();
  });

  it('a host with two controls: the focused control is described by the description, also after moving on', () => {
    fixture.componentInstance.description.set('Zwei Knöpfe');
    fixture.detectChanges();
    const id = `${directiveOf('group').tooltipId}-description`;
    byId('first').focus();
    fixture.detectChanges();
    expect([byId('first').getAttribute('aria-describedby'), byId('second').getAttribute('aria-describedby')]).toEqual([id, null]);
    byId('second').focus();
    fixture.detectChanges();
    expect([byId('first').getAttribute('aria-describedby'), byId('second').getAttribute('aria-describedby')]).toEqual([null, id]);
    expect(describedText('second')).toEqual(['Zwei Knöpfe']);
  });
});
