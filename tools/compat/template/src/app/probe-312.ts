import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent } from '@lifecorner/angular-ui-kit/alert';
import { InputComponent } from '@lifecorner/angular-ui-kit/input';
import { TextareaComponent } from '@lifecorner/angular-ui-kit/textarea';

/**
 * 3.12 (request 016), rendered on the server: the life-os contact form after a
 * failed submit (422). The fields' ids come from `controlId` (G-CF4), so the
 * summary links to them and the HTML is the same in every build; the field
 * errors are quiet (`announceError=false`, G-CF7), so the summary is the only
 * alert; the address is a text link in the alert's action slot (G-CF8).
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-312',
  imports: [AlertComponent, InputComponent, TextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form id="compat-contact-422" method="post" action="/kontakt">
      <lc-alert variant="error" title="Bitte prüfen Sie zwei Angaben">
        <a href="#contact-email">E-Mail-Adresse</a>
        <a slot="action" href="mailto:kontakt@beispiel.example">Schreiben Sie uns an kontakt@beispiel.example</a>
      </lc-alert>
      <lc-input controlId="contact-email" name="email" type="email" label="E-Mail-Adresse" [required]="true" error="Geben Sie eine E-Mail-Adresse ein" [announceError]="false" />
      <lc-textarea controlId="contact-message" name="message" label="Nachricht" [required]="true" [error]="true" errorMessage="Schreiben Sie uns mindestens 20 Zeichen" [announceError]="false" />
      <button type="submit">Senden</button>
    </form>
  `,
})
export class Probe312 {}
