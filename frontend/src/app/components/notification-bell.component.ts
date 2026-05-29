import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { NotificationService } from '../services/notification.service';
import {
  AppNotification,
  NOTIFICATION_ICON,
  NotificationType,
} from '../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bell-wrap">
      <button type="button" class="btn btn-ghost btn-icon bell-btn" (click)="toggle()" aria-label="Уведомления">
        🔔
        @if (unread() > 0) {
          <span class="bell-badge">{{ unread() > 9 ? '9+' : unread() }}</span>
        }
      </button>

      @if (open()) {
        <button class="bell-scrim" type="button" (click)="close()" aria-label="Закрыть"></button>
        <div class="bell-panel">
          <header class="bell-head">
            <span>Уведомления</span>
            @if (unread() > 0) {
              <button type="button" class="link-btn" (click)="markAll()">Прочитать всё</button>
            }
          </header>

          @if (items().length) {
            <div class="bell-list">
              @for (n of items(); track n._id) {
                <button
                  type="button"
                  class="bell-item"
                  [class.unread]="!n.read"
                  (click)="onClick(n)"
                >
                  <span class="bell-ico">{{ icon(n.type) }}</span>
                  <span class="bell-body">
                    <span class="bell-title">{{ n.title }}</span>
                    <span class="bell-msg">{{ n.message }}</span>
                    <span class="bell-time">{{ n.createdAt | date: 'dd.MM HH:mm' }}</span>
                  </span>
                  @if (!n.read) { <span class="bell-dot"></span> }
                </button>
              }
            </div>
          } @else {
            <div class="bell-empty">Уведомлений нет</div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .bell-wrap { position: relative; }
      .bell-btn { position: relative; font-size: 18px; }
      .bell-badge {
        position: absolute; top: -2px; right: -2px;
        min-width: 18px; height: 18px; padding: 0 4px;
        background: #ef4444; color: #fff;
        border-radius: 9px; font-size: 11px; font-weight: 700;
        display: grid; place-items: center; line-height: 1;
      }
      .bell-scrim { position: fixed; inset: 0; z-index: 40; background: transparent; }
      .bell-panel {
        position: absolute; right: 0; top: calc(100% + 8px);
        width: 340px; max-height: 70vh; overflow-y: auto;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg, 0 20px 50px rgba(0,0,0,0.25));
        z-index: 41;
      }
      .bell-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border);
        font-weight: 600; font-size: 14px;
        position: sticky; top: 0; background: var(--surface);
      }
      .link-btn { color: var(--brand-600); font-size: 12px; font-weight: 500; }
      .bell-list { display: flex; flex-direction: column; }
      .bell-item {
        display: flex; align-items: flex-start; gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border);
        text-align: left; width: 100%;
        transition: background var(--duration-fast) var(--ease);
      }
      .bell-item:hover { background: var(--surface-muted); }
      .bell-item.unread { background: var(--brand-50); }
      .bell-ico { font-size: 18px; flex-shrink: 0; }
      .bell-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
      .bell-title { font-weight: 600; font-size: 13px; }
      .bell-msg { font-size: 12px; color: var(--text-secondary); }
      .bell-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
      .bell-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand-600); flex-shrink: 0; margin-top: 4px; }
      .bell-empty { padding: var(--space-6); text-align: center; color: var(--text-muted); font-size: 13px; }
    `,
  ],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly service = inject(NotificationService);

  protected readonly items = signal<AppNotification[]>([]);
  protected readonly unread = signal(0);
  protected readonly open = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.refreshCount();
    this.timer = setInterval(() => this.refreshCount(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  protected icon(type: NotificationType): string {
    return NOTIFICATION_ICON[type] ?? '🔔';
  }

  protected toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) this.loadList();
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onClick(n: AppNotification): void {
    if (n.read) return;
    this.service.markRead(n._id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((x) => (x._id === n._id ? { ...x, read: true } : x)),
        );
        this.unread.update((c) => Math.max(0, c - 1));
      },
    });
  }

  protected markAll(): void {
    this.service.markAllRead().subscribe({
      next: () => {
        this.items.update((list) => list.map((x) => ({ ...x, read: true })));
        this.unread.set(0);
      },
    });
  }

  private refreshCount(): void {
    this.service.unreadCount().subscribe({
      next: (c) => this.unread.set(c),
      error: () => {},
    });
  }

  private loadList(): void {
    this.service.list().subscribe({
      next: (list) => this.items.set(list),
      error: () => this.items.set([]),
    });
  }
}
