import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLcIcons, type LcIconDefinition } from '@lifecorner/angular-ui-kit/icon';
import { DrawerComponent } from './drawer.component';

@Component({
  standalone: true,
  imports: [DrawerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-drawer [open]="true" [heading]="heading()" ariaLabel="Quick actions" [closeAriaLabel]="closeAriaLabel()">
      <p>Content</p>
    </lc-drawer>
  `,
})
class DrawerIconHostComponent {
  readonly heading = signal('Task Details');
  readonly closeAriaLabel = signal('Close drawer');
}

/** A registered glyph, so the icon renders its svg without a fetch. */
const ICON_X_MARK: LcIconDefinition = {
  name: 'x-mark',
  variant: 'outline',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>',
};

/**
 * Request 024 (AC-7, 023 review svg-img-alt): both close buttons of lc-drawer,
 * in the header and the floating one without a heading, have a decorative
 * icon (no unnamed `role="img"`); `closeAriaLabel` names the button.
 */
describe('DrawerComponent — the close icons are decorative (024)', () => {
  async function render(heading: string) {
    await TestBed.configureTestingModule({
      imports: [DrawerIconHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons([ICON_X_MARK])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DrawerIconHostComponent);
    fixture.componentInstance.heading.set(heading);
    fixture.detectChanges();
    return fixture;
  }

  it.each([
    ['in the header', 'Task Details', '.lc-drawer__header .lc-drawer__close'],
    ['floating, without a heading', '', '.lc-drawer__close--floating'],
  ])('%s: aria-hidden svg without role or name, the button keeps its name', async (_site, heading, selector) => {
    const fixture = await render(heading);
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.lc-drawer__close');
    expect(buttons.length).toBe(1);
    const button = el.querySelector<HTMLButtonElement>(selector);
    expect(button).toBe(buttons[0]);
    const svg = button?.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.hasAttribute('role')).toBe(false);
    expect(svg?.hasAttribute('aria-label')).toBe(false);
    expect(button?.getAttribute('aria-label')).toBe('Close drawer');

    fixture.componentInstance.closeAriaLabel.set('Schließen');
    fixture.detectChanges();
    expect(button?.getAttribute('aria-label')).toBe('Schließen');
    expect(button?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
