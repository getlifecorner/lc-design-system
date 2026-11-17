import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StatTrendComponent } from './stat-trend.component';

/** Request 064 (usm-x row 23, AC-19): no header row without a label and an icon. */
describe('lc-stat-trend without a header (AC-19)', () => {
  function render(inputs: Record<string, unknown>): HTMLElement {
    TestBed.configureTestingModule({
      imports: [StatTrendComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(StatTrendComponent);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const elementChildren = (el: HTMLElement) =>
    [...(el.querySelector('.lc-stat-trend') as HTMLElement).children].map((c) => c.className || c.tagName.toLowerCase());

  it('renders no header element when neither label nor icon is set', () => {
    const el = render({ value: '48,2 Mio. €', change: '+3,1 %', sparklineData: [1, 2, 3] });
    expect(el.querySelector('.lc-stat-trend__header')).toBeNull();
    expect(elementChildren(el)).toEqual(['lc-stat-trend__row', 'lc-sparkline']);
    expect((el.textContent ?? '').replace(/\s+/g, ' ').trim()).toMatch(/^48,2 Mio\. € ↑ \+3,1 % Sparkline/);
  });

  it.each([
    [{ label: 'Kosten' }, ['lc-stat-trend__label']],
    [{ icon: 'wallet' }, ['lc-stat-trend__header-icon']],
    [{ label: 'Kosten', icon: 'wallet' }, ['lc-stat-trend__label', 'lc-stat-trend__header-icon']],
  ])('keeps the header with %j', (inputs, parts) => {
    const el = render({ value: '1', ...inputs });
    const header = el.querySelector('.lc-stat-trend__header') as HTMLElement;
    expect([...header.children].map((c) => [...c.classList].find((k) => k.startsWith('lc-stat-trend__')))).toEqual(parts);
    // S1 (request 031): one space, the header's next sibling and the row's previous one.
    const row = el.querySelector('.lc-stat-trend__row') as HTMLElement;
    expect((header.nextSibling as Text).data).toBe(' ');
    expect(row.previousSibling).toBe(header.nextSibling);
  });
});
