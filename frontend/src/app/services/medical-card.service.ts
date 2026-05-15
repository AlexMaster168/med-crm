import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateMedicalRecordDto, MedicalCard } from '../models/medical-card.model';

@Injectable({ providedIn: 'root' })
export class MedicalCardService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/medical-cards`;

  getMyCard(): Observable<MedicalCard> {
    return this.http.get<MedicalCard>(`${this.api}/my`);
  }

  getPatientCard(patientId: string): Observable<MedicalCard> {
    return this.http.get<MedicalCard>(`${this.api}/patient/${patientId}`);
  }

  addRecord(record: CreateMedicalRecordDto): Observable<MedicalCard> {
    return this.http.post<MedicalCard>(`${this.api}/record`, record);
  }

  update(data: Partial<MedicalCard>): Observable<MedicalCard> {
    return this.http.patch<MedicalCard>(this.api, data);
  }
}
