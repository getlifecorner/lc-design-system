import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SwitchComponent } from './switch.component';

/**
 * 3.16 (BA-1, request 022): `helpText` below the label, linked by
 * `aria-describedby`, and the 44 px row of a labelled switch.
 */
@Component({
  standalone: true,
  imports: [SwitchComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-switch [label]="label()" [helpText]="help()" [labelPosition]="position()" [size]="size()" [disabled]="disabled()" />
    <lc-switch label="Second" helpText="Second help" />
  `,
})
class HelpHostComponent {
  readonly label = signal('Andere Erwachsene dürfen verwalten');
  readonly help = signal('Andere Erwachsene dürfen Verbindungen und Konten verwalten');
  readonly position = signal<'left' | 'right'>('right');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
}

function setup() {
  TestBed.configureTestingModule({ imports: [HelpHostComponent] });
  const fixture = TestBed.createComponent(HelpHostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const switches = () => [...el.querySelectorAll<HTMLButtonElement>('button[role="switch"]')];
  const wrappers = () => [...el.querySelectorAll<HTMLElement>('.lc-switch-wrapper')];
  return { fixture, host: fixture.componentInstance, el, switches, wrappers };
}

describe('SwitchComponent helpText (3.16, BA-1)', () => {
  it('renders the help text below the label and links it with aria-describedby (AC-1)', () => {
    const { switches, wrappers } = setup();
    const [button] = switches();
    const help = wrappers()[0].querySelector('.lc-switch-help') as HTMLElement;
    expect(help.textContent?.trim()).toBe('Andere Erwachsene dürfen Verbindungen und Konten verwalten');
    expect(help.id).toBe(`${button.id}-help`);
    expect(help.id).toMatch(/^lc-switch-\d+-help$/);
    expect(button.getAttribute('aria-describedby')).toBe(help.id);
    // One text column: the label first, the help text below it.
    const column = help.parentElement as HTMLElement;
    expect(column.classList.contains('lc-switch-text')).toBe(true);
    expect([...column.children].map((c) => c.className)).toEqual(['lc-switch-label', 'lc-switch-help']);
    expect(column.querySelector('label')?.getAttribute('for')).toBe(button.id);
    // The accessible name stays the label: the help text is not inside it.
    expect(column.querySelector('label')?.textContent?.trim()).toBe('Andere Erwachsene dürfen verwalten');
  });

  it('gives every switch on a page its own help id (AC-1)', () => {
    const { switches } = setup();
    const ids = switches().map((b) => b.getAttribute('aria-describedby'));
    expect(ids[0]).not.toBe(ids[1]);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(document.getElementById(id as string)).not.toBeNull();
  });

  it.each(['left', 'right'] as const)('renders the text column before the switch for labelPosition="%s"', (position) => {
    const { fixture, host, wrappers } = setup();
    host.position.set(position);
    fixture.detectChanges();
    const wrapper = wrappers()[0];
    expect([...wrapper.children].map((c) => c.tagName.toLowerCase() + '.' + c.classList[0])).toEqual(
      position === 'left' ? ['div.lc-switch-text', 'button.lc-switch'] : ['button.lc-switch', 'div.lc-switch-text'],
    );
    expect(wrapper.classList.contains('lc-switch-wrapper--help')).toBe(true);
  });

  it.each(['sm', 'md', 'lg'] as const)('marks the text column with the size "%s" (track centred on the first line)', (size) => {
    const { fixture, host, wrappers } = setup();
    host.size.set(size);
    fixture.detectChanges();
    expect(wrappers()[0].querySelector('.lc-switch-text')?.className).toBe(`lc-switch-text lc-switch-text--${size}`);
  });

  it('renders help text without a label, still linked', () => {
    const { fixture, host, switches, wrappers } = setup();
    host.label.set('');
    fixture.detectChanges();
    expect(wrappers()[0].querySelector('label')).toBeNull();
    expect(switches()[0].getAttribute('aria-describedby')).toBe(wrappers()[0].querySelector('.lc-switch-help')?.id);
  });

  it('keeps the help text when the switch is disabled', () => {
    const { fixture, host, switches, wrappers } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(switches()[0].disabled).toBe(true);
    expect(switches()[0].getAttribute('aria-describedby')).toBe(wrappers()[0].querySelector('.lc-switch-help')?.id);
  });

  it('renders no help element and no aria-describedby without helpText (AC-4)', () => {
    const { fixture, host, switches, wrappers } = setup();
    host.help.set('');
    fixture.detectChanges();
    const wrapper = wrappers()[0];
    expect(switches()[0].hasAttribute('aria-describedby')).toBe(false);
    expect(wrapper.querySelector('.lc-switch-help, .lc-switch-text')).toBeNull();
    expect(wrapper.className).toBe('lc-switch-wrapper lc-switch-wrapper--label-right');
  });

  // The 3.15 DOM of a default switch: [button][label] (right) or [label][button] (left), nothing else.
  it.each(['left', 'right'] as const)('keeps the 3.15 DOM of a switch without helpText (labelPosition="%s")', (position) => {
    const { fixture, host, wrappers } = setup();
    host.help.set('');
    host.position.set(position);
    fixture.detectChanges();
    const wrapper = wrappers()[0];
    expect([...wrapper.children].map((c) => c.tagName.toLowerCase())).toEqual(position === 'left' ? ['label', 'button'] : ['button', 'label']);
    expect(wrapper.className).toBe(`lc-switch-wrapper lc-switch-wrapper--label-${position}`);
    const button = wrapper.querySelector('button') as HTMLButtonElement;
    expect(button.getAttributeNames().sort()).toEqual(['aria-checked', 'class', 'id', 'role', 'type']);
  });

  it('keeps the 3.15 DOM of a switch without label and help text', () => {
    TestBed.configureTestingModule({ imports: [SwitchComponent] });
    const fixture = TestBed.createComponent(SwitchComponent);
    fixture.detectChanges();
    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('.lc-switch-wrapper') as HTMLElement;
    expect([...wrapper.children].map((c) => c.tagName.toLowerCase())).toEqual(['button']);
    expect(wrapper.className).toBe('lc-switch-wrapper lc-switch-wrapper--label-right');
  });
});

describe('SwitchComponent styles (3.16, BA-1)', () => {
  const css = compile(resolve(__dirname, 'switch.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };
  const HOOK = 'min-height: var(--lc-switch-min-height, var(--size-min-touch-height, 2.75rem))';

  it('gives a labelled row and a help row the 44 px minimum through the hook (AC-2)', () => {
    expect(rule('.lc-switch-wrapper > .lc-switch-label')).toContain(HOOK);
    expect(rule('.lc-switch-wrapper > .lc-switch-label')).toContain('align-items: center');
    expect(rule('.lc-switch-wrapper.lc-switch-wrapper--help')).toContain(HOOK);
    expect(rule('.lc-switch-wrapper.lc-switch-wrapper--help')).toContain('align-items: flex-start');
  });

  it('reads the hook at the use site and never declares it (ancestors can set it)', () => {
    expect(css).not.toMatch(/--lc-switch-min-height\s*:/);
  });

  it('sets the help text 14/20 in --color-text-secondary, without opacity (AC-3)', () => {
    const help = rule('.lc-switch-help');
    expect(help).toContain('color: var(--color-text-secondary)');
    expect(help).toContain('font-size: var(--font-size-sm)');
    expect(help).toContain('line-height: 1.25rem');
    expect(help).not.toContain('opacity');
  });

  it('lets the text column shrink and wrap anywhere beside the switch (AC-3)', () => {
    const column = rule('.lc-switch-text');
    expect(column).toContain('min-width: 0');
    expect(column).toContain('overflow-wrap: anywhere');
    expect(column).toContain('position: relative');
    expect(rule('.lc-switch-text > .lc-switch-label::after')).toContain('inset: 0');
  });

  it('centres the track on the first label line per size', () => {
    expect(rule('.lc-switch-text.lc-switch-text--md')).toContain('padding-top: 0.09375rem');
    expect(rule('.lc-switch-text.lc-switch-text--lg')).toContain('padding-top: 0.21875rem');
    expect(rule('.lc-switch-wrapper.lc-switch-wrapper--help > .lc-switch--sm')).toContain('margin-top: 0.03125rem');
  });
});
