import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendNotification(userId: string, title: string, message: string, type: string = 'info'): Observable<Notification> {
    const notification: Omit<Notification, 'id'> = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    return this.http.post<Notification>(`${this.apiUrl}/notifications`, notification);
  }

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications?userId=${userId}`);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/notifications/${id}`, { read: true });
  }
}
