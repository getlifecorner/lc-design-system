import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { reflectComponentType } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { EmptyStateComponent } from './empty-state.component';
import { IconComponent } from '../icon/icon.component';

/** Request 020, rows 3 and 4: `iconTone` (AC-7) and `messageSize` (AC-9). */
describe('EmptyStateComponent — iconTone and messageSize (020)', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let el: HTMLElement;

  const root = () => el.querySelector('.empty-state') as HTMLElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('adds two optional inputs, documented with @default', () => {
    const names = reflectComponentType(EmptyStateComponent)?.inputs.map((i) => i.propName) ?? [];
    expect(names).toEqual(expect.arrayContaining(['iconTone', 'messageSize']));
    expect(fixture.componentInstance.iconTone()).toBe('neutral');
    expect(fixture.componentInstance.messageSize()).toBe('sm');
    const source = readFileSync(resolve(__dirname, 'empty-state.component.ts'), 'utf-8');
    expect(source).toMatch(/@default 'neutral'\s*\*\/\s*readonly iconTone = input<EmptyStateIconTone>\('neutral'\);/);
    expect(source).toMatch(/@default 'sm'\s*\*\/\s*readonly messageSize = input<EmptyStateMessageSize>\('sm'\);/);
  });

  it('renders exactly as before by default: no new class, the bare xl icon a direct child', () => {
    set({ icon: 'user-x', heading: 'Noch nichts da', message: 'Hier erscheint bald etwas.' });
    expect(root().className).toBe('empty-state empty-state--md');
    const icon = root().querySelector(':scope > lc-icon');
    expect(icon).toBeTruthy();
    expect(root().querySelector('.empty-state__icon')).toBeNull();
    const instance = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
    expect(instance.size()).toBe('xl');
    expect(instance.color()).toBe('var(--color-text-tertiary)');
  });

  it('AC-7: the primary tone puts a decorative md icon into an aria-hidden circle, without inline colour', () => {
    set({ icon: 'user-x', iconTone: 'primary' });
    expect(root().classList).toContain('empty-state--tone-primary');
    const circle = root().querySelector(':scope > .empty-state__icon.empty-state__icon--primary') as HTMLElement;
    expect(circle).toBeTruthy();
    expect(circle.tagName).toBe('SPAN');
    expect(circle.getAttribute('aria-hidden')).toBe('true');
    expect(circle.hasAttribute('style')).toBe(false);
    const instance = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
    expect(instance.size()).toBe('md');
    expect(instance.decorative()).toBe(true);
    // No `color` input: the icon's default `currentColor`, i.e. the circle's ink from CSS.
    expect(instance.color()).toBe('currentColor');
    expect(root().querySelector(':scope > lc-icon')).toBeNull();
  });

  it('renders no circle without an icon, and nothing focusable', () => {
    set({ iconTone: 'primary', messageSize: 'md', heading: 'Keine Rolle' });
    expect(root().querySelector('.empty-state__icon')).toBeNull();
    expect(root().querySelector('lc-icon')).toBeNull();
    expect(el.querySelectorAll('[tabindex]').length).toBe(0);
    expect(root().getAttribute('role')).toBe('status');
  });

  it('AC-9: messageSize="md" adds its modifier, independent of size', () => {
    set({ messageSize: 'md', size: 'lg', message: 'Ihrem Konto ist noch keine Rolle zugeordnet.' });
    expect(root().className).toBe('empty-state empty-state--lg empty-state--message-md');
  });

  describe('styles', () => {
    const css = compile(resolve(__dirname, 'empty-state.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
    };

    it('AC-7: a 48 px circle from tokens only', () => {
      const circle = rule('.empty-state__icon--primary');
      for (const d of ['width: 3rem', 'height: 3rem', 'border-radius: var(--border-radius-full)', 'background-color: var(--color-primary-100)', 'color: var(--color-primary-700)']) {
        expect(circle).toContain(d);
      }
      expect(circle).not.toMatch(/#[0-9a-f]{3,6}|rgb/i);
    });

    it('AC-9: the state-page scale — 16/24 message, 20 px heading, 16 px under the icon, 24 px before the action', () => {
      expect(rule('.empty-state--message-md')).toContain('gap: var(--spacing-2)');
      expect(css).toMatch(/\.empty-state--message-md > lc-icon,\s*\.empty-state--message-md > \.empty-state__icon \{\s*margin-bottom: var\(--spacing-2\);/);
      const message = rule('.empty-state--message-md .empty-state__message');
      for (const d of ['max-width: 32rem', 'font-size: var(--font-size-base)', 'line-height: var(--line-height-normal)', 'overflow-wrap: break-word']) {
        expect(message).toContain(d);
      }
      expect(rule('.empty-state--message-md .empty-state__heading')).toContain('font-size: var(--font-size-xl)');
      expect(css).toMatch(
        /\.empty-state--message-md \.empty-state__message:not\(:last-child\),\s*\.empty-state--message-md \.empty-state__heading:not\(:last-child\):not\(:has\(\+ \.empty-state__message\)\) \{\s*margin-bottom: var\(--spacing-4\);/,
      );
    });

    it('keeps the 3.14 message size for the default (14 px)', () => {
      expect(rule('.empty-state__message')).toContain('font-size: 0.875rem');
    });
  });
});
