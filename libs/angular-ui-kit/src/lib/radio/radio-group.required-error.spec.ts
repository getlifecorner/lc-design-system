import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { RadioComponent } from './radio.component';
import { RadioGroupComponent } from './radio-group.component';
import { audit, computedName, violations } from '../../testing/axe-jsdom';

@Component({
  imports: [RadioGroupComponent, RadioComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-radio-group legend="Sprache" [error]="error()" [required]="required()" requiredAriaLabel="Pflichtfeld" helpText="Gilt für alle Geräte.">
        <lc-radio value="de" label="Deutsch" />
        <lc-radio value="en" label="Englisch" />
      </lc-radio-group>
    </div>
  `,
})
class HostComponent {
  readonly error = signal('');
  readonly required = signal(true);
}

/** Request 065, backlog 061-n3 (AC-36): required marker and error placed like lc-checkbox-group. */
describe('lc-radio-group required marker and error placement (3.45)', () => {
  function render(setup?: (host: HostComponent) => void) {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('the * is hidden from AT and the legend says the required text (no aria-label on a bare span)', () => {
    const el = render();
    const star = el.querySelector('.lc-radio-group__required') as HTMLElement;
    expect(star.getAttribute('aria-hidden')).toBe('true');
    expect(star.hasAttribute('aria-label')).toBe(false);
    expect(el.querySelector('legend .lc-radio-group__required-text')?.textContent).toBe('Pflichtfeld');
    expect(computedName(el, el.querySelector('fieldset') as Element).replace(/\s+/g, ' ').trim()).toBe('Sprache Pflichtfeld');
  });

  it('puts the error after the options, the help text stays under the legend', () => {
    const el = render((h) => h.error.set('Bitte eine Sprache wählen.'));
    const children = Array.from((el.querySelector('fieldset') as HTMLElement).children).map((c) => c.className.split(' ')[0]);
    expect(children).toEqual(['lc-radio-group__legend', 'lc-radio-group__help', 'lc-radio-group__options', 'lc-radio-group__error']);
    expect(el.querySelector('.lc-radio-group__error')?.getAttribute('role')).toBe('alert');
  });

  it('is axe clean with the marker and the error', async () => {
    const el = render((h) => h.error.set('Bitte eine Sprache wählen.'));
    expect(violations(await audit(el))).toEqual([]);
  });

  it('styles: the required text is visually hidden; the error sits 8 px below the options', () => {
    const css = compile(resolve(__dirname, 'radio-group.component.scss')).css;
    expect(css).toMatch(/\.lc-radio-group__required-text \{\s*position: absolute;\s*width: 1px;\s*height: 1px;/);
    expect(css).toMatch(/\.lc-radio-group__error \{\s*margin: var\(--spacing-2, 0\.5rem\) 0 0;\s*color: var\(--color-text-error\);/);
  });
});
