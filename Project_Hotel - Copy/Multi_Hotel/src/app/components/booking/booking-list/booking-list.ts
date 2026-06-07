import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
import { Booking } from '../../../model/booking.model';
import { Invoice } from '../../../model/transaction.model';
import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerLayoutComponent],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingList implements OnInit {
  bookings: Booking[] = [];
  selectedInvoice: Invoice | null = null;
  showInvoiceModal = false;
  loading = true;
  invoiceLoading = false;

  window = window;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBookings();
  }

  loadBookings(): void {
    const user = this.auth.getLoggedUser();
    if (!user?.id) {
      this.loading = false;
      return;
    }
    this.bookingService.getBookingsByUser(user.id!).subscribe({
      next: (b) => {
        this.bookings = b.sort(
          (a, c) =>
            new Date(c.createdAt || c.checkIn).getTime() -
            new Date(a.createdAt || a.checkIn).getTime()
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

  getConfirmedCount(): number {
    return this.bookings.filter((b) => b.status === 'confirmed').length;
  }

  getTotalSpent(): number {
    return this.bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  }

  getTotalNights(): number {
    return this.bookings.reduce((sum, b) => sum + (Number(b.nights) || 0), 0);
  }

  cancelBooking(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const reason = prompt('Please enter a reason for cancellation:');
    if (reason === null) return;
    this.bookingService.cancelBooking(id, reason || 'User requested cancellation').subscribe({
      next: () => {
        alert('Booking cancelled successfully.');
        this.loadBookings();
      },
      error: () => alert('Failed to cancel booking.')
    });
  }

  viewInvoice(bookingId: string | undefined): void {
    if (!bookingId) return;
    this.showInvoiceModal = true;
    this.invoiceLoading = true;
    this.selectedInvoice = null;

    this.paymentService.getInvoiceByBookingId(bookingId).subscribe({
      next: (invoices) => {
        this.invoiceLoading = false;
        if (invoices.length > 0) {
          this.selectedInvoice = invoices[0];
          this.cdr.detectChanges();
        } else {
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking && booking.status !== 'cancelled') {
            if (confirm('Invoice not found. Generate it now?')) {
              this.generateMissingInvoice(booking);
            }
          }
        }
      },
      error: () => {
        this.invoiceLoading = false;
        alert('Error checking for invoice.');
      }
    });
  }

  generateMissingInvoice(booking: Booking): void {
    this.invoiceLoading = true;
    const mockTxn = {
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    
    const user = this.auth.getLoggedUser();
    const bookingWithUser = { ...booking, userName: user?.name };

    this.paymentService.generateInvoice(bookingWithUser, mockTxn as any).subscribe({
      next: (inv) => {
        alert('Invoice generated successfully!');
        this.selectedInvoice = inv;
        this.invoiceLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.invoiceLoading = false;
        alert('Failed to generate invoice.');
      }
    });
  }

  printInvoice(): void {
    window.print();
  }

  browseHotels(): void {
    this.router.navigate(['/hotels']);
  }
}