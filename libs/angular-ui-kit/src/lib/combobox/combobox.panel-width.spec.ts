import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { resolve } from 'path';
import { compile } from 'sass';
import { ComboboxComponent, type ComboboxOption } from './combobox.component';

/**
 * 3.33 (request 052): the list is at least as wide as the field (049-n2,
 * AC-23, D-6), 4 px from the field below and above (047-n1, AC-19), and a
 * host `lang` change shows while it is open (049-n3, AC-24). jsdom has no
 * layout: widths and gaps are measured in the stories.
 */
@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [attr.lang]="lang()"><lc-combobox [options]="options" label="Gilt ab" /></div>`,
})
class Host {
  readonly lang = signal<string | null>('de');
  readonly options: ComboboxOption[] = [
    { value: '2026-07', label: 'Juli 2026' },
    { value: '2026-08', label: 'August 2026' },
  ];
}

const dropdown = (): HTMLElement | null => document.querySelector('.cdk-overlay-container .lc-combobox__dropdown');

describe('lc-combobox — list width, gap and live language (3.33, request 052)', () => {
  let fixture: ComponentFixture<Host>;
  const input = () => (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  const frame = () => (fixture.nativeElement as HTMLElement).querySelector('.lc-combobox__input-wrapper') as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
  });

  const open = () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  };

  it('D-6: the open list carries the field width (read at opening) as a private custom property', () => {
    jest.spyOn(frame(), 'getBoundingClientRect').mockReturnValue({ width: 328 } as DOMRect);
    open();
    expect(dropdown()?.style.getPropertyValue('--_lc-combobox-field-width')).toBe('328px');
    expect(dropdown()?.getAttribute('style')?.trim()).toBe('--_lc-combobox-field-width: 328px;');
  });

  it('D-6: the pane no longer gets the field width (matchWidth off), the CDK default positions with a 4 px offset', () => {
    const overlay = fixture.debugElement.queryAllNodes(By.directive(CdkConnectedOverlay))[0].injector.get(CdkConnectedOverlay);
    expect(overlay.width).toBeFalsy();
    expect(overlay.positions).toEqual([
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
    ]);
    expect(overlay.push).toBeFalsy();
  });

  describe('the rules (compiled CSS)', () => {
    const css = compile(resolve(__dirname, 'combobox.component.scss')).css;
    const at = css.indexOf('\n.lc-combobox__dropdown {');
    const body = css.slice(at, css.indexOf('}', at));

    it('AC-23: at least the field (80 px floor), fills the pane, at most the viewport minus 16 px', () => {
      expect(body).toMatch(/flex: 1 1 auto;\s*min-width: max\(80px, var\(--_lc-combobox-field-width, 0px\)\);\s*max-width: calc\(100vw - 2 \* var\(--spacing-2\)\);/);
    });

    it('AC-19: no margin inside the pane any more (the gap is the offset)', () => {
      expect(body).not.toMatch(/margin/);
      expect(body).toMatch(/max-height: 240px;\s*overflow-y: auto;/);
    });
  });

  it('AC-24: a host lang change while open updates the list lang without reopening', async () => {
    open();
    const opened = dropdown();
    expect(opened?.getAttribute('lang')).toBe('de');
    fixture.componentInstance.lang.set('fr');
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    expect(dropdown()).toBe(opened);
    expect(dropdown()?.getAttribute('lang')).toBe('fr');
  });
});
