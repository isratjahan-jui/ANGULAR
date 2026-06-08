import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Booking } from '../../../model/booking.model';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';

@Component({
  selector: 'app-owner-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, OwnerLayoutComponent],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {
  ownerName: string = '';
  bookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

 
loadBookings(): void {
  const user = this.auth.getLoggedUser();

  if (user) {
    this.ownerName = user.name;

    this.bookingService.getBookingsByOwner(user.id!).subscribe({
      next: (b) => {
        this.bookings = b.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() -
            new Date(a.createdAt!).getTime()
        );

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error loading bookings', err);
      }
    });
  }
}



  cancelBooking(id: string | undefined) {
    if (!id) return;
    const reason = prompt('Cancellation reason (Owner):');
    if (reason !== null) {
      this.bookingService.cancelBooking(id, reason).subscribe(() => this.loadBookings());
    }
  }

  markCheckIn(id: string | undefined) {
    if (id) {
      this.bookingService.checkIn(id).subscribe(() => {
        alert('Guest checked in successfully.');
        this.loadBookings();
      });
    }
  }

  markCheckOut(id: string | undefined) {
    if (id) {
      const extra = prompt('Extra charges (optional, e.g., Food:500):');
      const charges = extra ? [{ item: extra.split(':')[0], amount: Number(extra.split(':')[1]) }] : [];
      this.bookingService.checkOut(id, charges).subscribe(() => {
        alert('Guest checked out. Billing finalized.');
        this.loadBookings();
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
