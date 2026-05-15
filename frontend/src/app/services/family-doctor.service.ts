import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FamilyDoctorService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/family-doctors`;

  assign(doctorId: string): Observable<unknown> {
    return this.http.post(this.api, { doctorId });
  }

  getMyDoctor(): Observable<User | null> {
    return this.http.get<User | null>(`${this.api}/my`);
  }

  getMyPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/patients`);
  }

  terminate(): Observable<unknown> {
    return this.http.delete(this.api);
  }
}
