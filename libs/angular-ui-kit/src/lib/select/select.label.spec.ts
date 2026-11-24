import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SelectComponent, type SelectOption } from './select.component';
import { audit, computedName, violations } from '../../testing/axe-jsdom';

/**
 * 3.52 (request 073, finance-intelligence simulation row 1, AC-14 … AC-18,
 * design D-6, D-7): `label` shows a visible label above the trigger and names
 * it through `aria-labelledby` (a `div role="combobox"` is not labelable, so
 * the label has no `for`); `ariaLabel` wins when both are set. `required`
 * adds a decorative `*` unless `requiredIndicator` is false. Alignment with
 * the combobox label is measured in the story *Labels in a Form (DE)*.
 */
@Component({
  standalone: true,
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-select
      placeholder="Bitte wählen"
      [label]="label()"
      [ariaLabel]="ariaLabel()"
      [required]="required()"
      [requiredIndicator]="requiredIndicator()"
      [disabled]="disabled()"
      [searchable]="searchable()"
      [searchAriaLabel]="searchAriaLabel()"
      [options]="options"
    />
  `,
})
class Host {
  readonly label = signal('');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly required = signal(false);
  readonly requiredIndicator = signal(true);
  readonly disabled = signal(false);
  readonly searchable = signal(false);
  readonly searchAriaLabel = signal('');
  readonly options: SelectOption[] = [
    { value: 'base', label: 'Basisszenario 2027' },
    { value: 'infra', label: 'Kostensenkung IT-Infrastruktur' },
  ];
}

describe('lc-select — label (3.52, request 073)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const wrapper = () => root().querySelector('.lc-select-wrapper') as HTMLElement;
  const trigger = () => root().querySelector('[role="combobox"]') as HTMLElement;
  const labelEl = () => root().querySelector<HTMLLabelElement>('label.lc-select__label');
  const select = () => fixture.debugElement.query((d) => d.componentInstance instanceof SelectComponent).componentInstance as SelectComponent;
  const render = (set: (h: Host) => void = () => undefined) => {
    set(fixture.componentInstance);
    fixture.detectChanges();
  };
  const open = () => {
    trigger().click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
  });

  afterEach(() => {
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  describe('AC-16: without a label, as 3.51', () => {
    it('renders no label element; the trigger is the wrapper\'s first element, named by aria-label only', () => {
      render((h) => h.ariaLabel.set('Szenario'));
      expect(labelEl()).toBeNull();
      expect(wrapper().firstElementChild).toBe(trigger());
      expect(trigger().getAttribute('aria-label')).toBe('Szenario');
      expect(trigger().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('without label and ariaLabel the trigger has neither attribute', () => {
      render();
      expect(trigger().hasAttribute('aria-label')).toBe(false);
      expect(trigger().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('required without a label adds no * (aria-required as before)', () => {
      render((h) => h.required.set(true));
      expect(root().querySelector('.lc-select__required')).toBeNull();
      expect(trigger().getAttribute('aria-required')).toBe('true');
    });
  });

  describe('AC-14, AC-15: the visible label names the trigger', () => {
    it('renders <label id> before the trigger, without for; the trigger is aria-labelledby it', () => {
      render((h) => h.label.set('Simulationsszenario auswählen'));
      const label = labelEl() as HTMLLabelElement;
      expect(wrapper().firstElementChild).toBe(label);
      expect(label.nextElementSibling).toBe(trigger());
      expect(label.id).toBe(`${select().selectId}-label`);
      expect(label.hasAttribute('for')).toBe(false);
      expect(label.textContent).toBe('Simulationsszenario auswählen');
      expect(trigger().getAttribute('aria-labelledby')).toBe(label.id);
      expect(trigger().hasAttribute('aria-label')).toBe(false);
      expect(computedName(root(), trigger())).toBe('Simulationsszenario auswählen');
    });

    it('ariaLabel wins when both are set: aria-label, no aria-labelledby', () => {
      render((h) => {
        h.label.set('Szenario');
        h.ariaLabel.set('Szenario der Simulation');
      });
      expect(labelEl()).not.toBeNull();
      expect(trigger().getAttribute('aria-label')).toBe('Szenario der Simulation');
      expect(trigger().hasAttribute('aria-labelledby')).toBe(false);
      expect(computedName(root(), trigger())).toBe('Szenario der Simulation');
    });

    it('a click on the label focuses the trigger and does not open the list', () => {
      render((h) => h.label.set('Szenario'));
      (labelEl() as HTMLLabelElement).click();
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger());
      expect(select().isOpen()).toBe(false);
    });

    it('a click on the label of a disabled select does nothing', () => {
      render((h) => {
        h.label.set('Szenario');
        h.disabled.set(true);
      });
      (labelEl() as HTMLLabelElement).click();
      expect(document.activeElement).not.toBe(trigger());
    });

    it('required adds a decorative * right after the text (no space); requiredIndicator=false leaves it out', () => {
      render((h) => {
        h.label.set('Art der Änderung');
        h.required.set(true);
      });
      const star = root().querySelector('.lc-select__required') as HTMLElement;
      expect(star.parentElement).toBe(labelEl());
      expect(star.getAttribute('aria-hidden')).toBe('true');
      expect(star.textContent).toBe('*');
      expect(labelEl()?.textContent).toBe('Art der Änderung*');
      expect(trigger().getAttribute('aria-required')).toBe('true');
      expect(computedName(root(), trigger())).toBe('Art der Änderung');

      render((h) => h.requiredIndicator.set(false));
      expect(root().querySelector('.lc-select__required')).toBeNull();
      expect(trigger().getAttribute('aria-required')).toBe('true');
    });

    it('passes axe with a label and required (the label element has no for)', async () => {
      render((h) => {
        h.label.set('Art der Änderung');
        h.required.set(true);
      });
      expect(violations(await audit(root()))).toEqual([]);
    });
  });

  describe('AC-18: list and search names', () => {
    const listbox = () => document.querySelector('.cdk-overlay-container [role="listbox"]') as HTMLElement;
    const search = () => document.querySelector('.cdk-overlay-container .lc-select__search-input') as HTMLInputElement;

    it('without label: list and search names as 3.51', () => {
      render((h) => h.searchable.set(true));
      open();
      expect(listbox().hasAttribute('aria-label')).toBe(false);
      expect(search().getAttribute('aria-label')).toBe('Search options');
    });

    it('with ariaLabel only: as 3.51', () => {
      render((h) => {
        h.searchable.set(true);
        h.ariaLabel.set('Szenario');
      });
      open();
      expect(listbox().getAttribute('aria-label')).toBe('Szenario');
      expect(search().getAttribute('aria-label')).toBe('Search Szenario');
    });

    it('with label: the list and the search fallback take the label', () => {
      render((h) => {
        h.searchable.set(true);
        h.label.set('Simulationsszenario auswählen');
      });
      open();
      expect(listbox().getAttribute('aria-label')).toBe('Simulationsszenario auswählen');
      expect(search().getAttribute('aria-label')).toBe('Search Simulationsszenario auswählen');
    });

    it('ariaLabel beats the label; searchAriaLabel beats both', () => {
      render((h) => {
        h.searchable.set(true);
        h.label.set('Szenario');
        h.ariaLabel.set('Szenario der Simulation');
      });
      open();
      expect(listbox().getAttribute('aria-label')).toBe('Szenario der Simulation');
      expect(search().getAttribute('aria-label')).toBe('Search Szenario der Simulation');
      render((h) => h.searchAriaLabel.set('Szenario suchen'));
      expect(search().getAttribute('aria-label')).toBe('Szenario suchen');
    });
  });

  describe('AC-14: styles (lc-combobox__label tokens, lc-input *)', () => {
    // A leading newline, so the file's first rule is found like the others.
    const css = '\n' + compile(resolve(__dirname, 'select.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      return at < 0 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
    };

    it('the label: 14 px, weight 500, text-primary, 2 px above the 4 px wrapper gap, hyphenates', () => {
      expect(rule('.lc-select__label')).toBe(
        'font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); margin-bottom: 0.125rem; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3;',
      );
      expect(rule('.lc-select-wrapper')).toContain('gap: var(--lc-density-gap-xs, var(--spacing-1));');
    });

    it('the *: error-600 with a 4 px start margin', () => {
      expect(rule('.lc-select__required')).toBe('color: var(--color-error-600); margin-inline-start: var(--spacing-1);');
    });
  });
});
