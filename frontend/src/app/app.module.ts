import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { PatientAppointmentsComponent } from './patient/appointments/appointments.component';
import { DoctorsListComponent } from './patient/doctors/doctors.component';
import { MedicalCardComponent } from './patient/medical-card/medical-card.component';
import { FamilyDoctorComponent } from './patient/family-doctor/family-doctor.component';

import { DoctorAppointmentsComponent } from './doctor/appointments/appointments.component';
import { PatientCardComponent } from './doctor/patient-card/patient-card.component';
import { PatientsListComponent } from './doctor/patients/patients.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    PatientAppointmentsComponent,
    DoctorsListComponent,
    MedicalCardComponent,
    FamilyDoctorComponent,
    DoctorAppointmentsComponent,
    PatientCardComponent,
    PatientsListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
