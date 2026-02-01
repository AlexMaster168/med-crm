import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FamilyDoctorService {
  constructor(private http: HttpClient) {}

  createContract(doctorId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/family-doctors`, { doctorId });
  }

  getMyDoctor(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/family-doctors/my`);
  }

  getMyPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/family-doctors/patients`);
  }

  terminateContract(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/family-doctors`);
  }
}