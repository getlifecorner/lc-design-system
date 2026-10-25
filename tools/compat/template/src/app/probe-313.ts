import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonLinkComponent } from '@lifecorner/angular-ui-kit/button';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';

/**
 * 3.13 (request 017), rendered on the server: the life-os home band with one
 * inverse link button in the default hero body (G-WL1). The class and its
 * rule are in the page before JavaScript, so the band doesn't shift. The
 * error-state class of lc-input (G-WL3) is checked on probe-312's form.
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-313',
  imports: [ButtonLinkComponent, HeroComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-hero id="compat-band" title="Alles, was eure Familie am Laufen hält" color="primary" borderRadius="none" contentWidth="lg">
      <p>Zeigt dir jeden Tag, was zählt, und warum.</p>
      <a lcButton id="compat-inverse" variant="inverse" size="lg" href="#warteliste">Trag dich jetzt in die Warteliste ein</a>
    </lc-hero>
    <div id="warteliste">Warteliste</div>
  `,
})
export class Probe313 {}
