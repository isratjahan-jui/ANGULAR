import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
import { Booking } from '../../../model/booking.model';
import { Invoice } from '../../../model/transaction.model';

import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, CustomerLayoutComponent],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
})
export class MyBookings implements OnInit {
  bookings: Booking[] = [];
  selectedInvoice: Invoice | null = null;
  showInvoiceModal = false;

  window = window;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const user = this.auth.getLoggedUser();
    if (user) {
      this.bookingService.getBookingsByUser(user.id!).subscribe(b => {
        this.bookings = b.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        this.cdr.detectChanges();
      });
    }
  }

  cancelBooking(id: string | undefined) {
    if (!id) return;
    const reason = prompt('Please enter a reason for cancellation:');
    if (reason !== null) {
      this.bookingService.cancelBooking(id, reason).subscribe(() => {
        alert('Booking cancelled successfully.');
        this.loadBookings();
      });
    }
  }

  viewInvoice(bookingId: string | undefined) {
    if (!bookingId) return;
    this.paymentService.getInvoiceByBookingId(bookingId).subscribe(invoices => {
      if (invoices.length > 0) {
        this.selectedInvoice = invoices[0];
        this.showInvoiceModal = true;
        this.cdr.detectChanges();
      } else {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking && booking.status !== 'cancelled') {
          if (confirm('Invoice not found. Would you like to generate it now?')) {
            this.generateMissingInvoice(booking);
          }
        } else {
          alert('Invoice not found for this booking.');
        }
      }
    });
  }

  generateMissingInvoice(booking: Booking) {
    const mockTxn = {
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    
    const user = this.auth.getLoggedUser();
    const bookingWithUser = { ...booking, userName: user?.name };

    this.paymentService.generateInvoice(bookingWithUser, mockTxn as any).subscribe({
      next: (inv) => {
        alert('Invoice generated successfully!');
        this.selectedInvoice = inv;
        this.showInvoiceModal = true;
        this.cdr.detectChanges();
      },
      error: () => alert('Failed to generate invoice.')
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
