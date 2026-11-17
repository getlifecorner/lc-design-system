import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchInputComponent } from './search-input.component';

/** Request 064 (usm-x row 21, AC-16): combobox attributes on the inner input. */
describe('lc-search-input combobox attributes (AC-16)', () => {
  const ATTRS = ['role', 'aria-expanded', 'aria-controls', 'aria-activedescendant', 'aria-autocomplete', 'aria-haspopup'];

  function create(inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      imports: [SearchInputComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(SearchInputComponent);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, field: host.querySelector('input') as HTMLInputElement };
  }

  it('renders none of the attributes when unset (default DOM unchanged)', () => {
    const { host, field } = create();
    for (const a of ATTRS) {
      expect(field.hasAttribute(a)).toBe(false);
      expect(host.hasAttribute(a)).toBe(false);
    }
  });

  it('forwards role, aria-expanded, aria-controls, aria-activedescendant, aria-autocomplete and aria-haspopup to the input only', () => {
    const { host, field } = create({
      inputRole: 'combobox',
      ariaExpanded: true,
      ariaControls: 'palette-list',
      ariaActiveDescendant: 'palette-opt-2',
      ariaAutocomplete: 'list',
      ariaHasPopup: 'listbox',
    });
    expect(field.getAttribute('role')).toBe('combobox');
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-controls')).toBe('palette-list');
    expect(field.getAttribute('aria-activedescendant')).toBe('palette-opt-2');
    expect(field.getAttribute('aria-autocomplete')).toBe('list');
    expect(field.getAttribute('aria-haspopup')).toBe('listbox');
    for (const a of ATTRS) expect(host.hasAttribute(a)).toBe(false);
  });

  it('writes aria-expanded="false" for false and removes the descendant when it is cleared', () => {
    const { fixture, field } = create({ inputRole: 'combobox', ariaExpanded: false, ariaActiveDescendant: 'o1' });
    expect(field.getAttribute('aria-expanded')).toBe('false');
    fixture.componentRef.setInput('ariaActiveDescendant', '');
    fixture.componentRef.setInput('ariaExpanded', null);
    fixture.detectChanges();
    expect(field.hasAttribute('aria-activedescendant')).toBe(false);
    expect(field.hasAttribute('aria-expanded')).toBe(false);
  });
});
