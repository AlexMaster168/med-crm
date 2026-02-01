import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>Регистрация</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Имя</label>
              <input type="text" formControlName="firstName" class="form-control">
            </div>
            <div class="form-group">
              <label>Фамилия</label>
              <input type="text" formControlName="lastName" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control">
          </div>

          <div class="form-group">
            <label>Пароль</label>
            <input type="password" formControlName="password" class="form-control">
          </div>

          <div class="form-group">
            <label>Роль</label>
            <select formControlName="role" class="form-control" (change)="onRoleChange()">
              <option value="patient">Пациент</option>
              <option value="doctor">Врач</option>
            </select>
          </div>

          <div class="form-group" *ngIf="registerForm.get('role')?.value === 'doctor'">
            <label>Специализация</label>
            <select formControlName="specialty" class="form-control">
              <option value="">Выберите специализацию</option>
              <option value="therapist">Терапевт</option>
              <option value="surgeon">Хирург</option>
              <option value="cardiologist">Кардиолог</option>
              <option value="neurologist">Невролог</option>
              <option value="dermatologist">Дерматолог</option>
              <option value="pediatrician">Педиатр</option>
              <option value="ophthalmologist">Офтальмолог</option>
              <option value="psychiatrist">Психиатр</option>
            </select>
          </div>

          <div class="form-group">
            <label>Телефон</label>
            <input type="tel" formControlName="phone" class="form-control">
          </div>

          <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>

          <div class="links">
            <a routerLink="/login">Уже есть аккаунт? Войти</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
      font-size: 28px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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

    select.form-control {
      cursor: pointer;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
      specialty: [''],
      phone: ['']
    });
  }

  onRoleChange(): void {
    const role = this.registerForm.get('role')?.value;
    const specialtyControl = this.registerForm.get('specialty');

    if (role === 'doctor') {
      specialtyControl?.setValidators([Validators.required]);
    } else {
      specialtyControl?.clearValidators();
      specialtyControl?.setValue('');
    }
    specialtyControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = { ...this.registerForm.value };
      if (formData.role === 'patient') {
        delete formData.specialty;
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.user.role === 'doctor') {
            this.router.navigate(['/doctor']);
          } else {
            this.router.navigate(['/patient']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Ошибка регистрации';
        }
      });
    }
  }
}
