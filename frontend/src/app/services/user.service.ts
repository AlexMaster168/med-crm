import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Reuse the appointments endpoint so the list always reflects bookable doctors. */
  getDoctors(specialization?: string): Observable<User[]> {
    let params = new HttpParams();
    if (specialization) params = params.set('specialization', specialization);
    return this.http.get<User[]>(`${this.base}/appointments/doctors`, { params });
  }

  getMyPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/appointments/patients`);
  }
}
