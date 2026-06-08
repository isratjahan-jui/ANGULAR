import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Booking } from '../../../model/booking.model';
import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerLayoutComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  bookings: Booking[] = [];
  today = new Date().toISOString().split('T')[0];
  loading = true;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.auth.getLoggedUser();
    if (!user?.id) {
      this.loading = false;
      return;
    }
    this.bookingService.getBookingsByUser(String(user.id)).subscribe({
      next: (b) => {
        this.bookings = b.filter(
          (x) => x.checkOut === this.today && x.status === 'checkedIn'
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.bookings = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  processCheckout(id: string | undefined): void {
    if (!id) return;
    this.bookingService.checkOut(id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter((b) => b.id !== id);
      },
      error: () => alert('Check-out failed. Please try again.'),
    });
  }
}
