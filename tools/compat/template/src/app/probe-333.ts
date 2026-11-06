import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '@lifecorner/angular-ui-kit/header';

/**
 * 3.33 (request 052, finance-intelligence app-shell row 1), rendered on the
 * server: `contextPlacement="below"` is a class and CSS only, so the context
 * button is in the page once and its second row holds before JS (052 AC-8).
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-333',
  imports: [HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-header id="compat-header-333" size="sm" variant="transparent" [sticky]="false" [showLogo]="false"
      title="Finance Intelligence" titleTag="span" contextPlacement="below" contextLabel="Monatsstand"
      contextName="September 2026 · Fassung 1" contextAriaLabel="Monatsstand wählen" [showUserMenu]="false" />
  `,
})
export class Probe333 {}
