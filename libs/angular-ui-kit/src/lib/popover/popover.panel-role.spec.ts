import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverComponent, PopoverPanelRole, PopoverTriggerKind } from './popover.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * Request 068 (3.48, usm-x row 64, design §2, §6): `panelRole="tooltip"`
 * keeps a long-press panel a tooltip; the trigger's own click is untouched.
 */
@Component({
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-popover [trigger]="trigger()" [panelRole]="role()">
        <a popover-trigger href="#ticket-4711" (click)="$event.preventDefault(); opened = opened + 1">Ticket 4711</a>
        <div popover-content><p>Drucker im 3. OG · Offen</p></div>
      </lc-popover>
      <button type="button" class="outside">Woanders</button>
    </div>
  `,
})
class Host {
  readonly trigger = signal<PopoverTriggerKind | readonly PopoverTriggerKind[]>('longpress');
  readonly role = signal<PopoverPanelRole>('tooltip');
  opened = 0;
}

describe('lc-popover panelRole (3.48)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const link = (): HTMLAnchorElement => fixture.nativeElement.querySelector('[popover-trigger]');
  const panel = (): HTMLElement | null => fixture.nativeElement.querySelector('.popover__panel');
  const contextmenu = () => {
    link().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('tooltip: the trigger has no popup state; the panel is a tooltip that describes it while open', () => {
    expect(link().hasAttribute('aria-haspopup')).toBe(false);
    expect(link().hasAttribute('aria-expanded')).toBe(false);
    contextmenu();
    expect(panel()?.getAttribute('role')).toBe('tooltip');
    expect(link().hasAttribute('aria-haspopup')).toBe(false);
    expect(link().hasAttribute('aria-expanded')).toBe(false);
    expect(link().hasAttribute('aria-controls')).toBe(false);
    expect(link().getAttribute('aria-describedby')).toBe(panel()?.id);
  });

  it('tooltip: the trigger’s own click is untouched and does not open the panel', () => {
    link().click();
    fixture.detectChanges();
    expect(host.opened).toBe(1);
    expect(panel()).toBeNull();
  });

  it('tooltip: a tap outside closes it, and so does Escape', () => {
    contextmenu();
    (fixture.nativeElement.querySelector('.outside') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(link().hasAttribute('aria-describedby')).toBe(false);
    contextmenu();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('auto (default): a long press still opens a dialog with aria-haspopup="dialog"', () => {
    host.role.set('auto');
    fixture.detectChanges();
    expect(link().getAttribute('aria-haspopup')).toBe('dialog');
    contextmenu();
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(link().getAttribute('aria-expanded')).toBe('true');
  });

  it('tooltip is ignored with click: the panel is a dialog', () => {
    host.trigger.set(['click', 'longpress']);
    fixture.detectChanges();
    expect(link().getAttribute('aria-haspopup')).toBe('dialog');
    contextmenu();
    expect(panel()?.getAttribute('role')).toBe('dialog');
  });

  it('axe: no violations with the tooltip open', async () => {
    contextmenu();
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });
});
