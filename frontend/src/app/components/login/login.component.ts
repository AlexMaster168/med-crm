import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {UserRole} from "../../models/user.model";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
        <div class="login-container">
            <div class="login-card">
                <h1>Вход в Medical CRM</h1>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                    <div class="form-group">
                        <label>Email</label>
                        <input
                                type="email"
                                formControlName="email"
                                class="form-control"
                                placeholder="example@email.com">
                        <div class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                            Введите корректный email
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Пароль</label>
                        <input
                                type="password"
                                formControlName="password"
                                class="form-control"
                                placeholder="Введите пароль">
                        <div class="error"
                             *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                            Введите пароль
                        </div>
                    </div>

                    <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

                    <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || loading">
                        {{ loading ? 'Вход...' : 'Войти' }}
                    </button>

                    <div class="links">
                        <a routerLink="/forgot-password">Забыли пароль?</a>
                        <a routerLink="/register">Регистрация</a>
                    </div>
                </form>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }

        .login-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            max-width: 450px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 28px;
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

        .error {
            color: #e74c3c;
            font-size: 13px;
            margin-top: 5px;
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
            display: flex;
            justify-content: space-between;
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
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            this.errorMessage = '';
            const {email, password} = this.loginForm.value;
            this.authService.login(email, password).subscribe({
                next: (response) => {
                    const role = response.user?.role || response.role;
                    this.loading = false;
                    if (role === UserRole.DOCTOR) {
                        this.router.navigate(['/doctor']);
                    } else {
                        this.router.navigate(['/patient']);
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.errorMessage = error.error?.message || 'Ошибка входа';
                }
            });
        }
    }
}
