import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { IconComponent } from './icon.component';
import { provideLcIcons } from './icon-registry';
import { ICON_HOME } from '@lifecorner/angular-ui-kit/icons';

/**
 * Request 063 (usm-x row 18, design §2/§3 G): `--lc-icon-size` on the
 * `lc-icon` element sizes its box; registered as not inherited. jsdom has no
 * layout: the rules are pinned here, the drawn 18 × 18 px is measured in the
 * *Size Hook* story.
 */
describe('lc-icon size hook --lc-icon-size (3.43, request 063)', () => {
  const css = '\n' + compile(resolve(__dirname, 'icon.component.scss')).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).replace(/\s+/g, ' ').trim();
  };

  it('registers the public hook as not inherited, with no initial value', () => {
    expect(rule('@property --lc-icon-size')).toBe('syntax: "*"; inherits: false;');
    expect(css.match(/@property/g)).toHaveLength(1);
  });

  it('the host hands the hook to its own box; each size keeps its px as the fallback', () => {
    expect(rule(':host')).toBe('display: inline-flex; align-items: center; justify-content: center; --_lc-icon-size: var(--lc-icon-size);');
    expect(rule('.icon-xs')).toBe('width: var(--_lc-icon-size, 16px); height: var(--_lc-icon-size, 16px);');
    expect(css.match(/--_lc-icon-size\s*:/g)).toHaveLength(1);
  });

  it('lc-icon writes no style and keeps the svg attributes at the size', () => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons([ICON_HOME])],
    });
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'home');
    fixture.componentRef.setInput('size', 'sm');
    (fixture.nativeElement as HTMLElement).style.setProperty('--lc-icon-size', '18px');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const svg = host.querySelector('svg');
    expect([svg?.getAttribute('width'), svg?.getAttribute('height')]).toEqual(['20px', '20px']);
    expect(host.querySelectorAll('[style]')).toHaveLength(0);
    expect(host.getAttribute('style')).toBe('--lc-icon-size: 18px;');
  });
});
