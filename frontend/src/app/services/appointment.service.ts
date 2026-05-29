import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Appointment,
  CompleteAppointmentPayload,
  CreateAppointmentRequest,
  TimeSlot,
} from '../models/appointment.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/appointments`;

  getPatientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.api}/my`);
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.api}/doctor`);
  }

  getMyPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/patients`);
  }

  getDoctors(specialization?: string): Observable<User[]> {
    let params = new HttpParams();
    if (specialization) params = params.set('specialization', specialization);
    return this.http.get<User[]>(`${this.api}/doctors`, { params });
  }

  getAvailableSlots(doctorId: string, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.api}/slots`, {
      params: { doctorId, date },
    });
  }

  create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.api, request);
  }

  update(id: string, patch: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/${id}`, patch);
  }

  confirm(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/${id}/confirm`, {});
  }

  reject(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/${id}/reject`, {});
  }

  complete(id: string, record: CompleteAppointmentPayload): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/${id}/complete`, record);
  }

  cancel(id: string): Observable<unknown> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
