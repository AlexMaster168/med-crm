import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-card">
      <header class="auth-header">
        <h1>{{ isResetMode() ? 'Новый пароль' : 'Восстановление пароля' }}</h1>
        <p class="muted">
          {{
            isResetMode()
              ? 'Задайте новый пароль для входа.'
              : 'Мы отправим ссылку для сброса на ваш email.'
          }}
        </p>
      </header>

      @if (!isResetMode()) {
        <form class="stack" [formGroup]="forgotForm" (ngSubmit)="onForgot()" novalidate>
          <div class="field">
            <label class="field-label" for="fp-email">Email</label>
            <input
              id="fp-email"
              class="input"
              type="email"
              autocomplete="email"
              formControlName="email"
            />
          </div>

          @if (success()) {
            <div class="alert alert-success">{{ success() }}</div>
          }
          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <button
            type="submit"
            class="btn btn-primary btn-lg btn-block"
            [disabled]="forgotForm.invalid || loading()"
          >
            {{ loading() ? 'Отправляем…' : 'Отправить ссылку' }}
          </button>

          <p class="muted small-center">
            <a routerLink="/login">Вернуться к входу</a>
          </p>
        </form>
      } @else {
        <form class="stack" [formGroup]="resetForm" (ngSubmit)="onReset()" novalidate>
          <div class="field">
            <label class="field-label" for="newpw">Новый пароль</label>
            <input
              id="newpw"
              class="input"
              type="password"
              autocomplete="new-password"
              formControlName="newPassword"
              placeholder="Минимум 6 символов"
            />
          </div>

          @if (success()) {
            <div class="alert alert-success">{{ success() }}</div>
          }
          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <button
            type="submit"
            class="btn btn-primary btn-lg btn-block"
            [disabled]="resetForm.invalid || loading()"
          >
            {{ loading() ? 'Сохраняем…' : 'Сохранить пароль' }}
          </button>
        </form>
      }
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
      .small-center { text-align: center; font-size: 13px; }
    `,
  ],
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly isResetMode = signal(false);

  private resetToken = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.isResetMode.set(true);
        this.resetToken = token;
      }
    });
  }

  protected onForgot(): void {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.forgotPassword(this.forgotForm.controls.email.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Ссылка для сброса пароля отправлена на ваш email.');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Не удалось отправить ссылку.');
      },
    });
  }

  protected onReset(): void {
    if (this.resetForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.resetPassword(this.resetToken, this.resetForm.controls.newPassword.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Пароль успешно изменён. Перенаправляем на вход…');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Не удалось сбросить пароль.');
      },
    });
  }
}
