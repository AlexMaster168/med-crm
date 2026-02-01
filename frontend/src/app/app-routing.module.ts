import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PatientAppointmentsComponent } from './patient/appointments/appointments.component';
import { DoctorsListComponent } from './patient/doctors/doctors.component';
import { MedicalCardComponent } from './patient/medical-card/medical-card.component';
import { FamilyDoctorComponent } from './patient/family-doctor/family-doctor.component';
import { DoctorAppointmentsComponent } from './doctor/appointments/appointments.component';
import { PatientCardComponent } from './doctor/patient-card/patient-card.component';
import { PatientsListComponent } from './doctor/patients/patients.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.PATIENT },
    children: [
      { path: 'appointments', component: PatientAppointmentsComponent },
      { path: 'doctors', component: DoctorsListComponent },
      { path: 'medical-card', component: MedicalCardComponent },
      { path: 'family-doctor', component: FamilyDoctorComponent },
    ]
  },
  {
    path: 'doctor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.DOCTOR },
    children: [
      { path: 'appointments', component: DoctorAppointmentsComponent },
      { path: 'patients', component: PatientsListComponent },
      { path: 'patient/:id', component: PatientCardComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
