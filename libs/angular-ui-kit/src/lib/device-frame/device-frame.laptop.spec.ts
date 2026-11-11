import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { DeviceFrameComponent, type DeviceFrameDevice, type DeviceFrameSize } from './device-frame.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.40 (request 060, life-os G-SS1 extended, AC-17 to AC-19, design D-6):
 * `device="laptop"` draws a lid and a base with the host's pseudo-elements,
 * so the DOM is the phone's minus the notch. Boxes and contrast are measured
 * in the stories (build.md); this spec pins the DOM and the rules.
 */
@Component({
  standalone: true,
  imports: [DeviceFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-device-frame [device]="device()" [size]="size()" [notch]="notch()">
      <img src="/shot.png" width="1280" height="800" alt="Übersicht am Laptop" />
    </lc-device-frame>
  `,
})
class Host {
  readonly device = signal<DeviceFrameDevice>('laptop');
  readonly size = signal<DeviceFrameSize>('md');
  readonly notch = signal(false);
}

const strip = (html: string) => html.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');

describe('lc-device-frame device="laptop" (3.40, request 060)', () => {
  let fixture: ComponentFixture<Host>;
  const frame = () => (fixture.nativeElement as HTMLElement).querySelector('lc-device-frame') as HTMLElement;
  const render = (set: (h: Host) => void = () => undefined) => {
    set(fixture.componentInstance);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
  });
  afterEach(() => fixture?.destroy());

  describe('AC-17: the DOM', () => {
    it('one laptop class instead of the phone class; the screen alone holds the media', () => {
      render();
      expect(frame().className).toBe('lc-device-frame lc-device-frame--laptop lc-device-frame--md');
      expect(strip(frame().innerHTML)).toBe(
        '<div class="lc-device-frame__screen"><img src="/shot.png" width="1280" height="800" alt="Übersicht am Laptop"></div>',
      );
    });

    it('notch is phone only: no notch span and no notch class on a laptop', () => {
      render((h) => h.notch.set(true));
      expect(frame().querySelector('.lc-device-frame__notch')).toBeNull();
      expect(frame().classList).not.toContain('lc-device-frame--notch');
      // Back to the phone, the same notch input draws it.
      render((h) => h.device.set('phone'));
      expect(frame().querySelectorAll('.lc-device-frame__notch')).toHaveLength(1);
      // Sorted: a class toggled later is appended, so the order is not the binding order.
      expect([...frame().classList].sort()).toEqual(['lc-device-frame', 'lc-device-frame--md', 'lc-device-frame--notch', 'lc-device-frame--phone']);
    });

    it.each(['sm', 'md', 'lg'] as const)('size %s: one size class beside the laptop class', (size) => {
      render((h) => h.size.set(size));
      expect([...frame().classList].filter((c) => /--(sm|md|lg|phone|laptop)$/.test(c))).toEqual(['lc-device-frame--laptop', `lc-device-frame--${size}`]);
    });

    it('AC-20: not focusable, no role, no name; axe finds nothing', async () => {
      render((h) => h.notch.set(true));
      for (const el of [frame(), frame().querySelector('.lc-device-frame__screen') as HTMLElement]) {
        expect(el.hasAttribute('role')).toBe(false);
        expect(el.hasAttribute('tabindex')).toBe(false);
        expect([...el.attributes].filter((a) => a.name.startsWith('aria-'))).toEqual([]);
      }
      await fixture.whenStable();
      expect(violations(await audit(fixture.nativeElement as Element))).toEqual([]);
    });

    it('documents laptop and the phone-only notch in the JSDoc', () => {
      const source = readFileSync(resolve(__dirname, 'device-frame.component.ts'), 'utf-8');
      expect(source).toContain("export type DeviceFrameDevice = 'phone' | 'laptop';");
      expect(source).toMatch(/Phone only: ignored on `device="laptop"`\.\s*\n\s*\* @default false/);
    });
  });

  describe('AC-17, AC-18: the rules', () => {
    const css = compile(resolve(__dirname, 'device-frame.component.scss')).css;
    // The last rule with exactly this selector at the line start: `::after`
    // alone comes after the list `::before,\n::after` that shares its name.
    const rule = (selector: string) => {
      const at = css.lastIndexOf(`\n${selector} {`);
      expect([selector, at > -1]).toEqual([selector, true]);
      return css.slice(at + selector.length + 3, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
    };
    const laptop = ':host(.lc-device-frame--laptop)';
    const lengths =
      '--_lc-device-frame-overhang: var(--lc-device-frame-overhang, var(--_lc-device-frame-default-overhang)); ' +
      '--_lc-device-frame-base-height: var(--lc-device-frame-base-height, var(--_lc-device-frame-default-base-height));';

    it('per-size defaults: width 320 / 480 / 640, lid radius sm / md / lg, overhang 12 / 16 / 24, base 8 / 12 / 16', () => {
      expect(rule(laptop)).toContain(
        '--_lc-device-frame-default-width: 480px; --_lc-device-frame-default-radius: var(--border-radius-md); ' +
          '--_lc-device-frame-default-overhang: var(--spacing-4); --_lc-device-frame-default-base-height: var(--spacing-3);',
      );
      expect(rule(':host(.lc-device-frame--laptop.lc-device-frame--sm)')).toBe(
        '--_lc-device-frame-default-width: 320px; --_lc-device-frame-default-radius: var(--border-radius-sm); ' +
          '--_lc-device-frame-default-overhang: var(--spacing-3); --_lc-device-frame-default-base-height: var(--spacing-2);',
      );
      expect(rule(':host(.lc-device-frame--laptop.lc-device-frame--lg)')).toBe(
        '--_lc-device-frame-default-width: 640px; --_lc-device-frame-default-radius: var(--border-radius-lg); ' +
          '--_lc-device-frame-default-overhang: var(--spacing-6); --_lc-device-frame-default-base-height: var(--spacing-4);',
      );
    });

    it('overhang and base height are registered lengths (a bare 0 works), declared on the host and both pseudo-elements', () => {
      for (const name of ['--_lc-device-frame-overhang', '--_lc-device-frame-base-height']) {
        expect(css).toContain(`@property ${name} {\n  syntax: "<length>";\n  inherits: false;\n  initial-value: 0px;\n}`);
      }
      expect(rule(laptop)).toContain(lengths);
      const pseudo = rule(`${laptop}::before,\n${laptop}::after`);
      expect(pseudo).toContain(lengths);
      // Bezel and radius too: registered with `inherits: false`, so each box declares them.
      expect(pseudo).toContain('--_lc-device-frame-bezel: var(--lc-device-frame-bezel, var(--_lc-device-frame-default-bezel));');
      expect(pseudo).toContain('--_lc-device-frame-radius: var(--lc-device-frame-radius, var(--_lc-device-frame-default-radius));');
    });

    it('the host: padding for lid bezel, overhang and base; no frame of its own', () => {
      expect(rule(laptop)).toContain(
        'isolation: isolate; padding: var(--_lc-device-frame-bezel) calc(var(--_lc-device-frame-overhang) + var(--_lc-device-frame-bezel)) ' +
          'calc(var(--_lc-device-frame-base-height) + var(--_lc-device-frame-bezel)); border: 0; border-radius: 0; background: none; box-shadow: none;',
      );
      expect(rule(`${laptop} .lc-device-frame__screen`)).toBe('border-bottom-left-radius: 0; border-bottom-right-radius: 0;');
    });

    it('lid and base: the phone rim, bezel colour and shadow hooks; the base colour and its hinge notch', () => {
      const pseudo = rule(`${laptop}::before,\n${laptop}::after`);
      expect(pseudo).toContain(
        "content: \"\"; position: absolute; z-index: -1; box-sizing: border-box; border: 1px solid var(--lc-device-frame-rim-color, var(--color-field-border)); " +
          'box-shadow: var(--lc-device-frame-shadow, var(--elevation-2));',
      );
      expect(rule(`${laptop}::before`)).toBe(
        'inset: 0 var(--_lc-device-frame-overhang) var(--_lc-device-frame-base-height); border-bottom: 0; ' +
          'border-radius: var(--_lc-device-frame-radius) var(--_lc-device-frame-radius) 0 0; background: var(--lc-device-frame-bezel-color, #111827);',
      );
      expect(rule(`${laptop}::after`)).toBe(
        'inset: auto 0 0; block-size: var(--_lc-device-frame-base-height); ' +
          'border-radius: 0 0 var(--_lc-device-frame-base-height) var(--_lc-device-frame-base-height); ' +
          'background: radial-gradient(farthest-side at 50% 0, #1f2937 98%, transparent) 50% 0/14% 50% no-repeat, var(--lc-device-frame-base-color, #374151);',
      );
    });

    it('the public hooks are only read, never declared (an ancestor wins)', () => {
      expect(css).not.toMatch(/--lc-device-frame-[\w-]+\s*:/);
    });

    it('forced colours: lid and base get a CanvasText border, Canvas fill, no shadow', () => {
      const forced = css.slice(css.lastIndexOf('@media (forced-colors: active)'));
      expect(forced).toContain(`${laptop}::before,\n  ${laptop}::after {\n    border-color: CanvasText;\n    background: Canvas;\n    box-shadow: none;\n  }`);
    });
  });
});
