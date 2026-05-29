import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notifications`;

  list(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.api);
  }

  unreadCount(): Observable<number> {
    return this.http.get<number>(`${this.api}/unread-count`);
  }

  markRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.api}/${id}/read`, {});
  }

  markAllRead(): Observable<unknown> {
    return this.http.patch(`${this.api}/read-all`, {});
  }
}
