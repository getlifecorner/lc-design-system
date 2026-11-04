import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@lifecorner/angular-ui-kit/button';
import { CardComponent } from '@lifecorner/angular-ui-kit/card';

/**
 * 3.29 (request 046, life-os CC-2), rendered on the server: lc-card's equal
 * footer. The host class and the container/grid rules are in the
 * prerendered page, so two answers share the footer at equal width before
 * JS. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-329',
  imports: [ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card id="compat-card-329-equal" title="Streaming-Abo" variant="outlined" footerLayout="equal">
      Monatlich
      <div card-footer>
        <lc-button variant="outline" size="lg" [fullWidth]="true">Stimmt</lc-button>
        <lc-button variant="outline" size="lg" [fullWidth]="true">Kein Vertrag</lc-button>
      </div>
    </lc-card>
  `,
})
export class Probe329 {}
