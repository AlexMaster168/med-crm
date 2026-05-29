import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { SPECIALIZATION_LABELS, UserRole } from '../../models/user.model';
import { NotificationBellComponent } from '../../components/notification-bell.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationBellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell" [class.sidebar-open]="sidebarOpen()">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="logo-mark">+</span>
          <span class="logo-text">Medical CRM</span>
        </div>

        <nav class="sidebar-nav">
          @for (item of nav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="sidebar-link"
            >
              <span class="sidebar-icon" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="sidebar-foot">
          <div class="user-chip">
            <div class="avatar">{{ initials() }}</div>
            <div class="user-meta">
              <div class="user-name">{{ fullName() }}</div>
              <div class="user-role">{{ roleLabel() }}</div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-block" (click)="logout()">
            Выйти
          </button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <button
            type="button"
            class="btn btn-ghost btn-icon mobile-only"
            (click)="toggleSidebar()"
            aria-label="Меню"
          >
            ☰
          </button>
          <div class="topbar-title">{{ greeting() }}</div>
          <div class="spacer"></div>
          <app-notification-bell />
          <span class="badge badge-brand">{{ roleLabel() }}</span>
        </header>

        <div class="content">
          <router-outlet />
        </div>
      </div>

      @if (sidebarOpen()) {
        <button class="scrim" type="button" (click)="toggleSidebar()" aria-label="Закрыть меню"></button>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }

      .shell {
        display: grid;
        grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
        min-height: 100vh;
        background: var(--surface-muted);
      }

      /* ── Sidebar ── */
      .sidebar {
        background: var(--surface);
        border-right: 1px solid var(--border);
        padding: var(--space-5) var(--space-4);
        display: flex; flex-direction: column;
        gap: var(--space-6);
        position: sticky; top: 0; height: 100vh;
      }

      .sidebar-brand {
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-2) var(--space-2);
      }
      .logo-mark {
        width: 32px; height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--brand-500), var(--brand-700));
        color: #fff;
        display: grid; place-items: center;
        font-weight: 700; font-size: 20px; line-height: 1;
      }
      .logo-text { font-weight: 600; font-size: 15px; }

      .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
      .sidebar-link {
        display: flex; align-items: center; gap: var(--space-3);
        height: 40px;
        padding: 0 var(--space-3);
        border-radius: var(--radius);
        color: var(--text-secondary);
        font-size: 14px; font-weight: 500;
        transition: background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
      }
      .sidebar-link:hover { background: var(--surface-muted); color: var(--text-primary); }
      .sidebar-link.active {
        background: var(--brand-50);
        color: var(--brand-700);
      }
      .sidebar-icon {
        width: 24px; height: 24px;
        display: grid; place-items: center;
        font-size: 14px;
      }

      .sidebar-foot { margin-top: auto; display: flex; flex-direction: column; gap: var(--space-3); }
      .user-chip {
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-3);
        border-radius: var(--radius);
        background: var(--surface-muted);
      }
      .avatar {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-500), var(--brand-700));
        color: #fff;
        display: grid; place-items: center;
        font-weight: 600; font-size: 13px;
      }
      .user-meta { min-width: 0; }
      .user-name { font-weight: 500; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .user-role { color: var(--text-muted); font-size: 12px; }

      /* ── Main ── */
      .main { display: flex; flex-direction: column; min-width: 0; }
      .topbar {
        height: var(--header-height);
        padding: 0 var(--space-6);
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        display: flex; align-items: center; gap: var(--space-3);
        position: sticky; top: 0; z-index: 5;
      }
      .topbar-title { font-weight: 600; font-size: 15px; }
      .mobile-only { display: none; }

      .content { padding: var(--space-6); }

      .scrim {
        display: none;
        position: fixed; inset: 0;
        background: rgba(15, 23, 42, 0.36);
        z-index: 30;
      }

      /* ── Responsive ── */
      @media (max-width: 880px) {
        .shell { grid-template-columns: 1fr; }
        .sidebar {
          position: fixed; top: 0; left: 0;
          width: var(--sidebar-width);
          transform: translateX(-100%);
          transition: transform var(--duration) var(--ease);
          z-index: 40;
          box-shadow: var(--shadow-lg);
        }
        .shell.sidebar-open .sidebar { transform: translateX(0); }
        .shell.sidebar-open .scrim { display: block; }
        .mobile-only { display: inline-flex; }
      }
    `,
  ],
})
export class AppLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly sidebarOpen = signal(false);

  protected readonly nav = computed<NavItem[]>(() => {
    if (this.auth.role() === UserRole.DOCTOR) {
      return [{ label: 'Кабинет врача', path: '/doctor', icon: '◧' }];
    }
    return [{ label: 'Кабинет пациента', path: '/patient', icon: '◧' }];
  });

  protected readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() || u.email : '';
  });

  protected readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '·';
    const a = u.firstName?.[0] ?? '';
    const b = u.lastName?.[0] ?? '';
    return (a + b || u.email[0] || '·').toUpperCase();
  });

  protected readonly roleLabel = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.role === UserRole.DOCTOR) {
      return u.specialization ? (SPECIALIZATION_LABELS[u.specialization] ?? 'Врач') : 'Врач';
    }
    return 'Пациент';
  });

  protected readonly greeting = computed(() => {
    const u = this.user();
    if (!u) return '';
    const name = u.firstName || 'друг';
    return `Здравствуйте, ${name}`;
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
