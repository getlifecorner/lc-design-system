import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PopoverComponent } from './popover.component';

/**
 * 3.31 (request 050, AC-4, WCAG 3.1.2): the popover panel is not a body
 * overlay but an inline descendant of the host, so it inherits the host's
 * `lang` through the DOM. No code change; this pins it.
 */
@Component({
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-popover>
        <button popover-trigger type="button">Details</button>
        <p popover-content>Gilt ab dem nächsten Monat.</p>
      </lc-popover>
    </div>
  `,
})
class Host {}

describe('lc-popover panel language (request 050, AC-4)', () => {
  it('renders the open panel inside the host, so it resolves the host lang', () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[popover-trigger]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const panel = root.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(root.querySelector('lc-popover')?.contains(panel)).toBe(true);
    expect(panel.closest('[lang]')?.getAttribute('lang')).toBe('de');
    expect(panel.textContent).toContain('Gilt ab');
    fixture.destroy();
  });
});
