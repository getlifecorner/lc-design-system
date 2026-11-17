import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { NumberInputComponent } from './number-input.component';

/**
 * 3.42 (request 062 AC-13, usm-x row 2): the decrement button rendered
 * `<lc-icon name="minus">` but registered only `ICON_PLUS`, so an app that
 * serves no `/tabler-icons/` saw the placeholder. Both glyphs are registered now.
 */
describe('lc-number-input minus glyph (3.42, request 062)', () => {
  it('renders both stepper glyphs with no request and no warning, even under unregistered: placeholder', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [NumberInputComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideLcIcons([], { unregistered: 'placeholder' }),
      ],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const decrement = el.querySelector('.number-input__button--decrement svg') as SVGElement;
    const increment = el.querySelector('.number-input__button--increment svg') as SVGElement;
    expect(decrement.querySelector('path')?.getAttribute('d')).toBe('M19.5 12h-15');
    expect(decrement.getAttribute('stroke-width')).toBe(increment.getAttribute('stroke-width'));
    expect(increment.querySelector('path')?.getAttribute('d')).toBe('M12 4.5v15m7.5-7.5h-15');
    http.expectNone(() => true);
    http.verify();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
