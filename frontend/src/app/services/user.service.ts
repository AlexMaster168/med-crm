import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User, DoctorSpecialization} from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/profile`);
    }

    getDoctors(specialty?: DoctorSpecialization): Observable<User[]> {
        const url = specialty
            ? `${this.apiUrl}/doctors?specialty=${specialty}`
            : `${this.apiUrl}/doctors`;
        return this.http.get<User[]>(url);
    }

    getDoctorById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/doctors/${id}`);
    }

    getMyPatients(): Observable<any> {
        return this.http.get(`${this.apiUrl}/appointments/patients`);
    }

    assignFamilyDoctor(doctorId: string): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/assign-family-doctor`, {doctorId});
    }
}
