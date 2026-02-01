import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-container">
      <div class="forgot-card">
        <h1>{{ isResetMode ? 'Новый пароль' : 'Восстановление пароля' }}</h1>
        
        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!isResetMode">
          <p class="description">Введите ваш email для получения ссылки восстановления</p>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control">
          </div>

          <div class="success" *ngIf="successMessage">{{ successMessage }}</div>
          <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="btn-primary" [disabled]="forgotForm.invalid || loading">
            {{ loading ? 'Отправка...' : 'Отправить' }}
          </button>

          <div class="links">
            <a routerLink="/login">Вернуться к входу</a>
          </div>
        </form>

        <form [formGroup]="resetForm" (ngSubmit)="onResetSubmit()" *ngIf="isResetMode">
          <p class="description">Введите новый пароль</p>
          
          <div class="form-group">
            <label>Новый пароль</label>
            <input type="password" formControlName="newPassword" class="form-control">
          </div>

          <div class="success" *ngIf="successMessage">{{ successMessage }}</div>
          <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="btn-primary" [disabled]="resetForm.invalid || loading">
            {{ loading ? 'Сохранение...' : 'Сохранить пароль' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 450px;
      width: 100%;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
      font-size: 28px;
    }

    .description {
      color: #666;
      margin-bottom: 25px;
      text-align: center;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .success {
      color: #27ae60;
      font-size: 13px;
      margin-bottom: 15px;
      text-align: center;
    }

    .error {
      color: #e74c3c;
      font-size: 13px;
      margin-bottom: 15px;
      text-align: center;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-top: 10px;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .links {
      margin-top: 20px;
      text-align: center;
    }

    .links a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  resetForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  isResetMode = false;
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.isResetMode = true;
        this.resetToken = params['token'];
      }
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Ссылка для сброса пароля отправлена на ваш email';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Ошибка отправки';
        }
      });
    }
  }

  onResetSubmit(): void {
    if (this.resetForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.resetPassword(this.resetToken, this.resetForm.value.newPassword).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Пароль успешно изменен';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Ошибка сброса пароля';
        }
      });
    }
  }
}
