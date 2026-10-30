import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageComponent } from '@lifecorner/angular-ui-kit/app-shell';
import { AvatarComponent } from '@lifecorner/angular-ui-kit/avatar';
import { ButtonComponent, ButtonLinkComponent } from '@lifecorner/angular-ui-kit/button';
import { EmptyStateComponent } from '@lifecorner/angular-ui-kit/empty-state';
import { HeaderComponent } from '@lifecorner/angular-ui-kit/header';
import { PageHeaderComponent } from '@lifecorner/angular-ui-kit/page-header';

/**
 * 3.15 (request 020), rendered on the server: the finance-intelligence state
 * page with every new modifier — the page lined up with the header
 * (`paddingX`, `paddingTop`), the page header's `paddingTop`, the primary
 * empty-state icon at the state-page scale, the outline primary tone on a
 * button and a link, and the person avatar (in the header trigger and alone).
 * Classes, static CSS and a template SVG only, so the HTML is final before JS.
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-315',
  imports: [AppPageComponent, AvatarComponent, ButtonComponent, ButtonLinkComponent, EmptyStateComponent, HeaderComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-header id="compat-header-315" size="md" variant="transparent" [sticky]="false" [showLogo]="false"
               title="Finance Intelligence" titleTag="span" userMenuTrigger="avatar" userName=""
               userAvatarFallback="person" userMenuAriaLabel="Benutzermenü" logoutLabel="Abmelden" />
    <lc-app-page id="compat-page-315" mainId="compat-main-315" paddingX="header" paddingTop="md" contentMaxWidth="none">
      <lc-page-header id="compat-page-header-315" size="comfortable" [noPaddingX]="true" paddingTop="none" title="Noch keine Rolle" />
      <lc-empty-state id="compat-empty-315" icon="logout" iconTone="primary" messageSize="md"
                      message="Ihrem Konto ist noch keine Rolle zugeordnet. Bitte wenden Sie sich an die Administration.">
        <lc-button id="compat-tone-315" variant="outline" tone="primary" size="lg">Abmelden</lc-button>
      </lc-empty-state>
      <a lcButton id="compat-tone-link-315" variant="outline" tone="primary" size="lg" href="/abmelden">Abmelden</a>
      <lc-avatar id="compat-avatar-315" size="lg" fallback="person" />
    </lc-app-page>
  `,
})
export class Probe315 {}
