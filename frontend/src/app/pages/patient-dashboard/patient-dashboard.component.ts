import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { FamilyDoctorService } from '../../services/family-doctor.service';
import { UserService } from '../../services/user.service';
import { MedicalCardService } from '../../services/medical-card.service';
import { MedicalCard } from '../../models/medical-card.model';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  TimeSlot,
} from '../../models/appointment.model';
import {
  DoctorSpecialization,
  SPECIALIZATION_LABELS,
  User,
} from '../../models/user.model';

const SPECS = [
  DoctorSpecialization.THERAPIST,
  DoctorSpecialization.SURGEON,
  DoctorSpecialization.CARDIOLOGIST,
  DoctorSpecialization.NEUROLOGIST,
  DoctorSpecialization.DERMATOLOGIST,
  DoctorSpecialization.PEDIATRICIAN,
  DoctorSpecialization.OPHTHALMOLOGIST,
  DoctorSpecialization.PSYCHIATRIST,
];

@Component({
  selector: 'app-patient-dashboard',
  imports: [ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <section class="hero card card-padded">
        <div>
          <small class="muted">Добро пожаловать</small>
          <h2>{{ greeting() }}</h2>
          <p class="muted">Здесь вы можете записаться на приём и видеть всю историю.</p>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">{{ upcomingCount() }}</div>
            <div class="stat-label">Предстоящих приёмов</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ pastCount() }}</div>
            <div class="stat-label">Завершённых</div>
          </div>
        </div>
      </section>

      <section class="grid-2">
        <div class="card">
          <header class="card-header">
            <div>
              <div class="card-title">Семейный врач</div>
              <div class="card-subtle">Закрепите за собой терапевта</div>
            </div>
          </header>
          <div class="card-body">
            @if (familyDoctor(); as fd) {
              <div class="doctor-info">
                <div class="avatar avatar-lg">{{ initials(fd) }}</div>
                <div>
                  <div class="doctor-name">{{ fd.firstName }} {{ fd.lastName }}</div>
                  <div class="muted">{{ specLabel(fd.specialization) || 'Терапевт' }}</div>
                  @if (fd.phone) {
                    <div class="muted">{{ fd.phone }}</div>
                  }
                </div>
                <div class="spacer"></div>
                <button type="button" class="btn btn-ghost btn-sm" (click)="terminate()">
                  Открепить
                </button>
              </div>
            } @else {
              @if (therapists().length) {
                <div class="doctor-list">
                  @for (doctor of therapists(); track doctor.id) {
                    <div class="doctor-row">
                      <div class="avatar">{{ initials(doctor) }}</div>
                      <div class="doctor-meta">
                        <div class="doctor-name">{{ doctor.firstName }} {{ doctor.lastName }}</div>
                        <div class="muted">{{ doctor.email }}</div>
                      </div>
                      <button type="button" class="btn btn-secondary btn-sm" (click)="assign(doctor.id)">
                        Выбрать
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty">
                  <div class="empty-icon">⊘</div>
                  <div>Терапевты пока не доступны</div>
                </div>
              }
            }
          </div>
        </div>

        <div class="card">
          <header class="card-header">
            <div>
              <div class="card-title">Записаться на приём</div>
              <div class="card-subtle">Выберите специализацию и удобное время</div>
            </div>
          </header>
          <div class="card-body">
            <form class="stack" [formGroup]="bookingForm" (ngSubmit)="book()" novalidate>
              <div class="field">
                <label class="field-label">Специализация</label>
                <select class="select" formControlName="specialization" (change)="onSpecChange()">
                  <option value="">Выберите специализацию</option>
                  @for (s of specs; track s) {
                    <option [value]="s">{{ labels[s] }}</option>
                  }
                </select>
              </div>

              @if (doctorsList().length) {
                <div class="field">
                  <label class="field-label">Врач</label>
                  <select class="select" formControlName="doctorId" (change)="onDoctorChange()">
                    <option value="">Выберите врача</option>
                    @for (d of doctorsList(); track d.id) {
                      <option [value]="d.id">{{ d.firstName }} {{ d.lastName }}</option>
                    }
                  </select>
                </div>
              }

              @if (bookingForm.controls.doctorId.value) {
                <div class="field">
                  <label class="field-label">Дата</label>
                  <input
                    type="date"
                    class="input"
                    formControlName="date"
                    [min]="minDate"
                    (change)="onDateChange()"
                  />
                </div>
              }

              @if (availableSlots().length) {
                <div class="field">
                  <label class="field-label">Время</label>
                  <div class="time-slots">
                    @for (slot of availableSlots(); track slot.time) {
                      <button
                        type="button"
                        class="time-slot"
                        [class.selected]="bookingForm.controls.time.value === slot.time"
                        [class.disabled]="!slot.available"
                        [disabled]="!slot.available"
                        (click)="pickTime(slot.time)"
                      >
                        {{ slot.time }}
                      </button>
                    }
                  </div>
                </div>
              } @else if (slotsChecked() && bookingForm.controls.date.value) {
                <div class="alert alert-info">
                  В этот день врач не принимает или все слоты заняты. Выберите другую дату.
                </div>
              }

              <div class="field">
                <label class="field-label">Причина обращения</label>
                <textarea
                  class="textarea"
                  rows="3"
                  formControlName="reason"
                  placeholder="Опишите ваши жалобы…"
                ></textarea>
              </div>

              @if (bookingError()) {
                <div class="alert alert-error">{{ bookingError() }}</div>
              }

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="bookingForm.invalid || bookingLoading()"
              >
                {{ bookingLoading() ? 'Бронируем…' : 'Записаться' }}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section class="card">
        <header class="card-header">
          <div>
            <div class="card-title">Мои записи</div>
            <div class="card-subtle">Все приёмы — предстоящие и завершённые</div>
          </div>
          <span class="badge badge-brand">{{ appointments().length }}</span>
        </header>
        <div class="card-body">
          @if (loading()) {
            <div class="skeleton-list">
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row"></div>
            </div>
          } @else if (appointments().length) {
            <div class="appt-list">
              @for (a of appointments(); track a._id) {
                <article class="appt">
                  <div class="appt-left">
                    <div class="appt-day">{{ a.dateTime | date: 'dd MMM' }}</div>
                    <div class="appt-time">{{ a.dateTime | date: 'HH:mm' }}</div>
                  </div>
                  <div class="appt-body">
                    <div class="appt-title">
                      {{ a.doctorId.firstName }} {{ a.doctorId.lastName }}
                    </div>
                    <div class="muted">{{ specLabel(a.doctorId.specialization) }}</div>
                    @if (a.reason) {
                      <div class="appt-reason">{{ a.reason }}</div>
                    }
                  </div>
                  <div class="appt-actions">
                    <span class="badge" [class]="statusBadgeClass(a.status)">
                      {{ statusLabels[a.status] }}
                    </span>
                    @if (a.status === AppointmentStatus.SCHEDULED) {
                      <button
                        type="button"
                        class="btn btn-ghost btn-sm"
                        (click)="cancel(a._id)"
                      >
                        Отменить
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty">
              <div class="empty-icon">📅</div>
              <div>У вас пока нет записей</div>
            </div>
          }
        </div>
      </section>

      <section class="card">
        <header class="card-header">
          <div>
            <div class="card-title">Моя медкарта</div>
            <div class="card-subtle">Показатели и история болезни</div>
          </div>
        </header>
        <div class="card-body">
          @if (myCard(); as c) {
            <div class="vitals">
              <div class="vital"><span class="muted">Группа крови</span><b>{{ c.bloodType || '—' }}</b></div>
              <div class="vital"><span class="muted">Рост</span><b>{{ c.height ? c.height + ' см' : '—' }}</b></div>
              <div class="vital"><span class="muted">Вес</span><b>{{ c.weight ? c.weight + ' кг' : '—' }}</b></div>
            </div>

            <div class="chips-block">
              <div class="chips-label">Аллергии</div>
              @if (c.allergies?.length) {
                <div class="chips">@for (a of c.allergies; track a) { <span class="chip chip-danger">{{ a }}</span> }</div>
              } @else { <span class="muted">нет</span> }
            </div>
            <div class="chips-block">
              <div class="chips-label">Хронические заболевания</div>
              @if (c.chronicDiseases?.length) {
                <div class="chips">@for (d of c.chronicDiseases; track d) { <span class="chip">{{ d }}</span> }</div>
              } @else { <span class="muted">нет</span> }
            </div>

            <div class="chips-label">История болезни ({{ c.records.length }})</div>
            @if (c.records.length) {
              <div class="records">
                @for (r of sortedRecords(c.records); track $index) {
                  <article class="record">
                    <div class="record-head">
                      <span class="record-diag">{{ r.diagnosis }}</span>
                      <span class="muted">{{ r.date | date: 'dd.MM.yyyy' }}</span>
                    </div>
                    <div class="record-row"><span class="muted">Симптомы:</span> {{ r.symptoms }}</div>
                    @if (r.treatment) {
                      <div class="record-row"><span class="muted">Лечение:</span> {{ r.treatment }}</div>
                    }
                    @if (recordDoctor(r); as rd) { <div class="record-doc muted">— {{ rd }}</div> }
                  </article>
                }
              </div>
            } @else {
              <div class="empty"><div class="empty-icon">📋</div><div>Записей пока нет</div></div>
            }
          } @else {
            <div class="empty"><div class="empty-icon">📋</div><div>Карта загружается…</div></div>
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
      .hero-stats { display: flex; gap: var(--space-6); margin-left: auto; }
      .stat { text-align: right; }
      .stat-value { font-size: 28px; font-weight: 700; color: var(--brand-700); line-height: 1; }
      .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

      .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
      @media (max-width: 1024px) { .grid-2 { grid-template-columns: 1fr; } }

      .doctor-list { display: flex; flex-direction: column; gap: var(--space-3); }
      .doctor-row {
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }
      .doctor-meta { min-width: 0; flex: 1; }
      .doctor-name { font-weight: 500; }

      .doctor-info {
        display: flex; align-items: center; gap: var(--space-4);
        padding: var(--space-3);
        background: var(--surface-muted);
        border-radius: var(--radius);
      }

      .avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-400), var(--brand-700));
        color: #fff;
        display: grid; place-items: center;
        font-weight: 600; font-size: 13px;
        flex-shrink: 0;
      }
      .avatar-lg { width: 48px; height: 48px; font-size: 16px; }

      .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
        gap: var(--space-2);
      }
      .time-slot {
        height: 36px;
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--text-primary);
        font-size: 13px; font-weight: 500;
        transition: all var(--duration-fast) var(--ease);
      }
      .time-slot:hover:not(.disabled) { border-color: var(--brand-500); color: var(--brand-700); }
      .time-slot.selected { background: var(--brand-600); border-color: var(--brand-600); color: #fff; }
      .time-slot.disabled { background: var(--surface-sunken); color: var(--text-muted); border-color: var(--border); cursor: not-allowed; }

      .skeleton-list { display: flex; flex-direction: column; gap: var(--space-3); }
      .skeleton-row { height: 72px; border-radius: var(--radius); }

      .appt-list { display: flex; flex-direction: column; gap: var(--space-3); }
      .appt {
        display: grid;
        grid-template-columns: 80px 1fr auto;
        gap: var(--space-4);
        padding: var(--space-4);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        transition: border-color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease);
      }
      .appt:hover { border-color: var(--brand-300); background: var(--brand-50); }
      .appt-left { text-align: center; padding: var(--space-2); background: var(--surface-muted); border-radius: var(--radius-sm); align-self: start; }
      .appt-day { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
      .appt-time { font-size: 18px; font-weight: 600; color: var(--brand-700); margin-top: 2px; }
      .appt-body { min-width: 0; }
      .appt-title { font-weight: 600; font-size: 15px; }
      .appt-reason { color: var(--text-secondary); margin-top: 4px; font-size: 13px; }
      .appt-actions { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); }

      /* ── Медкарта ── */
      .vitals {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);
        margin-bottom: var(--space-4);
      }
      .vital {
        display: flex; flex-direction: column; gap: 2px;
        padding: var(--space-3); background: var(--surface-muted); border-radius: var(--radius);
      }
      .vital span { font-size: 12px; }
      .vital b { font-size: 16px; }
      .chips-block { margin-bottom: var(--space-4); }
      .chips-label { font-weight: 600; font-size: 13px; margin-bottom: var(--space-2); }
      .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
      .chip { padding: 2px 10px; border-radius: var(--radius-full); background: var(--surface-sunken); font-size: 12px; }
      .chip-danger { background: #fee2e2; color: #b91c1c; }
      .records { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-2); }
      .record { padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); }
      .record-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2); }
      .record-diag { font-weight: 600; }
      .record-row { font-size: 13px; margin-top: 2px; }
      .record-doc { font-size: 12px; margin-top: var(--space-2); text-align: right; }
    `,
  ],
})
export class PatientDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly familyDoctorService = inject(FamilyDoctorService);
  private readonly medicalCardService = inject(MedicalCardService);

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly labels = SPECIALIZATION_LABELS;
  protected readonly specs = SPECS;

  protected readonly user = this.auth.user;
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly therapists = signal<User[]>([]);
  protected readonly doctorsList = signal<User[]>([]);
  protected readonly availableSlots = signal<TimeSlot[]>([]);
  protected readonly familyDoctor = signal<User | null>(null);
  protected readonly myCard = signal<MedicalCard | null>(null);
  protected readonly loading = signal(true);
  protected readonly bookingLoading = signal(false);
  protected readonly bookingError = signal('');

  protected readonly greeting = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : 'Здравствуйте';
  });

  protected readonly upcomingCount = computed(
    () => this.appointments().filter((a) => a.status === AppointmentStatus.SCHEDULED).length,
  );
  protected readonly pastCount = computed(
    () => this.appointments().filter((a) => a.status === AppointmentStatus.COMPLETED).length,
  );

  protected readonly bookingForm = this.fb.nonNullable.group({
    specialization: ['', Validators.required],
    doctorId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  // true после ответа сервера по слотам — чтобы отличить «дата не выбрана» от «слотов нет»
  protected readonly slotsChecked = signal(false);

  protected readonly minDate = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.loadAppointments();
    this.loadTherapists();
    this.loadFamilyDoctor();
    this.loadCard();
  }

  protected sortedRecords(records: MedicalCard['records']) {
    return [...records].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  protected recordDoctor(r: MedicalCard['records'][number]): string {
    const d = r.doctorId;
    if (d && typeof d === 'object') {
      return `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim();
    }
    return '';
  }

  private loadCard(): void {
    this.medicalCardService.getMyCard().subscribe({
      next: (c) => this.myCard.set(c),
      error: () => this.myCard.set(null),
    });
  }

  protected initials(user: User | null | undefined): string {
    if (!user) return '·';
    return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || '·';
  }

  protected specLabel(spec?: string | null): string {
    return spec ? (SPECIALIZATION_LABELS[spec] ?? '') : '';
  }

  protected statusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'badge-warn';
      case AppointmentStatus.SCHEDULED:
        return 'badge-info';
      case AppointmentStatus.COMPLETED:
        return 'badge-success';
      case AppointmentStatus.CANCELLED:
        return 'badge-danger';
    }
  }

  protected onSpecChange(): void {
    const spec = this.bookingForm.controls.specialization.value;
    this.bookingForm.patchValue({ doctorId: '', date: '', time: '' });
    this.availableSlots.set([]);
    this.slotsChecked.set(false);
    if (!spec) {
      this.doctorsList.set([]);
      return;
    }
    this.userService.getDoctors(spec).subscribe({
      next: (list) => this.doctorsList.set(list),
      error: () => this.doctorsList.set([]),
    });
  }

  protected onDoctorChange(): void {
    this.bookingForm.patchValue({ date: '', time: '' });
    this.availableSlots.set([]);
    this.slotsChecked.set(false);
  }

  protected onDateChange(): void {
    const doctorId = this.bookingForm.controls.doctorId.value;
    const date = this.bookingForm.controls.date.value;
    this.bookingForm.patchValue({ time: '' });
    this.slotsChecked.set(false);
    if (!doctorId || !date) {
      this.availableSlots.set([]);
      return;
    }
    this.appointmentService.getAvailableSlots(doctorId, date).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.slotsChecked.set(true);
      },
      error: () => {
        this.availableSlots.set([]);
        this.slotsChecked.set(true);
      },
    });
  }

  protected pickTime(time: string): void {
    this.bookingForm.patchValue({ time });
  }

  protected book(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const value = this.bookingForm.getRawValue();
    const dateTime = `${value.date}T${value.time}:00`;

    this.bookingLoading.set(true);
    this.bookingError.set('');
    this.appointmentService
      .create({ doctorId: value.doctorId, dateTime, reason: value.reason })
      .subscribe({
        next: () => {
          this.bookingLoading.set(false);
          this.bookingForm.reset({
            specialization: '',
            doctorId: '',
            date: '',
            time: '',
            reason: '',
          });
          this.doctorsList.set([]);
          this.availableSlots.set([]);
          this.slotsChecked.set(false);
          this.loadAppointments();
        },
        error: (err) => {
          this.bookingLoading.set(false);
          this.bookingError.set(err?.error?.message ?? 'Не удалось записаться.');
        },
      });
  }

  protected cancel(id: string): void {
    if (!confirm('Отменить запись?')) return;
    this.appointmentService.cancel(id).subscribe({
      next: () => this.loadAppointments(),
    });
  }

  protected assign(doctorId: string): void {
    this.familyDoctorService.assign(doctorId).subscribe({
      next: () => this.loadFamilyDoctor(),
    });
  }

  protected terminate(): void {
    if (!confirm('Открепить семейного врача?')) return;
    this.familyDoctorService.terminate().subscribe({
      next: () => this.familyDoctor.set(null),
    });
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getPatientAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTherapists(): void {
    this.userService.getDoctors(DoctorSpecialization.THERAPIST).subscribe({
      next: (list) => this.therapists.set(list),
    });
  }

  private loadFamilyDoctor(): void {
    this.familyDoctorService.getMyDoctor().subscribe({
      next: (doc) => this.familyDoctor.set(doc),
      error: () => this.familyDoctor.set(null),
    });
  }
}
