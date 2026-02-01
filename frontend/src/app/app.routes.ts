import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './components/patient-dashboard/patient-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ForgotPasswordComponent },
  {
    path: 'doctor',
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'doctor' }
  },
  {
    path: 'patient',
    component: PatientDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'patient' }
  },
  { path: '**', redirectTo: '/login' }
];
