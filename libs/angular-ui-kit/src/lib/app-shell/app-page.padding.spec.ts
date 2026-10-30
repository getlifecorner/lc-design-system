import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { AppPageComponent } from './app-page.component';

/** Request 020, rows 1 and 2: `paddingX`, `paddingTop` and the documented hooks (AC-1, AC-3, AC-4). */
describe('AppPageComponent — paddingX and paddingTop (020)', () => {
  let fixture: ComponentFixture<AppPageComponent>;
  let el: HTMLElement;

  const page = () => el.querySelector('.lc-app-page') as HTMLElement;
  const css = compile(resolve(__dirname, 'app-page.component.scss')).css;
  const source = readFileSync(resolve(__dirname, 'app-page.component.ts'), 'utf-8');

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppPageComponent] }).compileComponents();
    fixture = TestBed.createComponent(AppPageComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('adds two optional inputs, `default` by default, documented with @default', () => {
    const names = reflectComponentType(AppPageComponent)?.inputs.map((i) => i.propName) ?? [];
    expect(names).toEqual(expect.arrayContaining(['paddingX', 'paddingTop']));
    expect(source).toMatch(/@default 'default'\s*\*\/\s*readonly paddingX = input<AppPagePaddingX>\('default'\);/);
    expect(source).toMatch(/@default 'default'\s*\*\/\s*readonly paddingTop = input<AppPagePaddingTop>\('default'\);/);
  });

  it('AC-3: renders exactly as before by default (no modifier class)', () => {
    expect(page().className).toBe('lc-app-page');
  });

  it('AC-3: keeps the default steps, the hook first in every block', () => {
    // The base rule and the breakpoint blocks, before the 3.15 modifiers.
    const defaults = css.slice(0, css.indexOf('.lc-app-page.lc-app-page--pad-'));
    const steps = (name: string, hook: string) =>
      [...defaults.matchAll(new RegExp(`${name}: var\\(${hook}, (\\d+)px\\)`, 'g'))].map((m) => Number(m[1]));
    expect(steps('--_pad-x', '--lc-app-page-padding-x')).toEqual([24, 32, 48, 56, 72, 96]);
    expect(steps('--_pad-top', '--lc-app-page-padding-top')).toEqual([24, 32, 48, 56, 72, 112]);
  });

  it.each([
    [{ paddingX: 'header' }, 'lc-app-page lc-app-page--pad-x-header'],
    [{ paddingTop: 'none' }, 'lc-app-page lc-app-page--pad-top-none'],
    [{ paddingTop: 'sm' }, 'lc-app-page lc-app-page--pad-top-sm'],
    [{ paddingX: 'header', paddingTop: 'md' }, 'lc-app-page lc-app-page--pad-x-header lc-app-page--pad-top-md'],
  ])('%j sets %s', (inputs, classes) => {
    set(inputs);
    expect([...page().classList].sort().join(' ')).toBe(classes.split(' ').sort().join(' '));
  });

  it('AC-2: paddingX="header" uses lc-header\'s padding (same vars, same 768 px step), behind the hook', () => {
    const header = compile(resolve(__dirname, '../header/header.component.scss')).css;
    const wide = header.match(/--lc-header-padding-x: (var\(--lc-density-padding-lg, var\(--spacing-6\)\));/)?.[1];
    const narrow = header.match(/@media \(max-width: 768px\) \{\s*\.lc-header \{\s*--lc-header-padding-x: (var\([^;]+\));/)?.[1] ?? '';
    expect(wide).toBe('var(--lc-density-padding-lg, var(--spacing-6))');
    expect(narrow).toBe('var(--lc-density-padding-md, var(--spacing-4))');
    expect(css).toContain(`\n.lc-app-page.lc-app-page--pad-x-header {\n  --_pad-x: var(--lc-app-page-padding-x, ${wide});`);
    expect(css).toMatch(
      new RegExp(`@media \\(max-width: 768px\\) \\{\\s*\\.lc-app-page\\.lc-app-page--pad-x-header \\{\\s*--_pad-x: var\\(--lc-app-page-padding-x, ${narrow.replace(/[()]/g, '\\$&')}\\);`),
    );
  });

  it('AC-4: paddingTop none / sm / md are 0px / 8 px / 16 px at every width, behind the hook', () => {
    expect(css).toContain('.lc-app-page.lc-app-page--pad-top-none {\n  --_pad-top: var(--lc-app-page-padding-top, 0px);');
    expect(css).toContain('.lc-app-page.lc-app-page--pad-top-sm {\n  --_pad-top: var(--lc-app-page-padding-top, var(--spacing-2));');
    expect(css).toContain('.lc-app-page.lc-app-page--pad-top-md {\n  --_pad-top: var(--lc-app-page-padding-top, var(--spacing-4));');
    // Not inside a media query: the modifiers sit after the last breakpoint block.
    const tail = css.slice(css.lastIndexOf('@media (min-width: 1920px)'));
    expect(tail.indexOf('.lc-app-page.lc-app-page--pad-top-md')).toBeGreaterThan(0);
  });

  it('AC-1: documents the four hooks, their defaults and the per-breakpoint route', () => {
    const doc = source.match(/\/\*\*([^]*?)\*\/\s*@Component/)?.[1] ?? '';
    for (const hook of ['--lc-app-page-padding-x', '--lc-app-page-padding-top', '--lc-app-page-gap', '--lc-app-page-aside-width']) {
      expect(doc).toContain(`\`${hook}\``);
    }
    expect(doc).toContain('@media (min-width: 1024px) { lc-app-page { --lc-app-page-padding-x: 32px } }');
  });
});
