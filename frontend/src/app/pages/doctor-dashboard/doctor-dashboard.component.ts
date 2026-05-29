import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { FamilyDoctorService } from '../../services/family-doctor.service';
import { DoctorScheduleService } from '../../services/doctor-schedule.service';
import { MedicalCardService } from '../../services/medical-card.service';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
} from '../../models/appointment.model';
import { WEEKDAY_LABELS } from '../../models/doctor-schedule.model';
import { MedicalCard } from '../../models/medical-card.model';
import { SPECIALIZATION_LABELS, User } from '../../models/user.model';

type Tab = 'requests' | 'today' | 'upcoming' | 'patients' | 'schedule';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [DatePipe, ReactiveFormsModule],
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
            <div class="stat-value">{{ requests().length }}</div>
            <div class="stat-label">Заявок</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ todayCount() }}</div>
            <div class="stat-label">Приёмов сегодня</div>
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
            @if (t.value !== 'schedule') {
              <span class="tab-count">{{ countFor(t.value) }}</span>
            }
          </button>
        }
      </div>

      <section class="card">
        <div class="card-body">
          @if (loading()) {
            <div class="skeleton-list">
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row"></div>
            </div>
          } @else {
            @switch (tab()) {
              @case ('requests') {
                @if (requests().length) {
                  <div class="appt-list">
                    @for (a of requests(); track a._id) {
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
                              <div class="muted">{{ a.patientId.phone || a.patientId.email }}</div>
                            </div>
                          </div>
                          @if (a.reason) {
                            <div class="appt-reason">{{ a.reason }}</div>
                          }
                        </div>
                        <div class="appt-actions">
                          <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            [disabled]="busy() === a._id"
                            (click)="confirm(a._id)"
                          >
                            Подтвердить
                          </button>
                          <button
                            type="button"
                            class="btn btn-ghost btn-sm"
                            [disabled]="busy() === a._id"
                            (click)="reject(a._id)"
                          >
                            Отклонить
                          </button>
                        </div>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty">
                    <div class="empty-icon">✅</div>
                    <div>Новых заявок нет</div>
                  </div>
                }
              }

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
                          @if (a.status === AppointmentStatus.SCHEDULED) {
                            <button type="button" class="btn btn-secondary btn-sm" (click)="openComplete(a)">
                              Завершить приём
                            </button>
                          }
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
                          @if (a.status === AppointmentStatus.SCHEDULED) {
                            <button type="button" class="btn btn-secondary btn-sm" (click)="openComplete(a)">
                              Завершить приём
                            </button>
                          }
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
                      <article class="patient-card" (click)="openCard(p)">
                        <div class="avatar avatar-lg">{{ initials(p) }}</div>
                        <div class="patient-meta">
                          <div class="patient-name">{{ p.firstName }} {{ p.lastName }}</div>
                          <div class="muted">{{ p.email }}</div>
                          @if (p.phone) {
                            <div class="muted">{{ p.phone }}</div>
                          }
                        </div>
                        <button type="button" class="btn btn-ghost btn-sm">Карта →</button>
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

              @case ('schedule') {
                <form class="schedule-form" [formGroup]="scheduleForm" (ngSubmit)="saveSchedule()">
                  <div class="sched-section">
                    <div class="sched-title">Рабочие дни и часы</div>
                    <div class="days" formArrayName="workingDays">
                      @for (ctrl of workingDays.controls; track $index) {
                        <div class="day-row" [formGroupName]="$index">
                          <label class="day-toggle">
                            <input type="checkbox" formControlName="enabled" />
                            <span>{{ weekdayLabels[$index] }}</span>
                          </label>
                          <div class="day-times" [class.dim]="!ctrl.value.enabled">
                            <input type="time" class="input input-sm" formControlName="start" />
                            <span class="dash">—</span>
                            <input type="time" class="input input-sm" formControlName="end" />
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="sched-grid">
                    <div class="field">
                      <label class="field-label">Длительность приёма (мин)</label>
                      <input type="number" class="input" formControlName="slotDurationMin" min="5" max="240" />
                    </div>
                    <div class="field">
                      <label class="field-label">Перерыв с</label>
                      <input type="time" class="input" formControlName="breakStart" />
                    </div>
                    <div class="field">
                      <label class="field-label">Перерыв до</label>
                      <input type="time" class="input" formControlName="breakEnd" />
                    </div>
                  </div>

                  <div class="sched-section">
                    <div class="sched-title">Правила записи</div>
                    <div class="sched-grid">
                      <div class="field">
                        <label class="field-label">Горизонт записи (дней)</label>
                        <input type="number" class="input" formControlName="bookingHorizonDays" min="1" max="365" />
                      </div>
                      <div class="field">
                        <label class="field-label">Мин. за сколько часов</label>
                        <input type="number" class="input" formControlName="minLeadTimeHours" min="0" max="168" />
                      </div>
                      <div class="field">
                        <label class="field-label">Активных записей на пациента</label>
                        <input type="number" class="input" formControlName="maxActivePerPatient" min="1" max="20" />
                      </div>
                    </div>
                    <label class="checkbox-row">
                      <input type="checkbox" formControlName="requiresConfirmation" />
                      <span>Требовать моего подтверждения для каждой записи</span>
                    </label>
                  </div>

                  <div class="field">
                    <label class="field-label">Выходные / отпуск (даты YYYY-MM-DD, по одной в строке)</label>
                    <textarea class="textarea" rows="3" formControlName="daysOffText"
                      placeholder="2026-06-12&#10;2026-06-13"></textarea>
                  </div>

                  @if (scheduleMsg()) {
                    <div class="alert" [class.alert-success]="scheduleOk()" [class.alert-error]="!scheduleOk()">
                      {{ scheduleMsg() }}
                    </div>
                  }

                  <button type="submit" class="btn btn-primary" [disabled]="scheduleSaving()">
                    {{ scheduleSaving() ? 'Сохраняем…' : 'Сохранить график' }}
                  </button>
                </form>
              }
            }
          }
        </div>
      </section>

      @if (completingAppt(); as a) {
        <div class="modal-overlay" (click)="closeComplete()">
          <div class="modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <div class="modal-title">Завершение приёма</div>
                <div class="muted">
                  {{ a.patientId.firstName }} {{ a.patientId.lastName }} ·
                  {{ a.dateTime | date: 'dd MMM, HH:mm' }}
                </div>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" (click)="closeComplete()">✕</button>
            </header>

            <form class="stack" [formGroup]="completeForm" (ngSubmit)="submitComplete()">
              <div class="field">
                <label class="field-label">Симптомы / жалобы *</label>
                <textarea class="textarea" rows="2" formControlName="symptoms"></textarea>
              </div>
              <div class="field">
                <label class="field-label">Диагноз *</label>
                <textarea class="textarea" rows="2" formControlName="diagnosis"></textarea>
              </div>
              <div class="field">
                <label class="field-label">Назначенное лечение</label>
                <textarea class="textarea" rows="2" formControlName="treatment"></textarea>
              </div>
              <div class="field">
                <label class="field-label">Заметки</label>
                <textarea class="textarea" rows="2" formControlName="notes"></textarea>
              </div>

              @if (completeError()) {
                <div class="alert alert-error">{{ completeError() }}</div>
              }

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" (click)="closeComplete()">Отмена</button>
                <button type="submit" class="btn btn-primary" [disabled]="completeForm.invalid || completeSaving()">
                  {{ completeSaving() ? 'Сохраняем…' : 'Завершить и записать в карту' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (cardPatient(); as p) {
        <div class="modal-overlay" (click)="closeCard()">
          <div class="modal modal-wide" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <div class="modal-title">{{ p.firstName }} {{ p.lastName }}</div>
                <div class="muted">{{ p.email }}{{ p.phone ? ' · ' + p.phone : '' }}</div>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" (click)="closeCard()">✕</button>
            </header>

            @if (cardLoading()) {
              <div class="skeleton skeleton-row"></div>
            } @else {
              @if (card(); as c) {
              <div class="card-vitals">
                <div class="vital"><span class="muted">Группа крови</span><b>{{ c.bloodType || '—' }}</b></div>
                <div class="vital"><span class="muted">Рост</span><b>{{ c.height ? c.height + ' см' : '—' }}</b></div>
                <div class="vital"><span class="muted">Вес</span><b>{{ c.weight ? c.weight + ' кг' : '—' }}</b></div>
              </div>

              <div class="chips-block">
                <div class="chips-label">Аллергии</div>
                @if (c.allergies?.length) {
                  <div class="chips">
                    @for (a of c.allergies; track a) { <span class="chip chip-danger">{{ a }}</span> }
                  </div>
                } @else { <span class="muted">нет</span> }
              </div>

              <div class="chips-block">
                <div class="chips-label">Хронические заболевания</div>
                @if (c.chronicDiseases?.length) {
                  <div class="chips">
                    @for (d of c.chronicDiseases; track d) { <span class="chip">{{ d }}</span> }
                  </div>
                } @else { <span class="muted">нет</span> }
              </div>

              <div class="records-block">
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
                        @if (r.notes) {
                          <div class="record-row"><span class="muted">Заметки:</span> {{ r.notes }}</div>
                        }
                        @if (recordDoctor(r); as rd) {
                          <div class="record-doc muted">— {{ rd }}</div>
                        }
                      </article>
                    }
                  </div>
                } @else {
                  <div class="empty"><div class="empty-icon">📋</div><div>Записей в карте пока нет</div></div>
                }
              </div>
              } @else if (cardError()) {
                <div class="alert alert-error">{{ cardError() }}</div>
              }
            }
          </div>
        </div>
      }
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

      .row { display: flex; align-items: center; gap: var(--space-3); }
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
      .patient-card { cursor: pointer; }
      .patient-card:hover { border-color: var(--brand-300); background: var(--brand-50); }
      .patient-meta { min-width: 0; flex: 1; }
      .patient-name { font-weight: 600; }

      /* ── График ── */
      .schedule-form { display: flex; flex-direction: column; gap: var(--space-5); max-width: 720px; }
      .sched-section { display: flex; flex-direction: column; gap: var(--space-3); }
      .sched-title { font-weight: 600; font-size: 14px; color: var(--text-primary); }
      .days { display: flex; flex-direction: column; gap: var(--space-2); }
      .day-row {
        display: flex; align-items: center; justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }
      .day-toggle { display: flex; align-items: center; gap: var(--space-2); font-weight: 500; cursor: pointer; }
      .day-times { display: flex; align-items: center; gap: var(--space-2); transition: opacity var(--duration-fast) var(--ease); }
      .day-times.dim { opacity: 0.4; }
      .dash { color: var(--text-muted); }
      .input-sm { height: 34px; width: 120px; }
      .sched-grid {
        display: grid; gap: var(--space-3);
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .checkbox-row { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: 14px; }

      /* ── Модалка завершения ── */
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(15, 23, 42, 0.45);
        display: grid; place-items: center;
        padding: var(--space-4);
      }
      .modal {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        box-shadow: var(--shadow-lg, 0 20px 50px rgba(0,0,0,0.25));
        width: 100%; max-width: 520px;
        max-height: 90vh; overflow-y: auto;
        padding: var(--space-5);
      }
      .modal-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: var(--space-4); margin-bottom: var(--space-4);
      }
      .modal-title { font-size: 18px; font-weight: 700; }
      .stack { display: flex; flex-direction: column; gap: var(--space-3); }
      .modal-actions {
        display: flex; justify-content: flex-end; gap: var(--space-2);
        margin-top: var(--space-2);
      }
      .modal-wide { max-width: 640px; }

      /* ── Карта пациента ── */
      .card-vitals {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);
        margin-bottom: var(--space-4);
      }
      .vital {
        display: flex; flex-direction: column; gap: 2px;
        padding: var(--space-3);
        background: var(--surface-muted);
        border-radius: var(--radius);
      }
      .vital span { font-size: 12px; }
      .vital b { font-size: 16px; }
      .chips-block { margin-bottom: var(--space-4); }
      .chips-label { font-weight: 600; font-size: 13px; margin-bottom: var(--space-2); }
      .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
      .chip {
        padding: 2px 10px; border-radius: var(--radius-full);
        background: var(--surface-sunken); font-size: 12px;
      }
      .chip-danger { background: #fee2e2; color: #b91c1c; }
      .records { display: flex; flex-direction: column; gap: var(--space-3); }
      .record {
        padding: var(--space-3);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }
      .record-head {
        display: flex; justify-content: space-between; align-items: baseline;
        margin-bottom: var(--space-2);
      }
      .record-diag { font-weight: 600; }
      .record-row { font-size: 13px; margin-top: 2px; }
      .record-doc { font-size: 12px; margin-top: var(--space-2); text-align: right; }
    `,
  ],
})
export class DoctorDashboardComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly auth = inject(AuthService);
  private readonly familyDoctorService = inject(FamilyDoctorService);
  private readonly scheduleService = inject(DoctorScheduleService);
  private readonly medicalCardService = inject(MedicalCardService);
  private readonly fb = inject(FormBuilder);

  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly user = this.auth.user;
  protected readonly loading = signal(true);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly patients = signal<User[]>([]);
  protected readonly tab = signal<Tab>('requests');
  protected readonly busy = signal<string | null>(null);

  // Завершение приёма
  protected readonly completingAppt = signal<Appointment | null>(null);
  protected readonly completeSaving = signal(false);
  protected readonly completeError = signal('');
  protected readonly completeForm = this.fb.nonNullable.group({
    symptoms: ['', [Validators.required, Validators.maxLength(2000)]],
    diagnosis: ['', [Validators.required, Validators.maxLength(2000)]],
    treatment: ['', Validators.maxLength(2000)],
    notes: ['', Validators.maxLength(2000)],
  });

  // Карта пациента
  protected readonly cardPatient = signal<User | null>(null);
  protected readonly card = signal<MedicalCard | null>(null);
  protected readonly cardLoading = signal(false);
  protected readonly cardError = signal('');

  protected readonly scheduleSaving = signal(false);
  protected readonly scheduleMsg = signal('');
  protected readonly scheduleOk = signal(false);

  protected readonly tabs: { value: Tab; label: string }[] = [
    { value: 'requests', label: 'Заявки' },
    { value: 'today', label: 'Сегодня' },
    { value: 'upcoming', label: 'Предстоящие' },
    { value: 'patients', label: 'Пациенты' },
    { value: 'schedule', label: 'График' },
  ];

  protected readonly scheduleForm = this.fb.nonNullable.group({
    workingDays: this.fb.array(
      Array.from({ length: 7 }, () =>
        this.fb.nonNullable.group({
          enabled: [false],
          start: ['09:00'],
          end: ['17:00'],
        }),
      ),
    ),
    slotDurationMin: [30],
    breakStart: [''],
    breakEnd: [''],
    daysOffText: [''],
    bookingHorizonDays: [30],
    minLeadTimeHours: [2],
    maxActivePerPatient: [1],
    requiresConfirmation: [true],
  });

  protected get workingDays(): FormArray {
    return this.scheduleForm.get('workingDays') as FormArray;
  }

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

  protected readonly requests = computed(() =>
    this.appointments()
      .filter((a) => a.status === AppointmentStatus.PENDING)
      .sort((a, b) => +new Date(a.dateTime) - +new Date(b.dateTime)),
  );

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
    this.loadSchedule();
  }

  protected countFor(t: Tab): number {
    switch (t) {
      case 'requests':
        return this.requests().length;
      case 'today':
        return this.todayCount();
      case 'upcoming':
        return this.upcoming().length;
      case 'patients':
        return this.patients().length;
      default:
        return 0;
    }
  }

  protected initials(user: User | null | undefined): string {
    if (!user) return '·';
    return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || '·';
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

  protected confirm(id: string): void {
    this.busy.set(id);
    this.appointmentService.confirm(id).subscribe({
      next: () => {
        this.busy.set(null);
        this.loadAppointments();
      },
      error: () => this.busy.set(null),
    });
  }

  protected reject(id: string): void {
    if (!confirm('Отклонить заявку?')) return;
    this.busy.set(id);
    this.appointmentService.reject(id).subscribe({
      next: () => {
        this.busy.set(null);
        this.loadAppointments();
      },
      error: () => this.busy.set(null),
    });
  }

  protected openComplete(a: Appointment): void {
    this.completeError.set('');
    this.completeForm.reset({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
    this.completingAppt.set(a);
  }

  protected closeComplete(): void {
    this.completingAppt.set(null);
  }

  protected submitComplete(): void {
    const appt = this.completingAppt();
    if (!appt || this.completeForm.invalid) {
      this.completeForm.markAllAsTouched();
      return;
    }
    const v = this.completeForm.getRawValue();
    this.completeSaving.set(true);
    this.completeError.set('');
    this.appointmentService
      .complete(appt._id, {
        symptoms: v.symptoms,
        diagnosis: v.diagnosis,
        treatment: v.treatment || undefined,
        notes: v.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.completeSaving.set(false);
          this.completingAppt.set(null);
          this.loadAppointments();
        },
        error: (err) => {
          this.completeSaving.set(false);
          this.completeError.set(err?.error?.message ?? 'Не удалось завершить приём');
        },
      });
  }

  protected openCard(p: User): void {
    this.cardPatient.set(p);
    this.card.set(null);
    this.cardError.set('');
    this.cardLoading.set(true);
    this.medicalCardService.getPatientCard(p.id).subscribe({
      next: (c) => {
        this.card.set(c);
        this.cardLoading.set(false);
      },
      error: (err) => {
        this.cardLoading.set(false);
        this.cardError.set(err?.error?.message ?? 'Не удалось загрузить карту');
      },
    });
  }

  protected closeCard(): void {
    this.cardPatient.set(null);
    this.card.set(null);
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

  protected saveSchedule(): void {
    this.scheduleSaving.set(true);
    this.scheduleMsg.set('');
    const v = this.scheduleForm.getRawValue();
    const daysOff = (v.daysOffText ?? '')
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));

    this.scheduleService
      .updateMySchedule({
        workingDays: v.workingDays,
        slotDurationMin: Number(v.slotDurationMin),
        breakStart: v.breakStart || undefined,
        breakEnd: v.breakEnd || undefined,
        daysOff,
        bookingHorizonDays: Number(v.bookingHorizonDays),
        minLeadTimeHours: Number(v.minLeadTimeHours),
        maxActivePerPatient: Number(v.maxActivePerPatient),
        requiresConfirmation: v.requiresConfirmation,
      })
      .subscribe({
        next: () => {
          this.scheduleSaving.set(false);
          this.scheduleOk.set(true);
          this.scheduleMsg.set('График сохранён');
        },
        error: (err) => {
          this.scheduleSaving.set(false);
          this.scheduleOk.set(false);
          this.scheduleMsg.set(err?.error?.message ?? 'Не удалось сохранить график');
        },
      });
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
    // «Мои пациенты» = семейные ∪ те, к кому есть приём (совпадает с правом доступа к карте)
    forkJoin({
      family: this.familyDoctorService.getMyPatients(),
      byAppointments: this.appointmentService.getMyPatients(),
    }).subscribe({
      next: ({ family, byAppointments }) => {
        const byId = new Map<string, User>();
        for (const p of [...family, ...byAppointments]) {
          if (p?.id) byId.set(p.id, p);
        }
        this.patients.set([...byId.values()]);
      },
      error: () => this.patients.set([]),
    });
  }

  private loadSchedule(): void {
    this.scheduleService.getMySchedule().subscribe({
      next: (s) => {
        this.workingDays.clear();
        for (const d of s.workingDays) {
          this.workingDays.push(
            this.fb.nonNullable.group({
              enabled: [d.enabled],
              start: [d.start],
              end: [d.end],
            }),
          );
        }
        this.scheduleForm.patchValue({
          slotDurationMin: s.slotDurationMin,
          breakStart: s.breakStart ?? '',
          breakEnd: s.breakEnd ?? '',
          daysOffText: (s.daysOff ?? []).join('\n'),
          bookingHorizonDays: s.bookingHorizonDays,
          minLeadTimeHours: s.minLeadTimeHours,
          maxActivePerPatient: s.maxActivePerPatient,
          requiresConfirmation: s.requiresConfirmation,
        });
      },
    });
  }
}
