import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from '@lifecorner/angular-ui-kit/app-shell';
import { ButtonLinkComponent } from '@lifecorner/angular-ui-kit/button';
import { PageHeaderComponent } from '@lifecorner/angular-ui-kit/page-header';

/**
 * 3.9 (request 006), rendered on the server: a figure in lc-app-shell's
 * horizon slot (AS-29), a secondary page title (AS-25) and a flush link
 * (AS-26). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-39',
  imports: [AppShellComponent, ButtonLinkComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-shell id="compat-shell-39" [horizon]="true">
      <lc-page-header id="compat-secondary" lang="en" [level]="2" size="secondary" title="Back in a few minutes" />
      <a lcButton id="compat-flush" variant="link" size="lg" [flush]="true" href="/de/code">Code erneut senden</a>
      <img shell-horizon-figure id="compat-shell-figure" src="/compat-logo/character/hello-light.svg" alt="" width="64" height="64" />
    </lc-app-shell>
  `,
})
export class Probe39 {}
