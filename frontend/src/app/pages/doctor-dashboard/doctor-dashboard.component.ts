import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { FamilyDoctorService } from '../../services/family-doctor.service';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
} from '../../models/appointment.model';
import {
  SPECIALIZATION_LABELS,
  User,
} from '../../models/user.model';

type Tab = 'today' | 'upcoming' | 'patients';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <section class="hero card card-padded">
        <div>
          <small class="muted">Сегодня, {{ todayLabel }}</small>
          <h2>{{ greeting() }}</h2>
          <p class="muted">{{ specLabel() }}</p>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">{{ todayCount() }}</div>
            <div class="stat-label">Приёмов сегодня</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ upcoming().length }}</div>
            <div class="stat-label">Запланировано</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ patients().length }}</div>
            <div class="stat-label">Пациентов</div>
          </div>
        </div>
      </section>

      <div class="tabs" role="tablist">
        @for (t of tabs; track t.value) {
          <button
            type="button"
            class="tab"
            role="tab"
            [class.active]="tab() === t.value"
            [attr.aria-selected]="tab() === t.value"
            (click)="tab.set(t.value)"
          >
            {{ t.label }}
            <span class="tab-count">{{ countFor(t.value) }}</span>
          </button>
        }
      </div>

      <section class="card">
        <div class="card-body">
          @if (loading()) {
            <div class="skeleton-list">
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row"></div>
            </div>
          } @else {
            @switch (tab()) {
              @case ('today') {
                @if (today().length) {
                  <div class="appt-list">
                    @for (a of today(); track a._id) {
                      <article class="appt">
                        <div class="appt-left">
                          <div class="appt-day">{{ a.dateTime | date: 'dd MMM' }}</div>
                          <div class="appt-time">{{ a.dateTime | date: 'HH:mm' }}</div>
                        </div>
                        <div class="appt-body">
                          <div class="row">
                            <div class="avatar">{{ initials(a.patientId) }}</div>
                            <div>
                              <div class="appt-title">
                                {{ a.patientId.firstName }} {{ a.patientId.lastName }}
                              </div>
                              <div class="muted">{{ a.patientId.email }}</div>
                            </div>
                          </div>
                          @if (a.reason) {
                            <div class="appt-reason">{{ a.reason }}</div>
                          }
                        </div>
                        <div class="appt-actions">
                          <span class="badge" [class]="statusBadgeClass(a.status)">
                            {{ statusLabels[a.status] }}
                          </span>
                        </div>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty">
                    <div class="empty-icon">☕</div>
                    <div>На сегодня приёмов нет</div>
                  </div>
                }
              }

              @case ('upcoming') {
                @if (upcoming().length) {
                  <div class="appt-list">
                    @for (a of upcoming(); track a._id) {
                      <article class="appt">
                        <div class="appt-left">
                          <div class="appt-day">{{ a.dateTime | date: 'dd MMM' }}</div>
                          <div class="appt-time">{{ a.dateTime | date: 'HH:mm' }}</div>
                        </div>
                        <div class="appt-body">
                          <div class="appt-title">
                            {{ a.patientId.firstName }} {{ a.patientId.lastName }}
                          </div>
                          <div class="muted">{{ a.patientId.phone || a.patientId.email }}</div>
                          @if (a.reason) {
                            <div class="appt-reason">{{ a.reason }}</div>
                          }
                        </div>
                        <div class="appt-actions">
                          <span class="badge" [class]="statusBadgeClass(a.status)">
                            {{ statusLabels[a.status] }}
                          </span>
                        </div>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty">
                    <div class="empty-icon">📅</div>
                    <div>Предстоящих приёмов нет</div>
                  </div>
                }
              }

              @case ('patients') {
                @if (patients().length) {
                  <div class="patient-grid">
                    @for (p of patients(); track p.id) {
                      <article class="patient-card">
                        <div class="avatar avatar-lg">{{ initials(p) }}</div>
                        <div class="patient-meta">
                          <div class="patient-name">{{ p.firstName }} {{ p.lastName }}</div>
                          <div class="muted">{{ p.email }}</div>
                          @if (p.phone) {
                            <div class="muted">{{ p.phone }}</div>
                          }
                        </div>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty">
                    <div class="empty-icon">👤</div>
                    <div>У вас пока нет пациентов</div>
                  </div>
                }
              }
            }
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .page { display: flex; flex-direction: column; gap: var(--space-6); }

      .hero {
        display: flex; align-items: center; gap: var(--space-6);
        background: linear-gradient(135deg, var(--brand-50), var(--surface));
        border-color: var(--brand-100);
      }
      .hero h2 { font-size: 22px; margin: 2px 0 4px; }
      .hero-stats { display: flex; gap: var(--space-8); margin-left: auto; }
      .stat { text-align: right; }
      .stat-value { font-size: 28px; font-weight: 700; color: var(--brand-700); line-height: 1; }
      .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

      .tabs {
        display: inline-flex;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 4px;
        gap: 2px;
        align-self: flex-start;
        box-shadow: var(--shadow-xs);
      }
      .tab {
        height: 36px;
        padding: 0 var(--space-4);
        border-radius: 8px;
        font-size: 13px; font-weight: 500;
        color: var(--text-secondary);
        display: inline-flex; align-items: center; gap: var(--space-2);
        transition: background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
      }
      .tab:hover { color: var(--text-primary); }
      .tab.active { background: var(--brand-50); color: var(--brand-700); }
      .tab-count {
        background: var(--surface-sunken);
        color: var(--text-secondary);
        border-radius: var(--radius-full);
        padding: 0 8px;
        font-size: 11px;
        height: 20px; display: inline-flex; align-items: center;
      }
      .tab.active .tab-count { background: var(--brand-100); color: var(--brand-700); }

      .skeleton-list { display: flex; flex-direction: column; gap: var(--space-3); }
      .skeleton-row { height: 80px; border-radius: var(--radius); }

      .avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-400), var(--brand-700));
        color: #fff;
        display: grid; place-items: center;
        font-weight: 600; font-size: 13px;
        flex-shrink: 0;
      }
      .avatar-lg { width: 56px; height: 56px; font-size: 18px; }

      .appt-list { display: flex; flex-direction: column; gap: var(--space-3); }
      .appt {
        display: grid; grid-template-columns: 88px 1fr auto; gap: var(--space-4);
        padding: var(--space-4);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        transition: border-color var(--duration-fast) var(--ease);
      }
      .appt:hover { border-color: var(--brand-300); }
      .appt-left {
        text-align: center; padding: var(--space-2); background: var(--surface-muted);
        border-radius: var(--radius-sm); align-self: start;
      }
      .appt-day { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
      .appt-time { font-size: 18px; font-weight: 600; color: var(--brand-700); margin-top: 2px; }
      .appt-title { font-weight: 600; font-size: 15px; }
      .appt-reason {
        margin-top: var(--space-3);
        padding: var(--space-2) var(--space-3);
        background: var(--surface-muted);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: 13px;
      }
      .appt-actions { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); }

      .patient-grid {
        display: grid; gap: var(--space-3);
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
      .patient-card {
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-4);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        transition: border-color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease);
      }
      .patient-card:hover { border-color: var(--brand-300); background: var(--brand-50); }
      .patient-meta { min-width: 0; }
      .patient-name { font-weight: 600; }
    `,
  ],
})
export class DoctorDashboardComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly auth = inject(AuthService);
  // family-doctors API gives doctors their patient list reliably
  private readonly familyDoctorService = inject(FamilyDoctorService);

  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly user = this.auth.user;
  protected readonly loading = signal(true);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly patients = signal<User[]>([]);
  protected readonly tab = signal<Tab>('today');

  protected readonly tabs: { value: Tab; label: string }[] = [
    { value: 'today', label: 'Сегодня' },
    { value: 'upcoming', label: 'Предстоящие' },
    { value: 'patients', label: 'Пациенты' },
  ];

  protected readonly todayLabel = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  protected readonly greeting = computed(() => {
    const u = this.user();
    return u ? `Здравствуйте, ${u.firstName}` : 'Здравствуйте';
  });

  protected readonly specLabel = computed(() => {
    const u = this.user();
    return u?.specialization ? SPECIALIZATION_LABELS[u.specialization] : '';
  });

  protected readonly today = computed(() => {
    const day = new Date().toDateString();
    return this.appointments().filter(
      (a) =>
        a.status === AppointmentStatus.SCHEDULED &&
        new Date(a.dateTime).toDateString() === day,
    );
  });

  protected readonly upcoming = computed(() =>
    this.appointments()
      .filter((a) => a.status === AppointmentStatus.SCHEDULED)
      .sort((a, b) => +new Date(a.dateTime) - +new Date(b.dateTime)),
  );

  protected readonly todayCount = computed(() => this.today().length);

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
  }

  protected countFor(t: Tab): number {
    switch (t) {
      case 'today':
        return this.todayCount();
      case 'upcoming':
        return this.upcoming().length;
      case 'patients':
        return this.patients().length;
    }
  }

  protected initials(user: User | null | undefined): string {
    if (!user) return '·';
    return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || '·';
  }

  protected statusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'badge-info';
      case AppointmentStatus.COMPLETED:
        return 'badge-success';
      case AppointmentStatus.CANCELLED:
        return 'badge-danger';
    }
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getDoctorAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadPatients(): void {
    this.familyDoctorService.getMyPatients().subscribe({
      next: (list) => this.patients.set(list),
      error: () => this.patients.set([]),
    });
  }
}
