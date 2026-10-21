import { ChangeDetectionStrategy, Component, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaComponent } from './textarea.component';

/**
 * 3.10 (request 008): `name`, `value` as a model, `requiredIndicator` and
 * `requiredAriaLabel` (G-CF1, G-CF3, life-os contact form), and the server-only
 * leading-newline guard (design D4).
 */

/** The text of the compat probe (tools/compat/template/src/app/probe-310.ts). */
const MESSAGE = '\nErste Zeile\nZweite Zeile: <b> & "zitiert"\n</textarea><p>x</p>\n';

/** What the server writes for MESSAGE (EXPECT_IN_HTML 'textarea name and value before JS'). */
const SERVER_HTML =
  '<textarea name="message" required="">\n\nErste Zeile\nZweite Zeile: &lt;b&gt; &amp; "zitiert"\n' +
  '&lt;/textarea&gt;&lt;p&gt;x&lt;/p&gt;\n</textarea>';

@Component({
  imports: [TextareaComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <form>
      <lc-textarea
        [label]="label()"
        [name]="name()"
        [(value)]="value"
        [required]="required()"
        [requiredIndicator]="requiredIndicator()"
        [requiredAriaLabel]="requiredAriaLabel()"
        (valueChange)="changes.push($event)"
      />
    </form>
  `,
})
class ValueHostComponent {
  readonly label = signal('Nachricht');
  readonly name = signal<string | undefined>('message');
  readonly value = signal('');
  readonly required = signal(false);
  readonly requiredIndicator = signal(true);
  readonly requiredAriaLabel = signal('required');
  readonly changes: string[] = [];
}

@Component({
  imports: [TextareaComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-textarea label="Notiz" name="note" [(ngModel)]="note" />`,
})
class NgModelHostComponent {
  note = 'Aus dem Modell';
}

@Component({
  imports: [TextareaComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-textarea label="Notiz" [formControl]="control" (valueChange)="changes.push($event)" />`,
})
class ControlHostComponent {
  readonly control = new FormControl('Aus dem Formular', { nonNullable: true });
  readonly changes: string[] = [];
}

const typeInto = (fixture: ComponentFixture<unknown>, el: HTMLTextAreaElement, text: string): void => {
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
};

describe('textarea.component 3.10: name and value (G-CF1)', () => {
  let fixture: ComponentFixture<ValueHostComponent>;
  let host: ValueHostComponent;
  const textarea = (): HTMLTextAreaElement => fixture.nativeElement.querySelector('textarea');
  const component = (): TextareaComponent =>
    fixture.debugElement.query((de) => de.componentInstance instanceof TextareaComponent).componentInstance;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('AC-1: renders name on the native textarea; unset = no attribute', () => {
    expect(textarea().getAttribute('name')).toBe('message');
    host.name.set(undefined);
    fixture.detectChanges();
    expect(textarea().hasAttribute('name')).toBe(false);
  });

  it('AC-2: pre-fills the native textarea from value, multi-line text unchanged', () => {
    host.value.set(MESSAGE);
    fixture.detectChanges();
    expect(textarea().value).toBe(MESSAGE);
    // in the browser there is no extra line break (D4 is server-only)
    expect(component().value()).toBe(MESSAGE);
  });

  it('AC-3: [(value)] is two-way: typing writes back to the parent', () => {
    host.value.set('Hallo');
    fixture.detectChanges();
    typeInto(fixture, textarea(), 'Hallo!');
    expect(host.value()).toBe('Hallo!');
  });

  it('AC-4: a form serialises name=value, line breaks as given', () => {
    host.value.set(MESSAGE);
    fixture.detectChanges();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    expect(new FormData(form).get('message')).toBe(MESSAGE);
  });

  it('AC-4: the prerendered textarea parses back to the exact text (FormData)', () => {
    const doc = new DOMParser().parseFromString(`<form>${SERVER_HTML}</form>`, 'text/html');
    const posted = new FormData(doc.querySelector('form') as HTMLFormElement).get('message') as string;
    expect(doc.querySelectorAll('textarea')).toHaveLength(1);
    expect(doc.querySelector('p')).toBeNull();
    expect(posted.replace(/\r\n/g, '\n')).toBe(MESSAGE);
  });

  it('AC-5: name and pre-filled value stay; typing updates value and emits valueChange once', () => {
    host.value.set('Hallo');
    fixture.detectChanges();
    host.changes.length = 0;
    typeInto(fixture, textarea(), 'Hallo!');
    expect(component().value()).toBe('Hallo!');
    expect(host.changes).toEqual(['Hallo!']);
    expect(textarea().getAttribute('name')).toBe('message');
    expect(textarea().value).toBe('Hallo!');
  });

  it('AC-9: one emission per keystroke that changes the text, none for an unchanged input event', () => {
    typeInto(fixture, textarea(), 'a');
    typeInto(fixture, textarea(), 'ab');
    typeInto(fixture, textarea(), 'abc');
    expect(host.changes).toEqual(['a', 'ab', 'abc']);
    typeInto(fixture, textarea(), 'abc');
    expect(host.changes).toEqual(['a', 'ab', 'abc']);
  });

  it('AC-9: a parent [value] change does not emit valueChange', () => {
    host.value.set('Vom Server');
    fixture.detectChanges();
    expect(textarea().value).toBe('Vom Server');
    expect(host.changes).toEqual([]);
  });

  it('AC-9: code that sets a different value emits once (documented)', () => {
    component().value.set('Code');
    fixture.detectChanges();
    component().value.set('Code');
    expect(host.changes).toEqual(['Code']);
    expect(textarea().value).toBe('Code');
  });
});

describe('textarea.component 3.10: requiredIndicator and requiredAriaLabel (G-CF3)', () => {
  let fixture: ComponentFixture<ValueHostComponent>;
  let host: ValueHostComponent;
  const textarea = (): HTMLTextAreaElement => fixture.nativeElement.querySelector('textarea');
  const indicator = (): HTMLElement | null => fixture.nativeElement.querySelector('.lc-textarea-required-indicator');

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueHostComponent);
    host = fixture.componentInstance;
    host.required.set(true);
    fixture.detectChanges();
  });

  it('AC-7: shows the * by default for a required field', () => {
    expect(indicator()?.textContent).toBe('*');
  });

  it('AC-7: requiredIndicator=false removes the * but keeps the required semantics', () => {
    host.requiredIndicator.set(false);
    fixture.detectChanges();
    expect(indicator()).toBeNull();
    expect(textarea().required).toBe(true);
    expect(textarea().getAttribute('aria-required')).toBe('true');
  });

  it('AC-8: the * stays hidden from AT and unnamed; requiredAriaLabel is not in the DOM', () => {
    host.requiredAriaLabel.set('Pflichtfeld');
    fixture.detectChanges();
    expect(indicator()?.getAttribute('aria-hidden')).toBe('true');
    expect(indicator()?.hasAttribute('aria-label')).toBe(false);
    expect(fixture.nativeElement.innerHTML).not.toContain('Pflichtfeld');
    expect(textarea().getAttribute('aria-required')).toBe('true');
    // accessible name from <label for>: the label text without aria-hidden content
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    const clone = label.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
    expect(label.htmlFor).toBe(textarea().id);
    expect(clone.textContent?.trim()).toBe('Nachricht');
  });
});

describe('textarea.component 3.10: forms (AC-3)', () => {
  it('ngModel: the model value is shown and readable through value()', async () => {
    const fixture = TestBed.createComponent(NgModelHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const cmp: TextareaComponent = fixture.debugElement.query((de) => de.componentInstance instanceof TextareaComponent)
      .componentInstance;
    expect(el.value).toBe('Aus dem Modell');
    expect(cmp.value()).toBe('Aus dem Modell');
    expect(el.getAttribute('name')).toBe('note');

    typeInto(fixture, el, 'Getippt');
    expect(fixture.componentInstance.note).toBe('Getippt');
  });

  it('FormControl: the control value wins after writeValue; writeValue emits once, an equal write not', () => {
    const fixture = TestBed.createComponent(ControlHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(el.value).toBe('Aus dem Formular');
    expect(host.changes).toEqual(['Aus dem Formular']);

    host.control.setValue('x');
    fixture.detectChanges();
    host.control.setValue('x');
    fixture.detectChanges();
    expect(el.value).toBe('x');
    expect(host.changes).toEqual(['Aus dem Formular', 'x']);
  });
});

describe('textarea.component 3.10: unchanged default rendering (AC-9)', () => {
  it('keeps the 3.9 attribute set on the default textarea', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('label', 'Notiz');
    fixture.detectChanges();
    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(el.getAttributeNames().sort()).toEqual(['class', 'id', 'placeholder', 'rows']);
    expect([...el.classList].sort()).toEqual(['lc-textarea', 'lc-textarea--md', 'lc-textarea--outline']);
    expect(el.getAttribute('placeholder')).toBe('');
    expect(el.getAttribute('rows')).toBe('3');
    expect(el.value).toBe('');
    expect(fixture.nativeElement.querySelector('.lc-textarea-required-indicator')).toBeNull();
  });

  it('valueChange stays subscribable as a class property; setInput(value) does not emit, writeValue once per change', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    const changes: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => changes.push(v));
    fixture.componentRef.setInput('value', 'Vorgabe');
    fixture.detectChanges();
    expect(changes).toEqual([]);
    fixture.componentInstance.writeValue('x');
    fixture.componentInstance.writeValue('x');
    expect(changes).toEqual(['x']);
  });
});

describe('textarea.component 3.10: server-only leading-newline guard (AC-2, D4)', () => {
  const render = (value: string): HTMLTextAreaElement => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('textarea');
  };

  describe('on the server', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    });

    it('adds one \\n before a leading line break', () => {
      expect(render('\nHi').value).toBe('\n\nHi');
      // jsdom normalises CR LF and CR to LF in the native value
      expect(render('\r\nHi').value).toBe('\n\nHi');
      expect(render('\rHi').value).toBe('\n\nHi');
      expect(render(MESSAGE).value).toBe(`\n${MESSAGE}`);
    });

    it('leaves other text and the empty default unchanged', () => {
      expect(render('Hi\n').value).toBe('Hi\n');
      expect(render('').value).toBe('');
    });
  });

  it('in the browser the native value is the value as given', () => {
    expect(render('\nHi').value).toBe('\nHi');
  });
});
