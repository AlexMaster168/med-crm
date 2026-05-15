import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User, UserRole } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role?: UserRole;
  user?: User;
}

const KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
  user: 'user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly _accessToken = signal<string | null>(this.read(KEYS.access));
  private readonly _user = signal<User | null>(this.readUser());

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoggedIn = computed(() => this._accessToken() !== null);
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  isAuthenticated(): boolean {
    return this._accessToken() !== null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(data: Record<string, unknown>): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, data)
      .pipe(tap((res) => this.persist(res)));
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<unknown> {
    return this.http.post(`${this.api}/reset-password`, { token, newPassword });
  }

  logout(): Observable<unknown> {
    const req = this.http.post(`${this.api}/logout`, {});
    this.clearSession();
    return req;
  }

  clearSession(): void {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
    localStorage.removeItem(KEYS.user);
    this._accessToken.set(null);
    this._user.set(null);
  }

  updateUser(partial: Partial<User>): void {
    const current = this._user();
    if (!current) return;
    const next = { ...current, ...partial };
    this._user.set(next);
    localStorage.setItem(KEYS.user, JSON.stringify(next));
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(KEYS.access, res.accessToken);
    if (res.refreshToken) localStorage.setItem(KEYS.refresh, res.refreshToken);

    const user: User =
      res.user ??
      ({
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        role: (res.role ?? UserRole.PATIENT) as UserRole,
      } as User);

    if (!user.role && res.role) user.role = res.role;

    localStorage.setItem(KEYS.user, JSON.stringify(user));
    this._accessToken.set(res.accessToken);
    this._user.set(user);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    const raw = this.read(KEYS.user);
    if (!raw || raw === 'undefined') return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(KEYS.user);
      return null;
    }
  }
}
