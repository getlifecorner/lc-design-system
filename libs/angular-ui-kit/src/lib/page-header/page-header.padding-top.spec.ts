import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { PageHeaderComponent } from './page-header.component';

/** Request 020, row 2: `paddingTop` (AC-4, AC-5, AC-6). */
describe('PageHeaderComponent — paddingTop (020)', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let host: HTMLElement;

  const css = compile(resolve(__dirname, 'page-header.component.scss')).css;
  const sorted = () => [...host.classList].sort().join(' ');

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(PageHeaderComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('title', 'Noch keine Rolle');
    fixture.detectChanges();
  });

  it('is an optional input, `default` by default, documented with @default', () => {
    expect(reflectComponentType(PageHeaderComponent)?.inputs.map((i) => i.propName)).toContain('paddingTop');
    const source = readFileSync(resolve(__dirname, 'page-header.component.ts'), 'utf-8');
    expect(source).toMatch(/@default 'default'\s*\*\/\s*paddingTop = input<PageHeaderPaddingTop>\('default'\);/);
  });

  it('AC-6: renders exactly as before by default (no modifier class)', () => {
    expect(sorted()).toBe('lc-page-header lc-page-header--size-default');
  });

  it.each(['none', 'sm', 'md'])('paddingTop="%s" adds its modifier, with any size', (value) => {
    set({ paddingTop: value, size: 'comfortable', noPaddingX: true });
    expect(sorted()).toBe(`lc-page-header lc-page-header--flush-x lc-page-header--pad-top-${value} lc-page-header--size-comfortable`);
  });

  it('AC-4: sets only the top padding to 0 / 8 / 16 px, at (0,2,0) so no size wins over it', () => {
    const rules: Record<string, string> = { none: '0', sm: 'var(--spacing-2, 0.5rem)', md: 'var(--spacing-4, 1rem)' };
    for (const [value, padding] of Object.entries(rules)) {
      expect(css).toContain(`\n.lc-page-header.lc-page-header--pad-top-${value} {\n  padding-top: ${padding};\n}`);
    }
    // The bottom keeps the size's padding: no other declaration in those rules.
    expect(css).not.toMatch(/--pad-top-[a-z]+ \{[^}]*padding-bottom/);
  });

  it('AC-6: keeps the density block padding of 3.14', () => {
    expect(css).toMatch(/(^|\n)\.lc-page-header \{[^}]*padding-block: var\(--lc-density-padding-md, 1\.5rem\);/);
    expect(css).toMatch(/\n\.lc-page-header--size-comfortable \{[^}]*--lc-density-padding-md: 2\.5rem;/);
  });
});
