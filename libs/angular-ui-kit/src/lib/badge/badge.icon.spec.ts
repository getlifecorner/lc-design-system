import { resolve } from 'path';
import { compile } from 'sass';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { By } from '@angular/platform-browser';
import { BadgeComponent } from './badge.component';

/** Request 064 (usm-x row 28, AC-23): `icon` input and the `--lc-badge-gap` hook. */
describe('lc-badge icon and gap (3.44)', () => {
  const css = '\n' + compile(resolve(__dirname, 'badge.component.scss')).css;
  const rules = (selector: string): string =>
    [...css.matchAll(new RegExp(`\\n${selector.replace(/[.*]/g, (c) => `\\${c}`)} \\{([^}]*)\\}`, 'g'))]
      .map((m) => m[1].trim().replace(/\s+/g, ' '))
      .join(' ');

  function render(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({
      imports: [BadgeComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(BadgeComponent);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return { fixture, span: (fixture.nativeElement as HTMLElement).querySelector('span.lc-badge') as HTMLElement };
  }

  it('defaults `icon` to undefined: no icon, no extra class, the same children', () => {
    const { fixture, span } = render({});
    expect(fixture.componentInstance.icon()).toBeUndefined();
    expect(span.className).toBe('lc-badge lc-badge--default lc-badge--md');
    expect(span.children).toHaveLength(0);
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    expect(span.children).toHaveLength(1);
  });

  it('renders a decorative lc-icon after the dot and adds lc-badge--has-icon', () => {
    const { fixture, span } = render({ dot: true, icon: 'pencil' });
    expect([...span.children].map((c) => c.className.split(' ')[0])).toEqual(['lc-badge__dot', 'lc-badge__icon']);
    expect(span.classList).toContain('lc-badge--has-icon');
    const icon = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
    expect(icon.decorative()).toBe(true);
    expect(icon.name()).toBe('pencil');
  });

  it('reads --lc-badge-gap (never declared): 0 by default, 0.4em with an icon, where the dot margin gives way', () => {
    expect(rules('.lc-badge')).toContain('gap: var(--lc-badge-gap, 0);');
    expect(rules('.lc-badge--has-icon')).toBe('gap: var(--lc-badge-gap, 0.4em);');
    expect(rules('.lc-badge--has-icon .lc-badge__dot')).toBe('margin-right: 0;');
    expect(css).not.toMatch(/--lc-badge-gap:/);
  });

  it('draws the icon 1em square and keeps it on the first line with `wrap`', () => {
    expect(rules('.lc-badge__icon')).toBe('--lc-icon-size: 1em; flex-shrink: 0;');
    expect(rules('.lc-badge--wrap .lc-badge__icon')).toBe('align-self: flex-start; margin-top: 0.125em;');
  });

  it('starts the wrapped label after the icon; without an icon the lines stay centred', () => {
    expect(rules('.lc-badge--wrap.lc-badge--has-icon')).toBe('text-align: start;');
    expect(rules('.lc-badge--wrap')).toContain('text-align: center;');
  });
});
