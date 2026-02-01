import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Appointment} from '../models/appointment.model';
import {User} from '../models/user.model';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppointmentsService {
    constructor(private http: HttpClient) {
    }

    create(data: any): Observable<Appointment> {
        return this.http.post<Appointment>(`${environment.apiUrl}/appointments`, data);
    }

    getMyAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${environment.apiUrl}/appointments/my`);
    }

    getDoctorAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${environment.apiUrl}/appointments/doctor`);
    }

    getAvailableDoctors(specialization?: string): Observable<User[]> {
        let params = new HttpParams();
        if (specialization) {
            params = params.append('specialization', specialization);
        }

        return this.http.get<User[]>(`${environment.apiUrl}/appointments/doctors`, {params});
    }

    update(id: string, data: any): Observable<Appointment> {
        return this.http.patch<Appointment>(`${environment.apiUrl}/appointments/${id}`, data);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/appointments/${id}`);
    }
}