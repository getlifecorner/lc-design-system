import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent, type ButtonType } from './button.component';

/**
 * 3.17 (request 021, finance-intelligence sources page, gap row 2): `loading`
 * keeps focus. The inner button is aria-disabled instead of natively
 * disabled, and clicks (also from Enter and Space) are ignored.
 */
@Component({
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <form (submit)="onSubmit($event)" (reset)="resets = resets + 1">
      <input name="q" value="USM" />
      <lc-button
        [type]="type()"
        [loading]="loading()"
        [disabled]="disabled()"
        disabledReason="Wird gerade geladen"
        (click)="hostClicks = hostClicks + 1"
        (clicked)="clicks = clicks + 1"
      >Daten von USM laden</lc-button>
    </form>
  `,
})
class LoadingHostComponent {
  readonly type = signal<ButtonType>('button');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  clicks = 0;
  hostClicks = 0;
  submits = 0;
  resets = 0;

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submits++;
  }
}

describe('ButtonComponent loading keeps focus (3.17, request 021)', () => {
  let fixture: ComponentFixture<LoadingHostComponent>;
  let host: LoadingHostComponent;
  const button = () => (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoadingHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(LoadingHostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    (fixture.nativeElement as HTMLElement).remove();
  });

  function set(changes: { type?: ButtonType; loading?: boolean; disabled?: boolean }): void {
    if (changes.type !== undefined) host.type.set(changes.type);
    if (changes.loading !== undefined) host.loading.set(changes.loading);
    if (changes.disabled !== undefined) host.disabled.set(changes.disabled);
    fixture.detectChanges();
  }

  it('AC-14: a button without loading keeps the attributes of 3.16', () => {
    const attrs = Object.fromEntries(button().getAttributeNames().map((n) => [n, button().getAttribute(n)]));
    expect(attrs).toEqual({ type: 'button', 'aria-disabled': 'false', 'aria-busy': 'false', class: 'btn btn-primary btn-md' });
    button().click();
    expect([host.clicks, host.hostClicks]).toEqual([1, 1]);
  });

  it('AC-5: focus stays on the inner button when loading starts; aria-disabled and aria-busy, no disabled', () => {
    button().focus();
    expect(document.activeElement).toBe(button());
    set({ loading: true });
    expect(document.activeElement).toBe(button());
    expect(button().disabled).toBe(false);
    expect(button().hasAttribute('disabled')).toBe(false);
    expect(button().getAttribute('aria-disabled')).toBe('true');
    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(button().classList).toContain('btn-loading');
    expect(button().querySelector('.loading-spinner')).not.toBeNull();
    // AC-7: disabledReason still applies while loading.
    expect(button().getAttribute('title')).toBe('Wird gerade geladen');
    set({ loading: false });
    expect(document.activeElement).toBe(button());
    expect(button().classList).not.toContain('btn-loading');
    expect(button().getAttribute('aria-disabled')).toBe('false');
  });

  it('AC-6: click, Enter and Space (the click they activate) emit nothing and stop at the button', () => {
    set({ loading: true });
    button().click();
    for (const key of ['Enter', ' ']) {
      // Browsers turn Enter and Space on a button into a click; jsdom doesn't, so dispatch both.
      button().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      button().dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
      button().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    expect([host.clicks, host.hostClicks]).toEqual([0, 0]);
  });

  it('AC-6: the click is cancelled while loading', () => {
    set({ loading: true });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    button().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('AC-6: a submit button does not submit while loading, and does again afterwards', () => {
    set({ type: 'submit', loading: true });
    button().click();
    expect(host.submits).toBe(0);
    set({ loading: false });
    button().click();
    expect([host.submits, host.clicks]).toEqual([1, 1]);
  });

  it('AC-6: a reset button does not reset while loading', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'SAP';
    set({ type: 'reset', loading: true });
    button().click();
    expect([host.resets, input.value]).toEqual([0, 'SAP']);
    set({ loading: false });
    button().click();
    expect([host.resets, input.value]).toEqual([1, 'USM']);
  });

  it('AC-6: disabled keeps the native disabled, also together with loading (native wins)', () => {
    set({ disabled: true });
    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-disabled')).toBe('true');
    expect(button().getAttribute('aria-busy')).toBe('false');
    expect(button().classList).not.toContain('btn-loading');
    button().click();
    expect(host.clicks).toBe(0);
    set({ loading: true });
    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-busy')).toBe('true');
    button().click();
    expect(host.clicks).toBe(0);
  });

  it('handleClick() without an event still emits (callers of 3.16)', async () => {
    await TestBed.resetTestingModule().configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const direct = TestBed.createComponent(ButtonComponent);
    const emitted: unknown[] = [];
    direct.componentInstance.clicked.subscribe(() => emitted.push(1));
    direct.componentInstance.handleClick();
    direct.componentRef.setInput('loading', true);
    direct.detectChanges();
    direct.componentInstance.handleClick();
    expect(emitted).toEqual([1]);
  });
});

describe('ButtonComponent loading styles (3.17, request 021)', () => {
  const css = '\n' + compile(resolve(__dirname, 'button.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('AC-7: a loading button looks like a disabled one: 50 % opacity, not-allowed, pointer events kept', () => {
    const dimmed = rule('.btn:disabled, .btn.btn-loading');
    expect(dimmed).toMatch(/opacity: 0\.5;/);
    expect(dimmed).toMatch(/cursor: not-allowed;/);
    expect(dimmed).toMatch(/pointer-events: auto;/);
  });

  it('AC-7: no hover or active rule applies to a loading button', () => {
    const states = [...css.matchAll(/\n([^{}\n]*:(?:hover|active)[^{}\n]*)\{/g)].map(([, s]) => s.trim());
    expect(states.length).toBeGreaterThanOrEqual(21);
    for (const selector of states) expect(selector).toContain(':not(:disabled, .btn-loading)');
  });

  it('AC-7: the focus ring of a loading button takes the text colour, after the .btn ring', () => {
    expect(rule('.btn.btn-loading:focus-visible')).toMatch(/outline-color: var\(--color-text-primary\);/);
    expect(css.indexOf('\n.btn.btn-loading:focus-visible {')).toBeGreaterThan(css.indexOf('\n.btn:focus-visible {'));
    const inverse = rule('.btn.btn-inverse.btn-loading:focus-visible');
    expect(inverse).toMatch(/opacity: 1;/);
    expect(inverse).toMatch(/outline-color: var\(--color-neutral-white\);/);
  });

  it('forced colours: GrayText at rest, opaque with the Highlight ring while focused', () => {
    const blocks = [...css.matchAll(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
    expect(blocks).toMatch(/\.btn\.btn-loading \{\s*color: GrayText;\s*border-color: GrayText;\s*\}/);
    expect(blocks).toMatch(/\.btn\.btn-loading:focus-visible \{\s*opacity: 1;\s*outline-color: Highlight;\s*\}/);
    expect(blocks).toMatch(/\.btn\.btn-inverse\.btn-loading:focus-visible \{\s*outline-color: Highlight;\s*\}/);
  });
});
