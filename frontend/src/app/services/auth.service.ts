import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {User} from '../models/user.model';
import {environment} from '../../environments/environment';

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
    user?: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem('user');
        try {
            if (userJson && userJson !== 'undefined') {
                const user = JSON.parse(userJson);
                this.currentUserSubject.next(user);
            }
        } catch (e) {
            console.error('Error parsing user from storage', e);
            localStorage.removeItem('user');
        }
    }


    isAuthenticated(): boolean {
        const token = localStorage.getItem('accessToken');
        return !!token;
    }


    getUserRole(): string | null {
        const user = this.currentUserSubject.value;
        if (user && user.role) {
            return user.role;
        }

        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                const storedUser = JSON.parse(userJson);
                return storedUser.role || null;
            } catch {
                return null;
            }
        }
        return null;
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
            .pipe(tap(response => this.handleAuth(response)));
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {email, password})
            .pipe(tap(response => this.handleAuth(response)));
    }

    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
            error: () => {
            }
        });
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private handleAuth(response: AuthResponse): void {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        const userAccount = response.user || {
            email: '',
            role: response.role,
            id: '',
            firstName: '',
            lastName: ''
        } as User;

        if (!userAccount.role && response.role) {
            userAccount.role = response.role as any;
        }

        localStorage.setItem('user', JSON.stringify(userAccount));
        this.currentUserSubject.next(userAccount);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
    }
}