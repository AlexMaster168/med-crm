import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MedicalCard, CreateMedicalRecordDto} from '../models/medical-card.model';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedicalRecordService {
    private apiUrl = `${environment.apiUrl}/medical-cards`;

    constructor(private http: HttpClient) {
    }

    getMyCard(): Observable<MedicalCard> {
        return this.http.get<MedicalCard>(`${this.apiUrl}/my`);
    }

    getPatientCard(patientId: string): Observable<MedicalCard> {
        return this.http.get<MedicalCard>(`${this.apiUrl}/patient/${patientId}`);
    }

    addRecord(request: CreateMedicalRecordDto): Observable<MedicalCard> {
        return this.http.post<MedicalCard>(`${this.apiUrl}/record`, request);
    }

    updateCard(data: any): Observable<MedicalCard> {
        return this.http.patch<MedicalCard>(this.apiUrl, data);
    }
}