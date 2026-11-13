import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { audit, computedName, violations } from '../../testing/axe-jsdom';
import { CheckboxComponent, CheckboxSize } from './checkbox.component';
import { CheckboxGroupComponent, CheckboxGroupOrientation } from './checkbox-group.component';

@Component({
  imports: [CheckboxGroupComponent, CheckboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-checkbox-group
      legend="Rollen"
      [legendHidden]="legendHidden()"
      [helpText]="helpText()"
      [error]="error()"
      [required]="required()"
      [requiredIndicator]="requiredIndicator()"
      [requiredAriaLabel]="requiredAriaLabel()"
      [disabled]="disabled()"
      [orientation]="orientation()"
      [size]="size()"
      [(value)]="value"
      (valueChange)="changes.push($event)"
    >
      <lc-checkbox value="administration" label="Administration" />
      <lc-checkbox value="controlling" label="Controlling" />
      <lc-checkbox value="cfo" label="CFO" [checked]="cfoChecked()" />
    </lc-checkbox-group>
  `,
})
class HostComponent {
  readonly legendHidden = signal(false);
  readonly helpText = signal('');
  readonly error = signal('');
  readonly required = signal(false);
  readonly requiredIndicator = signal(true);
  readonly requiredAriaLabel = signal('Pflichtfeld');
  readonly disabled = signal(false);
  readonly orientation = signal<CheckboxGroupOrientation>('vertical');
  readonly size = signal<CheckboxSize>('md');
  readonly value = signal<string[]>(['controlling']);
  readonly cfoChecked = signal(false);
  readonly changes: string[][] = [];
}

@Component({
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-checkbox-group legend="Rollen" [formControl]="control">
      <lc-checkbox value="administration" label="Administration" />
      <lc-checkbox value="controlling" label="Controlling" />
      <lc-checkbox value="cfo" label="CFO" />
      <lc-checkbox label="Ohne Wert" />
    </lc-checkbox-group>
  `,
})
class FormHostComponent {
  readonly control = new FormControl<string[]>(['controlling'], { nonNullable: true, validators: Validators.required });
}

@Component({
  imports: [CheckboxGroupComponent, CheckboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-checkbox-group legend="Benachrichtigungen" size="lg" error="Bitte prüfen.">
      <lc-checkbox label="E-Mail" size="md" helpText="Updates per E-Mail" />
      <lc-checkbox label="SMS" [error]="true" errorMessage="Nummer fehlt." />
      <lc-checkbox label="AGB akzeptieren" [required]="true" />
    </lc-checkbox-group>
    <lc-checkbox label="Allein" helpText="Hilfe" />
  `,
})
class ChildHostComponent {}

const SCSS = readFileSync(resolve(__dirname, 'checkbox.component.scss'), 'utf-8');

describe('CheckboxGroupComponent (lc-checkbox-group, request 061)', () => {
  describe('with [(value)]', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const el = () => fixture.nativeElement as HTMLElement;
    const inputs = () => Array.from(el().querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    const labels = () => Array.from(el().querySelectorAll('label')) as HTMLLabelElement[];
    const fieldset = () => el().querySelector('fieldset') as HTMLFieldSetElement;
    const describedTexts = () =>
      (fieldset().getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => el().querySelector(`#${id}`)?.textContent?.trim());
    const render = () => {
      fixture.detectChanges();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      render();
    });

    it('AC-1: one native fieldset named by its legend, around the three checkboxes', () => {
      expect(el().querySelectorAll('fieldset')).toHaveLength(1);
      expect(fieldset().classList).toContain('lc-checkbox-group');
      expect(fieldset().querySelector('legend')?.textContent?.trim()).toBe('Rollen');
      expect(fieldset().querySelectorAll('input[type="checkbox"]')).toHaveLength(3);
      expect(computedName(el(), fieldset())).toBe('Rollen');
    });

    it('AC-1, AC-16: axe has no violations, plain and with help, error and required', async () => {
      expect(violations(await audit(el()))).toEqual([]);
      host.helpText.set('Mehrere Rollen sind möglich.');
      host.error.set('Wählen Sie mindestens eine Rolle.');
      host.required.set(true);
      render();
      const results = await audit(el());
      expect(violations(results)).toEqual([]);
      expect(results.incomplete.map((r) => r.id)).not.toContain('aria-prohibited-attr');
    });

    it('AC-2: legendHidden hides the legend visually and keeps the name', () => {
      host.legendHidden.set(true);
      render();
      const legend = fieldset().querySelector('legend') as HTMLElement;
      expect(legend.classList).toContain('lc-checkbox-group__legend--hidden');
      expect(computedName(el(), fieldset())).toBe('Rollen');
    });

    it('AC-3: help text renders once below the legend and describes the group', () => {
      expect(fieldset().hasAttribute('aria-describedby')).toBe(false);
      host.helpText.set('Mehrere Rollen sind möglich.');
      render();
      const help = el().querySelectorAll('.lc-checkbox-group__help');
      expect(help).toHaveLength(1);
      expect(fieldset().querySelector('legend')?.nextElementSibling).toBe(help[0]);
      expect(describedTexts()).toEqual(['Mehrere Rollen sind möglich.']);
    });

    it('AC-4: the error renders once below the options, describes the group and marks every checkbox invalid', () => {
      host.helpText.set('Mehrere Rollen sind möglich.');
      host.error.set('Wählen Sie mindestens eine Rolle.');
      render();
      const errors = el().querySelectorAll('.lc-checkbox-group__error');
      expect(errors).toHaveLength(1);
      expect(errors[0].getAttribute('role')).toBe('alert');
      expect(errors[0].previousElementSibling?.classList).toContain('lc-checkbox-group__options');
      expect(el().querySelectorAll('.checkbox-error-message')).toHaveLength(0);
      expect(describedTexts()).toEqual(['Mehrere Rollen sind möglich.', 'Wählen Sie mindestens eine Rolle.']);
      expect(inputs().map((i) => i.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true']);
      expect(labels().every((l) => l.classList.contains('checkbox-error'))).toBe(true);
      host.error.set('');
      render();
      expect(el().querySelector('.lc-checkbox-group__error')).toBeNull();
      expect(inputs().some((i) => i.hasAttribute('aria-invalid'))).toBe(false);
    });

    it('AC-6: required shows an aria-hidden * and a spoken label after the legend; the checkboxes stay optional', () => {
      host.required.set(true);
      render();
      const star = fieldset().querySelector('legend .lc-checkbox-group__required') as HTMLElement;
      expect(star.textContent).toBe('*');
      expect(star.getAttribute('aria-hidden')).toBe('true');
      expect(fieldset().querySelector('legend .lc-checkbox-group__required-text')?.textContent).toBe('Pflichtfeld');
      expect(computedName(el(), fieldset())).toBe('Rollen Pflichtfeld');
      expect(inputs().some((i) => i.required || i.hasAttribute('aria-required'))).toBe(false);
      expect(labels().some((l) => l.classList.contains('checkbox-required'))).toBe(false);
      host.requiredIndicator.set(false);
      render();
      expect(fieldset().querySelector('.lc-checkbox-group__required')).toBeNull();
      expect(fieldset().querySelector('.lc-checkbox-group__required-text')).toBeNull();
      expect(computedName(el(), fieldset())).toBe('Rollen');
    });

    it('AC-7: disabled disables the fieldset and every checkbox', () => {
      host.disabled.set(true);
      render();
      expect(fieldset().disabled).toBe(true);
      expect(inputs().every((i) => i.disabled && i.tabIndex === -1)).toBe(true);
      expect(labels().every((l) => l.classList.contains('checkbox-disabled'))).toBe(true);
    });

    it('AC-8: the group size reaches every checkbox; an lg row in a group gets 44 px', () => {
      expect(labels().every((l) => l.classList.contains('checkbox-md'))).toBe(true);
      host.size.set('lg');
      render();
      expect(labels().every((l) => l.classList.contains('checkbox-lg'))).toBe(true);
      expect(labels().every((l) => l.classList.contains('checkbox-in-group'))).toBe(true);
      expect(SCSS).toMatch(/\.checkbox-lg\.checkbox-in-group \{\s*min-height: 2\.75rem;\s*\}/);
    });

    it('AC-9: vertical by default, horizontal on request', () => {
      const options = () => el().querySelector('.lc-checkbox-group__options') as HTMLElement;
      expect(options().classList).toContain('lc-checkbox-group__options--vertical');
      host.orientation.set('horizontal');
      render();
      expect(options().classList).toContain('lc-checkbox-group__options--horizontal');
      expect(options().classList).not.toContain('lc-checkbox-group__options--vertical');
    });

    it('AC-10: every checkbox is a tab stop in DOM order; Space (a click) toggles it', () => {
      expect(inputs().map((i) => i.tabIndex)).toEqual([0, 0, 0]);
      inputs()[2].focus();
      expect(document.activeElement).toBe(inputs()[2]);
      inputs()[2].click();
      render();
      expect(inputs()[2].checked).toBe(true);
    });

    it('AC-11: checks the boxes of the bound value and follows it', () => {
      expect(inputs().map((i) => i.checked)).toEqual([false, true, false]);
      host.value.set(['cfo', 'administration']);
      render();
      expect(inputs().map((i) => i.checked)).toEqual([true, false, true]);
    });

    it('AC-11: a toggle writes the checked values back in the order of the checkboxes', () => {
      inputs()[0].click();
      render();
      expect(host.value()).toEqual(['administration', 'controlling']);
      inputs()[1].click();
      render();
      expect(host.value()).toEqual(['administration']);
      expect(host.changes).toEqual([['administration', 'controlling'], ['administration']]);
      expect(inputs().map((i) => i.checked)).toEqual([true, false, false]);
    });

    it('AC-11: the group value wins over a checkbox [checked] binding', () => {
      host.cfoChecked.set(true);
      render();
      expect(inputs()[2].checked).toBe(false);
    });
  });

  describe('with a FormControl (AC-11)', () => {
    let fixture: ComponentFixture<FormHostComponent>;
    let host: FormHostComponent;
    const inputs = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    const render = () => {
      fixture.detectChanges();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
      fixture = TestBed.createComponent(FormHostComponent);
      host = fixture.componentInstance;
      render();
    });

    it('writes the control value to the checkboxes and follows setValue()', () => {
      expect(inputs().map((i) => i.checked)).toEqual([false, true, false, false]);
      host.control.setValue(['cfo']);
      render();
      expect(inputs().map((i) => i.checked)).toEqual([false, false, true, false]);
    });

    it('reports a toggle as an ordered array; Validators.required sees an empty array', () => {
      inputs()[2].click();
      render();
      inputs()[0].click();
      render();
      expect(host.control.value).toEqual(['administration', 'controlling', 'cfo']);
      host.control.setValue([]);
      render();
      expect(host.control.invalid).toBe(true);
    });

    it('keeps written values that match no checkbox; a checkbox without value is not part of it', () => {
      host.control.setValue(['extern', 'cfo']);
      render();
      inputs()[0].click();
      render();
      expect(host.control.value).toEqual(['administration', 'cfo', 'extern']);
      inputs()[3].click();
      render();
      expect(inputs()[3].checked).toBe(true);
      expect(host.control.value).toEqual(['administration', 'cfo', 'extern']);
    });

    it('follows control.disable()', () => {
      host.control.disable();
      render();
      expect(inputs().every((i) => i.disabled)).toBe(true);
      host.control.enable();
      render();
      expect(inputs().some((i) => i.disabled)).toBe(false);
    });

    it('marks the control touched when a checkbox loses focus', () => {
      expect(host.control.touched).toBe(false);
      inputs()[1].dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBe(true);
    });
  });

  describe('children (AC-5, AC-6, AC-8)', () => {
    let fixture: ComponentFixture<ChildHostComponent>;
    const el = () => fixture.nativeElement as HTMLElement;
    const boxes = () => Array.from(el().querySelectorAll('lc-checkbox')) as HTMLElement[];

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [ChildHostComponent] }).compileComponents();
      fixture = TestBed.createComponent(ChildHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();
    });

    it('keeps a child help text and a child error message inside a group, and alone', () => {
      const [mail, sms, , alone] = boxes();
      const mailInput = mail.querySelector('input') as HTMLInputElement;
      const help = mail.querySelector('.checkbox-help-text') as HTMLElement;
      expect(help.textContent?.trim()).toBe('Updates per E-Mail');
      expect(help.id).toBe(`${mailInput.id}-help`);
      expect(mailInput.getAttribute('aria-describedby')).toBe(help.id);
      const smsInput = sms.querySelector('input') as HTMLInputElement;
      const message = sms.querySelector('.checkbox-error-message') as HTMLElement;
      expect(message.textContent?.trim()).toBe('Nummer fehlt.');
      expect(smsInput.getAttribute('aria-describedby')).toBe(`${smsInput.id}-error`);
      expect(alone.querySelector('.checkbox-help-text')?.textContent?.trim()).toBe('Hilfe');
      expect(el().querySelectorAll('.checkbox-error-message')).toHaveLength(1);
      expect(el().querySelectorAll('.lc-checkbox-group__error')).toHaveLength(1);
    });

    it('a size bound on a child wins over the group size', () => {
      const classes = boxes().map((b) => (b.querySelector('label') as HTMLElement).className);
      expect(classes[0]).toContain('checkbox-md');
      expect(classes[1]).toContain('checkbox-lg');
      expect(classes[2]).toContain('checkbox-lg');
    });

    it('a child’s own required keeps its * and native required', () => {
      const terms = boxes()[2];
      expect(terms.querySelector('label')?.classList).toContain('checkbox-required');
      expect((terms.querySelector('input') as HTMLInputElement).required).toBe(true);
    });

    it('AC-15: a checkbox outside a group renders as before (no group class, no invalid state)', () => {
      const alone = boxes()[3];
      expect(alone.querySelector('label')?.className).toBe('checkbox-label checkbox-md');
      expect(alone.querySelector('input')?.hasAttribute('aria-invalid')).toBe(false);
      expect(alone.innerHTML).not.toContain('value');
    });
  });

  // AC-15: the DOM of a standalone lc-checkbox, byte for byte as in 3.40 (ids and
  // Angular's comment anchors and scoping attributes normalised).
  it('AC-15: pins the default DOM of a standalone lc-checkbox', () => {
    TestBed.configureTestingModule({ imports: [CheckboxComponent] });
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('label', 'Zustimmen');
    fixture.detectChanges();
    const html = (fixture.nativeElement as HTMLElement).innerHTML
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s_ngcontent-[\w-]+=""/g, '')
      .replace(/lc-checkbox-\d+/g, 'lc-checkbox-N')
      .replace(/\s+/g, ' ');
    expect(html).toBe(
      '<label class="checkbox-label checkbox-md" for="lc-checkbox-N">' +
        '<input type="checkbox" role="checkbox" class="checkbox-input" id="lc-checkbox-N" tabindex="0">' +
        '<span class="checkbox-box"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="checkbox-icon"></svg></span>' +
        '<span class="checkbox-label-text">Zustimmen</span></label>',
    );
  });
});
