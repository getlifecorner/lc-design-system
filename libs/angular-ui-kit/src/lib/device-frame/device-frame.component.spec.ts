import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { DeviceFrameComponent, type DeviceFrameSize } from './device-frame.component';
import { axe, audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.39 (request 059, life-os website-screenshots G-SS1, AC-1 to AC-8,
 * design D-1/D-2): a phone bezel around projected media. Boxes, ratio and
 * contrast are measured in the stories (build.md); this spec pins the DOM,
 * the semantics and the rules.
 */
@Component({
  standalone: true,
  imports: [DeviceFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (bare()) {
      <lc-device-frame><img src="/shot.png" width="360" height="780" alt="Startseite am Abend" /></lc-device-frame>
    } @else if (attr()) {
      <lc-device-frame notch size="lg"><p>Text</p></lc-device-frame>
    } @else {
      <lc-device-frame [size]="size()" [notch]="notch()" class="consumer"><img src="/shot.png" width="360" height="780" alt="Startseite am Abend" /></lc-device-frame>
    }
  `,
})
class Host {
  readonly bare = signal(true);
  readonly attr = signal(false);
  readonly size = signal<DeviceFrameSize>('md');
  readonly notch = signal(false);
}

describe('DeviceFrameComponent (3.39, request 059)', () => {
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

  describe('AC-1: inputs and defaults', () => {
    it('defaults: phone, md, no notch; the media is projected into the screen', () => {
      render();
      const instance = fixture.debugElement.query((d) => d.componentInstance instanceof DeviceFrameComponent).componentInstance as DeviceFrameComponent;
      expect(instance.device()).toBe('phone');
      expect(instance.size()).toBe('md');
      expect(instance.notch()).toBe(false);
      expect(frame().className).toBe('lc-device-frame lc-device-frame--phone lc-device-frame--md');
      const strip = (html: string) => html.replace(/\s_ng(content|host)-[\w-]+=""/g, '').replace(/<!--[^]*?-->/g, '');
      expect(strip(frame().innerHTML)).toBe(
        '<div class="lc-device-frame__screen"><img src="/shot.png" width="360" height="780" alt="Startseite am Abend"></div>',
      );
    });

    it.each(['sm', 'md', 'lg'] as const)('size %s: one size class', (size) => {
      render((h) => {
        h.bare.set(false);
        h.size.set(size);
      });
      expect([...frame().classList].filter((c) => /--(sm|md|lg)$/.test(c))).toEqual([`lc-device-frame--${size}`]);
      // A consumer's class stays beside the kit's.
      expect(frame().classList).toContain('consumer');
    });

    it('takes the attribute forms notch and size="lg"', () => {
      render((h) => {
        h.bare.set(false);
        h.attr.set(true);
      });
      expect(frame().className).toBe('lc-device-frame lc-device-frame--phone lc-device-frame--lg lc-device-frame--notch');
      expect(frame().querySelector('.lc-device-frame__screen > p')?.textContent).toBe('Text');
    });
  });

  describe('AC-3: the notch', () => {
    it('off by default; on: one decorative span before the screen, never inside it', () => {
      render((h) => h.bare.set(false));
      expect(frame().querySelector('.lc-device-frame__notch')).toBeNull();
      render((h) => h.notch.set(true));
      const notches = frame().querySelectorAll('.lc-device-frame__notch');
      expect(notches).toHaveLength(1);
      expect(notches[0].tagName).toBe('SPAN');
      expect(notches[0].getAttribute('aria-hidden')).toBe('true');
      expect(notches[0].nextElementSibling?.className).toBe('lc-device-frame__screen');
      expect(frame().classList).toContain('lc-device-frame--notch');
    });
  });

  describe('AC-7: not focusable, no role, no name', () => {
    it('the host and the screen carry no role, tabindex or aria-*', () => {
      render((h) => {
        h.bare.set(false);
        h.notch.set(true);
      });
      for (const el of [frame(), frame().querySelector('.lc-device-frame__screen') as HTMLElement]) {
        expect(el.hasAttribute('role')).toBe(false);
        expect(el.hasAttribute('tabindex')).toBe(false);
        expect([...el.attributes].filter((a) => a.name.startsWith('aria-'))).toEqual([]);
      }
    });

    it('axe: no violations; the only name in the tree is the image alt', async () => {
      render((h) => {
        h.bare.set(false);
        h.notch.set(true);
      });
      await fixture.whenStable();
      expect(violations(await audit(fixture.nativeElement as Element))).toEqual([]);
      axe.setup(fixture.nativeElement as Element);
      try {
        expect(axe.commons.text.accessibleText(frame().querySelector('img') as Element)).toBe('Startseite am Abend');
      } finally {
        axe.teardown();
      }
    });
  });

  describe('AC-2, AC-6: the rules', () => {
    const css = compile(resolve(__dirname, 'device-frame.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      return at < 0 ? '' : css.slice(at + selector.length + 3, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
    };

    // 3.40 (request 060, design D-6): the laptop adds three, after the phone's
    // two: the lid bezel (neutral 900), the hinge notch (neutral 800) and the
    // base (neutral 700). All are token values; the phone's stay first.
    it('no raw colours outside the token defaults (neutral 900 bezel, neutral 700 notch; laptop: bezel, hinge, base)', () => {
      expect(css.match(/#[0-9a-f]{3,8}\b/gi)).toEqual(['#111827', '#374151', '#111827', '#1f2937', '#374151']);
      expect(css).not.toMatch(/rgba?\(/);
      expect(rule(':host')).toContain('background: var(--lc-device-frame-bezel-color, #111827);');
      expect(rule('.lc-device-frame__notch')).toContain('background: var(--lc-device-frame-notch-color, #374151);');
    });

    it('every hook has its documented default', () => {
      const host = rule(':host');
      expect(host).toContain('inline-size: var(--lc-device-frame-width, var(--_lc-device-frame-default-width));');
      expect(host).toContain('max-inline-size: 100%;');
      expect(host).toContain('border: 1px solid var(--lc-device-frame-rim-color, var(--color-field-border));');
      expect(host).toContain('box-shadow: var(--lc-device-frame-shadow, var(--elevation-2));');
      expect(host).toContain('--_lc-device-frame-default-width: 248px; --_lc-device-frame-default-bezel: var(--spacing-2); --_lc-device-frame-default-radius: var(--border-radius-2xl);');
      expect(rule(':host(.lc-device-frame--sm)')).toBe(
        '--_lc-device-frame-default-width: 200px; --_lc-device-frame-default-bezel: var(--spacing-1-5); --_lc-device-frame-default-radius: var(--border-radius-xl);',
      );
      expect(rule(':host(.lc-device-frame--lg)')).toBe(
        '--_lc-device-frame-default-width: 320px; --_lc-device-frame-default-bezel: var(--spacing-2-5); --_lc-device-frame-default-radius: calc(var(--border-radius-2xl) + var(--spacing-2-5));',
      );
      expect(rule('.lc-device-frame__screen')).toContain('background: var(--lc-device-frame-screen-bg, var(--color-surface));');
    });

    it('the public hooks are only read, never declared (an ancestor wins)', () => {
      expect(css).not.toMatch(/--lc-device-frame-[\w-]+\s*:/);
      expect(css).toMatch(/--lc-picture-min-width: 100%;/);
    });

    it('bezel and radius go through registered lengths (a bare 0 works), declared on each box that computes with them', () => {
      for (const name of ['--_lc-device-frame-bezel', '--_lc-device-frame-radius']) {
        expect(css).toContain(`@property ${name} {\n  syntax: "<length>";\n  inherits: false;\n  initial-value: 0px;\n}`);
      }
      const lengths =
        '--_lc-device-frame-bezel: var(--lc-device-frame-bezel, var(--_lc-device-frame-default-bezel)); ' +
        '--_lc-device-frame-radius: var(--lc-device-frame-radius, var(--_lc-device-frame-default-radius));';
      for (const selector of [':host', '.lc-device-frame__notch', '.lc-device-frame__screen']) expect(rule(selector)).toContain(lengths);
    });

    it('the rim and bezel, the notch in the top bezel, the concentric screen', () => {
      // Sass writes max(0px, calc(a - b)) as max(0px, a - b).
      expect(rule(':host')).toContain('padding: max(0px, var(--_lc-device-frame-bezel) - 1px);');
      expect(rule(':host(.lc-device-frame--notch)')).toBe('padding-top: max(0px, 3 * var(--_lc-device-frame-bezel) - 1px);');
      expect(rule('.lc-device-frame__notch')).toContain(
        'position: absolute; top: calc(var(--_lc-device-frame-bezel) - 1px); inset-inline: 37%; block-size: var(--_lc-device-frame-bezel); border-radius: var(--border-radius-full);',
      );
      expect(rule('.lc-device-frame__screen')).toContain(
        'display: block; overflow: hidden; border-radius: max(0px, var(--_lc-device-frame-radius) - var(--_lc-device-frame-bezel));',
      );
      expect(rule('.lc-device-frame__screen > ::ng-deep *')).toBe('display: block; inline-size: 100%; block-size: auto;');
    });

    it('forced colours: a CanvasText border, Canvas glass, no shadow', () => {
      const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
      expect(forced).toMatch(/:host \{\s*border-color: CanvasText;\s*background: Canvas;\s*box-shadow: none;\s*\}/);
      expect(forced).toMatch(/\.lc-device-frame__notch \{\s*background: Canvas;\s*\}/);
    });
  });
});
