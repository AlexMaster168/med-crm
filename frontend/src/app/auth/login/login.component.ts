import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.user.role === UserRole.DOCTOR) {
          this.router.navigate(['/doctor/appointments']);
        } else {
          this.router.navigate(['/patient/appointments']);
        }
      },
      error: (err) => {
        this.error = err.error.message || 'Ошибка входа';
      }
    });
  }
}