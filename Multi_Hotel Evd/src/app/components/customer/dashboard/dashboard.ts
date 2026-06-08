import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Booking } from '../../../model/booking.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerLayoutComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CustomerDashboard implements OnInit {
  user: any;
  bookings: Booking[] = [];

  upcomingBookings = 0;
  totalSpent = 0;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getLoggedUser();
    if (this.user) {
      this.loadData();
      
    }
  }

  loadData(): void {
    this.bookingService.getBookingsByUser(this.user.id).subscribe(b => {
      this.bookings = b;
      this.upcomingBookings = b.filter(x => new Date(x.checkIn) >= new Date()).length;
      this.totalSpent = b.reduce((s, x) => s + x.totalPrice, 0);
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
