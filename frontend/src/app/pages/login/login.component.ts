import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-card">
      <header class="auth-header">
        <h1>Вход в систему</h1>
        <p class="muted">Введите email и пароль для доступа к кабинету.</p>
      </header>

      <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label class="field-label" for="email">Email</label>
          <input
            id="email"
            class="input"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            formControlName="email"
            [class.is-invalid]="invalid('email')"
          />
          @if (invalid('email')) {
            <div class="field-error">Введите корректный email</div>
          }
        </div>

        <div class="field">
          <label class="field-label" for="password">Пароль</label>
          <input
            id="password"
            class="input"
            [type]="showPassword() ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Минимум 6 символов"
            formControlName="password"
            [class.is-invalid]="invalid('password')"
          />
          <button
            type="button"
            class="btn btn-ghost btn-sm reveal"
            (click)="togglePassword()"
          >
            {{ showPassword() ? 'Скрыть пароль' : 'Показать пароль' }}
          </button>
          @if (invalid('password')) {
            <div class="field-error">Введите пароль</div>
          }
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        <button
          type="submit"
          class="btn btn-primary btn-lg btn-block"
          [disabled]="form.invalid || loading()"
        >
          {{ loading() ? 'Входим…' : 'Войти' }}
        </button>

        <div class="auth-actions">
          <a routerLink="/forgot-password">Забыли пароль?</a>
          <a routerLink="/register">Создать аккаунт</a>
        </div>
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
        max-width: 440px;
        padding: var(--space-8);
      }
      .auth-header { margin-bottom: var(--space-6); }
      .auth-header h1 { font-size: 24px; margin-bottom: 6px; }
      .auth-actions {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: var(--space-2);
        font-size: 13px;
      }
      .reveal { align-self: flex-end; padding: 0 4px; height: 24px; }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected invalid(name: 'email' | 'password'): boolean {
    const ctrl = this.form.controls[name];
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        const target = this.auth.role() === UserRole.DOCTOR ? '/doctor' : '/patient';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Не удалось войти. Проверьте данные.');
      },
    });
  }
}
