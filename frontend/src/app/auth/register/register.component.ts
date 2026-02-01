import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole, DoctorSpecialization } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.PATIENT,
    specialization: DoctorSpecialization.THERAPIST,
    phone: ''
  };
  
  UserRole = UserRole;
  DoctorSpecialization = DoctorSpecialization;
  specializations = Object.values(DoctorSpecialization);
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    const data = { ...this.formData };
    if (data.role === UserRole.PATIENT) {
      delete data.specialization;
    }

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error.message || 'Ошибка регистрации';
      }
    });
  }
}