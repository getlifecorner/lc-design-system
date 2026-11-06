import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HeaderComponent } from './header.component';

/**
 * 3.34 (request 054, monatsstand row 2, AC-8 to AC-10): `focusContext()`
 * focuses the context button after the next render and does nothing while
 * there is none. jsdom has no media queries: that the button is hidden up to
 * 640 px with `inline` (and `focus()` then does nothing) is measured in the
 * story.
 */
describe('HeaderComponent — focusContext() (3.34, request 054)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;
  let outside: HTMLButtonElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  }

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const contextButton = () => el.querySelector('.lc-header__context-info') as HTMLButtonElement | null;
  const GERMAN = { contextLabel: 'Monatsstand', contextAriaLabel: 'Monatsstand wählen' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
    outside = document.createElement('button');
    outside.textContent = 'Übernehmen';
    document.body.appendChild(outside);
    outside.focus();
  });

  afterEach(() => {
    outside.remove();
    fixture.destroy();
  });

  it.each(['inline', 'below'] as const)('AC-8: contextPlacement %s — focuses the context button after the next render', async (placement) => {
    set({ ...GERMAN, contextPlacement: placement, contextName: 'September 2026 · Fassung 1' });
    await render();
    fixture.componentInstance.focusContext();
    expect(document.activeElement).toBe(outside); // not synchronous: after the render
    await render();
    expect(document.activeElement).toBe(contextButton());
    expect(contextButton()?.getAttribute('aria-label')).toBe('Monatsstand wählen, Monatsstand September 2026 · Fassung 1');
  });

  it('AC-9: called right after contextName changed, the name already holds the new contextName', async () => {
    set({ ...GERMAN, contextPlacement: 'below', contextName: 'September 2026 · Fassung 1' });
    await render();
    set({ contextName: 'August 2026 · Fassung 2' });
    fixture.componentInstance.focusContext();
    await render();
    expect(document.activeElement).toBe(contextButton());
    expect(document.activeElement?.getAttribute('aria-label')).toContain('August 2026 · Fassung 2');
    expect(document.activeElement?.textContent).toContain('August 2026 · Fassung 2');
  });

  it('AC-9: a button that the same render creates (contextName set just before) gets the focus', async () => {
    set(GERMAN);
    await render();
    expect(contextButton()).toBeNull();
    set({ contextName: 'Juli 2026 · Fassung 1' });
    fixture.componentInstance.focusContext();
    await render();
    expect(document.activeElement).toBe(contextButton());
  });

  it('AC-8: without contextName it does nothing and does not throw', async () => {
    set({ ...GERMAN, contextPlacement: 'below' });
    await render();
    expect(() => fixture.componentInstance.focusContext()).not.toThrow();
    await render();
    expect(contextButton()).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('AC-8: destroyed before the render, nothing happens and nothing throws', async () => {
    set({ ...GERMAN, contextName: 'September 2026 · Fassung 1' });
    await render();
    fixture.componentInstance.focusContext();
    fixture.destroy();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
  });

  it('a second call before the render replaces the first (one focus)', async () => {
    set({ ...GERMAN, contextName: 'September 2026 · Fassung 1' });
    await render();
    const focus = jest.spyOn(contextButton() as HTMLButtonElement, 'focus');
    fixture.componentInstance.focusContext();
    fixture.componentInstance.focusContext();
    await render();
    expect(focus).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(contextButton());
  });

  it('AC-10: without the call nothing changes — the button has exactly its 3.33 attributes and the focus stays', async () => {
    set({ ...GERMAN, contextPlacement: 'below', contextName: 'September 2026 · Fassung 1' });
    await render();
    expect(contextButton()?.getAttributeNames().sort()).toEqual(['aria-label', 'class', 'type']);
    expect(document.activeElement).toBe(outside);
  });
});
