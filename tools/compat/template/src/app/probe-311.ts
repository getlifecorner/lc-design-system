import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent, provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHECK } from '@lifecorner/angular-ui-kit/icons';

/**
 * 3.11.1 (request 011, G-37), rendered on the server: the positive control of
 * the no-`style` rule. Every other lc-icon on the prerendered pages has the
 * default colour and carries no `style` attribute; a custom `color` is the
 * one opt-in that still writes the svg's inline colour. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-311',
  imports: [IconComponent],
  providers: [provideLcIcons([ICON_CHECK])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div><lc-icon id="compat-color" name="check" color="var(--color-primary-500)" /></div>`,
})
export class Probe311 {}
