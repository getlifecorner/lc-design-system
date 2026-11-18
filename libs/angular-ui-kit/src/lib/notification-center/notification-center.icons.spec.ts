import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLcIcons, type LcIconDefinition } from '@lifecorner/angular-ui-kit/icon';
import { NotificationCenterComponent, type Notification } from './notification-center.component';

/**
 * 3.48 (request 068, backlog 067-n5): fixed timestamps a minute apart, newest
 * first. The list sorts newest first; five `new Date()` calls tied in the
 * same millisecond and kept this order, but under load they crossed a
 * millisecond, a later item sorted first and the order assertion failed.
 */
const NOW = new Date(2026, 10, 18, 12, 0).getTime();
const at = (minutesAgo: number) => new Date(NOW - minutesAgo * 60_000);

@Component({
  standalone: true,
  imports: [NotificationCenterComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-notification-center [notifications]="notifications()" />`,
})
class NcIconHostComponent {
  readonly notifications = signal<Notification[]>([
    { id: '1', title: 'Deploy success', type: 'success', timestamp: at(0), read: false },
    { id: '2', title: 'Error in pipeline', type: 'error', timestamp: at(1), read: false },
    { id: '3', title: 'Disk warning', type: 'warning', timestamp: at(2), read: true },
    { id: '4', title: 'New comment', type: 'info', timestamp: at(3), read: true },
    { id: '5', title: 'No type', timestamp: at(4), read: true },
  ]);
}

/** Registered glyphs, so every icon renders its svg without a fetch. */
const glyphs: LcIconDefinition[] = ['bell', 'check-circle', 'x-circle', 'exclamation-triangle', 'information-circle'].map(
  (name) => ({
    name,
    variant: 'outline',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>',
  }),
);

/**
 * Request 024 (AC-7, 023 review svg-img-alt): the empty-state bell and the
 * item type icons of lc-notification-center sit next to their text, so they
 * are decorative (no unnamed `role="img"`). The type was not announced
 * before either.
 */
describe('NotificationCenterComponent — the icons are decorative (024)', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [NcIconHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons(glyphs)],
    }).compileComponents();
    const fixture = TestBed.createComponent(NcIconHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  const expectDecorative = (svg: SVGElement | null | undefined) => {
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.hasAttribute('role')).toBe(false);
    expect(svg?.hasAttribute('aria-label')).toBe(false);
  };

  it('hides every item type icon, the item keeps its title button and type class', async () => {
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    const icons = [...el.querySelectorAll<HTMLElement>('.lc-nc__item-icon')];
    expect(icons.map((icon) => icon.className.match(/lc-nc__item-icon--\w+/)?.[0])).toEqual([
      'lc-nc__item-icon--success',
      'lc-nc__item-icon--error',
      'lc-nc__item-icon--warning',
      'lc-nc__item-icon--info',
      'lc-nc__item-icon--info',
    ]);
    for (const icon of icons) expectDecorative(icon.querySelector('svg'));
    expect([...el.querySelectorAll('.lc-nc__item-title')].map((b) => b.textContent?.trim())).toEqual([
      'Deploy success',
      'Error in pipeline',
      'Disk warning',
      'New comment',
      'No type',
    ]);
  });

  it('hides the empty-state bell, the message stays the text', async () => {
    const fixture = await render();
    fixture.componentInstance.notifications.set([]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expectDecorative(el.querySelector<SVGElement>('.lc-nc__empty-icon svg'));
    expect(el.querySelector('.lc-nc__empty-text')?.textContent?.trim()).toBe('No notifications');
  });
});
