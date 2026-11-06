import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { openPanelLang } from './content-lang';

/** 3.33 (request 052, 049-n3): the live closest-`[lang]` of an open panel's host. */
@Component({
  selector: 'lc-zz-panel-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="lang">{{ lang() ?? 'none' }}</span>`,
})
class PanelHost {
  readonly open = signal(false);
  readonly lang = openPanelLang(this.open);
}

@Component({
  standalone: true,
  imports: [PanelHost],
  template: `<div [attr.lang]="wrapperLang()"><lc-zz-panel-host /></div>`,
})
class Page {
  readonly wrapperLang = signal<string | null>('de');
}

describe('openPanelLang (3.33, request 052)', () => {
  let fixture: ComponentFixture<Page>;
  let panel: PanelHost;
  let observe: jest.SpyInstance;
  let disconnect: jest.SpyInstance;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(() => {
    observe = jest.spyOn(MutationObserver.prototype, 'observe');
    disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    TestBed.configureTestingModule({ imports: [Page] });
    fixture = TestBed.createComponent(Page);
    fixture.detectChanges();
    panel = fixture.debugElement.query(By.directive(PanelHost)).componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    jest.restoreAllMocks();
  });

  it('is null while closed and observes nothing (the server never reads the DOM)', async () => {
    await settle();
    expect(panel.lang()).toBeNull();
    expect(observe).not.toHaveBeenCalled();
  });

  it('reads the host lang when open and follows a change without reopening', async () => {
    panel.open.set(true);
    await settle();
    expect(panel.lang()).toBe('de');
    expect(observe).toHaveBeenCalledTimes(1);
    expect(observe.mock.calls[0][1]).toEqual({ attributes: true, attributeFilter: ['lang'], subtree: true });
    fixture.componentInstance.wrapperLang.set('fr');
    await settle();
    expect(panel.lang()).toBe('fr');
    expect((fixture.nativeElement as HTMLElement).querySelector('.lang')?.textContent).toBe('fr');
  });

  it('disconnects on close and on destroy', async () => {
    panel.open.set(true);
    await settle();
    panel.open.set(false);
    await settle();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(panel.lang()).toBeNull();
    panel.open.set(true);
    await settle();
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });
});
