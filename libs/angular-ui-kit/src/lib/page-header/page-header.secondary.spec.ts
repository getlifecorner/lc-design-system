import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { readFileSync } from 'fs';
import { PageHeaderComponent, PageHeaderSize } from './page-header.component';

/**
 * lc-page-header `size="secondary"` (3.9, AS-25, request 006): a 20 px title
 * with the compact rhythm, for a second title under the page's main one.
 */
describe('lc-page-header size="secondary" (AS-25)', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let host: HTMLElement;

  // jsdom applies no stylesheets: read the contract from the compiled CSS.
  const css = '\n' + compile(join(__dirname, 'page-header.component.scss')).css;
  const rule = (selector: string): string => {
    const start = css.indexOf(`\n${selector} {`);
    expect(start).toBeGreaterThan(-1);
    return css.slice(start + selector.length + 3, css.indexOf('}', start)).trim();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PageHeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Can’t reach LifeCorner right now');
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('is a member of PageHeaderSize, documented in the size input', () => {
    const size: PageHeaderSize = 'secondary';
    expect(size).toBe('secondary');
    const source = readFileSync(join(__dirname, 'page-header.component.ts'), 'utf-8');
    expect(source).toMatch(/export type PageHeaderSize = 'compact' \| 'secondary' \| 'default'/);
    expect(source).toMatch(/- `secondary` +— a second title under the main one[^]*?@default 'default'\s*\*\/\s*size = input<PageHeaderSize>\('default'\);/);
  });

  it('AC-9: sets the size modifier on the host and no type-scale class on the heading', () => {
    fixture.componentRef.setInput('size', 'secondary');
    fixture.detectChanges();
    expect(host.classList).toContain('lc-page-header--size-secondary');
    expect(host.classList).not.toContain('lc-page-header--size-default');
    expect(host.querySelector('h1')?.className).toBe('lc-page-header__title');
  });

  it.each([
    [1, 'H1'],
    [2, 'H2'],
    [3, 'H3'],
  ] as const)('AC-10: renders level %s as <%s>, with or without a subtitle', (level, tag) => {
    fixture.componentRef.setInput('size', 'secondary');
    fixture.componentRef.setInput('level', level);
    fixture.detectChanges();
    expect(host.querySelector('.lc-page-header__title')?.tagName).toBe(tag);
    expect(host.querySelector('.lc-page-header__subtitle')).toBeNull();
    fixture.componentRef.setInput('subtitle', 'We’re working on it.');
    fixture.detectChanges();
    expect(host.querySelector('.lc-page-header__title')?.tagName).toBe(tag);
    expect(host.querySelector('.lc-page-header__subtitle')?.textContent?.trim()).toBe('We’re working on it.');
  });

  it('AC-9: a 20 px title (--font-size-xl) and the compact subtitle and spacing', () => {
    expect(rule('.lc-page-header--size-secondary .lc-page-header__title')).toBe('font-size: var(--font-size-xl, 1.25rem);');
    expect(rule('.lc-page-header--size-secondary .lc-page-header__subtitle')).toBe(
      rule('.lc-page-header--size-compact .lc-page-header__subtitle'),
    );
    expect(rule('.lc-page-header--size-secondary')).toBe(rule('.lc-page-header--size-compact'));
  });

  it('AC-11: the default size and the 3.8 sizes render as before', () => {
    // A fresh header (no size set) keeps `default`.
    const plain = TestBed.createComponent(PageHeaderComponent);
    plain.componentRef.setInput('title', 'Reports');
    plain.detectChanges();
    expect((plain.nativeElement as HTMLElement).className).toBe('lc-page-header lc-page-header--size-default');
    expect(rule('.lc-page-header--size-default .lc-page-header__title')).toBe('font-size: var(--font-size-2xl, 1.5rem);');
    expect(rule('.lc-page-header--size-compact .lc-page-header__title')).toBe('font-size: var(--font-size-lg, 1.125rem);');
    expect(rule('.lc-page-header--size-compact')).toBe(
      ['--lc-density-gap-md: 0.5rem;', '--lc-density-gap-sm: 0.375rem;', '--lc-density-padding-md: 0.75rem;'].join('\n  '),
    );
  });
});
