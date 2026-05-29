import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DoctorSchedule, UpdateSchedulePayload } from '../models/doctor-schedule.model';

@Injectable({ providedIn: 'root' })
export class DoctorScheduleService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/doctor-schedules`;

  getMySchedule(): Observable<DoctorSchedule> {
    return this.http.get<DoctorSchedule>(`${this.api}/me`);
  }

  updateMySchedule(payload: UpdateSchedulePayload): Observable<DoctorSchedule> {
    return this.http.put<DoctorSchedule>(`${this.api}/me`, payload);
  }
}
