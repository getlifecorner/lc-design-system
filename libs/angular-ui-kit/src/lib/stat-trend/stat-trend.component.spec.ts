import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { StatTrendComponent } from './stat-trend.component';
import { IconComponent } from '../icon/icon.component';

describe('StatTrendComponent', () => {
  let component: StatTrendComponent;
  let fixture: ComponentFixture<StatTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatTrendComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();

    fixture = TestBed.createComponent(StatTrendComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('value', '1,234');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the value', () => {
    fixture.componentRef.setInput('value', '$42,000');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__value');
    expect(el.textContent).toContain('$42,000');
  });

  it('should display the label', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__label');
    expect(el.textContent).toContain('Revenue');
  });

  it('should display the change text', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('change', '+12%');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__change');
    expect(el.textContent).toContain('+12%');
  });

  it('should auto-detect up direction from + prefix', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('change', '+5%');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__change');
    expect(el.classList.contains('lc-stat-trend__change--up')).toBeTruthy();
  });

  it('should auto-detect down direction from - prefix', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('change', '-3%');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__change');
    expect(el.classList.contains('lc-stat-trend__change--down')).toBeTruthy();
  });

  it('should use explicit direction over auto-detect', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('change', '+5%');
    fixture.componentRef.setInput('direction', 'down');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-stat-trend__change');
    expect(el.classList.contains('lc-stat-trend__change--down')).toBeTruthy();
  });

  it('should render sparkline when data is provided', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('sparklineData', [1, 2, 3, 4, 5]);
    fixture.detectChanges();
    const sparkline = fixture.nativeElement.querySelector('lc-sparkline');
    expect(sparkline).toBeTruthy();
  });

  it('should not render sparkline when data has less than 2 points', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('sparklineData', [5]);
    fixture.detectChanges();
    const sparkline = fixture.nativeElement.querySelector('lc-sparkline');
    expect(sparkline).toBeFalsy();
  });

  it('renders the header icon as decorative', () => {
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('icon', 'chart-bar');
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
    expect(icon.decorative()).toBe(true);
  });

  /**
   * Request 031 (gap file cockpit-2026-11-01 row 2, WCAG 2.5.3): one space
   * between header and row (S1), value and pill (S2), row and sparkline (S3),
   * so text-reading tools get "Label Value" instead of "LabelValue".
   */
  describe('separators (031)', () => {
    const DE = { up: 'gestiegen', negative: 'ungünstig' };

    function render(inputs: Record<string, unknown>): HTMLElement {
      for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    const root = (el: HTMLElement) => el.querySelector('.lc-stat-trend') as HTMLElement;
    const textNodes = (parent: Node) => [...parent.childNodes].filter((n): n is Text => n.nodeType === Node.TEXT_NODE);

    // AC-1
    it('separates label and value with one space between header and row (S1)', () => {
      const el = render({ label: 'Gesamtkosten Plan 2026', value: '571.000,00 €' });
      expect(text(el)).toBe('Gesamtkosten Plan 2026 571.000,00 €');
      const header = el.querySelector('.lc-stat-trend__header') as HTMLElement;
      const row = el.querySelector('.lc-stat-trend__row') as HTMLElement;
      expect(header.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
      expect((header.nextSibling as Text).data).toBe(' ');
      expect(row.previousSibling).toBe(header.nextSibling);
    });

    it('keeps S1 without a label: the text is the value alone', () => {
      const el = render({ value: '571.000,00 €' });
      expect(text(el)).toBe('571.000,00 €');
      expect(textNodes(root(el)).map((n) => n.data)).toEqual([' ']);
    });

    // AC-2
    it('separates value and change with one space before the pill (S2)', () => {
      const el = render({ label: 'Gesamtkosten Plan 2026', value: '571.000,00 €', change: '+3,1 %' });
      expect(text(el)).toBe('Gesamtkosten Plan 2026 571.000,00 € ↑ +3,1 %');
      const value = el.querySelector('.lc-stat-trend__value') as HTMLElement;
      expect((value.nextSibling as Text).data).toBe(' ');
      expect(value.nextSibling?.nextSibling).toBe(el.querySelector('.lc-stat-trend__change'));
    });

    it('with sentiment, the hidden words still follow the change without a space', () => {
      const el = render({ label: 'Gesamtkosten Plan 2026', value: '571.000,00 €', change: '+3,1 %', sentiment: 'negative', labels: DE });
      expect(text(el)).toBe('Gesamtkosten Plan 2026 571.000,00 € ↑ +3,1 %, gestiegen, ungünstig');
    });

    it('separates the row from the sparkline with one space (S3)', () => {
      const el = render({ label: 'Kosten', value: '48,2 Mio. €', change: '+3,1 %', sentiment: 'negative', labels: DE, sparklineData: [1, 2, 3] });
      const sparkline = el.querySelector('lc-sparkline') as HTMLElement;
      expect((sparkline.previousSibling as Text).data).toBe(' ');
      expect(text(el)).toMatch(/^Kosten 48,2 Mio\. € ↑ \+3,1 %, gestiegen, ungünstig Sparkline: /);
    });

    // AC-5, AC-8: no new element, role or focus stop; the three separators are bare text nodes.
    it('adds text nodes only: same element children, no role or tabindex but the sparkline image', () => {
      const el = render({ label: 'Kosten', value: '48,2 Mio. €', change: '+3,1 %', icon: 'wallet', sparklineData: [1, 2, 3] });
      expect([...root(el).children].map((c) => c.className || c.tagName.toLowerCase())).toEqual([
        'lc-stat-trend__header',
        'lc-stat-trend__row',
        'lc-sparkline',
      ]);
      expect(textNodes(root(el)).map((n) => n.data)).toEqual([' ', ' ']);
      const row = el.querySelector('.lc-stat-trend__row') as HTMLElement;
      expect(textNodes(row).map((n) => n.data)).toEqual([' ']);
      expect(textNodes(el.querySelector('.lc-stat-trend__header') as HTMLElement)).toEqual([]);
      const roles = [...el.querySelectorAll('[role], [tabindex]')].map((n) => `${n.tagName.toLowerCase()}[role=${n.getAttribute('role')}]`);
      expect(roles).toEqual(['svg[role=img]']);
    });

    // Unchanged default rendering: the same elements and classes as 3.22.0, one separator.
    it('renders the default tile as before apart from S1', () => {
      const el = render({ value: '1,234' });
      expect([...root(el).children].map((c) => c.className)).toEqual(['lc-stat-trend__header', 'lc-stat-trend__row']);
      expect((el.querySelector('.lc-stat-trend__header') as HTMLElement).children).toHaveLength(0);
      const row = el.querySelector('.lc-stat-trend__row') as HTMLElement;
      expect([...row.children].map((c) => c.className)).toEqual(['lc-stat-trend__value']);
      expect(textNodes(row)).toEqual([]);
      expect(el.querySelector('.lc-stat-trend__value')?.textContent).toBe('1,234');
    });
  });
});
