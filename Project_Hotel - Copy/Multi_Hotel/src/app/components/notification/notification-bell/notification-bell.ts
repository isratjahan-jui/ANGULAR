import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Notification } from '../../../model/notification.model';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  private pollSub?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.getLoggedUser();
    if (user?.id) {
      // Poll notifications every 15 seconds
      this.pollSub = interval(15000).pipe(
        startWith(0),
        switchMap(() => this.notificationService.getNotifications(String(user.id)))
      ).subscribe({
        next: (notes) => {
          this.notifications = notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.unreadCount = this.notifications.filter(n => !n.read).length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading notifications', err)
      });
    }
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.id && !notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = this.notifications.filter(n => !n.read).length;
          this.cdr.detectChanges();
        }
      });
    }
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter(n => !n.read);
    unread.forEach(n => {
      if (n.id) {
        this.notificationService.markAsRead(n.id).subscribe({
          next: () => {
            n.read = true;
            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    this.showDropdown = false;
  }
}
