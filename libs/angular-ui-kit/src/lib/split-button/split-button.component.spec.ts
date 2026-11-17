import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { compile } from 'sass';
import type { MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { SplitButtonComponent, SplitButtonSize, SplitButtonVariant } from './split-button.component';
import { audit, violations } from '../../testing/axe-jsdom';

const ITEMS: MenuItem[] = [
  { id: 'save-as', label: 'Speichern unter …' },
  { id: 'template', label: 'Als Vorlage speichern', disabled: true },
  { id: 'discard', label: 'Verwerfen', variant: 'danger' },
];

@Component({
  standalone: true,
  imports: [SplitButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-split-button
      [items]="items()"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [menuAriaLabel]="label()"
      (clicked)="faces = faces + 1"
      (itemClick)="picked.push($event.id)"
    >
      <span slot="icon-before" class="face-icon">▣</span>
      Speichern
    </lc-split-button>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(ITEMS);
  readonly variant = signal<SplitButtonVariant>('outline');
  readonly size = signal<SplitButtonSize>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly label = signal('Weitere Aktionen');
  faces = 0;
  picked: string[] = [];
}

/** Request 064 (3.44, usm-x row 30, AC-25/AC-26): lc-split-button. */
describe('lc-split-button (3.44)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  const el = () => fixture.nativeElement as HTMLElement;
  /** The class list, sorted: Angular's `[class]` order is not the computed order. */
  const sorted = (e: Element) => [...e.classList].sort().join(' ');
  const face = () => el().querySelector('.lc-split-button__face button') as HTMLButtonElement;
  const caret = () => el().querySelector('.lc-split-button__caret') as HTMLButtonElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const key = (target: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  it('documents every input with @default', () => {
    const source = readFileSync(join(__dirname, 'split-button.component.ts'), 'utf8');
    for (const name of ['items', 'variant', 'size', 'disabled', 'loading', 'menuAriaLabel', 'menuPosition']) {
      expect([name, new RegExp(`@default [^\\n]+\\n\\s*\\*/\\n\\s*readonly ${name} = input`).test(source)]).toEqual([name, true]);
    }
  });

  it('renders two real buttons in a group: the face (lc-button with label and icon) and the caret', () => {
    const group = el().querySelector('[role="group"]') as HTMLElement;
    expect(sorted(group)).toBe('lc-split-button lc-split-button--md lc-split-button--outline');
    const buttons = [...group.querySelectorAll('button')];
    expect(buttons).toEqual([face(), caret()]);
    expect(face().textContent?.replace(/\s+/g, ' ').trim()).toBe('▣ Speichern');
    expect(face().querySelector('.face-icon')).not.toBeNull();
    expect(face().className).toContain('btn-outline');
    expect(sorted(caret())).toBe('btn btn-md btn-outline lc-split-button__caret');
  });

  it('gives the caret its name, aria-haspopup="menu" and aria-expanded (bound in the template)', () => {
    expect(caret().getAttribute('aria-label')).toBe('Weitere Aktionen');
    expect(caret().getAttribute('aria-haspopup')).toBe('menu');
    expect(caret().getAttribute('aria-expanded')).toBe('false');
    expect(caret().type).toBe('button');
    const template = readFileSync(join(__dirname, 'split-button.component.html'), 'utf8');
    expect(template).toContain('aria-haspopup="menu"');
    expect(template).toContain('[attr.aria-expanded]="open()"');
  });

  it('defaults the caret name to "More actions"', () => {
    const plain = TestBed.createComponent(SplitButtonComponent);
    plain.detectChanges();
    expect((plain.nativeElement as HTMLElement).querySelector('.lc-split-button__caret')?.getAttribute('aria-label')).toBe('More actions');
    expect(plain.componentInstance.variant()).toBe('outline');
    expect(plain.componentInstance.size()).toBe('md');
    expect(plain.componentInstance.menuPosition()).toBe('bottom-right');
    // No items: the caret can't open.
    expect((plain.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.lc-split-button__caret')?.disabled).toBe(true);
    plain.destroy();
  });

  it('the face emits clicked; the caret does not', () => {
    face().click();
    caret().click();
    expect(host.faces).toBe(1);
  });

  it('the caret opens the menu (aria-expanded, aria-controls, focus on the first item) and closes it again', async () => {
    caret().click();
    await settle();
    expect(caret().getAttribute('aria-expanded')).toBe('true');
    const menu = el().querySelector('[role="menu"]') as HTMLElement;
    expect(caret().getAttribute('aria-controls')).toBe(menu.id);
    expect(document.activeElement?.textContent?.trim()).toBe('Speichern unter …');
    caret().click();
    await settle();
    expect(caret().getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('[role="menu"]')).toBeNull();
  });

  it.each(['ArrowDown', 'ArrowUp'])('%s on the caret opens the menu', async (k) => {
    expect(key(caret(), k).defaultPrevented).toBe(true);
    await settle();
    expect(caret().getAttribute('aria-expanded')).toBe('true');
  });

  it('an item emits itemClick, closes the menu and returns the focus to the caret', async () => {
    caret().focus();
    caret().click();
    await settle();
    (document.activeElement as HTMLElement).click();
    await settle();
    expect(host.picked).toEqual(['save-as']);
    expect(el().querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(caret());
  });

  it('disabled: both parts natively disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(face().disabled).toBe(true);
    expect(caret().disabled).toBe(true);
  });

  it('loading: the face shows the spinner; the caret keeps focus, aria-disabled, ignores activation, no spinner', async () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(face().getAttribute('aria-busy')).toBe('true');
    expect(face().querySelector('.loading-spinner')).not.toBeNull();
    expect(caret().disabled).toBe(false);
    expect(caret().getAttribute('aria-disabled')).toBe('true');
    expect(caret().classList).toContain('btn-loading');
    expect(caret().querySelector('.loading-spinner')).toBeNull();
    caret().click();
    expect(key(caret(), 'ArrowDown').defaultPrevented).toBe(true);
    expect(key(caret(), 'Enter').defaultPrevented).toBe(true);
    await settle();
    expect(caret().getAttribute('aria-expanded')).toBe('false');
    face().click();
    expect(host.faces).toBe(0);
  });

  it.each<[SplitButtonVariant, SplitButtonSize, string]>([
    ['primary', 'sm', 'lc-split-button lc-split-button--primary lc-split-button--sm lc-split-button--filled'],
    ['secondary', 'lg', 'lc-split-button lc-split-button--secondary lc-split-button--lg lc-split-button--filled'],
  ])('%s / %s: both parts take the variant and size', (variant, size, classes) => {
    host.variant.set(variant);
    host.size.set(size);
    fixture.detectChanges();
    expect(sorted(el().querySelector('[role="group"]') as HTMLElement)).toBe(classes.split(' ').sort().join(' '));
    expect(face().classList).toContain(`btn-${variant}`);
    expect(face().classList).toContain(`btn-${size}`);
    expect(sorted(caret())).toBe(`btn lc-split-button__caret btn-${variant} btn-${size}`.split(' ').sort().join(' '));
  });

  it('passes axe, closed and open', async () => {
    expect(violations(await audit(el()))).toEqual([]);
    caret().click();
    await settle();
    expect(violations(await audit(el()))).toEqual([]);
  });

  describe('stylesheet', () => {
    const css = '\n' + compile(join(__dirname, 'split-button.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('caret at least 36 / 44 / 48 px wide, no inner corners; outline: one keyline', () => {
      expect(rule('.lc-split-button .lc-split-button__caret')).toContain('min-inline-size: 2.75rem;');
      expect(rule('.lc-split-button--sm .lc-split-button__caret')).toBe('min-inline-size: 2.25rem;');
      expect(rule('.lc-split-button--lg .lc-split-button__caret')).toBe('min-inline-size: 3rem;');
      expect(rule('.lc-split-button .lc-split-button__caret')).toContain('border-start-start-radius: 0; border-end-start-radius: 0;');
      expect(rule('.lc-split-button .lc-split-button__face > .btn')).toBe('border-start-end-radius: 0; border-end-end-radius: 0;');
      expect(rule('.lc-split-button--outline .lc-split-button__caret')).toBe('border-inline-start-width: 0;');
      expect(rule('.lc-split-button--filled')).toBe('gap: 1px;');
    });

    it('a stretching flex parent stretches the host only; the group keeps its height (review 064 r1)', () => {
      expect(rule('lc-split-button')).toBe('display: inline-flex; align-items: flex-start; max-width: 100%; vertical-align: middle;');
      expect(rule('.lc-split-button')).toBe('display: inline-flex; align-items: stretch; max-width: 100%;');
    });

    it('raises the focused part so its ring draws over the neighbour; forced colours draw both borders', () => {
      expect(rule('.lc-split-button .btn:focus-visible')).toBe('position: relative; z-index: 1;');
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-split-button \.btn \{\s*border-color: ButtonText;/);
    });
  });
});
