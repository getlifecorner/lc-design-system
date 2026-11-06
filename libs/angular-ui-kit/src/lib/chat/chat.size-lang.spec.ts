import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { resolve } from 'path';
import { compile } from 'sass';
import { ChatComponent } from './chat.component';

/**
 * 3.33 (request 052, 044-n2, AC-15): attachment sizes follow the host's
 * language (closest `lang`), English without one; the size never wraps.
 */
@Component({
  standalone: true,
  imports: [ChatComponent],
  template: `<div [attr.lang]="lang()"><lc-chat title="Assistent" [messages]="[]"></lc-chat></div>`,
})
class Host {
  readonly lang = signal<string | null>(null);
}

describe('lc-chat — attachment size in the host language (3.33, 044-n2)', () => {
  function sizeFor(lang: string | null): (bytes: number | undefined) => string {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.lang.set(lang);
    fixture.detectChanges();
    const chat = fixture.debugElement.query(By.directive(ChatComponent)).componentInstance as ChatComponent;
    return (bytes) => chat['formatBytes'](bytes);
  }

  it('English default without a lang: unchanged texts', () => {
    const size = sizeFor(null);
    expect([size(240 * 1024), size(5 * 1024), size(1.2 * 1024 * 1024), size(512), size(0), size(undefined)]).toEqual([
      '240.0 KB',
      '5.0 KB',
      '1.2 MB',
      '512 B',
      '0 B',
      '',
    ]);
  });

  it('lang="de": a decimal comma', () => {
    const size = sizeFor('de');
    expect([size(240 * 1024), size(5 * 1024), size(1.2 * 1024 * 1024)]).toEqual(['240,0 KB', '5,0 KB', '1,2 MB']);
  });

  it('no digit grouping, as before', () => {
    expect(sizeFor('de')(1500 * 1024 * 1024)).toBe('1500,0 MB');
  });

  it('lang="en-US" reads as before', () => {
    expect(sizeFor('en-US')(240 * 1024)).toBe('240.0 KB');
  });

  it('falls back to English for an empty or invalid lang', () => {
    expect(sizeFor('')(240 * 1024)).toBe('240.0 KB');
  });

  it('falls back to English for a lang Intl rejects', () => {
    expect(sizeFor('x-not a tag!')(240 * 1024)).toBe('240.0 KB');
  });

  it('the size label stays on one line and does not shrink in the chip', () => {
    const css = compile(resolve(__dirname, 'chat.component.scss')).css;
    const at = css.indexOf('\n.lc-chat__pending-size {');
    expect(css.slice(at, css.indexOf('}', at))).toMatch(
      /color: var\(--color-text-tertiary\);\s*font-variant-numeric: tabular-nums;\s*white-space: nowrap;\s*flex-shrink: 0;/,
    );
  });
});
