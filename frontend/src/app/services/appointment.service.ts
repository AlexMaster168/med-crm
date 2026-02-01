import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {User} from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private apiUrl = `http://localhost:3000/appointments`;

    constructor(private http: HttpClient) {
    }

    getPatientAppointments(): Observable<any> {
        return this.http.get(`${this.apiUrl}/my`);
    }

    getDoctorAppointments(): Observable<any> {
        return this.http.get(`${this.apiUrl}/doctor`);
    }

    getMyPatients(): Observable<any> {
        return this.http.get(`${this.apiUrl}/patients`);
    }

    getAvailableSlots(doctorId: string, date: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/slots`, {params: {doctorId, date}});
    }

    getAvailableDoctors(specialization?: string): Observable<User[]> {
        let params = new HttpParams();
        if (specialization) {
            params = params.set('specialization', specialization);
        }
        return this.http.get<User[]>(`${this.apiUrl}/doctors`, {params});
    }

    createAppointment(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    updateAppointment(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }

    cancelAppointment(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}