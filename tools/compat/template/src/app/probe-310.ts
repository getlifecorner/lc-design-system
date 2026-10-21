import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputComponent } from '@lifecorner/angular-ui-kit/input';
import { TextareaComponent } from '@lifecorner/angular-ui-kit/textarea';

/**
 * 3.10 (request 008), rendered on the server: a plain contact form that posts
 * without JavaScript. lc-textarea's `name` and `value` (G-CF1, with a leading
 * line break and text that must be escaped) and lc-input's `value` in the
 * prerendered `value` attribute (G-CF2). Secondary entries only. The plain
 * submit button is what implicit submission needs.
 */
@Component({
  selector: 'lc-compat-310',
  imports: [InputComponent, TextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form id="compat-contact" method="post" action="/kontakt">
      <lc-input name="email" type="email" value="a@b.de" label="E-Mail" />
      <lc-input name="name" [value]="person" label="Name" />
      <lc-textarea name="message" [value]="message" label="Nachricht" [required]="true" requiredAriaLabel="Pflichtfeld" />
      <button type="submit">Senden</button>
    </form>
  `,
})
export class Probe310 {
  protected readonly person = 'Anna "Ann" & Co';
  protected readonly message = '\nErste Zeile\nZweite Zeile: <b> & "zitiert"\n</textarea><p>x</p>\n';
}
