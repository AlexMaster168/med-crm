import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalCard } from '../models/medical-card.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalCardService {
  constructor(private http: HttpClient) {}

  getMyCard(): Observable<MedicalCard> {
    return this.http.get<MedicalCard>(`${environment.apiUrl}/medical-cards/my`);
  }

  getPatientCard(patientId: string): Observable<MedicalCard> {
    return this.http.get<MedicalCard>(`${environment.apiUrl}/medical-cards/patient/${patientId}`);
  }

  addRecord(data: any): Observable<MedicalCard> {
    return this.http.post<MedicalCard>(`${environment.apiUrl}/medical-cards/record`, data);
  }

  update(data: any): Observable<MedicalCard> {
    return this.http.patch<MedicalCard>(`${environment.apiUrl}/medical-cards`, data);
  }
}