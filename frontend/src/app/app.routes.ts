import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './guards/auth.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
        title: 'Вход — Medical CRM',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register.component').then((m) => m.RegisterComponent),
        title: 'Регистрация — Medical CRM',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        title: 'Восстановление пароля — Medical CRM',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        title: 'Сброс пароля — Medical CRM',
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: 'doctor',
        canMatch: [roleGuard(UserRole.DOCTOR)],
        loadComponent: () =>
          import('./pages/doctor-dashboard/doctor-dashboard.component').then(
            (m) => m.DoctorDashboardComponent,
          ),
        title: 'Кабинет врача',
      },
      {
        path: 'patient',
        canMatch: [roleGuard(UserRole.PATIENT)],
        loadComponent: () =>
          import('./pages/patient-dashboard/patient-dashboard.component').then(
            (m) => m.PatientDashboardComponent,
          ),
        title: 'Личный кабинет',
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
