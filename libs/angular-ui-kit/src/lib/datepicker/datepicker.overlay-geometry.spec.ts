import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { resolve } from 'path';
import { compile } from 'sass';
import { DatepickerComponent } from './datepicker.component';

/**
 * 3.33 (request 052, D-5): the panel's margins live in the geometry (047-n1,
 * n2, n3, AC-19 to AC-21), and a host `lang` change shows while the panel is
 * open (049-n3, AC-24). jsdom has no layout and the CDK pane lands on its last
 * fallback there (memory 051): the boxes are measured in the stories (x 10,
 * right 352 at 360 px; gap 4 below and above; 1024/1280 unchanged).
 */
@Component({
  standalone: true,
  imports: [DatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="wrapper" [attr.lang]="lang()"><lc-datepicker [locale]="locale()" /></div>`,
})
class Host {
  readonly lang = signal<string | null>('de');
  readonly locale = signal('');
}

const panel = (): HTMLElement | null => document.querySelector('.cdk-overlay-container [role="dialog"]');

describe('lc-datepicker — overlay geometry and live panel language (3.33, request 052)', () => {
  let fixture: ComponentFixture<Host>;
  let picker: DatepickerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    picker = fixture.debugElement.query(By.directive(DatepickerComponent)).componentInstance;
  });

  afterEach(() => fixture?.destroy());

  const origin = () => (fixture.nativeElement as HTMLElement).querySelector('.lc-datepicker-overlay-origin') as HTMLElement;

  describe('D-5: the origin box', () => {
    it('is one empty, hidden span in the input wrapper, after the field and icons', () => {
      const wrapper = (fixture.nativeElement as HTMLElement).querySelector('.lc-datepicker-input-wrapper') as HTMLElement;
      expect([...wrapper.children].map((c) => c.getAttribute('class')?.split(' ')[0] ?? c.tagName)).toEqual([
        'lc-datepicker',
        'lc-datepicker-icons',
        'lc-datepicker-overlay-origin',
      ]);
      expect(origin().tagName).toBe('SPAN');
      expect(origin().getAttribute('aria-hidden')).toBe('true');
      expect(origin().childNodes).toHaveLength(0);
    });

    it('is the overlay origin, with push on and no CDK viewport margin', () => {
      const node = fixture.debugElement.queryAllNodes(By.directive(CdkConnectedOverlay))[0];
      const overlay = node.injector.get(CdkConnectedOverlay);
      expect(overlay.origin).toBe(origin());
      expect(overlay.push).toBe(true);
      expect(overlay.viewportMargin).toBe(0);
    });
  });

  describe('D-5: the rules (compiled CSS)', () => {
    const css = compile(resolve(__dirname, 'datepicker.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      expect([selector, at > -1]).toEqual([selector, true]);
      return css.slice(at, css.indexOf('}', at));
    };

    it('the origin is the field 4 px shorter at top and bottom, 8 px wider on both sides, hidden', () => {
      expect(rule('.lc-datepicker-overlay-origin')).toMatch(
        /position: absolute;\s*inset: var\(--spacing-1\) calc\(-1 \* var\(--spacing-2\)\);\s*visibility: hidden;\s*pointer-events: none;/,
      );
    });

    it('the panel has an 8 px margin on all sides (was margin-top 4 px), is at most the viewport minus 16 px and scrolls', () => {
      const panelRule = rule('.lc-datepicker-calendar');
      expect(panelRule).toMatch(/margin: var\(--spacing-2\);/);
      expect(panelRule).not.toMatch(/margin-top/);
      expect(panelRule).toMatch(/max-width: calc\(100vw - 2 \* var\(--spacing-2\)\);/);
      expect(panelRule).toMatch(/max-height: calc\(100vh - 2 \* var\(--spacing-2\)\);\s*max-height: calc\(100dvh - 2 \* var\(--spacing-2\)\);\s*overflow-y: auto;/);
      expect(panelRule).toMatch(/min-width: 280px;/);
    });
  });

  describe('AC-24: a host lang change while the panel is open', () => {
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      await Promise.resolve();
      fixture.detectChanges();
    };

    it('updates the panel lang without reopening', async () => {
      picker.open();
      await settle();
      const opened = panel();
      expect(opened?.getAttribute('lang')).toBe('de');
      fixture.componentInstance.lang.set('fr');
      await settle();
      expect(panel()).toBe(opened); // the same panel, not reopened
      expect(panel()?.getAttribute('lang')).toBe('fr');
    });

    it('falls back to locale when the host loses its lang while open', async () => {
      fixture.componentInstance.locale.set('de-DE');
      picker.open();
      await settle();
      fixture.componentInstance.lang.set(null);
      await settle();
      expect(panel()?.getAttribute('lang')).toBe('de-DE');
    });

    it('reads the new lang at the next opening after a change while closed (as before)', async () => {
      picker.open();
      await settle();
      picker.close();
      await settle();
      fixture.componentInstance.lang.set('it');
      await settle();
      picker.open();
      await settle();
      expect(panel()?.getAttribute('lang')).toBe('it');
    });
  });
});
