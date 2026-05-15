import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import {
  DoctorSpecialization,
  SPECIALIZATION_LABELS,
  UserRole,
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
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-card">
      <header class="auth-header">
        <h1>Создание аккаунта</h1>
        <p class="muted">Зарегистрируйтесь как пациент или врач — это займёт меньше минуты.</p>
      </header>

      <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="role-switch" role="tablist">
          @for (option of roleOptions; track option.value) {
            <button
              type="button"
              class="role-option"
              role="tab"
              [class.active]="form.controls.role.value === option.value"
              [attr.aria-selected]="form.controls.role.value === option.value"
              (click)="setRole(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label" for="firstName">Имя</label>
            <input id="firstName" class="input" formControlName="firstName" autocomplete="given-name" />
          </div>
          <div class="field">
            <label class="field-label" for="lastName">Фамилия</label>
            <input id="lastName" class="input" formControlName="lastName" autocomplete="family-name" />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="r-email">Email</label>
          <input id="r-email" class="input" type="email" formControlName="email" autocomplete="email" />
        </div>

        <div class="field">
          <label class="field-label" for="r-password">Пароль</label>
          <input
            id="r-password"
            class="input"
            type="password"
            formControlName="password"
            autocomplete="new-password"
            placeholder="Минимум 6 символов"
          />
        </div>

        <div class="field">
          <label class="field-label" for="phone">Телефон</label>
          <input id="phone" class="input" type="tel" formControlName="phone" autocomplete="tel" placeholder="+7…" />
        </div>

        @if (form.controls.role.value === UserRole.DOCTOR) {
          <div class="field">
            <label class="field-label" for="spec">Специализация</label>
            <select id="spec" class="select" formControlName="specialization">
              <option value="">Выберите специализацию</option>
              @for (s of specializations; track s) {
                <option [value]="s">{{ labels[s] }}</option>
              }
            </select>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        <button
          type="submit"
          class="btn btn-primary btn-lg btn-block"
          [disabled]="form.invalid || loading()"
        >
          {{ loading() ? 'Создаём аккаунт…' : 'Зарегистрироваться' }}
        </button>

        <p class="muted small-center">
          Уже есть аккаунт? <a routerLink="/login">Войти</a>
        </p>
      </form>
    </div>
  `,
  styles: [
    `
      .auth-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 560px;
        padding: var(--space-8);
      }
      .auth-header { margin-bottom: var(--space-6); }
      .auth-header h1 { font-size: 24px; margin-bottom: 6px; }

      .role-switch {
        display: grid; grid-template-columns: repeat(2, 1fr);
        background: var(--surface-sunken);
        padding: 4px;
        border-radius: var(--radius);
        gap: 4px;
      }
      .role-option {
        height: 36px;
        border-radius: 8px;
        font-size: 13px; font-weight: 500;
        color: var(--text-secondary);
        transition: background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
      }
      .role-option:hover { color: var(--text-primary); }
      .role-option.active {
        background: var(--surface);
        color: var(--text-primary);
        box-shadow: var(--shadow-xs);
      }

      .small-center { text-align: center; font-size: 13px; }
    `,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly UserRole = UserRole;
  protected readonly specializations = SPECS;
  protected readonly labels = SPECIALIZATION_LABELS;

  protected readonly roleOptions = [
    { value: UserRole.PATIENT, label: 'Я пациент' },
    { value: UserRole.DOCTOR, label: 'Я врач' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    role: [UserRole.PATIENT, Validators.required],
    specialization: [''],
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected setRole(role: UserRole): void {
    this.form.controls.role.setValue(role);
    const spec = this.form.controls.specialization;
    if (role === UserRole.DOCTOR) {
      spec.setValidators(Validators.required);
    } else {
      spec.clearValidators();
      spec.setValue('');
    }
    spec.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password,
      phone: value.phone,
      role: value.role,
    };
    if (value.role === UserRole.DOCTOR) {
      payload['specialization'] = value.specialization;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        const target = this.auth.role() === UserRole.DOCTOR ? '/doctor' : '/patient';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Не удалось зарегистрироваться.');
      },
    });
  }
}
